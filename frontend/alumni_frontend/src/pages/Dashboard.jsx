import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Briefcase, Bell, Clock, MapPin, Video, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { auth, events as eventsStore, mentorship, gigs as gigsStore, invitations as invStore } from '../localStore'

export default function Dashboard() {
  const { user } = useAuth()
  const ALUMNI_ID = user?.id || 'alumni_001'
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ offerings: 0, requests: 0, sessions: 0, events: 0, gigs: 0, invitations: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [recentGigs, setRecentGigs] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [pendingInvitations, setPendingInvitations] = useState([])

  const reload = () => {
    setProfile(auth.getProfile(ALUMNI_ID))
    const offerings = mentorship.getAlumniOfferings(ALUMNI_ID)
    const requests = mentorship.getAlumniRequests(ALUMNI_ID)
    const sessions = mentorship.getAlumniSessions(ALUMNI_ID)
    const allEvents = eventsStore.getAll()
    const allGigs = gigsStore.getAll()
    const invitations = invStore.getForAlumni(ALUMNI_ID)

    const myEvents = allEvents.filter(e => e.created_by === ALUMNI_ID)
    const myGigs = allGigs.filter(g => g.posted_by === ALUMNI_ID)
    const pendingInv = invitations.filter(i => i.status === 'pending')

    setStats({
      offerings: offerings.length,
      requests: requests.filter(r => r.status === 'pending').length,
      sessions: sessions.length,
      events: myEvents.length,
      gigs: myGigs.length,
      invitations: pendingInv.length,
    })
    setRecentEvents(myEvents.slice(0, 3))
    setRecentGigs(myGigs.slice(0, 3))
    setRecentSessions(sessions.filter(s => s.status === 'scheduled').slice(0, 3))
    setPendingInvitations(pendingInv.slice(0, 5))
  }

  useEffect(() => { reload() }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

  const handleInvitation = (id, action) => {
    if (action === 'accept') invStore.accept(id)
    else invStore.decline(id)
    reload()
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {profile?.name?.split(' ')[0] || 'Alumni'} 👋</h1>
        <p className="page-subtitle">{profile?.company} · {profile?.job_title}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ animationDelay: '0ms' }}>
          <Users size={24} style={{ color: 'var(--blue-400)', marginBottom: 8 }} />
          <div className="stat-value">{stats.offerings}</div>
          <div className="stat-label">Active Offerings</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '80ms' }}>
          <Bell size={24} style={{ color: '#f59e0b', marginBottom: 8 }} />
          <div className="stat-value">{stats.requests}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '160ms' }}>
          <Clock size={24} style={{ color: '#22c55e', marginBottom: 8 }} />
          <div className="stat-value">{stats.sessions}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '240ms' }}>
          <Calendar size={24} style={{ color: '#8b5cf6', marginBottom: 8 }} />
          <div className="stat-value">{stats.events}</div>
          <div className="stat-label">Events Created</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '320ms' }}>
          <Briefcase size={24} style={{ color: '#ec4899', marginBottom: 8 }} />
          <div className="stat-value">{stats.gigs}</div>
          <div className="stat-label">Gigs Posted</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '400ms' }}>
          <Mail size={24} style={{ color: '#06b6d4', marginBottom: 8 }} />
          <div className="stat-value">{stats.invitations}</div>
          <div className="stat-label">New Invitations</div>
        </div>
      </div>

      {/* Pending Student Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={18} style={{ color: '#06b6d4' }} /> Student Invitations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingInvitations.map(inv => (
              <div key={inv.id} style={{
                padding: '14px 16px', borderRadius: 12,
                background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {inv.student?.name || 'A student'} invited you as <span style={{ color: '#06b6d4' }}>{inv.role}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Event: {inv.event?.title || 'Unknown'} · {formatDate(inv.event?.start_time)}
                  </div>
                  {inv.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>"{inv.message}"</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleInvitation(inv.id, 'accept')} style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', background: 'rgba(34,197,94,0.1)',
                    color: '#22c55e', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  }}>Accept</button>
                  <button onClick={() => handleInvitation(inv.id, 'decline')} style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Quick Actions */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/mentorship" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              Manage Mentorship Offerings
            </Link>
            <Link to="/events" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', background: 'var(--blue-400)' }}>
              Create New Event
            </Link>
            <Link to="/gigs" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', background: '#8b5cf6' }}>
              Post a Gig / Internship
            </Link>
            <Link to="/requests" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              View Pending Requests ({stats.requests})
            </Link>
          </div>
        </div>

        {/* Your Impact */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Your Impact</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Students mentored</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.sessions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Active offerings</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.offerings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Events hosted</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.events}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Gigs posted</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.gigs}</span>
            </div>
            <div style={{
              marginTop: 8, padding: '12px 16px', background: 'rgba(34,197,94,0.06)',
              borderRadius: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5
            }}>
              Your mentorship is making a difference. Keep helping the next generation of builders!
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Your Recent Events</h3>
            <Link to="/events" style={{ fontSize: 13, color: 'var(--blue-400)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {recentEvents.map(evt => (
              <div key={evt.id} style={{
                padding: 14, borderRadius: 12, background: 'rgba(139,92,246,0.04)',
                border: '1px solid rgba(139,92,246,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {evt.event_type === 'online' ? <Video size={14} style={{ color: '#22c55e' }} /> : <MapPin size={14} style={{ color: '#22c55e' }} />}
                  <span style={{ fontSize: 11, fontWeight: 600, color: evt.event_type === 'online' ? '#22c55e' : '#22c55e' }}>
                    {evt.event_type === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{evt.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(evt.start_time)} · {evt.venue_name || 'TBD'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Gigs */}
      {recentGigs.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Your Posted Gigs</h3>
            <Link to="/gigs" style={{ fontSize: 13, color: 'var(--blue-400)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {recentGigs.map(g => (
              <div key={g.id} style={{
                padding: 14, borderRadius: 12, background: 'rgba(236,72,153,0.04)',
                border: '1px solid rgba(236,72,153,0.1)',
              }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                  background: g.gig_type === 'internship' ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                  color: g.gig_type === 'internship' ? '#22c55e' : '#8b5cf6',
                }}>{g.gig_type === 'internship' ? 'Internship' : 'Micro Gig'}</span>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8, marginBottom: 4 }}>{g.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.company} · {g.stipend || 'Unpaid'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {recentSessions.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)' }}>Upcoming Sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSessions.map(s => (
              <div key={s.id} style={{
                padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.topic}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    with {s.student?.name || 'Student'} · {s.duration} min · {formatDate(s.scheduled_at)}
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                }}>Scheduled</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
