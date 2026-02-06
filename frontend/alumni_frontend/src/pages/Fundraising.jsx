import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { TrendingUp, Gavel, Clock, DollarSign } from 'lucide-react'

const mockFundraisers = [
  {
    id: 1,
    title: 'Rare Alumni Artwork: Campus Sunrise',
    description: 'Original painting by alumni artist Kavya Deshmukh, Class of 2015.',
    currentBid: 12500,
    bids: [
      { bidder: 'Rahul S.', amount: 12500, time: '2 min ago' },
      { bidder: 'Neha G.', amount: 10000, time: '5 min ago' },
      { bidder: 'Amit P.', amount: 8000, time: '12 min ago' },
      { bidder: 'Priya K.', amount: 5000, time: '1 hr ago' },
    ],
    endsIn: 45,
  },
  {
    id: 2,
    title: 'Signed Cricket Bat — College Championship',
    description: 'Autographed bat from the winning team of Inter-College Championship 2024.',
    currentBid: 8000,
    bids: [
      { bidder: 'Vikram M.', amount: 8000, time: '8 min ago' },
      { bidder: 'Suresh R.', amount: 6500, time: '20 min ago' },
      { bidder: 'Anjali T.', amount: 5000, time: '45 min ago' },
    ],
    endsIn: 120,
  },
]

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 600
    const start = display
    const diff = value - start
    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <span>₹{display.toLocaleString('en-IN')}</span>
}

export default function Fundraising({ addToast }) {
  const [fundraisers, setFundraisers] = useState(mockFundraisers)
  const [bidAmounts, setBidAmounts] = useState({})

  const placeBid = (id) => {
    const entered = parseInt(bidAmounts[id])
    const item = fundraisers.find(f => f.id === id)
    if (!entered || entered <= item.currentBid) {
      addToast?.('Bid must be higher than current highest bid.', 'error')
      return
    }
    setFundraisers(prev => prev.map(f => f.id === id ? {
      ...f,
      currentBid: entered,
      bids: [{ bidder: 'You', amount: entered, time: 'Just now' }, ...f.bids],
    } : f))
    setBidAmounts(prev => ({ ...prev, [id]: '' }))
    addToast?.(`Bid of ₹${entered.toLocaleString('en-IN')} placed!`)
  }

  return (
    <>
      <section className="section-label">Fundraising & Bidding</section>
      <p className="text-[11px] text-[var(--text-muted)] mb-4 ml-1">Bid on exclusive alumni items. All proceeds go to student causes.</p>

      <div className="grid grid-cols-1 gap-6 animate-[fadeInUp_0.5s_ease]">
        {fundraisers.map((item, i) => (
          <Card key={item.id} hover={false} className="!p-6" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[16px] font-bold text-[var(--text-primary)] block">{item.title}</span>
                <span className="text-[11px] text-[var(--text-muted)]">{item.description}</span>
              </div>
              <Badge variant="warning">
                <Clock size={10} /> Ends in {item.endsIn} min
              </Badge>
            </div>

            <div className="grid grid-cols-[1fr_1fr] gap-5">
              {/* Left: Current bid + place bid */}
              <div>
                <div className="mb-3">
                  <span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Current Highest Bid</span>
                  <span className="text-2xl font-bold text-[var(--mint-500)]">
                    <AnimatedNumber value={item.currentBid} />
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    value={bidAmounts[item.id] || ''}
                    onChange={e => setBidAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder={`Min ₹${(item.currentBid + 500).toLocaleString('en-IN')}`}
                    className="text-sm px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)] flex-1"
                  />
                  <Button variant="primary" size="md" onClick={() => placeBid(item.id)}>
                    <Gavel size={14} /> Bid
                  </Button>
                </div>
              </div>

              {/* Right: Bid history */}
              <div>
                <span className="text-[10px] font-semibold text-[var(--text-primary)] block mb-2">Bid History</span>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {item.bids.map((bid, bi) => (
                    <div
                      key={bi}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/30 text-[11px]"
                      style={{ animation: bi === 0 ? 'fadeInUp 0.3s ease' : 'none' }}
                    >
                      <span className="font-medium text-[var(--text-primary)]">{bid.bidder}</span>
                      <span className="font-semibold text-[var(--mint-500)]">₹{bid.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[var(--text-muted)] text-[10px]">{bid.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
