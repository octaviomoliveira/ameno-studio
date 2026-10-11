# Entrega paga do Ameno Cotas — primeiro release Max 2026

Data: 2026-10-11. O checkout permanece suspenso. O webhook Stripe atual cria
uma licença, mas não entrega arquivo, e a conta ainda mostra um placeholder.
Nenhum ZIP foi publicado nem pagamento realizado nesta etapa.

## Riscos verificados no código atual

- `fulfill_plugin_purchase` reescreve `purchases.status='completed'` em todo
  replay do webhook. Antes de suportar estorno/disputa, isso deve impedir
  retorno de um estado terminal para `completed`.
- Não há tabela de artefato, bucket privado, rota de download nem outbox de
  e-mail. O webhook declara explicitamente que e-mail é trabalho futuro.
- O `success` do checkout não prova pagamento. Compras convidadas já podem ser
  associadas à conta mediante confirmação do mesmo e-mail, mas uma falha de
  vinculação precisa permanecer recuperável sem revelar a compra a terceiros.
- Uma URL assinada de armazenamento ainda pode funcionar durante seu curto
  prazo após revogação. Não prometer link de uso único ou revogação instantânea
  de um arquivo já baixado.

## Incrementos com gates

### L4-a — artefato e armazenamento, sem liberação pública

1. Aceitar somente ZIP Max 2026 gerado do build protegido aprovado: nome
   imutável, versão, tamanho, SHA-256, hash do commit-fonte privado e relatório
   de auditoria de fontes do ZIP extraído.
2. Criar `release_artifacts` no Supabase com produto/versão/ano/caminho/hash/
   estado `staged|published|withdrawn`. Ativar RLS e conceder acesso ao
   `service_role` de modo explícito, sem `GRANT` para `anon` ou `authenticated`;
   a exposição automática de tabelas novas pela Data API não é presumida.
   Usar bucket Storage **privado**, sem acesso direto público.
3. Não pôr ZIP em `public/` nem servir o GitHub privado. `staged` nunca produz
   URL. Gate: acesso anônimo ao objeto negado, hash e inventário conferidos.

### L4-b — acesso por compra legítima

1. Criar rota server `src/app/api/download/[releaseId]/route.ts`. Autenticar
   com `getUser()`, exigir e-mail confirmado e compra associada ao usuário,
   `status=completed`, produto/ano compatíveis e licença `active=true`.
2. Resolver caminho do objeto somente pelo banco, nunca de parâmetro livre;
   assinar URL por aproximadamente 60 segundos. Resposta privada com
   `Cache-Control: private, no-store` e `Referrer-Policy: no-referrer`.
3. Mostrar em `/conta` botão, versão/ano e SHA-256 em lugar do placeholder.
   O link é gerado no clique, não na renderização da página. Gate: usuários
   diferentes, convidado não reivindicado e licença inativa recebem recusa.

### L4-c — compra convidada e e-mail

1. Manter compra sem cadastro. Após o pagamento, orientar acesso com o mesmo
   e-mail confirmado no checkout; redirect `success` jamais dá acesso direto.
   O proprietário escolheu em 2026-10-11 enviar acesso por e-mail à área da
   conta e gerar o link de download somente após o login. Não enviar link
   direto para o ZIP no e-mail.
2. Criar outbox transacional e retentativas para mensagem idempotente; não
   enviar token de licença nem URL assinada por e-mail. Falha de envio não
   revoga acesso pela conta.
3. `CONFIGURACAO_PRODUCAO.md` prevê o remetente
   `Ameno Studio <octavio.oliveira@ameno.studio>` para Auth, enquanto
   `contato@ameno.studio` é contato público. O provedor/host SMTP continua
   sem registro de configuração concluída. Confirmar sua configuração,
   SPF/DKIM/DMARC e entrega real antes de ativar a venda. Gate: evento
   duplicado não duplica compra, licença ou
   comunicação; endereço diferente não toma posse da compra.

### L4-d — estorno, disputa, replay e ordem dos eventos

1. Registrar IDs de eventos Stripe de modo idempotente. Não presumir ordem
   entre confirmação, reembolso e disputa; manter bloqueio por PaymentIntent.
2. Tornar `fulfill_plugin_purchase` monotônico: replay nunca reativa uma compra
   já suspensa/estornada. Reembolso integral e disputa suspendem download e
   `licenses.active`; reembolso parcial requer regra comercial explícita.
3. E-mail é assíncrono, fora do sucesso do webhook. Uma falha no envio não
   força nova compra. Gate: eventos duplicados/invertidos e reembolso antes
   do `checkout.session.completed` não reativam acesso.

### L4-e — integração e abertura da loja

Testes de rota/SQL com dados sintéticos; depois compra controlada em modo
apropriado → webhook → login por e-mail → download → hash → instalação e
ativação no Max 2026 → estorno/revogação. O proprietário adiou testes e
instalação no Max; o checkout continua 503 até esse gate e o pacote protegido.

## Decisões ainda necessárias

- Provedor SMTP transacional, validação do remetente previsto e texto final
  da mensagem.
- Política de reembolso parcial e disputa, suporte para troca de computador,
  textos de licença, privacidade e reembolso.
- Aceite comercial de que uma máquina já offline pode operar até o fim de sua
  janela de sete dias após revogação no servidor.

## Fontes do contrato

- Supabase, objetos privados e URLs assinadas:
  <https://supabase.com/docs/guides/storage/serving/downloads>
- Stripe, eventos duplicados e sem ordem garantida:
  <https://docs.stripe.com/webhooks>
