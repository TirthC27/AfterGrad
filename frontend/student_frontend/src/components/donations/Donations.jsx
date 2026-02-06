import React, { useState, useRef } from 'react'
import './Donations.css'

const CAMPAIGNS = [
  {
    id: 'don_001',
    title: 'Scholarship Fund for First-Gen Engineers',
    organizer: 'CHARUSAT Alumni Association',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=400&fit=crop',
    raised: 245000,
    goal: 500000,
    donors: 89,
    daysLeft: 22,
    category: 'Scholarship',
    description: 'Help first-generation engineering students afford tuition, books, and hostel fees. Every rupee goes directly to students in need.',
    featured: true,
  },
  {
    id: 'don_002',
    title: 'New Computer Lab — 50 Workstations',
    organizer: 'CS Department',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
    raised: 780000,
    goal: 1200000,
    donors: 156,
    daysLeft: 15,
    category: 'Infrastructure',
    description: 'Upgrade the computer lab with modern workstations for AI/ML research. Students currently share outdated machines — we can fix that.',
    featured: false,
  },
  {
    id: 'don_003',
    title: 'Mental Health Support Program',
    organizer: 'Student Welfare Committee',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop',
    raised: 120000,
    goal: 300000,
    donors: 64,
    daysLeft: 30,
    category: 'Wellness',
    description: 'Fund free counseling sessions, workshops, and peer support groups. Student mental health matters — help us make professional support accessible.',
    featured: false,
  },
  {
    id: 'don_004',
    title: 'Hackathon Travel Fund 2026',
    organizer: 'Coding Club',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    raised: 85000,
    goal: 150000,
    donors: 41,
    daysLeft: 8,
    category: 'Events',
    description: 'Send 20 students to national hackathons (SIH, HackMIT, ETHIndia). Travel, accommodation, and registration — fully sponsored by alumni.',
    featured: true,
  },
  {
    id: 'don_005',
    title: 'Open Source Library for Campus',
    organizer: 'Library Committee',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
    raised: 55000,
    goal: 200000,
    donors: 33,
    daysLeft: 45,
    category: 'Education',
    description: 'Stock the campus library with the latest tech books, ACM digital library access, and O\'Reilly Learning subscriptions for all students.',
    featured: false,
  },
  {
    id: 'don_006',
    title: 'Women in Tech Mentorship Grant',
    organizer: 'WIT Chapter',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop',
    raised: 190000,
    goal: 250000,
    donors: 72,
    daysLeft: 12,
    category: 'Scholarship',
    description: 'Fund mentorship pairing, conference tickets, and project grants for women pursuing careers in tech. Closing the gap, one grant at a time.',
    featured: true,
  },
]

const CATEGORIES = ['All', 'Scholarship', 'Infrastructure', 'Wellness', 'Events', 'Education']

export default function Donations() {
  const [filter, setFilter] = useState('All')
  const [donatingId, setDonatingId] = useState(null)
  const [amount, setAmount] = useState('')
  const cardRefs = useRef([])

  const filtered = filter === 'All' ? CAMPAIGNS : CAMPAIGNS.filter(c => c.category === filter)

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
          <span className="dt-value">₹14.75L</span>
          <span className="dt-sub">from 455 donors</span>
        </div>
      </div>

      <div className="donations-filters">
        {CATEGORIES.map(c => (
          <button key={c} className={`df-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="donations-grid">
        {filtered.map((camp, idx) => (
          <div
            key={camp.id}
            className={`donation-card ${camp.featured ? 'featured' : ''}`}
            ref={el => (cardRefs.current[idx] = el)}
            style={{ animationDelay: `${idx * 100}ms` }}
            onMouseMove={e => handleMouseMove(e, idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
          >
            {/* Image */}
            <div className="donation-img-wrap">
              <img src={camp.image} alt={camp.title} loading="lazy" />
              <div className="donation-category-badge">{camp.category}</div>
              {camp.featured && <div className="donation-featured-badge">⭐ Featured</div>}
              {camp.daysLeft <= 10 && <div className="donation-ending-badge">🔥 Ending Soon</div>}
            </div>

            {/* Body */}
            <div className="donation-body">
              <h3 className="donation-title">{camp.title}</h3>
              <p className="donation-org">by {camp.organizer}</p>
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
                <span>⏳ {camp.daysLeft} days left</span>
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
                  <button className="donate-confirm-btn" onClick={e => { e.stopPropagation(); alert(`Donated ₹${amount} to ${camp.title}!`); setDonatingId(null); setAmount('') }}>
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
