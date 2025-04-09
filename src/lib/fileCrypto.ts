import forge from 'node-forge'
import { AESOptions } from '@/lib/aesTypes'

// 패스워드로부터 세션키 생성
export function generateSessionKey(
  password: string,
  salt?: string
): { key: string; salt: string } {
  // 솔트가 없으면 생성
  if (!salt) {
    salt = forge.random.getBytesSync(16)
  }

  // PBKDF2를 사용하여 패스워드로부터 키 생성
  const key = forge.pkcs5.pbkdf2(password, salt, 10000, 32) // 256비트 키 생성
  return {
    key: forge.util.encode64(key),
    salt: forge.util.encode64(salt),
  }
}

// 파일을 ArrayBuffer로 변환
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// ArrayBuffer를 File로 변환
export function arrayBufferToFile(
  buffer: ArrayBuffer,
  filename: string,
  mimeType: string
): File {
  const blob = new Blob([buffer], { type: mimeType })
  return new File([blob], filename, { type: mimeType })
}

// 파일 암호화
export async function encryptFile(
  file: File,
  password: string,
  options: AESOptions
): Promise<{ encryptedFile: File; salt: string; iv: string; tag?: string }> {
  // 패스워드로부터 세션키 생성
  const { key, salt } = generateSessionKey(password)

  // 파일을 ArrayBuffer로 변환
  const fileBuffer = await fileToArrayBuffer(file)

  // 암호화
  const cipher = forge.cipher.createCipher(
    `AES-${options.mode}`,
    forge.util.decode64(key)
  )

  if (options.iv) {
    cipher.start({ iv: forge.util.decode64(options.iv) })
  } else {
    const iv = forge.random.getBytesSync(16)
    options.iv = forge.util.encode64(iv)
    cipher.start({ iv })
  }

  // 파일 데이터를 ByteStringBuffer로 변환
  const fileData = forge.util.createBuffer(new Uint8Array(fileBuffer))
  cipher.update(fileData)

  const result = cipher.finish()

  if (!result) {
    throw new Error('암호화 실패')
  }

  const encryptedBuffer = cipher.output.getBytes()

  // GCM 모드인 경우 인증 태그 저장
  if (options.mode === 'GCM' && cipher.mode.tag) {
    options.tag = forge.util.encode64(cipher.mode.tag.getBytes())
  }

  // 암호화된 파일 생성
  const encryptedFile = arrayBufferToFile(
    new Uint8Array(forge.util.binary.raw.decode(encryptedBuffer)).buffer,
    `${file.name}.encrypted`,
    'application/octet-stream'
  )

  return {
    encryptedFile,
    salt,
    iv: options.iv,
    tag: options.tag,
  }
}

// 파일 복호화
export async function decryptFile(
  encryptedFile: File,
  password: string,
  salt: string,
  options: AESOptions
): Promise<File> {
  // 패스워드와 솔트로부터 세션키 생성
  const { key } = generateSessionKey(password, salt)

  // 암호화된 파일을 ArrayBuffer로 변환
  const encryptedBuffer = await fileToArrayBuffer(encryptedFile)

  // 복호화
  const decipher = forge.cipher.createDecipher(
    `AES-${options.mode}`,
    forge.util.decode64(key)
  )

  const decipherOptions: {
    iv: forge.util.ByteStringBuffer
    tag?: forge.util.ByteStringBuffer
  } = {
    iv: forge.util.createBuffer(forge.util.decode64(options.iv || '')),
  }
  if (options.mode === 'GCM' && options.tag) {
    decipherOptions.tag = forge.util.createBuffer(
      forge.util.decode64(options.tag)
    )
  }

  decipher.start(decipherOptions)

  // 암호화된 데이터를 ByteStringBuffer로 변환
  const encryptedData = forge.util.createBuffer(new Uint8Array(encryptedBuffer))
  decipher.update(encryptedData)

  const result = decipher.finish()

  if (!result) {
    throw new Error('복호화 실패')
  }

  const decryptedBuffer = decipher.output.getBytes()

  // 원본 파일명 추출 (암호화 시 추가된 .encrypted 확장자 제거)
  const originalFilename = encryptedFile.name.replace('.encrypted', '')

  // 복호화된 파일 생성
  return arrayBufferToFile(
    new Uint8Array(forge.util.binary.raw.decode(decryptedBuffer)).buffer,
    originalFilename,
    'application/octet-stream'
  )
}

// 파일 해시 계산
export async function computeFileHash(
  file: File,
  algorithm: string
): Promise<string> {
  const fileBuffer = await fileToArrayBuffer(file)

  // 바이너리 데이터를 ByteStringBuffer로 변환
  const binaryData = forge.util.createBuffer(new Uint8Array(fileBuffer))

  let md
  switch (algorithm) {
    case 'md5':
      md = forge.md5.create()
      break
    case 'sha1':
      md = forge.sha1.create()
      break
    case 'sha256':
      md = forge.sha256.create()
      break
    case 'sha384':
      md = forge.sha384.create()
      break
    case 'sha512':
      md = forge.sha512.create()
      break
    default:
      throw new Error('지원하지 않는 알고리즘')
  }

  md.update(binaryData.getBytes())
  return md.digest().toHex()
}
