'use client'

import React, { useState } from 'react'
import computeHash from '@/lib/computeHash'

const FileHashPage: React.FC = () => {
  const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'] as const
  type Algorithm = (typeof algorithms)[number]

  const [algorithm, setAlgorithm] = useState<Algorithm>('sha256')
  const [file, setFile] = useState<File | null>(null)
  const [hash, setHash] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setFile(files[0])
      setHash('') // 새로운 파일 선택 시 이전 해시값 초기화
    }
  }

  const calculateHash = async () => {
    if (!file) {
      alert('파일을 먼저 선택해주세요.')
      return
    }

    setIsLoading(true)
    setHash('')

    try {
      const fileContent = await readFileAsText(file)
      const result = computeHash(algorithm, fileContent)
      setHash(result)
    } catch (error) {
      console.error('해시 계산 중 오류 발생:', error)
      alert('해시 계산 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const readFileAsText = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  return (
    <div className="mx-auto max-w-screen-lg p-4">
      <div className="mb-4">
        <h1 className="text-3xl mb-4 font-bold">파일 해시값 계산</h1>
        <input
          type="file"
          className="bg-amber-300 px-4 py-2 rounded-md"
          onChange={handleFileChange}
          accept="*" // 모든 파일 허용 (필요시 특정 확장자 지정 가능)
        />
      </div>

      <h2 className="mb-2 font-bold">해시 알고리즘 선택 (기본값: sha256)</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {algorithms.map((algo) => (
          <div key={algo} className="flex items-center">
            <input
              name="algo"
              className="mr-2"
              type="radio"
              id={algo}
              value={algo}
              checked={algorithm === algo}
              onChange={() => setAlgorithm(algo)}
            />
            <label htmlFor={algo}>{algo}</label>
          </div>
        ))}
      </div>

      <button
        onClick={calculateHash}
        disabled={!file || isLoading}
        className={`red-button rounded-md mt-4 mb-4 px-4 py-2 ${
          !file || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? '계산 중...' : '해시값 계산'}
      </button>

      {hash && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md break-all">
          <h3 className="font-bold mb-2">결과</h3>
          <p>
            알고리즘: <span className="font-mono">{algorithm}</span>
          </p>
          <p>
            파일명: <span className="font-mono">{file?.name}</span>
          </p>
          <p>
            해시값: <span className="font-mono">{hash}</span>
          </p>
          <p>
            비트 길이: <span className="font-mono">{hash.length * 4} bits</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default FileHashPage
