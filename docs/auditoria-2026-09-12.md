# AMENO.STUDIO — relatório da execução

Data: 12/09/2026. Referência inicial: `dd8bae8`. Código validado e publicado: `a738b38d5869a3d518ca64c713e6610017e11874`.

A execução recompôs a home, o portfólio, a página Sobre e a apresentação do plugin; corrigiu navegação, animações, semântica e contraste; e concluiu a validação local e a conferência da publicação. As três etapas de implementação estão enviadas para `origin/main`. Este documento e as evidências finais são uma entrega documental posterior, sem alterações adicionais no código da aplicação.

## O que foi encontrado

- No hero, parte da sequência de texto acontecia fora do intervalo útil do elemento sticky. A primeira leitura dependia demais da animação, e o vídeo precisava de um fallback que permanecesse disponível em falhas e em dispositivos móveis.
- A home precisava dar mais presença à arquitetura depois do hero. O teaser do plugin tinha ornamentos e tratamento de cor que competiam com essa hierarquia.
- A navegação mobile e a introdução precisavam de tratamento completo de foco, Escape, bloqueio do conteúdo de fundo e restauração do scroll.
- O portfólio precisava de abas utilizáveis por teclado, indicador estável ao redimensionar, melhor estado vazio de Autorais e navegação dos renders compatível com telas pequenas.
- O viewer precisava comunicar carregamento/falha, permitir controle explícito de rotação e liberar recursos ao sair da aba.
- Sobre tinha espaço para melhorar proporção entre retrato e texto, medida de leitura e ritmo. Plugins precisava aproximar a informação de compra do CTA e reduzir a densidade mobile.
- A revisão final encontrou `main` aninhado, atributos ARIA sem semântica compatível e contraste insuficiente em alguns textos pequenos e botões.
- O lint também encontrou dois usos de `require` no conversor de FBX, resolvidos sem executar conversões ou alterar modelos.

## Bugs corrigidos: comportamento, causa e solução

| Problema | Causa identificada | Solução |
| --- | --- | --- |
| Texto do hero aparecia tarde ou fora do enquadramento | Cronologia não correspondia ao percurso útil do sticky | Primeira camada visível na chegada; demais camadas e assinatura dentro do intervalo `top top` → `bottom bottom` |
| Vídeo podia deixar o hero sem mídia utilizável | Fallback dependia do estado do vídeo | Poster em `next/image` permanece sob o vídeo; vídeo aparece após carregar e some em erro |
| Scrubbing podia disputar buscas no vídeo | Atualizações de tempo durante um seek ainda em andamento | Guarda para `seeking`, retomada em `seeked` e limite antes do fim do arquivo |
| CTA do teaser podia permanecer transparente | Interação entre entrada GSAP e transição CSS do link | Wrapper animado e `fromTo` com estados explícitos e limpeza dos estilos |
| Foco e scroll podiam escapar de menu/introdução | Modal sem ciclo completo de abertura/fechamento | Fundo inerte, foco contido, Escape, restauração dos atributos e do overflow |
| Link de pular conteúdo aparecia após sair da introdução | Destino de restauração de foco inadequado | Restauração no logo da navegação quando não existe foco anterior válido |
| Indicador de abas perdia a transição | Medições de resize/fontes sobrescreviam o movimento | Comparação da geometria, gerenciamento da animação e limpeza no unmount |
| Abas exigiam apontador | Faltavam relações e navegação de teclado | `tablist`, `tab`, `tabpanel`, foco móvel e teclas de seta, Home e End |
| Galeria dependia de hover no celular | Interação desktop não oferecia exploração equivalente | Trilho mobile com controles, seis destaques e expansão para os 22 renders existentes |
| Viewer podia manter trabalho e recursos fora de uso | Renderização e descarte incompletos ao ocultar/desmontar | Pausa fora de visão, limpeza de materiais/geometrias/controles/renderer e proteção para callbacks tardios |
| CTA de compra não enquadrava o formulário de forma útil | Âncora ficava distante do ponto de entrada | Alvo `#comprar` na composição de compra, margem para o cabeçalho e sequência de foco preservada |
| Semântica e contraste falhavam na auditoria | `main` duplicado, ARIA em elementos inadequados e cores de texto fracas | Um `main` por página, papéis compatíveis, texto off-white e texto preto nos CTAs vermelhos |

