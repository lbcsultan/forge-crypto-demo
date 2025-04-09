import { NextRequest, NextResponse } from 'next/server'
import computeHash from '@/lib/computeHash'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일이 전송되지 않았습니다.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512']

    const results = algorithms.reduce((acc, algorithm) => {
      acc[algorithm] = computeHash(algorithm, arrayBuffer)
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(results)
  } catch (error) {
    console.error('해시 계산 중 에러 발생:', error)
    return NextResponse.json(
      { error: '해시 계산 중 에러가 발생했습니다.' },
      { status: 500 }
    )
  }
}
