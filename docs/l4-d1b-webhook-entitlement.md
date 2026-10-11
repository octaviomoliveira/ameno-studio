# L4-d1b — webhook Stripe, titularidade comercial e revogação

Data: 2026-10-11. **Plano de implementação; nenhuma venda habilitada.** O
checkout público continua respondendo 503. Depende da correção d0, da revisão
d1a e da migration privada de artefatos/entitlement, todos ainda isolados em
branches. Não mesclar o código da conta na `main` antes de validar/aplicar suas
colunas SQL: a página `/conta` consulta essas colunas e falharia no esquema
antigo.

## Invariantes

1. Só uma sessão Checkout **nova**, com `metadata.product=ameno-cotas` e
   `metadata.entitlement_scope=ameno-cotas-first-paid` criados pelo servidor,
   pode gerar direito da primeira versão paga. Sessões antigas não recebem
   escopo por replay; qualquer concessão histórica exige auditoria individual.
2. O evento Stripe deve ter assinatura válida sobre o corpo bruto. Confirmar
   identidade da sessão, PaymentIntent e Charge por IDs, modo live, moeda BRL,
   pagamento recebido >= 1000 centavos e status pago/succeeded. Divergência
   ou falha transitória retorna erro para retry, sem criar licença.
3. O mesmo evento tem o mesmo efeito após qualquer número de entregas; eventos
   podem chegar fora de ordem. Uma compra `suspended` ou `refunded` não volta
   automaticamente a `completed`, nem ganha licença ativa em replay.
4. **Qualquer reembolso parcial** suspende licença e download para revisão
   manual, mesmo se restarem R$ 10 ou mais. Reembolso integral marca
   `refunded`; disputa suspende. Disputa encerrada/reembolso falho não
   reativam automaticamente.
5. Download e `verify_plugin_license` usam o **mesmo** predicado comercial:
   compra `completed`, licença ativa, escopo first-paid, Stripe live,
   valor inteiro >= R$ 10 em BRL e PaymentIntent não vazio. Titularidade do
   download ainda exige usuário e e-mail confirmado iguais ao comprador.

## Incrementos e gates

### d1b-0 — integração isolada de esquema

- Partir de branch de integração separada, trazendo d0, d1a corrigida e a
  branch `feature/l4-account-download`; reconciliar as migrations sem
  backfill de `entitlement_scope`/`stripe_livemode`.
- Executar scripts SQL em PostgreSQL/Supabase isolado na ordem declarada;
  auditar compras existentes com PI duplicada/nula/vazia antes de aplicar
  índice único. Validar `service_role`, RLS e bucket privado.
- Não implantar código de `/conta` antes de aplicar e conferir a migration em
  produção. Merge na `main` pode acionar deploy automático e não é gate de
  teste seguro por si só.

### d1b-1 — autoridade transacional no banco

- Criar RPC **novo, de nome distinto** para evento pago, com ID de evento,
  identidade Stripe, escopo e `livemode`; sob o mesmo lock por PaymentIntent,
  registrar recibo e atualizar compra/licença/entitlement de modo atômico.
  Ampliar recibos idempotentes para eventos pagos. Replays devem comparar
  identidade imutável. Revogar `EXECUTE` do fulfillment antigo antes de
  usar o novo webhook; evitar RPCs ambíguas/sobrecarregadas.
- Manter `SECURITY INVOKER`, search_path explícito, grants mínimos ao
  `service_role` e RLS nas tabelas. Não expor service key ao cliente.
- Reforçar `verify_plugin_license` no banco para recusar token de compra
  antiga/teste sem escopo live. A rota `/api/verify` só devolve `verified_at`
  em resposta válida; recusa jamais renova o lease offline.

### d1b-2 — classificação no webhook assinado

| Evento snapshot assinado | Ação |
| --- | --- |
| `checkout.session.completed`, `checkout.session.async_payment_succeeded` | Confirmar sessão paga e PaymentIntent sucedido, IDs/valores/moeda/live/escopo; chamar RPC pago v2. |
| `charge.refunded` | Resolver Charge → PaymentIntent → sessão; classificar **pelo snapshot do evento**: parcial suspende, integral marca `refunded`; chamar RPC de bloqueio d1a. |
| `charge.dispute.created` | Conferir disputa → Charge → PaymentIntent → sessão; bloquear e suspender. |
| Outros eventos | Responder 2xx sem conceder direito; documentar descarte. |

- Configurar o endpoint Stripe em formato **snapshot**, compatível com
  `event.data.object`. Para Charge/Dispute, a consulta atual à API serve para
  correlacionar IDs e localizar a sessão, não para reclassificar um evento de
  reembolso antigo. Se um evento parcial for redeliverado após estorno
  integral, sua classe original precisa permanecer parcial.
- Uma sessão comprovadamente de outro produto pode ser ignorada; sessão
  ambígua, ausência transitória da API, erro SQL e divergência de identidade
  não podem receber 2xx como se tivessem sido processadas.
- O checkout futuro cria o marcador de escopo **server-side**; nunca aceita
  escopo, preço ou titularidade afirmados pelo navegador como autoridade.
  A compra permanece desabilitada nesta subetapa.

### d1b-3 — regressão e integração

- Fixtures com assinatura válida/inválida; eventos duplicados e invertidos;
  estorno parcial → integral → replay do parcial; disputa antes/depois do
  pagamento; saldo remanescente >= R$ 10; sessão antiga sem escopo; test mode;
  PI/sessão divergentes; falha Stripe/RPC; compra convidada reivindicada
  somente pelo e-mail confirmado.
- Confirmar que download e ativação recusam compras antigas, teste,
  suspensas e reembolsadas; provar que a migration não esconde contas
  existentes depois do deploy ordenado.
- Compra live controlada, e-mail, hash do ZIP protegido, instalação e
  ativação Max 2026 ficam para o gate de release, não para esta subetapa.
  O usuário adiou os testes no Max; nenhum suporte 2021–2027 é declarado.

## Fontes primárias

- [Stripe: webhooks e ordem/duplicatas](https://docs.stripe.com/webhooks)
- [Stripe: objeto Charge](https://docs.stripe.com/api/charges/object)
- [Stripe: eventos](https://docs.stripe.com/api/events/types)
- [Stripe: listagem de Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/list)
- [Supabase: Database Functions](https://supabase.com/docs/guides/database/functions)
- [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
