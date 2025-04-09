import forge from 'node-forge'

type AESMode = 'ECB' | 'CBC'

const computeEncrypt = (
  plaintext: string,
  mode: AESMode,
  key: string,
  iv: string
): forge.util.ByteStringBuffer => {
  if (mode === 'ECB') {
    const cipher = forge.cipher.createCipher('AES-ECB', key)
    cipher.start()
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(plaintext)))
    cipher.finish()
    return cipher.output
  } else {
    const cipher = forge.cipher.createCipher('AES-CBC', key)
    cipher.start({ iv: iv })
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(plaintext)))
    cipher.finish()
    return cipher.output
  }
}

const computeDecrypt = (
  ciphertext: forge.util.ByteStringBuffer,
  mode: AESMode,
  key: string,
  iv: string
): string => {
  if (mode === 'ECB') {
    const decipher = forge.cipher.createDecipher('AES-ECB', key)
    decipher.start()
    decipher.update(forge.util.createBuffer(ciphertext))
    decipher.finish()
    return decipher.output.toString()
  } else {
    const decipher = forge.cipher.createDecipher('AES-CBC', key)
    decipher.start({ iv: iv })
    decipher.update(forge.util.createBuffer(ciphertext))
    decipher.finish()
    return decipher.output.toString()
  }
}

export { computeEncrypt, computeDecrypt }
