import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

// 사용자 등록 후 서버에 패스워드해시 값을 저장하고 로그인시 입력된 패스워드와 저장된 패스워드해시 값을 비교해야 함. 여기에서는 패스워드해시 값을 클라이언트가 보내주는 것으로 임시 적용함
export async function POST(request: NextRequest) {
  const { password1, hpassword } = await request.json()
  const result = bcrypt.compareSync(password1, hpassword)
  return NextResponse.json({ result: result }, { status: 200 })
}
