'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '2876378722756045'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-414SSY6B7V'
const COOKIE_CONSENT_KEY = 'ameno_cookie_consent'
const COOKIE_CONSENT_EVENT = 'ameno:cookie-consent-change'

type ConsentStatus = 'pending' | 'accepted' | 'rejected'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    [key: string]: unknown
  }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(COOKIE_CONSENT_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(COOKIE_CONSENT_EVENT, callback)
  }
}

function getConsentSnapshot(): ConsentStatus {
  try {
    const saved = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    if (saved === 'accepted' || saved === 'rejected') return saved
  } catch {
    // localStorage indisponível
  }
  return 'pending'
}

function getConsentServerSnapshot(): ConsentStatus {
  return 'pending'
}

function clearTrackingCookies() {
  if (typeof document === 'undefined') return
  const cookiesToClear = ['_fbp', '_fbc', '_ga', `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, '')}`]
  for (const name of cookiesToClear) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.ameno.studio; SameSite=Lax`
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname()
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  )

  useEffect(() => {
    if (consent === 'rejected') {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = true
      window.fbq = undefined
      clearTrackingCookies()
    } else {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = false
    }
  }, [consent])

  const handleAccept = () => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
  }

  const handleReject = () => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
  }

  const trackingEnabled = consent !== 'rejected'

  // Dispara PageView / page_view a cada troca de rota no cliente
  useEffect(() => {
    if (!pathname || !trackingEnabled) return
    if (META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
    if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_location: window.location.href,
      })
    }
  }, [pathname, trackingEnabled])

  // Delegação global para eventos de conversão (Contact, Lead, InitiateCheckout)
  useEffect(() => {
    if (!trackingEnabled) return

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (!target) return

      const contactTrigger = target.closest(
        'a[href^="mailto:"], a[href*="wa.me"], a[href*="whatsapp.com"], .site-footer-action-btn'
      )
      if (contactTrigger) {
        if (typeof window.fbq === 'function') window.fbq('track', 'Contact')
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', { event_category: 'contact' })
        }
        return
      }

      const checkoutTrigger = target.closest(
        '#comprar button[type="submit"], a[href="#comprar"], a[href="/plugins#comprar"]'
      )
      if (checkoutTrigger) {
        if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout')
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'begin_checkout', { currency: 'BRL', item_name: 'Ameno Cotas' })
        }
      }
    }

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null
      if (!form) return

      if (form.closest('#comprar')) {
        if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout')
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'begin_checkout', { currency: 'BRL', item_name: 'Ameno Cotas' })
        }
      } else if (form.closest('.auth-page')) {
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead')
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', { event_category: 'auth_lead' })
        }
      }
    }

    document.addEventListener('click', onClick, { passive: true })
    document.addEventListener('submit', onSubmit, { passive: true })
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('submit', onSubmit)
    }
  }, [trackingEnabled])

  return (
    <>
      {trackingEnabled && META_PIXEL_ID ? (
        <Script id="meta-pixel-base" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {trackingEnabled && GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="lazyOnload"
          />
          <Script id="ga4-base" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}

      {consent === 'pending' && (
        <aside
          id="cookie-consent-banner"
          className="cookie-consent-banner"
          role="region"
          aria-label="Aviso de cookies e privacidade"
        >
          <p className="cookie-consent-text">
            Usamos cookies (Google Analytics e Pixel da Meta) para medir visitas e melhorar sua
            experiência. Leia nossa{' '}
            <Link href="/privacidade" className="cookie-consent-link">
              Política de privacidade
            </Link>
            .
          </p>
          <div className="cookie-consent-actions">
            <button
              type="button"
              onClick={handleReject}
              className="cookie-consent-btn cookie-consent-btn--reject"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="cookie-consent-btn cookie-consent-btn--accept"
            >
              Aceitar
            </button>
          </div>
        </aside>
      )}
    </>
  )
}
