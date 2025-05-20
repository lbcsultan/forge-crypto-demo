import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function JWTPage() {
  return (
    <div className="mx-auto max-w-screen-lg flex flex-col gap-4">
      <h1 className="text-3xl mb-4 font-bold ">JWT (JSON web token)</h1>
      <Link href="/jwtFunc/jwth">
        <Button> JWT-HMAC </Button>
        <br />
        서버의 비밀키로 HMAC 서명한 JWT 토큰입니다. 검증시에도 서버의 비밀키가
        사용되어야 하므로 서버만이 유효성을 검증할 수 있습니다.
      </Link>
      <Link href="/jwtFunc/jwtr">
        <Button> JWT-RSA </Button>
        <br />
        서버의 개인키로 RSA 서명한 JWT 토큰입니다. 클라이언트가 서버의 인증서를
        가지고 있다면 서버의 공개키를 이용하여 클라이언트에서 유효성을 검증할 수
        있습니다.
      </Link>
    </div>
  )
}
