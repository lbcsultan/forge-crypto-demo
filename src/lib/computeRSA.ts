import forge from 'node-forge'

const rsaEncrypt = (publicKeyPem: string, bytes: string): string => {
  const publicKey: forge.pki.rsa.PublicKey =
    forge.pki.publicKeyFromPem(publicKeyPem)
  return publicKey.encrypt(bytes, 'RSA-OAEP')
}

const rsaDecrypt = (privateKeyPem: string, ciphertext: string): string => {
  const privateKey: forge.pki.rsa.PrivateKey =
    forge.pki.privateKeyFromPem(privateKeyPem)
  return privateKey.decrypt(ciphertext, 'RSA-OAEP')
}

const rsaSign = (privateKeyPem: string, plaintext: string): string => {
  const privateKey: forge.pki.rsa.PrivateKey =
    forge.pki.privateKeyFromPem(privateKeyPem)
  const pss = forge.pss.create({
    md: forge.md.sha1.create(),
    mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
    saltLength: 20,
  })
  const md = forge.md.sha256.create()
  md.update(plaintext, 'utf8')
  return privateKey.sign(md, pss).toString()
}

const rsaVerify = (
  publicKeyPem: string,
  plaintext: string,
  signature: string
): boolean => {
  const publicKey: forge.pki.rsa.PublicKey =
    forge.pki.publicKeyFromPem(publicKeyPem)
  const pss = forge.pss.create({
    md: forge.md.sha1.create(),
    mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
    saltLength: 20,
  })
  const md = forge.md.sha256.create()
  md.update(plaintext, 'utf8')
  return publicKey.verify(md.digest().bytes(), signature, pss)
}

export { rsaEncrypt, rsaDecrypt, rsaSign, rsaVerify }
