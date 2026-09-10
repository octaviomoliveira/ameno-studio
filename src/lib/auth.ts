export function safeNextPath(value: string | null | undefined, fallback = '/conta') {
  if (!value || !value.startsWith('/') || value.includes('\\')) return fallback

  try {
    const base = new URL('https://ameno.invalid')
    const target = new URL(value, base)
    if (target.origin !== base.origin) return fallback
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return fallback
  }
}
