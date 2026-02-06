import React from 'react'
import './RecommendedActivity.css'

const activities = [
  {
    color: '#e74c7a',
    title: 'Connect with Arjun Mehta | Google PM',
    desc: 'Alumni from IIT Delhi, now Senior PM at Google',
  },
  {
    color: '#6c5ce7',
    title: 'Apply for Microsoft SDE Referral',
    desc: 'Open referral slot from Neha Gupta, 3 slots available',
  },
  {
    color: '#00b894',
    title: 'Attend Product Management Workshop',
    desc: 'Online workshop on PM fundamentals, Feb 20',
  },
]

export default function RecommendedActivity() {
  return (
    <div className="rec-activity-card">
      {activities.map((a, i) => (
        <div key={i} className="rec-item" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="rec-avatar" style={{ background: `${a.color}22` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="rec-text">
            <span className="rec-title">{a.title}</span>
            <span className="rec-desc">{a.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
