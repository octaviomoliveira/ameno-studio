# L4-d1 — estornos, disputas e replays do Stripe

Estado em 2026-10-11: d1a está implementada na branch isolada
`feature/l4-payment-event-guards` (`70f9ec3`), mas sem execução dos testes SQL
em PostgreSQL, migration aplicada, merge ou deploy. O checkout público segue
desabilitado (POST `/api/checkout` responde 503). A proteção inicial por
sessão e por e-mail do comprador está na branch predecessora
`feature/l4-refund-replay-guard` (`62014dc`). Nenhum pagamento ou SQL de
produção foi executado aqui; o webhook d1b ainda não foi integrado.

## Problema e invariantes

O webhook atual aceita apenas eventos de Checkout pago. Um estorno ou disputa
não altera `purchases.status` nem `licenses.active`. A chave única existente
é a sessão do Checkout, não o PaymentIntent (PI). Um replay pago após uma
revogação não deve restaurar acesso, e uma revogação que chega antes do
Checkout pago precisa ser lembrada. Só responder HTTP 2xx depois que o efeito
do evento estiver confirmado na mesma transação que seu recibo idempotente.

Invariantes: uma PI paga gera no máximo um direito; estados `refunded` e
`suspended` não se tornam `completed` automaticamente; licença e download
exigem compra `completed` **e** licença `active`; um evento duplicado não
repete mutação; dados de outro produto/ambiente não afetam Ameno Cotas.

## Incrementos e gates

### d1a — banco e correlação, sem webhook novo

1. Auditar PIs duplicadas e nulas no banco antes de criar índice único parcial
   em `purchases.stripe_payment_intent` (`IS NOT NULL`). Exigir PI em compra
   paga; se o evento assinado não trouxer PI, recuperá-la no Stripe ou falhar
   com erro repetível, sem emitir licença.
2. Criar migration versionada para `stripe_event_receipts` (ID do evento como
   PK, tipo, objeto, PI, resultado, ambiente, horário) e `payment_blocks`
   (PI, tipo, ID do objeto, origem; único por fato). Não armazenar payload
   completo nem PII desnecessária. RLS ativa, acesso explícito apenas para
   `service_role`; nenhuma leitura pública.
3. Registrar bloqueios mesmo sem linha de compra: não usar FK obrigatória de
   `payment_blocks` para `purchases`. Serializar todos os caminhos pela mesma
   PI, na ordem PI → compra → licença, com lock transacional. Recibo do evento,
   bloqueio, status da compra e `licenses.active=false` são atômicos.
4. Atualizar o RPC de fulfillment para consultar bloqueios sob o mesmo lock:
   refund/disputa anteriores ao evento pago produzem compra revogada, sem
   licença ativa. Divergência de PI/sessão deve falhar com diagnóstico, não
   gerar outro token. Testar em PostgreSQL local duas sessões concorrentes,
   falha no meio da transação e replay. Não executar SQL de produção neste gate.

### d1b — webhook assinado e classificação correta

1. Manter verificação Stripe do corpo bruto/assinatura. Tratar Checkout pago,
   estorno integral e disputa criada; observar eventos posteriores de disputa
   e reembolso para auditoria, **sem reativação automática**.
2. Resolver PI do objeto de Stripe; se vier ausente, buscar o Charge/Refund
   apropriado. Validar produto, ambiente, moeda e correspondência com a
   sessão/compra antes de mutar. Erro transitório da API ou do RPC devolve
   5xx para retry; evento comprovadamente estranho é registrado/ignorado com
   razão, nunca associado a uma compra por suposição.
3. `charge.refunded` não significa necessariamente estorno integral. Classificar
   usando `amount_refunded` e `amount` do **snapshot assinado do evento**, não
   o estado atual do Charge consultado pela API: um replay de evento parcial
   após reembolso integral deve continuar sendo classificado como parcial.
   A consulta à API serve apenas para correlação de identidades. Reembolso
   integral marca `refunded`; qualquer reembolso parcial marca `suspended`
   para revisão manual, conforme decisão do proprietário em 2026-10-11,
   independentemente do saldo restante.
   Disputa criada também suspende antes da decisão final. Não usar
   `event.created` como ordem confiável.
4. Testes de rota: assinatura inválida, evento repetido, IDs diferentes do
   mesmo fato, PI ausente, outro produto, API/RPC indisponível, estorno antes
   e depois do pago, disputa antes/depois do pago e estorno parcial, inclusive
   saldo restante acima de R$ 10. Gate:
   webhook só responde 2xx após commit do efeito correto.

### d1c — defesa em profundidade e operação

1. O verificador de licença e a rota de download devem exigir simultaneamente
   `purchase.status='completed'` e `licenses.active=true`. Preservar a mesma
   ordem de locks usada por refund/fulfillment para evitar deadlock.
2. A conta deve diferenciar `PROCESSANDO`, `ATIVA`, `SUSPENSA` e
   `REEMBOLSADA`; não mostrar token/botão de download como utilizável quando
   revogado. Uma URL de Storage já assinada pode continuar válida durante
   seu curto TTL, e um cliente offline pode manter o lease local por até sete
   dias; documentar esses limites, sem prometer revogação instantânea.
3. Rodar migrations e testes transacionais em projeto local isolado, revisar
   grants/advisors, simular eventos no Stripe em ambiente de teste e criar
   reconciliação/alertas. Fazer revisão independente antes de produção. A
   abertura da loja depende também do pacote protegido, ativação L3, entrega,
   e-mail e teste real no Max 2026, que o proprietário adiou.

## Decisão comercial de reembolso parcial

O proprietário decidiu em 2026-10-11: **qualquer reembolso parcial suspende a
licença para revisão manual**, mesmo quando o valor restante é pelo menos
R$ 10. Revisão favorável, disputa encerrada ou reembolso falho não reativam
automaticamente; um procedimento de suporte auditável ainda precisa ser
definido antes da abertura da loja.

## Referências primárias

- [Stripe — webhooks: duplicatas e ordem](https://docs.stripe.com/webhooks)
- [Stripe — tipos de evento](https://docs.stripe.com/api/events/types)
- [Stripe — objeto Charge](https://docs.stripe.com/api/charges/object)
- [Stripe — Refund](https://docs.stripe.com/api/refunds/object)
- [Stripe — Dispute](https://docs.stripe.com/api/disputes/object)
- [Supabase — funções de banco](https://supabase.com/docs/guides/database/functions)
- [Supabase — grants e RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
