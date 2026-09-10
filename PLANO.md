# ameno.studio — Plano do Site

> A direção de arte e a sequência narrativa atualizadas estão em `PLANO_VISUAL.md`. Esse documento passa a reger toda nova implementação visual da home.

> O login opcional e a área do cliente estão detalhados em `PLANO_AUTENTICACAO.md`. A compra continua sem cadastro obrigatório.

> **Stack declarada no projeto:** Next.js 16.3.4 + React 19 + Tailwind 4 + GSAP + Lenis + Supabase + Stripe + Vercel
> **Domínio:** ameno.studio
> **Repo:** github.com/octaviomoliveira/ameno-studio
> **Atualizado em:** 2026-09-08 — decisões do proprietário e estado reconciliado do projeto.

---

## Objetivos e prioridade aprovados

O site terá duas funções com a mesma prioridade:

- Portfólio profissional para empresas encontrarem e contratarem o profissional/estúdio.
- Loja de plugins que facilitem o trabalho dos usuários.

A home e a navegação devem dar destaque equivalente a projetos/contato e plugins. Não assumir plugins como objetivo principal nem reduzir o portfólio a uma seção de credibilidade da loja.

---

## Identidade visual

**Conceito:** ordem × interferência

**Paleta:**
- Fundo: `#0a0a0a`
- Texto: `#ffffff` / `#e8e8e0`
- Acento: `#E63B2E` (vermelho spray — interferência)

**Logos em:** `public/brand/logo.svg`, `logo.png`, `symbol.svg`

---

## Efeitos de scroll aprovados

- Cotas SVG interativas no hero (mouse → valores mudam)
- Texto stagger letra por letra
- Corte/slash de transição entre seções
- Image reveal (scale + clip-path) nos projetos
- Pinned scroll nos projetos
- Parallax nas imagens
- Marquee horizontal entre seções
- Linha vermelha animada
- Cursor crosshair com coordenadas X/Y
- Navbar hide/show no scroll
- Lenis em tudo

Na implementação, adaptar os efeitos para celular/touch, navegação por teclado e preferência por movimento reduzido. Cursor e interação por mouse devem ter alternativas; conteúdo e navegação não podem depender das animações.

---

## Modelo de negócio

### Decisões aprovadas

- **Pay-what-you-want**, com valor mínimo de **R$10,00**.
- Valor sugerido de **R$29,00**, preenchido no formulário e livremente editável.
- **Pagamento único por versão**, sem assinatura mensal/anual nesta fase.
- **Compra direta, sem login obrigatório**.
- **Login opcional por e-mail** para recuperar compras, licenças e futuros downloads na área do cliente.
- **1 compra = 1 licença = 1 computador**.
- O plugin verifica um token na API ao iniciar; a primeira verificação vincula a licença ao computador e verificações seguintes exigem o mesmo computador.
- Outro computador exige uma nova compra. Trocas manuais poderão ser tratadas pelo suporte.
- O plugin poderá tolerar **7 dias offline** usando o cache local; depois deve exigir nova verificação online.
- Assinatura mensal/anual será considerada apenas quando houver múltiplos plugins no catálogo (**Ameno Suite**).
- **Suporte completo**. Canal, horário e prazo de atendimento ainda precisam ser definidos; não prometer atendimento 24 horas.

Esta decisão substitui o planejamento anterior de assinatura, login obrigatório e licença para dois computadores. Nesta fase não haverá conta obrigatória no site.

### Requisitos de implementação a detalhar

Fluxo previsto: escolha do plugin e valor → Stripe Checkout de pagamento único → confirmação por webhook → registro da compra → entrega do download.

- Formulário em `/plugins`: valor inicial R$29,00, mínimo R$10,00 e mensagem `mínimo R$ 10,00` abaixo do input.
- Validar o mínimo no frontend e no backend; enviar ao Stripe apenas valores inteiros em centavos.
- Constantes em `src/lib/stripe.ts`: `STRIPE_MIN_AMOUNT = 1000` e `STRIPE_SUGGESTED_AMOUNT = 2900`.
- Verificar o direito de acesso no servidor; o redirecionamento de sucesso do checkout não comprova pagamento.
- Processar eventos de pagamento sem duplicar efeitos quando um webhook for reenviado.
- Definir entrega e recuperação do download sem exigir cadastro para comprar.
- Gerar e guardar um token único após o pagamento confirmado pelo webhook.
- Disponibilizar `POST /api/verify` para o plugin com `token` e `machine_id`, retornando `valid`, `not_found`, `machine_mismatch`, `inactive` ou `rate_limited`.
- Vincular apenas a primeira máquina usando operação atômica no Supabase; não permitir que uma corrida vincule dois computadores.
- Não expor token, fingerprint ou chave administrativa em logs e respostas desnecessárias.
- Manter por solicitação do proprietário os retornos `/conta?success=true` e `/plugins`; a página de retorno já existe e a entrega ainda precisa ser implementada.

**Ordem de execução:** corrigir plano, valores, formulário e checkout; executar `npm run build` com sucesso antes de iniciar qualquer funcionalidade adicional.

---

## Conteúdo e páginas

- Home: apresentação profissional e entradas equilibradas para portfólio e loja.
- Portfólio: projetos com imagens, contexto e caminho claro para contato.
- Plugins: descrição, requisitos e compra direta com valor livre a partir de R$10,00; informar que a compra gera uma licença para um computador.
- Sobre/contato: apresentação profissional e canais de atendimento.
- Retorno da compra em `/conta`: fluxo de confirmação/entrega a implementar, sem login obrigatório para comprar.

