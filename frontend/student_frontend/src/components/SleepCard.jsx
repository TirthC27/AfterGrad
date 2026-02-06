import React from 'react'
import './SleepCard.css'

export default function SleepCard() {
  return (
    <div className="sleep-card">
      <div className="sleep-gauge-wrapper">
        <svg viewBox="0 0 120 80" className="sleep-gauge">
          <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(134,239,172,0.15)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="var(--mint-400)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray="157" strokeDashoffset="140" />
        </svg>
        <div className="sleep-gauge-label">
          <span className="sleep-pct">10%</span>
        </div>
      </div>
      <div className="sleep-title">Profile Completion</div>
      <div className="sleep-sub">Update your profile to attract more alumni</div>
    </div>
  )
}
