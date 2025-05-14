'use client'

import { rsaSign } from '@/lib/computeRSA'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import forge from 'node-forge'
import { useState } from 'react'

export default function SigLoginPage() {
  const { data: session } = useSession()
  const email = session?.user?.email

  const [signaturePem, setSignaturePem] = useState('')
  const [verified, setVerified] = useState('')

  const sigLogin = async () => {
    const privateKeyPem = localStorage.getItem('privateKeyPem')

    const currentTime = new Date().getTime()
    const message = JSON.stringify({ email, currentTime })
    const signature = rsaSign(privateKeyPem as string, message)
    setSignaturePem(forge.util.bytesToHex(signature))

    axios
      .post('/api/certFunc/sigLogin', { email, currentTime, signature })
      .then((res) => {
        if (res.data.result === true) {
          setVerified('로그인 허용')
        } else {
          setVerified('로그인 불허')
        }
      })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Login with signature (전자서명 로그인)
      </h1>
      <p>
        사용자가 서버로부터 인증서를 발급받은 경우에 브라우저에 저장된 개인키를
        이용하여 로그인 메시지를 전자서명해서 전송하면 서버는 해당 사용자의
        인증서를 이용하여 로그인 메시지를 검증하고 로그인 허용합니다.
      </p>

      <button
        className="text-2xl bg-yellow-400 px-4 py-2 rounded-md mt-8 mb-8"
        onClick={sigLogin}
      >
        {email}로 전자서명 로그인
      </button>

      <p className="break-words overflow-x-auto mb-4">
        <span className="font-bold">Signature:</span> {signaturePem}
      </p>

      <p>
        <span className="font-bold">결과:</span> {verified}
      </p>
    </div>
  )
}
