import React from 'react'

export default function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'bg-gradient-to-r from-[rgba(134,239,172,0.1)] via-[rgba(134,239,172,0.2)] to-[rgba(134,239,172,0.1)] bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-xl'

  const variants = {
    rect: 'h-4 w-full',
    circle: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full',
    chip: 'h-7 w-20 rounded-full',
  }

  return <div className={`${base} ${variants[variant]} ${className}`} />
}
