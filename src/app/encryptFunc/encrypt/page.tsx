'use client'

import { useState } from 'react'
import forge from 'node-forge'
import Image from 'next/image'
import axios from 'axios'
import { computeEncrypt } from '@/lib/computeAES'

type AESMode = 'ECB' | 'CBC'

export default function EncryptPage() {
  const modes = ['ECB', 'CBC'] as const
  const lengths = [128, 192, 256] as const

  const [mode, setMode] = useState<AESMode>('CBC')
  const [keyLength, setKeyLength] = useState<(typeof lengths)[number]>(128)
  const [key, setKey] = useState('')
  const [keyHex, setKeyHex] = useState('')
  const [iv, setIv] = useState('')
  const [ivHex, setIvHex] = useState('')
  const [plaintext, setPlaintext] = useState(
    'Hello world - 헬로월드 - 全国の新たな感染者 - 备孕者可以接种新冠疫苗'
  )
  const [ciphertext, setCiphertext] =
    useState<forge.util.ByteStringBuffer | null>(null)
  const [ciphertextHex, setCiphertextHex] = useState('')
  const [recoveredtext, setRecoveredtext] = useState('')

  const randomKey = () => {
    const key = forge.random.getBytesSync(keyLength / 8)
    const keyHex = forge.util.bytesToHex(key)
    let iv, ivHex
    setKey(key)
    setKeyHex(keyHex)
    if (mode === 'ECB') {
      iv = ''
      ivHex = ''
      setIv(iv)
      setIvHex(ivHex)
    } else if (mode === 'CBC') {
      iv = forge.random.getBytesSync(16)
      ivHex = forge.util.bytesToHex(iv)
      setIv(iv)
      setIvHex(ivHex)
    }
  }

  const encryptHandler = () => {
    const ciphertext1 = computeEncrypt(
      plaintext,
      mode,
      key,
      iv
    ) as forge.util.ByteStringBuffer
    setCiphertext(ciphertext1)
    setCiphertextHex(ciphertext1.toHex())
  }

  const decryptHandler = async () => {
    try {
      const response = await axios.post('/api/encryptFunc/encrypt', {
        mode,
        key,
        iv,
        ciphertext,
      })
      setRecoveredtext(response.data.recoveredtext)
    } catch (error) {
      console.error('Decryption failed:', error)
    }
  }

  return (
    <div>
      <form className="mx-auto max-w-screen-lg">
        <h1 className="text-3xl mb-4 font-bold">AES (대칭키 암호화)</h1>

        <div className="mb-4">
          <p>
            대칭키 암호는 암호화 알고리즘과 복호화 알고리즘에서 동일한 키를
            사용하는 알고리즘이다. 송신자는 일반적으로 난수생성함수를 이용하여
            임의로 생성한 키를 사용하여 암호화하며 송신자는 이 키를 수신자에게
            안전하게 전달해야 한다.
          </p>
          <div className="mx-auto px-20">
            <Image
              src="/symmetric.jpg"
              alt="AES"
              width={500}
              height={500}
              className="object-cover"
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">Select Mode (default to CBC)</h2>
          {modes.map((m) => (
            <div key={m} className="mx-4">
              <input
                name="mode"
                className="p-2 outline-none focus:ring-0"
                id={m}
                type="radio"
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              <label className="p-2" htmlFor={m}>
                {m}
              </label>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">Select Key Length (default to 128)</h2>
          {lengths.map((length) => (
            <div key={length} className="mx-4">
              <input
                name="length"
                className="p-2 outline-none focus:ring-0"
                id={length.toString()}
                type="radio"
                checked={keyLength === length}
                onChange={() => setKeyLength(length)}
              />
              <label className="p-2" htmlFor={length.toString()}>
                {length}
              </label>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">AES key</h2>
          <input
            type="text"
            name="key"
            className="w-full bg-gray-50"
            value={keyHex}
            readOnly
          />
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">AES iv (default 128)</h2>
          <input
            type="text"
            name="iv"
            className="w-full bg-gray-50"
            value={ivHex}
            readOnly
          />
        </div>

        <div className="mb-4">
          <button
            className="primary-button w-full"
            type="button"
            onClick={randomKey}
          >
            Random key generation (sender, client)
          </button>
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">Plaintext</h2>
          <textarea
            name="plaintext"
            className="w-full bg-gray-50 h-32"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <button
            className="red-button w-full"
            type="button"
            onClick={encryptHandler}
          >
            Encrypt (sender, client)
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="ciphertext" className="mb-3 font-bold">
            Ciphertext
          </label>
          <textarea
            name="ciphertext"
            id="ciphertext"
            className="w-full bg-gray-50 h-32"
            value={ciphertextHex}
            readOnly
          />
        </div>

        <div className="mb-4">
          <button
            className="blue-button w-full"
            type="button"
            onClick={decryptHandler}
          >
            Decrypt (receiver, server)
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="recoveredtext" className="mb-3 font-bold">
            Recoveredtext
          </label>
          <textarea
            name="recoveredtext"
            id="recoveredtext"
            className="w-full bg-gray-50 h-32"
            value={recoveredtext}
            readOnly
          />
        </div>
      </form>
    </div>
  )
}