## Decisões de design e segunda passagem criativa

| Área | Decisão e motivo |
| --- | --- |
| Home / hero | Manter o vídeo existente como abertura e revelar a sequência dentro de um único enquadramento. No mobile e com movimento reduzido, apresentar o texto imediatamente com o poster. |
| Home / portfólio | Aumentar a presença da imagem arquitetônica e construir a chamada em três linhas, com contraste editorial. A arquitetura passa a conduzir a leitura após o hero. |
| Home / plugin | Remover o grande ornamento circular e o painel claro; conservar um teaser escuro e mais contido para o produto secundário. |
| Portfólio / Autorais | Usar um desenho editorial simples, numeração e acesso ao Estúdio. Comunicar a ausência de projetos sem inventar trabalhos ou imagens. |
| Portfólio / Estúdio | Preservar os 22 renders. Usar exploração por palavras no desktop e uma galeria horizontal explícita no mobile; seis destaques iniciais reduzem a extensão de entrada sem ocultar o acervo completo. |
| Portfólio / 3D | Conservar a cadeira cinza e a área de apresentação limpa; acrescentar instruções e controles acessíveis para girar e pausar. |
| Sobre | Reorganizar retrato, apresentação, disciplinas e método. Ajustar proporções e largura dos parágrafos usando apenas fatos e conteúdo já existentes. |
| Plugins | Dar sequência clara a apresentação, funcionamento, requisitos, licença, compra e FAQ. Reduzir o peso dos passos no mobile e fazer o CTA chegar ao formulário. |
| Identidade | Manter as famílias tipográficas, usar escalas fluidas e restringir o vermelho aos usos previstos. Aumentar contraste de texto pequeno quando necessário. |

A segunda passagem está incorporada no commit `9114649`: revisão adicional de Plugins, Sobre mobile, galeria do Estúdio, tipografia dos teasers e integração da introdução com o foco. A última revisão de semântica e contraste está em `a738b38`.

## Arquivos alterados

Os caminhos abaixo são relativos à raiz do repositório.

| Arquivo | Alteração |
| --- | --- |
| `src/app/globals.css` | Hero responsivo, composição dos teasers, paleta, contraste, foco, menu e ajustes para movimento reduzido |
| `src/app/layout.tsx` | Link para pular a navegação e destino de conteúdo principal |
| `src/app/plugins/page.tsx` | Hierarquia do produto, composição da compra e semântica, mantendo `PurchaseForm` e seus parâmetros |
| `src/app/plugins/page.module.css` | Layout desktop/mobile, passos, requisitos, licença e FAQ |
| `src/app/portfolio/page.tsx` | Tipagem dos dados e remoção do `main` aninhado; sem novos projetos ou alterações em queries |
| `src/app/sobre/page.tsx` | Recomposição do retrato e conteúdo existente, disciplinas e método |
| `src/app/sobre/page.module.css` | Proporções, escala tipográfica e medida de leitura responsiva |
| `src/components/hero/HeroVideo.tsx` | Cronologia GSAP, scrubbing, poster persistente e ativação por capacidade do dispositivo |
| `src/components/home/HomePortfolioTeaser.tsx` | Imagem em destaque, hierarquia editorial e correção da entrada do CTA |
| `src/components/home/KeywordsWall.tsx` | Preview por mouse/foco, galeria mobile, expansão e controles |
| `src/components/home/KeywordsWall.module.css` | Estilos locais da parede e da galeria |
| `src/components/intro/SiteIntro.tsx` | Ciclo de vida, armazenamento indisponível, foco, Escape e limpeza |
| `src/components/layout/Navbar.tsx` | Menu acessível, seleção por rota e restauração de foco/scroll |
| `src/components/layout/Footer.tsx` | Semântica do grupo de links sociais |
| `src/components/plugins/PluginDiagram.tsx` | Semântica de imagem do diagrama |
| `src/components/plugins/PluginsTeaser.tsx` | Simplificação visual e hierarquia do CTA |
| `src/components/portfolio/AssetViewer.tsx` | Estados, rotação acessível, pausa e descarte dos recursos Three.js |
| `src/components/portfolio/AssetViewer.module.css` | Viewer, estados e controles responsivos |
| `src/components/portfolio/PortfolioTabs.tsx` | Abas, teclado, transições, medição e estado vazio |
| `src/components/portfolio/PortfolioTabs.module.css` | Composição, indicador, tabs mobile e contraste |
| `src/components/shared/Marquee.tsx` | Simplificação e uso dos tokens existentes |
| `scripts/convert-fbx-to-glb.js` | Imports nativos compatíveis com o lint; conversor não executado |

