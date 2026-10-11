# L4-d0 — proteção contra replay após revogação

Escopo desta branch: somente o RPC `fulfill_plugin_purchase` e sua regressão
SQL. O checkout permanece suspenso. Não houve chamada ao Stripe, execução de
SQL remoto, migração de produção ou deploy.

## Contrato alterado

- Uma sessão paga nova cria compra `completed` e uma licença.
- A repetição da mesma sessão conserva ID, token e dados originais da compra.
- Se a compra existente estiver `refunded`, `suspended` ou em qualquer outro
  estado diferente de `completed`, a repetição não altera seu estado nem cria
  uma licença ativa nova. Se já houver licença, retorna seu ID sem reativá-la;
  se não houver, retorna `null` e o webhook pode confirmar o replay sem erro.
- `ON CONFLICT DO NOTHING` seguido de `SELECT ... FOR UPDATE` serializa os
  replays sobre a linha existente. O vínculo `licenses.purchase_id UNIQUE`
  continua limitando a uma licença por compra.

## Verificação e migração pendentes

O arquivo `supabase/licenses.sql` é a definição versionada do RPC, mas **não
altera por si só** uma função já instalada. `supabase/licenses.test.sql`
adiciona cenários transacionais de replay após `refunded` e `suspended`, além
de compra previamente estornada sem licença. A execução desse teste em banco
local fica pendente: neste ambiente não há Supabase CLI, `psql`, Docker ou
instância de testes aprovada. Testes de rota Node não substituem esse gate.
Os gates headless disponíveis passaram: `npm test` (3/3) e `npm run lint`.

Quando houver ambiente local isolado, gerar um arquivo com
`supabase migration new guard_refunded_purchase_replay`, copiando para ele a
definição revisada do RPC e seus `REVOKE`/`GRANT` com o fluxo oficial de
migração. Aplicar e executar `licenses.test.sql` **somente no banco local**,
checar os advisors e a lista de migrações; depois fazer revisão independente
antes de planejar a aplicação em produção. Não colar este SQL diretamente no
banco de produção nem marcar a etapa como publicada por causa do commit.

## Fora do escopo

Ainda não existem handlers de reembolso/disputa, deduplicação por ID de evento
Stripe, regra de reembolso parcial ou tratamento de eventos fora de ordem por
PaymentIntent. Uma mera mudança em `purchases.status` também não revoga por si
só o verificador atual: o fluxo de revogação deverá definir `licenses.active`
como `false` na mesma transação. Esses itens continuam como gates L4-d no
plano de entrega.

Referência de migrações:
<https://supabase.com/docs/guides/local-development/database-migrations>.
