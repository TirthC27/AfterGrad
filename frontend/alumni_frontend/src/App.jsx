import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Mentorship from './pages/Mentorship'
import Gigs from './pages/Gigs'
import Donations from './pages/Donations'
import Fundraising from './pages/Fundraising'
import Toast from './components/Toast'

const pages = {
  dashboard: Dashboard,
  events: Events,
  mentorship: Mentorship,
  gigs: Gigs,
  donations: Donations,
  fundraising: Fundraising,
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const PageComponent = pages[activePage] || Dashboard

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <main className="main-content">
        <Header />
        <PageComponent addToast={addToast} />
      </main>
      <Toast toasts={toasts} />
    </div>
  )
}

export default App
