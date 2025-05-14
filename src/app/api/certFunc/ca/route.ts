import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/certificate'

export async function GET() {
  try {
    await connectDB()

    // CA 인증서 찾기
    const caCertificate = await Certificate.findOne({
      cn: 'Forge Crypto Demo CA',
    })

    if (!caCertificate) {
      return NextResponse.json(
        { error: 'CA 인증서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      caCertPem: caCertificate.caCertPem,
    })
  } catch (error: unknown) {
    console.error('CA 인증서 조회 오류:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'CA 인증서 조회 중 오류가 발생했습니다.'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
