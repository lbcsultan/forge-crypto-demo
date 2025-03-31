'use client'

import computeHash from '@/lib/computeHash'
import axios from 'axios'
// import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

export default function HashPage() {
  const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512']

  const [algorithm, setAlgorithm] = useState('sha256')
  const [inputText, setInputText] = useState('input your message')
  const [hashValue1, setHashValue1] = useState('')
  const [hashValue2, setHashValue2] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!algorithm || !inputText) {
      alert('Hash algorithm and input message are required!')
    }

    const result = computeHash(algorithm, inputText)
    setHashValue1(result as string)
  }
  const handleSubmitServer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!algorithm || !inputText) {
      alert('Hash algorithm and input message are required!')
    }

    axios.post('/api/hashFunc/hash', { algorithm, inputText }).then((res) => {
      setHashValue2(res.data.hashValue)
    })
  }

  return (
    <div>
      <form className='mx-auto max-w-screen-lg'>
        <h1 className='text-3xl mb-4 font-bold'>Hash (해시함수)</h1>

        <p>
          해시함수는 임의의 길이의 입력메시지에 대하여 고정된 길이의
          특징값(해시값)을 계산해내는 함수이다. 키가 사용되지 않으므로
          입력메시지가 같으면 동일한 해시값을 출력한다. 해시함수는 다음과 같은
          특성을 만족시켜야 한다.
        </p>
        <ul className='mb-4'>
          <li>
            1. 일방향성: 입력메시지로부터 해시값을 계산하는 것은 쉽지만 출력
            해시값으로부터 그 해시값을 출력하는 입력메시지를 찾는 것은 어렵다.
          </li>
          <li>
            2. 충돌회피성: 같은 해시값을 출력하는 두개의 입력메시지를 찾아내는
            것은 어렵다.
          </li>
        </ul>
        <div className='mb-4 flex flex-row'>
          <div className='basis-1/2'>
            <h2 className='mb-2 font-bold'>
              Select Hash Algorithm (default to sha256)
            </h2>
            {algorithms.map((algo) => (
              <div key={algo} className='mx-4 '>
                <input
                  name='algo'
                  className='p-2 outline-none focus:ring-0'
                  type='radio'
                  id={algo}
                  value={algo}
                  checked={algorithm === algo}
                  onChange={() => setAlgorithm(algo)}
                />
                <label className='p-2' htmlFor={algo}>
                  {algo}
                </label>
              </div>
            ))}
          </div>
          <div className='basis-1/2'>
            <Image
              src='/hash.jpg'
              alt='hash function'
              width={500}
              height={500}
              className='object-cover rounded-lg shadow-md'
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <div className='mb-4'>
          <h2 className='mb-2 font-bold'>Input Message</h2>
          <textarea
            name='input'
            id='input'
            className='w-full bg-gray-50 h-32 p-2'
            autoFocus
            placeholder='텍스트를 입력하세요'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
        </div>

        <div className='mb-4 flex justify-around gap-2'>
          <button className='red-button w-full' onClick={handleSubmit}>
            Compute Hash - Client
          </button>

          <button className='blue-button w-full' onClick={handleSubmitServer}>
            Compute Hash - Server
          </button>
        </div>

        <div className='mb-4 overflow-x-auto'>
          <h2 className='mb-2 font-bold'>Result</h2>
          <div className='px-4 bg-slate-200'>
            <p>Hash algorithm: {algorithm}</p>
            <p>Input text: {inputText}</p>
            <p className='break-words overflow-x-auto text-red-700 font-bold'>
              Hash value (client-side): {hashValue1} ({hashValue1.length * 4}{' '}
              bits)
            </p>
            <p className='break-words overflow-x-auto text-blue-700 font-bold'>
              Hash value (server-side): {hashValue2} ({hashValue2.length * 4}{' '}
              bits)
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
