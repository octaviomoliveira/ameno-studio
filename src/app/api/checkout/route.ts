import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_MIN_AMOUNT } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { amount, productName } = await req.json()

    // Validar valor mínimo
    if (!amount || amount < STRIPE_MIN_AMOUNT) {
      return NextResponse.json(
        { error: 'Valor mínimo é R\$ 1,00' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: productName ?? 'Ameno Cotas',
              description: 'Plugin para 3ds Max — criação automática de cotas',
            },
            unit_amount: amount, // em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: ${process.env.NEXT_PUBLIC_SITE_URL}/conta?success=true,
      cancel_url:  ${process.env.NEXT_PUBLIC_SITE_URL}/plugins,
      metadata: {
        product: 'ameno-cotas',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 })
  }
}
