import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HashPage() {
  return (
    <div className="mx-auto max-w-screen-lg flex flex-col gap-4">
      <h1 className="text-3xl mb-4 font-bold ">해시함수 응용</h1>
      <Link href="/hashFunc/hash">
        <Button> Hash (해시함수) </Button>
      </Link>
      <Link href="/hashFunc/fileHash">
        <Button> File Hash (파일의 해시값 계산) </Button>
      </Link>
      <Link href="/hashFunc/hmac">
        <Button> HMAC (메시지인증코드) </Button>
      </Link>
      <Link href="/hashFunc/pbkdf2">
        <Button> PBKDF2 (패스워드 기반 키생성) </Button>
      </Link>
      <Link href="/hashFunc/passwordHash">
        <Button> Password Hash Salting (패스워드의 안전한 저장) </Button>
      </Link>
    </div>
  )
}
