import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus, Download, Search, Calendar, Filter, ChevronDown,
  ChevronRight, Zap, AlertTriangle, FileText, Clock,
  ArrowUpDown, LayoutGrid, CalendarDays, X, Trash2,
  Edit3, CheckCircle, ChevronLeft
} from 'lucide-react'

/* ── Initial Mock Data ── */
const initialCampaigns = [
  {
    id: 92,
    status: 'draft',
    items: 'Environmental Cleanup (2x); Tree Plantation Drive (3x); Awareness Kit (1x);',
    startDate: '3 Nov, 2:00pm',
    endDate: '9 Nov, 2:00pm',
    progress: 0,
    organizer: { name: 'Darrell Steward', initials: 'DS', color: '#22c55e', via: 'Via Website' },
  },
  {
    id: 100,
    status: 'overdue',
    items: 'Campus Green Fund (1x);',
    startDate: '27 Oct, 9:00am',
    endDate: '31 Oct, 9:00am',
    progress: 100,
    organizer: { name: 'Darlene Fox', initials: 'DF', color: '#ec4899', via: 'Via Website' },
  },
  {
    id: 95,
    status: 'active',
    items: 'Alumni Scholarship (1x); Mentor Fund (1x); Book Drive (1x);',
    startDate: '26 Oct, 9:00am',
    endDate: '2 Nov, 12:00am',
    progress: 62,
    organizer: { name: 'Floyd Miles', initials: 'FM', color: '#06b6d4', via: 'Via In-store' },
  },
  {
    id: 99,
    status: 'active',
    items: 'Lab Equipment Fund (1x); Hostel Renovation (1x);',
    startDate: '28 Oct, 11:30am',
    endDate: '5 Nov, 11:30am',
    progress: 45,
    organizer: { name: 'Ralph Edwards', initials: 'RE', color: '#06b6d4', via: 'Via Website' },
  },
  {
    id: 94,
    status: 'active',
    items: 'Sports Gear Collection (2x);',
    startDate: '30 Oct, 9:00am',
    endDate: '4 Nov, 9:00pm',
    progress: 55,
    organizer: { name: 'Cameron Diaz', initials: 'CD', color: '#06b6d4', via: 'Via Website' },
  },
  {
    id: 98,
    status: 'active',
    items: 'Library Books Drive (1x);',
    startDate: '29 Oct, 7:00am',
    endDate: '5 Nov, 7:00am',
    progress: 38,
    organizer: { name: 'Courtney Baker', initials: 'CB', color: '#06b6d4', via: 'Via Website' },
  },
  {
    id: 97,
    status: 'active',
    items: 'Research Lab Fund (1x); Equipment Grants (1x);',
    startDate: '1 Nov, 9:00am',
    endDate: '7 Nov, 9:00am',
    progress: 28,
    organizer: { name: 'Jerome Bell', initials: 'JB', color: '#06b6d4', via: 'Via In-store' },
  },
  {
    id: 101,
    status: 'upcoming',
    items: 'Annual Gala Fundraiser (1x); Alumni Meetup (1x);',
    startDate: '2 Nov, 12:00am',
    endDate: '10 Nov, 12:00am',
    progress: 0,
    organizer: { name: 'Kristin Watson', initials: 'KW', color: '#f59e0b', via: 'Via Website' },
  },
]

const statusConfig = {
  draft:    { label: 'Draft',     icon: FileText,       color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
  overdue:  { label: 'Over Time', icon: AlertTriangle,  color: '#ef4444', bg: '#fef2f2', border: '#ef4444' },
  active:   { label: 'Active',    icon: Zap,            color: '#06b6d4', bg: '#ecfeff', border: '#06b6d4' },
  upcoming: { label: 'Upcoming',  icon: Clock,          color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b' },
}

const statusOrder = ['all', 'active', 'draft', 'overdue', 'upcoming']
const dateRangeOptions = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time']
const sortOptions = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'id-asc', label: 'ID ascending' },
  { key: 'id-desc', label: 'ID descending' },
  { key: 'progress', label: 'Progress' },
]

/* ── Dropdown hook ── */
function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return { open, setOpen, ref }
}

/* ── Toast ── */
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fo-toast">
      <CheckCircle size={16} /> {message}
    </div>
  )
}

