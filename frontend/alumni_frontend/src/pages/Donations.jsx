import React, { useState, useRef, useEffect } from 'react'
import {
  Heart, Share2, TrendingUp, Users, Target, Calendar,
  Copy, ChevronDown, ChevronRight, Star, Gift, BookOpen,
  Laptop, Brain, Library, Search, Filter, X, Check,
  Download, BarChart3, Clock, Award, Sparkles, ExternalLink,
  ArrowUpRight, MessageCircle
} from 'lucide-react'

/* ── Campaign Data ── */
const campaigns = [
  {
    id: 1,
    tab: 'Scholarships',
    tabIcon: 'BookOpen',
    title: 'Scholarship Fund for First-Gen Students',
    tagline: 'EMPOWER FUTURES!',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80',
    raised: 240000,
    goal: 500000,
    daysLeft: 42,
    donors: 156,
    description: 'Help bridge the gap for first-generation college students by funding scholarships that cover tuition, books, and living expenses. Every contribution brings someone closer to their dream.',
    org: { name: 'Alumni Education Trust', avatar: 'AE', color: '#6366f1' },
    recentDonors: [
      { name: 'Rajesh K.', amount: 5000, time: '2 hours ago', avatar: 'RK' },
      { name: 'Priya S.', amount: 2500, time: '5 hours ago', avatar: 'PS' },
      { name: 'Anonymous', amount: 10000, time: '1 day ago', avatar: 'AN' },
      { name: 'Vikram M.', amount: 1000, time: '1 day ago', avatar: 'VM' },
      { name: 'Anjali R.', amount: 3000, time: '2 days ago', avatar: 'AR' },
    ],
    updates: [
      { date: 'Dec 15', text: '50 students received scholarship offers!' },
      { date: 'Nov 28', text: 'Crossed ₹2L milestone — thank you all!' },
    ],
    quote: '"Education is the passport to the future." — Malcolm X',
  },
  {
    id: 2,
    tab: 'Tech & Labs',
    tabIcon: 'Laptop',
    title: 'New Computer Lab Equipment',
    tagline: 'BUILD THE FUTURE!',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    raised: 380000,
    goal: 600000,
    daysLeft: 28,
    donors: 89,
    description: 'Our campus computer labs need a major upgrade. Fund new workstations, high-speed networking, and cutting-edge software licenses so students can learn with industry-standard tools.',
    org: { name: 'Campus Tech Foundation', avatar: 'CT', color: '#0ea5e9' },
    recentDonors: [
      { name: 'Arjun D.', amount: 15000, time: '3 hours ago', avatar: 'AD' },
      { name: 'Meera T.', amount: 7500, time: '6 hours ago', avatar: 'MT' },
      { name: 'Tech Corp Alumni', amount: 50000, time: '8 hours ago', avatar: 'TC' },
      { name: 'Sneha B.', amount: 2000, time: '1 day ago', avatar: 'SB' },
      { name: 'Rohit P.', amount: 4000, time: '2 days ago', avatar: 'RP' },
    ],
    updates: [
      { date: 'Dec 18', text: 'Phase 1 procurement started — 20 workstations ordered!' },
      { date: 'Dec 5', text: 'Partnership with Dell for discounted hardware.' },
    ],
    quote: '"Technology is best when it brings people together." — Matt Mullenweg',
  },
  {
    id: 3,
    tab: 'Wellness',
    tabIcon: 'Brain',
    title: 'Campus Mental Health Initiative',
    tagline: 'HEAL & GROW!',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&q=80',
    raised: 120000,
    goal: 200000,
    daysLeft: 55,
    donors: 210,
    description: 'Mental health matters. This initiative funds on-campus counseling services, wellness workshops, peer support groups, and a 24/7 helpline for students in need.',
    org: { name: 'Student Wellness Board', avatar: 'SW', color: '#f59e0b' },
    recentDonors: [
      { name: 'Dr. Nisha L.', amount: 8000, time: '1 hour ago', avatar: 'NL' },
      { name: 'Karan S.', amount: 1500, time: '4 hours ago', avatar: 'KS' },
      { name: 'Alumni Batch 2018', amount: 25000, time: '12 hours ago', avatar: 'AB' },
      { name: 'Suman G.', amount: 3000, time: '1 day ago', avatar: 'SG' },
      { name: 'Anonymous', amount: 5000, time: '2 days ago', avatar: 'AN' },
    ],
    updates: [
      { date: 'Dec 20', text: 'New counselor hired — sessions begin January!' },
      { date: 'Dec 10', text: 'Mindfulness workshop attended by 200 students.' },
    ],
    quote: '"Caring for your mind is not a luxury — it\'s a necessity."',
  },
  {
    id: 4,
    tab: 'Library',
    tabIcon: 'Library',
    title: 'Library Digital Archive Renovation',
    tagline: 'PRESERVE KNOWLEDGE!',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80',
    raised: 95000,
    goal: 300000,
    daysLeft: 70,
    donors: 47,
    description: 'Transform the campus library with a state-of-the-art digital archive: digitize rare collections, build an online portal, and create collaborative study spaces for the next generation.',
    org: { name: 'Heritage & Archives Society', avatar: 'HA', color: '#8b5cf6' },
    recentDonors: [
      { name: 'Prof. Sharma', amount: 20000, time: '5 hours ago', avatar: 'PS' },
      { name: 'Anil K.', amount: 5000, time: '1 day ago', avatar: 'AK' },
      { name: 'Book Club Alumni', amount: 12000, time: '2 days ago', avatar: 'BC' },
      { name: 'Deepa N.', amount: 2500, time: '3 days ago', avatar: 'DN' },
    ],
    updates: [
      { date: 'Dec 12', text: 'Scanning equipment procured — digitization begins!' },
      { date: 'Nov 30', text: '500 rare manuscripts identified for archiving.' },
    ],
    quote: '"A library is not a luxury but one of the necessities of life." — Henry Ward Beecher',
  },
]

