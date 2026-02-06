import React from 'react'
import './StatsCard.css'

const iconMap = {
  mentorship: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  referral: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
}

export default function StatsCard({ icon, label, onClick }) {
  const data = {
    mentorship: { title: 'Mentorships', value: 'Active', arrow: true },
    referral: { title: 'Referrals', value: 'Open', arrow: true },
  }

  const info = data[icon] || { title: label, value: '' }

  return (
    <div className="stats-card" onClick={onClick}>
      <div className="stats-icon-wrap">
        {iconMap[icon]}
      </div>
      <div className="stats-info">
        <span className="stats-label">{info.title}</span>
      </div>
      <div className="stats-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 8 16 12 12 16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
    </div>
  )
}
