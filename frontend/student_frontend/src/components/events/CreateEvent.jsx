import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateEvent.css'

const API_BASE = 'http://localhost:8001'
const CURRENT_ALUMNI = 'alumni_001' // mock: Priya Sharma

export default function CreateEvent() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'offline',
    start_time: '',
    end_time: '',
    geo_lat: '',
    geo_lng: '',
    allow_requests: true,
  })

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.description || !form.start_time) {
      alert('Please fill in required fields')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        start_time: form.start_time,
        end_time: form.end_time || null,
        geo_lat: form.event_type === 'offline' ? parseFloat(form.geo_lat) || null : null,
        geo_lng: form.event_type === 'offline' ? parseFloat(form.geo_lng) || null : null,
        allow_requests: form.allow_requests,
        created_by: CURRENT_ALUMNI,
      }
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/events'), 1500)
      } else {
        const err = await res.json()
        alert(err.detail || 'Failed to create event')
      }
    } catch (e) {
      alert('Network error')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="create-event-page">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2>Event Created!</h2>
          <p>Redirecting to events list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="create-event-page">
      <button className="back-btn" onClick={() => navigate('/events')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Events
      </button>

      <div className="create-hero">
        <h1 className="create-title">Create an Event</h1>
        <p className="create-subtitle">Share your knowledge and connect with students</p>
      </div>

      <form className="create-form-card" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Event Title <span className="required">*</span></label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. System Design Workshop"
            value={form.title}
            onChange={e => update('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description <span className="required">*</span></label>
          <textarea
            className="form-textarea"
            placeholder="Describe what attendees will learn or experience..."
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={4}
          />
        </div>

        {/* Event type toggle */}
        <div className="form-group">
          <label className="form-label">Event Type</label>
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn ${form.event_type === 'offline' ? 'active' : ''}`}
              onClick={() => update('event_type', 'offline')}
            >
              📍 In-Person
            </button>
            <button
              type="button"
              className={`type-btn ${form.event_type === 'online' ? 'active' : ''}`}
              onClick={() => update('event_type', 'online')}
            >
              💻 Online
            </button>
          </div>
        </div>

        {/* Date & time */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date & Time <span className="required">*</span></label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.start_time}
              onChange={e => update('start_time', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date & Time</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.end_time}
              onChange={e => update('end_time', e.target.value)}
            />
          </div>
        </div>

        {/* Location (offline only) */}
        {form.event_type === 'offline' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                className="form-input"
                type="number"
                step="any"
                placeholder="e.g. 19.0760"
                value={form.geo_lat}
                onChange={e => update('geo_lat', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                className="form-input"
                type="number"
                step="any"
                placeholder="e.g. 72.8777"
                value={form.geo_lng}
                onChange={e => update('geo_lng', e.target.value)}
              />
            </div>
          </div>
        )}

        {form.event_type === 'offline' && (
          <>
            {/* Privacy toggle — default ON */}
            <div className="form-group">
              <label className="form-label">🔒 Location Privacy</label>
              <div className="privacy-toggle-card">
                <div className="toggle-row" onClick={() => update('location_private', form.location_private !== false)}>
                  <div className={`toggle-switch ${form.location_private !== false ? 'on' : ''}`}>
                    <div className="toggle-knob" />
                  </div>
                  <span className="toggle-text">
                    {form.location_private !== false
                      ? '🔒 Keep location private until approval'
                      : '🔓 Location visible to all registered students'}
                  </span>
                </div>
                <p className="privacy-helper">Only approved students will see the exact location. Each student must be individually granted access.</p>
              </div>
            </div>

            <div className="privacy-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>Location is never shown, hinted, or approximated before your approval. No blurred maps. No area hints.</span>
            </div>
          </>
        )}

        {/* Allow requests toggle */}
        <div className="form-group">
          <label className="form-label">Student Requests</label>
          <div className="toggle-row" onClick={() => update('allow_requests', !form.allow_requests)}>
            <div className={`toggle-switch ${form.allow_requests ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
            <span className="toggle-text">
              {form.allow_requests
                ? '🟢 Students can request location access'
                : '🔴 Requests are disabled for this event'}
            </span>
          </div>
        </div>

        <button className="create-submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Event →'}
        </button>
      </form>
    </div>
  )
}
