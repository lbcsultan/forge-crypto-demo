import computeHmac from '@/lib/computeHmac'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { algorithm, inputText, secret } = await request.json()
  const result = computeHmac(algorithm, inputText, secret)
  return NextResponse.json({ hmacValue: result }, { status: 200 })
}
