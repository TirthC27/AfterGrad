import React, { useEffect, useState } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { gigs as gigsStore } from '../localStore'

export default function GigsManage() {
  const { user } = useAuth()
  const ALUMNI_ID = user?.id || 'alumni_001'
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', description: '', gig_type: 'internship',
    stipend: '', duration: '', skills_required: '',
  })

  const load = () => {
    setGigs(gigsStore.getAll().filter(g => g.posted_by === ALUMNI_ID))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createGig = () => {
    gigsStore.create({
      ...form,
      skills_required: form.skills_required.split(',').map(s => s.trim()).filter(Boolean),
      posted_by: ALUMNI_ID,
    })
    setShowCreate(false)
    setForm({ title: '', company: '', description: '', gig_type: 'internship', stipend: '', duration: '', skills_required: '' })
    load()
  }

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><p>Loading gigs...</p></div>

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Gigs & Internships</h1>
          <p className="page-subtitle">Post opportunities for students at your company.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Post Gig
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {gigs.map((g, i) => (
          <div key={g.id} className="glass-card" style={{ animationDelay: `${i * 80}ms`, animation: 'fadeInUp 0.4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: g.gig_type === 'internship' ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                color: g.gig_type === 'internship' ? '#22c55e' : '#8b5cf6',
              }}>{g.gig_type === 'internship' ? 'Internship' : 'Micro Gig'}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{g.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--blue-500)', fontWeight: 500, marginBottom: 8 }}>{g.company}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
              {(g.description || '').slice(0, 100)}{(g.description || '').length > 100 ? '...' : ''}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {(g.skills_required || []).map(s => (
                <span key={s} style={{
                  padding: '2px 8px', borderRadius: 12, fontSize: 11,
                  background: 'rgba(34,197,94,0.06)', color: 'var(--text-muted)'
                }}>{s}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
              {g.stipend && <span>💰 {g.stipend}</span>}
              {g.duration && <span>⏱ {g.duration}</span>}
            </div>
          </div>
        ))}
      </div>

      {gigs.length === 0 && !showCreate && (
        <div className="empty-state">
          <span className="empty-icon">💼</span>
          <p>No gigs posted yet. Help students get real-world experience!</p>
        </div>
      )}

      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setShowCreate(false)}>
          <div className="glass-card" style={{
            width: 520, maxWidth: '90vw', background: 'var(--glass-bg-strong)',
            animation: 'fadeInUp 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Post a Gig / Internship</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Company</label>
                  <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Type</label>
                  <select value={form.gig_type} onChange={e => setForm({ ...form, gig_type: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="internship">Internship</option>
                    <option value="micro_gig">Micro Gig</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Stipend</label>
                  <input type="text" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })}
                    placeholder="₹50,000/month"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Duration</label>
                  <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="3 months"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Skills Required (comma separated)</label>
                <input type="text" value={form.skills_required} onChange={e => setForm({ ...form, skills_required: e.target.value })}
                  placeholder="React, Python, PostgreSQL"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={createGig} disabled={!form.title || !form.company}>Post Gig</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
