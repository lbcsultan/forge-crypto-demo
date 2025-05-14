import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/certificate'
import User from '@/models/user'
import forge from 'node-forge'

async function generateKeyPair() {
  return new Promise<{ privateKey: string; publicKey: string }>(
    (resolve, reject) => {
      try {
        const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 })
        const privateKey = forge.pki.privateKeyToPem(keys.privateKey)
        const publicKey = forge.pki.publicKeyToPem(keys.publicKey)
        resolve({ privateKey, publicKey })
      } catch (error) {
        reject(error)
      }
    }
  )
}

async function generateCertificate(
  email: string,
  name: string,
  publicKey: string,
  privateKey: string
) {
  return new Promise<string>((resolve, reject) => {
    try {
      const cert = forge.pki.createCertificate()
      cert.publicKey = forge.pki.publicKeyFromPem(publicKey)
      cert.serialNumber = '01'
      cert.validity.notBefore = new Date()
      cert.validity.notAfter = new Date()
      cert.validity.notAfter.setFullYear(
        cert.validity.notBefore.getFullYear() + 1
      )
      cert.setSubject([
        {
          name: 'commonName',
          value: name,
        },
        {
          name: 'emailAddress',
          value: email,
        },
      ])
      cert.setIssuer([
        {
          name: 'commonName',
          value: 'Forge Crypto Demo CA',
        },
      ])
      cert.sign(forge.pki.privateKeyFromPem(privateKey))
      resolve(forge.pki.certificateToPem(cert))
    } catch (error) {
      reject(error)
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      )
    }

    await connectDB()

    const certificate = await Certificate.findOne({ userEmail: email })
    if (!certificate) {
      return NextResponse.json(
        { error: '인증서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      certPem: certificate.certPem,
      publicKeyPem: certificate.publicKeyPem,
    })
  } catch (error: unknown) {
    console.error('인증서 조회 오류:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : '인증서 조회 중 오류가 발생했습니다.'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: '이메일, 이름, 비밀번호가 필요합니다.' },
        { status: 400 }
      )
    }

    await connectDB()

    // 1. 사용자 생성
    await User.create({
      email,
      name,
      password: forge.util.encode64(
        forge.md.sha256.create().update(password).digest().bytes()
      ),
    })

    // 2. 키쌍 생성
    const { privateKey, publicKey } = await generateKeyPair()

    // 3. 인증서 생성
    const certPem = await generateCertificate(
      email,
      name,
      publicKey,
      privateKey
    )

    // 4. 인증서 저장
    await Certificate.create({
      userEmail: email,
      certPem,
      publicKeyPem: publicKey,
      privateKeyPem: privateKey,
    })

    return NextResponse.json({
      message: '인증서가 생성되었습니다.',
      certPem,
      publicKeyPem: publicKey,
      privateKeyPem: privateKey,
    })
  } catch (error: unknown) {
    console.error('인증서 생성 오류:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : '인증서 생성 중 오류가 발생했습니다.'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
