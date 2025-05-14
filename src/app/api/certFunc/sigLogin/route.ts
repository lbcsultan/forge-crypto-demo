import { rsaVerify } from '@/lib/computeRSA'
import { NextRequest, NextResponse } from 'next/server'
import forge from 'node-forge'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/certificate'

export async function POST(request: NextRequest) {
  try {
    const { email, currentTime, signature } = await request.json()
    const message = JSON.stringify({ email, currentTime })

    await connectDB()
    const cert = await Certificate.findOne({ userEmail: email })

    if (!cert) {
      return NextResponse.json(
        { message: '인증서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const certificatePem = cert.certPem
    const certificate = forge.pki.certificateFromPem(certificatePem)
    const publicKey = certificate.publicKey
    const publicKeyPem = forge.pki.publicKeyToPem(publicKey)
    const result = rsaVerify(publicKeyPem, message, signature)

    return NextResponse.json({ result }, { status: 200 })
  } catch (error: unknown) {
    console.error('서명 검증 오류:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : '서명 검증 중 오류가 발생했습니다.'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
