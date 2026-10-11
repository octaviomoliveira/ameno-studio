export const FIRST_PAID_SCOPE = 'ameno-cotas-first-paid'

export type PaidPurchase = {
  user_id: string | null
  customer_email: string | null
  product: string | null
  status: string | null
  entitlement_scope: string | null
  stripe_livemode: boolean | null
  amount: number | null
  currency: string | null
  stripe_payment_intent: string | null
  licenses: { active: boolean; product: string }[] | { active: boolean; product: string } | null
}

export function isFirstPaidPurchaseEligible(purchase: PaidPurchase, userId: string, confirmedEmail: string) {
  const licenses = Array.isArray(purchase.licenses)
    ? purchase.licenses
    : purchase.licenses ? [purchase.licenses] : []
  return purchase.user_id === userId &&
    purchase.customer_email?.trim().toLowerCase() === confirmedEmail.trim().toLowerCase() &&
    purchase.product === 'ameno-cotas' && purchase.status === 'completed' &&
    purchase.entitlement_scope === FIRST_PAID_SCOPE &&
    purchase.stripe_livemode === true &&
    typeof purchase.amount === 'number' && Number.isInteger(purchase.amount) && purchase.amount >= 1000 &&
    purchase.currency === 'brl' &&
    typeof purchase.stripe_payment_intent === 'string' &&
    purchase.stripe_payment_intent.trim().length > 0 &&
    licenses.some((license) => license.active === true && license.product === 'ameno-cotas')
}
