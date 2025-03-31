import computeHmac from '@/lib/computeHmac'
import { NextResponse } from 'next/server'

export async function POST(request: any) {
  const { algorithm, inputText, secret } = await request.json()
  const result = computeHmac(algorithm, inputText, secret)
  return NextResponse.json({ hmacValue: result }, { status: 200 })
}
