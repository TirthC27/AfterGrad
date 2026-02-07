import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { events as eventsStore } from '../../localStore'
import InviteAlumni from './InviteAlumni'
import './EventDetail.css'

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const CURRENT_STUDENT = user?.id || 'student_001'
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAlumni, setSelectedAlumni] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestStatus, setRequestStatus] = useState({}) // { alumni_id: {status, request_id} }
  const [location, setLocation] = useState(null)
  const [sending, setSending] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    const evtData = eventsStore.getById(eventId)
    const statusData = eventsStore.getRequestStatus(eventId, CURRENT_STUDENT)
    setEvent(evtData)
    if (statusData.status) {
      setRequestStatus(prev => ({ ...prev, [statusData.alumni_id]: { status: statusData.status, request_id: statusData.request_id } }))
      if (statusData.status === 'accepted' && evtData?.event_type === 'offline') fetchLocation()
    }
    setLoading(false)
  }, [eventId])

  function fetchLocation() {
    const data = eventsStore.getLocation(eventId, CURRENT_STUDENT)
    if (data.access_granted) setLocation(data)
  }

  function sendRequest() {
    if (!selectedAlumni) return
    setSending(true)
    try {
      const req = eventsStore.sendRequest({ event_id: eventId, student_id: CURRENT_STUDENT, alumni_id: selectedAlumni.id, message: requestMessage })
      setRequestStatus(prev => ({ ...prev, [selectedAlumni.id]: { status: 'pending', request_id: req.id } }))
      setShowRequestModal(false)
      setRequestMessage('')
    } catch (e) { alert(e.message) }
    setSending(false)
  }

  const getAlumniStatus = (alumniId) => requestStatus[alumniId]?.status || 'none'

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const getDuration = (start, end) => {
    if (!end) return ''
    const ms = new Date(end) - new Date(start)
    const hrs = Math.floor(ms / 3600000)
    const mins = Math.round((ms % 3600000) / 60000)
    return hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="events-loading">
        <div className="events-spinner" />
        <p>Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="events-empty">
        <p>Event not found.</p>
        <button className="back-btn" onClick={() => navigate('/events')}>← Back to Events</button>
      </div>
    )
  }

  return (
    <div className="event-detail-page">
      {/* Back nav */}
      <button className="back-btn" onClick={() => navigate('/events')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Events
      </button>

      {/* Hero section */}
      <div className="event-hero-card">
        <div className="event-hero-header">
          <div className={`event-type-badge ${event.event_type}`}>
            {event.event_type === 'online' ? '💻 Online' : '📍 In-Person'}
          </div>
          {event.allow_requests && (
            <div className="requests-open-badge">🟢 Requests Open</div>
          )}
          {event.created_by === CURRENT_STUDENT && (
            <button className="invite-alumni-hero-btn" onClick={() => setShowInviteModal(true)}>
              🎓 Invite Alumni
            </button>
          )}
        </div>
        <h1 className="event-hero-title">{event.title}</h1>
        <p className="event-hero-desc">{event.description}</p>

        <div className="event-hero-meta">
          <div className="hero-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.start_time)}</span>
          </div>
          <div className="hero-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(event.start_time)} — {event.end_time ? formatTime(event.end_time) : 'TBD'}</span>
          </div>
          <div className="hero-meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>{getDuration(event.start_time, event.end_time)} duration</span>
          </div>
        </div>
      </div>

      {/* Alumni section */}
      <div className="event-section">
        <h2 className="event-section-title">Alumni Attending</h2>
        <p className="event-section-sub">Select an alumni to send a connection request</p>
        <div className="alumni-cards-grid">
          {event.alumni?.map(a => {
            const status = getAlumniStatus(a.id)
            return (
              <div
                key={a.id}
                className={`alumni-card ${status !== 'none' ? `status-${status}` : ''} ${selectedAlumni?.id === a.id ? 'selected' : ''}`}
                onClick={() => {
                  if (status === 'none') {
                    setSelectedAlumni(a)
                    setShowRequestModal(true)
                  }
                }}
              >
                <div className="alumni-card-avatar">
                  {a.avatar}
                  {a.verified && <span className="verified-dot" />}
                </div>
                <div className="alumni-card-info">
                  <span className="alumni-card-name">{a.name}</span>
                  <span className="alumni-card-role">{a.job_title} at {a.company}</span>
                  <span className="alumni-card-event-role">{a.event_role === 'host' ? '🎤 Host' : '👤 Attendee'}</span>
                </div>
                <div className="alumni-card-status">
                  {status === 'none' && (
                    <span className="status-chip status-available">Connect →</span>
                  )}
                  {status === 'pending' && (
                    <span className="status-chip status-pending">⏳ Pending</span>
                  )}
                  {status === 'accepted' && (
                    <span className="status-chip status-accepted">✅ Accepted</span>
                  )}
                  {status === 'rejected' && (
                    <span className="status-chip status-rejected">❌ Declined</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Location section */}
      {event.event_type === 'offline' && (
        <div className="event-section location-section">
          <div className="location-section-header">
            {location && location.access_granted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <line x1="3" y1="15" x2="21" y2="15" opacity="0" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            )}
            <h2 className="event-section-title" style={{ margin: 0 }}>Event Location</h2>
          </div>

          {location && location.access_granted ? (
            /* ─── APPROVED STATE ─── */
            <div className="location-revealed">
              <div className="location-granted-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Location access granted</span>
                {location.granted_at && (
                  <span className="granted-timestamp">
                    • Access granted on {new Date(location.granted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
              <div className="location-map-placeholder">
                <div className="map-image">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--mint-400)" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="map-venue-name">Event Venue</span>
                  <span className="map-coords">{location.geo_lat?.toFixed(4)}, {location.geo_lng?.toFixed(4)}</span>
                </div>
              </div>
              <div className="location-actions">
                <a
                  className="location-btn directions-btn"
                  href={`https://www.google.com/maps?q=${location.geo_lat},${location.geo_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📍 Open in Maps
                </a>
                <button className="location-btn chat-btn" onClick={() => alert('Chat feature coming soon!')}>
                  💬 Message Alumni
                </button>
              </div>
            </div>
          ) : (
            /* ─── PENDING / NOT REQUESTED STATE ─── */
            <div className="location-locked-full">
              <div className="locked-icon-container">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h3>Location is Protected</h3>
              <p>This location will be shared after the alumni approves your request.</p>
              {Object.values(requestStatus).some(s => s.status === 'pending') ? (
                <div className="locked-status-hint pending-hint">
                  <span className="hint-icon">⏳</span>
                  <span>Your request is pending — you'll be notified once approved</span>
                </div>
              ) : (
                <div className="locked-status-hint">
                  <span className="hint-icon">👆</span>
                  <span>Select an alumni above to request location access</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedAlumni && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="request-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRequestModal(false)}>×</button>
            <div className="modal-header">
              <div className="modal-alumni-avatar">{selectedAlumni.avatar}</div>
              <div>
                <h3 className="modal-alumni-name">{selectedAlumni.name}</h3>
                <p className="modal-alumni-role">{selectedAlumni.job_title} at {selectedAlumni.company}</p>
              </div>
            </div>
            <div className="modal-body">
              <label className="modal-label">Your Message</label>
              <textarea
                className="modal-textarea"
                placeholder={`Hi ${selectedAlumni.name.split(' ')[0]}, I'd love to connect at this event...`}
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                rows={4}
              />
              <p className="modal-hint">A thoughtful message increases your chances of getting accepted.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button className="modal-send-btn" onClick={sendRequest} disabled={sending}>
                {sending ? 'Sending...' : 'Send Request →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Alumni Modal */}
      {showInviteModal && (
        <InviteAlumni eventId={eventId} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  )
}
