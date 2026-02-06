import React, { useState } from 'react'

export default function Card({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--glass-bg-strong)] backdrop-blur-[16px]
        border border-[var(--glass-border)]
        rounded-[var(--radius-lg)] p-5
        shadow-[var(--card-shadow)]
        transition-all duration-200 ease-out
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(134,239,172,0.18)] cursor-pointer' : ''}
        animate-[fadeInUp_0.5s_ease_both]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
