'use client'

import forge from 'node-forge'
import axios from 'axios'
import Image from 'next/image'
import { useState } from 'react'
import computeHmac from '@/lib/computeHmac'
import { Button } from '@/components/ui/button'

export default function HMACPage() {
  const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512']

  const [algorithm, setAlgorithm] = useState('sha256')
  const [inputText, setInputText] = useState('input your message')
  const [secret, setSecret] = useState('shared secret')
  const [hmacValue1, setHmacValue1] = useState('')
  const [hmacValue2, setHmacValue2] = useState('')

  const submitHandler = async () => {
    const result = computeHmac(algorithm, inputText, secret)
    setHmacValue1(result)
  }
  const submitHandlerServer = async () => {
    axios
      .post('/api/hashFunc/hmac', { algorithm, inputText, secret })
      .then((res) => {
        setHmacValue2(res.data.hmacValue)
      })
  }

  const randomSecret = () => {
    setSecret(forge.util.bytesToHex(forge.random.getBytesSync(16)))
  }

  return (
    <div>
      <form className="mx-auto max-w-screen-lg">
        <h1 className="text-3xl mb-4 font-bold">HMAC (메시지인증코드) </h1>

        <p className="mb-4">
          메시지인증코드는 동일한 키를 공유하고 있는 송신자와 수신자가 전송하는
          메시지의 인증성을 상대방에게 확인시키기 위해서 계산하는 값이다.
          전송하는 메시지와 공유한 키를 입력으로 하여 해쉬값을 계산하는 것이다.
        </p>
        <div className="mb-4 flex flex-row">
          <div className="basis-1/2">
            <label htmlFor="algo" className="mb-3 font-bold">
              Select HMAC Hash Algorithm (default to sha256)
            </label>
            {algorithms.map((algo) => (
              <div key={algo} className="mx-4 ">
                <input
                  name="algo"
                  className="p-2 outline-none focus:ring-0"
                  id={algo}
                  type="radio"
                  value={algo}
                  checked={algorithm === algo}
                  onChange={() => setAlgorithm(algo)}
                />
                <label className="p-2" htmlFor={algo}>
                  {algo}
                </label>
              </div>
            ))}
          </div>
          <div className="basis-1/2">
            <Image
              src="/hmac.jpg"
              alt="hmac function"
              width={500}
              height={500}
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">Shared Secret</h2>
          <input
            type="text"
            name="secret"
            id="secret"
            className="w-full bg-gray-50 p-2"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Button type="button" onClick={randomSecret}>
            Generate random shared secret
          </Button>
        </div>

        <div className="mb-4">
          <h2 className="mb-2 font-bold">Input Message</h2>
          <textarea
            name="input"
            id="input"
            className="w-full bg-gray-50 h-32 p-2"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-4 flex gap-2 justify-around">
          <button
            className="red-button w-full"
            type="button"
            onClick={submitHandler}
          >
            Compute HMAC - Client
          </button>
          <button
            className="blue-button w-full"
            type="button"
            onClick={submitHandlerServer}
          >
            Compute HMAC - Server
          </button>
        </div>

        <div className="mb-4 overflow-x-auto">
          <h2 className="mb-2 font-bold">Result</h2>
          <div className="px-4 bg-slate-200">
            <p>Hash algorithm: {algorithm}</p>
            <p>Input text: {inputText}</p>
            <p>Shared secret: {secret}</p>
            <p className="break-words overflow-x-auto text-red-700 font-bold">
              HMAC value (client-side): {hmacValue1} ({hmacValue1.length * 4}{' '}
              bits)
            </p>
            <p className="break-words overflow-x-auto text-blue-700 font-bold">
              HMAC value (server-side): {hmacValue2} ({hmacValue2.length * 4}{' '}
              bits)
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
