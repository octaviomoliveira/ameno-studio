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

interface QuickFaq {
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
  controls: QuickFaq[]
  proTip: string
}

const TUTORIAL_STEPS: TutorialStepDoc[] = [
  {
    id: 'cotar-single',
    code: 'PASSO 1',
    label: 'Medir 1 Vão',
    sub: '3 cliques e tá feito',
    stepTag: 'COMO MEDIR UMA DISTÂNCIA SIMPLES',
    title: 'Clique no começo, clique no fim e puxe a linha pro lado!',
    summary:
      'Sabe como você mede no AutoCAD ou no Revit? Aqui é igualzinho, direto dentro do 3ds Max.',
    sceneContext: 'Aba Cotar · Medindo uma bancada de 295 cm em 3 cliques',
    captures: [
      {
        id: 'board-01',
        label: 'Ver Explicação na Foto',
        badge: 'PASSO A PASSO',
        src: '/images/plugins/cotas/tutorial_01_cotar_single.png',
        width: 1600,
        height: 1020,
        caption:
          '1º clique num canto da bancada → 2º clique no outro canto → 3º clique puxa a linha de 295 cm.',
      },
      {
        id: 'ui-cotar-single',
        label: 'Só a Janela do Plugin',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_01_cotar_single.png',
        width: 560,
        height: 720,
        caption:
          'Janela do plugin aberta na aba Cotar com "Uma medida" e "Planta" marcados.',
      },
      {
        id: 'render-single-plan',
        label: 'Só a Tela do 3ds Max',
        badge: 'TELA DO MAX',
        src: '/images/plugins/cotas/render_01_single_plan.png',
        width: 1100,
        height: 760,
        caption:
          'Bancada vista de cima no 3ds Max com a cota de 295 cm pronta.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Deixe marcado "Uma medida"',
        body: 'Serve pra medir qualquer espaço de um ponto até outro.',
      },
      {
        num: '2',
        title: 'Escolha "Planta" ou "Fachada / Vista"',
        body: 'Visto de cima? Clique em Planta. Visto de frente? Clique em Fachada / Vista.',
      },
      {
        num: '3',
        title: 'Aperte o botão vermelho "Iniciar cotação"',
        body: 'Ligue o imã do Max (tecla S) e dê 3 cliques no modelo: começo, fim e onde a linha vai ficar.',
      },
    ],
    controls: [
      {
        name: 'Quer mudar de milímetros (mm) pra centímetros (cm)?',
        description:
          'Clique em "Ajustar detalhes" ali no meio da janela e troque a Unidade pra cm, mm ou m.',
      },
      {
        name: 'Clicou no lugar errado?',
        description:
          'É só apertar ESC no teclado que ele cancela na hora, ou Ctrl+Z pra desfazer.',
      },
    ],
    proTip:
      'Não esqueça de ligar o Snap do 3ds Max (tecla S no teclado) pra cota grudar certinho na quina do móvel!',
  },
  {
    id: 'cotar-chain',
    code: 'PASSO 2',
    label: 'Medir Vários',
    sub: 'O armário todo de uma vez',
    stepTag: 'COMO MEDIR VÁRIOS MÓDULOS SEGUIDOS',
    title: 'Cote um armário inteiro sem ter que começar do zero a cada porta.',
    summary:
      'Depois que você faz a primeira medida, é só continuar clicando nos próximos cantos que ele vai criando as próximas cotas todas alinhadinhas.',
    sceneContext: 'Aba Cotar · Fazendo 165 cm + 135 cm + 120 cm em sequência',
    captures: [
      {
        id: 'board-02',
        label: 'Ver Explicação na Foto',
        badge: 'PASSO A PASSO',
        src: '/images/plugins/cotas/tutorial_02_cotar_chain.png',
        width: 1600,
        height: 1020,
        caption:
          'Com "Várias medidas" ligado, cada clique novo já puxa o próximo módulo alinhado na mesma altura.',
      },
      {
        id: 'ui-cotar-chain',
        label: 'Só a Janela do Plugin',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_02_cotar_chain.png',
        width: 560,
        height: 720,
        caption:
          'Aba Cotar marcada em "Várias medidas", "Fachada / Vista" e "Horizontal".',
      },
      {
        id: 'render-chain-elevation',
        label: 'Só a Tela do 3ds Max',
        badge: 'TELA DO MAX',
        src: '/images/plugins/cotas/render_02_chain_elevation.png',
        width: 1100,
        height: 760,
        caption:
          'Cozinha inteira cotada na largura (165 · 135 · 120 cm) e na altura (90 · 60 · 75 cm).',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Mude para "Várias medidas"',
        body: 'Fica logo ao lado do botão "Uma medida" no topo da janela.',
      },
      {
        num: '2',
        title: 'Marque "Fachada / Vista"',
        body: 'Deixa os números em pé, virados de frente pra você ler na vista frontal.',
      },
      {
        num: '3',
        title: 'Escolha "Horizontal" ou "Vertical"',
        body: 'Horizontal mede larguras lado a lado. Vertical mede alturas de baixo pra cima. Quando acabar, aperte ESC!',
      },
    ],
    controls: [
      {
        name: 'Como eu paro de medir quando acabar o armário?',
        description:
          'Basta apertar a tecla ESC ou clicar em qualquer espaço vazio da tela.',
      },
      {
        name: 'E se eu quiser apagar a fila inteira?',
        description:
          'Aperte Ctrl+Z uma única vez que ele desfaz a fila inteira de uma vez só.',
      },
    ],
    proTip:
      'Faça primeiro todas as larguras em cima (Horizontal) e depois mude para Vertical pra fazer todas as alturas na lateral!',
  },
  {
    id: 'ancoras',
    code: 'PASSO 3',
    label: 'Muda Sozinho',
    sub: 'Arrastou o móvel? Atualiza',
    stepTag: 'O QUE ACONTECE SE VOCÊ MUDAR O PROJETO DEPOIS?',
    title: 'Arrastou a parede ou o móvel? O número da cota muda sozinho!',
    summary:
      'Você não precisa apagar as cotas e fazer tudo de novo quando o cliente pede pra afastar uma ilha ou aumentar um armário.',
    sceneContext: 'Antes (corredor de 700 mm) → Depois de arrastar a ilha (virou 1150 mm sozinho)',
    captures: [
      {
        id: 'board-03',
        label: 'Comparar Antes e Depois',
        badge: 'ANTES × DEPOIS',
        src: '/images/plugins/cotas/tutorial_03_ancoras_reativas.png',
        width: 1600,
        height: 1020,
        caption:
          'Na esquerda o corredor tinha 700 mm. Arrastamos a ilha pro lado e na direita a cota mudou sozinha para 1150 mm!',
      },
      {
        id: 'render-anchor-before',
        label: 'Foto 1 · Antes (700 mm)',
        badge: 'ANTES DE MOVER',
        src: '/images/plugins/cotas/render_03_anchor_before.png',
        width: 1100,
        height: 760,
        caption:
          'Antes de mexer na ilha: o corredor entre a parede e a ilha mede 700 mm.',
      },
      {
        id: 'render-anchor-after',
        label: 'Foto 2 · Depois (1150 mm)',
        badge: 'DEPOIS DE MOVER',
        src: '/images/plugins/cotas/render_04_anchor_after.png',
        width: 1100,
        height: 760,
        caption:
          'Depois de arrastar a ilha 45 cm para a direita: a cota esticou sozinha e já mostra 1150 mm.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'A cota fica "grudada" nas quinas',
        body: 'Quando você cria a cota usando o imã (Snap S), ela lembra em qual móvel e em qual canto você clicou.',
      },
      {
        num: '2',
        title: 'Moveu o móvel? O número recalcula na hora',
        body: 'Tanto faz mover a peça inteira ou puxar os pontinhos (vértices) no Edit Poly: a linha estica e o valor muda sozinho.',
      },
      {
        num: '3',
        title: 'A cota do móvel anda junto com ele',
        body: 'Repare que a cota de 1800 mm que estava em cima da ilha caminhou junto com a ilha sem sair do lugar.',
      },
    ],
    controls: [
      {
        name: 'Preciso apertar algum botão pra cota atualizar?',
        description:
          'Não! Assim que você move o objeto no 3ds Max, a cota já se ajusta automaticamente.',
      },
      {
        name: 'E se eu deletar o móvel da cena?',
        description:
          'A cota continua lá sem dar erro, e você pode limpar cotas sem dono clicando em "Mais ações → Limpar cotas órfãs".',
      },
    ],
    proTip:
      'Isso economiza horas de retrabalho: faça as cotas uma vez só e ajuste o layout à vontade.',
  },
  {
    id: 'estilos',
    code: 'PASSO 4',
    label: 'Cor e Seta',
    sub: 'Tracinho, seta e tamanho',
    stepTag: 'ABA ESTILOS · DEIXE DO SEU JEITO',
    title: 'Letra pequena? Linha fina? Quer trocar tracinho por seta? É aqui!',
    summary:
      'Na 2ª aba (Estilos), você muda o visual da cota vendo um desenho ao vivo no meio da janela antes mesmo de aplicar.',
    sceneContext: 'Aba Estilos · Comparando Tracinho (Tick) com Seta Fechada Vermelha',
    captures: [
      {
        id: 'board-04',
        label: 'Ver Explicação na Foto',
        badge: 'PASSO A PASSO',
        src: '/images/plugins/cotas/tutorial_04_estilos_terminais.png',
        width: 1600,
        height: 1020,
        caption:
          'Compare o estilo com tracinho inclinado (Tick) na esquerda e o estilo com Seta fechada vermelha na direita.',
      },
      {
        id: 'ui-estilos-tick',
        label: 'Estilo 1 · Tracinho (Tick)',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_03_estilos_tick.png',
        width: 560,
        height: 720,
        caption:
          'Aba Estilos mostrando o quadradinho de Prévia 2D com tracinho arquitetônico (Tick) e ajustes de tamanho do texto.',
      },
      {
        id: 'ui-estilos-arrow',
        label: 'Estilo 2 · Seta Vermelha',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_04_estilos_arrow.png',
        width: 560,
        height: 720,
        caption:
          'Aba Estilos com a ponta trocada para "Seta fechada" e cor vermelha.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Olhe a telinha de Prévia 2D',
        body: 'Tudo o que você muda aparece desenhado na hora nesse quadro escuro no meio da janela.',
      },
      {
        num: '2',
        title: 'Abra "Texto", "Linhas" ou "Terminais"',
        body: 'Ali você aumenta a letra, engrossa a linha e escolhe a ponta: Tracinho (Tick), Seta fechada, Seta aberta, Ponto ou Losango.',
      },
      {
        num: '3',
        title: 'Clique em "Salvar estilo"',
        body: 'As cotas da sua cena já mudam na hora e esse visual fica salvo pros seus próximos arquivos do Max.',
      },
    ],
    controls: [
      {
        name: 'Posso ter um estilo pra Planta e outro pra Marcenaria?',
        description:
          'Sim! Clique em "Novo estilo" lá em cima, dê um nome (ex.: Marcenaria) e salve quantos quiser.',
      },
      {
        name: 'Como mudo a cor da cota?',
        description:
          'Role até o final da aba Estilos, abra "Cor" e escolha a cor que quiser.',
      },
    ],
    proTip:
      'Você só precisa configurar seu estilo favorito uma vez: ele fica salvo no seu computador para todos os projetos futuros!',
  },
  {
    id: 'revisar',
    code: 'PASSO 5',
    label: 'Arredondar',
    sub: 'Forçar número na mão',
    stepTag: 'ABA REVISAR · QUANDO O 3D ESTÁ QUEBRADO (EX.: 1803 mm)',
    title: 'No 3D deu 1803 mm, mas na marcenaria tem que sair 1800 mm? Mude aqui!',
    summary:
      'Às vezes a modelagem fica 2 ou 3 milímetros torta, mas você precisa entregar a cota redondinha. Na 3ª aba (Revisar), você arredonda ou digita o número que quiser.',
    sceneContext: 'Aba Revisar · Mudando de 1803 mm para 1800 mm (fica laranja na tela)',
    captures: [
      {
        id: 'board-05',
        label: 'Ver Explicação na Foto',
        badge: 'PASSO A PASSO',
        src: '/images/plugins/cotas/tutorial_05_revisar_override.png',
        width: 1600,
        height: 1020,
        caption:
          'A aba Revisar mostra que no 3D mede 1803 mm, muda o texto para 1800 mm e deixa a cota laranja/âmbar na tela.',
      },
      {
        id: 'ui-revisar',
        label: 'Só a Janela do Plugin',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_05_revisar_override.png',
        width: 560,
        height: 720,
        caption:
          'Painel mostrando Medido na cena: 1803 mm, Exibido: 1800 mm e Diferença: -3 mm.',
      },
      {
        id: 'render-override',
        label: 'Só a Tela do 3ds Max',
        badge: 'TELA DO MAX',
        src: '/images/plugins/cotas/render_05_override_viewport.png',
        width: 1100,
        height: 760,
        caption:
          'A cota de 1800 mm fica amarela/laranja na tela do Max pra você nunca esquecer que mudou o número na mão.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Clique na cota e veja a medida real',
        body: 'O quadro lá no alto te conta a verdade: quanto mede de verdade no 3D (1803 mm) e o que está escrito (1800 mm).',
      },
      {
        num: '2',
        title: 'Arredonde ou digite qualquer valor',
        body: 'Você pode mandar arredondar sozinho (de 5 em 5 mm) ou escolher "Informar outro número" e digitar 1800.',
      },
      {
        num: '3',
        title: 'Clique em "Aplicar alteração"',
        body: 'Pronto! A cota muda para 1800 mm e fica laranja na viewport pra você bater o olho e saber que foi editada.',
      },
    ],
    controls: [
      {
        name: 'Arrependi! Como volto pro valor real do 3D?',
        description:
          'É só clicar no botão "Restaurar valor medido" ali embaixo que ela volta pros 1803 mm originais na hora.',
      },
      {
        name: 'Posso escrever palavras junto com o número?',
        description:
          'Sim! Escolha "Escrever um texto personalizado" para colocar coisas como "180 cm (conferir em obra)".',
      },
    ],
    proTip:
      'A cor laranja/âmbar na viewport é o seu seguro contra erros: você sabe exatamente quais cotas são automáticas e quais você forçou na mão.',
  },
  {
    id: 'exportar',
    code: 'PASSO 6',
    label: 'Salvar PNG',
    sub: 'Sem fundo pro Photoshop',
    stepTag: 'ABA EXPORTAR · O JEITO MAIS FÁCIL DE ENTREGAR',
    title: 'Salve um PNG só com as cotas (fundo transparente) e jogue em cima do render!',
    summary:
      'Esqueça ter que renderizar a imagem inteira de novo só por causa das cotas. Na 4ª aba (Exportar), ele salva uma imagem transparente só com os traços e números em segundos.',
    sceneContext: 'Aba Exportar · Render Limpo (1) + PNG Transparente (2) = Imagem Final (3)',
    captures: [
      {
        id: 'board-06',
        label: 'Ver Explicação na Foto',
        badge: 'PASSO A PASSO',
        src: '/images/plugins/cotas/tutorial_06_exportar_composicao.png',
        width: 1600,
        height: 1020,
        caption:
          'Veja os 3 quadros: (1) seu render limpo, (2) o PNG sem fundo que o plugin salva e (3) os dois juntos no Photoshop!',
      },
      {
        id: 'ui-exportar',
        label: 'Só a Janela do Plugin',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_06_exportar_png.png',
        width: 560,
        height: 720,
        caption:
          'Aba Exportar reconhecendo o Corona Renderer sozinho e pronta pra salvar o PNG transparente.',
      },
      {
        id: 'render-beauty',
        label: '1 · Seu Render Limpo',
        badge: 'SEM COTAS',
        src: '/images/plugins/cotas/render_06_beauty_clean.png',
        width: 1100,
        height: 760,
        caption:
          'Seu render normal da cena, limpinho, sem nenhuma linha em cima.',
      },
      {
        id: 'render-alpha',
        label: '2 · O PNG Sem Fundo',
        badge: 'FUNDO TRANSPARENTE',
        src: '/images/plugins/cotas/render_07_alpha_pass.png',
        width: 1100,
        height: 760,
        caption:
          'O arquivo PNG que o plugin gera: o fundo é 100% transparente, só existem as linhas e números.',
        isAlpha: true,
      },
      {
        id: 'render-composited',
        label: '3 · Juntando os Dois!',
        badge: 'RESULTADO FINAL',
        src: '/images/plugins/cotas/render_08_composited_final.png',
        width: 1100,
        height: 760,
        caption:
          'Como fica quando você joga o PNG transparente por cima do seu render no Photoshop.',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Escolha onde salvar o arquivo',
        body: 'Clique em "Escolher arquivo..." para escolher a pasta e o nome do seu PNG.',
      },
      {
        num: '2',
        title: 'Deixe marcado "Transparente, só as cotas"',
        body: 'Assim ele esconde os móveis rapidinho, tira a foto só das cotas sem fundo e devolve seus móveis pro lugar.',
      },
      {
        num: '3',
        title: 'Clique no botão vermelho "Exportar PNG"',
        body: 'Pronto! Agora é só abrir esse PNG no Photoshop ou Canva e soltar em cima do seu render.',
      },
    ],
    controls: [
      {
        name: 'Isso bagunça as luzes ou os materiais da minha cena?',
        description:
          'De jeito nenhum! Ele faz isso separado e deixa sua cena, luzes e materiais exatamente como estavam.',
      },
      {
        name: 'Funciona no Corona e no V-Ray?',
        description:
          'Sim, funciona automático nos dois! Ele já detecta qual você está usando.',
      },
    ],
    proTip:
      'Quer mandar pro cliente 1 imagem limpa e 1 imagem com cotas? Com o PNG separado você liga e desliga a camada de cotas em 1 clique!',
  },
  {
    id: 'ativacao',
    code: 'PASSO 7',
    label: 'Ativar (1ª Vez)',
    sub: 'Cola o código e pronto',
    stepTag: 'COMO LIBERAR O PLUGIN NA PRIMEIRA VEZ',
    title: 'Cole seu código, clique em Entrar e esqueça que existe login.',
    summary:
      'Você só faz isso na primeira vez que abre o plugin. Depois ele já abre direto funcionando — mesmo se o seu 3ds Max estiver bloqueado no Firewall.',
    sceneContext: 'Tela de Login (1ª vez) e Aba Configurações (Engrenagem)',
    captures: [
      {
        id: 'board-00',
        label: 'Ver Explicação na Foto',
        badge: 'PASSO A PASSO',
        src: '/images/plugins/cotas/tutorial_00_ativacao.png',
        width: 1600,
        height: 1020,
        caption:
          'Na esquerda onde você cola seu código na 1ª vez; na direita a engrenagem caso queira sair da conta depois.',
      },
      {
        id: 'ui-login',
        label: 'Tela de Entrar',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_00_login.png',
        width: 560,
        height: 720,
        caption:
          'Tela que aparece na primeira vez: é só colar o código e clicar no botão vermelho Entrar.',
      },
      {
        id: 'ui-config',
        label: 'Tela da Engrenagem',
        badge: 'JANELA REAL',
        src: '/images/plugins/cotas/ui_07_config.png',
        width: 560,
        height: 720,
        caption:
          'Aba Configurações: mostra que está ativo e tem o botão "Sair da conta".',
      },
    ],
    callouts: [
      {
        num: '1',
        title: 'Cole seu código no campo',
        body: 'Pegue o código na sua conta aqui do site e cole na caixinha.',
      },
      {
        num: '2',
        title: 'Clique no botão vermelho "Entrar"',
        body: 'Pronto! O plugin destrava todas as abas e lembra de você nas próximas vezes que abrir o 3ds Max.',
      },
      {
        num: '3',
        title: 'Precisa sair da conta?',
        body: 'Clique no ícone de engrenagem lá no cantinho esquerdo inferior e aperte "Sair da conta".',
      },
    ],
    controls: [
      {
        name: 'Meu 3ds Max é bloqueado no Firewall do Windows. Vai funcionar?',
        description:
          'SIM! Fizemos o login passar por fora do 3ds Max justamente pra ninguém ter dor de cabeça com Firewall.',
      },
      {
        name: 'Fiquei sem internet hoje. O plugin para de funcionar?',
        description:
          'Não! Depois de entrar, ele funciona até 7 dias seguidos totalmente sem internet.',
      },
    ],
    proTip:
      'Fechou o 3ds Max e abriu no dia seguinte? Não precisa digitar nada de novo, ele já abre liberado!',
  },
]

