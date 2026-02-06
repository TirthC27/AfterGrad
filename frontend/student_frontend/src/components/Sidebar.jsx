import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Sidebar.css'

const menuItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'events', label: 'Events', path: '/events' },
  { icon: 'locationLock', label: 'Location Requests', path: '/location-requests' },
  {
    icon: 'mentorship', label: 'Mentorship', path: '/mentorship', expandable: true,
    children: [
      { label: 'Explore Mentors', path: '/mentorship' },
      { label: 'My Requests', path: '/mentorship/requests' },
      { label: 'My Sessions', path: '/mentorship/sessions' },
    ]
  },
  { icon: 'gigs', label: 'Micro Gigs', path: '/gigs' },
  { icon: 'donations', label: 'Donations', path: '/donations' },
  { icon: 'profile', label: 'Profile', path: '/profile' },
]

const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  events: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  mentorship: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  gigs: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  donations: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  locationLock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
}

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState({})

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isParentActive = (item) => {
    if (!item.children) return isActive(item.path)
    return item.children.some(c => location.pathname === c.path) || location.pathname === item.path
  }

  const toggleExpand = (label) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isExpanded = (item) => {
    if (collapsed) return false
    if (expanded[item.label] !== undefined) return expanded[item.label]
    return item.children?.some(c => location.pathname === c.path)
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🎓</span>
          {!collapsed && <span className="logo-text">AfterGrad</span>}
        </div>
        <button className="collapse-btn" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <polyline points="9 18 15 12 9 6" />
              : <polyline points="15 18 9 12 15 6" />
            }
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.expandable && item.children) {
            const open = isExpanded(item)
            const parentActive = isParentActive(item)
            return (
              <div key={item.label} className="nav-group">
                <button
                  className={`nav-item ${parentActive ? 'active' : ''}`}
                  onClick={() => {
                    if (collapsed) { navigate(item.path); return }
                    toggleExpand(item.label)
                    navigate(item.path)
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{icons[item.icon]}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {!collapsed && (
                    <span className={`nav-chevron ${open ? 'open' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    </span>
                  )}
                </button>
                {open && !collapsed && (
                  <div className="nav-children">
                    {item.children.map(child => (
                      <button
                        key={child.path}
                        className={`nav-child ${location.pathname === child.path ? 'active' : ''}`}
                        onClick={() => navigate(child.path)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <button
              key={item.label}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{icons[item.icon]}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <button className="logout-btn" title={collapsed ? 'Log out' : undefined}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {!collapsed && <span>Log out</span>}
      </button>
    </aside>
  )
}
