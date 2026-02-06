import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { Users, Briefcase, Clock, CheckCircle, Award, TrendingUp } from 'lucide-react'
import SocialMediaConnect from './SocialMediaConnect'

const barData = [
  { day: 'Mon', mentees: 65, gigs: 40, events: 30 },
  { day: 'Tue', mentees: 80, gigs: 55, events: 45 },
  { day: 'Wed', mentees: 50, gigs: 35, events: 55 },
  { day: 'Thu', mentees: 70, gigs: 60, events: 40 },
  { day: 'Fri', mentees: 45, gigs: 50, events: 60 },
  { day: 'Sat', mentees: 90, gigs: 70, events: 35 },
  { day: 'Sun', mentees: 55, gigs: 30, events: 50 },
]

const activities = [
  { color: '#e74c7a', title: 'Resume Review Request from Priya', desc: 'Student from IIT Delhi, Class of 2026' },
  { color: '#6c5ce7', title: 'New Gig Application: React Developer', desc: '3 applicants, deadline Feb 28' },
  { color: '#00b894', title: 'Alumni Reunion Webinar', desc: 'Join 45 fellow alumni this Friday at 6 PM' },
]

export default function Dashboard({ addToast }) {
  const [loaded, setLoaded] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
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
    <>
      <section className="section-label">Essentials</section>
      <div className="essentials-grid">
        {/* Chart card — same layout as AlumniLineageCard */}
        <div className="lineage-card">
          <div className="lineage-header">
            <div className="lineage-title-row">
              <div className="lineage-icon">
                <TrendingUp size={18} className="text-[var(--mint-500)]" />
              </div>
              <span className="lineage-title">Engagement Overview</span>
            </div>
            <button className="dropdown-chip">
              This Week
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
          <p className="lineage-subtitle">Track your mentorship sessions, gigs, and event participation</p>

          <div className="lineage-chart-area">
            <div className="chart-grid">
              {[0,1,2,3,4].map(i => <div key={i} className="grid-line" />)}
            </div>
            <div className="chart-bars">
              {barData.map((d, idx) => (
                <div
                  key={d.day}
                  className={`bar-group ${hoveredBar === d.day ? 'hovered' : ''}`}
                  onMouseEnter={(e) => handleBarHover(e, d.day)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="bar-stack">
                    <div className="bar bar-mentorship" style={{ height: loaded ? `${(d.mentees / maxVal) * 100}%` : '0%', transitionDelay: `${idx * 60}ms` }} />
                    <div className="bar bar-referral" style={{ height: loaded ? `${(d.gigs / maxVal) * 100}%` : '0%', transitionDelay: `${idx * 60 + 30}ms` }} />
                    <div className="bar bar-guidance" style={{ height: loaded ? `${(d.events / maxVal) * 100}%` : '0%', transitionDelay: `${idx * 60 + 60}ms` }} />
                  </div>
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>

            {hoveredBar && (
              <div className="chart-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
                <strong>Weekly activity</strong>
                <span>Mentees, Gigs, Events</span>
              </div>
            )}
          </div>

          <div className="lineage-footer">
            <span className="expand-hint">Your engagement is 24% higher than last week</span>
          </div>
        </div>

        {/* Stats cards stack */}
        <div className="essentials-right-stack">
          <Card className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[rgba(134,239,172,0.12)] flex items-center justify-center shrink-0">
              <Users size={24} className="text-[var(--mint-500)]" />
            </div>
            <div className="flex-1">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Active Mentees</span>
              <span className="block text-[11px] text-[var(--text-muted)]">4 ongoing sessions</span>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[rgba(134,239,172,0.12)] flex items-center justify-center shrink-0">
              <Briefcase size={24} className="text-[var(--mint-500)]" />
            </div>
            <div className="flex-1">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Posted Gigs</span>
              <span className="block text-[11px] text-[var(--text-muted)]">2 open, 1 in progress</span>
            </div>
          </Card>
        </div>

        {/* Connections ring */}
        <div className="essentials-calories-card">
          <div className="calories-ring-container">
            <svg viewBox="0 0 120 120" className="calories-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(134,239,172,0.15)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--mint-400)" strokeWidth="10"
                strokeDasharray="314" strokeDashoffset="62" strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <div className="calories-text">
              <span className="calories-number">28</span>
              <span className="calories-label">Connections</span>
            </div>
          </div>
          <div className="total-time-badge">
            <span className="total-time-label">Alumni Since</span>
            <span className="total-time-value">2020</span>
            <span className="total-time-sub">IIT Delhi</span>
          </div>
        </div>
      </div>

      <section className="section-label">Connect & Discover</section>
      <div className="recommended-grid">
        {/* Recent activity feed */}
        <Card hover={false} className="flex flex-col gap-2.5">
          {activities.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 p-3 rounded-[var(--radius-sm)] bg-white/35 border border-white/40 cursor-pointer transition-all duration-200 hover:bg-white/55 hover:translate-x-1"
              style={{ animationDelay: `${i * 80}ms`, animation: 'fadeInUp 0.4s ease both' }}
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: `${a.color}22` }}>
                <Users size={24} stroke={a.color} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">{a.title}</span>
                <span className="text-[11px] text-[var(--text-muted)] leading-tight">{a.desc}</span>
              </div>
            </div>
          ))}
        </Card>

        <div className="recommended-right">
          {/* Profile completion */}
          <Card hover={false} className="flex flex-col items-center justify-center text-center">
            <div className="relative w-[100px] h-[60px] mb-2">
              <svg viewBox="0 0 120 80" className="w-full h-full">
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(134,239,172,0.15)" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="var(--mint-400)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="157" strokeDashoffset="47" />
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <span className="text-[22px] font-bold text-[var(--text-primary)]">70%</span>
              </div>
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)]">Profile Strength</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Connect LinkedIn to boost visibility</div>
          </Card>

          {/* Quick reports */}
          <Card hover={false} className="flex flex-col gap-3.5">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Impact Summary</span>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--mint-400)] shrink-0" />
                <span className="text-xs font-medium text-[var(--text-primary)] flex-1">Mentees Helped</span>
                <span className="text-[10px] text-[var(--text-muted)]">12 this year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--mint-300)] shrink-0" />
                <span className="text-xs font-medium text-[var(--text-primary)] flex-1">Gigs Completed</span>
                <span className="text-[10px] text-[var(--text-muted)]">5 total</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <section className="section-label">At a Glance</section>
      <div className="calculations-row">
        {[
          { icon: <Users size={28} className="text-[var(--mint-500)]" />, value: '12', total: ' mentees', label: 'Total Mentored' },
          { icon: <Clock size={28} className="text-[var(--mint-500)]" />, value: '86', total: ' hrs', label: 'Time Given' },
          { icon: <Award size={28} className="text-[var(--mint-500)]" />, value: '₹24k', total: '', label: 'Donations Made' },
        ].map((item, i) => (
          <Card key={i} className="flex flex-col items-center gap-2" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-[50px] h-[50px] rounded-2xl bg-[rgba(134,239,172,0.1)] flex items-center justify-center">
              {item.icon}
            </div>
            <div className="flex items-baseline">
              <span className="text-[28px] font-bold text-[var(--text-primary)]">{item.value}</span>
              <span className="text-sm font-medium text-[var(--text-muted)]">{item.total}</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">{item.label}</span>
          </Card>
        ))}
      </div>

      <section className="section-label">Profile Setup</section>
      <SocialMediaConnect addToast={addToast} />
    </>
  )
}
