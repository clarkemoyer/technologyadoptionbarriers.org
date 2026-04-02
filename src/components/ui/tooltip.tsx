'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  content: React.ReactNode
  /**
   * The trigger element for the tooltip. MUST be a non-interactive element (e.g. an icon or span).
   * Do not pass <button> or <a> as children, as they will be wrapped in a <button>.
   */
  children: React.ReactElement
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top - 10,
        left: rect.left + rect.width / 2,
      })
    }

    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      timeoutRef.current = null
    }, 200)
  }

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      let ticking = false

      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect()
          setCoords({
            top: rect.top - 10,
            left: rect.left + rect.width / 2,
          })
        }
      }

      const throttledUpdate = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updatePosition()
            ticking = false
          })
          ticking = true
        }
      }

      const scrollListenerOptions: AddEventListenerOptions = { capture: true, passive: true }

      updatePosition()
      window.addEventListener('scroll', throttledUpdate, scrollListenerOptions)
      window.addEventListener('resize', throttledUpdate, { passive: true })

      return () => {
        window.removeEventListener('scroll', throttledUpdate, scrollListenerOptions)
        window.removeEventListener('resize', throttledUpdate)
      }
    }
  }, [isVisible])

  return (
    <div
      className="inline-flex items-center gap-1 relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        ref={triggerRef}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-describedby={isVisible ? tooltipId : undefined}
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      >
        {children}
      </button>

      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                id={tooltipId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="fixed z-[9999] bg-gray-900 text-white text-xs rounded shadow-lg p-3 w-64 break-words pointer-events-auto"
                role="tooltip"
                style={{
                  top: coords.top,
                  left: coords.left,
                  transform: 'translate(-50%, -100%)',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {content}
                {/* Small downward pointing triangle arrow */}
                <div className="absolute w-2 h-2 bg-gray-900 rotate-45 transform left-1/2 -ml-1 -bottom-1 pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