Também foram adicionadas capturas de auditoria em `artifacts/audit/` e quatro capturas de portfólio na raiz nos commits anteriores. Nenhuma dependência foi adicionada à aplicação.

## Resultado técnico

| Verificação | Resultado e alcance |
| --- | --- |
| `npm run build` | Passou no código final; compilação, TypeScript e geração de 12 páginas concluídos |
| `npx tsc --noEmit` | Passou, zero erros |
| `npm run lint` | Passou |
| `npm test` | 3 testes existentes passaram: verify, checkout e webhook, com dependências simuladas |
| Console local | Nenhum erro crítico nos percursos testados; mensagens de React DevTools/HMR do ambiente de desenvolvimento |
| Console publicado | Sem erros ou mensagens de console nas cinco rotas percorridas |
| Desktop | Cinco rotas inspecionadas a 1440px, sem overflow horizontal ou imagens quebradas detectadas |
| Mobile | Rotas inspecionadas a 375px e 390px ao longo da execução; portfólio revisto a 390/393px no encerramento |
| Home | Poster e vídeo funcionais; com scroll de 880px em viewport de 1000px de altura, vídeo em 13,309s de 15,124s e camadas visíveis |
| Falha de vídeo | Requisição abortada em teste local: poster continuou visível e texto legível |
| Movimento reduzido | Hero estático, camadas visíveis, sem carregar o vídeo; cursor padrão e sem Lenis no cenário testado |
| Lenis / GSAP | Scroll suave ativo no desktop e sequência do hero confirmada localmente e em produção; transições das abas e entrada dos teasers verificadas |
| Abas | Autorais, Estúdio e Assets funcionais; setas, Home e End mantêm foco e seleção corretos |
| Estúdio mobile | Expansão de 6 para 22 renders e navegação horizontal confirmadas; zero imagens quebradas na revisão final |
| Assets 3D | GLB pronto, um canvas, pausa, botões esquerda/direita e arrasto confirmados visualmente; sem erros no console |
| Formulário | Exibição, valor sugerido e chegada pelo CTA verificados; envio ao Stripe não foi executado |
| Conta | Sem sessão, redireciona para `/entrar?next=/conta` e exibe a tela de login sem erro; área após login não verificada |
| Acessibilidade automática | Zero violações detectadas por axe nos cenários finais de home, portfólio, plugins e sobre. Contraste sobre gradientes/imagens e caracteres decorativos teve resultados inconclusivos, complementados por inspeção visual |
| Toque em produção | Emulação Chromium via CDP a 390×844, cinco pontos de toque, `pointer: coarse` e ausência de hover. Menu abriu/fechou por toque; overflow restaurado; hero com poster e três camadas visíveis |

O perfil “iPhone15” do CLI sozinho alterava dimensões, mas mantinha apontador fino e zero pontos de toque. A verificação de toque foi feita separadamente via CDP e registrada em JSON. Isso é emulação no Chromium, não um teste em Safari ou iPhone físico.

Os checks de código não foram repetidos durante o encerramento documental, pois o código validado permaneceu idêntico a `a738b38`.

## Publicação confirmada

