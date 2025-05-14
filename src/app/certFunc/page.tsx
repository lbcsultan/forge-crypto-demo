import Link from 'next/link'

export default function CertFuncPage() {
  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="text-3xl mb-8 font-bold">인증서 응용</h1>

      <div className="px-8 py-4 bg-blue-800 hover:bg-blue-600 text-white rounded-lg mb-4">
        <Link href="/certFunc/cert">Issuing certificate (인증서 발급)</Link>
      </div>
      <div className="px-8 py-4 bg-blue-800 hover:bg-blue-600 text-white rounded-lg mb-4">
        <Link href="/certFunc/escrow">
          Escrow Private Key (개인키 저장 위탁)
        </Link>
      </div>
      <div className="px-8 py-4 bg-blue-800 hover:bg-blue-600 text-white rounded-lg mb-4">
        <Link href="/certFunc/users">All users (등록된 사용자)</Link>
      </div>
      <div className="px-8 py-4 bg-blue-800 hover:bg-blue-600 text-white rounded-lg mb-4">
        <Link href="/certFunc/certUsers">
          Certified users (인증서를 발급받은 사용자)
        </Link>
      </div>
      <div className="px-8 py-4 bg-blue-800 hover:bg-blue-600 text-white rounded-lg mb-4">
        <Link href="/certFunc/sigLogin">
          Login with Signature (전자서명을 이용한 로그인)
        </Link>
      </div>
      <div className="px-8 py-4 bg-blue-800 hover:bg-blue-600 text-white rounded-lg mb-4">
        <Link href="/certFunc/envelope">Digital Envelope (전자봉투)</Link>
      </div>
    </div>
  )
}
