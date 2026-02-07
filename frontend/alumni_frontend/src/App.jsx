import React, { useState } from 'react'
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users, Briefcase, Gift, User, LogOut,
  Menu, X, ChevronDown, Bell, Search
} from 'lucide-react'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/auth/AuthPage'
import OnboardingPage from './pages/auth/OnboardingPage'
import Dashboard from './pages/Dashboard'
import MentorshipManage from './pages/MentorshipManage'
import EventsManage from './pages/EventsManage'
import GigsManage from './pages/GigsManage'
import RequestsInbox from './pages/RequestsInbox'
import ProfilePage from './pages/ProfilePage'
import './App.css'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/mentorship', label: 'Mentorship', icon: Users },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/gigs', label: 'Gigs', icon: Briefcase },
  { path: '/requests', label: 'Inbox', icon: Bell },
  { path: '/profile', label: 'Profile', icon: User },
]

function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { logout, user } = useAuth()
  return (
    <aside className={`alumni-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-logo">AfterGrad</span>}
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        {!collapsed && (
          <>
            <span className="sidebar-role">{user?.name || 'Alumni Portal'}</span>
            <button className="sidebar-logout" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const { isAuthenticated, loading, needsOnboarding } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(34,197,94,0.2)', borderTopColor: 'var(--mint-400)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to root landing page
    window.location.href = '/'
    return null
  }

  if (needsOnboarding) {
    return <OnboardingPage />
  }

  return (
    <div className={`alumni-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className="alumni-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mentorship" element={<MentorshipManage />} />
          <Route path="/events" element={<EventsManage />} />
          <Route path="/gigs" element={<GigsManage />} />
          <Route path="/requests" element={<RequestsInbox />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
