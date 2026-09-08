'use client'

import { useState, type FormEvent } from 'react'

export default function PurchaseForm({ minimum, suggested }: { minimum: number; suggested: number }) {
  const [value, setValue] = useState((suggested / 100).toFixed(2).replace('.', ','))
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const normalized = value.trim().replace(',', '.')
    const amount = Math.round(Number(normalized) * 100)
    if (!/^\d+(\.\d{1,2})?$/.test(normalized) || !Number.isSafeInteger(amount) || amount < minimum) {
      setError('Informe um valor de pelo menos R$ 10,00, com até duas casas decimais.')
      return
    }
    setError('')
    setPending(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      if (!response.ok || typeof data.url !== 'string' || !data.url) {
        throw new Error(data.error || 'Não foi possível abrir o pagamento. Tente novamente.')
      }
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível abrir o pagamento. Tente novamente.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
      <label htmlFor="purchase-amount">Quanto deseja pagar? (R$)</label>
      <input id="purchase-amount" name="amount" type="text" inputMode="decimal" required
        value={value} onChange={(event) => { setValue(event.target.value); setError('') }}
        aria-describedby="amount-hint amount-error" aria-invalid={Boolean(error)} disabled={pending}
        style={{ padding: 16, border: '1px solid #666', borderRadius: 4, background: '#161616', color: '#fff', fontSize: 24, cursor: 'text' }} />
      <p id="amount-hint">mínimo R$ 10,00</p>
      <p id="amount-error" role="alert">{error}</p>
      <button type="submit" disabled={pending} style={{ padding: 16, background: '#E63B2E', color: '#fff', borderRadius: 4, cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1 }}>
        {pending ? 'Abrindo pagamento…' : 'Comprar Ameno Cotas'}
      </button>
    </form>
  )
}
