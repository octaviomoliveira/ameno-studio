# ameno.studio — Plano do Site

> **Stack:** Next.js 14 + Tailwind + GSAP + Lenis + Supabase + Stripe + Vercel
> **Domínio:** ameno.studio (Porkbun)
> **Repo:** github.com/octaviomoliveira/ameno-studio

---

## Identidade visual

**Conceito:** ordem × interferência

**Paleta:**
- Fundo: `#0a0a0a`
- Texto: `#ffffff` / `#e8e8e0`
- Acento: `#E63B2E` (vermelho spray — interferência)

**Logos em:** `public/brand/logo.svg`, `logo.png`, `symbol.svg`

---

## Efeitos de scroll aprovados

- Cotas SVG interativas no hero (mouse → valores mudam)
- Texto stagger letra por letra
- Corte/slash de transição entre seções
- Image reveal (scale + clip-path) nos projetos
- Pinned scroll nos projetos
- Parallax nas imagens
- Marquee horizontal entre seções
- Linha vermelha animada
- Cursor crosshair com coordenadas X/Y
- Navbar hide/show no scroll
- Lenis em tudo

---

## Modelo de negócio

**Pay-what-you-want** — mínimo R$5,00
Stripe Checkout → webhook → Supabase

---

## Status

- [x] Next.js setup
- [x] Tailwind paleta
- [x] lib/supabase.ts + lib/stripe.ts
- [x] API /checkout
- [x] Logos copiados
- [ ] Navbar + Footer + Cursor
- [ ] Home page
- [ ] GSAP + Lenis global
- [ ] Hero + Cotas
- [ ] Projetos scroll
- [ ] /plugins pay-what-you-want
- [ ] Webhook Stripe
- [ ] Deploy Vercel

---

## Pendências do usuário

1. Supabase URL + anon key
2. Renders para portfólio (ou usar placeholder)
3. Confirmar mínimo R$5,00
