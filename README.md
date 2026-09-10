# Ameno Studio

Site institucional e área do cliente do Ameno Studio, construídos com Next.js, Supabase Auth/Database e Stripe Checkout.

## Desenvolvimento

Requisitos: Node.js 24 e npm.

1. Copie `.env.example` para `.env.local` e preencha as chaves.
2. Instale as dependências com `npm install`.
3. Inicie com `npm run dev`.
4. Abra `http://localhost:3000`.

Não registre `.env.local` ou chaves secretas no Git.

## Qualidade

- `npm run lint` — análise estática.
- `npm test` — testes das rotas de licenciamento, checkout e webhook.
- `npm run build` — build de produção.
- `npm run check` — executa as três verificações em sequência.

## Autenticação e produção

- Plano técnico: `PLANO_AUTENTICACAO.md`.
- Configuração externa: `CONFIGURACAO_PRODUCAO.md`.
- Migração consolidada: `supabase/auth.sql`.
- Template de acesso: `supabase/templates/magic-link-or-otp.html`.
