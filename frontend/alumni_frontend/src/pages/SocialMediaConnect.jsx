import React, { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Skeleton from '../components/Skeleton'
import { Linkedin, Twitter, Edit3, Check } from 'lucide-react'

const mockSkills = ['Product Management', 'React', 'SQL', 'Leadership', 'System Design', 'Python']

export default function SocialMediaConnect({ addToast }) {
  const [linkedinState, setLinkedinState] = useState('idle') // idle | loading | done
  const [xState, setXState] = useState('idle')
  const [skills, setSkills] = useState([])
  const [editingSkills, setEditingSkills] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const connectLinkedin = () => {
    setLinkedinState('loading')
    setTimeout(() => {
      setLinkedinState('done')
      setSkills(mockSkills.slice(0, 4))
      addToast?.('LinkedIn profile connected successfully!')
    }, 1800)
  }

  const connectX = () => {
    setXState('loading')
    setTimeout(() => {
      setXState('done')
      setSkills(prev => [...new Set([...prev, ...mockSkills.slice(3)])])
      addToast?.('X profile connected successfully!')
    }, 1500)
  }

  const removeSkill = (s) => setSkills(prev => prev.filter(sk => sk !== s))
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleConfirm = () => {
    setConfirmed(true)
    addToast?.('Profile confirmed! You\'re all set.')
  }

  return (
    <Card hover={false} className="!p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">Connect Your Professional Profile</span>
      </div>
      <p className="text-[11px] text-[var(--text-muted)] mb-5">Link your social accounts to auto-populate skills and department info.</p>

      {/* Connect buttons */}
      <div className="flex gap-3 mb-5">
        {linkedinState === 'idle' && (
          <Button variant="primary" onClick={connectLinkedin}>
            <Linkedin size={16} /> Connect LinkedIn
          </Button>
        )}
        {linkedinState === 'loading' && (
          <div className="flex items-center gap-3">
            <Skeleton variant="chip" className="!w-36" />
            <Skeleton variant="chip" className="!w-20" />
          </div>
        )}
        {linkedinState === 'done' && (
          <Badge variant="success"><Check size={12} /> LinkedIn Connected</Badge>
        )}

        {xState === 'idle' && (
          <Button variant="secondary" onClick={connectX}>
            <Twitter size={16} /> Connect X
          </Button>
        )}
        {xState === 'loading' && (
          <Skeleton variant="chip" className="!w-28" />
        )}
        {xState === 'done' && (
          <Badge variant="success"><Check size={12} /> X Connected</Badge>
        )}
      </div>

      {/* Skills area */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Skills</span>
            <button
              onClick={() => setEditingSkills(!editingSkills)}
              className="text-[var(--text-muted)] hover:text-[var(--mint-500)] transition-colors bg-transparent border-none cursor-pointer"
            >
              <Edit3 size={13} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[rgba(134,239,172,0.15)] text-[var(--text-secondary)] transition-all duration-200 hover:bg-[rgba(134,239,172,0.25)]"
              >
                {s}
                {editingSkills && (
                  <button
                    onClick={() => removeSkill(s)}
                    className="ml-0.5 text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-xs leading-none"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
            {editingSkills && (
              <div className="flex items-center gap-1">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add skill..."
                  className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--glass-border)] bg-white/50 outline-none w-24 font-[inherit]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Department & Grad info */}
      {(linkedinState === 'done' || xState === 'done') && (
        <div className="flex gap-6 mb-4 text-xs">
          <div>
            <span className="text-[var(--text-muted)]">Department: </span>
            <span className="font-semibold text-[var(--text-primary)]">Computer Science</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Graduation Year: </span>
            <span className="font-semibold text-[var(--text-primary)]">2020</span>
          </div>
        </div>
      )}

      {/* Confirm */}
      {skills.length > 0 && !confirmed && (
        <Button variant="primary" size="lg" onClick={handleConfirm}>
          <Check size={16} /> Confirm Profile
        </Button>
      )}
      {confirmed && (
        <Badge variant="success" glow>
          <Check size={12} /> Profile Confirmed
        </Badge>
      )}
    </Card>
  )
}
