'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '2876378722756045'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-414SSY6B7V'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname()

  // Dispara PageView / page_view a cada troca de rota no cliente
  useEffect(() => {
    if (!pathname) return
    if (META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
    if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_location: window.location.href,
      })
    }
  }, [pathname])

  // Delegação global para eventos de conversão (Contact, Lead, InitiateCheckout)
  useEffect(() => {
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
  }, [])

  return (
    <>
      {META_PIXEL_ID ? (
        <Script id="meta-pixel-base" strategy="afterInteractive">
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

      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-base" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}
    </>
  )
}
