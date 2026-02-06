import React, { useState, useEffect } from 'react'
import './AlumniLineageCard.css'

const barData = [
  { day: 'Mon', mentorship: 65, referral: 40, guidance: 30 },
  { day: 'Tue', mentorship: 80, referral: 55, guidance: 45 },
  { day: 'Wed', mentorship: 50, referral: 35, guidance: 55 },
  { day: 'Thu', mentorship: 70, referral: 60, guidance: 40 },
  { day: 'Fri', mentorship: 45, referral: 50, guidance: 60 },
  { day: 'Sat', mentorship: 90, referral: 70, guidance: 35 },
  { day: 'Sun', mentorship: 55, referral: 30, guidance: 50 },
]

export default function AlumniLineageCard({ onExpand }) {
  const [loaded, setLoaded] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const maxVal = 100

  const handleBarHover = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const parentRect = e.currentTarget.closest('.lineage-chart-area').getBoundingClientRect()
    setTooltipPos({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8,
    })
    setHoveredBar(day)
  }

  return (
    <div className="lineage-card" onClick={onExpand}>
      <div className="lineage-header">
        <div className="lineage-title-row">
          <div className="lineage-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <circle cx="6" cy="19" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M12 14l-6 2" />
              <path d="M12 14l6 2" />
            </svg>
          </div>
          <span className="lineage-title">Alumni Lineage</span>
        </div>
        <button className="dropdown-chip" onClick={(e) => e.stopPropagation()}>
          This Week
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <p className="lineage-subtitle">Track how alumni shaped your academic and career journey</p>

      <div className="lineage-chart-area">
        {/* Grid lines */}
        <div className="chart-grid">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="grid-line" />
          ))}
        </div>

        {/* Bars */}
        <div className="chart-bars">
          {barData.map((d, idx) => (
            <div
              key={d.day}
              className={`bar-group ${hoveredBar === d.day ? 'hovered' : ''}`}
              onMouseEnter={(e) => handleBarHover(e, d.day)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="bar-stack">
                <div
                  className="bar bar-mentorship"
                  style={{
                    height: loaded ? `${(d.mentorship / maxVal) * 100}%` : '0%',
                    transitionDelay: `${idx * 60}ms`,
                  }}
                />
                <div
                  className="bar bar-referral"
                  style={{
                    height: loaded ? `${(d.referral / maxVal) * 100}%` : '0%',
                    transitionDelay: `${idx * 60 + 30}ms`,
                  }}
                />
                <div
                  className="bar bar-guidance"
                  style={{
                    height: loaded ? `${(d.guidance / maxVal) * 100}%` : '0%',
                    transitionDelay: `${idx * 60 + 60}ms`,
                  }}
                />
              </div>
              <span className="bar-label">{d.day}</span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredBar && (
          <div
            className="chart-tooltip"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <strong>Alumni interactions</strong>
            <span>Mentorship, Referrals, Career Guidance</span>
          </div>
        )}
      </div>

      <div className="lineage-footer">
        <span className="expand-hint">Click to explore alumni paths connected to your degree</span>
      </div>
    </div>
  )
}
