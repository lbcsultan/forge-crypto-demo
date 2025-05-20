import jwt from 'jsonwebtoken'
import forge from 'node-forge'
import { NextRequest, NextResponse } from 'next/server'

const caPrivateKeyPem = process.env.CA_PRIVATE_KEY
const caPrivateKey = forge.pki.privateKeyFromPem(caPrivateKeyPem as string)

export async function POST(req: NextRequest) {
  const caPrivateKeyPem1 = forge.pki.privateKeyToPem(caPrivateKey)
  try {
    const { username } = await req.json()
    const jr = jwt.sign({ username }, caPrivateKeyPem1, {
      expiresIn: '1d',
      algorithm: 'RS256',
    })
    return NextResponse.json({ jr: jr }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to generate JWT' },
      { status: 500 }
    )
  }
}
