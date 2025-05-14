import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import PrivateKey from '@/models/privateKey'

export async function POST(request: Request) {
  const { email, encryptedPrivateKeyPem } = await request.json()

  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || '')

    // 기존 사용자 확인
    const existUser = await PrivateKey.findOne({ ownerEmail: email })

    if (existUser) {
      // 기존 사용자의 개인키 업데이트
      existUser.privatekey = encryptedPrivateKeyPem
      existUser.updatedAt = new Date()
      await existUser.save()
      console.log('PrivateKey is updated!')
    } else {
      // 새로운 사용자의 개인키 저장
      const newPrivateKey = new PrivateKey({
        ownerEmail: email,
        privatekey: encryptedPrivateKeyPem,
      })
      await newPrivateKey.save()
      console.log('New private key is saved!')
    }

    return NextResponse.json(
      { message: 'Private key is saved in escrow mode' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving private key:', error)
    return NextResponse.json(
      { message: 'Error saving private key' },
      { status: 500 }
    )
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect()
  }
}
