var forge = require('node-forge')
var fs = require('fs')
var pki = forge.pki
var rsa = forge.pki.rsa

// 루트인증기관에서 자체서명인증서 생성, 저장

// 1. RSA 키쌍 생성
var keypair = pki.rsa.generateKeyPair(2048)
var publicKey = keypair.publicKey
var privateKey = keypair.privateKey
console.log(pki.publicKeyToPem(publicKey))
console.log(pki.privateKeyToPem(privateKey))

// 2. X.509v3 인증서 객체 생성
var cert = pki.createCertificate()

// 3. 각종 필드 정보 입력
cert.publicKey = publicKey
cert.serialNumber = '01' // DB 등에 일련번호 관리 필요
cert.validity.notBefore = new Date() // 발급시간, 현재시간
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1) // 유효기간을 1년으로 설정
// 사용자 정보
var attrs = [
  {
    shortName: 'CN',
    value: 'Byoungcheon Lee',
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

cert.setSubject(attrs) // 인증서 사용자(주체)로 설정
cert.setIssuer(attrs) // 발급자로 설정 (자체서명인증서인 경우 동일)
// 확장영역 설정
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true, // 인증기관의 인증서임을 나타냄
  },
  {
    name: 'keyUsage', // 키용도 설정
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true,
  },
  {
    name: 'extKeyUsage', // 확장 키용도 설정
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true,
  },
  {
    name: 'nsCertType', // 인증서 타입
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true,
  },
  {
    name: 'subjectAltName', // 주체 별도 정보
    altNames: [
      {
        type: 6, // URI
        value: 'http://cris.joongbu.ac.kr',
      },
      {
        type: 7, // IP
        ip: '127.0.0.1',
      },
    ],
  },
  {
    // 주체 키 식별자
    name: 'subjectKeyIdentifier',
  },
])

// 4. 인증서 객체를 개인키로 서명
cert.sign(privateKey)

// 5. 인증서를 PEM 형식으로 출력
var pem = pki.certificateToPem(cert)
console.log(pem) // 6. 인증서의 검증
var verified = cert.verify(cert) // 인증서에 있는 공개키로 검증
console.log('인증서 검증: ' + verified)

// 7. 인증서, 개인키를 파일로 저장하기
fs.writeFile('caPublicKey.pem', pki.publicKeyToPem(publicKey), function (err) {
  if (err) {
    return console.log(err)
  }
})

fs.writeFile(
  'caPrivateKey.pem',
  pki.privateKeyToPem(privateKey),
  function (err) {
    if (err) {
      return console.log(err)
    }
  }
)

fs.writeFile('caCert.pem', pki.certificateToPem(cert), function (err) {
  if (err) {
    return console.log(err)
  }
})
