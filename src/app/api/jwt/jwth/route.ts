import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.AUTH_SECRET as jwt.Secret

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()
    const jh = jwt.sign({ username }, SECRET, { expiresIn: '1d' })
    return NextResponse.json({ jh: jh }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
