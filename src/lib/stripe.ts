/**
 * Stripe integration utilities
 * This module provides client-side Stripe integration for PCI-compliant payment processing
 *
 * For static sites, we use Stripe Payment Links - pre-configured checkout URLs
 * that can be created in the Stripe Dashboard.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

/**
 * Singleton instance of Stripe
 * Ensures we only initialize Stripe once
 */
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get or initialize the Stripe instance
 * Uses the publishable key from environment variables
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      console.error('Stripe publishable key is not configured')
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

/**
 * Donation types
 */
export enum DonationType {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
}

/**
 * Configuration for donation checkout
 */
export interface DonationConfig {
  type: DonationType
  amount?: number // Optional: for custom amounts (future enhancement)
  priceId?: string // Stripe Price ID for preset amounts
}

/**
 * Redirect to Stripe Checkout for donation
 * This is PCI-compliant as payment details are collected on Stripe's hosted page
 *
 * For static sites, we use Payment Links created in the Stripe Dashboard
 *
 * @param config - Donation configuration
 * @returns Promise that resolves when redirecting to checkout
 */
export const redirectToCheckout = async (config: DonationConfig): Promise<void> => {
  // For static sites, we use Stripe Payment Links
  // These are pre-configured checkout URLs created in the Stripe Dashboard

  // Determine the payment link based on donation type
  let paymentLinkUrl: string | undefined

  if (config.priceId) {
    // If a specific price ID is provided, construct the payment link URL
    // Note: This requires the payment link to be created in Stripe Dashboard
    paymentLinkUrl = config.priceId
  } else {
    // Use the environment-configured payment links
    paymentLinkUrl =
      config.type === DonationType.MONTHLY
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_DONATION_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_DONATION_PRICE_ID
  }

  if (!paymentLinkUrl) {
    throw new Error(
      `No payment link configured for ${config.type} donation. Please configure NEXT_PUBLIC_STRIPE_DONATION_PRICE_ID in your environment variables.`
    )
  }

  // If it's a price ID (starts with price_), we need to construct a payment link
  // For static sites, this should be a full payment link URL instead
  if (paymentLinkUrl.startsWith('price_')) {
    throw new Error(
      `Static sites require Stripe Payment Links (URLs), not Price IDs. Please create a Payment Link in your Stripe Dashboard and use the full URL instead of "${paymentLinkUrl}".`
    )
  }

  // Redirect to the Stripe Payment Link
  // Use window.location.assign for better browser compatibility
  if (typeof window !== 'undefined') {
    window.location.assign(paymentLinkUrl)
  } else {
    throw new Error('Cannot redirect: window is not available (SSR environment)')
  }
}

/**
 * Helper to validate if a string is a valid Stripe Payment Link
 */
export const isValidPaymentLink = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.hostname === 'buy.stripe.com' ||
      parsedUrl.hostname === 'checkout.stripe.com' ||
      parsedUrl.hostname.endsWith('.stripe.com')
    )
  } catch {
    return false
  }
}

/**
 * Create a Stripe Checkout Session (for server-side integration if needed in the future)
 *
 * Note: This interface is provided for future use if the site migrates from static export
 * to server-side rendering (SSR). With SSR, you can create checkout sessions programmatically
 * via API routes instead of using pre-configured Payment Links.
 *
 * This is here for reference and future use if the site moves to server-side rendering.
 *
 * @example
 * ```typescript
 * // Future API route example (requires SSR)
 * const sessionConfig: CheckoutSessionConfig = {
 *   priceId: 'price_xxx',
 *   mode: 'payment',
 *   successUrl: `${origin}/donation-success`,
 *   cancelUrl: `${origin}/donation-cancelled`
 * }
 * ```
 */
export interface CheckoutSessionConfig {
  priceId: string
  mode: 'payment' | 'subscription'
  successUrl: string
  cancelUrl: string
}
