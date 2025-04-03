import forge from 'node-forge'

const computePbkdf2 = (
  password: string,
  salt: string,
  iteration: number,
  keyLength: number
) => {
  const derivedKey = forge.pkcs5.pbkdf2(password, salt, iteration, keyLength)

  return derivedKey
}
export default computePbkdf2
