'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './PluginTutorial.module.css'

type StepId =
  | 'ativacao'
  | 'cotar-single'
  | 'cotar-chain'
  | 'ancoras'
  | 'estilos'
  | 'revisar'
  | 'exportar'

interface CaptureAsset {
  id: string
  label: string
  badge: string
  src: string
  width: number
  height: number
  caption: string
  isAlpha?: boolean
}

interface CalloutStep {
  num: string
  title: string
  body: string
}

interface ControlRef {
  name: string
  description: string
}

interface TutorialStepDoc {
  id: StepId
  code: string
  label: string
  sub: string
  stepTag: string
  title: string
  summary: string
  sceneContext: string
  captures: CaptureAsset[]
  callouts: CalloutStep[]
  controls: ControlRef[]
  proTip: string
}

const TUTORIAL_STEPS: TutorialStepDoc[] = [
  {
    id: 'ativacao',
    code: 'PASSO 00',
    label: 'Ativação & Conta',
    sub: 'Token UUID v4 e lease DPAPI',
    stepTag: 'PASSO 00 · INSTALAÇÃO, LOGIN E SESSÃO OFFLINE',
    title: 'Ative com seu token UUID v4 — mesmo com o 3ds Max bloqueado no Firewall.',
    summary:
      'Capturas reais da janela Ameno Cotas no 3ds Max 2026 mostrando a tela inicial de ativação e a aba Configurações após o desbloqueio. O worker Python autônomo valida sua licença por fora do processo do 3ds Max e grava um lease local criptografado via Windows DPAPI válido por até 7 dias offline.',
    sceneContext: '3ds Max 2026 · Python 3.11.12 · PySide6 / Qt 6.5.3 · Lease DPAPI ativo',
    captures: [
      {
        id: 'board-00',
        label: 'Prancha Anotada',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_00_ativacao.png',
        width: 1600,
        height: 1020,
        caption:
          'Prancha explicativa com capturas reais da tela de Login (Token UUID v4) e da aba Configurações (Sessão autenticada + diagnóstico de ambiente).',
      },
      {
        id: 'ui-login',
        label: 'Janela Real · Login',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_00_login.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da janela AmenoMainWindow antes do desbloqueio: campo de Token de acesso com opção "Mostrar token", botão "Entrar" e aviso de tolerância offline de 7 dias.',
      },
      {
        id: 'ui-config',
        label: 'Janela Real · Configurações',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_07_config.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Configurações com sessão autenticada, botão "Sair da conta", detalhes técnicos (3ds Max 2026, Python 3.11.12, PySide6 / Qt 6.5.3) e "Copiar diagnóstico para suporte".',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Cole seu Token de Acesso (UUID v4)',
        body: 'Após instalar o pacote em %APPDATA%\\Autodesk\\ApplicationPlugins\\AmenoTools e abrir pelo menu Ameno Tools, cole o token gerado na sua conta (/account) e marque "Mostrar token" se quiser conferir os caracteres.',
      },
      {
        num: '2',
        title: 'Clique em "Entrar" (Bypass de Firewall do Max)',
        body: 'O plugin executa a verificação em processo autônomo do sistema operacional. Mesmo que o 3dsmax.exe esteja bloqueado no Windows Firewall, a licença é validada e o lease DPAPI de 7 dias é salvo em %LOCALAPPDATA%\\AmenoTools\\license.',
      },
      {
        num: '3',
        title: 'Gerencie a Sessão na Aba Configurações',
        body: 'Na aba Configurações (ícone de engrenagem no rodapé da barra lateral), confira o status "Sessão autenticada", inspecione as versões do Max/Python/Qt ou clique em "Sair da conta" para revogar o lease local.',
      },
    ],
    controls: [
      {
        name: 'Token de acesso + Mostrar token',
        description:
          'Aceita o código UUID v4 (ex.: a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d), remove espaços extras ao colar e permite alternar entre máscara de senha e texto visível.',
      },
      {
        name: 'Sair da conta (Revogação imediata)',
        description:
          'Remove o arquivo criptografado lease-v1.bin da máquina atual e bloqueia imediatamente as abas até que um novo login seja realizado.',
      },
      {
        name: 'Copiar diagnóstico para suporte',
        description:
          'Copia um relatório técnico do ambiente (3ds Max 2026, Python 3.11.12, Qt 6.5.3 e contadores da cena) sem jamais expor seu token de acesso.',
      },
    ],
    proTip:
      'Enquanto o lease local de 7 dias estiver válido, você pode fechar e reabrir o 3ds Max quantas vezes quiser — mesmo sem internet — que o plugin já abre direto na aba Cotar.',
  },
  {
    id: 'cotar-single',
    code: 'PASSO 01',
    label: 'Cotar · Uma Medida',
    sub: '3 cliques + Snap em Planta',
    stepTag: 'PASSO 01 · ABA COTAR (MODO UMA MEDIDA)',
    title: 'Crie uma cota individual em 3 cliques com leitura automática em Planta.',
    summary:
      'Simulação real no 3ds Max 2026 cotando uma bancada de cozinha de 295 cm na vista de Planta (plano XY). Você escolhe "Uma medida", define a orientação "Planta" e clica nos pontos A e B com Snap 3D ativo antes de posicionar o afastamento da linha.',
    sceneContext: 'Cena Real: Bancada_Pia (2950 mm) · Orientação: Planta (XY) · Estilo: Arquitetônico',
    captures: [
      {
        id: 'board-01',
        label: 'Prancha Anotada',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_01_cotar_single.png',
        width: 1600,
        height: 1020,
        caption:
          'Prancha passo a passo unindo a captura real da aba Cotar ("Uma medida" + "Planta") e o render real da viewport 3ds Max 2026 com a cota de 295 cm criada em 3 cliques.',
      },
      {
        id: 'ui-cotar-single',
        label: 'Janela Real · Aba Cotar',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_01_cotar_single.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Cotar configurada para "Uma medida", Orientação "Planta", Direção "Automática", Estilo "Arquitetônico" em centímetros (cm) e status "Cena preparada: 1 cota".',
      },
      {
        id: 'render-single-plan',
        label: 'Viewport 3ds Max · Planta 295 cm',
        badge: 'RENDER REAL 3DS MAX',
        src: '/images/plugins/cotas/render_01_single_plan.png',
        width: 1100,
        height: 760,
        caption:
          'Render real da cena arquitetônica vista de topo no 3ds Max 2026 exibindo a bancada inferior cotada em 295 cm com terminais Tick a 45°.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Selecione "Uma medida"',
        body: 'No primeiro bloco da aba Cotar, mantenha o botão "Uma medida" ativo para acionar a ferramenta clássica de 3 cliques: 1º clique na origem (A), 2º clique no destino (B) e 3º clique para definir a altura/afastamento da linha.',
      },
      {
        num: '2',
        title: 'Escolha Orientação "Planta" e Direção',
        body: 'Em "Orientação do desenho", selecione "Planta" para projetar a cota no plano XY do mundo. Em "Direção", use "Automática" (alinhada aos pontos A e B), "Horizontal" ou "Vertical".',
      },
      {
        num: '3',
        title: 'Clique em "Iniciar cotação" com Snap 3D (S)',
        body: 'Com o Snap 3D do 3ds Max ligado em Vertex/Endpoint, clique nas duas extremidades da bancada (A e B) e afaste o cursor para posicionar a linha de cota "295 cm" dentro da layer AMENO_COTAS.',
      },
    ],
    controls: [
      {
        name: 'Ajustar detalhes (Estilo, Unidade, Casas decimais)',
        description:
          'Expanda a seção "Ajustar detalhes" para definir o Estilo ativo (ex.: Arquitetônico), a Unidade (cm, mm, m, in), Casas decimais e a opção "Acompanhar inclinação da linha".',
      },
      {
        name: 'Cena preparada + Atualizar estado',
        description:
          'Exibe em tempo real quantas cotas existem na layer dedicada AMENO_COTAS e quantas possuem referências órfãs.',
      },
      {
        name: 'Menu Mais ações',
        description:
          'Acesso rápido para Reparar todas as cotas, Excluir cotas selecionadas, Limpar cotas órfãs ou Excluir todas as cotas da cena.',
      },
    ],
    proTip:
      'Pressione Esc a qualquer momento durante os cliques para cancelar a cota em andamento sem deixar geometria temporária na cena.',
  },
  {
    id: 'cotar-chain',
    code: 'PASSO 02',
    label: 'Cotar em Cadeia',
    sub: 'Várias medidas em Fachada',
    stepTag: 'PASSO 02 · ABA COTAR (VÁRIAS MEDIDAS EM CADEIA)',
    title: 'Cote sequências inteiras de marcenaria e elevações na mesma linha-base.',
    summary:
      'Simulação real de elevação frontal no 3ds Max 2026: com "Várias medidas" e "Fachada / Vista" ativos, criamos uma cadeia horizontal superior (165 cm · 135 cm · 120 cm) e uma cadeia vertical esquerda (90 cm · 60 cm · 75 cm) perfeitamente alinhadas.',
    sceneContext: 'Cena Real: Elevação Cozinha · 7 cotas ativas (Cadeias Horizontal, Vertical e Ilha)',
    captures: [
      {
        id: 'board-02',
        label: 'Prancha Anotada',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_02_cotar_chain.png',
        width: 1600,
        height: 1020,
        caption:
          'Prancha passo a passo mostrando a aba Cotar em modo "Várias medidas" + "Fachada / Vista" ao lado do render real da elevação com 7 cotas encadeadas.',
      },
      {
        id: 'ui-cotar-chain',
        label: 'Janela Real · Várias Medidas',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_02_cotar_chain.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Cotar com "Várias medidas", "Fachada / Vista" e direção "Horizontal" selecionados, indicando "Cena preparada: 7 cotas".',
      },
      {
        id: 'render-chain-elevation',
        label: 'Viewport 3ds Max · Elevação Completa',
        badge: 'RENDER REAL 3DS MAX',
        src: '/images/plugins/cotas/render_02_chain_elevation.png',
        width: 1100,
        height: 760,
        caption:
          'Render real no 3ds Max 2026 exibindo a cadeia horizontal (165 cm, 135 cm, 120 cm), a cadeia vertical de alturas (90 cm bancada, 60 cm frontão, 75 cm armário superior) e a ilha (1803 mm).',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Ative "Várias medidas"',
        body: 'Após definir o 1º trecho (165 cm) e a altura da linha-base no 3º clique, cada novo clique adiciona automaticamente o próximo trecho alinhado (135 cm → 120 cm). Clique no espaço vazio ou pressione Esc para encerrar a cadeia.',
      },
      {
        num: '2',
        title: 'Orientação "Fachada / Vista"',
        body: 'Projeta as linhas de extensão, os terminais e o texto paralelamente ao plano da vista frontal/elevação da marcenaria, garantindo leitura ortogonal perfeita.',
      },
      {
        num: '3',
        title: 'Gerenciamento de Cena (7 cotas)',
        body: 'O cartão de estado confirma as 7 cotas criadas na cena. Se precisar desfazer uma cadeia inteira recém-criada, um único Ctrl+Z remove todos os trechos da sequência de uma só vez.',
      },
    ],
    controls: [
      {
        num: '1',
        name: 'Direção Horizontal vs. Vertical em Cadeia',
        description:
          'Use "Horizontal" para cotar larguras de módulos lado a lado (165 · 135 · 120 cm) e "Vertical" para cotar alturas acumuladas de bancada, nicho e armário superior (90 · 60 · 75 cm).',
      } as ControlRef,
      {
        name: 'Alinhamento Automático de Linha-Base',
        description:
          'Todos os trechos subsequentes herdam exatamente o mesmo offset definido no 3º clique, sem degraus entre cotas vizinhas.',
      },
      {
        name: 'Undo Atômico (Ctrl+Z Único)',
        description:
          'Toda a sessão de cotagem contínua é agrupada em uma transação única do 3ds Max para facilitar correções rápidas.',
      },
    ],
    proTip:
      'Para cotar marcenaria rapidamente, crie primeiro a cadeia horizontal de larguras no topo e depois mude apenas a Direção para "Vertical" para puxar todas as alturas na lateral esquerda.',
  },
  {
    id: 'ancoras',
    code: 'PASSO 03',
    label: 'Âncoras Reativas',
    sub: 'Antes (700 mm) vs. Depois (1150 mm)',
    stepTag: 'PASSO 03 · ÂNCORAS 3D REATIVAS EM TEMPO REAL',
    title: 'Mova objetos ou vértices no 3ds Max e veja a cota recalcular sozinha.',
    summary:
      'Prova real capturada no 3ds Max 2026: medimos o corredor entre a parede esquerda e a ilha gourmet (700 mm). Em seguida, movemos a ilha +450 mm no eixo X. A cota do corredor atualizou sozinha para 1150 mm e a cota da ilha acompanhou o móvel!',
    sceneContext: 'Simulação Real: Deslocamento de Ilha_Gourmet (+450 mm no eixo X) · Recálculo instantâneo',
    captures: [
      {
        id: 'board-03',
        label: 'Prancha Anotada · Antes vs. Depois',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_03_ancoras_reativas.png',
        width: 1600,
        height: 1020,
        caption:
          'Comparativo lado a lado capturado no 3ds Max 2026: à esquerda antes de mover a ilha (corredor de 700 mm) e à direita após mover a ilha +450 mm (corredor recalculado automaticamente para 1150 mm).',
      },
      {
        id: 'render-anchor-before',
        label: 'Antes · Corredor 700 mm',
        badge: 'RENDER ANTES',
        src: '/images/plugins/cotas/render_03_anchor_before.png',
        width: 1100,
        height: 760,
        caption:
          'Render real ANTES da alteração de layout: a cota entre a Parede_Esquerda e a Ilha_Gourmet mede exatamente 700 mm.',
      },
      {
        id: 'render-anchor-after',
        label: 'Depois · Corredor 1150 mm (+450 mm)',
        badge: 'RENDER DEPOIS',
        src: '/images/plugins/cotas/render_04_anchor_after.png',
        width: 1100,
        height: 760,
        caption:
          'Render real DEPOIS de mover a Ilha_Gourmet +450 mm para a direita: a cota do corredor estica as linhas de extensão e atualiza o valor para 1150 mm automaticamente.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Vínculo Paramétrico (700 mm no Estado Inicial)',
        body: 'Ao criar a cota clicando nos vértices da Parede_Esquerda e da Ilha_Gourmet, o AmenoAnchorService grava o handle do nó e o índice do vértice nos Custom Attributes da cota.',
      },
      {
        num: '2',
        title: 'Recálculo Automático ao Mover (+450 mm → 1150 mm)',
        body: 'Quando a ilha é deslocada +450 mm no eixo X, o watcher de transformação detecta a mudança, reposiciona a extremidade B da cota e recalcula o texto de 700 mm para 1150 mm.',
      },
      {
        num: '3',
        title: 'Cotas Internas Acompanham o Objeto (1800 mm)',
        body: 'Observe que a cota de largura da própria ilha (1800 mm em âmbar) estava ancorada nos dois cantos da ilha e caminhou solidariamente para a direita junto com o móvel.',
      },
    ],
    controls: [
      {
        name: 'Ancoragem em Nó e Sub-Objeto (Vértice)',
        description:
          'Funciona tanto ao mover/rotacionar/escalar o objeto inteiro quanto ao puxar vértices individuais dentro de um Editable Poly ou Edit Poly.',
      },
      {
        name: 'Detecção de Referência Perdida (Cota Órfã)',
        description:
          'Se uma parede ou móvel ancorado for deletado da cena, a cota não quebra o 3ds Max: ela mantém sua última geometria válida e sinaliza "Referência perdida" na aba Revisar.',
      },
      {
        name: 'Botão Reparar Todas as Cotas',
        description:
          'Força uma ressincronização completa de todas as âncoras e estilos da layer AMENO_COTAS a qualquer momento.',
      },
    ],
    proTip:
      'Não lembra a quais objetos uma cota está presa? Selecione a cota, abra a aba Revisar e clique em "Selecionar referências na viewport" para destacar os objetos de origem na hora.',
  },
  {
    id: 'estilos',
    code: 'PASSO 04',
    label: 'Estilos & Terminais',
    sub: 'Prévia 2D, Tick e Seta fechada',
    stepTag: 'PASSO 04 · ABA ESTILOS E PRÉVIA 2D AO VIVO',
    title: 'Personalize fontes, linhas, cores e 6 terminais vendo tudo na Prévia 2D.',
    summary:
      'Capturas reais da aba Estilos mostrando dois padrões gráficos lado a lado na Prévia 2D interativa: o estilo clássico "Arquitetônico" (com terminal Tick oblíquo) e uma variação executiva com "Seta fechada" em vermelho coral (#E54839).',
    sceneContext: 'Biblioteca Global: %LOCALAPPDATA%\\AmenoTools\\Profiles\\styles.library',
    captures: [
      {
        id: 'board-04',
        label: 'Prancha Anotada',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_04_estilos_terminais.png',
        width: 1600,
        height: 1020,
        caption:
          'Prancha comparativa com duas capturas reais da aba Estilos: seção "Texto" com terminal Tick (à esquerda) e seções "Linhas" + "Terminais" com Seta fechada (à direita).',
      },
      {
        id: 'ui-estilos-tick',
        label: 'Janela Real · Terminal Tick',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_03_estilos_tick.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Estilos com o estilo "Arquitetônico", Prévia 2D em fundo escuro com terminal Tick e seção "Texto" expandida (Fonte Arial, Tamanho, Espaçamento e Distância da linha).',
      },
      {
        id: 'ui-estilos-arrow',
        label: 'Janela Real · Seta Fechada',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_04_estilos_arrow.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Estilos com as seções "Linhas" e "Terminais" expandidas: Espessura (0,45 cm), Prolongamento (7,00 cm), Recuo (3,00 cm) e Tipo "Seta fechada" renderizada ao vivo na Prévia 2D.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Prévia 2D com Fundo Escuro e Unidade de Edição',
        body: 'No topo da aba Estilos, escolha o estilo base, crie um "Novo estilo" e alterne a "Unidade dos valores" (cm, mm ou m). A Prévia 2D redesenha instantaneamente o texto, as linhas de chamada e os terminais.',
      },
      {
        num: '2',
        title: 'Ajuste Fino de Texto, Linhas, Terminais e Cor',
        body: 'Expanda os grupos sanfonados para configurar Fonte, Tamanho do texto, Espessura da linha, Prolongamento, Recuo até o ponto medido, 6 tipos de Terminais (Tick, Seta fechada, Seta aberta, Ponto, Losango, Nenhum) e Cor RGB.',
      },
      {
        num: '3',
        title: 'Salvar na Biblioteca Global ou Aplicar na Cena',
        body: 'Clique em "Salvar estilo" para persistir na sua biblioteca global entre projetos e atualizar as cotas que usam esse estilo, ou use "Mais ações" para aplicar às cotas selecionadas.',
      },
    ],
    controls: [
      {
        name: '6 Terminais Nativos em Geometria Real',
        description:
          'Tick (traço arquitetônico a 45°), Seta fechada, Seta aberta, Ponto, Losango e Nenhum — todos visíveis tanto na viewport quanto no passe de render.',
      },
      {
        name: 'Conversão Automática de Unidade no Editor',
        description:
          'Mude "Unidade dos valores" entre mm, cm e m para editar parâmetros na grandeza que preferir sem alterar a unidade exibida nas cotas da cena.',
      },
      {
        name: 'Menu Mais ações de Estilo',
        description:
          'Permite Duplicar estilo, Excluir estilo, Recarregar biblioteca, Aplicar às cotas selecionadas ou Aplicar a todas as cotas da cena.',
      },
    ],
    proTip:
      'Crie um estilo "Planta Geral (cm)" com terminal Tick para layouts amplos e duplique para um estilo "Marcenaria (mm)" com Seta fechada para detalhamento de móveis.',
  },
  {
    id: 'revisar',
    code: 'PASSO 05',
    label: 'Revisar & Override',
    sub: 'Auditoria 1803 → 1800 mm e Âmbar',
    stepTag: 'PASSO 05 · ABA REVISAR E AUDITORIA DE OVERRIDE MANUAL',
    title: 'Arredonde ou sobrescreva medidas mantendo auditoria visual em âmbar.',
    summary:
      'Captura real de auditoria no 3ds Max 2026: a ilha gourmet foi modelada com 1803 mm, mas na aba Revisar definimos o valor comercial fechado de 1800 mm com justificativa. O plugin registra a diferença (-3 mm) e pinta a cota em âmbar (#F5A623) na viewport!',
    sceneContext: 'Cota Auditada: ID dimension-39 · Medido: 1803 mm · Exibido: 1800 mm · Diferença: -3 mm',
    captures: [
      {
        id: 'board-05',
        label: 'Prancha Anotada',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_05_revisar_override.png',
        width: 1600,
        height: 1020,
        caption:
          'Prancha explicativa mostrando a aba Revisar com a cota dimension-39 selecionada (Medido 1803 mm vs. Exibido 1800 mm) e o destaque automático em âmbar na viewport do 3ds Max 2026.',
      },
      {
        id: 'ui-revisar',
        label: 'Janela Real · Aba Revisar',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_05_revisar_override.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Revisar exibindo ID dimension-39, Medido na cena: 1803 mm, Exibido: 1800 mm, Diferença: -3 mm, Referências: Ilha_Gourmet · Ilha_Gourmet e Motivo da alteração.',
      },
      {
        id: 'render-override',
        label: 'Viewport 3ds Max · Destaque Âmbar',
        badge: 'RENDER REAL 3DS MAX',
        src: '/images/plugins/cotas/render_05_override_viewport.png',
        width: 1100,
        height: 760,
        caption:
          'Render real no 3ds Max 2026 destacando a cota de 1800 mm da Ilha Gourmet em cor âmbar (#F5A623) para sinalizar que o valor exibido possui override manual ativo.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Painel de Auditoria (Medido vs. Exibido vs. Diferença)',
        body: 'Ao selecionar qualquer cota na viewport e clicar em "Ler seleção atual", o quadro superior mostra o ID único (dimension-39), o valor Medido na cena (1803 mm), o Exibido (1800 mm), a Diferença (-3 mm) e os objetos de referência.',
      },
      {
        num: '2',
        title: 'Modos de Exibição + Motivo da Alteração',
        body: 'Escolha entre "Usar o valor medido", "Arredondar o valor", "Informar outro número" (ex.: 1800) ou "Escrever um texto personalizado", e documente o motivo (ex.: "Ajuste comercial de pedra para 1800 mm em projeto executivo").',
      },
      {
        num: '3',
        title: 'Sinalização Âmbar (#F5A623) na Viewport',
        body: 'Ao clicar em "Aplicar alteração", a cota com override assume cor âmbar de auditoria na viewport para que nenhum projetista confunda uma medida forçada com a medida bruta do 3D.',
      },
    ],
    controls: [
      {
        name: 'Selecionar referências na viewport',
        description:
          'Seleciona imediatamente no 3ds Max os objetos aos quais a cota está ancorada (ex.: Ilha_Gourmet) para conferência rápida.',
      },
      {
        name: 'Restaurar valor medido',
        description:
          'Remove com 1 clique qualquer override numérico/textual ou arredondamento e devolve a cota ao cálculo 100% automático da geometria.',
      },
      {
        name: 'Histórico em Custom Attributes',
        description:
          'O valor manual e o motivo da alteração ficam gravados dentro do próprio arquivo .max nos metadados da cota.',
      },
    ],
    proTip:
      'Precisa fechar dezenas de medidas quebradas de modelagem (como 1803 mm ou 2398 mm) sem digitar uma por uma? Use a opção "Arredondar o valor" com incremento de 5 mm ou 10 mm!',
  },
  {
    id: 'exportar',
    code: 'PASSO 06',
    label: 'Exportar PNG Alpha',
    sub: 'Corona/V-Ray + Composição Final',
    stepTag: 'PASSO 06 · ABA EXPORTAR (PASSE PNG TRANSPARENTE)',
    title: 'Gere um passe PNG com fundo transparente e sobreponha ao seu Beauty render.',
    summary:
      'Capturas reais do fluxo completo de exportação: a aba Exportar detecta o Corona Renderer ativo, isola temporariamente as cotas e salva um PNG RGBA com fundo 100% transparente — pronto para jogar por cima do Beauty Render no Photoshop sem re-renderizar a cena!',
    sceneContext: 'Renderer: Corona [Corona] (suportado) · Saída: ameno_cotas_pass.png (RGBA Alpha)',
    captures: [
      {
        id: 'board-06',
        label: 'Prancha Anotada · Fluxo A + B = C',
        badge: 'TUTORIAL 1600×1020',
        src: '/images/plugins/cotas/tutorial_06_exportar_composicao.png',
        width: 1600,
        height: 1020,
        caption:
          'Prancha completa mostrando a aba Exportar e os 3 estágios reais: (A) Beauty Render limpo sem cotas, (B) Passe PNG Transparente contendo só as cotas e (C) Composição Final.',
      },
      {
        id: 'ui-exportar',
        label: 'Janela Real · Aba Exportar',
        badge: 'PRINT PYSIDE6',
        src: '/images/plugins/cotas/ui_06_exportar_png.png',
        width: 560,
        height: 720,
        caption:
          'Captura real da aba Exportar com "Renderer: Corona [Corona]", "Estado: suportado", caminho de saída em renderoutput\\ameno_cotas_pass.png e opção "Transparente, só as cotas".',
      },
      {
        id: 'render-beauty',
        label: 'Passe A · Beauty Render Limpo',
        badge: 'BEAUTY SEM COTAS',
        src: '/images/plugins/cotas/render_06_beauty_clean.png',
        width: 1100,
        height: 760,
        caption:
          'Passe A: Render Beauty original da cena no 3ds Max 2026 com a layer de cotas desligada — iluminação e materiais permanecem 100% limpos.',
      },
      {
        id: 'render-alpha',
        label: 'Passe B · PNG Transparente (Só Cotas)',
        badge: 'CANAL ALPHA RGBA',
        src: '/images/plugins/cotas/render_07_alpha_pass.png',
        width: 1100,
        height: 760,
        caption:
          'Passe B: Arquivo PNG real com fundo transparente (canal Alpha) exportado pelo plugin contendo exclusivamente as linhas, terminais e textos das cotas.',
        isAlpha: true,
      },
      {
        id: 'render-composited',
        label: 'Passe C · Composição Final (A + B)',
        badge: 'RESULTADO FINAL',
        src: '/images/plugins/cotas/render_08_composited_final.png',
        width: 1100,
        height: 760,
        caption:
          'Passe C: Resultado final da sobreposição do Passe B (PNG transparente de cotas) sobre o Passe A (Beauty Render limpo).',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Detecção Automática do Renderer (Corona / V-Ray)',
        body: 'No bloco "Renderer", o plugin identifica automaticamente o motor ativo na cena (ex.: Corona [Corona] — suportado) e utiliza a câmera ou vista atual do 3ds Max.',
      },
      {
        num: '2',
        title: 'Escolha o Arquivo, Escopo e Fundo Transparente',
        body: 'Defina onde salvar o arquivo .png, escolha se deseja incluir "Todas as cotas" ou "Somente as selecionadas" e mantenha marcado "Transparente, só as cotas".',
      },
      {
        num: '3',
        title: 'Clique em "Exportar PNG" e Componha na Pós',
        body: 'Em uma sessão isolada não-destrutiva, o plugin oculta o restante da cena, renderiza somente as cotas com canal Alpha limpo e restaura todos os objetos, luzes e materiais ao estado original.',
      },
    ],
    controls: [
      {
        name: 'Isolamento Transacional Não-Destrutivo',
        description:
          'Nenhuma configuração de GI, exposição, LightMix ou material da sua cena é perdida: tudo é restaurado automaticamente assim que o PNG termina de ser salvo.',
      },
      {
        name: 'Todas as cotas vs. Somente as selecionadas',
        description:
          'Exporte passes separados (ex.: um PNG só com as cotas gerais do ambiente e outro PNG só com as cotas internas de marcenaria) para ligar/desligar camadas no Photoshop.',
      },
      {
        name: 'Menu Mais ações (Abrir pasta / Copiar caminho)',
        description:
          'Abra a pasta de saída diretamente no Windows Explorer ou copie o caminho do PNG gerado para a área de transferência.',
      },
    ],
    proTip:
      'Como o passe PNG exportado tem exatamente a mesma câmera e resolução do seu Beauty render, basta arrastar o arquivo para cima do render no Photoshop segurando Shift para encaixar pixel a pixel.',
  },
]

