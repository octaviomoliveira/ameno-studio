'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'code'

export default function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string
  initialError: boolean
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState(initialError ? 'O link expirou ou não pôde ser validado. Solicite um novo acesso.' : '')

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    setPending(true)
    setMessage('')
    const callback = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callback,
      },
    })
    setPending(false)

    if (error) {
      setMessage('Não foi possível enviar o acesso agora. Aguarde um instante e tente novamente.')
      return
    }

    setEmail(normalizedEmail)
    setStep('code')
    setMessage('Enviamos o acesso. Digite o código de seis dígitos ou use o link recebido no e-mail.')
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedCode = code.replace(/\D/g, '').slice(0, 6)
    if (normalizedCode.length !== 6) {
      setMessage('Digite os seis números do código recebido.')
      return
    }

    setPending(true)
    setMessage('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: normalizedCode,
      type: 'email',
    })
    setPending(false)

    if (error) {
      setMessage('Código inválido ou expirado. Confira o e-mail ou solicite um novo acesso.')
      return
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <div className="account-status-card auth-card" aria-live="polite">
      <div className="account-status-heading">
        <span className="account-status-dot is-active" aria-hidden="true" />
        <span>{step === 'email' ? 'SOLICITAR ACESSO' : 'CONFIRMAR IDENTIDADE'}</span>
      </div>

      {step === 'email' ? (
        <form className="auth-form" onSubmit={requestCode}>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
          />
          <button type="submit" disabled={pending} className="ameno-button ameno-button--primary ameno-button--block">
            <span>{pending ? 'Enviando…' : 'Receber código'}</span>
            {!pending ? <span aria-hidden="true">→</span> : null}
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={verifyCode}>
          <p className="auth-email-sent">Acesso enviado para <strong>{email}</strong></p>
          <label htmlFor="login-code">Código de seis dígitos</label>
          <input
            id="login-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
          />
          <button type="submit" disabled={pending} className="ameno-button ameno-button--primary ameno-button--block">
            <span>{pending ? 'Verificando…' : 'Entrar'}</span>
            {!pending ? <span aria-hidden="true">→</span> : null}
          </button>
          <button
            className="auth-secondary-action ameno-button ameno-button--secondary ameno-button--block"
            type="button"
            disabled={pending}
            onClick={() => {
              setStep('email')
              setCode('')
              setMessage('')
            }}
          >
            Usar outro e-mail
          </button>
        </form>
      )}

      <p className={`auth-message${message ? ' is-visible' : ''}`}>{message}</p>
      <div className="account-rule" />
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#666666]">Login opcional / compra sem cadastro</p>
    </div>
  )
}
