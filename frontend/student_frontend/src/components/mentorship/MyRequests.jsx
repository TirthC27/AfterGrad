import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyRequests.css'

const API_BASE = 'http://localhost:8001'

/* Circular progress ring */
function RingStat({ value, max, label, color, trend }) {
  const radius = 32
  const stroke = 5
  const circ = 2 * Math.PI * radius
  const pct = max > 0 ? value / max : 0
  const offset = circ * (1 - pct)

  return (
    <div className="ring-stat-card">
      <div className="ring-stat-left">
        <span className="ring-label-sm">Total</span>
        <span className="ring-title">{label}</span>
        {trend && (
          <span className={`ring-trend ${trend.dir}`}>
            {trend.dir === 'up' ? '↑' : '↓'} {trend.pct}% vs last month
          </span>
        )}
      </div>
      <svg className="ring-svg" width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx="38" cy="38" r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="38" y="42" textAnchor="middle" fill={color} fontSize="18" fontWeight="800">{value}</text>
      </svg>
    </div>
  )
}

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortCol, setSortCol] = useState('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const navigate = useNavigate()

  const fetchRequests = () => {
    fetch(`${API_BASE}/api/mentorship/requests/student?student_id=student_001`)
      .then(r => r.json())
      .then(data => { setRequests(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [])

  /* Stats */
  const stats = useMemo(() => ({
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length,
  }), [requests])

  /* Filter + sort */
  const rows = useMemo(() => {
    let list = statusFilter === 'all' ? [...requests] : requests.filter(r => r.status === statusFilter)
    list.sort((a, b) => {
      let va = a[sortCol] || '', vb = b[sortCol] || ''
      if (sortCol === 'created_at' || sortCol === 'responded_at') {
        va = new Date(va || 0).getTime(); vb = new Date(vb || 0).getTime()
      }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return list
  }, [requests, statusFilter, sortCol, sortAsc])

  const toggleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a)
    else { setSortCol(col); setSortAsc(true) }
  }

  const cancelRequest = async (reqId) => {
    setCancellingId(reqId)
    try {
      const res = await fetch(`${API_BASE}/api/mentorship/requests/${reqId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'student_001' }),
      })
      if (res.ok) fetchRequests()
    } catch (e) { console.error(e) }
    finally { setCancellingId(null) }
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const statusCfg = {
    pending:   { label: 'Pending',   cls: 'pending'   },
    accepted:  { label: 'Accepted',  cls: 'accepted'  },
    rejected:  { label: 'Rejected',  cls: 'rejected'  },
    cancelled: { label: 'Cancelled', cls: 'cancelled' },
  }

  if (loading) {
    return (
      <div className="mreq-loading">
        <div className="mreq-spinner" />
        <p>Loading your requests...</p>
      </div>
    )
  }

  return (
    <div className="mreq-page">
      {/* ─── Ring stat cards ─── */}
      <div className="ring-stats-row">
        <RingStat value={stats.pending}  max={stats.total || 1} label="Pending"  color="#f59e0b" trend={{ dir: 'up', pct: 40 }} />
        <RingStat value={stats.accepted} max={stats.total || 1} label="Accepted" color="#4ade80" trend={{ dir: 'up', pct: 20 }} />
        <RingStat value={stats.rejected} max={stats.total || 1} label="Rejected" color="#ef4444" trend={{ dir: 'down', pct: 20 }} />
      </div>

      {/* ─── Table section ─── */}
      <div className="mreq-table-section">
        <div className="mreq-table-header">
          <div className="mreq-breadcrumb">
            <h2>My Requests</h2>
            <span className="breadcrumb-path">Mentorship / My Requests</span>
          </div>
          <button className="submit-req-btn" onClick={() => navigate('/mentorship')}>
            + New Request
          </button>
        </div>

        {/* ─── Filter row ─── */}
        <div className="mreq-filter-row">
          <select className="mreq-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* ─── Data table ─── */}
        <div className="mreq-table-wrap">
          <table className="mreq-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => toggleSort('created_at')}>
                  Submitted {sortCol === 'created_at' && <span className="sort-arrow">{sortAsc ? '↑' : '↓'}</span>}
                </th>
                <th>Duration</th>
                <th>Topic</th>
                <th className="th-sortable" onClick={() => toggleSort('responded_at')}>
                  Date {sortCol === 'responded_at' && <span className="sort-arrow">{sortAsc ? '↑' : '↓'}</span>}
                </th>
                <th>Mentor</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((req, idx) => {
                const sc = statusCfg[req.status] || statusCfg.pending
                return (
                  <tr key={req.id} className="mreq-row" style={{ animationDelay: `${idx * 40}ms` }}>
                    <td className="td-date">{fmtDate(req.created_at)}</td>
                    <td>
                      <span className="dur-pill">{req.duration}m</span>
                    </td>
                    <td className="td-topic">{req.topic}</td>
                    <td className="td-date">{fmtDate(req.responded_at)}</td>
                    <td>
                      <div className="mentor-cell">
                        <span className="mentor-dot">{req.alumni?.avatar}</span>
                        <span>{req.alumni?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tbl-status ${sc.cls}`}>{sc.label}</span>
                    </td>
                    <td className="td-actions">
                      {req.status === 'pending' && (
                        <button
                          className="action-icon-btn danger"
                          title="Cancel request"
                          disabled={cancellingId === req.id}
                          onClick={() => cancelRequest(req.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      )}
                      {req.status === 'accepted' && (
                        <button className="action-icon-btn mint" title="View session" onClick={() => navigate('/mentorship/sessions')}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan="7" className="empty-row">No {statusFilter === 'all' ? '' : statusFilter} requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
