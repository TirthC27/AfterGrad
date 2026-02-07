import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/auth/AuthPage'
import VerifyPage from './pages/auth/VerifyPage'
import OnboardingPage from './pages/auth/OnboardingPage'
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
import { events as eventsStore, gigs as gigsStore, mentorship, invitations as invStore } from './localStore'
import './App.css'

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const STUDENT_ID = user?.id || 'student_001'
  const [showLineageTree, setShowLineageTree] = useState(false)
  const [evts, setEvts] = useState([])
  const [allGigs, setAllGigs] = useState([])
  const [offerings, setOfferings] = useState([])
  const [sessions, setSessions] = useState([])
  const [invitations, setInvitations] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    setEvts(eventsStore.getAll())
    setAllGigs(gigsStore.getAll())
    setOfferings(mentorship.getOfferings())
    setSessions(mentorship.getStudentSessions(STUDENT_ID))
    setInvitations(invStore.getForStudent(STUDENT_ID))
    setDataLoading(false)
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <>
      <section className="section-label">Essentials</section>
      <div className="essentials-grid">
        <AlumniLineageCard onExpand={() => setShowLineageTree(true)} />
        <div className="essentials-right-stack">
          <StatsCard icon="mentorship" label="Mentorships" value="" onClick={() => navigate('/mentorship')} />
          <StatsCard icon="referral" label="Referrals" value="" onClick={() => navigate('/gigs')} />
        </div>
        <div className="essentials-calories-card">
          <div className="calories-ring-container">
            <svg viewBox="0 0 120 120" className="calories-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(134,239,172,0.15)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--mint-400)" strokeWidth="10"
                strokeDasharray="314" strokeDashoffset={314 - Math.min(314, (evts.length + sessions.length + allGigs.length) * 20)} strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <div className="calories-text">
              <span className="calories-number">{evts.length + sessions.length + allGigs.length}</span>
              <span className="calories-label">Connections</span>
            </div>
          </div>
          <div className="total-time-badge">
            <span className="total-time-label">Active Since</span>
            <span className="total-time-value">{user?.created_at ? formatDate(user.created_at) : '6 mo'}</span>
            <span className="total-time-sub">on platform</span>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <section className="section-label">Your Activity</section>
      <div className="live-stats-row">
        <div className="live-stat-card" onClick={() => navigate('/events')}>
          <span className="live-stat-num">{evts.length}</span>
          <span className="live-stat-label">Events</span>
        </div>
        <div className="live-stat-card" onClick={() => navigate('/gigs')}>
          <span className="live-stat-num">{allGigs.length}</span>
          <span className="live-stat-label">Gigs</span>
        </div>
        <div className="live-stat-card" onClick={() => navigate('/mentorship')}>
          <span className="live-stat-num">{offerings.length}</span>
          <span className="live-stat-label">Mentors</span>
        </div>
        <div className="live-stat-card" onClick={() => navigate('/mentorship/sessions')}>
          <span className="live-stat-num">{sessions.length}</span>
          <span className="live-stat-label">Sessions</span>
        </div>
        <div className="live-stat-card">
          <span className="live-stat-num">{invitations.length}</span>
          <span className="live-stat-label">Invites Sent</span>
        </div>
      </div>

      {/* Recent Alumni Events */}
      {evts.length > 0 && (
        <>
          <section className="section-label">Recent Events</section>
          <div className="dash-cards-row">
            {evts.slice(0, 4).map(ev => (
              <div key={ev.id} className="dash-event-card" onClick={() => navigate(`/events/${ev.id}`)}>
                <div className="dash-ev-badge">{ev.event_type === 'online' ? '💻' : '📍'}</div>
                <h4>{ev.title}</h4>
                <p>{ev.description?.slice(0, 60)}{ev.description?.length > 60 ? '...' : ''}</p>
                <span className="dash-ev-date">{formatDate(ev.start_time)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent Gigs */}
      {allGigs.length > 0 && (
        <>
          <section className="section-label">Micro Gigs</section>
          <div className="dash-cards-row">
            {allGigs.slice(0, 4).map(g => (
              <div key={g.id} className="dash-gig-card" onClick={() => navigate('/gigs')}>
                <h4>{g.title}</h4>
                <p>{g.description?.slice(0, 60)}{g.description?.length > 60 ? '...' : ''}</p>
                <div className="dash-gig-meta">
                  {g.stipend && <span className="dash-gig-stipend">₹{g.stipend}</span>}
                  <span className="dash-gig-status">{g.status || 'open'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sent Invitations */}
      {invitations.length > 0 && (
        <>
          <section className="section-label">Your Alumni Invitations</section>
          <div className="dash-invites-list">
            {invitations.slice(0, 5).map(inv => (
              <div key={inv.id} className="dash-invite-item">
                <div className="dash-invite-info">
                  <span className="dash-invite-role">{inv.role}</span>
                  <span className="dash-invite-name">{inv.alumni_name || inv.alumni_id}</span>
                </div>
                <span className={`dash-invite-status status-${inv.status}`}>{inv.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

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
  const { isAuthenticated, loading, needsVerification, needsOnboarding } = useAuth()

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(134,239,172,0.2)', borderTopColor: 'var(--mint-400)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  // Not logged in → Landing page
  if (!isAuthenticated) {
    return <LandingPage />
  }

  // Student not verified → SheerID verification
  if (needsVerification) {
    return <VerifyPage />
  }

  // Not onboarded → Onboarding
  if (needsOnboarding) {
    return <OnboardingPage />
  }

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
