var forge = require('node-forge')
var fs = require('fs')
var pki = forge.pki
var user = 'userB'

// 사용자명 설정

// 1. CA 개인키와 인증서를 파일에서 읽어오기
var caCertPem = fs.readFileSync('caCert.pem', 'utf8')
var caPrivateKeyPem = fs.readFileSync('caPrivateKey.pem', 'utf8')
var caCert = pki.certificateFromPem(caCertPem)
var caPrivateKey = pki.privateKeyFromPem(caPrivateKeyPem)
var verified = caCert.verify(caCert)
console.log('CA인증서의 유효성 검증: ' + verified)

// ------------------------------
// 2. 사용자 키쌍 생성
var keys = pki.rsa.generateKeyPair(1024)

// 3. 사용자 개인키를 파일로 저장
console.log(pki.privateKeyToPem(keys.privateKey))
fs.writeFileSync(user + 'PrivateKey.pem', pki.privateKeyToPem(keys.privateKey))
console.log('사용자 개인키 저장 - ' + user + 'PrivateKey.pem \n')

// 4. 사용자 인증서 객체 생성
var cert = pki.createCertificate()
cert.publicKey = keys.publicKey
cert.serialNumber = '102'
cert.validity.notBefore = new Date()
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

// 5. 사용자 정보 설정
var attrs = [
  {
    shortName: 'CN',
    value: user,
  },
  {
    shortName: 'C',
    value: 'KR',
  },
  {
    shortName: 'ST',
    value: 'Gyeonggi-do',
  },
  {
    shortName: 'L',
    value: 'Goyang-si',
  },
  {
    shortName: 'O',
    value: 'Joongbu Univ.',
  },
  {
    shortName: 'OU',
    value: 'Dept. of Information Security',
  },
]
cert.setSubject(attrs)

// 6. CA 정보 설정. 인증서에서 읽어와서 자동 설정
var caAttrs = [
  {
    shortName: 'CN',
    value: caCert.subject.getField('CN').value,
  },
  {
    shortName: 'C',
    value: caCert.subject.getField('C').value,
  },
  {
    shortName: 'ST',
    value: caCert.subject.getField('ST').value,
  },
  {
    shortName: 'L',
    value: caCert.subject.getField('L').value,
  },
  {
    shortName: 'O',
    value: caCert.subject.getField('O').value,
  },
  {
    shortName: 'OU',
    value: caCert.subject.getField('OU').value,
  },
]
cert.setIssuer(caAttrs)

// 7. 확장영역 설정
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true,
  },
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
      {
        type: 6, // URI
        value: 'http://example.org/webid#me',
      },
      {
        type: 7, // IP
        ip: '127.0.0.1',
      },
    ],
  },
  {
    name: 'subjectKeyIdentifier',
  },
])

// 8. CA가 서명하여 사용자 인증서 생성
cert.sign(caPrivateKey) // CA 개인키로 서명
console.log('사용자 인증서 생성')
console.log(pki.certificateToPem(cert))

// 9. 사용자 인증서 검증
var verified = caCert.verify(cert)
console.log('사용자 인증서 검증: ' + verified)

// 10. 사용자 인증서 저장
fs.writeFileSync(user + 'Cert.pem', pki.certificateToPem(cert))
console.log('사용자 인증서 저장 - ' + user + 'Cert.pem')
