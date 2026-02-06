import React from 'react'

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer border-none font-[inherit]'

  const variants = {
    primary: 'bg-[var(--mint-400)] text-white shadow-[0_4px_16px_rgba(74,222,128,0.3)] hover:bg-[var(--mint-500)] hover:shadow-[0_6px_24px_rgba(74,222,128,0.4)]',
    secondary: 'bg-[rgba(134,239,172,0.12)] text-[var(--text-secondary)] border border-[rgba(134,239,172,0.25)] hover:bg-[rgba(134,239,172,0.2)]',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[rgba(134,239,172,0.1)] hover:text-[var(--text-secondary)]',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-6 py-2.5',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
