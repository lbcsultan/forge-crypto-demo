import forge from 'node-forge'

const computeHash = (algorithm: string, input: string | ArrayBuffer) => {
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
      throw new Error('Unsupported algorithm')
  }

  if (input instanceof ArrayBuffer) {
    const bytes = new Uint8Array(input)
    const buffer = forge.util.createBuffer(bytes)
    const bytesString = buffer.getBytes()
    md.update(bytesString)
  } else {
    md.update(input)
  }

  return md.digest().toHex()
}

export default computeHash
