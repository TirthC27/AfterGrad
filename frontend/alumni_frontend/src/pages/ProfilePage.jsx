import React, { useEffect, useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, Edit3, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { auth, resume as resumeStore } from '../localStore'

export default function ProfilePage() {
  const { user } = useAuth()
  const ALUMNI_ID = user?.id || 'alumni_001'
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [parseResult, setParseResult] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    const p = auth.getProfile(ALUMNI_ID)
    if (p) { setProfile(p); setForm(p) }
    setLoading(false)
  }, [])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setParseResult(null)
    try {
      const data = resumeStore.upload(ALUMNI_ID, file)
      setParseResult(data)
      const prof = auth.getProfile(ALUMNI_ID)
      setProfile(prof)
      setForm(prof)
    } catch (err) {
      setParseResult({ error: 'Upload failed' })
    }
    setUploading(false)
  }

  const saveProfile = () => {
    auth.updateProfile(ALUMNI_ID, {
      name: form.name,
      bio: form.bio,
      company: form.company,
      job_title: form.job_title,
      location: form.location,
      linkedin_url: form.linkedin_url,
      github_url: form.github_url,
    })
    const updated = auth.getProfile(ALUMNI_ID)
    setProfile(updated)
    setForm(updated)
    setEditing(false)
  }

  if (loading) return <div className="loading-state"><div className="loading-spinner" /><p>Loading profile...</p></div>
  if (!profile) return <div className="empty-state"><p>Profile not found</p></div>

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{profile.name || 'Alumni Profile'}</h1>
          <p className="page-subtitle">{profile.company} · {profile.job_title}</p>
        </div>
        <button
          className={editing ? 'btn-primary' : 'btn-secondary'}
          onClick={() => editing ? saveProfile() : setEditing(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {editing ? <><Save size={16} /> Save</> : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Profile info */}
        <div className="glass-card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Profile Details</h3>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Name', key: 'name' },
                { label: 'Company', key: 'company' },
                { label: 'Job Title', key: 'job_title' },
                { label: 'Location', key: 'location' },
                { label: 'LinkedIn URL', key: 'linkedin_url' },
                { label: 'GitHub URL', key: 'github_url' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                  <input type="text" value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Bio</label>
                <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', fontSize: 14, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Email', value: profile.email },
                { label: 'Company', value: profile.company },
                { label: 'Title', value: profile.job_title },
                { label: 'Passout Year', value: profile.passout_year },
                { label: 'Location', value: profile.location },
                { label: 'Bio', value: profile.bio },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{row.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills & Resume */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(profile.skills || []).length > 0 ? (
                profile.skills.map(s => (
                  <span key={s} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: 'rgba(34,197,94,0.1)', color: 'var(--mint-500)'
                  }}>{s}</span>
                ))
              ) : (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills yet. Upload your resume to auto-detect!</span>
              )}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--text-primary)' }}>Resume Upload</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Upload your resume (PDF or DOCX) to auto-extract skills, experience, and passout year.
            </p>

            <input type="file" ref={fileRef} accept=".pdf,.docx" onChange={handleUpload} style={{ display: 'none' }} />
            <button
              className="btn-primary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}
            >
              {uploading ? (
                <><div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Parsing...</>
              ) : (
                <><Upload size={16} /> Upload Resume</>
              )}
            </button>

            {parseResult && !parseResult.error && (
              <div style={{
                marginTop: 14, padding: 14, borderRadius: 10,
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <CheckCircle size={16} style={{ color: '#22c55e' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>Resume parsed!</span>
                </div>
                {parseResult.extracted?.name && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Name: <strong>{parseResult.extracted.name}</strong></p>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Skills found: <strong>{parseResult.extracted?.skills_count || 0}</strong>
                </p>
                {parseResult.extracted?.passout_year && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Passout year: <strong>{parseResult.extracted.passout_year}</strong></p>
                )}
              </div>
            )}
            {parseResult?.error && (
              <p style={{ marginTop: 10, fontSize: 13, color: '#ef4444' }}>{parseResult.error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
