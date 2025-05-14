// pages/api/save-cert.ts
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/certificate'

export async function POST(request: NextRequest) {
  try {
    const {
      userEmail,
      serial,
      cn,
      country,
      state,
      locality,
      org,
      orgUnit,
      publicKeyPem,
      certPem,
      caCertPem,
      issuedAt,
      expiresAt,
    } = await request.json()

    await connectDB()

    await Certificate.create({
      userEmail,
      serial,
      cn,
      country,
      state,
      locality,
      org,
      orgUnit,
      publicKeyPem,
      certPem,
      caCertPem,
      issuedAt,
      expiresAt,
    })

    return NextResponse.json({ message: '인증서 정보 저장 성공' })
  } catch (error: unknown) {
    console.error('인증서 정보 저장 실패:', error)
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      { message: '인증서 정보 저장 실패', error: errorMessage },
      { status: 500 }
    )
  }
}
