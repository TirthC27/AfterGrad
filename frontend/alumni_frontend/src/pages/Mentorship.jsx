import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJsApiLoader } from '@react-google-maps/api'
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
  const [mode, setMode] = useState('virtual') // 'virtual' | 'physical'
  const [ads, setAds] = useState(mockAds)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', duration: '15 min', price: 'Free' })

  // Load Google Maps once at parent level so it survives mode toggling
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

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
    <>
      <section className="section-label">Mentorship</section>

      {/* ─── Mode Toggle ─── */}
      <div className="flex items-center gap-1 p-1 mb-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-[var(--glass-border)] w-fit">
        <button
          onClick={() => setMode('virtual')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            border-none cursor-pointer font-[inherit] transition-all duration-300
            ${mode === 'virtual'
              ? 'bg-[var(--mint-400)] text-white shadow-[0_4px_16px_rgba(74,222,128,0.3)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/40'
            }
          `}
        >
          <Video size={16} />
          Virtual
        </button>
        <button
          onClick={() => setMode('physical')}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            border-none cursor-pointer font-[inherit] transition-all duration-300
            ${mode === 'physical'
              ? 'bg-[var(--mint-400)] text-white shadow-[0_4px_16px_rgba(74,222,128,0.3)]'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/40'
            }
          `}
        >
          <MapPin size={16} />
          Nearby (Physical)
        </button>
      </div>

      {/* ─── Physical Mode ─── */}
      <AnimatePresence mode="wait">
        {mode === 'physical' && (
          <motion.div
            key="physical"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <PhysicalMentorship addToast={addToast} isLoaded={isLoaded} loadError={loadError} />
          </motion.div>
        )}

        {/* ─── Virtual Mode ─── */}
        {mode === 'virtual' && (
          <motion.div
            key="virtual"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
      <section className="section-label">Offer Virtual Mentorship</section>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-[var(--text-muted)]">Create mentorship sessions for students to book.</p>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> New Ad
        </Button>
      </div>

      {showForm && (
        <Card hover={false} className="mb-4 animate-[scaleIn_0.2s_ease]">
          <div className="flex flex-col gap-3">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Session title (e.g. 15-min Career Advice)"
              className="text-sm px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)]"
            />
            <div className="flex gap-3">
              <select
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="text-sm px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)] flex-1"
              >
                <option>15 min</option>
                <option>30 min</option>
                <option>60 min</option>
              </select>
              <input
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Price or Free"
                className="text-sm px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)] flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={createAd}>Create</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 animate-[fadeInUp_0.5s_ease]">
        {ads.map((ad, i) => (
          <Card key={ad.id} className="flex items-center gap-4" style={{ animationDelay: `${i * 60}ms` }}>
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[rgba(134,239,172,0.12)] flex items-center justify-center shrink-0">
              <User size={24} className="text-[var(--mint-500)]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-semibold text-[var(--text-primary)] block truncate">{ad.title}</span>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Clock size={12} /> {ad.duration}</span>
                <span className="flex items-center gap-1"><DollarSign size={12} /> {ad.price}</span>
                <span className="flex items-center gap-1"><User size={12} /> {ad.requests} requests</span>
              </div>
            </div>

            {/* Status / Action */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
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
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                    <span>Session in</span>
                    <CountdownTimer targetMinutes={45} />
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
