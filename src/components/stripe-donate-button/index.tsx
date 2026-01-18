'use client'

import React, { useState } from 'react'
import { redirectToCheckout, DonationType } from '@/lib/stripe'

export interface StripeDonateButtonProps {
  /**
   * Type of donation (one-time or recurring)
   */
  type: DonationType

  /**
   * Button text
   */
  label: string

  /**
   * Optional Stripe Price ID
   * If not provided, will use the default from environment variables
   */
  priceId?: string

  /**
   * Custom CSS classes for styling
   */
  className?: string

  /**
   * Callback when donation process starts
   */
  onDonateStart?: () => void

  /**
   * Callback when donation process fails
   */
  onDonateError?: (error: Error) => void
}

/**
 * Stripe-powered donation button component
 *
 * This component provides a PCI-compliant way to accept donations by redirecting
 * to Stripe's hosted checkout page. No payment card data touches our servers.
 *
 * @example
 * ```tsx
 * <StripeDonateButton
 *   type={DonationType.ONE_TIME}
 *   label="Donate Now"
 *   className="bg-blue-500 text-white px-4 py-2 rounded"
 * />
 * ```
 */
export const StripeDonateButton: React.FC<StripeDonateButtonProps> = ({
  type,
  label,
  priceId,
  className = '',
  onDonateStart,
  onDonateError,
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

  const handleDonate = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the optional callback
      onDonateStart?.()

      // Redirect to Stripe Checkout
      await redirectToCheckout({
        type,
        priceId,
      })
      // Note: If redirect succeeds, user will leave the page
      // If they return (e.g., by clicking back), visibilitychange event will reset loading
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize donation')
      console.error('Donation error:', error)
      setError(error.message)
      onDonateError?.(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="stripe-donate-button-container">
      <button
        onClick={handleDonate}
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

export default StripeDonateButton
