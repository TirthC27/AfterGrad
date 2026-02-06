import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AlumniLineageCard from './components/AlumniLineageCard'
import StatsCard from './components/StatsCard'
import RecommendedActivity from './components/RecommendedActivity'
import SleepCard from './components/SleepCard'
import ReportsCard from './components/ReportsCard'
import CalculationsRow from './components/CalculationsRow'
import RightPanel from './components/RightPanel'
import LineageTreeModal from './components/LineageTreeModal'
import './App.css'

function App() {
  const [showLineageTree, setShowLineageTree] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header />

        <section className="section-label">Essentials</section>
        <div className="essentials-grid">
          <AlumniLineageCard onExpand={() => setShowLineageTree(true)} />
          <div className="essentials-right-stack">
            <StatsCard
              icon="mentorship"
              label="Mentorships"
              value=""
              onClick={() => {}}
            />
            <StatsCard
              icon="referral"
              label="Referrals"
              value=""
              onClick={() => {}}
            />
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
      </main>
      <RightPanel />

      {showLineageTree && (
        <LineageTreeModal onClose={() => setShowLineageTree(false)} />
      )}
    </div>
  )
}

export default App
