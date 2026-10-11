# L4-d1b — integração técnica isolada, não liberada

Data: 2026-10-11. Branch `feature/l4-webhook-entitlement`, baseada em
`feature/l4-payment-event-guards` e integrada a
`feature/l4-account-download`. **Não mesclada à main, sem deploy, sem
migration aplicada, sem venda habilitada.** `POST /api/checkout` continua
HTTP 503 e nenhum artefato foi publicado.

## O que está implementado na branch

- Webhook mantém corpo bruto, assinatura Stripe e endpoint snapshot.
  `checkout.session.completed` e `async_payment_succeeded` exigem
  produto/escopo no metadata da sessão, modo live, BRL, mínimo de R$ 10,
  PaymentIntent sucedido e valor efetivamente recebido igual ao total
  assinado. Sessões históricas sem escopo e eventos teste não criam direito.
- RPC novo `fulfill_plugin_purchase_v2` registra recibo pago e
  compra/licença sob lock por PaymentIntent; o antigo RPC de sete argumentos
  perde `EXECUTE` do `service_role`. O mesmo ID de evento com payload
  divergente falha. Replays preservam token e estados terminais.
- A migration d1a integrada remove `FOR UPDATE` da leitura do recibo
  imutável: `service_role` tinha apenas `SELECT`/`INSERT` nessa tabela,
  enquanto PostgreSQL exige `UPDATE` também para `SELECT FOR UPDATE`.
  O lock advisory por PI e a PK de `event_id` preservam serialização.
- `charge.refunded` usa `amount_refunded` e `amount_captured` **do
  snapshot assinado**: parcial suspende para revisão manual, integral marca
  `refunded`. O Charge consultado depois serve apenas para correlacionar
  PI/sessão. Um replay antigo parcial após o integral não reclassifica o
  evento nem reativa acesso. `charge.dispute.created` suspende; fechamento
  ou falha de reembolso não reativa automaticamente.
- Ativação SQL exige o mesmo predicado comercial usado no download:
  `completed`, licença ativa, escopo `ameno-cotas-first-paid`, Stripe
  live, BRL, valor >= 1000 centavos, PI não vazio e produto correto. O
  download ainda exige usuário e e-mail confirmado iguais ao comprador.
- A anexação opcional da compra à conta permanece após o RPC pago, em
  operação separada. Falha devolve 5xx para retry; a operação SQL paga
  idempotente não troca token. Nenhum token aparece no webhook.

## Verificações feitas

- `npm test`: 15/15 testes de rota, incluindo assinatura real, legacy/test,
  divergência PI/Checkout/Charge, falha Stripe/SQL, disputa, reembolso
  parcial → integral → replay parcial e compra sem login.
- `npm run lint` e `tsc --noEmit`: passaram.
- `npm run build`: passou com valores **fictícios** de ambiente (sem
  chamadas à produção). Sem `STRIPE_SECRET_KEY` local o build falha na
  avaliação de `src/lib/stripe.ts`, não por erro de código.
- Migration e arquivo `paid_entitlement.test.sql`: parse sintático com
  pglast 8.5. **Os testes SQL não foram executados em PostgreSQL**, logo
  comportamento transacional, grants, locks e integração RLS ainda não
  estão comprovados.

## Gates obrigatórios antes de qualquer merge/deploy

1. Rodar bootstrap + migrations na ordem `schema.sql`, `licenses.sql`,
   `auth.sql`, `20261011161301_release_artifacts_private_download.sql`,
   `20261011162549_l4_d1a_payment_event_guards.sql` em PostgreSQL isolado.
   Nesse ponto, executar os testes legados `licenses.test.sql` e
   `payment_event_guards.test.sql` (ainda cobrem o RPC v1). Depois aplicar
   `20261011171230_l4_d1b_paid_entitlement.sql` e executar
   `paid_entitlement.test.sql`; revisar advisors, RLS, grants e duas
   transações concorrentes sobre a mesma PI. Não executar os testes do RPC
   v1 após sua revogação como se fossem o contrato final.
2. Auditar as compras e licenças ativas pré-existentes que o banco
   de produção mostra sem `entitlement_scope`/`stripe_livemode`.
   Não fazer backfill automático. Se forem clientes reais, definir e testar
   tratamento individual para não cortar acesso por surpresa; se forem
   testes, revogar/encerrar com trilha de auditoria. A migration d1b faria
   `verify_plugin_license` recusá-las até essa decisão. O bucket de releases
   ainda não existe na produção; confirmar a migration e as políticas de
   Storage antes de qualquer arquivo.
3. Confirmar no Stripe endpoint **snapshot** e versão de API; verificar
   em ambiente de teste eventos pagos, refund parcial/integral e disputa
   com entrega duplicada/invertida. API ou banco indisponível deve produzir
   non-2xx para retry, nunca concessão por suposição.
4. Definir criação futura da sessão Checkout com metadata de escopo
   **server-side** e preço/mínimo verificados, sem abrir o POST 503 antes
   de pacote protegido, e-mail, ativação Max 2026 e compra controlada.
5. Aplicar migrations antes de código que consulta colunas novas. Merge na
   main pode disparar deploy automático; não usar merge como teste. Release
   de Max 2021–2027 permanece fora do primeiro alvo.

Fontes: [Stripe webhooks](https://docs.stripe.com/webhooks),
[Stripe Charge](https://docs.stripe.com/api/charges/object),
[Stripe Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/list),
[Supabase Database Functions](https://supabase.com/docs/guides/database/functions).
