import React, { useEffect, useState } from 'react'
import { Plus, ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { mentorship } from '../localStore'

export default function MentorshipManage() {
  const { user } = useAuth()
  const ALUMNI_ID = user?.id || 'alumni_001'
  const [offerings, setOfferings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ topic: '', description: '', duration: 30, price: 0, tags: '' })

  const load = () => {
    setOfferings(mentorship.getAlumniOfferings(ALUMNI_ID))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createOffering = () => {
    mentorship.createOffering({
      alumni_id: ALUMNI_ID,
      topic: form.topic,
      description: form.description,
      duration: form.duration,
      price: form.price,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setShowCreate(false)
    setForm({ topic: '', description: '', duration: 30, price: 0, tags: '' })
    load()
  }

  const toggleOffering = (id) => {
    mentorship.toggleOffering(id)
    load()
  }

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><p>Loading offerings...</p></div>

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Mentorship Offerings</h1>
          <p className="page-subtitle">Create and manage your mentorship offerings for students.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Offering
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {offerings.map((o, i) => (
          <div key={o.id} className="glass-card" style={{ animationDelay: `${i * 80}ms`, animation: 'fadeInUp 0.4s ease both', opacity: o.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', flex: 1, marginRight: 12 }}>{o.topic}</h3>
              <button onClick={() => toggleOffering(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: o.active ? '#22c55e' : 'var(--text-muted)' }}>
                {o.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>{o.description}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {(o.tags || []).map(tag => (
                <span key={tag} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: 'rgba(34,197,94,0.1)', color: 'var(--mint-500)'
                }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <Clock size={14} />
              <span>{o.duration} min</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>{o.active ? '🟢 Active' : '⚪ Inactive'}</span>
            </div>
          </div>
        ))}
      </div>

      {offerings.length === 0 && !showCreate && (
        <div className="empty-state">
          <span className="empty-icon">🎓</span>
          <p>No offerings yet. Create one to start mentoring students!</p>
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
            width: 500, maxWidth: '90vw', background: 'var(--glass-bg-strong)',
            animation: 'fadeInUp 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Mentorship Offering</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Topic</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. System Design Interview Prep"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What will the student learn?"
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Duration</label>
                  <select value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Tags (comma separated)</label>
                  <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="System Design, FAANG"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={createOffering} disabled={!form.topic}>Create Offering</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
