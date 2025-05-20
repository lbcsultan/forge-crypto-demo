'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import forge from 'node-forge'

export default function JWTHPage() {
  const { data: session } = useSession()
  if (!session) redirect('/signIn')
  const username = session?.user?.email

  const [jh, setJh] = useState('')
  const [jr, setJr] = useState('')
  const [hdecoded, setHdecoded] = useState('')
  const [rdecoded, setRdecoded] = useState('')
  const [hresult, setHresult] = useState('')
  const [rresult, setRresult] = useState('')

  const genJwtH = async () => {
    axios.post('/api/jwt/jwth', { username }).then((res) => {
      const jh = res.data.jh
      setJh(jh)
      localStorage.setItem('jh', jh)
      const hdecoded = jwtDecode(jh)
      setHdecoded(JSON.stringify(hdecoded))
    })
  }

  const genJwtR = async () => {
    axios.post('/api/jwt/jwtr', { username }).then((res) => {
      const jr = res.data.jr
      setJr(jr)
      localStorage.setItem('jr', jr)
      const rdecoded = jwtDecode(jr)
      setRdecoded(JSON.stringify(rdecoded))
    })
  }

  const verifyJwt = async () => {
    axios.post('/api/jwt/jwthv', { jh }).then((res) => {
      setHresult(res.data.result)
    })
  }

  const verifyJwtR = async () => {
    try {
      // 1. 서버의 인증서 가져오기
      const serverCertPem = localStorage.getItem('caCert')
      if (!serverCertPem) {
        setRresult('서버 인증서가 없습니다.')
        return
      }

      // 2. 인증서에서 공개키 추출
      const serverCert = forge.pki.certificateFromPem(serverCertPem)
      const publicKey = serverCert.publicKey as forge.pki.rsa.PublicKey

      // 3. JWT 토큰 파싱
      const parts = jr.split('.')
      if (parts.length !== 3) {
        setRresult('유효하지 않은 JWT 토큰입니다.')
        return
      }

      const [header, payload, signature] = parts

      // 4. 서명 검증
      const signatureBytes = forge.util.decode64(signature)
      const headerPayload = `${header}.${payload}`
      const md = forge.md.sha256.create()
      md.update(headerPayload)

      const isValid = publicKey.verify(md.digest().bytes(), signatureBytes)

      setRresult(isValid ? '유효한 토큰' : '유효하지 않은 토큰')
    } catch (error) {
      console.error('JWT-RSA 검증 오류:', error)
      setRresult('검증 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <form className="mx-auto max-w-screen-lg">
        <h1 className="text-3xl mb-4 font-bold">JWT-HMAC & JWT-RSA</h1>

        <p>JWT-HMAC : JWT with HMAC-based signature </p>
        <p>
          HMAC 버전의 토큰은 서버의 마스터키로 HMAC 서명을 하여 발급하는데 해당
          마스터기를 소유한 서버만이 검증 가능합니다
        </p>

        <h2 className="mb-8">Username: {username}</h2>

        <div className="mb-4 p-3 bg-slate-200">
          <h1 className="text-2xl mb-4 font-bold"> JWT-HMAC </h1>
          <button
            className="primary-button w-full"
            type="button"
            onClick={genJwtH}
          >
            Issue JWT-HMAC by server
          </button>

          <label className="mb-3 font-bold">
            JWT-HMAC (HMAC signature with server&apos;s MASTER secret)
          </label>
          <textarea
            className="w-full bg-gray-50 h-32"
            value={jh}
            readOnly
          ></textarea>

          <label className="mb-3 font-bold">
            JWT-HMAC : client decoded, no verification
          </label>
          <textarea
            className="w-full bg-gray-50 h-16"
            value={hdecoded}
            readOnly
          ></textarea>
          <button
            className="primary-button w-full"
            type="button"
            onClick={verifyJwt}
          >
            Verify JWT-HMAC (only by the server)
          </button>
          <label className="mb-3 font-bold">
            Verified by server with server&apos;s MASTER secret
          </label>
          <input
            className="w-full bg-gray-50"
            value={hresult ? 'valid token' : 'invalid'}
            readOnly
          ></input>
        </div>

        <div className="mb-4 p-3 bg-slate-200">
          <h1 className="text-2xl mb-4 font-bold"> JWT-RSA </h1>
          <button
            className="primary-button w-full"
            type="button"
            onClick={genJwtR}
          >
            Issue JWT-RSA by server
          </button>

          <label className="mb-3 font-bold">
            JWT-RSA (RSA signature with server&apos;s private key)
          </label>
          <textarea
            className="w-full bg-gray-50 h-32"
            value={jr}
            readOnly
          ></textarea>

          <label className="mb-3 font-bold">
            JWT-RSA : client decoded, no verification
          </label>
          <textarea
            className="w-full bg-gray-50 h-16"
            value={rdecoded}
            readOnly
          ></textarea>
          <button
            className="primary-button w-full"
            type="button"
            onClick={verifyJwtR}
          >
            Verify JWT-RSA (with server&apos;s public key)
          </button>
          <label className="mb-3 font-bold">
            Verified by client with server&apos;s public key
          </label>
          <input className="w-full bg-gray-50" value={rresult} readOnly></input>
        </div>
      </form>
    </div>
  )
}
