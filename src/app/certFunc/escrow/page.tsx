'use client'

import { useState } from 'react'
import forge from 'node-forge'
import axios from 'axios'
import { useSession } from 'next-auth/react'
// import { RsaPrivateKey } from 'crypto'

export default function EscrowPage() {
  const { data: session } = useSession()
  const email = session?.user?.email

  // 개인키를 패스워드로 암호화하여 서버에 위탁 저장
  // const [privateKeyPem, setPrivateKeyPem] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  // const [certPem, setCertPem] = useState('')
  // const [caCertPem, setCaCertPem] = useState('')

  const escrowPrivateKey = () => {
    const pkp = localStorage.getItem('privateKeyPem')
    if (!pkp) {
      setMessage('로컬 스토리지에 개인키가 없습니다.')
      return
    }
    const pk = forge.pki.privateKeyFromPem(pkp)
    const encryptedPrivateKeyPem = forge.pki.encryptRsaPrivateKey(pk, password)
    axios
      .post('/api/certFunc/escrow', { email, encryptedPrivateKeyPem })
      .then((res) => {
        setMessage(res.data.message)
      })
      .catch((error) => {
        setMessage(
          `오류 발생: ${error.response?.data?.message || error.message}`
        )
      })
  }

  const recoverPrivateKey = () => {
    if (!password) {
      setMessage('패스워드를 입력해주세요.')
      return
    }
    axios
      .post('/api/certFunc/recover', { email })
      .then((res) => {
        const encryptedPrivateKeyPem = res.data.privateKey
        const privateKey = forge.pki.decryptRsaPrivateKey(
          encryptedPrivateKeyPem,
          password
        )
        const pkp = forge.pki.privateKeyToPem(privateKey)
        // setPrivateKeyPem(pkp)
        localStorage.setItem('privateKeyPem', pkp)
        setMessage(res.data.message)
      })
      .catch((error) => {
        setMessage(
          `오류 발생: ${error.response?.data?.message || error.message}`
        )
      })
  }

  const recoverCert = async () => {
    try {
      const response = await axios.get('/api/certFunc/cert', {
        params: { email: email },
      })
      if (response.data.certPem) {
        localStorage.setItem(`cert_${email}`, response.data.certPem)
        if (response.data.caCertPem) {
          localStorage.setItem('caCert', response.data.caCertPem)
        }
        setMessage('인증서가 복구되었습니다.')
      }
    } catch (error: unknown) {
      console.error('인증서 복구 오류:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : '인증서 복구 중 오류가 발생했습니다.'
      setMessage(errorMessage)
    }
  }

  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="text-3xl font-bold mb-8">
        Escrow Private Key (개인키 위탁/복구)
      </h1>
      <p className="mb-4 text-gray-600">
        개인키와 인증서는 클라이언트에만 저장되므로 서버에 위탁 저장이
        필요합니다.
        <br />
        - 개인키 위탁: 패스워드로 암호화된 PEM을 서버/DB에 저장
        <br />
        - 개인키 복구: 필요시 서버/DB에 저장된 것을 브라우저로 읽어옴
        <br />- 인증서 복구: 서버/DB에 저장된 인증서를 브라우저로 읽어옴
      </p>

      <div className="mb-4">
        <h2 className="mb-2 font-bold">Password</h2>
        <input
          type="password"
          className="w-full p-2 border rounded bg-gray-50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="개인키 암호화/복호화에 사용할 패스워드"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <button className="red-button w-full" onClick={escrowPrivateKey}>
          Save Private Key (개인키 위탁)
        </button>

        <button className="blue-button w-full" onClick={recoverPrivateKey}>
          Recover Private Key (개인키 복구)
        </button>

        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={recoverCert}
        >
          Recover Certificate
        </button>
      </div>

      {message && (
        <div className="p-4 rounded bg-gray-50 border">
          <p className="text-gray-700">{message}</p>
        </div>
      )}
    </div>
  )
}
