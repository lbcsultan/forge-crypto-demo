'use client'

import { useState } from 'react'
import forge from 'node-forge'
import Image from 'next/image'
const rsa = forge.pki.rsa
const pki = forge.pki

export default function RSAKeyGenPage() {
  const lengths = [1024, 2048, 3072, 16, 20, 32, 64, 128, 256, 512] as const
  type KeyLength = (typeof lengths)[number]

  const [keyLength, setKeyLength] = useState<KeyLength>(1024)
  const [publicKeyPem, setPublicKeyPem] = useState('')
  const [privateKeyPem, setPrivateKeyPem] = useState('')
  const [n, setN] = useState<forge.jsbn.BigInteger | null | undefined>()
  const [p, setP] = useState<forge.jsbn.BigInteger | null | undefined>()
  const [q, setQ] = useState<forge.jsbn.BigInteger | null | undefined>()
  const [e, setE] = useState<forge.jsbn.BigInteger | null | undefined>()
  const [d, setD] = useState<forge.jsbn.BigInteger | null | undefined>()

  const keyGen = () => {
    const keypair: forge.pki.rsa.KeyPair = rsa.generateKeyPair({
      bits: keyLength,
    })
    setPublicKeyPem(pki.publicKeyToPem(keypair.publicKey))
    setPrivateKeyPem(pki.privateKeyToPem(keypair.privateKey))
    setN(keypair.publicKey.n)
    setE(keypair.publicKey.e)
    setP(keypair.privateKey.p)
    setQ(keypair.privateKey.q)
    setD(keypair.privateKey.d)
  }

  return (
    <div>
      <div>
        <form className="mx-auto max-w-screen-lg">
          <h1 className="text-3xl mb-4 font-bold">
            RSA Key Generation (RSA 키생성)
          </h1>

          <div className="mb-4 ">
            <p>
              RSA는 공개키 암호시스템의 하나로, 암호화뿐만 아니라 전자서명이
              가능한 최초의 알고리즘으로 알려져 있다. RSA가 갖는 전자서명 기능은
              인증을 요구하는 전자 상거래 등에 RSA의 광범위한 활용을 가능하게
              하였다. 1978년 로널드 라이베스트(Ron Rivest), 아디 샤미르(Adi
              Shamir), 레너드 애들먼(Leonard Adleman)의 연구에 의해
              체계화되었으며, RSA라는 이름은 이들 3명의 이름 앞글자를 딴 것이다.
              이 세 발명자는 이 공로로 2002년 튜링상을 수상했다.
            </p>
            <div className="mx-auto px-20">
              <Image
                src="/rsa-key.jpg"
                alt="RSA key generation"
                width={500}
                height={500}
                className="object-cover"
              />
              <Image
                src="/rsa-enc.jpg"
                alt="RSA encryption"
                width={500}
                height={500}
                className="object-cover"
              />
            </div>
          </div>

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
              Public Key (공개키-PEM)
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
              Private Key (개인키-PEM)
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
            <label htmlFor="n" className="mb-3 font-bold">
              키 상세 정보 n=pq
            </label>
            <textarea
              name="n"
              id="n"
              className="w-full bg-gray-50 h-32"
              value={n?.toString()}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label htmlFor="p" className="mb-3 font-bold">
              키 상세 정보 p
            </label>
            <textarea
              name="p"
              id="p"
              className="w-full bg-gray-50 h-16"
              value={p?.toString()}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label htmlFor="q" className="mb-3 font-bold">
              키 상세 정보 q
            </label>
            <textarea
              name="q"
              id="q"
              className="w-full bg-gray-50 h-16"
              value={q?.toString()}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label htmlFor="n" className="mb-3 font-bold">
              키 상세 정보 e (공개키)
            </label>
            <input
              type="text"
              name="e"
              id="e"
              className="w-full bg-gray-50 h-8"
              value={e?.toString()}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label htmlFor="d" className="mb-3 font-bold ">
              키 상세 정보 d (개인키)
            </label>
            <textarea
              name="d"
              id="d"
              className="w-full bg-gray-50 h-32"
              value={d?.toString()}
              readOnly
            />
          </div>
        </form>
      </div>
    </div>
  )
}
