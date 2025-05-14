'use client'

import { useState } from 'react'

interface Certificate {
  _id: string
  userEmail: string
  certPem: string
  issuedAt: string
  expiresAt: string
}

interface CertListProps {
  certificates: Certificate[]
}

export default function CertList({ certificates }: CertListProps) {
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set())

  const toggleCert = (certId: string) => {
    setExpandedCerts((prev) => {
      const next = new Set(prev)
      if (next.has(certId)) {
        next.delete(certId)
      } else {
        next.add(certId)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <div
          key={cert._id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{cert.userEmail}</p>
              <p className="text-sm text-gray-500">
                발급일: {new Date(cert.issuedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                만료일: {new Date(cert.expiresAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => toggleCert(cert._id)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {expandedCerts.has(cert._id) ? '인증서 숨기기' : '인증서 보기'}
            </button>
          </div>
          {expandedCerts.has(cert._id) && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <pre className="whitespace-pre-wrap break-all text-sm">
                {cert.certPem}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
