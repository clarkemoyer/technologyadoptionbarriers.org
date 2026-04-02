'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const tooltipId = useId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect()
          setCoords({
            top: rect.top + window.scrollY - 10,
            left: rect.left + window.scrollX + rect.width / 2,
          })
        }
      }

      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible])

  return (
    <div
      className="inline-flex items-center gap-1 relative cursor-pointer"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        ref={triggerRef}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
        className="focus:outline-none"
      >
        {children}
      </button>

      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="absolute z-[9999] pointer-events-none"
            style={{
              top: coords.top,
              left: coords.left,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  id={tooltipId}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gray-900 text-white text-xs rounded shadow-lg p-3 w-64 break-words pointer-events-auto"
                  role="tooltip"
                >
                  {content}
                  {/* Small downward pointing triangle arrow */}
                  <div className="absolute w-2 h-2 bg-gray-900 rotate-45 transform left-1/2 -ml-1 -bottom-1 pointer-events-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </div>
  )
}
