'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import forge from 'node-forge'
import axios from 'axios'

interface Envelope {
  id: string
  sender: string
  receiver: string
  message: string
  signature: string
  iv: string
  createdAt: Date
  encryptedSessionKey: string
  encryptedMessage: string
}

// node-forge 타입 확장
type RSA_PublicKey = forge.pki.rsa.PublicKey & {
  encrypt(data: string | forge.util.ByteStringBuffer, scheme?: string): string
  verify(
    digest: string | forge.util.ByteStringBuffer,
    signature: string | forge.util.ByteStringBuffer
  ): boolean
}

export default function EnvelopePage() {
  const { data: session } = useSession()
  if (!session || !session.user) redirect('/signIn')

  const sender = session.user.email || null
  const [receiver, setReceiver] = useState('')
  const [plaintext, setPlaintext] = useState(
    'Hello world - 헬로월드 - 全国の新たな感染者 - 备孕者可以接种新冠疫苗'
  )
  const [ciphertextHex, setCiphertextHex] = useState('')
  const [recoveredtext, setRecoveredtext] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const formatJSON = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString)
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      console.log(e)
      return jsonString
    }
  }

  const recoverCert = async () => {
    try {
      const response = await axios.get(`/api/certFunc/cert?email=${receiver}`)
      if (response.data.certPem) {
        // 사용자 인증서 저장
        localStorage.setItem(`cert_${receiver}`, response.data.certPem)

        // CA 인증서 저장
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

  const selectReceiver = async () => {
    try {
      const response = await axios.get(`/api/certFunc/cert?email=${receiver}`)
      if (response.data.certPem) {
        // 인증서를 로컬스토리지에 저장
        await recoverCert()
        setMessage('수신자 인증서를 찾았습니다.')
      }
    } catch (error: unknown) {
      console.error('수신자 인증서 조회 오류:', error)
      setMessage('수신자 인증서를 찾을 수 없습니다.')
    }
  }

  const genEnvHandler = async () => {
    try {
      if (!sender || !receiver) {
        setMessage('송신자와 수신자 이메일이 필요합니다.')
        return
      }

      // 1. 송신자의 개인키 가져오기
      let privateKeyPem: string | null = null
      try {
        privateKeyPem = localStorage.getItem('privateKeyPem')
      } catch (error) {
        console.error('localStorage 접근 오류:', error)
        setError('개인키를 가져오는 중 오류가 발생했습니다.')
        return
      }

      if (!privateKeyPem) {
        setError('송신자의 개인키가 없습니다.')
        return
      }

      // 2. 수신자의 인증서 가져오기
      let receiverCertPem: string
      try {
        const response = await axios.get(`/api/certFunc/cert?email=${receiver}`)
        receiverCertPem = response.data.certPem
        if (!receiverCertPem) {
          setMessage('수신자의 인증서를 찾을 수 없습니다.')
          return
        }
      } catch (error) {
        console.error('인증서 가져오기 오류:', error)
        setError('수신자의 인증서를 가져오는 중 오류가 발생했습니다.')
        return
      }

      // 3. 세션키 생성
      const sessionKey = forge.random.getBytesSync(32)
      const iv = forge.random.getBytesSync(16)

      // 4. 메시지 서명
      let signature: string
      try {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
        const md = forge.md.sha256.create()
        md.update(plaintext)
        signature = forge.util.encode64(privateKey.sign(md))
      } catch (error) {
        console.error('서명 생성 오류:', error)
        setError('메시지 서명 생성 중 오류가 발생했습니다.')
        return
      }

      // 5. 메시지 암호화
      let encryptedMessage: string
      try {
        const cipher = forge.cipher.createCipher('AES-CBC', sessionKey)
        cipher.start({ iv })
        // UTF-8로 인코딩된 바이너리 데이터로 변환
        const messageBuffer = forge.util.encodeUtf8(plaintext)
        cipher.update(forge.util.createBuffer(messageBuffer))
        cipher.finish()
        encryptedMessage = cipher.output.toHex()
      } catch (error) {
        console.error('메시지 암호화 오류:', error)
        setError('메시지 암호화 중 오류가 발생했습니다.')
        return
      }

      // 6. 세션키 암호화
      let encryptedSessionKey: string
      try {
        const receiverCert = forge.pki.certificateFromPem(receiverCertPem)
        const rsaPublicKey = receiverCert.publicKey as RSA_PublicKey
        encryptedSessionKey = forge.util.encode64(
          rsaPublicKey.encrypt(sessionKey, 'RSA-OAEP')
        )
      } catch (error) {
        console.error('세션키 암호화 오류:', error)
        setError('세션키 암호화 중 오류가 발생했습니다.')
        return
      }

      // 7. 전자봉투 생성
      const envelope: Envelope = {
        id: '',
        sender,
        receiver,
        message: encryptedMessage,
        signature,
        iv: forge.util.encode64(iv),
        createdAt: new Date(),
        encryptedSessionKey,
        encryptedMessage,
      }

      setCiphertextHex(JSON.stringify(envelope))
      setMessage('전자봉투가 생성되었습니다.')
    } catch (error: unknown) {
      console.error('전자봉투 생성 오류:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : '전자봉투 생성 중 오류가 발생했습니다.'
      setError(errorMessage)
    }
  }

  const openEnvHandler = async () => {
    try {
      if (!receiver) {
        setMessage('수신자 이메일이 필요합니다.')
        return
      }

      // 1. 수신자의 개인키 가져오기
      let privateKeyPem: string | null = null
      try {
        privateKeyPem = localStorage.getItem('privateKeyPem')
      } catch (error) {
        console.error('localStorage 접근 오류:', error)
        setError('개인키를 가져오는 중 오류가 발생했습니다.')
        return
      }

      if (!privateKeyPem) {
        setError('수신자의 개인키가 없습니다.')
        return
      }

      // 2. 송신자의 인증서 가져오기
      let senderCertPem: string
      try {
        const response = await axios.get(`/api/certFunc/cert?email=${sender}`)
        senderCertPem = response.data.certPem
        if (!senderCertPem) {
          setMessage('송신자의 인증서를 찾을 수 없습니다.')
          return
        }
      } catch (error) {
        console.error('인증서 가져오기 오류:', error)
        setError('송신자의 인증서를 가져오는 중 오류가 발생했습니다.')
        return
      }

      // 3. 전자봉투 파싱
      let envelope: Envelope
      try {
        envelope = JSON.parse(ciphertextHex)
      } catch (error) {
        console.error('전자봉투 파싱 오류:', error)
        setError('전자봉투 형식이 올바르지 않습니다.')
        return
      }

      // 4. 세션키 복호화
      let sessionKey: string
      try {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
        const encryptedSessionKeyBuffer = forge.util.decode64(
          envelope.encryptedSessionKey
        )
        sessionKey = privateKey.decrypt(encryptedSessionKeyBuffer, 'RSA-OAEP')
      } catch (error) {
        console.error('세션키 복호화 오류:', error)
        setError('세션키 복호화에 실패했습니다.')
        return
      }

      // 5. 메시지 복호화
      let decryptedMessage: string
      try {
        const decipher = forge.cipher.createDecipher('AES-CBC', sessionKey)
        const ivBuffer = forge.util.decode64(envelope.iv)
        const encryptedMessageBuffer = forge.util.hexToBytes(
          envelope.encryptedMessage
        )

        decipher.start({ iv: forge.util.createBuffer(ivBuffer) })
        decipher.update(forge.util.createBuffer(encryptedMessageBuffer))
        decipher.finish()

        // 복호화된 바이너리 데이터를 UTF-8 문자열로 변환
        const decryptedBytes = decipher.output.getBytes()
        decryptedMessage = forge.util.decodeUtf8(decryptedBytes)
      } catch (error) {
        console.error('메시지 복호화 오류:', error)
        setError('메시지 복호화에 실패했습니다.')
        return
      }

      // 6. 서명 검증
      let isValid: boolean
      try {
        const senderCert = forge.pki.certificateFromPem(senderCertPem)
        const rsaPublicKey = senderCert.publicKey as RSA_PublicKey
        const md = forge.md.sha256.create()
        // 원본 메시지로 서명 검증
        md.update(decryptedMessage)
        const signatureBytes = forge.util.decode64(envelope.signature)
        isValid = rsaPublicKey.verify(md.digest().bytes(), signatureBytes)
      } catch (error) {
        console.error('서명 검증 오류:', error)
        setError('서명 검증에 실패했습니다.')
        return
      }

      if (isValid) {
        setRecoveredtext(decryptedMessage)
        setMessage('전자봉투가 성공적으로 열렸습니다.')
      } else {
        setError('서명이 유효하지 않습니다.')
      }
    } catch (error: unknown) {
      console.error('전자봉투 열기 오류:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : '전자봉투 열기 중 오류가 발생했습니다.'
      setError(errorMessage)
    }
  }

  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="text-3xl font-bold mb-8">Digital Envelope (전자봉투)</h1>
      <div className="mb-4 text-gray-600">
        <p>
          전자봉투란 송신자가 서명하고 세션키로 암호화한 메시지를 특정
          수신자에게 보내는 방법입니다. 수신자는 자신의 개인키로 메시지를
          복호화할 수 있고 송신자의 공개키로 서명을 검증할 수 있습니다.
        </p>
        <p className="mt-4">
          송신자: <br />
          1. 송신자 개인키로 서명 생성 <br />
          2. 세션키로 메시지 암호화 <br />
          3. 수신자 공개키로 세션키 암호화 <br />
        </p>
        <p className="mt-4">
          수신자: <br />
          1. 수신자 개인키로 세션키 복호화 <br />
          2. 세션키로 메시지 복호화 <br />
          3. 송신자 공개키로 서명 검증 <br />
        </p>
      </div>

      {message && (
        <div className="p-4 rounded bg-gray-50 border mb-4">
          <p className="text-gray-700">{message}</p>
        </div>
      )}

      <div className="mb-4 space-y-4">
        <div>
          <label htmlFor="sender" className="block mb-2 font-medium">
            송신자
          </label>
          <input
            type="text"
            id="sender"
            value={sender as string}
            className="w-full p-2 border rounded bg-gray-50"
            disabled
          />
        </div>
        <div>
          <label htmlFor="receiver" className="block mb-2 font-medium">
            수신자
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="flex-1 p-2 border rounded bg-gray-50"
              placeholder="수신자 이메일 입력"
            />
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={selectReceiver}
            >
              확인
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="plaintext" className="block mb-2 font-medium">
          Plaintext
        </label>
        <textarea
          id="plaintext"
          className="w-full p-2 border rounded bg-gray-50 h-32"
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <button
          className="red-button w-full"
          type="button"
          onClick={genEnvHandler}
        >
          Envelope 생성 (sender)
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="ciphertext" className="block mb-2 font-medium">
          Envelope
        </label>
        <pre className="w-full p-2 border rounded bg-gray-50 h-64 overflow-auto whitespace-pre-wrap">
          {formatJSON(ciphertextHex)}
        </pre>
      </div>

      <div className="mb-4">
        <button
          className="blue-button w-full"
          type="button"
          onClick={openEnvHandler}
        >
          Envelope 열기 (receiver)
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="recoveredtext" className="block mb-2 font-medium">
          Recoveredtext
        </label>
        <textarea
          id="recoveredtext"
          className="w-full p-2 border rounded bg-gray-50 h-32"
          value={recoveredtext}
          readOnly
        />
      </div>

      {message && (
        <div className="p-4 rounded bg-gray-50 border mb-4">
          <p className="text-gray-700">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded bg-gray-50 border">
          <p className="text-gray-700">{error}</p>
        </div>
      )}
    </div>
  )
}
