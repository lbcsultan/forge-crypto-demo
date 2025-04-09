'use client'

import { useState } from 'react'
import forge from 'node-forge'
const ed25519 = forge.pki.ed25519

export default function ECDSAPage() {
  const [publicKey, setPublicKey] = useState<forge.pki.ed25519.NativeBuffer>()
  const [publicKeyPem, setPublicKeyPem] = useState('')
  const [privateKey, setPrivateKey] = useState<forge.pki.ed25519.NativeBuffer>()
  const [privateKeyPem, setPrivateKeyPem] = useState('')

  const [plaintext, setPlaintext] = useState('Hello world - 헬로월드')
  const [signature, setSignature] = useState<forge.pki.ed25519.BinaryBuffer>('')
  const [signatureHex, setSignatureHex] = useState('')
  const [result, setResult] = useState('')

  const keyGen = () => {
    const keypair: {
      publicKey: forge.pki.ed25519.NativeBuffer
      privateKey: forge.pki.ed25519.NativeBuffer
    } = ed25519.generateKeyPair()
    setPublicKey(keypair.publicKey)
    setPublicKeyPem(forge.util.encode64(keypair.publicKey.toString()))
    setPrivateKey(keypair.privateKey)
    setPrivateKeyPem(forge.util.encode64(keypair.privateKey.toString()))
  }

  const signHandler = () => {
    const md = forge.md.sha256.create()
    md.update(plaintext, 'utf8')
    const sig: forge.pki.ed25519.BinaryBuffer = ed25519.sign({
      md: md,
      privateKey: privateKey as forge.pki.ed25519.BinaryBuffer,
    })

    setSignature(sig)
    setSignatureHex(forge.util.encode64(sig.toString()))
  }

  const verifyHandler = () => {
    const md = forge.md.sha256.create()
    md.update(plaintext, 'utf8')
    const verified: boolean = ed25519.verify({
      md: md,
      signature: signature as forge.pki.ed25519.BinaryBuffer,
      publicKey: publicKey as forge.pki.ed25519.BinaryBuffer,
    })
    setResult(verified ? '서명 OK' : '서명 Error')
  }

  return (
    <div>
      <div>
        <form className="mx-auto max-w-screen-lg">
          <h1 className="text-3xl mb-4 font-bold">
            ECDSA Signature (타원곡선 전자서명)
          </h1>

          <div className="mb-4">
            <button
              className="primary-button w-full"
              type="button"
              onClick={keyGen}
            >
              ED25519 key generation (타원곡선 키생성)
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="key" className="mb-3 font-bold">
              Public Key (공개키)
            </label>
            <textarea
              name="key"
              id="key"
              className="w-full bg-gray-50 h-24"
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
              className="w-full bg-gray-50 h-24"
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
              onClick={signHandler}
            >
              Signing (sender, client)
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="ciphertext" className="mb-3 font-bold">
              Signature
            </label>
            <textarea
              name="signature"
              id="signature"
              className="w-full bg-gray-50 h-24"
              value={signatureHex}
              readOnly
            />
          </div>

          <div className="mb-4">
            <button
              className="blue-button w-full"
              type="button"
              onClick={verifyHandler}
            >
              Verification (receiver, server)
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="recoveredtext" className="mb-3 font-bold">
              Result
            </label>
            <input
              type="text"
              name="recoveredtext"
              id="recoveredtext"
              className="w-full bg-gray-50"
              value={result}
              readOnly
            />
          </div>
        </form>
      </div>
    </div>
  )
}
