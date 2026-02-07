import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { events as eventsStore } from '../../localStore'
import './LocationRequests.css'

export default function LocationRequests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const CURRENT_STUDENT = user?.id || 'student_001'
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | pending | accepted | revoked

  useEffect(() => {
    setRequests(eventsStore.getStudentRequests(CURRENT_STUDENT))
    setLoading(false)
  }, [])

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const statusConfig = {
    pending: { label: '⏳ Pending Approval', className: 'status-pending', desc: 'Waiting for alumni to approve' },
    accepted: { label: '🔓 Location Revealed', className: 'status-accepted', desc: 'You can view the event location' },
    rejected: { label: '❌ Declined', className: 'status-rejected', desc: 'Alumni declined your request' },
    revoked: { label: '🔒 Access Revoked', className: 'status-revoked', desc: 'Location access was revoked' },
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="events-loading">
        <div className="events-spinner" />
        <p>Loading your requests...</p>
      </div>
    )
  }

  return (
    <div className="location-requests-page">
      <div className="lr-header">
        <div>
          <h1 className="lr-title">🔐 Location Requests</h1>
          <p className="lr-subtitle">Track your event location access requests — privacy-first</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="lr-stats-row">
        <div className="lr-stat">
          <span className="lr-stat-number">{requests.filter(r => r.status === 'pending').length}</span>
          <span className="lr-stat-label">Pending</span>
        </div>
        <div className="lr-stat">
          <span className="lr-stat-number">{requests.filter(r => r.status === 'accepted').length}</span>
          <span className="lr-stat-label">Approved</span>
        </div>
        <div className="lr-stat">
          <span className="lr-stat-number">{requests.filter(r => r.status === 'revoked').length}</span>
          <span className="lr-stat-label">Revoked</span>
        </div>
      </div>

      {/* Filters */}
      <div className="lr-filters">
        {['all', 'pending', 'accepted', 'revoked'].map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' && 'All'}
            {f === 'pending' && '⏳ Pending'}
            {f === 'accepted' && '🔓 Approved'}
            {f === 'revoked' && '🔒 Revoked'}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {filtered.length === 0 ? (
        <div className="lr-empty">
          <div className="lr-empty-icon">🔐</div>
          <h3>No {filter !== 'all' ? filter : ''} location requests</h3>
          <p>When you request access to in-person events, they'll appear here.</p>
          <button className="lr-browse-btn" onClick={() => navigate('/events')}>
            Browse Events →
          </button>
        </div>
      ) : (
        <div className="lr-list">
          {filtered.map((req, idx) => {
            const config = statusConfig[req.status] || statusConfig.pending
            return (
              <div
                key={req.id}
                className={`lr-card ${config.className}`}
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => navigate(`/events/${req.event_id}`)}
              >
                <div className="lr-card-left">
                  <div className="lr-alumni-avatar">{req.alumni_avatar}</div>
                  <div className="lr-card-info">
                    <span className="lr-event-title">{req.event_title}</span>
                    <span className="lr-alumni-name">{req.alumni_name} · {req.alumni_company}</span>
                    <span className="lr-request-date">Requested {formatDate(req.created_at)}</span>
                  </div>
                </div>
                <div className="lr-card-right">
                  <span className={`lr-status-badge ${config.className}`}>{config.label}</span>
                  {req.granted_at && !req.revoked_at && (
                    <span className="lr-granted-date">Granted {formatDate(req.granted_at)}</span>
                  )}
                  {req.revoked_at && (
                    <span className="lr-revoked-date">Revoked {formatDate(req.revoked_at)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
