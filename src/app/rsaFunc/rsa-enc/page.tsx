'use client'

import { useState } from 'react'
import forge from 'node-forge'
import { rsaEncrypt } from '@/lib/computeRSA'
import axios from 'axios'
const rsa = forge.pki.rsa
const pki = forge.pki

export default function RSAEncPage() {
  const lengths = [1024, 2048, 3072, 32, 64, 128, 256, 512] as const
  type KeyLength = (typeof lengths)[number]

  const [keyLength, setKeyLength] = useState<KeyLength>(1024)
  const [publicKey, setPublicKey] = useState<forge.pki.rsa.PublicKey | null>()
  const [publicKeyPem, setPublicKeyPem] = useState('')
  const [privateKey, setPrivateKey] =
    useState<forge.pki.rsa.PrivateKey | null>()
  const [privateKeyPem, setPrivateKeyPem] = useState('')

  const [plaintext, setPlaintext] = useState('Hello world - 헬로월드')
  const [ciphertext, setCiphertext] = useState('')
  const [ciphertextHex, setCiphertextHex] = useState('')
  const [recoveredtext, setRecoveredtext] = useState('')

  const keyGen = () => {
    const keypair: forge.pki.rsa.KeyPair = rsa.generateKeyPair({
      bits: keyLength,
      e: 0x10001,
    })
    setPublicKey(keypair.publicKey)
    setPublicKeyPem(pki.publicKeyToPem(keypair.publicKey))
    setPrivateKey(keypair.privateKey)
    setPrivateKeyPem(pki.privateKeyToPem(keypair.privateKey))
  }

  const encryptHandler = () => {
    const bytes = forge.util.encodeUtf8(plaintext)
    if (publicKey) {
      const encrypted = rsaEncrypt(publicKeyPem, bytes)
      setCiphertext(encrypted)
      setCiphertextHex(forge.util.bytesToHex(encrypted))
    }
  }

  const decryptHandler = () => {
    if (privateKey) {
      axios.post('/api/rsa-dec', { privateKeyPem, ciphertext }).then((res) => {
        const decrypted = res.data.recoveredtext
        setRecoveredtext(decrypted)
        setRecoveredtext(forge.util.decodeUtf8(decrypted))
      })
    }
  }

  return (
    <div>
      <div>
        <form className="mx-auto max-w-screen-lg">
          <h1 className="text-3xl mb-4 font-bold">
            RSA Encryption (공개키 암호화)
          </h1>

          <div className="mb-4">
            <label htmlFor="mode" className="mb-3 font-bold">
              Select Key Length (default to 1024)
            </label>
            <div className="mb-2 text-gray-600">
              현재 선택된 키 길이: {keyLength} 비트
            </div>
            {lengths.map((length) => (
              <div key={length} className="mx-4 ">
                <input
                  name="length"
                  className="p-2 outline-none focus:ring-0"
                  type="radio"
                  id={length.toString()}
                  checked={keyLength === length}
                  onChange={() => setKeyLength(length)}
                />
                <label className="p-2" htmlFor={length.toString()}>
                  {length} {length === 1024 && '(기본값)'}
                </label>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <button
              className="primary-button w-full"
              type="button"
              onClick={keyGen}
            >
              RSA key generation (RSA 키 생성)
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="key" className="mb-3 font-bold">
              Public Key (공개키)
            </label>
            <textarea
              name="key"
              id="key"
              className="w-full bg-gray-50 h-32"
              value={publicKeyPem}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label htmlFor="key" className="mb-3 font-bold">
              Private Key (개인키)
            </label>
            <textarea
              name="key"
              id="key"
              className="w-full bg-gray-50 h-64"
              value={privateKeyPem}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label htmlFor="plaintext" className="mb-3 font-bold">
              Plaintext
            </label>
            <textarea
              name="plaintext"
              id="plaintext"
              className="w-full bg-gray-50 h-16"
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
              className="w-full bg-gray-50 h-16"
              value={recoveredtext}
              readOnly
            />
          </div>
        </form>
      </div>
    </div>
  )
}