export default function PluginTutorial() {
  const [activeStepId, setActiveStepId] = useState<StepId>('cotar-single')
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
        {/* Cabeçalho direto e sem jargão */}
        <div className={styles.headerGrid}>
          <div>
            <span className={styles.eyebrow}>
              TUTORIAL RÁPIDO · DIRETO AO PONTO
            </span>
            <h2 id="tutorial-heading" className={styles.title}>
              Sem textão técnico.<br />
              <span className={styles.titleAccent}>
                Aprenda olhando as fotos em 1 minuto.
              </span>
            </h2>
          </div>
          <p className={styles.lead}>
            Com preguiça de ler manual? Relaxa. Abaixo estão os <strong>prints reais do plugin aberto no 3ds Max</strong> com
            bolinhas <strong>1, 2 e 3</strong> mostrando exatamente onde clicar.
          </p>
        </div>

        {/* ── RESUMO DE 15 SEGUNDOS (3 PASSOS GIGANTES) ────────── */}
        <div className={styles.tldrStrip} aria-label="Resumo em 3 passos">
          <div className={styles.tldrCard}>
            <span className={styles.tldrNum}>1</span>
            <div>
              <strong className={styles.tldrTitle}>Aperte &quot;Iniciar cotação&quot;</strong>
              <p className={styles.tldrText}>
                Escolha se quer medir 1 vão só ou vários seguidos e clique no botão vermelho.
              </p>
            </div>
          </div>
          <div className={styles.tldrCard}>
            <span className={styles.tldrNum}>2</span>
            <div>
              <strong className={styles.tldrTitle}>Dê 3 cliques no móvel</strong>
              <p className={styles.tldrText}>
                Com o imã do Max ligado (tecla S): 1º clique num canto, 2º no outro e 3º puxa a linha!
              </p>
            </div>
          </div>
          <div className={styles.tldrCard}>
            <span className={styles.tldrNum}>3</span>
            <div>
              <strong className={styles.tldrTitle}>Salve o PNG sem fundo</strong>
              <p className={styles.tldrText}>
                Na aba Exportar, clique em &quot;Exportar PNG&quot; e jogue as cotas por cima do seu render.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de navegação dos 7 passos com nomes simples */}
        <div
          className={styles.tabBar}
          role="tablist"
          aria-label="O que você quer aprender a fazer?"
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

        {/* Área principal: Foto Grande Anotada (Esquerda) + 3 Frases Curtas (Direita) */}
        <div className={styles.workspace}>
          {/* ── COLUNA ESQUERDA: FOTO REAL COM BOLINHAS 1, 2, 3 ── */}
          <div className={styles.showcasePanel}>
            <div className={styles.showcaseTopbar}>
              <div className={styles.showcaseBrand}>
                <span className={styles.windowBadge}>A</span>
                <span>{currentStep.sceneContext}</span>
              </div>
              <span className={styles.captureBadge}>{activeCapture.badge}</span>
            </div>

            {/* Botões simples pra alternar entre a foto explicada e a foto limpa */}
            <div
              className={styles.captureSwitcher}
              role="group"
              aria-label="Escolher foto"
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

            {/* Imagem real com clique para abrir grandona */}
            <div
              className={`${styles.imageStage} ${
                activeCapture.isAlpha ? styles.imageStageAlpha : ''
              }`}
            >
              <button
                type="button"
                className={styles.imageZoomTrigger}
                onClick={() => setLightboxAsset(activeCapture)}
                aria-label={`Abrir imagem grande: ${activeCapture.label}`}
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
                  🔍 Clique na foto pra abrir bem grande na tela
                </span>
              </button>
            </div>

            {/* Legenda curta + Miniaturas */}
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

          {/* ── COLUNA DIREITA: 3 FRASES CURTAS E DIRETAS ── */}
          <div className={styles.guidePanel}>
            <div className={styles.guideHeader}>
              <span className={styles.guideStepTag}>{currentStep.stepTag}</span>
              <h3 className={styles.guideTitle}>{currentStep.title}</h3>
              <p className={styles.guideSummary}>{currentStep.summary}</p>
            </div>

            <div>
              <h4 className={styles.blockHeading}>
                É só seguir as bolinhas 1 · 2 · 3 da foto:
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
                Dúvida Rápida (Sem Enrolação)
              </h4>
              {currentStep.controls.map((ctrl) => (
                <div key={ctrl.name} className={styles.controlItem}>
                  <span className={styles.controlName}>{ctrl.name}</span>
                  <p className={styles.controlDesc}>{ctrl.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.proTipBox}>
              <span className={styles.proTipLabel}>MACETE RÁPIDO</span>
              <p className={styles.proTipText}>{currentStep.proTip}</p>
            </div>
          </div>
        </div>

        {/* ── TODAS AS 7 FOTOS GRANDES EM SEQUÊNCIA (PRA QUEM SÓ QUER ROLAR A PÁGINA) ── */}
        <div className={styles.allBoardsSection}>
          <div className={styles.allBoardsHeader}>
            <div>
              <span className={styles.eyebrow}>PREFERE SÓ ROLAR A PÁGINA E VER AS FOTOS?</span>
              <h3 className={styles.allBoardsTitle}>
                O resumo visual completo em 7 imagens
              </h3>
            </div>
            <p className={styles.allBoardsLead}>
              Clique em qualquer imagem abaixo para abrir em tela cheia e ler os passos direto na foto.
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
                    aria-label={`Ampliar ${step.code}: ${step.label}`}
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
                        Clique na foto pra ampliar
                      </span>
                    </div>
                    <h4 className={styles.boardCardTitle}>{step.label}</h4>
                    <p className={styles.boardCardDesc}>{step.title}</p>
                    <div className={styles.boardCardActions}>
                      <button
                        type="button"
                        className={styles.boardActionBtn}
                        onClick={() => setLightboxAsset(board)}
                      >
                        🔍 Abrir foto grande
                      </button>
                      <button
                        type="button"
                        className={styles.boardZoomBtn}
                        onClick={() => {
                          handleSelectStep(step.id, 0)
                          document
                            .getElementById('tutorial')
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        Ver lá em cima ↑
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* ── 4 BOTÕES DO TECLADO QUE SALVAM SUA VIDA ────────── */}
        <div className={styles.shortcutsStrip}>
          <div className={styles.shortcutsHeader}>
            <h3 className={styles.shortcutsTitle}>
              As 4 únicas coisas que você precisa lembrar no teclado:
            </h3>
            <span className={styles.shortcutsTag}>
              COLA RÁPIDA
            </span>
          </div>
          <div className={styles.shortcutsGrid}>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Tecla S (Imã / Snap)</span>
              <p className={styles.shortcutDesc}>
                Deixe ligado pra cota grudar certinho na quina do móvel ou da parede.
              </p>
            </div>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Tecla ESC (Parar)</span>
              <p className={styles.shortcutDesc}>
                Clicou errado ou terminou de fazer várias cotas seguidas? Aperte ESC.
              </p>
            </div>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Ctrl + Z (Desfazer)</span>
              <p className={styles.shortcutDesc}>
                Fez besteira? Um Ctrl+Z apaga a última cota (ou a fila inteira) na hora.
              </p>
            </div>
            <div className={styles.shortcutCard}>
              <span className={styles.kbd}>Cota Laranja = Editada</span>
              <p className={styles.shortcutDesc}>
                Viu uma cota laranja na tela? Significa que você digitou ou arredondou aquele número na mão.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL LIGHTBOX PARA VER A FOTO BEM GRANDE ────────── */}
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
                Fechar [ESC] ✕
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
