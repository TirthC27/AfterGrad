import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { events as eventsStore } from '../../localStore'
import './EventsList.css'

const EVENT_IMAGES = {
  evt_001: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
  evt_002: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  evt_003: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
  evt_004: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
  evt_005: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop',
}
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop'

export default function EventsList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const cardRefs = useRef([])
  const { user } = useAuth()
  const CURRENT_STUDENT = user?.id || 'student_001'

  useEffect(() => {
    setEvents(eventsStore.getAll())
    setLoading(false)
  }, [])

  // Parallax tilt effect on mouse move
  const handleMouseMove = (e, idx) => {
    const card = cardRefs.current[idx]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  const handleMouseLeave = (idx) => {
    const card = cardRefs.current[idx]
    if (card) card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)'
  }

  const openEventDrawer = (eventId) => {
    const data = eventsStore.getById(eventId)
    if (data) {
      setSelectedEvent(data)
      setDrawerOpen(true)
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedEvent(null), 300)
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.event_type === filter)

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div className="events-loading">
        <div className="events-spinner" />
        <p>Loading events...</p>
      </div>
    )
  }

  return (
    <div className="events-page">
      <div className="events-page-header">
        <div>
          <h1 className="events-title">Discover Events</h1>
          <p className="events-subtitle">Student-listed events with invited alumni judges & mentors</p>
        </div>
        <div className="events-header-actions">
          <div className="events-filters">
            {['all', 'online', 'offline'].map(f => (
              <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? '🌐 All' : f === 'online' ? '💻 Online' : '📍 In-Person'}
              </button>
            ))}
          </div>
          <button className="create-event-btn" onClick={() => navigate('/events/create')}>+ Create Event</button>
        </div>
      </div>

      <div className="events-grid">
        {filtered.map((evt, idx) => (
          <div
            key={evt.id}
            className="evt-card"
            ref={el => (cardRefs.current[idx] = el)}
            style={{ animationDelay: `${idx * 100}ms` }}
            onMouseMove={e => handleMouseMove(e, idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
            onClick={() => openEventDrawer(evt.id)}
          >
            {/* Image top */}
            <div className="evt-card-img-wrap">
              <img src={EVENT_IMAGES[evt.id] || FALLBACK_IMG} alt={evt.title} loading="lazy" />
              <div className="evt-card-rating">
                <span className="rating-star">⭐</span>
                <span>{(4 + Math.random()).toFixed(1)}</span>
              </div>
              <div className={`evt-card-type-badge ${evt.event_type}`}>
                {evt.event_type === 'online' ? '💻 Online' : '📍 In-Person'}
              </div>
            </div>

            {/* Body */}
            <div className="evt-card-body">
              <div className="evt-card-row-top">
                <h3 className="evt-card-title">{evt.title}</h3>
                <div className="evt-card-price">
                  <span className="evt-price-old">Paid</span>
                  <span className="evt-price-free">Free</span>
                </div>
              </div>

              <div className="evt-card-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span>{evt.venue_name || (evt.event_type === 'online' ? 'Virtual' : 'TBA')}</span>
              </div>

              <div className="evt-card-details">
                <div className="evt-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>{formatDate(evt.start_time)}</span>
                </div>
                <div className="evt-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{formatTime(evt.start_time)}</span>
                </div>
                <div className="evt-detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  <span>{evt.alumni?.length || 0} Alumni</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="events-empty"><p>No {filter !== 'all' ? filter : ''} events found.</p></div>
      )}

      {/* Event Drawer */}
      {drawerOpen && selectedEvent && (
        <EventDrawer event={selectedEvent} onClose={closeDrawer} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Event Drawer Component (slides in from right)
// ═══════════════════════════════════════════════════════════════════════════

function EventDrawer({ event, onClose }) {
  const { user } = useAuth()
  const CURRENT_STUDENT = user?.id || 'student_001'
  const [selectedAlumni, setSelectedAlumni] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestStatus, setRequestStatus] = useState({})
  const [location, setLocation] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const data = eventsStore.getRequestStatus(event.id, CURRENT_STUDENT)
    if (data.status) {
      setRequestStatus(prev => ({ ...prev, [data.alumni_id]: { status: data.status, request_id: data.request_id } }))
      if (data.status === 'accepted' && event.event_type === 'offline') fetchLocation()
    }
  }, [event.id, event.event_type])

  function fetchLocation() {
    const data = eventsStore.getLocation(event.id, CURRENT_STUDENT)
    if (data.access_granted) setLocation(data)
  }

  function sendRequest() {
    if (!selectedAlumni) return
    setSending(true)
    try {
      const req = eventsStore.sendRequest({ event_id: event.id, student_id: CURRENT_STUDENT, alumni_id: selectedAlumni.id, message: requestMessage })
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

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="event-drawer">
        {/* Header with close button */}
        <div className="drawer-header">
          <h2>{event.title}</h2>
          <button className="drawer-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="drawer-content">
          {/* Hero image section */}
          <div className="drawer-hero-img">
            <img src={EVENT_IMAGES[event.id] || FALLBACK_IMG} alt={event.title} />
            <div className={`drawer-event-type ${event.event_type}`}>
              {event.event_type === 'online' ? '💻 Online Event' : '📍 In-Person Event'}
            </div>
            {event.allow_requests && (
              <div className="drawer-requests-open">🟢 Requests Open</div>
            )}
          </div>

          {/* Event info */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">About This Event</h3>
            <p className="drawer-event-desc">{event.description}</p>
          </div>

          {/* Event meta */}
          <div className="drawer-section">
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="meta-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <span className="meta-label">Date</span>
                  <span className="meta-value">{formatDate(event.start_time)}</span>
                </div>
              </div>
              <div className="drawer-meta-item">
                <div className="meta-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <span className="meta-label">Time</span>
                  <span className="meta-value">{formatTime(event.start_time)} — {event.end_time ? formatTime(event.end_time) : 'TBD'}</span>
                </div>
              </div>
              <div className="drawer-meta-item">
                <div className="meta-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{getDuration(event.start_time, event.end_time) || 'TBD'}</span>
                </div>
              </div>
              {event.venue_name && (
                <div className="drawer-meta-item">
                  <div className="meta-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="meta-label">Venue</span>
                    <span className="meta-value">{event.venue_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alumni section */}
          <div className="drawer-section">
            <h3 className="drawer-section-title">Invited Alumni</h3>
            <p className="drawer-section-sub">Click to send a connection request</p>
            <div className="drawer-alumni-grid">
              {event.alumni?.map(a => {
                const status = getAlumniStatus(a.id)
                return (
                  <div
                    key={a.id}
                    className={`drawer-alumni-card ${status !== 'none' ? `status-${status}` : ''}`}
                    onClick={() => {
                      if (status === 'none') {
                        setSelectedAlumni(a)
                        setShowRequestModal(true)
                      }
                    }}
                  >
                    <div className="drawer-alumni-avatar">
                      {a.avatar}
                      {a.verified && <span className="verified-badge">✓</span>}
                    </div>
                    <div className="drawer-alumni-info">
                      <span className="drawer-alumni-name">{a.name}</span>
                      <span className="drawer-alumni-role">{a.job_title} at {a.company}</span>
                      <span className="drawer-alumni-event-role">
                        {a.event_role === 'judge' && '⚖️ Judge'}
                        {a.event_role === 'mentor' && '🎓 Mentor'}
                        {a.event_role === 'speaker' && '🎤 Speaker'}
                      </span>
                    </div>
                    <div className="drawer-alumni-status">
                      {status === 'none' && <span className="status-badge available">Connect →</span>}
                      {status === 'pending' && <span className="status-badge pending">⏳ Pending</span>}
                      {status === 'accepted' && <span className="status-badge accepted">✅ Accepted</span>}
                      {status === 'rejected' && <span className="status-badge rejected">❌ Declined</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Location section (offline only) */}
          {event.event_type === 'offline' && (
            <div className="drawer-section">
              <div className="drawer-location-header">
                {location && location.access_granted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mint-400)" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                )}
                <h3 className="drawer-section-title">Event Location</h3>
              </div>

              {location && location.access_granted ? (
                <div className="drawer-location-granted">
                  <div className="location-granted-msg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Location access granted</span>
                  </div>
                  <div className="location-map-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--mint-400)" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="map-coords">{location.geo_lat?.toFixed(4)}, {location.geo_lng?.toFixed(4)}</span>
                  </div>
                  <a
                    className="drawer-directions-btn"
                    href={`https://www.google.com/maps?q=${location.geo_lat},${location.geo_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📍 Open in Google Maps
                  </a>
                </div>
              ) : (
                <div className="drawer-location-locked">
                  <div className="locked-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <h4>Location is Protected</h4>
                  <p>Send a connection request to an alumni above to get access to the event location.</p>
                  {Object.values(requestStatus).some(s => s.status === 'pending') && (
                    <div className="pending-hint">⏳ Your request is pending</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedAlumni && (
        <div className="drawer-modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="drawer-request-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowRequestModal(false)}>×</button>
            <div className="modal-header-section">
              <div className="modal-alumni-avatar">{selectedAlumni.avatar}</div>
              <div>
                <h4>{selectedAlumni.name}</h4>
                <p>{selectedAlumni.job_title} at {selectedAlumni.company}</p>
              </div>
            </div>
            <div className="modal-body-section">
              <label>Your Message</label>
              <textarea
                placeholder={`Hi ${selectedAlumni.name.split(' ')[0]}, I'd love to connect...`}
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                rows={4}
              />
              <p className="modal-hint">A thoughtful message increases acceptance chances.</p>
            </div>
            <div className="modal-footer-section">
              <button className="modal-cancel" onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button className="modal-send" onClick={sendRequest} disabled={sending}>
                {sending ? 'Sending...' : 'Send Request →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
