import React from 'react'

export default function Badge({ children, variant = 'default', glow = false, className = '' }) {
  const variants = {
    default: 'bg-[rgba(134,239,172,0.15)] text-[var(--text-secondary)]',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-sky-50 text-sky-700',
    danger: 'bg-red-50 text-red-600',
  }

  return (
    <span className={`
      inline-flex items-center gap-1 px-2.5 py-1 rounded-full
      text-[11px] font-medium
      ${variants[variant]}
      ${glow ? 'animate-[glow_2s_ease-in-out_infinite]' : ''}
      ${className}
    `}>
      {children}
    </span>
  )
}
