import React, { useEffect, useState } from 'react'
import { Check, X, Clock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { mentorship, events as eventsStore, invitations as invStore } from '../localStore'

export default function RequestsInbox() {
  const { user } = useAuth()
  const ALUMNI_ID = user?.id || 'alumni_001'
  const [mentorRequests, setMentorRequests] = useState([])
  const [eventRequests, setEventRequests] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mentorship')

  const load = () => {
    setMentorRequests(mentorship.getAlumniRequests(ALUMNI_ID))
    setEventRequests(eventsStore.getAlumniRequests(ALUMNI_ID))
    setInvitations(invStore.getForAlumni(ALUMNI_ID))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const acceptMentorRequest = (id) => { mentorship.acceptRequest(id); load() }
  const rejectMentorRequest = (id) => { mentorship.rejectRequest(id); load() }
  const acceptEventRequest = (id) => { eventsStore.acceptRequest(id); load() }
  const rejectEventRequest = (id) => { eventsStore.rejectRequest(id); load() }
  const revokeEventAccess = (id) => { eventsStore.revokeRequest(id); load() }
  const acceptInvitation = (id) => { invStore.accept(id); load() }
  const declineInvitation = (id) => { invStore.decline(id); load() }

  const pendingMentor = mentorRequests.filter(r => r.status === 'pending')
  const pendingEvent = eventRequests.filter(r => r.status === 'pending')
  const pendingInvitations = invitations.filter(i => i.status === 'pending')

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><p>Loading requests...</p></div>

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Requests Inbox</h1>
        <p className="page-subtitle">Review and respond to student mentorship, event requests, and invitations.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingMentor.length}</div>
          <div className="stat-label">Pending Mentorship</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingEvent.length}</div>
          <div className="stat-label">Pending Event Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#06b6d4' }}>{pendingInvitations.length}</div>
          <div className="stat-label">Student Invitations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {mentorRequests.filter(r => r.status === 'accepted').length + eventRequests.filter(r => r.status === 'accepted').length + invitations.filter(i => i.status === 'accepted').length}
          </div>
          <div className="stat-label">Total Accepted</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setTab('mentorship')}
          style={{
            padding: '8px 20px', borderRadius: 20, border: '1px solid',
            borderColor: tab === 'mentorship' ? 'var(--blue-400)' : 'var(--glass-border)',
            background: tab === 'mentorship' ? 'var(--blue-500)' : 'transparent',
            color: tab === 'mentorship' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          }}>
          Mentorship ({mentorRequests.length})
        </button>
        <button onClick={() => setTab('events')}
          style={{
            padding: '8px 20px', borderRadius: 20, border: '1px solid',
            borderColor: tab === 'events' ? 'var(--blue-400)' : 'var(--glass-border)',
            background: tab === 'events' ? 'var(--blue-500)' : 'transparent',
            color: tab === 'events' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          }}>
          Events ({eventRequests.length})
        </button>
        <button onClick={() => setTab('invitations')}
          style={{
            padding: '8px 20px', borderRadius: 20, border: '1px solid',
            borderColor: tab === 'invitations' ? '#06b6d4' : 'var(--glass-border)',
            background: tab === 'invitations' ? '#06b6d4' : 'transparent',
            color: tab === 'invitations' ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          }}>
          Invitations ({invitations.length})
        </button>
      </div>

      {/* Mentorship tab */}
      {tab === 'mentorship' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Topic</th>
                <th>Duration</th>
                <th>Note</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mentorRequests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.student?.name || 'Unknown'}</td>
                  <td>{r.topic}</td>
                  <td>{r.duration} min</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.note || '—'}</td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => acceptMentorRequest(r.id)} style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(34,197,94,0.1)',
                          color: '#22c55e', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                        }}><Check size={14} /> Accept</button>
                        <button onClick={() => rejectMentorRequest(r.id)} style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                        }}><X size={14} /> Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {mentorRequests.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No mentorship requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Events tab */}
      {tab === 'events' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Event</th>
                <th>Status</th>
                <th>Location Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventRequests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                  <td>{r.event_title}</td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                  <td>{r.location_granted ? '🟢 Granted' : '⚪ Not granted'}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => acceptEventRequest(r.id)} style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(34,197,94,0.1)',
                          color: '#22c55e', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                        }}><Check size={14} /> Accept</button>
                        <button onClick={() => rejectEventRequest(r.id)} style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                        }}><X size={14} /> Reject</button>
                      </div>
                    )}
                    {r.status === 'accepted' && r.location_granted && (
                      <button onClick={() => revokeEventAccess(r.id)} className="btn-danger" style={{ fontSize: 12, padding: '5px 12px' }}>
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {eventRequests.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No event requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invitations tab */}
      {tab === 'invitations' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Event</th>
                <th>Role</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.student?.name || 'Unknown'}</td>
                  <td>{inv.event?.title || 'Unknown Event'}</td>
                  <td><span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                  }}>{inv.role}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.message || '—'}</td>
                  <td><span className={`status-badge status-${inv.status}`}>{inv.status}</span></td>
                  <td>
                    {inv.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => acceptInvitation(inv.id)} style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(34,197,94,0.1)',
                          color: '#22c55e', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                        }}><Check size={14} /> Accept</button>
                        <button onClick={() => declineInvitation(inv.id)} style={{
                          padding: '5px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                        }}><X size={14} /> Decline</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {invitations.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No invitations from students yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
