// KeywordsFlow — texto corrido estilo elephant-skin.com
// Sem hover de imagem, sem popup, sem grid. Só tipografia fluida.

type Keyword = { text: string; style: 'bold' | 'italic' }

const KEYWORDS: Keyword[] = [
  { text: 'Fachada Comercial',        style: 'bold'   },
  { text: 'Varanda Gourmet',          style: 'italic' },
  { text: 'Piscina & Deck',           style: 'bold'   },
  { text: 'Iluminação Noturna',       style: 'italic' },
  { text: 'Living Integrado',         style: 'bold'   },
  { text: 'Condomínio Fechado',       style: 'italic' },
  { text: 'Área de Lazer',            style: 'bold'   },
  { text: 'Planta Baixa',             style: 'italic' },
  { text: 'Visualização Arquitetural',style: 'bold'   },
  { text: 'Garden Privativo',         style: 'italic' },
  { text: 'Golden Hour',              style: 'bold'   },
  { text: 'Paisagismo',               style: 'italic' },
  { text: 'Salão de Festas',          style: 'bold'   },
  { text: 'Fachada Noturna',          style: 'italic' },
  { text: 'Espaço Gourmet',           style: 'bold'   },
  { text: 'Coworking',                style: 'italic' },
  { text: 'Beach Tennis',             style: 'bold'   },
  { text: 'Área Kids',                style: 'italic' },
  { text: 'Home Office',              style: 'bold'   },
  { text: 'Quadra Poliesportiva',     style: 'italic' },
  { text: 'Varejo Especializado',     style: 'bold'   },
  { text: 'Detalhamento Técnico',     style: 'italic' },
  { text: 'Praça Externa',            style: 'bold'   },
  { text: 'Ambiente de Trabalho',     style: 'italic' },
  { text: 'Bicicletário',             style: 'bold'   },
  { text: 'Espaço Convivência',       style: 'italic' },
  { text: 'Masterplan',               style: 'bold'   },
  { text: 'Render de Entrega',        style: 'italic' },
  { text: 'Corte Arquitetônico',      style: 'bold'   },
  { text: 'Imagem para Venda',        style: 'italic' },
]

export default function KeywordsFlow() {
  return (
    <div className="keywords-flow">
      <p className="keywords-flow-text" aria-label="Ambientes e especialidades do estúdio">
        {KEYWORDS.map((kw, i) => (
          <span key={i}>
            {kw.style === 'bold'
              ? <strong className="keywords-flow-bold">{kw.text}</strong>
              : <em className="keywords-flow-italic font-editorial">{kw.text}</em>
            }
            {i < KEYWORDS.length - 1 && <span className="keywords-flow-sep" aria-hidden="true"> · </span>}
          </span>
        ))}
      </p>
    </div>
  )
}
