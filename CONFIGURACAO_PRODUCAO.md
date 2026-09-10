# Configuração de produção — autenticação

Estado verificado em 2026-09-08:

- Supabase: projeto `ameno-studio` (`akiywkdwrchtufoxilmj`), região `sa-east-1`, plano Free.
- Vercel: projeto `ameno-studio`, Node.js 24, domínio principal `ameno.studio`.
- O banco e o código de autenticação já estão preparados.

## 1. Supabase Auth — URLs

Em **Authentication → URL Configuration**:

- Site URL: `https://ameno.studio`
- Redirect URLs:
  - `https://ameno.studio/auth/confirm**`
  - `http://localhost:3000/auth/confirm**`
  - `https://*-arqestudiooc-4199s-projects.vercel.app/auth/confirm**`

O caminho fica restrito ao callback de autenticação; o sufixo `**` cobre apenas os parâmetros internos usados depois de `/auth/confirm`.

## 2. SMTP e template

Este projeto Free foi criado depois da restrição de personalização dos templates com o SMTP padrão. Configure um SMTP próprio em **Authentication → Emails → SMTP Settings** antes de editar o template.

Campos necessários:

- Host SMTP
- Porta
- Usuário
- Senha
- E-mail do remetente: `octavio.oliveira@ameno.studio`
- Nome do remetente: `Ameno Studio`

Depois, abra **Magic link or OTP** e use:

- Assunto: `Seu acesso ao Ameno Studio`
- Corpo: conteúdo de `supabase/templates/magic-link-or-otp.html`

O template entrega as duas opções suportadas pelo app: código de seis dígitos e link de uso único.

## 3. Variáveis Vercel

Manter em **Production**:

- `NEXT_PUBLIC_SITE_URL=https://ameno.studio`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_MIN_AMOUNT`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Os três últimos são exclusivamente de servidor. Nunca usar o prefixo `NEXT_PUBLIC_` neles.

Para Preview, usar chaves de teste do Stripe. O mesmo projeto Supabase pode ser usado enquanto a URL de preview estiver explicitamente autorizada.

## 4. Verificação após o deploy

1. Abrir `/entrar` no domínio de produção.
2. Solicitar acesso com um e-mail real.
3. Testar o código e, em uma sessão separada, o link.
4. Confirmar redirecionamento para `/conta`.
5. Iniciar um checkout como visitante e outro autenticado.
6. Confirmar que somente a compra da conta aparece em `/conta`.
7. Conferir logs do webhook e advisors do Supabase.
