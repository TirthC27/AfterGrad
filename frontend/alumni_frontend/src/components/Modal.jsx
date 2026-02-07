import React, { useEffect, useState } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/25 backdrop-blur-[4px] transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-gradient-to-br from-[rgba(240,253,247,0.95)] to-[rgba(255,255,255,0.92)]
          backdrop-blur-[24px] border border-[var(--glass-border)]
          rounded-[var(--radius-xl)] p-8 max-w-lg w-[90vw] max-h-[85vh] overflow-y-auto
          shadow-[0_24px_80px_rgba(0,0,0,0.12)]
          transition-transform duration-250
          ${visible ? 'scale-100' : 'scale-95'}
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[rgba(134,239,172,0.1)] flex items-center justify-center border-none cursor-pointer text-[var(--text-muted)] hover:bg-[rgba(231,76,60,0.1)] hover:text-red-500 transition-all duration-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
