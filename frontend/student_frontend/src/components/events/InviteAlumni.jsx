import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { auth, invitations as invStore } from '../../localStore'
import './InviteAlumni.css'

export default function InviteAlumni({ eventId, onClose }) {
  const { user } = useAuth()
  const STUDENT_ID = user?.id || 'student_001'
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(null)
  const [sentInvites, setSentInvites] = useState({})
  const [selectedRole, setSelectedRole] = useState({})
  const [messages, setMessages] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const alumniOnly = auth.searchProfiles('alumni')
    setAlumni(alumniOnly)
    const invList = invStore.getForEvent(eventId)
    const existing = {}
    invList.forEach(inv => { existing[inv.alumni_id] = inv.status })
    setSentInvites(existing)
    setLoading(false)
  }, [eventId])

  const sendInvite = (alumniId) => {
    const role = selectedRole[alumniId] || 'mentor'
    const message = messages[alumniId] || ''
    setSending(alumniId)
    try {
      invStore.create({ event_id: eventId, student_id: STUDENT_ID, alumni_id: alumniId, role, message })
      setSentInvites(prev => ({ ...prev, [alumniId]: 'pending' }))
    } catch (e) { alert(e.message) }
    setSending(null)
  }

  const filteredAlumni = alumni.filter(a => {
    const term = searchTerm.toLowerCase()
    return (
      (a.name || '').toLowerCase().includes(term) ||
      (a.company || '').toLowerCase().includes(term) ||
      (a.skills || []).some(s => s.toLowerCase().includes(term))
    )
  })

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={e => e.stopPropagation()}>
        <div className="invite-header">
          <div>
            <h2>Invite Alumni</h2>
            <p>Invite alumni as mentors, judges, or speakers for your event</p>
          </div>
          <button className="invite-close" onClick={onClose}>&times;</button>
        </div>

        <div className="invite-search">
          <input
            type="text"
            placeholder="Search by name, company, or skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="invite-loading">
            <div className="invite-spinner" />
            <p>Loading alumni...</p>
          </div>
        ) : (
          <div className="invite-list">
            {filteredAlumni.length === 0 && (
              <div className="invite-empty">No alumni found matching your search.</div>
            )}
            {filteredAlumni.map(a => {
              const status = sentInvites[a.id]
              return (
                <div key={a.id} className={`invite-card ${status ? 'invited' : ''}`}>
                  <div className="invite-card-left">
                    <div className="invite-avatar">{(a.name || '??').slice(0, 2).toUpperCase()}</div>
                    <div className="invite-info">
                      <h4>{a.name}</h4>
                      <p>{a.job_title || ''} {a.company ? `at ${a.company}` : ''}</p>
                      {a.skills?.length > 0 && (
                        <div className="invite-skills">
                          {a.skills.slice(0, 4).map(s => (
                            <span key={s} className="invite-skill-tag">{s}</span>
                          ))}
                          {a.skills.length > 4 && <span className="invite-skill-more">+{a.skills.length - 4}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="invite-card-right">
                    {status ? (
                      <div className={`invite-status invite-status-${status}`}>
                        {status === 'pending' && '⏳ Invited'}
                        {status === 'accepted' && '✅ Accepted'}
                        {status === 'declined' && '❌ Declined'}
                      </div>
                    ) : (
                      <div className="invite-actions">
                        <select
                          value={selectedRole[a.id] || 'mentor'}
                          onChange={e => setSelectedRole(prev => ({ ...prev, [a.id]: e.target.value }))}
                          className="invite-role-select"
                        >
                          <option value="mentor">Mentor</option>
                          <option value="judge">Judge</option>
                          <option value="speaker">Speaker</option>
                          <option value="guest">Guest</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Add a message..."
                          value={messages[a.id] || ''}
                          onChange={e => setMessages(prev => ({ ...prev, [a.id]: e.target.value }))}
                          className="invite-message-input"
                        />
                        <button
                          className="invite-send-btn"
                          onClick={() => sendInvite(a.id)}
                          disabled={sending === a.id}
                        >
                          {sending === a.id ? '...' : 'Invite'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
