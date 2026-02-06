import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './ExploreMentors.css'

const API_BASE = 'http://localhost:8001'

// Professional headshot images for alumni
const ALUMNI_PHOTOS = {
  alumni_001: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face',
  alumni_002: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
  alumni_003: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face',
  alumni_004: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face',
}

const DEPARTMENT_COLORS = {
  'Product': { bg: 'rgba(99, 102, 241, 0.9)', text: '#fff' },
  'Engineering': { bg: 'rgba(16, 185, 129, 0.9)', text: '#fff' },
  'Design': { bg: 'rgba(236, 72, 153, 0.9)', text: '#fff' },
  'Leadership': { bg: 'rgba(245, 158, 11, 0.9)', text: '#fff' },
  'Data Science': { bg: 'rgba(59, 130, 246, 0.9)', text: '#fff' },
  'default': { bg: 'rgba(134, 239, 172, 0.9)', text: '#0a2e14' },
}

export default function ExploreMentors() {
  const [offerings, setOfferings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [requestingId, setRequestingId] = useState(null)
  const [requestNote, setRequestNote] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedOffering, setSelectedOffering] = useState(null)
  const [sentRequests, setSentRequests] = useState(new Set())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const gridRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/mentorship/offerings`)
      .then(r => r.json())
      .then(data => { setOfferings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Parallax grid effect — cards shift slightly based on mouse position
  const handleGridMouseMove = (e) => {
    if (!gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  const allTags = [...new Set(offerings.flatMap(o => o.tags || []))]
  const filtered = filter === 'all' ? offerings : offerings.filter(o => (o.tags || []).includes(filter))

  const durationLabel = (min) => min === 60 ? '1 hour' : `${min} min`

  const getDeptColor = (tags) => {
    for (const tag of (tags || [])) {
      if (DEPARTMENT_COLORS[tag]) return DEPARTMENT_COLORS[tag]
    }
    return DEPARTMENT_COLORS['default']
  }

  const openRequestModal = (offering) => {
    setSelectedOffering(offering); setRequestNote(''); setShowModal(true)
  }

  const submitRequest = async () => {
    if (!selectedOffering) return
    setRequestingId(selectedOffering.id)
    try {
      const res = await fetch(`${API_BASE}/api/mentorship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'student_001', offering_id: selectedOffering.id, note: requestNote }),
      })
      if (res.ok) {
        setSentRequests(prev => new Set([...prev, selectedOffering.id]))
        setShowModal(false)
      }
    } catch (e) { console.error(e) }
    finally { setRequestingId(null) }
  }

  if (loading) {
    return (
      <div className="mentors-loading">
        <div className="mentors-spinner" /><p>Loading mentors...</p>
      </div>
    )
  }

  return (
    <div className="mentors-page">
      <div className="mentors-page-header">
        <div>
          <h1 className="mentors-title">Alumni Mentors</h1>
          <p className="mentors-subtitle">Connect with verified alumni from top companies. Request mentorship — approval required.</p>
        </div>
      </div>

      <div className="escrow-banner">
        <span className="escrow-icon">🛡️</span>
        <span className="escrow-text">Escrow-protected sessions <span className="coming-soon">(coming soon)</span></span>
      </div>

      <div className="mentor-filters">
        <button className={`mf-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Topics</button>
        {allTags.map(tag => (
          <button key={tag} className={`mf-chip ${filter === tag ? 'active' : ''}`} onClick={() => setFilter(tag)}>{tag}</button>
        ))}
      </div>

      {/* Parallax card grid */}
      <div className="mentors-parallax-grid" ref={gridRef} onMouseMove={handleGridMouseMove}>
        {filtered.map((offer, idx) => {
          const dept = getDeptColor(offer.tags)
          const parallaxX = mousePos.x * (idx % 2 === 0 ? 4 : -4)
          const parallaxY = mousePos.y * (idx % 2 === 0 ? 3 : -3)
          return (
            <div
              key={offer.id}
              className="mentor-pro-card"
              style={{
                animationDelay: `${idx * 120}ms`,
                transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              }}
            >
              {/* Photo section */}
              <div className="mentor-photo-section">
                <img
                  src={ALUMNI_PHOTOS[offer.alumni?.id] || `https://ui-avatars.com/api/?name=${offer.alumni?.name}&size=400&background=86efac&color=0a2e14&bold=true`}
                  alt={offer.alumni?.name}
                  className="mentor-photo"
                />
                <div className="mentor-dept-badge" style={{ background: dept.bg, color: dept.text }}>
                  {offer.tags?.[0] || 'Mentorship'}
                </div>
                <div className="mentor-photo-overlay" />
              </div>

              {/* Info section */}
              <div className="mentor-pro-info">
                <h3 className="mentor-pro-name">
                  {offer.alumni?.name}
                  {offer.alumni?.verified && <span className="mentor-verified">✓</span>}
                </h3>
                <p className="mentor-pro-role">{offer.alumni?.job_title}</p>
                <p className="mentor-pro-company">@ {offer.alumni?.company}</p>

                <div className="mentor-pro-topic">
                  <span className="topic-label">Offering:</span>
                  <span className="topic-value">{offer.topic}</span>
                </div>

                <div className="mentor-pro-meta">
                  <span className="meta-duration">⏱ {durationLabel(offer.duration)}</span>
                  <span className="meta-divider">·</span>
                  <span className="meta-tags">{(offer.tags || []).join(', ')}</span>
                </div>

                <div className="mentor-pro-actions">
                  {sentRequests.has(offer.id) ? (
                    <span className="request-sent-pill">⏳ Request Sent</span>
                  ) : (
                    <button className="request-mentorship-btn" onClick={(e) => { e.stopPropagation(); openRequestModal(offer) }}>
                      Request Mentorship →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mentors-empty"><span className="empty-icon">🔍</span><p>No offerings match this filter</p></div>
      )}

      {/* Request Modal */}
      {showModal && selectedOffering && (
        <div className="request-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="request-modal" onClick={e => e.stopPropagation()}>
            <div className="request-modal-header">
              <h2>Request Mentorship</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="request-modal-body">
              <div className="modal-offering-info">
                <img
                  src={ALUMNI_PHOTOS[selectedOffering.alumni?.id] || ''}
                  alt="" className="modal-avatar-img"
                />
                <div>
                  <strong>{selectedOffering.alumni?.name}</strong>
                  <p className="modal-topic">{selectedOffering.topic}</p>
                  <span className="modal-duration">⏱ {durationLabel(selectedOffering.duration)}</span>
                </div>
              </div>
              <div className="modal-field">
                <label>Add a note <span className="optional">(optional)</span></label>
                <textarea
                  value={requestNote} onChange={e => setRequestNote(e.target.value)}
                  placeholder="Introduce yourself and explain what you'd like guidance on..."
                  rows={4}
                />
              </div>
              <div className="modal-notice">
                <span className="notice-icon">🔒</span>
                <p>This request enters a pending approval state. The alumni will review and decide whether to accept.</p>
              </div>
            </div>
            <div className="request-modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={submitRequest} disabled={requestingId === selectedOffering.id}>
                {requestingId === selectedOffering.id ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
