import Stripe from 'stripe'

import 'server-only'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const STRIPE_MIN_AMOUNT = 1000 // R$10,00
export const STRIPE_SUGGESTED_AMOUNT = 2900 // R$29,00
