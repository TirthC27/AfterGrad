import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './EventsList.css'

const API_BASE = 'http://localhost:8001'

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
  const navigate = useNavigate()
  const cardRefs = useRef([])

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(r => r.json())
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
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
            onClick={() => navigate(`/events/${evt.id}`)}
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
    </div>
  )
}
