import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { Clock, DollarSign, Shield, User, Plus, Video, MapPin } from 'lucide-react'
import PhysicalMentorship from './PhysicalMentorship'

const mockAds = [
  { id: 1, title: '15-min Career Advice', duration: '15 min', price: 'Free', status: 'open', requests: 3 },
  { id: 2, title: '30-min Resume Review', duration: '30 min', price: '₹500', status: 'accepted', requests: 1 },
  { id: 3, title: '1-hr Mock Interview', duration: '60 min', price: '₹1,500', status: 'open', requests: 7 },
]

function CountdownTimer({ targetMinutes }) {
  const [secs, setSecs] = useState(targetMinutes * 60)
  useEffect(() => {
    const interval = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(interval)
  }, [])
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return (
    <span className="font-mono text-lg font-bold text-[var(--mint-500)]">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

export default function Mentorship({ addToast }) {
  const [mode, setMode] = useState('virtual')
  const [ads, setAds] = useState(mockAds)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', duration: '15 min', price: 'Free' })

  const createAd = () => {
    if (!form.title.trim()) return
    setAds(prev => [...prev, {
      id: Date.now(),
      title: form.title,
      duration: form.duration,
      price: form.price,
      status: 'open',
      requests: 0,
    }])
    setForm({ title: '', duration: '15 min', price: 'Free' })
    setShowForm(false)
    addToast?.('Mentorship ad created!')
  }

  const acceptRequest = (id) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: 'accepted' } : a))
    addToast?.('Request accepted! Escrow activated.')
  }

  return (
    <div className="mt-page">
      <section className="section-label">Mentorship</section>

      {/* ─── Mode Toggle ─── */}
      <div className="mt-mode-toggle">
        <button
          onClick={() => setMode('virtual')}
          className={`mt-mode-btn ${mode === 'virtual' ? 'active' : ''}`}
        >
          <Video size={16} />
          Virtual
        </button>
        <button
          onClick={() => setMode('physical')}
          className={`mt-mode-btn ${mode === 'physical' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          Nearby (Physical)
        </button>
      </div>

      {/* ─── Physical Mode ─── */}
      {mode === 'physical' && (
        <div className="mt-panel-animate">
          <PhysicalMentorship addToast={addToast} />
        </div>
      )}

      {/* ─── Virtual Mode ─── */}
      {mode === 'virtual' && (
        <div className="mt-panel-animate">
          <section className="section-label">Offer Virtual Mentorship</section>
          <div className="mt-virtual-header">
            <p className="mt-virtual-subtitle">Create mentorship sessions for students to book.</p>
            <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={14} /> New Ad
            </Button>
          </div>

          {showForm && (
            <Card hover={false} className="mt-form-card">
              <div className="mt-form-inner">
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Session title (e.g. 15-min Career Advice)"
                  className="mt-form-input"
                />
                <div className="mt-form-row">
                  <select
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="mt-form-select"
                  >
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>60 min</option>
                  </select>
                  <input
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Price or Free"
                    className="mt-form-input"
                  />
                </div>
                <div className="mt-form-actions">
                  <Button variant="primary" size="sm" onClick={createAd}>Create</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-ads-list">
            {ads.map((ad, i) => (
              <Card key={ad.id} className="mt-ad-card" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Icon */}
                <div className="mt-ad-icon">
                  <User size={24} className="text-[var(--mint-500)]" />
                </div>

                {/* Info */}
                <div className="mt-ad-info">
                  <span className="mt-ad-title">{ad.title}</span>
                  <div className="mt-ad-meta">
                    <span><Clock size={12} /> {ad.duration}</span>
                    <span><DollarSign size={12} /> {ad.price}</span>
                    <span><User size={12} /> {ad.requests} requests</span>
                  </div>
                </div>

                {/* Status / Action */}
                <div className="mt-ad-actions">
                  {ad.status === 'open' && (
                    <>
                      <Badge variant="default">Open</Badge>
                      {ad.requests > 0 && (
                        <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); acceptRequest(ad.id) }}>
                          Accept
                        </Button>
                      )}
                    </>
                  )}
                  {ad.status === 'accepted' && (
                    <>
                      <Badge variant="success" glow>
                        <Shield size={10} /> Escrow Active
                      </Badge>
                      <div className="mt-ad-timer">
                        <span>Session in</span>
                        <CountdownTimer targetMinutes={45} />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
