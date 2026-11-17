import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — ameno.studio',
  description:
    'Como o ameno.studio coleta, utiliza e protege os seus dados pessoais, de acordo com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
  alternates: {
    canonical: '/privacidade',
  },
}

const COMPANY_CNPJ = process.env.NEXT_PUBLIC_COMPANY_CNPJ?.trim()

export default function PrivacidadePage() {
  return (
    <div className="legal-page bg-ameno-black text-ameno-white min-h-screen pt-32 pb-28 px-6 md:px-12">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-kicker">LGPD · LEI Nº 13.709/2018</p>
          <h1 className="legal-title">Política de Privacidade</h1>
          <p className="legal-lead">
            Esta página explica, em português claro e sem juridiquês, quais dados o{' '}
            <strong>ameno.studio</strong> coleta, por que coletamos, com quem compartilhamos e como
            você pode pedir acesso, correção ou exclusão a qualquer momento.
          </p>
          <div className="legal-meta-bar">
            <span>Última atualização: 2026</span>
            <span>Controlador: Octávio Oliveira — ameno.studio</span>
            <span>Contato: contato@ameno.studio</span>
          </div>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Quem é o responsável pelos seus dados</h2>
            <p>
              O responsável (controlador) pelo tratamento dos dados pessoais coletados neste site é:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Responsável / Estúdio:</strong> Octávio Oliveira — ameno.studio
              </li>
              {COMPANY_CNPJ ? (
                <li>
                  <strong>CNPJ:</strong> {COMPANY_CNPJ}
                </li>
              ) : null}
              <li>
                <strong>Localização:</strong> Recife, PE — Brasil
              </li>
              <li>
                <strong>E-mail direto do encarregado (DPO):</strong>{' '}
                <a href="mailto:contato@ameno.studio">contato@ameno.studio</a>
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Quais dados coletamos</h2>
            <p>
              Coletamos apenas o mínimo necessário para responder aos seus pedidos, liberar o acesso
              aos nossos plugins e melhorar o funcionamento do site:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Cadastro e acesso à conta (/entrar):</strong> endereço de e-mail e senha
                criptografada quando você cria uma conta para gerenciar suas licenças e downloads.
              </li>
              <li>
                <strong>Compra e ativação de plugins (/plugins):</strong> e-mail, status do
                pagamento e identificador do computador (Hardware ID) vinculado à licença do plugin
                para 3ds Max (como o Ameno Cotas). Dados completos de cartão ou Pix são processados
                diretamente pelo Stripe e não ficam salvos em nossos servidores.
              </li>
              <li>
                <strong>Contato direto (e-mail e redes):</strong> nome, e-mail, telefone (se você
                informar) e a mensagem enviada quando você entra em contato para orçamentos de
                arquitetura, visualização 3D (ArchViz) ou suporte técnico.
              </li>
              <li>
                <strong>Dados de navegação e anúncios:</strong> páginas visitadas, tipo de aparelho,
                origem do acesso e cliques em botões de contato ou compra, coletados por cookies de
                medição (Google Analytics e Pixel da Meta).
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Para que usamos esses dados</h2>
            <ul className="legal-list">
              <li>
                <strong>Entregar o que você contratou:</strong> liberar o download do instalador,
                gerar e validar sua chave de licença do plugin e prestar suporte técnico.
              </li>
              <li>
                <strong>Responder ao seu contato:</strong> enviar propostas comerciais, tirar
                dúvidas técnicas e acompanhar projetos de arquitetura e visualização 3D.
              </li>
              <li>
                <strong>Medir visitas e campanhas:</strong> entender quais páginas ajudam mais os
                visitantes e medir o resultado de anúncios no Instagram, Facebook e Google.
              </li>
              <li>
                <strong>Segurança e obrigações legais:</strong> prevenir fraudes em compras online e
                cumprir obrigações fiscais e legais brasileiras.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Com quem compartilhamos os dados</h2>
            <p>
              Não vendemos nem alugamos seus dados. Compartilhamos apenas as informações estritamente
              necessárias com as ferramentas que fazem o site funcionar:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Stripe:</strong> processa o pagamento com cartão ou Pix de forma segura e
                certificada (PCI-DSS).
              </li>
              <li>
                <strong>Supabase:</strong> armazena de forma segura o login da sua conta e o
                registro das suas licenças de plugin.
              </li>
              <li>
                <strong>Google (Google Analytics 4):</strong> recebe dados estatísticos de visitação
                e cliques para sabermos como o site está sendo usado.
              </li>
              <li>
                <strong>Meta (Pixel da Meta — Facebook e Instagram):</strong> identifica visitas e
                ações de contato ou compra para medir e otimizar anúncios do estúdio.
              </li>
              <li>
                <strong>Vercel:</strong> infraestrutura de hospedagem que entrega as páginas do site
                com conexão segura (HTTPS).
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Por quanto tempo guardamos seus dados</h2>
            <ul className="legal-list">
              <li>
                <strong>Conta e licenças de plugins:</strong> enquanto a sua conta estiver ativa,
                para que você possa baixar novamente o instalador e usar sua licença no 3ds Max.
              </li>
              <li>
                <strong>Registros de compra e pagamento:</strong> pelo prazo exigido pela legislação
                fiscal e pelo Código de Defesa do Consumidor (em regra, 5 anos).
              </li>
              <li>
                <strong>Mensagens de contato e orçamento:</strong> pelo tempo necessário para
                atender sua solicitação e manter o histórico comercial, ou até você pedir a
                exclusão.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Seus direitos pela LGPD (acesso, correção e exclusão)</h2>
            <p>
              Pela Lei Geral de Proteção de Dados (Art. 18 da LGPD), você pode a qualquer momento:
            </p>
            <ul className="legal-list">
              <li>Confirmar se temos algum dado seu e pedir uma cópia;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>
                Pedir a exclusão da sua conta e dos seus dados pessoais (respeitados os prazos
                legais de guarda de notas e transações financeiras);
              </li>
              <li>Revogar o consentimento ou tirar dúvidas sobre o uso das suas informações.</li>
            </ul>
            <p>
              Para fazer qualquer um desses pedidos, basta mandar um e-mail para{' '}
              <a href="mailto:contato@ameno.studio">contato@ameno.studio</a> com o assunto{' '}
              <strong>&ldquo;Privacidade / LGPD&rdquo;</strong>. Respondemos o mais rápido possível,
              dentro do prazo legal.
            </p>
          </section>
        </div>

        <footer className="legal-footer-nav">
          <Link href="/" className="ameno-button ameno-button--secondary">
            ← Voltar ao início
          </Link>
          <Link href="/termos" className="ameno-button ameno-button--secondary">
            Ver Termos de Uso →
          </Link>
        </footer>
      </div>
    </div>
  )
}
