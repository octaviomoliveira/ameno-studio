# L4 — gate PostgreSQL isolado antes de migração comercial

Estado em 2026-10-11: **não executado**. Este é um roteiro de validação, não
uma autorização para aplicar SQL em produção ou abrir o checkout. A branch
integrada é `feature/l4-webhook-entitlement` (`70dde25` neste checkpoint).
O parser SQL, os testes Node, lint, TypeScript e build não substituem a
execução de funções, permissões, RLS e locks em PostgreSQL.

## Ambiente e proteção

1. Usar uma instância **descartável** do Supabase local, com CLI, Docker e
   `psql` disponíveis. Não usar `akiywkdwrchtufoxilmj` ou qualquer URL de
   produção. O checkout não contém `supabase/config.toml`; iniciar o stack
   em um diretório temporário novo evita a aplicação automática das
   migrations da branch antes dos arquivos-base não versionados.
2. No diretório temporário, executar `supabase init`, `supabase start` e
   `supabase status`. Copiar a URL **local** do banco apenas para a sessão de
   teste. Antes de cada `psql`, confirmar que o host da URL é `localhost` ou
   `127.0.0.1` e que a instância é descartável. Nunca incluir senhas/URLs
   reais em logs, Markdown ou Git.
3. Usar um checkout fixado no SHA da branch integrada e um log com SHA,
   versão do PostgreSQL/Supabase CLI, arquivo executado, código de saída e
   resultado das asserções. Parar no primeiro erro; não corrigir fixtures
   de produção para fazer o teste passar.

## Ordem obrigatória

Executar cada arquivo-base/migration em sua **própria** transação com
`psql -X -v ON_ERROR_STOP=1 -1 -d <URL_LOCAL> -f <ARQUIVO>`:

1. `supabase/schema.sql`
2. `supabase/licenses.sql`
3. `supabase/auth.sql`
4. `supabase/migrations/20261011161301_release_artifacts_private_download.sql`
5. `supabase/migrations/20261011162549_l4_d1a_payment_event_guards.sql`

Então executar `supabase/licenses.test.sql` e
`supabase/payment_event_guards.test.sql` **sem `-1`**: ambos já abrem `BEGIN`
e terminam em `ROLLBACK`. Na mesma sessão `psql`, ativar asserções com
`-c "SET plpgsql.check_asserts = on"` antes de `-f <TESTE>` e manter
`-X -v ON_ERROR_STOP=1`. Uma falha fecha a conexão e reverte a transação
do teste. Registrar separadamente o exit code dos dois arquivos.

Depois aplicar, também em transação própria:

6. `supabase/migrations/20261011171230_l4_d1b_paid_entitlement.sql`

Executar `supabase/paid_entitlement.test.sql` do mesmo modo, sem `-1` e
com asserções ligadas. Não mover os testes do RPC v1 para depois do passo 6:
a d1b revoga `EXECUTE` do `service_role` no RPC antigo; testar v1 nessa
altura não representa o contrato final.

## Casos adicionais ainda sem prova

- Artefato privado: adicionar teste SQL de `release_artifacts`, bucket
  privado, RLS e negação de leitura/escrita para `anon` e `authenticated`;
  confirmar acesso administrativo mínimo e nenhuma URL pública. A migration
  de artefatos pressupõe `storage.buckets`, portanto PostgreSQL puro sem o
  esquema Supabase não basta.
- Pré-migração: montar fixtures descartáveis para PI duplicada/inválida e
  linhas legadas antes da d1a; verificar que a migration falha fechada ou
  preserva os dados conforme o contrato, sem backfill comercial implícito.
  As duas compras antigas reais do projeto são testes do proprietário, mas
  **não** devem ser copiadas para o ambiente local nem alteradas em produção.
- RPC pago v2: cobrir compra `pending` anterior ao webhook, correção de
  titular/PI e replay posterior; o teste v1 existente não prova a nova
  função. Cobrir também reembolso/disputa antes do pago e replay depois do
  bloqueio, confirmando que licença/token persistidos não mudam.
- Concorrência: em duas sessões separadas, disparar pagamento/reembolso do
  mesmo PaymentIntent em ordens opostas. Verificar serialização pelo lock,
  um recibo por `event_id`, token estável, estado final bloqueado e nenhum
  acesso transitório a download/ativação depois do bloqueio. Repetir com
  IDs de evento iguais e payload divergente; a divergência deve falhar.
- Papel real: exercer RPCs com `SET LOCAL ROLE service_role`, conferir os
  grants finais e provar que `anon`/`authenticated` não executam funções
  administrativas nem leem recibos/bloqueios. `SELECT FOR UPDATE` sobre
  `stripe_event_receipts` não deve voltar: `service_role` só possui
  `SELECT`/`INSERT` nessa tabela.

## Gate de saída

- [ ] Suite SQL v1 e v2 passou no Supabase local isolado, com exits 0.
- [ ] Testes de Storage/RLS, legado e concorrência foram adicionados e
      passaram; grants foram exercidos sob os papéis corretos.
- [ ] Revisão independente do resultado e da ordem de migração aprovada.
- [ ] Só então planejar migração de produção com histórico, backup e janela
      de reversão. A migration deve preceder qualquer deploy que consulte
      `entitlement_scope`/`stripe_livemode`; o checkout continua HTTP 503.

Nenhum item acima está marcado como concluído por esta auditoria. Para a
release completa ainda faltam pacote protegido testado no Max 2026,
ativação, e-mail transacional, artefato privado, Stripe live e compra
controlada ponta a ponta.
