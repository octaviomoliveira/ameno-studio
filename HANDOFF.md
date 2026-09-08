# HANDOFF — ameno.studio para o Codex

Este documento é o briefing completo para continuar a implementação do site `ameno.studio`. Leia tudo antes de tocar em qualquer arquivo.

> Para qualquer trabalho de direção de arte ou reorganização da home, seguir primeiro o `PLANO_VISUAL.md`, que contém a narrativa em oito capítulos e as referências visuais aprovadas.

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

## Estado atual — 2026-09-08

O checkout, o formulário de `/plugins`, a home editorial em cinco capítulos, `/sobre`, `/conta`, o schema de licenças, `POST /api/verify` e o webhook já foram implementados no checkout local. O hero combina grid, cotas e um campo abstrato de interferência; o portfólio tem índice e painéis fullbleed. `npm run build`, lint e os testes locais das rotas passam. A `SUPABASE_SERVICE_ROLE_KEY` já está no `.env.local` (não exibir, commitar ou enviar esta chave); a verificação local alcançou o banco e respondeu `not_found` para um token fictício.

---

## Referências visuais — ler antes de montar qualquer página

### Sites de referência de scroll e layout

| Site | O que importa |
|---|---|
| [elephant-skin.com](https://www.elephant-skin.com) | **Referência principal.** Scroll cinemático, seções pinadas, fullbleed, texto que entra enquanto imagem fica parada. É o efeito mais próximo do que queremos. |
| [brickvisual.com](https://brickvisual.com) | Dark, fullbleed, o trabalho como protagonista absoluto. Imagens ocupam a tela toda. Texto mínimo. |
| [lircle.co](https://lircle.co) | Tipografia elegante, espaçamento generoso, ritmo de scroll cuidadoso. |
| [jeffmilanes.com](https://www.jeffmilanes.com) | Scroll suave, transições entre projetos, identidade forte. |

### Referências de universo de marca

Não copiar — estudar como constroem sistemas simples, reconhecíveis e culturalmente carregados:

**Urban Arts, Brain Dead, Patta, Stüssy, A24, Carhartt WIP, MUBI**

O que interessa nessas marcas: sistema visual enxuto + carga cultural + tipografia como protagonista. Nada de decoração gratuita.

### Como o conceito aparece visualmente

- **Ordem** = tipografia grotesca pesada e limpa, grid racional, precisão
- **Interferência** = o vermelho `#E63B2E` aparece como corte, ruptura, intervenção — não como decoração
- O logo tem um slash horizontal cortando toda a palavra + "O" com textura de spray
- O vermelho no site entra onde há ruptura: slash do logo, ano dos projetos, linha separadora, CTA

### Layout da home (aprovado pelo proprietário)

```
NAVBAR
  [logo com slash vermelho]         [plugins  sobre  conta]

HERO (100vh, fundo preto)
  arquitetura.
  visualização.          ← texto display, letra por letra
  ferramentas.

  [cotas SVG flutuando — reagem ao mouse]

  [ameno.studio] ← centro inferior, cinza

MARQUEE
  ─ ARQUITETURA · VISUALIZAÇÃO · PLUGINS · AMENO.STUDIO · RECIFE · ─

PROJETOS (scroll cinemático)
  Imagem fullwidth cresce do centro → fica parada → texto sobe por baixo
  Nome do projeto (branco) + Ano (vermelho)

TEASER PLUGINS
  Ferramentas para arquitetos.
  ─────────────── (linha vermelha animada)
  Ameno Cotas — Plugin para 3ds Max     [Ver plugins →]

FOOTER
  ameno.studio          contato@ameno.studio
  © Octávio Oliveira    Instagram  LinkedIn
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
NEXT_PUBLIC_MIN_AMOUNT             → 1000 (R$10,00 em centavos)
```

---

## Arquivos já criados

```
src/
  app/
    globals.css               ✅ paleta CSS variables, tipografia, cursor
    layout.tsx                ✅ root layout com Lenis + Navbar + Footer + Cursor
    page.tsx                  ✅ home com hero, portfólio placeholder e teaser de plugins
    api/
      checkout/route.ts       ✅ CRIADO MAS COM BUGS (ver seção de bugs abaixo)
      webhooks/stripe/route.ts ✅ webhook com assinatura Stripe e geração de token
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
    stripe.ts                 ✅ mínimo R$10 e sugestão R$29
public/
  brand/
    logo.svg                  ✅
    logo.png                  ✅
    symbol.svg                ✅
supabase/
  schema.sql                  ✅ schema já rodado no Supabase Dashboard
```

---

## BUGS HISTÓRICOS — correções aplicadas localmente

Os quatro problemas abaixo foram identificados no estado inicial. Os itens 1–3 foram corrigidos no código; os placeholders foram despublicados no banco e no `supabase/schema.sql`.

### Bug 1 — Backticks faltando em `src/app/api/checkout/route.ts` linhas 32–33 — resolvido

**Estado inicial (ERRADO — não compilava):**
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

### Bug 2 — Valor mínimo errado em `src/lib/stripe.ts` — resolvido

**Estado inicial:** `STRIPE_MIN_AMOUNT = 100` → R$1,00

**Correto:**
```ts
export const STRIPE_MIN_AMOUNT = 1000       // R$10,00
export const STRIPE_SUGGESTED_AMOUNT = 2900 // R$29,00 (valor sugerido exibido no input)
```

Também corrigir a mensagem de erro no checkout:
```ts
{ error: 'Valor mínimo é R$ 10,00' }
```

---

### Bug 3 — `tailwind.config.ts` está no formato v3 e será ignorado pelo Tailwind v4 — resolvido

O projeto usa Tailwind v4 que configura temas via CSS, não via JS.
O arquivo `tailwind.config.ts` com `gold: '#c8a96e'` (cor errada) não está sendo carregado.

**Solução aplicada:** `tailwind.config.ts` foi removido e os tokens foram adicionados ao `globals.css` após os imports:

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

### Bug 4 — Placeholders do Supabase com `published = true` — resolvido

Foram inseridos 5 projetos com fotos do Unsplash como se fossem portfólio real.

Aplicado no projeto e refletido no `supabase/schema.sql`:
```sql
UPDATE public.projects SET published = false;
```

---

## Páginas e próximas entregas (em ordem de prioridade)

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
- Input de valor com **R$29,00 já preenchido** como valor sugerido (editável)
- Mínimo aceito: **R$10,00** — validar no frontend antes de submeter e no backend em `/api/checkout`
- Mensagem abaixo do input: `mínimo R$ 10,00`
- Descrição do Ameno Cotas: "Plugin para 3ds Max — gera cotas automaticamente por layer com render integrado. Compatível com 3ds Max 2024–2026 e Corona 12+"
- Requisitos: 3ds Max 2024–2026, Corona 12+, Windows
- Botão vermelho → POST `/api/checkout` → redireciona para URL Stripe
- Tratar erro de valor mínimo com mensagem inline (não alert)

---

### 3. `src/app/conta/page.tsx` — Área do cliente (placeholder funcional com fluxo visual)

Por enquanto: tela simples.
- Se `?success=true` na URL: mostrar "Compra realizada! Obrigado pelo apoio."
- A página informa que a entrega automática do token ainda está sendo conectada; não promete acesso inexistente.

---

### 4. `src/app/sobre/page.tsx` — Sobre

Placeholder:
- Nome: Octávio Oliveira
- Áreas: arquitetura, visualização arquitetônica, ArchViz, produtos, interiores, BIM
- Localização: Recife, Brasil
- Texto: placeholder indicando que o usuário vai preencher depois

---

### 5. `src/app/api/webhooks/stripe/route.ts` — Webhook (implementado)

```ts
// Recebe checkout.session.completed e async_payment_succeeded.
// Verifica assinatura, pagamento BRL pago e produto ameno-cotas.
// Chama fulfill_plugin_purchase, que registra compra + licença de modo idempotente.
// Falha no Supabase retorna 500 para permitir retry do Stripe.
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

## Componente PluginsTeaser implementado

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

## Modelo de licenciamento — APROVADO

**Regra:** 1 compra = 1 licença = 1 computador. Sem compartilhamento.

**Fluxo completo:**
```
1. Compra → Stripe webhook → gera license_token único → salva no Supabase (machine_id vazio)

2. Primeiro uso do plugin (3ds Max):
   Plugin pede o token ao usuário → usuário digita
   Plugin envia: { token, machine_id } → POST /api/verify
   API: token existe e sem máquina vinculada? → vincula machine_id → retorna { valid: true }
   Plugin salva token em arquivo local

3. Usos seguintes:
   Plugin envia: { token, machine_id } → POST /api/verify
   API: token existe e machine_id bate? → { valid: true }
   machine_id diferente? → { valid: false, reason: "machine_mismatch" }
   Plugin exibe erro e não abre

4. Offline: tolerar 7 dias sem verificar (plugin usa cache local)
   Após 7 dias sem conexão: bloquear com aviso de "verificar conexão"
```

**Troca de computador:** usuário entra em contato → reset manual no Supabase (por enquanto sem automação).

---

## Supabase — schema atualizado

Schema atual já rodado (tabelas `projects` e `purchases`). Adicionar no SQL Editor:

```sql
-- Licenças geradas após pagamento
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,           -- chave que o usuário digita no plugin
    purchase_id UUID REFERENCES public.purchases(id),
    product TEXT DEFAULT 'ameno-cotas',
    machine_id TEXT,                       -- fingerprint do PC — vazio até primeiro uso
    machine_bound_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
-- Sem leitura pública — só via service role (servidor)
```

---

## Endpoints de API implementados localmente

### `POST /api/verify` — verifica licença (chamado pelo plugin)
```ts
// Body: { token: string, machine_id: string }
// Respostas:
//   { valid: true }
//   { valid: false, reason: "not_found" | "machine_mismatch" | "inactive" | "rate_limited" }
// Usar SUPABASE_SERVICE_ROLE_KEY (não a anon key) — acesso direto sem RLS
// Rate limit: máx 10 req/min por token
```

### Webhook — gera token após pagamento
```ts
// Em checkout.session.completed:
// 1. Verifica checkout e pagamento.
// 2. Gera UUID e chama a função atômica do Supabase.
// 3. A função registra purchases e licenses de forma idempotente.
// 4. E-mail/download ainda ficam para a próxima fase.
```

---

## `src/app/conta/page.tsx` — atualizado

**Fase 0 — Bugs corrigidos:**
- `npm run build` passa sem erros
- `npm run dev` abre sem crash

**Fase 1 — Site navegável:**
- Home carrega com Hero + Marquee + Projetos
- `/plugins` tem formulário funcional
- `/sobre` e `/conta` têm conteúdo placeholder
- Funciona em mobile (sem cursor, sem cotas no touch)

**Fase 2 — Compra e licença (implementada localmente):**
- Formulário → Stripe Checkout → sucesso → `/conta?success=true`
- Webhook registra compra e licença no Supabase após pagamento confirmado
- `/api/verify` alcança o Supabase em execução local e vincula a primeira máquina atomicamente
- `npm run build` passa

**Pendências da fase 2:** testar um evento real/teste do Stripe no webhook e entregar o token/arquivo ao comprador.

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
