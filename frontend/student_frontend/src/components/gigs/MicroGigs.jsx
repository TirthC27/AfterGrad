import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { gigs as gigsStore } from '../../localStore'
import './MicroGigs.css'

export default function MicroGigs() {
  const [gigsList, setGigsList] = useState([])
  const [selectedGig, setSelectedGig] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [applyingId, setApplyingId] = useState(null)
  const [appliedSet, setAppliedSet] = useState(new Set())
  const cardRefs = useRef([])
  const { user } = useAuth()
  const STUDENT_ID = user?.id || 'student_001'

  useEffect(() => {
    setGigsList(gigsStore.getAll())
    const apps = gigsStore.getStudentApplications(STUDENT_ID)
    setAppliedSet(new Set(apps.map(a => a.gig_id)))
  }, [])

  const filtered = typeFilter === 'all' ? gigsList : gigsList.filter(g => g.gig_type === typeFilter)

  const handleApply = (gigId) => {
    setApplyingId(gigId)
    gigsStore.apply({ gig_id: gigId, student_id: STUDENT_ID, note: 'I am interested!' })
    setAppliedSet(prev => new Set([...prev, gigId]))
    setApplyingId(null)
  }

  const handleMouseMove = (e, idx) => {
    const card = cardRefs.current[idx]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8
    card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`
  }
  const handleMouseLeave = (idx) => {
    const card = cardRefs.current[idx]
    if (card) card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0)'
  }

  return (
    <div className="gigs-page">
      <div className="gigs-header">
        <div>
          <h1 className="gigs-title">Micro Gigs & Internships</h1>
          <p className="gigs-subtitle">Curated opportunities from alumni companies. Apply with one click.</p>
        </div>
      </div>

      <div className="gigs-filters">
        {['all', 'project', 'internship', 'micro'].map(t => (
          <button key={t} className={`gf-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? '🔥 All' : t === 'internship' ? '🎓 Internships' : t === 'project' ? '📂 Projects' : '⚡ Micro Gigs'}
          </button>
        ))}
      </div>

      <div className="gigs-grid">
        {filtered.map((gig, idx) => (
          <div
            key={gig.id}
            className={`gig-card ${selectedGig === gig.id ? 'expanded' : ''}`}
            ref={el => (cardRefs.current[idx] = el)}
            style={{ animationDelay: `${idx * 100}ms` }}
            onMouseMove={e => handleMouseMove(e, idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
            onClick={() => setSelectedGig(selectedGig === gig.id ? null : gig.id)}
          >
            {/* Glow effect */}
            <div className="gig-glow" />

            {gig.status === 'open' && <div className="gig-urgent-badge">🟢 Open</div>}

            <div className="gig-card-top">
              <div className="gig-company-logo">
                {(gig.company || 'G')[0]}
              </div>
              <div className="gig-top-info">
                <span className="gig-company">{gig.company || 'Company'}</span>
                <span className="gig-type-tag">{gig.gig_type}</span>
              </div>
            </div>

            <h3 className="gig-title">{gig.title}</h3>

            <div className="gig-meta-row">
              <span className="gig-meta">⏱ {gig.duration}</span>
              <span className="gig-meta">📅 {new Date(gig.created_at).toLocaleDateString()}</span>
            </div>

            <div className="gig-stipend-row">
              <span className="gig-stipend">₹{(gig.stipend || 0).toLocaleString()}</span>
              <span className="gig-posted">{gig.status}</span>
            </div>

            <div className="gig-skills">
              {(gig.skills_required || []).map(s => <span key={s} className="gig-skill">{s}</span>)}
            </div>

            {selectedGig === gig.id && (
              <div className="gig-expanded-content">
                <p className="gig-description">{gig.description}</p>
                {appliedSet.has(gig.id) ? (
                  <button className="gig-apply-btn" style={{ opacity: 0.6 }} disabled>✅ Applied</button>
                ) : (
                  <button className="gig-apply-btn" disabled={applyingId === gig.id} onClick={e => { e.stopPropagation(); handleApply(gig.id) }}>
                    {applyingId === gig.id ? 'Applying…' : 'Apply Now →'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
