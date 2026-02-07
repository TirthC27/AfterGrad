import React, { useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Mentorship from './pages/Mentorship'
import PhysicalMentorship from './pages/PhysicalMentorship'
import Gigs from './pages/Gigs'
import Donations from './pages/Donations'
import Fundraising from './pages/Fundraising'
import SocialMediaConnect from './pages/SocialMediaConnect'
import Toast from './components/Toast'
import './App.css'

function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  // derive active page key from the current path
  const activePage = location.pathname.replace('/', '') || 'dashboard'

  const handleNavigate = (key) => {
    navigate(`/${key}`)
  }

  return (
    <div className="app">
      <div className="main-container">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
        <main className="content">
          {activePage === 'dashboard' && <Header />}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/mentorship" element={<Mentorship addToast={addToast} />} />
            <Route path="/physical-mentorship" element={<PhysicalMentorship addToast={addToast} />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/fundraising" element={<Fundraising />} />
            <Route path="/social-connect" element={<SocialMediaConnect />} />
          </Routes>
        </main>
      </div>
      <Toast toasts={toasts} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