export default function PluginTutorial() {
  const [activeStepId, setActiveStepId] = useState<StepId>('ativacao')
  const [selectedCaptureIndex, setSelectedCaptureIndex] = useState<number>(0)
  const [lightboxAsset, setLightboxAsset] = useState<CaptureAsset | null>(null)

  const currentStep =
    TUTORIAL_STEPS.find((step) => step.id === activeStepId) ?? TUTORIAL_STEPS[0]
  const activeCapture =
    currentStep.captures[selectedCaptureIndex] ?? currentStep.captures[0]

  const handleSelectStep = (stepId: StepId, captureIndex = 0) => {
    setActiveStepId(stepId)
    setSelectedCaptureIndex(captureIndex)
  }

  useEffect(() => {
    if (!lightboxAsset) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxAsset(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxAsset])

  return (
    <section
      id="tutorial"
      className={styles.tutorialSection}
      aria-labelledby="tutorial-heading"
    >
      <div className={styles.inner}>
        {/* Cabeçalho da seção */}
        <div className={styles.headerGrid}>
          <div>
            <span className={styles.eyebrow}>
              TUTORIAL REAL · CAPTURADO NO 3DS MAX 2026
            </span>
            <h2 id="tutorial-heading" className={styles.title}>
              Veja o plugin aberto no Max.<br />
              <span className={styles.titleAccent}>
                Aprenda cada função com fotos reais.
              </span>
            </h2>
          </div>
          <p className={styles.lead}>
            Todas as imagens abaixo são <strong>capturas reais do Ameno Cotas rodando dentro do Autodesk 3ds Max 2026</strong>.
            Navegue pelos 7 passos para ver as janelas reais do plugin, os renders da viewport 3D, a reação automática
            das âncoras ao mover móveis e o passe PNG transparente.
          </p>
        </div>

        {/* Barra de navegação dos 7 passos */}
        <div
          className={styles.tabBar}
          role="tablist"
          aria-label="Passos do tutorial com capturas reais no 3ds Max 2026"
        >
          {TUTORIAL_STEPS.map((step) => {
            const isActive = step.id === activeStepId
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.tabButton} ${
                  isActive ? styles.tabButtonActive : ''
                }`}
                onClick={() => handleSelectStep(step.id, 0)}
              >
                <span className={styles.tabCode}>{step.code}</span>
                <span className={styles.tabLabel}>{step.label}</span>
                <span className={styles.tabSub}>{step.sub}</span>
              </button>
            )
          })}
        </div>

        {/* Área principal: Visualizador de Capturas Reais (Esquerda) + Guia Explicativo (Direita) */}
        <div className={styles.workspace}>
          {/* ── COLUNA ESQUERDA: PRANCHAS ANOTADAS E PRINTS REAIS ── */}
          <div className={styles.showcasePanel}>
            <div className={styles.showcaseTopbar}>
              <div className={styles.showcaseBrand}>
                <span className={styles.windowBadge}>A</span>
                <span>{currentStep.sceneContext}</span>
              </div>
              <span className={styles.captureBadge}>{activeCapture.badge}</span>
            </div>

            {/* Seletor entre a Prancha Explicativa Anotada e os Prints Individuais */}
            <div
              className={styles.captureSwitcher}
              role="group"
              aria-label="Alternar entre prancha anotada e prints individuais"
            >
              {currentStep.captures.map((cap, idx) => {
                const isSelected = idx === selectedCaptureIndex
                return (
                  <button
                    key={cap.id}
                    type="button"
                    className={`${styles.captureTabBtn} ${
                      isSelected ? styles.captureTabBtnActive : ''
                    }`}
                    onClick={() => setSelectedCaptureIndex(idx)}
                  >
                    <span className={styles.captureTabIndex}>0{idx + 1}</span>
                    <span>{cap.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Moldura da imagem real com clique para ampliar */}
            <div
              className={`${styles.imageStage} ${
                activeCapture.isAlpha ? styles.imageStageAlpha : ''
              }`}
            >
              <button
                type="button"
                className={styles.imageZoomTrigger}
                onClick={() => setLightboxAsset(activeCapture)}
                aria-label={`Ampliar imagem: ${activeCapture.label}`}
              >
                <Image
                  src={activeCapture.src}
                  alt={activeCapture.caption}
                  width={activeCapture.width}
                  height={activeCapture.height}
                  unoptimized
                  className={styles.stageImage}
                />
                <span className={styles.zoomHintPill}>
                  🔍 Clique para ampliar em alta resolução ({activeCapture.width}×{activeCapture.height})
                </span>
              </button>
            </div>

            {/* Legenda técnica + Miniaturas rápidas de todas as capturas deste passo */}
            <div className={styles.showcaseFooter}>
              <p className={styles.captureCaption}>{activeCapture.caption}</p>

              <div className={styles.thumbStrip}>
                {currentStep.captures.map((cap, idx) => {
                  const isSelected = idx === selectedCaptureIndex
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      className={`${styles.thumbCard} ${
                        isSelected ? styles.thumbCardActive : ''
                      }`}
                      onClick={() => setSelectedCaptureIndex(idx)}
                    >
                      <div
                        className={`${styles.thumbImageWrap} ${
                          cap.isAlpha ? styles.imageStageAlpha : ''
                        }`}
                      >
                        <Image
                          src={cap.src}
                          alt={cap.label}
                          width={320}
                          height={204}
                          unoptimized
                          className={styles.thumbImage}
                        />
                      </div>
                      <span className={styles.thumbLabel}>{cap.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── COLUNA DIREITA: EXPLICAÇÃO DETALHADA DOS MARCADORES 1, 2, 3 ── */}
          <div className={styles.guidePanel}>
            <div className={styles.guideHeader}>
              <span className={styles.guideStepTag}>{currentStep.stepTag}</span>
              <h3 className={styles.guideTitle}>{currentStep.title}</h3>
              <p className={styles.guideSummary}>{currentStep.summary}</p>
            </div>

            <div>
              <h4 className={styles.blockHeading}>
                Como usar (acompanhe os marcadores 1 · 2 · 3 na imagem)
              </h4>
              <ol className={styles.howToList}>
                {currentStep.callouts.map((callout) => (
                  <li key={callout.num} className={styles.howToItem}>
                    <span className={styles.howToNum}>{callout.num}</span>
                    <div className={styles.howToText}>
                      <strong>{callout.title}:</strong> {callout.body}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.controlsCatalog}>
              <h4 className={styles.blockHeading}>
                Funções e Controles desta Etapa
              </h4>
              {currentStep.controls.map((ctrl) => (
                <div key={ctrl.name} className={styles.controlItem}>
                  <span className={styles.controlName}>{ctrl.name}</span>
                  <p className={styles.controlDesc}>{ctrl.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.proTipBox}>
              <span className={styles.proTipLabel}>DICA DE PRODUÇÃO</span>
              <p className={styles.proTipText}>{currentStep.proTip}</p>
            </div>
          </div>
        </div>

        {/* ── GALERIA SEQUENCIAL COMPLETA DAS 7 PRANCHAS REAIS ────────── */}
        <div className={styles.allBoardsSection}>
          <div className={styles.allBoardsHeader}>
            <div>
              <span className={styles.eyebrow}>VISÃO GERAL DO FLUXO REAL</span>
              <h3 className={styles.allBoardsTitle}>
                Todas as 7 pranchas do tutorial em sequência
              </h3>
            </div>
            <p className={styles.allBoardsLead}>
              Clique em qualquer prancha abaixo para abrir em tela cheia (1600×1020) ou carregar
              os prints individuais da respectiva aba no visualizador acima.
            </p>
          </div>

          <div className={styles.boardsGrid}>
            {TUTORIAL_STEPS.map((step) => {
              const board = step.captures[0]
              const isCurrent = step.id === activeStepId
              return (
                <article
                  key={step.id}
                  className={`${styles.boardCard} ${
                    isCurrent ? styles.boardCardActive : ''
                  }`}
                >
                  <button
                    type="button"
                    className={styles.boardImageBtn}
                    onClick={() => setLightboxAsset(board)}
                    aria-label={`Ampliar prancha ${step.code}: ${step.label}`}
                  >
                    <Image
                      src={board.src}
                      alt={board.caption}
                      width={board.width}
                      height={board.height}
                      unoptimized
                      className={styles.boardImage}
                    />
                  </button>
                  <div className={styles.boardMeta}>
                    <div className={styles.boardMetaTop}>
                      <span className={styles.boardCode}>{step.code}</span>
                      <span className={styles.boardCapturesCount}>
                        {step.captures.length} fotos reais
                      </span>
                    </div>
                    <h4 className={styles.boardCardTitle}>{step.label}</h4>
                    <p className={styles.boardCardDesc}>{step.title}</p>
                    <div className={styles.boardCardActions}>
                      <button
                        type="button"
                        className={styles.boardActionBtn}
                        onClick={() => {
                          handleSelectStep(step.id, 0)
                          document
                            .getElementById('tutorial')
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        Ver passo detalhado ↑
                      </button>
                      <button
                        type="button"
                        className={styles.boardZoomBtn}
                        onClick={() => setLightboxAsset(board)}
                      >
                        Ampliar 1600px
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* ── BARRA DE ATALHOS E COMPORTAMENTOS NA VIEWPORT ────────── */}
        <div className={styles.shortcutsStrip}>
          <div className={styles.shortcutsHeader}>
            <h3 className={styles.shortcutsTitle}>
              Atalhos e Comportamentos na Viewport do 3ds Max
            </h3>
            <span className={styles.shortcutsTag}>
              REFERÊNCIA RÁPIDA DE OPERAÇÃO
            </span>
          </div>
          <div className={styles.shortcutsGrid}>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Tecla S (Snap 3D)</span>
              <p className={styles.shortcutDesc}>
                Mantenha o Snap em Vertex/Endpoint ativo ao clicar nos pontos A e B para criar
                âncoras reativas presas aos vértices da malha.
              </p>
            </div>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Clique no Vazio / Esc</span>
              <p className={styles.shortcutDesc}>
                No modo Várias medidas (cadeia), um clique em área vazia finaliza a sequência.
                Durante um trecho incompleto, Esc cancela sem deixar sobras.
              </p>
            </div>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Ctrl + Z (Undo Único)</span>
              <p className={styles.shortcutDesc}>
                Cada criação individual ou cadeia inteira de cotas é registrada em um bloco
                atômico de Undo do 3ds Max.
              </p>
            </div>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Cor Âmbar (#F5A623)</span>
              <p className={styles.shortcutDesc}>
                Indica na viewport que a cota possui valor manual ou arredondado na aba Revisar,
                diferenciando medidas editadas das medidas automáticas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL LIGHTBOX PARA INSPEÇÃO EM ALTA RESOLUÇÃO ────────── */}
      {lightboxAsset && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxAsset.label}
          onClick={() => setLightboxAsset(null)}
        >
          <div
            className={styles.lightboxDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxHeader}>
              <div>
                <span className={styles.lightboxBadge}>{lightboxAsset.badge}</span>
                <strong className={styles.lightboxTitle}>
                  {lightboxAsset.label}
                </strong>
              </div>
              <button
                type="button"
                className={styles.lightboxCloseBtn}
                onClick={() => setLightboxAsset(null)}
              >
                Fechar [Esc] ✕
              </button>
            </div>
            <div
              className={`${styles.lightboxBody} ${
                lightboxAsset.isAlpha ? styles.imageStageAlpha : ''
              }`}
            >
              <Image
                src={lightboxAsset.src}
                alt={lightboxAsset.caption}
                width={lightboxAsset.width}
                height={lightboxAsset.height}
                unoptimized
                className={styles.lightboxImage}
              />
            </div>
            <p className={styles.lightboxCaption}>{lightboxAsset.caption}</p>
          </div>
        </div>
      )}
    </section>
  )
}
