import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_MIN_AMOUNT } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const amount = body?.amount

    // Validar valor mínimo
    if (!Number.isSafeInteger(amount) || amount < STRIPE_MIN_AMOUNT) {
      return NextResponse.json(
        { error: 'Informe um valor válido em centavos. Valor mínimo é R$ 10,00.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const claims = claimsData?.claims
    const userId = typeof claims?.sub === 'string' ? claims.sub : null
    const userEmail = typeof claims?.email === 'string' ? claims.email.trim().toLowerCase() : null

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Ameno Cotas',
              description: 'Plugin para 3ds Max — criação automática de cotas',
            },
            unit_amount: amount, // em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail ?? undefined,
      client_reference_id: userId ?? undefined,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/conta?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plugins`,
      metadata: {
        product: 'ameno-cotas',
        ...(userId ? { user_id: userId } : {}),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Erro ao criar sessão' }, { status: 500 })
  }
}
