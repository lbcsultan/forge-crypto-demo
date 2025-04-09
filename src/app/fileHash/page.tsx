'use client'

import { useState } from 'react'
import computeHash from '@/lib/computeHash'

type HashResults = {
  [key: string]: {
    client: string
    server: string
    match: boolean
  }
}

export default function FileHashPage() {
  const [results, setResults] = useState<HashResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // 클라이언트에서 해시 계산
      const arrayBuffer = await file.arrayBuffer()
      const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512']
      const clientResults = algorithms.reduce((acc, algorithm) => {
        acc[algorithm] = computeHash(algorithm, arrayBuffer)
        return acc
      }, {} as Record<string, string>)

      // 서버로 파일 전송
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/compute-hash', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('서버에서 해시 계산 중 에러가 발생했습니다.')
      }

      const serverResults = await response.json()

      // 결과 비교
      const comparisonResults = algorithms.reduce((acc, algorithm) => {
        acc[algorithm] = {
          client: clientResults[algorithm],
          server: serverResults[algorithm],
          match: clientResults[algorithm] === serverResults[algorithm],
        }
        return acc
      }, {} as HashResults)

      setResults(comparisonResults)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">파일 해시 계산</h1>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={loading}
        />
      </div>

      {loading && <div className="text-blue-600">해시 계산 중...</div>}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {results && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">해시 결과 비교</h2>
          <div className="space-y-4">
            {Object.entries(results).map(([algorithm, result]) => (
              <div key={algorithm} className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">
                  Algorithm: {algorithm.toUpperCase()}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">클라이언트 해시:</p>
                    <p className="font-mono text-sm break-all">
                      {result.client}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">서버 해시:</p>
                    <p className="font-mono text-sm break-all">
                      {result.server}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-2 text-sm ${
                    result.match ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {result.match
                    ? '✓ 해시값이 일치합니다'
                    : '✗ 해시값이 일치하지 않습니다'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
