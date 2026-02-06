import React, { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { Briefcase, Clock, DollarSign, Tag, Plus } from 'lucide-react'

const mockGigs = [
  { id: 1, title: 'Build Alumni Portal Landing Page', skill: 'React', budget: '₹15,000', deadline: 'Mar 1, 2026', status: 'open', applicants: 5 },
  { id: 2, title: 'Database Schema Design', skill: 'PostgreSQL', budget: '₹8,000', deadline: 'Feb 28, 2026', status: 'in-progress', applicants: 3 },
  { id: 3, title: 'Mobile App Wireframes', skill: 'Figma', budget: '₹10,000', deadline: 'Mar 10, 2026', status: 'completed', applicants: 8 },
  { id: 4, title: 'SEO Audit & Report', skill: 'SEO', budget: '₹5,000', deadline: 'Mar 5, 2026', status: 'open', applicants: 2 },
]

const statusColors = {
  'open': 'default',
  'in-progress': 'warning',
  'completed': 'success',
}

const statusLabels = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'completed': 'Completed',
}

export default function Gigs({ addToast }) {
  const [tab, setTab] = useState('browse') // 'browse' | 'post'
  const [gigs, setGigs] = useState(mockGigs)
  const [form, setForm] = useState({ title: '', skill: '', budget: '', deadline: '' })

  const postGig = () => {
    if (!form.title.trim() || !form.skill.trim()) return
    setGigs(prev => [
      {
        id: Date.now(),
        title: form.title,
        skill: form.skill,
        budget: form.budget || 'TBD',
        deadline: form.deadline || 'Flexible',
        status: 'open',
        applicants: 0,
      },
      ...prev,
    ])
    setForm({ title: '', skill: '', budget: '', deadline: '' })
    setTab('browse')
    addToast?.('Gig posted successfully!')
  }

  return (
    <>
      <section className="section-label">Micro Gigs</section>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <Button
          variant={tab === 'browse' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('browse')}
        >
          <Briefcase size={14} /> Browse Gigs
        </Button>
        <Button
          variant={tab === 'post' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('post')}
        >
          <Plus size={14} /> Post a Gig
        </Button>
      </div>

      {tab === 'post' && (
        <Card hover={false} className="mb-5 animate-[scaleIn_0.2s_ease]">
          <span className="text-sm font-semibold text-[var(--text-primary)] block mb-3">Post a New Gig</span>
          <div className="flex flex-col gap-3">
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Gig title"
              className="text-sm px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)]"
            />
            <div className="flex gap-3">
              <input
                value={form.skill}
                onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}
                placeholder="Skill required"
                className="text-sm px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)] flex-1"
              />
              <input
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                placeholder="Budget (e.g. ₹10,000)"
                className="text-sm px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)] flex-1"
              />
              <input
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                placeholder="Deadline"
                className="text-sm px-4 py-2 rounded-xl border border-[var(--glass-border)] bg-white/50 outline-none font-[inherit] text-[var(--text-primary)] flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={postGig}>Post Gig</Button>
              <Button variant="ghost" size="sm" onClick={() => setTab('browse')}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'browse' && (
        <div className="grid grid-cols-2 gap-4 animate-[fadeInUp_0.5s_ease]">
          {gigs.map((gig, i) => (
            <Card key={gig.id} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight">{gig.title}</span>
                <Badge variant={statusColors[gig.status]}>
                  {statusLabels[gig.status]}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-[var(--text-muted)] mb-3">
                <span className="flex items-center gap-1"><Tag size={12} /> {gig.skill}</span>
                <span className="flex items-center gap-1"><DollarSign size={12} /> {gig.budget}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {gig.deadline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)]">{gig.applicants} applicant{gig.applicants !== 1 ? 's' : ''}</span>
                {gig.status === 'open' && (
                  <Button variant="secondary" size="sm">View Applicants</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
