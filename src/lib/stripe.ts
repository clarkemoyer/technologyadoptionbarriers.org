/**
 * Stripe integration utilities
 * This module provides client-side Stripe integration for PCI-compliant payment processing
 *
 * For static sites, we use Stripe Payment Links - pre-configured checkout URLs
 * that can be created in the Stripe Dashboard.
 */

/**
 * Donation types
 */
export enum DonationType {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
}

/**
 * Configuration for donation checkout
 *
 * For static sites, paymentLinkUrl should be a full Stripe Payment Link URL
 * (e.g., https://buy.stripe.com/...) created in the Stripe Dashboard.
 */
export interface DonationConfig {
  type: DonationType
  amount?: number // Optional: for custom amounts (future enhancement)
  paymentLinkUrl?: string // Stripe Payment Link URL
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

  if (config.paymentLinkUrl) {
    // If a specific payment link URL is provided, use it
    paymentLinkUrl = config.paymentLinkUrl
  } else {
    // Use the environment-configured payment links
    paymentLinkUrl =
      config.type === DonationType.MONTHLY
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_DONATION_PAYMENT_LINK_URL
        : process.env.NEXT_PUBLIC_STRIPE_DONATION_PAYMENT_LINK_URL
  }

  if (!paymentLinkUrl) {
    const envVar =
      config.type === DonationType.MONTHLY
        ? 'NEXT_PUBLIC_STRIPE_MONTHLY_DONATION_PAYMENT_LINK_URL'
        : 'NEXT_PUBLIC_STRIPE_DONATION_PAYMENT_LINK_URL'
    const otherEnvVar =
      config.type === DonationType.MONTHLY
        ? 'NEXT_PUBLIC_STRIPE_DONATION_PAYMENT_LINK_URL'
        : 'NEXT_PUBLIC_STRIPE_MONTHLY_DONATION_PAYMENT_LINK_URL'

    throw new Error(
      `No payment link configured for ${config.type} donation. Please configure ${envVar} in your environment variables (the other donation type uses ${otherEnvVar}).`
    )
  }

  // Validate it's a proper URL
  if (!paymentLinkUrl.startsWith('https://')) {
    throw new Error(
      `Invalid payment link URL: "${paymentLinkUrl}". Payment links must start with https:// (e.g., https://buy.stripe.com/...).`
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