const ICON_MAP = { BookOpen, Laptop, Brain, Library }

function formatCurrency(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function formatFull(n) {
  return '₹' + n.toLocaleString('en-IN')
}

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef()
  useEffect(() => {
    let start = 0
    const step = (ts) => {
      if (!ref.current) ref.current = ts
      const progress = Math.min((ts - ref.current) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    ref.current = null
    requestAnimationFrame(step)
  }, [value, duration])
  return <>{display.toLocaleString('en-IN')}</>
}

export default function Donations({ addToast }) {
  const [activeTab, setActiveTab] = useState(0)
  const [donateOpen, setDonateOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donated, setDonated] = useState({})
  const [shareOpen, setShareOpen] = useState(false)
  const [showAllDonors, setShowAllDonors] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState({})
  const [toast, setToast] = useState(null)

  const campaign = campaigns[activeTab]
  const pct = Math.round((campaign.raised / campaign.goal) * 100)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
    addToast?.(msg)
  }

  const handleDonate = () => {
    const val = amount || customAmount
    if (!val || isNaN(Number(val)) || Number(val) <= 0) return
    setDonated(prev => ({ ...prev, [campaign.id]: (prev[campaign.id] || 0) + Number(val) }))
    showToast(`Successfully donated ₹${Number(val).toLocaleString('en-IN')} to "${campaign.title}"!`)
    setDonateOpen(false)
    setAmount('')
    setCustomAmount('')
  }

  const handleShare = (platform) => {
    const url = `https://alumni.edu/donate/${campaign.id}`
    const text = `Support "${campaign.title}" — ${formatFull(campaign.raised)} raised so far! ${url}`
    if (platform === 'copy') {
      navigator.clipboard?.writeText(url)
      showToast('Link copied to clipboard!')
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    }
    setShareOpen(false)
  }

  const handleComment = () => {
    if (!comment.trim()) return
    setComments(prev => ({
      ...prev,
      [campaign.id]: [...(prev[campaign.id] || []), { text: comment, time: 'Just now', name: 'You' }]
    }))
    setComment('')
    showToast('Comment posted!')
  }

  const TabIcon = ICON_MAP[campaign.tabIcon] || Heart

  return (
    <div className="dn-page">
      {/* ── Tab Bar ── */}
      <div className="dn-tabs">
        {campaigns.map((c, i) => {
          const Icon = ICON_MAP[c.tabIcon] || Heart
          return (
            <button
              key={c.id}
              className={`dn-tab ${i === activeTab ? 'active' : ''}`}
              onClick={() => { setActiveTab(i); setShowAllDonors(false) }}
            >
              <Icon size={16} />
              <span>{c.tab}</span>
              {donated[c.id] && <span className="dn-tab-donated">✓</span>}
            </button>
          )
        })}
      </div>

      {/* ── Campaign Layout ── */}
      <div className="dn-layout" key={campaign.id}>
        {/* LEFT COLUMN */}
        <div className="dn-left">
          {/* Hero Image */}
          <div className="dn-hero">
            <img src={campaign.image} alt={campaign.title} className="dn-hero-img" />
            <div className="dn-hero-overlay">
              <span className="dn-hero-tagline">{campaign.tagline}</span>
            </div>
            <div className="dn-hero-badge">
              <Calendar size={13} /> {campaign.daysLeft} days left
            </div>
          </div>

          {/* Amount & Progress */}
          <div className="dn-raised-section">
            <div className="dn-raised-row">
              <div>
                <span className="dn-raised-amount">₹<AnimatedNumber value={campaign.raised} /></span>
                <span className="dn-raised-label"> collected</span>
              </div>
              <span className="dn-raised-pct">{pct}%</span>
            </div>
            <div className="dn-progress-track">
              <div className="dn-progress-fill" style={{ width: `${pct}%`, background: campaign.org.color }} />
            </div>
            <div className="dn-goal-row">
              <span>of {formatFull(campaign.goal)} target</span>
              <span>{campaign.donors} supporters</span>
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="dn-campaign-title">{campaign.title}</h2>
          <p className="dn-campaign-desc">{campaign.description}</p>

          {/* Organization */}
          <div className="dn-org">
            <div className="dn-org-avatar" style={{ background: campaign.org.color }}>
              {campaign.org.avatar}
            </div>
            <div className="dn-org-info">
              <span className="dn-org-name">{campaign.org.name}</span>
              <span className="dn-org-label">Organizer</span>
            </div>
            <button className="dn-org-follow" onClick={() => showToast(`Following ${campaign.org.name}`)}>Follow</button>
          </div>

          {/* Updates */}
          <div className="dn-updates">
            <h4 className="dn-section-heading"><Clock size={15} /> Campaign Updates</h4>
            {campaign.updates.map((u, i) => (
              <div key={i} className="dn-update-item">
                <span className="dn-update-date">{u.date}</span>
                <span className="dn-update-text">{u.text}</span>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div className="dn-comments-section">
            <h4 className="dn-section-heading"><MessageCircle size={15} /> Comments</h4>
            <div className="dn-comment-input-wrap">
              <input
                className="dn-comment-input"
                placeholder="Leave a message of support..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button className="dn-comment-submit" onClick={handleComment}>Post</button>
            </div>
            {(comments[campaign.id] || []).slice().reverse().map((c, i) => (
              <div key={i} className="dn-comment-item">
                <strong>{c.name}</strong>
                <span>{c.text}</span>
                <span className="dn-comment-time">{c.time}</span>
              </div>
            ))}
            {!(comments[campaign.id]?.length) && (
              <p className="dn-comment-empty">Be the first to leave a comment!</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dn-right">
          {/* Action Buttons */}
          <div className="dn-actions">
            <button className="dn-donate-btn" onClick={() => setDonateOpen(true)}>
              <Heart size={18} /> Donate Now
            </button>
            <button className="dn-share-btn" onClick={() => setShareOpen(!shareOpen)}>
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Share dropdown */}
          {shareOpen && (
            <div className="dn-share-dropdown">
              <button onClick={() => handleShare('copy')}><Copy size={14}/> Copy Link</button>
              <button onClick={() => handleShare('whatsapp')}>📱 WhatsApp</button>
              <button onClick={() => handleShare('twitter')}>🐦 Twitter</button>
              <button onClick={() => handleShare('linkedin')}>💼 LinkedIn</button>
            </div>
          )}

          {/* Donated badge */}
          {donated[campaign.id] && (
            <div className="dn-donated-badge">
              <Check size={16} />
              <div>
                <span className="dn-donated-title">You Donated!</span>
                <span className="dn-donated-amount">{formatFull(donated[campaign.id])}</span>
              </div>
            </div>
          )}

          {/* Recent Donors */}
          <div className="dn-donors-card">
            <h4 className="dn-card-title"><Users size={15} /> Recent Donors</h4>
            {(showAllDonors ? campaign.recentDonors : campaign.recentDonors.slice(0, 3)).map((d, i) => (
              <div key={i} className="dn-donor-row">
                <div className="dn-donor-avatar" style={{ background: campaign.org.color + '20', color: campaign.org.color }}>
                  {d.avatar}
                </div>
                <div className="dn-donor-info">
                  <span className="dn-donor-name">{d.name}</span>
                  <span className="dn-donor-time">{d.time}</span>
                </div>
                <span className="dn-donor-amount">{formatFull(d.amount)}</span>
              </div>
            ))}
            {campaign.recentDonors.length > 3 && (
              <button className="dn-show-more" onClick={() => setShowAllDonors(!showAllDonors)}>
                {showAllDonors ? 'Show less' : `Show all ${campaign.recentDonors.length} donors`}
                <ChevronDown size={14} style={{ transform: showAllDonors ? 'rotate(180deg)' : '', transition: '0.2s' }} />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="dn-stats-grid">
            <div className="dn-stat-card">
              <BarChart3 size={18} className="dn-stat-icon" />
              <span className="dn-stat-num">{campaign.donors.toLocaleString()}</span>
              <span className="dn-stat-label">Total Donors</span>
            </div>
            <div className="dn-stat-card">
              <Target size={18} className="dn-stat-icon" />
              <span className="dn-stat-num">{pct}%</span>
              <span className="dn-stat-label">of Target</span>
            </div>
            <div className="dn-stat-card">
              <TrendingUp size={18} className="dn-stat-icon" />
              <span className="dn-stat-num">{formatCurrency(Math.round(campaign.raised / campaign.donors))}</span>
              <span className="dn-stat-label">Avg Donation</span>
            </div>
            <div className="dn-stat-card">
              <Calendar size={18} className="dn-stat-icon" />
              <span className="dn-stat-num">{campaign.daysLeft}</span>
              <span className="dn-stat-label">Days Left</span>
            </div>
          </div>

          {/* Quote */}
          <div className="dn-quote-card">
            <Sparkles size={16} />
            <p>{campaign.quote}</p>
          </div>
        </div>
      </div>

      {/* ── Donate Modal ── */}
      {donateOpen && (
        <div className="dn-modal-backdrop" onClick={() => { setDonateOpen(false); setAmount(''); setCustomAmount('') }}>
          <div className="dn-modal" onClick={e => e.stopPropagation()}>
            <div className="dn-modal-header">
              <h3><Heart size={18} style={{ color: campaign.org.color }} /> Donate to Campaign</h3>
              <button className="dn-modal-close" onClick={() => { setDonateOpen(false); setAmount(''); setCustomAmount('') }}>
                <X size={16} />
              </button>
            </div>
            <div className="dn-modal-body">
              <p className="dn-modal-campaign">{campaign.title}</p>
              <span className="dn-modal-label">Select Amount</span>
              <div className="dn-amount-grid">
                {['500', '1000', '2500', '5000', '10000', '25000'].map(v => (
                  <button
                    key={v}
                    className={`dn-amount-chip ${amount === v ? 'active' : ''}`}
                    style={amount === v ? { background: campaign.org.color, borderColor: campaign.org.color } : {}}
                    onClick={() => { setAmount(v); setCustomAmount('') }}
                  >
                    ₹{Number(v).toLocaleString()}
                  </button>
                ))}
              </div>
              <span className="dn-modal-label">Or Enter Custom Amount</span>
              <div className="dn-custom-amount-wrap">
                <span className="dn-rupee">₹</span>
                <input
                  className="dn-custom-input"
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setAmount('') }}
                />
              </div>
              <button
                className="dn-confirm-donate"
                style={{ background: campaign.org.color }}
                onClick={handleDonate}
                disabled={!amount && !customAmount}
              >
                <Heart size={16} />
                Donate {amount || customAmount ? `₹${Number(amount || customAmount).toLocaleString()}` : '...'}
              </button>
              <p className="dn-modal-secure">🔒 Secure payment · 100% goes to the cause</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="dn-toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  )
}