export default function Fundraising() {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('card')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [sortBy, setSortBy] = useState('newest')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [toast, setToast] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(10) // Nov = 10 (0-indexed)

  const dateDropdown = useDropdown()
  const sortDropdown = useDropdown()
  const statusDropdown = useDropdown()

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    items: '', startDate: '', endDate: '', organizerName: '', via: 'Via Website',
  })

  const showToast = (msg) => setToast(msg)

  /* ── Filtering & Sorting ── */
  const filtered = useMemo(() => {
    let result = campaigns.filter(c => {
      const matchSearch =
        !search ||
        c.items.toLowerCase().includes(search.toLowerCase()) ||
        c.organizer.name.toLowerCase().includes(search.toLowerCase()) ||
        String(c.id).includes(search)
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
    // sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id
      if (sortBy === 'oldest') return a.id - b.id
      if (sortBy === 'id-asc') return a.id - b.id
      if (sortBy === 'id-desc') return b.id - a.id
      if (sortBy === 'progress') return b.progress - a.progress
      return 0
    })
    return result
  }, [campaigns, search, statusFilter, sortBy])

  /* ── Create Campaign ── */
  const handleCreate = () => {
    if (!newCampaign.items.trim()) return
    const initials = newCampaign.organizerName
      ? newCampaign.organizerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : 'YO'
    const newId = Math.max(...campaigns.map(c => c.id)) + 1
    const created = {
      id: newId,
      status: 'draft',
      items: newCampaign.items,
      startDate: newCampaign.startDate || 'TBD',
      endDate: newCampaign.endDate || 'TBD',
      progress: 0,
      organizer: {
        name: newCampaign.organizerName || 'You',
        initials,
        color: '#22c55e',
        via: newCampaign.via,
      },
    }
    setCampaigns(prev => [created, ...prev])
    setShowCreateModal(false)
    setNewCampaign({ items: '', startDate: '', endDate: '', organizerName: '', via: 'Via Website' })
    showToast(`Campaign #${newId} created!`)
  }

  /* ── Export CSV ── */
  const handleExport = () => {
    const header = 'ID,Status,Items,Start Date,End Date,Progress,Organizer,Via'
    const rows = filtered.map(c =>
      `${c.id},${c.status},"${c.items}",${c.startDate},${c.endDate},${c.progress}%,${c.organizer.name},${c.organizer.via}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fundraising_campaigns_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${filtered.length} campaigns as CSV`)
  }

  /* ── Delete Campaign ── */
  const handleDelete = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setSelectedCard(null)
    showToast(`Campaign #${id} deleted`)
  }

  /* ── Change Status ── */
  const handleStatusChange = (id, newStatus) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    showToast(`Campaign #${id} → ${statusConfig[newStatus].label}`)
  }

  /* ── Calendar View helpers ── */
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const daysInMonth = new Date(2025, calendarMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(2025, calendarMonth, 1).getDay()

  const statusCountForFilter = (st) => campaigns.filter(c => c.status === st).length

  return (
    <div className="fo-page">
      {/* ── Toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ── Top Bar ── */}
      <div className="fo-topbar">
        <div className="fo-topbar-left">
          <h1 className="fo-title">Fundraising</h1>
          <button className="fo-btn fo-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={15} /> Create Campaign
          </button>
          <button className="fo-btn fo-btn-outline" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
        </div>
        <div className="fo-topbar-right">
          <div className="fo-view-toggle">
            <button
              className={`fo-view-btn ${view === 'card' ? 'active' : ''}`}
              onClick={() => setView('card')}
            >
              <LayoutGrid size={14} /> Card view
            </button>
            <button
              className={`fo-view-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <CalendarDays size={14} /> Calendar
            </button>
          </div>
          <div className="fo-total">
            <span className="fo-total-num">{filtered.length}</span>
            <span className="fo-total-label">Total campaigns</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="fo-filters">
        <div className="fo-search-wrap">
          <Search size={15} className="fo-search-icon" />
          <input
            className="fo-search"
            placeholder="Search campaign, organizer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="fo-search-clear" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Date Range Dropdown */}
        <div className="fo-dropdown-wrap" ref={dateDropdown.ref}>
          <button className="fo-filter-chip" onClick={() => dateDropdown.setOpen(!dateDropdown.open)}>
            <Calendar size={13} /> Date range: <strong>{dateRange}</strong> <ChevronDown size={13} />
          </button>
          {dateDropdown.open && (
            <div className="fo-dropdown">
              {dateRangeOptions.map(opt => (
                <button
                  key={opt}
                  className={`fo-dropdown-item ${dateRange === opt ? 'active' : ''}`}
                  onClick={() => { setDateRange(opt); dateDropdown.setOpen(false) }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="fo-dropdown-wrap" ref={statusDropdown.ref}>
          <button className="fo-filter-chip" onClick={() => statusDropdown.setOpen(!statusDropdown.open)}>
            <Zap size={13} /> Status:{' '}
            <strong>
              {statusFilter === 'all'
                ? `All (${campaigns.length})`
                : `${statusConfig[statusFilter].label} (${statusCountForFilter(statusFilter)})`}
            </strong>{' '}
            <ChevronDown size={13} />
          </button>
          {statusDropdown.open && (
            <div className="fo-dropdown">
              <button
                className={`fo-dropdown-item ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('all'); statusDropdown.setOpen(false) }}
              >
                All ({campaigns.length})
              </button>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`fo-dropdown-item ${statusFilter === key ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(key); statusDropdown.setOpen(false) }}
                >
                  <span style={{ color: cfg.color }}>●</span> {cfg.label} ({statusCountForFilter(key)})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="fo-dropdown-wrap" ref={sortDropdown.ref}>
          <button className="fo-filter-chip" onClick={() => sortDropdown.setOpen(!sortDropdown.open)}>
            <ArrowUpDown size={13} /> Sort by: <strong>{sortOptions.find(s => s.key === sortBy)?.label}</strong> <ChevronDown size={13} />
          </button>
          {sortDropdown.open && (
            <div className="fo-dropdown">
              {sortOptions.map(opt => (
                <button
                  key={opt.key}
                  className={`fo-dropdown-item ${sortBy === opt.key ? 'active' : ''}`}
                  onClick={() => { setSortBy(opt.key); sortDropdown.setOpen(false) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Card Grid View ── */}
      {view === 'card' && (
        <div className="fo-grid">
          {filtered.length === 0 && (
            <div className="fo-empty">No campaigns match your filters.</div>
          )}
          {filtered.map((c, i) => {
            const st = statusConfig[c.status]
            const StatusIcon = st.icon
            return (
              <div
                key={c.id}
                className="fo-card"
                style={{ borderColor: st.border, animationDelay: `${i * 50}ms` }}
              >
                <div className="fo-card-head">
                  <span className="fo-card-id">#{c.id}</span>
                  <span className="fo-card-badge" style={{ color: st.color, background: st.bg }}>
                    <StatusIcon size={12} /> {st.label}
                  </span>
                </div>

                <p className="fo-card-items">{c.items}</p>

                <div className="fo-card-timeline">
                  <div className="fo-card-dates">
                    <span className="fo-date" style={{ color: c.status === 'overdue' ? '#ef4444' : undefined }}>
                      {c.startDate}
                    </span>
                    <span className="fo-date" style={{ color: c.status === 'overdue' ? '#ef4444' : undefined }}>
                      {c.endDate}
                    </span>
                  </div>
                  <div className="fo-track">
                    <div
                      className="fo-track-fill"
                      style={{
                        width: `${c.progress}%`,
                        background: c.status === 'overdue' ? '#ef4444'
                          : c.status === 'active' ? '#06b6d4' : '#d1d5db',
                      }}
                    />
                    {c.progress > 0 && c.progress < 100 && (
                      <div className="fo-track-dot" style={{
                        left: `${c.progress}%`,
                        background: c.status === 'overdue' ? '#ef4444' : '#06b6d4',
                      }} />
                    )}
                    {c.progress === 100 && (
                      <div className="fo-track-dot end" style={{ left: '100%', background: '#ef4444' }} />
                    )}
                  </div>
                </div>

                <div className="fo-card-footer">
                  <div className="fo-organizer">
                    <div
                      className="fo-organizer-avatar"
                      style={{ background: `${c.organizer.color}18`, color: c.organizer.color }}
                    >
                      {c.organizer.initials}
                    </div>
                    <div className="fo-organizer-info">
                      <span className="fo-organizer-name">{c.organizer.name}</span>
                      <span className="fo-organizer-via">{c.organizer.via}</span>
                    </div>
                  </div>
                  <button className="fo-card-arrow" onClick={() => setSelectedCard(c)}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Calendar View ── */}
      {view === 'calendar' && (
        <div className="fo-calendar">
          <div className="fo-cal-header">
            <button className="fo-cal-nav" onClick={() => setCalendarMonth(m => m > 0 ? m - 1 : 11)}>
              <ChevronLeft size={16} />
            </button>
            <span className="fo-cal-month">{monthNames[calendarMonth]} 2025</span>
            <button className="fo-cal-nav" onClick={() => setCalendarMonth(m => m < 11 ? m + 1 : 0)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="fo-cal-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="fo-cal-day-name">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="fo-cal-cell empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              // Check if any campaign starts on this day
              const matchingCampaigns = campaigns.filter(c => {
                const match = c.startDate.match(/(\d+)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)
                if (!match) return false
                const cDay = parseInt(match[1])
                const cMonth = monthNames.indexOf(match[2])
                return cDay === day && cMonth === calendarMonth
              })
              return (
                <div key={day} className={`fo-cal-cell ${matchingCampaigns.length ? 'has-event' : ''}`}>
                  <span className="fo-cal-num">{day}</span>
                  {matchingCampaigns.map(mc => (
                    <div
                      key={mc.id}
                      className="fo-cal-event"
                      style={{ background: statusConfig[mc.status].bg, color: statusConfig[mc.status].color }}
                      onClick={() => setSelectedCard(mc)}
                    >
                      #{mc.id}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Create Campaign Modal ── */}
      {showCreateModal && (
        <div className="fo-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="fo-modal" onClick={e => e.stopPropagation()}>
            <div className="fo-modal-header">
              <h2 className="fo-modal-title">Create New Campaign</h2>
              <button className="fo-modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="fo-modal-body">
              <label className="fo-label">Campaign Items *</label>
              <textarea
                className="fo-input fo-textarea"
                placeholder="e.g. Tree Plantation Drive (2x); Book Collection (1x);"
                value={newCampaign.items}
                onChange={e => setNewCampaign(p => ({ ...p, items: e.target.value }))}
              />
              <div className="fo-form-row">
                <div className="fo-form-col">
                  <label className="fo-label">Start Date</label>
                  <input
                    className="fo-input"
                    type="text"
                    placeholder="e.g. 15 Feb, 9:00am"
                    value={newCampaign.startDate}
                    onChange={e => setNewCampaign(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="fo-form-col">
                  <label className="fo-label">End Date</label>
                  <input
                    className="fo-input"
                    type="text"
                    placeholder="e.g. 28 Feb, 9:00am"
                    value={newCampaign.endDate}
                    onChange={e => setNewCampaign(p => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <label className="fo-label">Organizer Name</label>
              <input
                className="fo-input"
                placeholder="Your name"
                value={newCampaign.organizerName}
                onChange={e => setNewCampaign(p => ({ ...p, organizerName: e.target.value }))}
              />
              <label className="fo-label">Source</label>
              <select
                className="fo-input"
                value={newCampaign.via}
                onChange={e => setNewCampaign(p => ({ ...p, via: e.target.value }))}
              >
                <option>Via Website</option>
                <option>Via In-store</option>
                <option>Via Mobile App</option>
              </select>
            </div>
            <div className="fo-modal-footer">
              <button className="fo-btn fo-btn-outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="fo-btn fo-btn-primary" onClick={handleCreate}>
                <Plus size={14} /> Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail / Edit Modal ── */}
      {selectedCard && (
        <div className="fo-modal-backdrop" onClick={() => setSelectedCard(null)}>
          <div className="fo-modal" onClick={e => e.stopPropagation()}>
            <div className="fo-modal-header">
              <h2 className="fo-modal-title">
                Campaign #{selectedCard.id}
                <span
                  className="fo-card-badge"
                  style={{
                    color: statusConfig[selectedCard.status].color,
                    background: statusConfig[selectedCard.status].bg,
                    marginLeft: 10,
                    fontSize: 11,
                  }}
                >
                  {statusConfig[selectedCard.status].label}
                </span>
              </h2>
              <button className="fo-modal-close" onClick={() => setSelectedCard(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="fo-modal-body">
              <label className="fo-label">Items</label>
              <p className="fo-detail-text">{selectedCard.items}</p>

              <div className="fo-form-row">
                <div className="fo-form-col">
                  <label className="fo-label">Start</label>
                  <p className="fo-detail-text">{selectedCard.startDate}</p>
                </div>
                <div className="fo-form-col">
                  <label className="fo-label">End</label>
                  <p className="fo-detail-text">{selectedCard.endDate}</p>
                </div>
              </div>

              <label className="fo-label">Progress</label>
              <div className="fo-detail-progress-wrap">
                <div className="fo-track" style={{ height: 8, borderRadius: 8 }}>
                  <div
                    className="fo-track-fill"
                    style={{
                      width: `${selectedCard.progress}%`,
                      background: statusConfig[selectedCard.status].color,
                      borderRadius: 8,
                    }}
                  />
                </div>
                <span className="fo-detail-pct">{selectedCard.progress}%</span>
              </div>

              <label className="fo-label">Organizer</label>
              <div className="fo-organizer" style={{ marginBottom: 12 }}>
                <div
                  className="fo-organizer-avatar"
                  style={{ background: `${selectedCard.organizer.color}18`, color: selectedCard.organizer.color }}
                >
                  {selectedCard.organizer.initials}
                </div>
                <div className="fo-organizer-info">
                  <span className="fo-organizer-name">{selectedCard.organizer.name}</span>
                  <span className="fo-organizer-via">{selectedCard.organizer.via}</span>
                </div>
              </div>

              <label className="fo-label">Change Status</label>
              <div className="fo-status-actions">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    className={`fo-status-btn ${selectedCard.status === key ? 'current' : ''}`}
                    style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color }}
                    onClick={() => {
                      handleStatusChange(selectedCard.id, key)
                      setSelectedCard(prev => ({ ...prev, status: key }))
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="fo-modal-footer">
              <button
                className="fo-btn fo-btn-danger"
                onClick={() => handleDelete(selectedCard.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
              <button className="fo-btn fo-btn-outline" onClick={() => setSelectedCard(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
