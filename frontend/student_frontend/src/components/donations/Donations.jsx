import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { donations as donationsStore } from '../../localStore'
import './Donations.css'

export default function Donations() {
  const [campaigns, setCampaigns] = useState([])
  const [filter, setFilter] = useState('All')
  const [donatingId, setDonatingId] = useState(null)
  const [amount, setAmount] = useState('')
  const cardRefs = useRef([])
  const { user } = useAuth()

  const reload = () => setCampaigns(donationsStore.getCampaigns())
  useEffect(() => { reload() }, [])

  const categories = ['All', ...new Set(campaigns.map(c => c.category))]
  const filtered = filter === 'All' ? campaigns : campaigns.filter(c => c.category === filter)

  const formatCurrency = (n) => `₹${(n / 1000).toFixed(0)}K`
  const progress = (raised, goal) => Math.min((raised / goal) * 100, 100)

  const handleMouseMove = (e, idx) => {
    const card = cardRefs.current[idx]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`
  }
  const handleMouseLeave = (idx) => {
    const card = cardRefs.current[idx]
    if (card) card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)'
  }

  return (
    <div className="donations-page">
      <div className="donations-header">
        <div>
          <h1 className="donations-title">Alumni Donations</h1>
          <p className="donations-subtitle">Support your campus community. Every contribution creates lasting impact.</p>
        </div>
        <div className="donations-total-card">
          <span className="dt-label">Total Raised</span>
          <span className="dt-value">{formatCurrency(campaigns.reduce((s, c) => s + (c.raised || 0), 0))}</span>
          <span className="dt-sub">from {campaigns.reduce((s, c) => s + (c.donors || 0), 0)} donors</span>
        </div>
      </div>

      <div className="donations-filters">
        {categories.map(c => (
          <button key={c} className={`df-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="donations-grid">
        {filtered.map((camp, idx) => (
          <div
            key={camp.id}
            className={`donation-card ${progress(camp.raised, camp.goal) >= 80 ? 'featured' : ''}`}
            ref={el => (cardRefs.current[idx] = el)}
            style={{ animationDelay: `${idx * 100}ms` }}
            onMouseMove={e => handleMouseMove(e, idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
          >
            {/* Image */}
            <div className="donation-img-wrap">
              <div style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>{camp.image || '💰'}</div>
              <div className="donation-category-badge">{camp.category}</div>
              {progress(camp.raised, camp.goal) >= 80 && <div className="donation-featured-badge">🔥 Almost There</div>}
            </div>

            {/* Body */}
            <div className="donation-body">
              <h3 className="donation-title">{camp.title}</h3>
              <p className="donation-org">Campaign</p>
              <p className="donation-desc">{camp.description}</p>

              {/* Progress bar */}
              <div className="donation-progress-section">
                <div className="donation-progress-bar">
                  <div className="donation-progress-fill" style={{ width: `${progress(camp.raised, camp.goal)}%` }}>
                    <div className="progress-shimmer" />
                  </div>
                </div>
                <div className="donation-progress-stats">
                  <span className="dp-raised">{formatCurrency(camp.raised)} raised</span>
                  <span className="dp-goal">of {formatCurrency(camp.goal)}</span>
                </div>
              </div>

              {/* Meta row */}
              <div className="donation-meta">
                <span>👥 {camp.donors} donors</span>
                <span>📅 {new Date(camp.created_at).toLocaleDateString()}</span>
              </div>

              {/* Donate section */}
              {donatingId === camp.id ? (
                <div className="donate-input-row">
                  <input
                    type="number" placeholder="₹ Amount" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="donate-input"
                    onClick={e => e.stopPropagation()}
                  />
                  <button className="donate-confirm-btn" onClick={e => {
                    e.stopPropagation()
                    if (!amount || Number(amount) <= 0) return
                    donationsStore.donate({ campaign_id: camp.id, donor_id: user?.id || 'student_001', amount: Number(amount), donor_name: user?.full_name || 'Student' })
                    reload()
                    setDonatingId(null)
                    setAmount('')
                  }}>
                    Confirm
                  </button>
                </div>
              ) : (
                <button className="donate-btn" onClick={e => { e.stopPropagation(); setDonatingId(camp.id) }}>
                  💚 Donate Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
