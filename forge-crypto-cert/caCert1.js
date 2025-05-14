import forge from 'node-forge'
import { writeFile } from 'fs/promises'

const { pki } = forge

// 루트인증기관에서 자체서명인증서 생성 및 저장
async function createSelfSignedRootCA() {
  // 1. RSA 키쌍 생성
  const keypair = pki.rsa.generateKeyPair(2048)
  const publicKey = keypair.publicKey
  const privateKey = keypair.privateKey
  console.log(pki.publicKeyToPem(publicKey))
  console.log(pki.privateKeyToPem(privateKey))

  // 2. X.509v3 인증서 객체 생성
  const cert = pki.createCertificate()

  // 3. 각종 필드 정보 입력
  cert.publicKey = publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

  const attrs = [
    { shortName: 'CN', value: 'Byoungcheon Lee' },
    { shortName: 'C', value: 'KR' },
    { shortName: 'ST', value: 'Gyeonggi-do' },
    { shortName: 'L', value: 'Goyang-si' },
    { shortName: 'O', value: 'Joongbu Univ.' },
    { shortName: 'OU', value: 'Dept. of Information Security' },
  ]

  cert.setSubject(attrs)
  cert.setIssuer(attrs)

  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 6, value: 'http://cris.joongbu.ac.kr' },
        { type: 7, ip: '127.0.0.1' },
      ],
    },
    { name: 'subjectKeyIdentifier' },
  ])

  // 4. 인증서 객체를 개인키로 서명
  cert.sign(privateKey)

  // 5. 인증서를 PEM 형식으로 출력
  const pemCert = pki.certificateToPem(cert)
  console.log(pemCert)

  // 6. 인증서의 검증
  const verified = cert.verify(cert)
  console.log('인증서 검증: ' + verified)

  // 7. 인증서, 개인키를 파일로 저장하기
  await writeFile('caPublicKey.pem', pki.publicKeyToPem(publicKey))
  await writeFile('caPrivateKey.pem', pki.privateKeyToPem(privateKey))
  await writeFile('caCert.pem', pemCert)

  console.log('파일 저장 완료')
}

createSelfSignedRootCA().catch(console.error)
