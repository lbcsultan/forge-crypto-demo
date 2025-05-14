import mongoose from 'mongoose'
import Certificate from '@/models/certificate'
import CertList from './CertList'

interface CertificateData {
  _id: string
  userEmail: string
  certPem: string
  issuedAt: string
  expiresAt: string
}

type RawCertificate = {
  _id: mongoose.Types.ObjectId
  userEmail: string
  certPem: string
  issuedAt: Date
  expiresAt: Date
  __v: number
}

async function getCertificates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')
    const certificates = (await Certificate.find({})
      .sort({ issuedAt: -1 })
      .select('userEmail certPem issuedAt expiresAt')
      .lean()
      .exec()) as RawCertificate[]

    // 클라이언트 컴포넌트로 전달하기 위해 일반 객체로 변환
    return certificates.map((cert) => ({
      _id: cert._id.toString(),
      userEmail: String(cert.userEmail),
      certPem: String(cert.certPem),
      issuedAt: new Date(cert.issuedAt).toISOString(),
      expiresAt: new Date(cert.expiresAt).toISOString(),
    })) as CertificateData[]
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return []
  } finally {
    await mongoose.disconnect()
  }
}

export default async function CertUsersPage() {
  const certificates = await getCertificates()

  return (
    <div className="mx-auto max-w-screen-lg">
      <h1 className="text-3xl mb-8 font-bold">
        Certified users (인증서를 발급받은 사용자)
      </h1>
      <CertList certificates={certificates} />
    </div>
  )
}
