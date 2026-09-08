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

- Acesso pago: valor mínimo de **R$5,00**. Não é download gratuito com apoio opcional.
- O acesso será por **assinatura mensal ou anual**. A oferta exata dos períodos e os respectivos preços ainda precisam ser definidos.
- **Login obrigatório** para identificar o titular e garantir o acesso.
- Licença/token para **dois computadores**, contemplando computador pessoal e de trabalho.
- Controle de sessão ativa por token para reduzir compartilhamento e uso não autorizado.
- **Suporte completo**. Canal, horário e prazo de atendimento ainda precisam ser definidos; não prometer atendimento 24 horas.

O modelo anterior de pagamento avulso “pay-what-you-want” não descreve mais integralmente o produto. Não assumir R$5 por mês ou por ano, nem preço livre recorrente, até definir a tabela comercial.

### Requisitos de implementação a detalhar

Fluxo previsto: login → escolha do plugin e plano → Stripe Checkout de assinatura → confirmação por webhook → registro do direito de acesso → download e ativação do plugin.

- Área da conta para assinatura, downloads e computadores ativados.
- Verificar o direito de acesso no servidor; o redirecionamento de sucesso do checkout não comprova pagamento.
- Processar eventos de pagamento e assinatura sem duplicar efeitos quando um webhook for reenviado.
- Definir o comportamento de renovação, falha de pagamento, cancelamento e expiração.
- Distinguir login do site, licença, ativação de computador e sessão de uso do plugin.
- Aplicar o controle de licença também no plugin: login no site e proteção do download, isoladamente, não controlam o uso do arquivo já baixado.
- Especificar emissão, expiração, renovação e revogação dos tokens e recuperação/troca de computador.
- Dois computadores autorizados não determina automaticamente duas sessões simultâneas: essa regra está pendente.
- Definir necessidade de conexão e eventual tolerância para uso offline.

O objetivo é reduzir compartilhamento e uso não autorizado; não prometer proteção absoluta contra cópia. A integração de licenciamento no plugin exige trabalho próprio, a ser coordenado com sua implementação.

---

## Conteúdo e páginas

- Home: apresentação profissional e entradas equilibradas para portfólio e loja.
- Portfólio: projetos com imagens, contexto e caminho claro para contato.
- Plugins: descrição, requisitos, planos e acesso à assinatura.
- Sobre/contato: apresentação profissional e canais de atendimento.
- Conta: login, assinatura, downloads e gestão das ativações.

**Conteúdo inicial aprovado:** placeholders. Identificá-los como demonstrativos; não apresentar imagens de banco como trabalhos reais do estúdio.

O proprietário pretende fornecer os renders em **2026-09-09**. Após recebê-los, selecionar os projetos e substituir os placeholders.

---

## Status de implementação — a reconciliar

O checklist anterior confundia arquivos criados com funcionalidades concluídas. Na revisão foram encontrados erros no checkout, divergências de paleta e preço e ausência do fluxo completo de compra. O Antigravity está trabalhando no projeto; o proprietário fornecerá seu relato antes da continuidade. Conferir o código recebido e preservar as alterações existentes.

- [x] Estrutura inicial do Next.js criada
- [x] Arquivos lib/supabase.ts e lib/stripe.ts criados — integração ainda precisa ser validada
- [x] Logos copiados — conforme registro anterior
- [ ] Compilação e configuração base verificadas após conciliação
- [ ] Paleta aprovada aplicada no Tailwind 4 e conferida visualmente
- [ ] Checkout corrigido e adaptado ao modelo de assinatura
- [ ] Navbar + Footer + Cursor
- [ ] Home page
- [ ] GSAP + Lenis global
- [ ] Hero + Cotas
- [ ] Projetos scroll
- [ ] /plugins com planos e preços definidos
- [ ] Login e área da conta
- [ ] Webhook Stripe e ciclo de vida da assinatura
- [ ] Downloads protegidos
- [ ] Licenciamento, dois computadores e controle de sessões integrados ao plugin
- [ ] Fluxo de suporte completo definido
- [ ] Compra, renovação, cancelamento e acesso testados de ponta a ponta
- [ ] Mobile, teclado e movimento reduzido verificados
- [ ] Renders reais e conteúdo final revisados
- [ ] Deploy Vercel e domínio verificados

---

## Pendências do usuário

### Decisões ainda necessárias

1. Oferecer mensal e anual juntos ou escolher uma modalidade? Qual o preço de cada período e a qual deles se aplica o mínimo de R$5?
2. A assinatura cobre um plugin ou todo o catálogo? O usuário escolhe o valor acima do mínimo ou haverá preços fixos?
3. Permitir apenas uma sessão de uso do plugin por vez entre os dois computadores, ou uso simultâneo nos dois?
4. Qual política de uso offline, troca de computador e acesso após expiração/cancelamento?
5. Quais atualizações estão incluídas na assinatura e quais são as condições de uso comercial?
6. Qual canal, horário e prazo de resposta do suporte completo? Qual contato público do estúdio?

### Materiais e continuidade

- Receber o relato e as alterações do Antigravity; reconciliar com este plano antes de prosseguir com a implementação.
- Receber os renders previstos para 2026-09-09; placeholders estão autorizados inicialmente.
- Preparar/revisar apresentação profissional, descrição dos plugins e requisitos de compatibilidade a partir de informações verificadas.
- Verificar a configuração existente de Supabase e Stripe sem expor segredos; solicitar apenas o que estiver faltando pelo meio apropriado.
