import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EncryptPage() {
  return (
    <div className="mx-auto max-w-screen-lg flex flex-col gap-4">
      <h1 className="text-3xl mb-8 font-bold">대칭키암호 응용</h1>

      <Link href="/encryptFunc/encrypt">
        <Button> Encrypt (대칭키 암호화)</Button>
      </Link>

      <Link href="/encryptFunc/encryptPassword">
        <Button> Encrypt with Password (패스워드 기반 암호화)</Button>
      </Link>

      <Link href="/encryptFunc/fileEncrypt">
        <Button> Encrypt File (파일 암호화)</Button>
      </Link>
    </div>
  )
}
