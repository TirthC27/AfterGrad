import React from 'react'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const calDays = [20, 21, 22, 23, 24, 25]
const today = 21

const upcoming = [
  { time: '14.00', label: 'Mentor Session with Priya' },
  { time: '16.00', label: 'Alumni Reunion Webinar' },
]

export default function RightPanel() {
  return (
    <aside className="right-panel">
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
            <CheckCircle size={10} className="text-[var(--mint-500)]" />
          </div>
        </div>
      </div>

      <div className="profile-info">
        <span className="profile-name">Arjun Mehta</span>
        <div className="profile-metrics">
          <div className="metric">
            <span className="metric-value">IIT Delhi</span>
            <span className="metric-label">College</span>
          </div>
          <div className="metric">
            <span className="metric-value">2020</span>
            <span className="metric-label">Grad Year</span>
          </div>
          <div className="metric">
            <span className="metric-value">Google</span>
            <span className="metric-label">Company</span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <span className="panel-section-title">Engagement Score</span>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '78%' }} />
        </div>
      </div>

      <div className="panel-section">
        <div className="calendar-header">
          <span className="calendar-month">February 2026</span>
          <div className="calendar-arrows">
            <button className="cal-arrow"><ChevronLeft size={14} /></button>
            <button className="cal-arrow"><ChevronRight size={14} /></button>
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

      <div className="panel-section">
        <span className="panel-section-title">Recent Activity</span>
        <div className="post-card">
          <div className="post-header">
            <span className="post-title">Mentorship Completed</span>
            <button className="post-more">•••</button>
          </div>
          <span className="post-time">Yesterday, 3:15 PM</span>
          <span className="post-location">30-min Resume Review with Priya Sharma</span>
        </div>
      </div>
    </aside>
  )
}
