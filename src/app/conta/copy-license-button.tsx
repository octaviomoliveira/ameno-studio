'use client'

import { useState } from 'react'

export default function CopyLicenseButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" onClick={copyToken} aria-live="polite">
      {copied ? 'Copiada' : 'Copiar'}
    </button>
  )
}
