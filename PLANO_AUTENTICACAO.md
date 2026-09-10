# Plano de autenticação — ameno.studio

> Atualizado em 2026-09-08. Este plano complementa o `PLANO.md` e preserva a compra direta sem cadastro obrigatório.

## Decisão

- O login é opcional para comprar e obrigatório somente para acessar a área do cliente.
- A primeira versão usa Supabase Auth com e-mail sem senha.
- O usuário pode entrar com o código de seis dígitos ou pelo link recebido no e-mail.
- O plugin do 3ds Max continua usando o token de licença nesta fase. Login dentro do plugin fica para uma etapa futura de pareamento pelo navegador.

## Objetivos da área do cliente

- Recuperar compras realizadas como convidado.
- Consultar licenças, situação da ativação e computador vinculado.
- Disponibilizar downloads protegidos quando os arquivos finais estiverem prontos.
- Oferecer saída segura da sessão e, no futuro, solicitação de troca de computador.

## Fluxos

### Compra sem login

1. O visitante compra normalmente pelo Stripe Checkout.
2. O webhook salva o e-mail confirmado no pagamento.
3. Quando esse comprador entrar com o mesmo e-mail, as compras ainda sem proprietário serão vinculadas ao `auth.users.id` autenticado.
4. A partir do vínculo, a área da conta consulta as compras exclusivamente por `user_id`.

### Compra com login

1. A rota de checkout valida a sessão no servidor.
2. O servidor inclui o `user_id` validado na sessão Stripe e preenche o e-mail autenticado.
3. O webhook assinado registra a compra e vincula seu proprietário.

### Login

1. O usuário informa o e-mail em `/entrar`.
2. Supabase envia um código ou link de uso único.
3. O código é verificado no navegador; o link é confirmado em `/auth/confirm`.
4. A sessão é armazenada em cookies e renovada por `src/proxy.ts`.
5. `/conta` valida a identidade no servidor antes de consultar dados privados.

## Segurança

- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` ao navegador.
- Validar páginas e dados privados com `getClaims()`/`getUser()`, nunca confiar em `getSession()` para autorização.
- Manter `purchases` e `licenses` sem acesso direto para `anon` ou `authenticated`; a leitura ocorre no servidor após validar o usuário.
- Vincular compras apenas a usuários com e-mail confirmado e coincidência exata, sem distinção entre maiúsculas e minúsculas.
- Não usar `user_metadata` para decisões de autorização.
- Aplicar limite de envio de códigos, mensagens de erro genéricas e SMTP próprio antes do lançamento.
- Não armazenar tokens de licença em logs ou respostas públicas.

## Fases

### Fase A — base de autenticação

- [x] Adicionar `@supabase/ssr` com versão fixada.
- [x] Criar clientes Supabase separados para navegador e servidor.
- [x] Criar o proxy de renovação de sessão do Next.js 16.
- [x] Criar `/entrar`, confirmação por código/link e logout.
- [x] Proteger `/conta` sem bloquear o retorno público do checkout.

### Fase B — propriedade e recuperação

- [x] Adicionar `purchases.user_id` e `claimed_at`.
- [x] Criar funções server-only para vínculo por checkout e recuperação por e-mail confirmado.
- [x] Associar o `user_id` validado ao checkout quando houver sessão.
- [x] Exibir compras e licenças do usuário autenticado.
- [ ] Validar o fluxo com um e-mail real após configurar o template de autenticação.

### Fase B.1 — configuração de produção

- [x] Identificar o domínio principal e o projeto de hospedagem.
- [x] Preparar a lista restrita de URLs de redirecionamento.
- [x] Preparar o template combinado de OTP e magic link.
- [x] Documentar as variáveis por ambiente sem registrar segredos.
- [ ] Salvar as URLs no painel do Supabase.
- [ ] Configurar SMTP próprio e publicar o template.
- [x] Criar e validar um deploy de prévia com a implementação de autenticação.
- [ ] Executar o teste real de recebimento e login.

### Fase C — entrega e suporte

- [ ] Criar bucket privado e downloads assinados de curta duração.
- [ ] Entregar licença/download também por e-mail após o webhook.
- [ ] Criar solicitação auditável de troca de computador.
- [ ] Definir SMTP, remetente, textos legais e política de suporte.
- [ ] Avaliar pareamento do plugin com a conta pelo navegador.

## Configuração externa necessária

No Supabase Dashboard:

1. Manter o provedor de e-mail habilitado.
2. Definir `https://ameno.studio` como Site URL.
3. Permitir os callbacks restritos documentados em `CONFIGURACAO_PRODUCAO.md`, incluindo produção, localhost e previews da Vercel.
4. Para mostrar código de seis dígitos, incluir `{{ .Token }}` no template **Magic Link / OTP**. O link continua suportado pelo endpoint `/auth/confirm`.
5. Configurar SMTP próprio antes de abrir o login ao público.

## Critérios de aceite

- Um visitante continua conseguindo iniciar o checkout sem conta.
- Um usuário recebe e valida seu código/link, entra em `/conta` e consegue sair.
- Uma compra convidada aparece apenas para a conta que comprovou o mesmo e-mail.
- Uma compra feita autenticada já nasce vinculada ao usuário.
- Usuários não autenticados não conseguem ler compras ou licenças pela Data API.
- Build, lint, testes de rota e advisors do Supabase passam sem falhas novas.
