import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { Clock, DollarSign, User, Plus, Video, MapPin, ExternalLink, RefreshCw, Loader } from 'lucide-react'
import PhysicalMentorship from './PhysicalMentorship'

const API_BASE = 'http://localhost:8001'
const ALUMNI_ID = 'alumni_001' // Current logged-in alumni

export default function Mentorship({ addToast }) {
  const [mode, setMode] = useState('virtual')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', duration: 30, price: 0, tags: '' })

  // Backend data
  const [offerings, setOfferings] = useState([])
  const [requests, setRequests] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState(null)

  // Fetch all alumni data
  const fetchData = async () => {
    try {
      const [offRes, reqRes, sessRes] = await Promise.all([
        fetch(`${API_BASE}/api/mentorship/offerings/mine?alumni_id=${ALUMNI_ID}`),
        fetch(`${API_BASE}/api/mentorship/requests/alumni?alumni_id=${ALUMNI_ID}`),
        fetch(`${API_BASE}/api/mentorship/sessions/alumni?alumni_id=${ALUMNI_ID}`),
      ])
      const [offData, reqData, sessData] = await Promise.all([offRes.json(), reqRes.json(), sessRes.json()])
      setOfferings(offData)
      setRequests(reqData)
      setSessions(sessData)
    } catch (e) {
      console.error('Failed to fetch mentorship data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Count pending requests per offering
  const pendingCountFor = (offeringId) =>
    requests.filter(r => r.offering_id === offeringId && r.status === 'pending').length

  // Get session meet link for an offering (if accepted)
  const getMeetLink = (offeringId) => {
    const sess = sessions.find(s => s.offering_id === offeringId && s.meet_link)
    return sess?.meet_link || null
  }

  // Has any accepted request for this offering?
  const hasAccepted = (offeringId) =>
    requests.some(r => r.offering_id === offeringId && r.status === 'accepted')

  // Get the first pending request for an offering
  const getFirstPendingRequest = (offeringId) =>
    requests.find(r => r.offering_id === offeringId && r.status === 'pending')

  // Create offering via API
  const createAd = async () => {
    if (!form.title.trim()) return
    try {
      const res = await fetch(`${API_BASE}/api/mentorship/offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumni_id: ALUMNI_ID,
          topic: form.title,
          description: form.title,
          duration: form.duration,
          price: form.price,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      })
      if (res.ok) {
        setForm({ title: '', duration: 30, price: 0, tags: '' })
        setShowForm(false)
        addToast?.('Mentorship offering created!')
        fetchData()
      } else {
        const errData = await res.json().catch(() => ({}))
        console.error('Create failed:', res.status, errData)
        addToast?.(errData.detail || 'Failed to create offering', 'error')
      }
    } catch (e) {
      console.error(e)
      addToast?.('Failed to create offering')
    }
  }

  // Accept a pending request → backend creates session with meet link
  const acceptRequest = async (offeringId) => {
    const req = getFirstPendingRequest(offeringId)
    if (!req) return
    setAcceptingId(offeringId)
    try {
      const res = await fetch(`${API_BASE}/api/mentorship/requests/${req.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: ALUMNI_ID }),
      })
      if (res.ok) {
        const data = await res.json()
        const meetLink = data.session?.meet_link
        addToast?.(`Request accepted! Meet link: ${meetLink ? 'generated' : 'pending'}`)
        fetchData()
      }
    } catch (e) {
      console.error(e)
      addToast?.('Failed to accept request')
    } finally {
      setAcceptingId(null)
    }
  }

  const durationLabel = (min) => min === 60 ? '1 hour' : `${min} min`

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
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={fetchData} title="Refresh">
                <RefreshCw size={14} />
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
                <Plus size={14} /> New Ad
              </Button>
            </div>
          </div>

          {showForm && (
            <Card hover={false} className="mt-form-card">
              <div className="mt-form-inner">
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Session title (e.g. Resume Review for SDE roles)"
                  className="mt-form-input"
                />
                <div className="mt-form-row">
                  <select
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
                    className="mt-form-select"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                  </select>
                  <input
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: +e.target.value || 0 }))}
                    placeholder="Price (0 = Free)"
                    className="mt-form-input"
                    type="number"
                    min="0"
                  />
                </div>
                <input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Tags (comma separated, e.g. Engineering, Career)"
                  className="mt-form-input"
                />
                <div className="mt-form-actions">
                  <Button variant="primary" size="sm" onClick={createAd}>Create</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Loader size={20} className="spin" /> <span style={{ marginLeft: 8 }}>Loading your offerings...</span>
            </div>
          ) : offerings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <User size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <p>You haven't created any offerings yet.</p>
              <p style={{ fontSize: 13 }}>Click "New Ad" to create your first mentorship session.</p>
            </div>
          ) : (
            <div className="mt-ads-list">
              {offerings.map((offer, i) => {
                const pending = pendingCountFor(offer.id)
                const accepted = hasAccepted(offer.id)
                const meetLink = getMeetLink(offer.id)
                const totalRequests = requests.filter(r => r.offering_id === offer.id).length

                return (
                  <Card key={offer.id} className="mt-ad-card" style={{ animationDelay: `${i * 60}ms` }}>
                    {/* Icon */}
                    <div className="mt-ad-icon">
                      <User size={24} className="text-[var(--mint-500)]" />
                    </div>

                    {/* Info */}
                    <div className="mt-ad-info">
                      <span className="mt-ad-title">{offer.topic}</span>
                      <div className="mt-ad-meta">
                        <span><Clock size={12} /> {durationLabel(offer.duration)}</span>
                        <span><DollarSign size={12} /> {offer.price === 0 ? 'Free' : `₹${offer.price}`}</span>
                        <span><User size={12} /> {totalRequests} request{totalRequests !== 1 ? 's' : ''}</span>
                        {pending > 0 && (
                          <span className="mt-pending-badge">{pending} pending</span>
                        )}
                      </div>
                      {offer.tags?.length > 0 && (
                        <div className="mt-ad-tags">
                          {offer.tags.map(t => <span key={t} className="mt-ad-tag">{t}</span>)}
                        </div>
                      )}
                    </div>

                    {/* Status / Action */}
                    <div className="mt-ad-actions">
                      {accepted && meetLink ? (
                        <>
                          <Badge variant="success" glow>Accepted</Badge>
                          <a
                            href={meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-meet-link"
                            onClick={e => e.stopPropagation()}
                          >
                            <Video size={14} />
                            Join Meet
                            <ExternalLink size={11} />
                          </a>
                        </>
                      ) : pending > 0 ? (
                        <>
                          <Badge variant="default">{pending} Pending</Badge>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); acceptRequest(offer.id) }}
                            disabled={acceptingId === offer.id}
                          >
                            {acceptingId === offer.id ? 'Accepting...' : 'Accept'}
                          </Button>
                        </>
                      ) : (
                        <Badge variant="default">
                          {offer.active ? 'Open' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
