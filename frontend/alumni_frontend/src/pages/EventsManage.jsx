import React, { useEffect, useState } from 'react'
import { Plus, MapPin, Video } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { events as eventsStore } from '../localStore'

export default function EventsManage() {
  const { user } = useAuth()
  const ALUMNI_ID = user?.id || 'alumni_001'
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'online', venue_name: '',
    start_time: '', end_time: '', geo_lat: '', geo_lng: '', allow_requests: true,
  })

  const load = () => {
    setEvents(eventsStore.getAll().filter(e => e.created_by === ALUMNI_ID))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createEvent = () => {
    eventsStore.create({
      ...form,
      geo_lat: form.geo_lat ? parseFloat(form.geo_lat) : null,
      geo_lng: form.geo_lng ? parseFloat(form.geo_lng) : null,
      created_by: ALUMNI_ID,
    })
    setShowCreate(false)
    setForm({ title: '', description: '', event_type: 'online', venue_name: '', start_time: '', end_time: '', geo_lat: '', geo_lng: '', allow_requests: true })
    load()
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><p>Loading events...</p></div>

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-subtitle">Create events and manage student requests for location access.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Create Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {events.map((evt, i) => (
          <div key={evt.id} className="glass-card" style={{ animationDelay: `${i * 80}ms`, animation: 'fadeInUp 0.4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {evt.event_type === 'online' ? (
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                  <Video size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Online
                </span>
              ) : (
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                  <MapPin size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Offline
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{evt.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
              {(evt.description || '').slice(0, 120)}{(evt.description || '').length > 120 ? '...' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>📍 {evt.venue_name || 'TBD'}</span>
              <span>📅 {formatDate(evt.start_time)}</span>
              <span>👥 {(evt.alumni || []).length} alumni participating</span>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !showCreate && (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <p>No events created yet. Host your first event!</p>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setShowCreate(false)}>
          <div className="glass-card" style={{
            width: 560, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
            background: 'var(--glass-bg-strong)', animation: 'fadeInUp 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Create New Event</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Event Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Tech Career Fair 2026"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Event Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setForm({ ...form, event_type: 'online' })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 10, border: '1px solid',
                        borderColor: form.event_type === 'online' ? 'var(--blue-400)' : 'var(--glass-border)',
                        background: form.event_type === 'online' ? 'rgba(34,197,94,0.1)' : 'var(--glass-bg)',
                        color: form.event_type === 'online' ? 'var(--blue-500)' : 'var(--text-muted)',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      }}>Online</button>
                    <button onClick={() => setForm({ ...form, event_type: 'offline' })}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 10, border: '1px solid',
                        borderColor: form.event_type === 'offline' ? 'var(--blue-400)' : 'var(--glass-border)',
                        background: form.event_type === 'offline' ? 'rgba(34,197,94,0.1)' : 'var(--glass-bg)',
                        color: form.event_type === 'offline' ? 'var(--blue-500)' : 'var(--text-muted)',
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      }}>Offline</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Venue</label>
                  <input type="text" value={form.venue_name} onChange={e => setForm({ ...form, venue_name: e.target.value })}
                    placeholder={form.event_type === 'online' ? 'Zoom / Google Meet' : 'Location name'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Start Time</label>
                  <input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>End Time</label>
                  <input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              {form.event_type === 'offline' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Latitude</label>
                    <input type="number" step="any" value={form.geo_lat} onChange={e => setForm({ ...form, geo_lat: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Longitude</label>
                    <input type="number" step="any" value={form.geo_lng} onChange={e => setForm({ ...form, geo_lng: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={createEvent} disabled={!form.title || !form.start_time}>Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
