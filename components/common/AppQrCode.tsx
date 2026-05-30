'use client'

import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'

type AppQrCodeProps = {
  url?: string
  size?: number
  className?: string
  title?: string
}

export default function AppQrCode({
  url = 'https://hotel-mess-management.vercel.app',
  size = 220,
  className = '',
  title = 'Scan to Open on Mobile',
}: AppQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [error, setError] = useState('')

  const downloadFileName = useMemo(() => {
    const sanitized = url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9.-]/g, '-')
    return `${sanitized || 'app'}-qr.png`
  }, [url])

  useEffect(() => {
    let isMounted = true

    async function generateQr() {
      try {
        setError('')
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 1,
          errorCorrectionLevel: 'M',
        })

        if (isMounted) {
          setQrDataUrl(dataUrl)
        }
      } catch {
        if (isMounted) {
          setError('Unable to generate QR code right now.')
        }
      }
    }

    generateQr()

    return () => {
      isMounted = false
    }
  }, [url, size])

  return (
    <section
      className={`w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      aria-label="Application QR code"
    >
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="mt-1 text-xs text-gray-500 break-all">{url}</p>

      <div className="mt-3 flex justify-center">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR code to open Hotel Mess Management"
            width={size}
            height={size}
            className="h-auto w-full max-w-[220px] rounded-xl border border-gray-100"
          />
        ) : (
          <div className="flex h-[220px] w-full max-w-[220px] items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400">
            {error || 'Generating QR code...'}
          </div>
        )}
      </div>

      <a
        href={qrDataUrl || undefined}
        download={downloadFileName}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-disabled={!qrDataUrl}
      >
        Download PNG
      </a>
    </section>
  )
}
