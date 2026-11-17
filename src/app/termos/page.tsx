import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — ameno.studio',
  description:
    'Condições de uso do site ameno.studio, regras de licenciamento dos plugins para 3ds Max, prazos de entrega, suporte e política de cancelamento e reembolso.',
  alternates: {
    canonical: '/termos',
  },
}

const COMPANY_CNPJ = process.env.NEXT_PUBLIC_COMPANY_CNPJ?.trim() || '54.457.188/0001-20'

export default function TermosPage() {
  return (
    <div className="legal-page bg-ameno-black text-ameno-white min-h-screen pt-32 pb-28 px-6 md:px-12">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-kicker">REGRAS TRANSPARENTES · CDC</p>
          <h1 className="legal-title">Termos de Uso</h1>
          <p className="legal-lead">
            Estes termos explicam de forma direta o que o <strong>ameno.studio</strong> entrega,
            como funcionam as licenças dos plugins para 3ds Max, os prazos, o suporte e o seu
            direito de cancelamento e reembolso.
          </p>
          <div className="legal-meta-bar">
            <span>Última atualização: 2026</span>
            <span>Responsável: Octávio Oliveira — ameno.studio</span>
            <span>Recife, PE · contato@ameno.studio</span>
          </div>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Quem somos e o que o site oferece</h2>
            <p>
              O <strong>ameno.studio</strong> é o estúdio de arquitetura, visualização 3D (ArchViz),
              modelagem 3D e desenvolvimento de ferramentas para Autodesk 3ds Max conduzido por{' '}
              <strong>Octávio Oliveira</strong>, sediado em <strong>Recife, PE — Brasil</strong>
              {COMPANY_CNPJ ? ` (CNPJ ${COMPANY_CNPJ})` : ''}.
            </p>
            <p>Por meio deste site disponibilizamos:</p>
            <ul className="legal-list">
              <li>
                <strong>Portfólio autoral e técnico:</strong> apresentação de projetos de
                arquitetura, imagens de visualização arquitetônica (ArchViz) e acervo interativo de
                modelagem 3D;
              </li>
              <li>
                <strong>Plugins para Autodesk 3ds Max:</strong> venda e licenciamento de ferramentas
                profissionais, como o plugin <strong>Ameno Cotas</strong>;
              </li>
              <li>
                <strong>Canais de contato direto:</strong> solicitação de propostas para projetos de
                arquitetura, visualização e modelagem sob demanda.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Licenciamento de plugins (Ameno Cotas)</h2>
            <ul className="legal-list">
              <li>
                <strong>O que você recebe:</strong> ao adquirir o plugin Ameno Cotas, você recebe o
                instalador para Windows/3ds Max (2024 a 2026) e uma chave de licença vinculada à sua
                conta no site.
              </li>
              <li>
                <strong>Uso por computador:</strong> cada licença dá direito à ativação e uso em{' '}
                <strong>1 (um) computador (PC)</strong> por vez, vinculada ao identificador da
                máquina (Hardware ID). Caso você troque de computador ou formate o sistema, basta
                entrar em contato pelo e-mail{' '}
                <a href="mailto:contato@ameno.studio">contato@ameno.studio</a> para redefinirmos o
                vínculo da sua licença sem custo adicional.
              </li>
              <li>
                <strong>Prazo de entrega:</strong> a liberação da licença e do download é{' '}
                <strong>imediata e automática</strong> assim que o pagamento (Pix ou cartão via
                Stripe) é confirmado. Você pode acessar sua chave a qualquer momento na página{' '}
                <Link href="/minha-conta">Minha Conta</Link>.
              </li>
              <li>
                <strong>Restrições:</strong> a licença é de uso individual ou profissional do
                comprador. Não é permitido revender, redistribuir publicamente o instalador ou
                compartilhar a mesma chave de ativação com terceiros.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Preço, pagamento e modalidade &ldquo;pague o quanto quiser&rdquo;</h2>
            <p>
              Na página <Link href="/plugins">Plugins</Link>, o valor de cada licença é exibido em
              Reais (R$) antes da compra. Quando disponível na modalidade de valor flexível (com
              valor mínimo indicado na tela), o valor escolhido no momento do checkout garante
              exatamente o mesmo produto completo, com todas as funções e suporte.
            </p>
            <p>
              Todos os pagamentos são processados em ambiente criptografado pelo{' '}
              <strong>Stripe</strong>.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Cancelamento, arrependimento e reembolso (7 dias)</h2>
            <p>
              Em respeito ao <strong>Art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990)</strong>,
              você tem até <strong>7 (sete) dias corridos</strong> a partir da data da compra do
              plugin para desistir e pedir o reembolso integral (100% do valor pago), mesmo que já
              tenha baixado ou testado a ferramenta.
            </p>
            <ul className="legal-list">
              <li>
                <strong>Como pedir o reembolso:</strong> envie um e-mail para{' '}
                <a href="mailto:contato@ameno.studio">contato@ameno.studio</a> informando o e-mail
                usado na compra.
              </li>
              <li>
                <strong>Como o valor volta:</strong> o estorno é solicitado diretamente no Stripe (no
                mesmo método de pagamento utilizado) e a chave de licença correspondente é
                desativada.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Serviços de Arquitetura, ArchViz e Modelagem 3D</h2>
            <p>
              Para projetos de arquitetura, imagens de lançamento imobiliário (ArchViz) ou modelagem
              3D sob encomenda, os prazos de entrega, etapas de revisão, valores e condições de
              pagamento são combinados individualmente em proposta comercial ou contrato específico
              aprovado por ambas as partes.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Propriedade intelectual</h2>
            <p>
              Todas as imagens, projetos arquitetônicos, vídeos interativos, modelos 3D (.GLB),
              textos, marcas e códigos-fonte exibidos no <strong>ameno.studio</strong> são de
              propriedade autoral de Octávio Oliveira / ameno.studio ou de seus respectivos clientes
              parceiros, sendo proibida a reprodução comercial sem autorização prévia por escrito.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Suporte e foro</h2>
            <p>
              Qualquer dúvida técnica, pedido de suporte na instalação do plugin ou solicitação
              comercial é atendida diretamente pelo e-mail{' '}
              <a href="mailto:contato@ameno.studio">contato@ameno.studio</a>.
            </p>
            <p>
              Fica eleito o foro da Comarca de <strong>Recife, Estado de Pernambuco</strong>, para
              resolver eventuais dúvidas oriundas destes Termos, sem prejuízo do foro de domicílio
              do consumidor garantido pelo Código de Defesa do Consumidor.
            </p>
          </section>
        </div>

        <footer className="legal-footer-nav">
          <Link href="/" className="ameno-button ameno-button--secondary">
            ← Voltar ao início
          </Link>
          <Link href="/privacidade" className="ameno-button ameno-button--secondary">
            Ver Política de Privacidade →
          </Link>
        </footer>
      </div>
    </div>
  )
}
