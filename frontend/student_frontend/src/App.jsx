import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AlumniLineageCard from './components/AlumniLineageCard'
import StatsCard from './components/StatsCard'
import RecommendedActivity from './components/RecommendedActivity'
import SleepCard from './components/SleepCard'
import ReportsCard from './components/ReportsCard'
import CalculationsRow from './components/CalculationsRow'
import LineageTreeModal from './components/LineageTreeModal'
import EventsList from './components/events/EventsList'
import EventDetail from './components/events/EventDetail'
import CreateEvent from './components/events/CreateEvent'
import LocationRequests from './components/events/LocationRequests'
import ExploreMentors from './components/mentorship/ExploreMentors'
import MyRequests from './components/mentorship/MyRequests'
import MySessions from './components/mentorship/MySessions'
import MicroGigs from './components/gigs/MicroGigs'
import Donations from './components/donations/Donations'
import ProfilePage from './components/profile/ProfilePage'
import './App.css'

function DashboardPage() {
  const [showLineageTree, setShowLineageTree] = useState(false)

  return (
    <>
      <section className="section-label">Essentials</section>
      <div className="essentials-grid">
        <AlumniLineageCard onExpand={() => setShowLineageTree(true)} />
        <div className="essentials-right-stack">
          <StatsCard icon="mentorship" label="Mentorships" value="" onClick={() => {}} />
          <StatsCard icon="referral" label="Referrals" value="" onClick={() => {}} />
        </div>
        <div className="essentials-calories-card">
          <div className="calories-ring-container">
            <svg viewBox="0 0 120 120" className="calories-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(134,239,172,0.15)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--mint-400)" strokeWidth="10"
                strokeDasharray="314" strokeDashoffset="78" strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <div className="calories-text">
              <span className="calories-number">12</span>
              <span className="calories-label">Connections</span>
            </div>
          </div>
          <div className="total-time-badge">
            <span className="total-time-label">Active Since</span>
            <span className="total-time-value">6 mo</span>
            <span className="total-time-sub">on platform</span>
          </div>
        </div>
      </div>

      <section className="section-label">Recommended Activity</section>
      <div className="recommended-grid">
        <RecommendedActivity />
        <div className="recommended-right">
          <SleepCard />
          <ReportsCard />
        </div>
      </div>

      <section className="section-label">Calculations</section>
      <CalculationsRow />

      {showLineageTree && (
        <LineageTreeModal onClose={() => setShowLineageTree(false)} />
      )}
    </>
  )
}

function App() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <main className="main-content">
        {isDashboard && <Header />}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/location-requests" element={<LocationRequests />} />
          <Route path="/mentorship" element={<ExploreMentors />} />
          <Route path="/mentorship/requests" element={<MyRequests />} />
          <Route path="/mentorship/sessions" element={<MySessions />} />
          <Route path="/gigs" element={<MicroGigs />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
