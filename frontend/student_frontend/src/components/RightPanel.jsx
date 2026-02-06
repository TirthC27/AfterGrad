import React from 'react'
import './RightPanel.css'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const calDays = [20, 21, 22, 23, 24, 25]
const today = 21

const upcoming = [
  { time: '13.00', label: 'Mentor Call with Arjun' },
  { time: '15.00', label: 'Resume Review Session' },
]

export default function RightPanel() {
  return (
    <aside className="right-panel">
      {/* Profile header with landscape */}
      <div className="profile-banner">
        <div className="banner-gradient" />
        <div className="profile-avatar-ring">
          <div className="profile-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--mint-600)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="avatar-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--mint-500)" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
      </div>

      <div className="profile-info">
        <span className="profile-name">Priya Sharma</span>
        <div className="profile-metrics">
          <div className="metric">
            <span className="metric-value">IIT Delhi</span>
            <span className="metric-label">College</span>
          </div>
          <div className="metric">
            <span className="metric-value">2026</span>
            <span className="metric-label">Grad Year</span>
          </div>
          <div className="metric">
            <span className="metric-value">Delhi</span>
            <span className="metric-label">Location</span>
          </div>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="panel-section">
        <span className="panel-section-title">Weekly Progress</span>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '65%' }} />
        </div>
      </div>

      {/* Calendar */}
      <div className="panel-section">
        <div className="calendar-header">
          <span className="calendar-month">February 2026</span>
          <div className="calendar-arrows">
            <button className="cal-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="cal-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {weekDays.map((d, i) => (
            <div key={d} className="cal-col">
              <span className="cal-day-name">{d}</span>
              <span className={`cal-day-num ${calDays[i] === today ? 'today' : ''}`}>{calDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="panel-section">
        <span className="panel-section-title">Upcoming</span>
        <div className="upcoming-list">
          {upcoming.map((u, i) => (
            <div key={i} className="upcoming-item">
              <span className="upcoming-time">{u.time}</span>
              <div className="upcoming-divider" />
              <span className="upcoming-label">{u.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Post (Last Activity) */}
      <div className="panel-section">
        <span className="panel-section-title">Recent Activity</span>
        <div className="post-card">
          <div className="post-header">
            <span className="post-title">Referral Applied</span>
            <button className="post-more">•••</button>
          </div>
          <span className="post-time">Yesterday, 2:30 PM</span>
          <span className="post-location">Company: Google &bull; Role: APM Intern</span>
        </div>
      </div>
    </aside>
  )
}
