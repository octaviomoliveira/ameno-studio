# L4-d1a — guardas de pagamento no banco (branch isolada)

Estado: implementação SQL para revisão, **não aplicada em nenhum banco**.
Checkout público permanece 503. Esta branch deriva exclusivamente de
`origin/feature/l4-refund-replay-guard` (`62014dc`) e depende do guard d0 e de
`supabase/auth.sql`. A migration é independente da migration paralela de
`release_artifacts`: não consulta nem modifica artefatos; sua ordem de merge
não é pressuposta.

A branch de download L4-b adiciona `purchases.entitlement_scope` e
`purchases.stripe_livemode` nullable para excluir compras legadas/teste do
produto pago. Esta migration d1a não depende desses campos nem os preenche.
Na integração d1b, somente o fulfillment de um pagamento Stripe assinado e
validado deve atribuir `ameno-cotas-first-paid` e o `livemode` verdadeiro;
**não** aplicar default nem backfill amplo que concederia acesso a registros
antigos. A rota de download exigirá ainda PI, moeda BRL e valor mínimo.
O `verify_plugin_license` desta d1a ainda verifica apenas
`status=completed` + `licenses.active`; **antes de abrir vendas**, integrar a
migration de `entitlement_scope`/`stripe_livemode` e reforçar também o RPC de
verificação para negar tokens antigos/teste sem escopo pago e `livemode=true`.

## Escopo

- A migration versionada
  `supabase/migrations/20261011162549_l4_d1a_payment_event_guards.sql`
  exige o schema existente (`schema.sql`, `licenses.sql`, `auth.sql`) e falha
  se houver PaymentIntents duplicados, vazios, fora do formato `pi_` +
  caracteres alfanuméricos, ou compras completas/licenciadas sem identidade e
  metadados pagos mínimos. Conferir tais dados e reconciliá-los manualmente
  antes de qualquer aplicação; não inventar PI nem preencher dados por
  conveniência.
- `purchases.paid_confirmed_at` é nulo antes da primeira confirmação paga.
  A migration congela registros legados `completed` ou com licença somente
  após o preflight; nesses registros o timestamp é **da migração**, não a
  data histórica do pagamento Stripe. Uma compra terminal antiga sem licença
  e sem marcador não é automaticamente assumida como refund-before-paid:
  primeiro pagamento tardio falha fechado e exige reconciliação manual.
  O trigger `purchases_paid_metadata_immutable` impede que código posterior
  altere o marcador ou PI, sessão, valor, moeda, e-mail e produto após a
  primeira confirmação; estado, owner e revogação continuam mutáveis.
- `purchases.blocked_while_pending_at` começa nulo e só é escrito pelo RPC
  quando uma compra **ainda pending** é levada a `suspended/refunded` por
  um bloqueio. O trigger preserva essa origem; um bloqueio novo aplicado a
  uma linha terminal histórica não a torna elegível para receber os dados
  de um pagamento tardio. O fallback de terminal sem
  `paid_confirmed_at` requer **ambos**: esse marcador de origem e o
  `payment_block` correlato. Sem isso, falha fechado para revisão manual.
- O índice único parcial em PI impede duas compras pelo mesmo pagamento.
  `stripe_event_receipts` deduplica por ID de evento; `payment_blocks` retém
  fatos por PI/tipo/objeto, inclusive se a compra ainda não existe. Ambos
  têm RLS e acesso somente de `service_role`, sem payload completo ou PII.
- `record_plugin_payment_block` recebe fatos previamente validados pelo
  webhook assinado (que **ainda não foi implementado**), trava a PI e grava
  recibo/bloqueio/status/`licenses.active=false` na mesma transação.
  `partial_refund` e `dispute` levam a `suspended`; `full_refund` leva a
  `refunded`. `refunded` nunca regride por evento parcial posterior.
- `fulfill_plugin_purchase` exige PI e usa o mesmo lock antes de criar compra
  ou licença. Também exige e-mail pago presente, até 320 caracteres e com
  formato básico plausível (`local@domínio.extensão`) **antes** de gravar
  `paid_confirmed_at`; e-mail nulo/vazio/malformado causa erro e não cria
  compra ou licença. O webhook fará retry ou exigirá reconciliação manual;
  não se deve selar uma compra impossível de reivindicar pela conta. Um
  bloqueio prévio cria a compra suspensa/reembolsada, sem
  token. Se já existir linha `pending` provisória, o bloqueio limpa seu dono;
  o **primeiro** evento pago posterior, mesmo sobre `suspended/refunded`,
  grava atomicamente PI/sessão, valor, moeda, e-mail e produto autoritativos,
  limpa novamente `user_id/claimed_at` e sela `paid_confirmed_at`. O estado
  terminal permanece e nenhuma licença é criada. Replays divergentes não
  sobrescrevem os dados pagos selados; PI/sessão conflitantes falham.
  `verify_plugin_license` exige compra `completed` além de licença ativa,
  travando compra antes de licença para acompanhar a ordem da revogação.
- Qualquer reembolso parcial suspende até revisão manual, ainda que o saldo
  continue acima de R$ 10. O fechamento favorável de disputa ou falha de
  reembolso não reativa automaticamente a licença.

## Limites e gates

O RPC de bloqueio **não prova** sozinho que um evento é Stripe, pertence ao
produto, ao ambiente e à sessão corretos. Somente um handler d1b que valide
assinatura, consulta Stripe e correlação de PI poderá invocá-lo. O webhook
atual continua ignorando refund/dispute; este commit não suspende compras
reais por si só. A tabela de recibos cobre eventos de bloqueio neste
incremento; o recibo de evento de Checkout pago ficará para d1b.
Para `charge.refunded`, d1b deve classificar parcial/integral pelo **snapshot
assinado** do próprio `event.data.object` (valor capturado, valor já
reembolsado e `refunded`), não pela Charge atual consultada depois. Uma
consulta posterior pode observar outro reembolso e reclassificar o replay do
mesmo event ID, violando a identidade idempotente do recibo.

Os testes `supabase/licenses.test.sql` e
`supabase/payment_event_guards.test.sql` requerem PostgreSQL/Supabase local
com os scripts aplicados e devem terminar em `ROLLBACK`; **não foram
executados** neste ambiente, que não dispõe de Postgres local aprovado.
O parser `pglast 8.5` aceitou a sintaxe SQL e PL/pgSQL da migration e dos
dois testes; `npm test` passou (3/3) e `npm run lint` passou. Essas verificações
estáticas **não** substituem a execução transacional do PostgreSQL.
A regressão nova cobre compra `pending` com PI/owner/e-mail/valor falsos →
reembolso parcial → confirmação paga tardia → suspensão sem licença, dados
pagos corretos e dono limpo → replay divergente sem sobrescrita. O teste
`licenses.test.sql` cobre replay de compra `completed` selada e recusa de
linha terminal antiga de proveniência desconhecida.
Outra regressão rejeita e-mail nulo/vazio/malformado sem criar compra/licença,
aceita um e-mail válido, e verifica que um bloco novo sobre terminal legado
não falsifica a origem `pending`.
Antes de promover: executar a migration e os dois testes em banco local
isolado, duas sessões concorrentes com a mesma PI, falha transacional e
`SET LOCAL ROLE service_role`; rodar advisors e revisar privilégios. Depois,
revisão independente. Não aplicar em produção nem abrir o checkout enquanto
d1b, entrega, licença e pacote protegido faltarem.

Uma revogação só impede verificações online após o commit. O cliente já
offline pode conservar o lease por até sete dias, e uma URL de download já
assinada continua válida pelo TTL restante.
