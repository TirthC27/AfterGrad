import React, { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { Heart, TrendingUp } from 'lucide-react'

const mockCauses = [
  { id: 1, title: 'Scholarship Fund for First-Gen Students', raised: 240000, goal: 500000, donors: 156 },
  { id: 2, title: 'New Computer Lab Equipment', raised: 380000, goal: 600000, donors: 89 },
  { id: 3, title: 'Campus Mental Health Initiative', raised: 120000, goal: 200000, donors: 210 },
  { id: 4, title: 'Library Digital Archive Renovation', raised: 95000, goal: 300000, donors: 47 },
]

function formatCurrency(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

export default function Donations({ addToast }) {
  const [donateModal, setDonateModal] = useState(null)
  const [amount, setAmount] = useState('')
  const [donated, setDonated] = useState({})

  const handleDonate = () => {
    if (!amount) return
    setDonated(prev => ({ ...prev, [donateModal.id]: true }))
    addToast?.(`Donated ₹${amount} to "${donateModal.title}"!`)
    setDonateModal(null)
    setAmount('')
  }

  return (
    <>
      <section className="section-label">Support a Cause</section>
      <p className="text-[11px] text-[var(--text-muted)] mb-4 ml-1">Your donations help shape the future of the next generation.</p>

      <div className="grid grid-cols-2 gap-4 animate-[fadeInUp_0.5s_ease]">
        {mockCauses.map((cause, i) => {
          const pct = Math.round((cause.raised / cause.goal) * 100)
          return (
            <Card key={cause.id} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(134,239,172,0.12)] flex items-center justify-center shrink-0">
                  <Heart size={20} className="text-[var(--mint-500)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] block leading-tight">{cause.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{cause.donors} donors</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="font-semibold text-[var(--mint-500)]">{formatCurrency(cause.raised)}</span>
                  <span className="text-[var(--text-muted)]">of {formatCurrency(cause.goal)}</span>
                </div>
                <div className="h-1.5 bg-[rgba(134,239,172,0.12)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--mint-400)] to-[var(--mint-300)] rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[9px] text-[var(--text-muted)] mt-0.5 block">{pct}% funded</span>
              </div>

              {donated[cause.id] ? (
                <span className="text-[11px] font-medium text-[var(--mint-500)]">✓ Thank you for donating!</span>
              ) : (
                <Button variant="primary" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); setDonateModal(cause) }}>
                  Donate
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {/* Donate Modal */}
      <Modal open={!!donateModal} onClose={() => { setDonateModal(null); setAmount('') }} title="Make a Donation">
        {donateModal && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)]">{donateModal.title}</p>
            <div className="flex gap-2">
              {['500', '1000', '2500', '5000'].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer
                    ${amount === v
                      ? 'bg-[var(--mint-400)] text-white border-[var(--mint-400)]'
                      : 'bg-white/50 text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--mint-300)]'
                    }
                  `}
                >
                  ₹{v}
                </button>
              ))}
            </div>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Or enter custom amount"
              className="text-sm px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)]"
            />
            <Button variant="primary" size="lg" className="w-full" onClick={handleDonate}>
              Donate ₹{amount || '...'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  )
}
