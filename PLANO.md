# ameno.studio — Plano do Site

> A direção de arte e a sequência narrativa atualizadas estão em `PLANO_VISUAL.md`. Esse documento passa a reger toda nova implementação visual da home.

> O login opcional e a área do cliente estão detalhados em `PLANO_AUTENTICACAO.md`. A compra continua sem cadastro obrigatório.

> **Stack declarada no projeto:** Next.js 16.3.4 + React 19 + Tailwind 4 + GSAP + Lenis + Supabase + Stripe + Vercel
> **Domínio:** ameno.studio
> **Repo:** github.com/octaviomoliveira/ameno-studio
> **Atualizado em:** 2026-09-10 — estado publicado no commit `35cc71b` e pendências reconciliadas.

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

## Sistema visual e movimento aprovados

### Desktop

- Entrada de marca com cotas, `O` grafitado e partículas de spray.
- Cotas SVG interativas no hero e interferência que reage ao cursor.
- Marquee de disciplinas como transição oficial entre a promessa e a parede visual.
- Parede tipográfica que revela renders conforme a proximidade do mouse.
- Projetos fullbleed com painel sticky, clip-path e parallax conduzidos pelo scroll.
- Navbar com hide/show, cursor técnico, linhas e microinterações vermelhas.
- Lenis para suavização do scroll em dispositivos com mouse.

### Mobile/touch

- Menu de navegação em tela cheia, com alvos de toque grandes e fechamento por link/Escape.
- Scroll nativo em dispositivos `pointer: coarse`; não usar Lenis no toque.
- A parede tipográfica vira uma sequência horizontal com seis renders, texto curto e `scroll-snap`.
- Projetos entram no fluxo vertical como cards editoriais; sem sticky, com parallax sutil vinculado à rolagem natural por toque.
- Animações curtas de entrada, sem depender de hover e respeitando `prefers-reduced-motion`.
- Botões usam o mesmo sistema visual em hero, plugins, login e conta.

O desktop não deve ser simplificado para acomodar o mobile. Cada modo mantém a mesma história com interação adequada ao dispositivo.

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

### Estado técnico da venda

Fluxo previsto: escolha do plugin e valor → Stripe Checkout de pagamento único → confirmação por webhook → registro da compra → entrega do download.

Implementado:

- Formulário em `/plugins` com sugestão de R$29,00, mínimo de R$10,00 e validação no cliente e servidor.
- Checkout público de pagamento único; login continua opcional.
- Webhook assinado, idempotente e condicionado a pagamento confirmado.
- Geração de compra e licença no Supabase por operação atômica.
- `POST /api/verify` com vínculo da primeira máquina e motivos de recusa definidos.
- Área `/conta`, autenticação sem senha e recuperação de compras pelo e-mail confirmado.
- Retornos para `/conta?success=true` e `/plugins` mantidos.

Pendente para abrir vendas reais:

- Arquivo final do plugin e integração do token no código do 3ds Max.
- Download protegido e recuperação do arquivo para compras convidadas.
- E-mail transacional de licença/download.
- Stripe em modo live, webhook live e teste ponta a ponta com pagamento real.
- Política comercial, atualização de versão e processo de suporte.

---

## Conteúdo e páginas

- Home: `HeroSection → Marquee → KeywordsWall → ProjectScroll → PluginsTeaser → Footer`, com entrada de marca opcional antes do hero.
- Portfólio: projetos com imagens, contexto e caminho claro para contato.
- Plugins: descrição, requisitos e compra direta com valor livre a partir de R$10,00; informar que a compra gera uma licença para um computador.
- Sobre/contato: apresentação profissional e canais de atendimento.
- Retorno da compra em `/conta`: fluxo de confirmação/entrega a implementar, sem login obrigatório para comprar.

**Conteúdo atual:** o hero permanece conceitual. As imagens de projetos e da parede visual são trabalhos reais e ficam oficializadas como seleção atual, embora a curadoria possa ser revista depois. Os arquivos estão versionados em `public/hero`, `public/projects` e `public/renders`.

