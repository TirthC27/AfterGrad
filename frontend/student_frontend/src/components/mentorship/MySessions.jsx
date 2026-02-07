import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { mentorship } from '../../localStore'
import './MySessions.css'

const COLUMN_CONFIG = {
  scheduled:           { title: 'Scheduled',  icon: '📅', accent: '#22c55e' },
  awaiting_completion: { title: 'Awaiting',   icon: '⏳', accent: '#f59e0b' },
  completed:           { title: 'Completed',  icon: '✅', accent: '#4ade80' },
}

export default function MySessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [completingId, setCompletingId] = useState(null)
  const { user } = useAuth()
  const STUDENT_ID = user?.id || 'student_001'

  const fetchSessions = () => {
    setSessions(mentorship.getStudentSessions(STUDENT_ID))
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [])

  const confirmComplete = (sessionId) => {
    setCompletingId(sessionId)
    mentorship.completeSessionStudent(sessionId)
    fetchSessions()
    setCompletingId(null)
  }

  const grouped = Object.keys(COLUMN_CONFIG).reduce((acc, key) => {
    acc[key] = sessions.filter(s => s.status === key)
    return acc
  }, {})

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''
  const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

  if (loading) {
    return (
      <div className="msess-loading">
        <div className="msess-spinner" />
        <p>Loading sessions...</p>
      </div>
    )
  }

  return (
    <div className="msess-page">
      {/* Header */}
      <div className="msess-header">
        <div>
          <h1 className="msess-title">My Sessions</h1>
          <p className="msess-subtitle">Kanban board view — track sessions across stages. Both parties must confirm completion.</p>
        </div>
        <div className="msess-counter">{sessions.length} session{sessions.length !== 1 ? 's' : ''} total</div>
      </div>

      {/* Kanban board */}
      <div className="kanban-board">
        {Object.entries(COLUMN_CONFIG).map(([status, cfg]) => (
          <div key={status} className="kanban-column">
            <div className="kanban-col-header" style={{ '--col-accent': cfg.accent }}>
              <span className="col-icon">{cfg.icon}</span>
              <span className="col-title">{cfg.title}</span>
              <span className="col-count">{grouped[status]?.length || 0}</span>
            </div>

            <div className="kanban-col-body">
              {(grouped[status] || []).map((sess, idx) => (
                <div
                  key={sess.id}
                  className={`kanban-card ${expanded === sess.id ? 'expanded' : ''}`}
                  style={{ animationDelay: `${idx * 80}ms`, '--col-accent': cfg.accent }}
                  onClick={() => setExpanded(expanded === sess.id ? null : sess.id)}
                >
                  {/* Card header */}
                  <div className="kcard-top">
                    <div className="kcard-avatar">{sess.alumni?.avatar}</div>
                    <div className="kcard-info">
                      <span className="kcard-topic">{sess.topic}</span>
                      <span className="kcard-mentor">{sess.alumni?.name}</span>
                    </div>
                    <span className="kcard-chevron">{expanded === sess.id ? '▾' : '▸'}</span>
                  </div>

                  {/* Tags row */}
                  <div className="kcard-tags">
                    <span className="kcard-tag company">{sess.alumni?.company}</span>
                    <span className="kcard-tag dur">⏱ {sess.duration}m</span>
                    {sess.meet_link && (
                      <a
                        href={sess.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kcard-tag meet-tag"
                        onClick={e => e.stopPropagation()}
                      >
                        🎥 Join Meet
                      </a>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {expanded === sess.id && (
                    <div className="kcard-expand" onClick={e => e.stopPropagation()}>
                      {/* Progress stepper */}
                      <div className="kcard-stepper">
                        <div className={`stepper-node ${true ? 'done' : ''}`}>
                          <div className="snode-dot">1</div>
                          <span>Session Created</span>
                        </div>
                        <div className="stepper-line" />
                        <div className={`stepper-node ${sess.alumni_completed ? 'done' : ''}`}>
                          <div className="snode-dot">2</div>
                          <span>Alumni Confirmed</span>
                        </div>
                        <div className="stepper-line" />
                        <div className={`stepper-node ${sess.student_completed ? 'done' : ''}`}>
                          <div className="snode-dot">3</div>
                          <span>You Confirmed</span>
                        </div>
                        <div className="stepper-line" />
                        <div className={`stepper-node ${sess.status === 'completed' ? 'done' : ''}`}>
                          <div className="snode-dot">✓</div>
                          <span>Completed</span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="kcard-dates">
                        {sess.scheduled_at && (
                          <div className="kcard-date-row">
                            <span className="date-label">Scheduled</span>
                            <span className="date-val">{fmtDate(sess.scheduled_at)} · {fmtTime(sess.scheduled_at)}</span>
                          </div>
                        )}
                        {sess.completed_at && (
                          <div className="kcard-date-row">
                            <span className="date-label">Completed</span>
                            <span className="date-val completed">{fmtDate(sess.completed_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="kcard-actions">
                        {sess.meet_link && (sess.status === 'scheduled' || sess.status === 'awaiting_completion') && (
                          <a
                            href={sess.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="kcard-meet-btn"
                          >
                            🎥 Join Google Meet
                          </a>
                        )}
                        {sess.status === 'awaiting_completion' && !sess.student_completed && sess.alumni_completed && (
                          <button
                            className="kcard-confirm-btn"
                            disabled={completingId === sess.id}
                            onClick={() => confirmComplete(sess.id)}
                          >
                            {completingId === sess.id ? 'Confirming...' : '✓ Confirm Completion'}
                          </button>
                        )}
                        {sess.status === 'scheduled' && (
                          <span className="kcard-hint">📍 Session date approaching — be ready!</span>
                        )}
                        {sess.status === 'awaiting_completion' && !sess.alumni_completed && (
                          <span className="kcard-hint">⏳ Waiting for alumni to mark complete first</span>
                        )}
                        {sess.status === 'completed' && (
                          <span className="kcard-hint mint">🛡️ Escrow release ready (coming soon)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(grouped[status] || []).length === 0 && (
                <div className="kanban-empty">
                  <span className="empty-icon">{cfg.icon}</span>
                  <span>No sessions</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
