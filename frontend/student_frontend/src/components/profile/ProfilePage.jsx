import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { auth as authStore, events as eventsStore, mentorship, lineage } from '../../localStore'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [editForm, setEditForm] = useState({})

  const uid = user?.id || 'student_001'

  useEffect(() => {
    const p = authStore.getProfile(uid)
    if (p) { setProfile(p); setEditForm({ bio: p.bio || '', location: p.location || '', skills: (p.skills || []).join(', ') }) }
  }, [uid])

  if (!profile) return <div style={{ padding: 40, color: '#fff' }}>Loading profile…</div>

  // Compute live stats
  const myEvents = eventsStore.getAll().filter(e => e.created_by === uid)
  const myRequests = mentorship.getStudentRequests(uid)
  const mySessions = mentorship.getStudentSessions(uid)
  const myLineage = lineage.getForStudent(uid)
  const stats = {
    eventsHosted: myEvents.length,
    mentorshipsRequested: myRequests.length,
    sessionsCompleted: mySessions.filter(s => s.status === 'completed').length,
    alumniConnected: myLineage.length,
  }

  const handleSave = () => {
    const patch = { bio: editForm.bio, location: editForm.location, skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean) }
    authStore.updateProfile(uid, patch)
    setProfile(authStore.getProfile(uid))
    setEditing(false)
  }

  const initials = (profile.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="profile-page">
      {/* Hero banner */}
      <div className="profile-hero">
        <div className="hero-bg-pattern" />
        <div className="profile-hero-content">
          <div className="profile-avatar-ring">
            <div className="profile-avatar-large">{initials}</div>
            <div className="profile-online-dot" />
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-tagline">{profile.role} · {profile.college}</p>
            <p className="profile-college">Graduation: {profile.graduation_year}</p>
            <div className="profile-hero-badges">
              <span className="badge-pill">{profile.role}</span>
              {profile.location && <span className="badge-pill loc">📍 {profile.location}</span>}
            </div>
          </div>
          <button className="edit-profile-btn" onClick={() => { if (editing) handleSave(); else setEditing(true) }}>
            {editing ? '✓ Save' : '✎ Edit Profile'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="profile-stats-bar">
        {[
          { label: 'Events Hosted', value: stats.eventsHosted, icon: '📅' },
          { label: 'Mentorship Requests', value: stats.mentorshipsRequested, icon: '🤝' },
          { label: 'Sessions Done', value: stats.sessionsCompleted, icon: '💬' },
          { label: 'Alumni Connected', value: stats.alumniConnected, icon: '🔗' },
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
              {editing ? (
                <textarea className="donate-input" style={{ width: '100%', minHeight: 80 }} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
              ) : (
                <p className="bio-text">{profile.bio || 'No bio yet.'}</p>
              )}
              <div className="contact-row">
                <a href={`mailto:${profile.email}`} className="contact-link">✉ {profile.email}</a>
              </div>
              <div className="social-row">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="social-btn github">
                    GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="social-btn linkedin">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="profile-card">
              <h3>Skills</h3>
              {editing ? (
                <input className="donate-input" style={{ width: '100%' }} value={editForm.skills} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))} placeholder="Comma-separated skills" />
              ) : (
                <div className="tag-cloud">
                  {(profile.skills || []).map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="profile-card">
              <h3>Location</h3>
              {editing ? (
                <input className="donate-input" style={{ width: '100%' }} value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
              ) : (
                <div className="tag-cloud">
                  <span className="interest-tag">📍 {profile.location || 'Not set'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {[
              { icon: '📅', title: `${stats.eventsHosted} Events`, desc: 'Events hosted on AfterGrad' },
              { icon: '🤝', title: `${stats.mentorshipsRequested} Requests`, desc: 'Mentorship requests sent' },
              { icon: '💬', title: `${stats.sessionsCompleted} Sessions`, desc: 'Completed mentorship sessions' },
              { icon: '🔗', title: `${stats.alumniConnected} Alumni`, desc: 'Connected alumni' },
            ].map((a, i) => (
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
