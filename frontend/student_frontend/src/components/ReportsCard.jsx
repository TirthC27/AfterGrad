import React from 'react'
import './ReportsCard.css'

export default function ReportsCard() {
  return (
    <div className="reports-card">
      <span className="reports-title">Reports</span>
      <div className="reports-items">
        <div className="report-row">
          <div className="report-dot" style={{ background: 'var(--mint-400)' }} />
          <span className="report-label">Career Progress</span>
          <span className="report-value" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>On Track</span>
        </div>
        <div className="report-row">
          <div className="report-dot" style={{ background: 'var(--mint-300)' }} />
          <span className="report-label">Skill Growth</span>
          <span className="report-value" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>+3 this month</span>
        </div>
      </div>
    </div>
  )
}
