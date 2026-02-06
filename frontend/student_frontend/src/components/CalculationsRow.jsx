import React from 'react'
import './CalculationsRow.css'

const items = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    value: '352',
    total: '/352',
    label: 'Alumni Connected',
    color: 'var(--mint-400)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    value: '54',
    total: ' hours',
    label: 'Mentorship Time',
    color: 'var(--mint-400)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    value: '90',
    total: ' %',
    label: 'Goal Completion',
    color: 'var(--mint-400)',
  },
]

export default function CalculationsRow() {
  return (
    <div className="calculations-row">
      {items.map((item, i) => (
        <div key={i} className="calc-card" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="calc-icon-wrap">{item.icon}</div>
          <div className="calc-data">
            <span className="calc-value">{item.value}</span>
            <span className="calc-total">{item.total}</span>
          </div>
          <span className="calc-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
