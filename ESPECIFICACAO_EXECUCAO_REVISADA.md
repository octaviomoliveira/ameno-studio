# AMENO.STUDIO — especificação de execução revisada

Este documento complementa a especificação de execução original. Ele resolve ambiguidades operacionais sem substituir o conteúdo, a identidade ou as restrições já aprovadas no `PLANO.md`, `PLANO_VISUAL.md` e `AGENTS.md`.

## Ordem de precedência

1. Segurança do ambiente e áreas proibidas em `AGENTS.md`.
2. Comportamentos estáveis do código atual e decisões aprovadas em `PLANO_VISUAL.md`.
3. Esta especificação revisada.
4. Melhorias visuais descritas na tarefa em andamento.

Quando houver conflito, preservar o comportamento estável, limitar a alteração ao menor escopo possível e registrar o conflito no relatório. Não interromper uma tarefa de baixo risco para pedir aprovação; pedir direção somente quando o conflito mudar conteúdo, negócio, segurança ou arquitetura de forma material.

## Escopo de implementação

- Trabalhar somente em `D:\Ameno\ameno-studio`.
- Antes de editar, procurar a implementação real quando o nome de arquivo, componente ou classe do briefing não existir exatamente.
- Fazer mudanças mínimas e localizadas nas áreas descritas na tarefa.
- Não refatorar código estável por conveniência e não criar componentes paralelos para substituir uma implementação existente sem necessidade demonstrável.
- Preservar Next.js, GSAP, Lenis, Three.js, `next/image` e as dependências instaladas.
- Não instalar dependências novas sem necessidade clara.
- Não inventar conteúdo, projetos, fatos biográficos, imagens ou decisões comerciais.
- A segunda passagem criativa continua obrigatória, mas fica restrita às páginas e componentes explicitamente incluídos na tarefa. Ela pode melhorar ritmo, hierarquia, proporção e transições dentro desse escopo.

As zonas proibidas continuam intactas: `.env.local`, `D:\Ameno\_tools`, `public/brand/*`, `src/app/plugins/purchase-form.tsx`, checkout, verify, webhook, autenticação, proxy, schema, queries e RLS.

## Regra específica para um carrossel horizontal de projetos

Esta seção só se aplica se uma tarefa futura reintroduzir explicitamente um carrossel horizontal para projetos. Ela não altera o `ProjectScroll` atual, que usa painéis verticais com sticky/parallax no desktop e fluxo natural no touch.

- Calcular a distância pela largura real do track, nunca por uma fórmula fixa como `N * 100vw`:

  ```ts
  const distance = Math.max(0, track.scrollWidth - viewport.clientWidth)
  ```

- Medir depois de fontes e imagens carregarem e recalcular com `ResizeObserver` e `ScrollTrigger.refresh()` quando a geometria mudar.
- No desktop e no tablet landscape, controlar o deslocamento exclusivamente com GSAP `ScrollTrigger` e `pin`. O mesmo track não pode combinar `pin`, `position: sticky`, `Draggable`, `scrollLeft` ou outro mecanismo de movimento concorrente.
- Usar `invalidateOnRefresh` e funções para `end`/`x`, evitando valores congelados após resize ou mudança de conteúdo.
- Slides podem ocupar aproximadamente `80vw`, deixando parte do próximo projeto visível. Não adicionar snap automático.
- Abaixo de `768px`, remover o pin e a transformação horizontal; apresentar os projetos em fluxo vertical, full-width, com texto acessível e sem depender de hover.
- Usar a mesma condição de breakpoint no CSS e no JavaScript. Tablet landscape deve ser decidido por largura/orientação, não apenas por `pointer: coarse`.
- Com `prefers-reduced-motion: reduce`, não criar pin, transformação horizontal ou scrub. O conteúdo deve permanecer em fluxo vertical normal.
- Fornecer foco visível, nomes acessíveis e uma alternativa de teclado para explorar todos os projetos.

`position: sticky` continua permitido em componentes não pertencentes a esse carrossel, como o hero e blocos editoriais aprovados.

## Cadência de build e validação

Tratar cada grupo lógico de alterações como uma tarefa completa. Não é necessário executar build depois de cada edição individual.

1. Rodar `npm run build` uma vez antes de iniciar as alterações. Registrar o estado inicial.
2. Inspecionar todas as rotas e os estados relevantes antes de editar.
3. Implementar um grupo lógico de mudanças e executar os checks adequados.
4. Rodar `npm run build` novamente ao final de cada tarefa completa.
5. Fazer a segunda passagem criativa dentro do escopo e corrigir qualquer problema encontrado.
6. Revalidar desktop, mobile, movimento reduzido, console, imagens, foco e interações afetadas.
7. Antes do commit final, executar obrigatoriamente `npm run build` mais uma vez.
8. Revisar `git diff --check`, `git diff --name-only` e o diff completo.
9. Confirmar que nenhum arquivo proibido, segredo ou mudança fora do escopo entrou no diff.
10. Só então criar o commit descritivo e fazer push sem force.

Build, lint, TypeScript e testes devem ser relatados com o comando e o resultado. Se uma validação não puder ser feita — por exemplo, compra completa, login real ou aparelho físico — registrar a limitação em vez de marcar o item como concluído.

## Tratamento de conflitos e entrega

- Se o briefing indicar um arquivo inexistente, localizar o equivalente atual e adaptar a alteração.
- Se o briefing contradizer o plano visual ou o código estável, não substituir silenciosamente o comportamento. Preservar o que funciona, registrar a diferença e só alterar quando a tarefa atual tornar a intenção inequívoca.
- Não ampliar a revisão para outras páginas ou sistemas apenas porque uma melhoria seria possível.
- O relatório final deve listar achados, arquivos alterados, causa e correção dos bugs, decisões de design, pendências, resultado técnico, commits, publicação e recomendações.

## Estado visual que permanece aprovado

- Desktop: projetos fullbleed com sticky, clip-path e parallax em `ProjectScroll`.
- Mobile/touch: projetos em fluxo vertical natural; a parede visual pode usar trilho horizontal próprio com interação adequada ao toque.
- Hero, introdução, navegação, portfólio em abas, viewer Three.js, Plugins e Sobre devem preservar a identidade AMENO, a paleta aprovada e o suporte a movimento reduzido.
