import React, { useState } from 'react'
import './ProfilePage.css'

const PROFILE = {
  name: 'Tirth Chudasama',
  avatar: 'TC',
  role: 'Student',
  college: 'Charotar University of Science & Technology',
  branch: 'Computer Engineering',
  year: '3rd Year',
  email: 'tirth.c@charusat.edu.in',
  phone: '+91 98765 43210',
  bio: 'Passionate full-stack developer and hackathon enthusiast. Building AfterGrad to bridge the gap between students and alumni. Love building products that make a real-world impact.',
  location: 'Anand, Gujarat',
  github: 'TirthC27',
  linkedin: 'tirth-chudasama',
  skills: ['React', 'Python', 'FastAPI', 'Node.js', 'Supabase', 'Tailwind CSS', 'System Design', 'Figma'],
  interests: ['Hackathons', 'AI/ML', 'Startup Culture', 'Open Source', 'Product Design'],
  stats: {
    eventsHosted: 5,
    mentorshipsRequested: 3,
    sessionsCompleted: 1,
    alumniConnected: 4,
  },
  achievements: [
    { icon: '🏆', title: 'Hackathon Winner', desc: 'SIH 2024 Grand Finalist' },
    { icon: '⭐', title: 'Top Contributor', desc: 'Open-source community' },
    { icon: '🎯', title: 'Event Organizer', desc: 'Hosted 5+ college events' },
    { icon: '💡', title: 'Innovation Award', desc: 'CHARUSAT TechFest 2025' },
  ],
}

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="profile-page">
      {/* Hero banner */}
      <div className="profile-hero">
        <div className="hero-bg-pattern" />
        <div className="profile-hero-content">
          <div className="profile-avatar-ring">
            <div className="profile-avatar-large">{PROFILE.avatar}</div>
            <div className="profile-online-dot" />
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{PROFILE.name}</h1>
            <p className="profile-tagline">{PROFILE.role} · {PROFILE.branch}</p>
            <p className="profile-college">{PROFILE.college}</p>
            <div className="profile-hero-badges">
              <span className="badge-pill">{PROFILE.year}</span>
              <span className="badge-pill loc">📍 {PROFILE.location}</span>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={() => setEditing(e => !e)}>
            {editing ? '✓ Done' : '✎ Edit Profile'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="profile-stats-bar">
        {[
          { label: 'Events Hosted', value: PROFILE.stats.eventsHosted, icon: '📅' },
          { label: 'Mentorship Requests', value: PROFILE.stats.mentorshipsRequested, icon: '🤝' },
          { label: 'Sessions Done', value: PROFILE.stats.sessionsCompleted, icon: '💬' },
          { label: 'Alumni Connected', value: PROFILE.stats.alumniConnected, icon: '🔗' },
        ].map(s => (
          <div key={s.label} className="stat-cell">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="profile-tabs">
        {['overview', 'achievements', 'activity'].map(t => (
          <button
            key={t}
            className={`profile-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="profile-body">
        {activeTab === 'overview' && (
          <div className="profile-grid">
            {/* About */}
            <div className="profile-card bio-card">
              <h3>About</h3>
              <p className="bio-text">{PROFILE.bio}</p>
              <div className="contact-row">
                <a href={`mailto:${PROFILE.email}`} className="contact-link">✉ {PROFILE.email}</a>
                <span className="contact-link">☎ {PROFILE.phone}</span>
              </div>
              <div className="social-row">
                <a href={`https://github.com/${PROFILE.github}`} target="_blank" rel="noreferrer" className="social-btn github">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.43 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.14 3 .4c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.57 21.8 24 17.31 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
                <a href={`https://linkedin.com/in/${PROFILE.linkedin}`} target="_blank" rel="noreferrer" className="social-btn linkedin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.47 2H3.53A1.45 1.45 0 002 3.47v17.06A1.45 1.45 0 003.47 22h17.06A1.45 1.45 0 0022 20.53V3.47A1.45 1.45 0 0020.47 2zM8.09 18.74h-3v-9h3v9zM6.59 8.48a1.56 1.56 0 110-3.12 1.56 1.56 0 010 3.12zM18.91 18.74h-3v-4.26c0-1.08-.02-2.47-1.5-2.47-1.51 0-1.74 1.18-1.74 2.4v4.33h-3v-9h2.89v1.23h.04a3.18 3.18 0 012.85-1.56c3.04 0 3.6 2 3.6 4.6v4.73z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Skills */}
            <div className="profile-card">
              <h3>Skills</h3>
              <div className="tag-cloud">
                {PROFILE.skills.map(s => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="profile-card">
              <h3>Interests</h3>
              <div className="tag-cloud">
                {PROFILE.interests.map(i => (
                  <span key={i} className="interest-tag">{i}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {PROFILE.achievements.map((a, i) => (
              <div key={i} className="achievement-card" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="achievement-icon">{a.icon}</span>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-timeline">
            {[
              { time: '2 hours ago', text: 'Created event "Tech Career Paths in 2026"', type: 'event' },
              { time: 'Yesterday', text: 'Sent mentorship request to Priya Sharma (Google)', type: 'mentorship' },
              { time: '3 days ago', text: 'Completed session with Rahul Verma (Amazon)', type: 'session' },
              { time: '5 days ago', text: 'Connected with Sneha Patel (Microsoft)', type: 'connect' },
              { time: '1 week ago', text: 'Hosted "Startup Founders Meetup" — 24 attendees', type: 'event' },
            ].map((a, i) => (
              <div key={i} className="timeline-item" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-time">{a.time}</span>
                  <p className="timeline-text">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
