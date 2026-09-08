import PurchaseForm from './purchase-form'
import { STRIPE_MIN_AMOUNT, STRIPE_SUGGESTED_AMOUNT } from '@/lib/stripe'

export default function PluginsPage() {
  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '160px 24px 96px' }}>
      <p className="text-red">Ferramentas Ameno</p>
      <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', margin: '16px 0' }}>Ameno Cotas</h1>
      <p style={{ lineHeight: 1.7 }}>Plugin para criação de cotas no 3ds Max.</p>
      <p style={{ margin: '16px 0 32px', lineHeight: 1.7 }}>
        Escolha quanto pagar. Pagamento único por versão, sem assinatura e sem cadastro obrigatório.
      </p>
      <PurchaseForm minimum={STRIPE_MIN_AMOUNT} suggested={STRIPE_SUGGESTED_AMOUNT} />
    </section>
  )
}