- URL: [ameno.studio](https://ameno.studio/).
- Destino: produção.
- Status da Vercel: **READY**.
- Commit: `a738b38d5869a3d518ca64c713e6610017e11874`.
- Deployment: `dpl_53LN8uLcAVNdXyHBgWZjpz7JCrc4`.
- Framework: Next.js 16.3.4.
- Intervalo entre início de build e pronto: aproximadamente 30 segundos, conforme timestamps da Vercel.
- O domínio `ameno.studio` consta entre os aliases deste deployment.
- A conferência no browser publicado cobriu `/`, `/portfolio`, `/plugins`, `/sobre` e o redirecionamento de `/conta`, com um `main` por página e sem overflow a 1440px.

O histórico da Vercel registra o deployment anterior de `dd8bae8` como `ERROR`. A publicação atual foi confirmada diretamente; push realizado e deployment pronto foram tratados como verificações distintas. Logs de funções, drains e monitoramento contínuo não fizeram parte desta conferência.

## Integridade e limites da entrega

A comparação Git com `dd8bae8` confirmou ausência de alterações no formulário de compra, rotas de API, lógica em `src/lib`, proxy, arquivos de marca e manifestos de dependências. Login, sessão, Stripe, licenciamento, queries e banco foram preservados. `.env.local` não foi aberto ou editado pelo agente; nenhuma credencial foi incluída na entrega. O repositório externo `D:\Ameno\_tools` não foi utilizado.

Continuam pendentes por definição da especificação:

1. Projetos autorais: dependem dos renders do Octávio; a aba permanece vazia com apresentação intencional.
2. Texturas: a cadeira continua com material cinza, sem decisão nova sobre materiais reais.
3. Novos GLBs: dependem de exportação pelo Octávio.
4. Stripe live: não foi ativado; o produto continua na condição de teste prevista.
5. Conteúdo novo: nenhum projeto, fato biográfico ou imagem foi inventado.

Não houve autenticação real nem compra de teste completa. Os testes existentes com mocks não substituem uma compra end-to-end. Também não foi medida performance de campo, nem feita validação em dispositivos físicos. Nenhum bug novo do site foi encontrado na conferência complementar do portfólio e da publicação.

## Evidências selecionadas

As capturas de início e de etapas intermediárias permanecem no histórico. Nomes antigos contendo `final` não garantem que a captura seja posterior a todas as correções; para o encerramento, usar estas evidências:

- [Home publicada, desktop](../artifacts/audit/published-home-1440.png).
- [Home publicada, toque emulado a 390px](../artifacts/audit/published-home-touch-390.png).
- [Dados da verificação de toque e menu](../artifacts/audit/published-touch-verification.json).
- [Cadeira antes de girar](../artifacts/audit/close-chair-before.png).
- [Cadeira após girar à esquerda](../artifacts/audit/close-chair-left.png).
- [Cadeira após girar à direita](../artifacts/audit/close-chair-right.png).
- [Cadeira após arrasto](../artifacts/audit/close-chair-drag.png).

## Commits de implementação

| Hash | Mensagem |
| --- | --- |
| `ae393a9` | `feat(astra-pass-1): navbar acessivel, hero refinado, sobre recomposta, portfolio tabs CSS modules` |
| `9114649` | `feat(astra-pass-2): plugins refinado, sobre mobile, keywordswall CSS module, auditoria visual completa` |
| `a738b38` | `fix: corrigir semântica e contraste das páginas` |

Os três commits foram enviados para `origin/main`. O commit deste relatório reúne apenas documentação e evidências adicionais.

## Recomendações para a próxima rodada

1. Receber os projetos autorais e seus renders para substituir o estado vazio sem conteúdo inventado.
2. Conferir a experiência em um iPhone/Safari e um Android físicos, sobretudo vídeo, gesto de rotação e scroll.
3. Quando o plugin estiver pronto, validar login e o ciclo completo de compra em modo teste antes de qualquer decisão sobre Stripe live.
4. Medir carregamento do vídeo e dos renders sob rede móvel real; decidir otimizações a partir desses resultados.
5. Definir materiais dos assets e exportar novos GLBs apenas após a decisão de conteúdo do Octávio.
