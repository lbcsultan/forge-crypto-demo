import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import PrivateKey from '@/models/privateKey'

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || '')

    // 사용자의 개인키 조회
    const existUser = await PrivateKey.findOne({ ownerEmail: email })

    if (existUser) {
      const privateKey = existUser.privatekey
      const message = 'private key is retrieved'
      return NextResponse.json({ privateKey, message }, { status: 200 })
    } else {
      const privateKey = ''
      const message = 'private key cannot be retrieved'
      return NextResponse.json({ privateKey, message }, { status: 200 })
    }
  } catch (error) {
    console.error('Error retrieving private key:', error)
    return NextResponse.json(
      { message: 'Error retrieving private key' },
      { status: 500 }
    )
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect()
  }
}
