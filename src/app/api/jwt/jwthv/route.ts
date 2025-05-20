import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.AUTH_SECRET as jwt.Secret

export async function POST(req: NextRequest) {
  try {
    const { jh } = await req.json()
    jwt.verify(jh, SECRET)
    return NextResponse.json({ result: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ result: false }, { status: 200 })
  }
}
