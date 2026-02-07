import React from 'react'

export default function Toast({ toasts }) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto px-5 py-3 rounded-2xl shadow-lg backdrop-blur-xl
            border text-sm font-medium animate-[fadeInUp_0.3s_ease]
            ${t.type === 'success'
              ? 'bg-white/80 border-emerald-200 text-emerald-700'
              : t.type === 'error'
              ? 'bg-white/80 border-red-200 text-red-600'
              : 'bg-white/80 border-amber-200 text-amber-700'
            }
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
