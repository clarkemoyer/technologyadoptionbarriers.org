'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface ImageLightboxProps {
  /** The image source URL */
  src: string
  /** Alt text for the image (used in both thumbnail and lightbox) */
  alt: string
  /** Optional width for the inline thumbnail */
  width?: number
  /** Optional height for the inline thumbnail */
  height?: number
  /** Optional className for the inline thumbnail wrapper */
  className?: string
  /** Optional className for the img element */
  imgClassName?: string
}

/**
 * A reusable image component that opens a full-page lightbox overlay on click.
 * The lightbox scales the image to fit any screen size while maintaining aspect ratio.
 *
 * Features:
 * - Full-screen overlay with scalable image rendering
 * - Keyboard accessible (Escape to close)
 * - Focus management (traps focus, restores on close)
 * - Body scroll lock while open
 * - Click-outside-to-close
 * - ARIA attributes for accessibility
 */
const ImageLightbox: React.FC<ImageLightboxProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  imgClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const openLightbox = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Handle body scroll lock and Escape key
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeLightbox()
        }
      }

      document.addEventListener('keydown', handleEscape)

      return () => {
        document.body.style.overflow = originalOverflow
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, closeLightbox])

  // Focus management for modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement

      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href]:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      )
      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }

      return () => {
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [isOpen])

  return (
    <>
      {/* Clickable thumbnail */}
      <button
        type="button"
        onClick={openLightbox}
        className={`relative cursor-zoom-in group block w-full ${className}`}
        aria-label={`Expand image: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto ${imgClassName}`}
        />
        {/* Visual hover hint and always-accessible label */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 group-focus-visible:bg-black/10 transition-colors duration-200 rounded-lg">
          <span className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
            Click to expand
          </span>
        </span>
      </button>

      {/* Full-page lightbox overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Full-screen view: ${alt}`}
        >
          <div
            ref={modalRef}
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close full-screen view"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Scalable image container */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ImageLightbox
