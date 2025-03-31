import forge from 'node-forge'

const computeHmac = (algorithm: string, inputText: string, secret: string) => {
  let hmac = forge.hmac.create()
  let algo = algorithm as forge.md.Algorithm
  hmac.start(algo, secret)
  hmac.update(inputText)
  return hmac.digest().toHex()
}
export default computeHmac
