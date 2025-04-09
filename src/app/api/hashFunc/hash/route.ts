import { NextRequest, NextResponse } from 'next/server'
import computeHash from '@/lib/computeHash'

export async function POST(request: NextRequest) {
  const { algorithm, inputText } = await request.json()
  const hashValue = computeHash(algorithm, inputText)
  return NextResponse.json({ hashValue: hashValue }, { status: 200 })
}
