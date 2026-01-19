'use client'

import React, { useState } from 'react'
import { redirectToCheckout, ContributionType } from '@/lib/stripe'

export interface StripeContributeButtonProps {
  /**
   * Type of contribution (one-time or recurring)
   */
  type: ContributionType

  /**
   * Button text
   */
  label: string

  /**
   * Optional Stripe Payment Link URL
   * If not provided, will use the default from environment variables
   */
  paymentLinkUrl?: string

  /**
   * Custom CSS classes for styling
   */
  className?: string

  /**
   * Callback when contribution process starts
   */
  onContributeStart?: () => void

  /**
   * Callback when contribution process fails
   */
  onContributeError?: (error: Error) => void
}

/**
 * Stripe-powered contribution button component
 *
 * This component provides a PCI-compliant way to accept contributions by redirecting
 * to Stripe's hosted checkout page. No payment card data touches our servers.
 *
 * @example
 * ```tsx
 * <StripeContributeButton
 *   type={ContributionType.ONE_TIME}
 *   label="Contribute Now"
 *   className="bg-blue-500 text-white px-4 py-2 rounded"
 * />
 * ```
 */
export const StripeContributeButton: React.FC<StripeContributeButtonProps> = ({
  type,
  label,
  paymentLinkUrl,
  className = '',
  onContributeStart,
  onContributeError,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset loading state when component becomes visible again
  // This handles the case when user navigates back from Stripe
  React.useEffect(() => {
    let isMounted = true

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        setIsLoading(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleContribute = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the optional callback
      onContributeStart?.()

      // Redirect to Stripe Checkout
      await redirectToCheckout({
        type,
        paymentLinkUrl,
      })
      // Note: If redirect succeeds, user will leave the page
      // If they return (e.g., by clicking back), visibilitychange event will reset loading
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize contribution')
      console.error('Contribution error:', error)
      setError(error.message)
      onContributeError?.(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="stripe-contribute-button-container">
      <button
        onClick={handleContribute}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={label}
      >
        {isLoading ? 'Processing...' : label}
      </button>

      {error && (
        <div className="mt-2 text-red-600 text-sm" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default StripeContributeButton

// Legacy export for backward compatibility
export { StripeContributeButton as StripeDonateButton }
export type StripeDonateButtonProps = StripeContributeButtonProps
export { ContributionType as DonationType }
