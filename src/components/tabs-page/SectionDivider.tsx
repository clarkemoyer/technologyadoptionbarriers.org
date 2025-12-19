import React from 'react'

/**
 * Section Divider Component
 * Visual separator between major sections with optional wave pattern
 */
interface SectionDividerProps {
  variant?: 'wave' | 'gradient' | 'simple'
  className?: string
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'gradient',
  className = '',
}) => {
  if (variant === 'wave') {
    return (
      <div className={`w-full overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-[60px] md:h-[80px]"
        >
          <path
            d="M0,0 C300,80 600,80 900,0 L900,120 L0,120 Z"
            className="fill-gray-100"
            opacity="0.5"
          />
          <path d="M0,20 C300,100 600,100 900,20 L900,120 L0,120 Z" className="fill-gray-100" />
        </svg>
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <div className={`w-full h-[2px] ${className}`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
      </div>
    )
  }

  return (
    <div className={`w-full py-[30px] ${className}`}>
      <div className="w-[200px] h-[4px] bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
    </div>
  )
}

export default SectionDivider
