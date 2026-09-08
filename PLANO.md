# ameno.studio — Plano do Site

> **Stack declarada no projeto:** Next.js 16.3.4 + React 19 + Tailwind 4 + GSAP + Lenis + Supabase + Stripe + Vercel
> **Domínio:** ameno.studio (Porkbun)
> **Repo:** github.com/octaviomoliveira/ameno-studio
> **Atualizado em:** 2026-09-08 — decisões do proprietário. Implementação pendente de conciliação com o trabalho do Antigravity.

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
- **Sem controle de máquinas, sessões ou tokens nesta fase**.
- Assinatura será considerada apenas quando houver múltiplos plugins no catálogo (**Ameno Suite**).
- **Suporte completo**. Canal, horário e prazo de atendimento ainda precisam ser definidos; não prometer atendimento 24 horas.

Esta decisão substitui o planejamento anterior de assinatura, login obrigatório e licença para dois computadores.

### Requisitos de implementação a detalhar

Fluxo previsto: escolha do plugin e valor → Stripe Checkout de pagamento único → confirmação por webhook → registro da compra → entrega do download.

- Formulário em `/plugins`: valor inicial R$29,00, mínimo R$10,00 e mensagem `mínimo R$ 10,00` abaixo do input.
- Validar o mínimo no frontend e no backend; enviar ao Stripe apenas valores inteiros em centavos.
- Constantes em `src/lib/stripe.ts`: `STRIPE_MIN_AMOUNT = 1000` e `STRIPE_SUGGESTED_AMOUNT = 2900`.
- Verificar o direito de acesso no servidor; o redirecionamento de sucesso do checkout não comprova pagamento.
- Processar eventos de pagamento sem duplicar efeitos quando um webhook for reenviado.
- Definir entrega e recuperação do download sem exigir cadastro para comprar.
- Manter por solicitação do proprietário os retornos `/conta?success=true` e `/plugins`; a página de retorno e a entrega ainda precisam ser implementadas.

**Ordem de execução:** corrigir plano, valores, formulário e checkout; executar `npm run build` com sucesso antes de iniciar qualquer funcionalidade adicional.

---

## Conteúdo e páginas

- Home: apresentação profissional e entradas equilibradas para portfólio e loja.
- Portfólio: projetos com imagens, contexto e caminho claro para contato.
- Plugins: descrição, requisitos e compra direta com valor livre a partir de R$10,00.
- Sobre/contato: apresentação profissional e canais de atendimento.
- Retorno da compra em `/conta`: fluxo de confirmação/entrega a implementar, sem login obrigatório para comprar.

**Conteúdo inicial aprovado:** placeholders. Identificá-los como demonstrativos; não apresentar imagens de banco como trabalhos reais do estúdio.

O proprietário pretende fornecer os renders em **2026-09-09**. Após recebê-los, selecionar os projetos e substituir os placeholders.

---

## Status de implementação — a reconciliar

O checklist anterior confundia arquivos criados com funcionalidades concluídas. Na revisão foram encontrados erros no checkout, divergências de paleta e preço e ausência do fluxo completo de compra. O Antigravity está trabalhando no projeto; o proprietário fornecerá seu relato antes da continuidade. Conferir o código recebido e preservar as alterações existentes.

- [x] Estrutura inicial do Next.js criada
- [x] Arquivos lib/supabase.ts e lib/stripe.ts criados — integração ainda precisa ser validada
- [x] Logos copiados — conforme registro anterior
- [x] `npm run build` passou em 2026-09-08 após correções do checkout e do rodapé. Permanece aviso preexistente sobre ordem de `@import` no CSS; pagamento real e entrega ainda não foram validados.
- [ ] Compilação e configuração base verificadas após conciliação
- [ ] Paleta aprovada aplicada no Tailwind 4 e conferida visualmente
- [x] Sintaxe e validação do checkout corrigidas para pagamento único, mínimo R$10,00
- [ ] Navbar + Footer + Cursor
- [ ] Home page
- [ ] GSAP + Lenis global
- [ ] Hero + Cotas
- [ ] Projetos scroll
- [x] /plugins com formulário editável, sugestão R$29,00 e mínimo R$10,00
- [ ] Retorno da compra e recuperação do download sem cadastro obrigatório
- [ ] Webhook Stripe para confirmação de pagamento único
- [ ] Downloads protegidos
- [ ] Fluxo de suporte completo definido
- [ ] Compra e entrega testadas de ponta a ponta
- [ ] Mobile, teclado e movimento reduzido verificados
- [ ] Renders reais e conteúdo final revisados
- [ ] Deploy Vercel e domínio verificados

---

## Pendências do usuário

### Decisões ainda necessárias

1. Como entregar e recuperar o download após a compra: e-mail, link protegido ou ambos?
2. Quais correções/atualizações pertencem à versão adquirida e quais constituem nova versão paga? Quais as condições de uso comercial?
3. Qual canal, horário e prazo de resposta do suporte completo? Qual contato público do estúdio?

Preços e regras da futura Ameno Suite serão definidos quando houver múltiplos plugins; não são pendências desta fase.

### Materiais e continuidade

- Receber o relato e as alterações do Antigravity; reconciliar com este plano antes de prosseguir com a implementação.
- Receber os renders previstos para 2026-09-09; placeholders estão autorizados inicialmente.
- Preparar/revisar apresentação profissional, descrição dos plugins e requisitos de compatibilidade a partir de informações verificadas.
- Verificar a configuração existente de Supabase e Stripe sem expor segredos; solicitar apenas o que estiver faltando pelo meio apropriado.
