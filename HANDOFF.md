# HANDOFF — ameno.studio para o Codex

Este documento é o briefing completo para continuar a implementação do site `ameno.studio`. Leia tudo antes de tocar em qualquer arquivo.

---

## Repositório e localização

- **Local:** `D:\Ameno\ameno-studio`
- **GitHub:** `https://github.com/octaviomoliveira/ameno-studio`
- **Branch:** `main`

---

## Stack real instalada

```
Next.js 16.3.4 (App Router)
React 19.2.8
TypeScript 5
Tailwind CSS 4  ← v4, não v3
GSAP 3.15
Lenis 1.3.26
Framer Motion 13
@supabase/supabase-js 2
stripe 22 (server)
@stripe/stripe-js 9 (client)
```

---

## Identidade visual — APROVADA, não alterar

```
Fundo:    #0a0a0a
Título:   #ffffff
Texto:    #e8e8e0
Bordas:   #222222
Acento:   #E63B2E  ← vermelho spray (interferência)
Cinza:    #666666
```

**Conceito:** ordem × interferência. A marca "ameno" tem tipografia racional + corte desconstrutivista + "O" grafitado. O vermelho é a interferência — aparece SOMENTE em: slash do logo, anos de projeto, linhas separadoras, botão CTA, hover.

**Logos já copiados para** `public/brand/`:
- `logo.svg` — wordmark completo
- `logo.png` — fallback
- `symbol.svg` — só o O

---

## Variáveis de ambiente (.env.local — NÃO commitar)

As chaves reais já estão em `.env.local` na raiz do projeto (não versionado).

Variáveis necessárias:
```
NEXT_PUBLIC_SUPABASE_URL           → ver .env.local
NEXT_PUBLIC_SUPABASE_ANON_KEY      → ver .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → ver .env.local (chave de TESTE)
STRIPE_SECRET_KEY                  → ver .env.local (chave de TESTE)
STRIPE_WEBHOOK_SECRET              → preencher após configurar webhook no Stripe Dashboard
NEXT_PUBLIC_SITE_URL               → http://localhost:3000 (dev)
NEXT_PUBLIC_MIN_AMOUNT             → 500 (R$5,00 em centavos)
```

---

## Arquivos já criados

```
src/
  app/
    globals.css               ✅ paleta CSS variables, tipografia, cursor
    layout.tsx                ✅ root layout com Lenis + Navbar + Footer + Cursor
    page.tsx                  ← VAZIO (create-next-app padrão, precisa ser reescrito)
    api/
      checkout/route.ts       ✅ CRIADO MAS COM BUGS (ver seção de bugs abaixo)
      webhooks/stripe/        ← diretório criado, SEM route.ts
  components/
    layout/
      Navbar.tsx              ✅
      Footer.tsx              ✅
      Cursor.tsx              ✅ crosshair com coordenadas X/Y
      LenisProvider.tsx       ✅ Lenis conectado ao GSAP ScrollTrigger
    hero/
      HeroSection.tsx         ✅
      CotasInterativas.tsx    ✅ SVG animado que reage ao mouse
    projects/
      ProjectScroll.tsx       ✅ scroll cinemático com parallax e reveal
    shared/
      Marquee.tsx             ✅ texto correndo horizontalmente
  lib/
    supabase.ts               ✅
    stripe.ts                 ✅ STRIPE_MIN_AMOUNT = 100 (ERRADO, ver bugs)
public/
  brand/
    logo.svg                  ✅
    logo.png                  ✅
    symbol.svg                ✅
supabase/
  schema.sql                  ✅ schema já rodado no Supabase Dashboard
```

---

## BUGS CONFIRMADOS — corrigir antes de qualquer outra coisa

### Bug 1 — Backticks faltando em `src/app/api/checkout/route.ts` linhas 32–33

**Estado atual (ERRADO — não compila):**
```ts
success_url: ${process.env.NEXT_PUBLIC_SITE_URL}/conta?success=true,
cancel_url:  ${process.env.NEXT_PUBLIC_SITE_URL}/plugins,
```

**Correto:**
```ts
success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/conta?success=true`,
cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/plugins`,
```

---

### Bug 2 — Valor mínimo errado em `src/lib/stripe.ts`

**Estado atual:** `STRIPE_MIN_AMOUNT = 100` → R$1,00

**Correto:** `STRIPE_MIN_AMOUNT = 500` → R$5,00 (decisão do usuário)

Também corrigir a mensagem de erro no checkout:
```ts
{ error: 'Valor mínimo é R$ 5,00' }
```

---

### Bug 3 — `tailwind.config.ts` está no formato v3 e será ignorado pelo Tailwind v4

O projeto usa Tailwind v4 que configura temas via CSS, não via JS.
O arquivo `tailwind.config.ts` com `gold: '#c8a96e'` (cor errada) não está sendo carregado.

**Solução:** deletar `tailwind.config.ts` e adicionar ao `globals.css` logo após `@import "tailwindcss"`:

```css
@theme {
  --color-ameno-black:    #0a0a0a;
  --color-ameno-white:    #ffffff;
  --color-ameno-off-white:#e8e8e0;
  --color-ameno-gray:     #666666;
  --color-ameno-dark:     #2a2a2a;
  --color-ameno-border:   #222222;
  --color-ameno-red:      #E63B2E;
}
```

