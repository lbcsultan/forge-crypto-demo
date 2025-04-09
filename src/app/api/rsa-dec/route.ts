import { NextRequest, NextResponse } from 'next/server'
import { rsaDecrypt } from '@/lib/computeRSA'

export async function POST(request: NextRequest) {
  const { privateKeyPem, ciphertext } = await request.json()
  const recoveredtext = rsaDecrypt(privateKeyPem, ciphertext)
  return NextResponse.json({ recoveredtext: recoveredtext }, { status: 200 })
}