**Conteúdo inicial aprovado:** placeholders. Nesta versão foram usadas imagens conceituais geradas especificamente para a prévia, identificadas como provisórias; não apresentar imagens de banco como trabalhos reais do estúdio.

O proprietário pretende fornecer os renders em **2026-09-09**. Após recebê-los, selecionar os projetos e substituir os placeholders.

## Plano de execução por fases

1. **Fundação navegável** — estrutura Next.js, identidade, navegação, páginas e integrações base.
2. **Direção visual** — hero editorial, cotas, tipografia letra a letra, cortes, marquee e scroll cinematográfico com projetos fullbleed.
3. **Conteúdo demonstrável** — imagens conceituais provisórias para validar a composição; substituir pelos renders oficiais quando recebidos.
4. **Produto e venda** — checkout, webhook, licença por computador, entrega protegida do arquivo e integração do token no plugin.
5. **Refino e lançamento** — revisão mobile/acessibilidade, conteúdo final, teste ponta a ponta, deploy, domínio e webhook de produção.

**Estado atual:** fases 1, 2 e 3 concluídas para a prévia visual; a revisão visual de `/sobre`, `/conta`, portfólio e loja foi aplicada. Fases 4 e 5 seguem parcialmente implementadas e ainda dependem da entrega do plugin, decisão de distribuição e materiais finais.

---

## Status de implementação — 2026-09-08 (reconciliado após publicação)

O checklist foi reconciliado com o código e com a publicação atual. A interface, a infraestrutura de licenças e a base de produção estão funcionando; a loja ainda não deve ser considerada pronta para venda porque a entrega do arquivo, a integração final no plugin, o conteúdo definitivo e o teste completo de compra continuam pendentes.

- [x] Estrutura inicial do Next.js criada
- [x] Arquivos de Supabase e Stripe criados e configuração base carregada
- [x] Logos copiados — conforme registro anterior
- [x] `npm run build` passou em 2026-09-08 sem erros ou avisos do projeto
- [x] Compilação e configuração base verificadas após conciliação
- [x] Paleta aprovada aplicada no Tailwind 4 e conferida visualmente
- [x] Sintaxe e validação do checkout corrigidas para pagamento único, mínimo R$10,00
- [x] Navbar + Footer + Cursor
- [x] Home page
- [x] GSAP + Lenis global
- [x] Hero + Cotas
- [x] Projetos scroll
- [x] /plugins com formulário editável, sugestão R$29,00 e mínimo R$10,00
- [x] Home editorial em cinco capítulos: manifesto, método, portfólio, ferramentas e contato
- [x] Campo de interferência no hero, índice navegável de projetos e scroll fullbleed
- [x] Páginas visuais `/sobre` e `/conta` com estados e diagramas técnicos provisórios
- [x] Imagens conceituais provisórias no portfólio e esquema do Ameno Cotas na home/loja
- [x] Schema `licenses`, funções atômicas e RLS aplicados no Supabase
- [x] `POST /api/verify` e webhook de geração de token implementados; testes locais das rotas passam
- [x] Webhook de teste do Stripe configurado para `checkout.session.completed` e entregue ao site com HTTP `200`
- [ ] Retorno da compra e recuperação do download sem cadastro obrigatório
- [x] Base de autenticação por e-mail, sessão SSR e área da conta protegida
- [x] Vínculo seguro de compras convidadas pelo e-mail confirmado
- [x] Verificação integrada local com `SUPABASE_SERVICE_ROLE_KEY` (token fictício retorna `not_found` sem erro de serviço)
- [ ] Downloads protegidos
- [ ] Fluxo de suporte completo definido
- [ ] Compra e entrega testadas de ponta a ponta
- [ ] Integração da verificação no código do plugin em `D:\Ameno\_tools`
- [x] Revisão visual mobile e fallback de movimento reduzido implementados
- [ ] Auditoria detalhada de teclado e teste ponta a ponta de acessibilidade
- [ ] Renders reais e conteúdo final revisados
- [x] Deploy Vercel, domínio `ameno.studio` e resposta pública verificados
- [x] Variáveis de produção configuradas no Vercel; segredos não ficam no repositório

---

## Pendências do usuário

### Decisões ainda necessárias

1. Como entregar e recuperar o download após a compra: e-mail, link protegido ou ambos?
2. Quais correções/atualizações pertencem à versão adquirida e quais constituem nova versão paga? Quais as condições de uso comercial?
3. Qual canal, horário e prazo de resposta do suporte completo? Qual contato público do estúdio?

Preços e regras da futura Ameno Suite serão definidos quando houver múltiplos plugins; não são pendências desta fase.

### Materiais e continuidade

- Receber o relato e as alterações do Antigravity; manter este plano como referência reconciliada.
- `SUPABASE_SERVICE_ROLE_KEY` já está em `D:\Ameno\ameno-studio\.env.local`; não commitar nem compartilhar o valor.
- Receber os renders previstos para 2026-09-09; placeholders estão autorizados inicialmente.
- Preparar/revisar apresentação profissional, descrição dos plugins e requisitos de compatibilidade a partir de informações verificadas.
- O Stripe permanece em modo de teste; deixar a compra ponta a ponta para quando o app/plugin estiver pronto e, no lançamento, trocar as chaves e criar o webhook live.