---

### Bug 4 — Placeholders do Supabase com `published = true`

Foram inseridos 5 projetos com fotos do Unsplash como se fossem portfólio real.

Rodar no Supabase SQL Editor:
```sql
UPDATE public.projects SET published = false;
```

---

## Páginas a criar (em ordem de prioridade)

### 1. `src/app/page.tsx` — Home

Importar e compor na ordem:
```tsx
<HeroSection />      // hero com cotas interativas
<Marquee />          // faixa de texto rolando
<ProjectScroll projects={projects} />  // projetos do Supabase (published=true)
<PluginsTeaser />    // teaser da seção de plugins
```

Buscar projetos do Supabase no server component:
```ts
const { data: projects } = await supabase
  .from('projects')
  .select('slug, title, category, location, year, cover_url')
  .eq('published', true)
  .order('order_index')
```

---

### 2. `src/app/plugins/page.tsx` — Loja

Formulário pay-what-you-want:
- Input de valor (mínimo R$5,00, máximo livre)
- Descrição do Ameno Cotas (texto placeholder: "Plugin para 3ds Max — gera cotas automaticamente por layer com render integrado. Compatível com 3ds Max 2024–2026 e Corona 12+")
- Botão → POST `/api/checkout` → redireciona para URL Stripe
- Tratar erro de valor mínimo

---

### 3. `src/app/conta/page.tsx` — Área do cliente

Por enquanto: tela simples.
- Se `?success=true` na URL: mostrar "Compra realizada! Obrigado pelo apoio."
- Caso contrário: "Área do cliente — em breve."

---

### 4. `src/app/sobre/page.tsx` — Sobre

Placeholder:
- Nome: Octávio Oliveira
- Áreas: arquitetura, visualização arquitetônica, ArchViz, produtos, interiores, BIM
- Localização: Recife, Brasil
- Texto: placeholder indicando que o usuário vai preencher depois

---

### 5. `src/app/api/webhooks/stripe/route.ts` — Webhook

```ts
// Recebe eventos do Stripe e registra compras no Supabase
// Evento principal: checkout.session.completed
// Ação: INSERT na tabela purchases com status = 'completed'
// Usar stripe.webhooks.constructEvent() para verificar assinatura
// Retornar 200 mesmo em eventos ignorados (evita retry do Stripe)
```

---

## Efeitos de scroll aprovados pelo usuário

Implementar com GSAP + ScrollTrigger (Lenis já está configurado):

1. **Hero** — texto stagger já implementado no HeroSection.tsx
2. **Cotas** — reação ao mouse já implementada
3. **Projetos** — scale reveal + parallax já implementado no ProjectScroll.tsx
4. **Marquee** — já implementado
5. **Navbar hide/show** — já implementado
6. **Linha vermelha animada** — na seção de plugins, a linha vermelha se desenha da esquerda para a direita conforme entra na viewport (usar ScrollTrigger + clipPath ou scaleX)
7. **Texto word-by-word** — na seção plugins, "Ferramentas para arquitetos." revela palavra por palavra

---

## Componente PluginsTeaser a criar

```tsx
// src/components/plugins/PluginsTeaser.tsx
// Seção escura com:
// - Título grande: "Ferramentas para arquitetos."
// - Linha vermelha animada abaixo (ScrollTrigger)
// - Subtexto: "Ameno Cotas — Plugin para 3ds Max"
// - Botão vermelho: "Ver plugins →" → href="/plugins"
```

---

## Regras de acessibilidade mínimas a implementar

- `cursor: none` no body → adicionar `@media (pointer: coarse) { cursor: auto }` (mobile/touch)
- Todas as animações → envolver em `@media (prefers-reduced-motion: no-preference)` ou checar via JS `window.matchMedia`
- SVG das cotas → adicionar `aria-hidden="true"`
- Logo SVG no Navbar → `alt="ameno"` já está, manter
- Botões sem texto → adicionar `aria-label`

---

## Supabase — schema já no banco

```sql
-- Tabelas existentes:
public.projects    -- portfólio (RLS ativo, leitura pública para published=true)
public.purchases   -- compras Stripe (RLS ativo)
```

---

## Critérios para considerar cada fase concluída

**Fase 0 — Bugs corrigidos:**
- `npm run build` passa sem erros
- `npm run dev` abre sem crash

**Fase 1 — Site navegável:**
- Home carrega com Hero + Marquee + Projetos
- `/plugins` tem formulário funcional
- `/sobre` e `/conta` têm conteúdo placeholder
- Funciona em mobile (sem cursor, sem cotas no touch)

**Fase 2 — Compra funciona:**
- Formulário → Stripe Checkout → sucesso → `/conta?success=true`
- Webhook registra no Supabase
- `npm run build` passa

---

## O que NÃO fazer

- Não tocar em `D:\Ameno\_tools` (repositório do plugin — outro agente trabalha lá)
- Não commitar `.env.local`
- Não usar a paleta gold `#c8a96e` em nenhum lugar
- Não inventar decisões de negócio: se não estiver neste documento, deixar placeholder e anotar como pendente do usuário
- Não marcar projetos placeholder como `published = true`

---

## Commit após cada fase

```bash
git add -A
git commit -m "feat: [descrição curta]"
git push origin main
```
