import mongoose, { Schema, Document } from 'mongoose'

export interface ICertificate extends Document {
  userEmail: string
  serial: number
  cn: string
  country: string
  state: string
  locality: string
  org: string
  orgUnit: string
  publicKeyPem: string
  certPem: string
  caCertPem: string
  issuedAt: Date
  expiresAt: Date
}

const CertificateSchema: Schema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    serial: { type: Number, required: true, unique: true },
    cn: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    locality: { type: String, required: true },
    org: { type: String, required: true },
    orgUnit: { type: String, required: true },
    publicKeyPem: { type: String, required: true },
    certPem: { type: String, required: true },
    caCertPem: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema)
