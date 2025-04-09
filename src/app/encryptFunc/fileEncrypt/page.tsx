'use client'

import { useState } from 'react'
import { encryptFile, decryptFile } from '@/lib/fileCrypto'
import { AESMode, AESKeyLength, AESOptions } from '@/lib/aesTypes'
import computeHash from '@/lib/computeHash'

export default function FileEncryptPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AESMode>('CBC')
  const [keyLength, setKeyLength] = useState<AESKeyLength>(128)
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null)
  const [decryptedFile, setDecryptedFile] = useState<File | null>(null)
  const [salt, setSalt] = useState('')
  const [iv, setIv] = useState('')
  const [tag, setTag] = useState('')
  const [originalHash, setOriginalHash] = useState('')
  const [decryptedHash, setDecryptedHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setEncryptedFile(null)
      setDecryptedFile(null)
      setSalt('')
      setIv('')
      setTag('')
      setOriginalHash('')
      setDecryptedHash('')
      setError('')
      setSuccess('')
    }
  }

  const calculateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    return computeHash('sha256', buffer)
  }

  const handleEncrypt = async () => {
    if (!file || !password) {
      setError('파일과 비밀번호를 모두 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // 원본 파일의 해시값 계산
      const hash = await calculateHash(file)
      setOriginalHash(hash)

      // 파일 암호화
      const options: AESOptions = {
        mode,
        keyLength,
      }

      const result = await encryptFile(file, password, options)
      setEncryptedFile(result.encryptedFile)
      setSalt(result.salt)
      setIv(result.iv)
      if (result.tag) setTag(result.tag)

      setSuccess('파일이 성공적으로 암호화되었습니다.')
    } catch (err) {
      setError('암호화 중 오류가 발생했습니다: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecrypt = async () => {
    if (!encryptedFile || !password || !salt || !iv) {
      setError('암호화된 파일, 비밀번호, 솔트, IV가 모두 필요합니다.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // 파일 복호화
      const options: AESOptions = {
        mode,
        keyLength,
        iv,
        tag,
      }

      const decrypted = await decryptFile(
        encryptedFile,
        password,
        salt,
        options
      )
      setDecryptedFile(decrypted)

      // 복호화된 파일의 해시값 계산
      const hash = await calculateHash(decrypted)
      setDecryptedHash(hash)

      if (hash === originalHash) {
        setSuccess('파일이 성공적으로 복호화되었습니다. 해시값이 일치합니다.')
      } else {
        setError('복호화된 파일의 해시값이 원본과 일치하지 않습니다.')
      }
    } catch (err) {
      setError('복호화 중 오류가 발생했습니다: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = (file: File, filename: string) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="text-3xl mb-4 font-bold">파일 암호화/복호화</h1>

      <div className="mb-4">
        <p>
          파일을 선택하고 비밀번호를 입력하여 암호화/복호화를 수행할 수
          있습니다. 암호화된 파일은 원본 파일의 해시값을 저장하여 복호화 후
          무결성을 검증합니다.
        </p>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 font-bold">파일 선택</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        {file && <p className="mt-2">선택된 파일: {file.name}</p>}
      </div>

      <div className="mb-4">
        <h2 className="mb-2 font-bold">비밀번호 입력</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div className="mb-4">
        <h2 className="mb-2 font-bold">암호화 모드 선택</h2>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AESMode)}
          className="w-full p-2 border rounded"
        >
          <option value="CBC">CBC (기본값)</option>
          <option value="GCM">GCM</option>
        </select>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 font-bold">키 길이 선택</h2>
        <select
          value={keyLength}
          onChange={(e) => setKeyLength(Number(e.target.value) as AESKeyLength)}
          className="w-full p-2 border rounded"
        >
          <option value={128}>128 비트 (기본값)</option>
          <option value={192}>192 비트</option>
          <option value={256}>256 비트</option>
        </select>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handleEncrypt}
          disabled={!file || !password || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? '처리 중...' : '암호화'}
        </button>
        <button
          onClick={handleDecrypt}
          disabled={!encryptedFile || !password || isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? '처리 중...' : '복호화'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {encryptedFile && (
        <div className="mb-4">
          <h2 className="mb-2 font-bold">암호화 정보</h2>
          <div className="p-4 bg-gray-100 rounded">
            <p>솔트: {salt}</p>
            <p>IV: {iv}</p>
            {tag && <p>인증 태그: {tag}</p>}
            <button
              onClick={() => downloadFile(encryptedFile, encryptedFile.name)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              암호화된 파일 다운로드
            </button>
          </div>
        </div>
      )}

      {decryptedFile && (
        <div className="mb-4">
          <h2 className="mb-2 font-bold">복호화 정보</h2>
          <div className="p-4 bg-gray-100 rounded">
            <p>원본 파일 해시: {originalHash}</p>
            <p>복호화된 파일 해시: {decryptedHash}</p>
            <button
              onClick={() => downloadFile(decryptedFile, decryptedFile.name)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              복호화된 파일 다운로드
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