## Plano de execução por fases

1. **Fundação navegável** — estrutura Next.js, identidade, navegação, páginas e integrações base.
2. **Direção visual** — entrada interativa, hero editorial, cotas, parede visual responsiva e projetos cinematográficos no desktop.
3. **Conteúdo demonstrável** — trabalhos reais na parede visual e no portfólio; revisar a seleção e substituir apenas quando a curadoria final for definida.
4. **Produto e venda** — checkout, webhook, licença por computador, entrega protegida do arquivo e integração do token no plugin.
5. **Refino e lançamento** — revisão mobile/acessibilidade, conteúdo final, teste ponta a ponta, deploy, domínio e serviços de produção.

**Estado atual:** fundação, direção visual, conteúdo visual atual, domínio e deploy estão concluídos. Produto e venda têm backend funcional em modo de teste, mas ainda dependem do plugin, entrega protegida, Stripe live e teste comercial completo.

---

## Status de implementação — 2026-09-10

O checklist foi reconciliado com o código e com a publicação atual. A interface, a infraestrutura de licenças e a base de produção estão funcionando; a loja ainda não deve ser considerada pronta para venda porque a entrega do arquivo, a integração final no plugin, o conteúdo definitivo e o teste completo de compra continuam pendentes.

- [x] Estrutura inicial do Next.js criada
- [x] Arquivos de Supabase e Stripe criados e configuração base carregada
- [x] Logos copiados — conforme registro anterior
- [x] `npm run check` passou em 2026-09-10: lint, 3 testes de rota e build de produção
- [x] Compilação e configuração base verificadas após conciliação
- [x] Paleta aprovada aplicada no Tailwind 4 e conferida visualmente
- [x] Sintaxe e validação do checkout corrigidas para pagamento único, mínimo R$10,00
- [x] Navbar + Footer + Cursor
- [x] Home page
- [x] GSAP + Lenis global
- [x] Hero + Cotas
- [x] Projetos scroll
- [x] /plugins com formulário editável, sugestão R$29,00 e mínimo R$10,00
- [x] Home simplificada em cinco capítulos: hero, espaços em cena, portfólio, ferramentas e contato
- [x] Entrada “Da ideia à forma” com cotas, `O` grafitado e partículas de spray
- [x] Campo de interferência e cotas técnicas transparentes no hero
- [x] Parede tipográfica interativa no desktop e carrossel visual com seis renders no mobile
- [x] Projetos fullbleed com sticky/parallax no desktop e cards de fluxo natural com parallax sutil de rolagem no mobile/tablet touch
- [x] Menu mobile em tela cheia e scroll nativo para dispositivos touch
- [x] Sistema unificado de botões aplicado a hero, loja, login e conta
- [x] Páginas visuais `/sobre` e `/conta` com estados e diagramas técnicos provisórios
- [x] Trabalhos reais oficializados como seleção atual no portfólio e na parede visual; esquema do Ameno Cotas na home/loja
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
- [x] Revisão mobile verificada em 390 × 844, 429 × 694 e 768 × 1024, sem overflow horizontal
- [x] Fallback de movimento reduzido implementado
- [ ] Auditoria detalhada de teclado e teste ponta a ponta de acessibilidade
- [x] Renders atuais confirmados como trabalhos reais
- [ ] Curadoria final dos renders e conteúdo textual revisados
- [x] Deploy Vercel e domínio `ameno.studio` verificados no commit `35cc71b`
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
- Revisar futuramente se a seleção atual de trabalhos reais permanece na home, portfólio e parede visual.
- Links públicos confirmados: Instagram `@arq.octaviooliveira` e LinkedIn `octavio-m-oliveira`.
- Preparar/revisar apresentação profissional, descrição dos plugins e requisitos de compatibilidade a partir de informações verificadas.
- O Stripe permanece em modo de teste; deixar a compra ponta a ponta para quando o app/plugin estiver pronto e, no lançamento, trocar as chaves e criar o webhook live.
