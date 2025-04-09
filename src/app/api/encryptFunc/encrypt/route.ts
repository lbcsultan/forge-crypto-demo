import { computeDecrypt } from '@/lib/computeAES'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { mode, key, iv, ciphertext } = await request.json()
  const recoveredtext = computeDecrypt(ciphertext, mode, key, iv)
  return NextResponse.json({ recoveredtext: recoveredtext }, { status: 200 })
}
