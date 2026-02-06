import React, { useEffect, useState } from 'react'
import './LineageTreeModal.css'

const treeData = {
  student: { name: 'Priya Sharma', year: '2026', role: 'Student', college: 'IIT Delhi', skills: ['React', 'Python', 'SQL'] },
  seniors: [
    { name: 'Rohit Kumar', year: '2024', role: 'Senior', college: 'IIT Delhi', skills: ['Java', 'SQL'] },
  ],
  alumni: [
    { name: 'Arjun Mehta', year: '2020', role: 'Senior PM', company: 'Google', skills: ['Product Strategy', 'SQL', 'Leadership'] },
    { name: 'Neha Gupta', year: '2019', role: 'SDE III', company: 'Microsoft', skills: ['C#', 'Azure', 'System Design'] },
  ],
  industry: [
    { name: 'Google', role: 'APM Intern', connection: 'Arjun Mehta' },
    { name: 'Microsoft', role: 'SDE Intern', connection: 'Neha Gupta' },
  ],
}

export default function LineageTreeModal({ onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    <div className={`lineage-modal-overlay ${visible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="lineage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mint-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <circle cx="6" cy="19" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M12 14l-6 2" />
              <path d="M12 14l6 2" />
            </svg>
            <h2>Alumni Lineage Tree</h2>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="modal-subtitle">Explore alumni paths connected to your degree</p>

        <div className="tree-container">
          {/* Student node */}
          <div className="tree-column">
            <div className="tree-col-label">Student</div>
            <div className="tree-node student-node">
              <div className="node-avatar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div className="node-info">
                <span className="node-name">{treeData.student.name}</span>
                <span className="node-detail">{treeData.student.college} &bull; {treeData.student.year}</span>
                <div className="node-skills">
                  {treeData.student.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="tree-connector">
            <svg width="60" height="120" viewBox="0 0 60 120">
              <path d="M 0 60 C 30 60, 30 30, 60 30" fill="none" stroke="var(--mint-300)" strokeWidth="2" />
              <path d="M 0 60 C 30 60, 30 90, 60 90" fill="none" stroke="var(--mint-300)" strokeWidth="2" />
            </svg>
          </div>

          {/* Senior column */}
          <div className="tree-column">
            <div className="tree-col-label">Senior</div>
            {treeData.seniors.map((s, i) => (
              <div key={i} className="tree-node senior-node">
                <div className="node-avatar senior-avatar">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div className="node-info">
                  <span className="node-name">{s.name}</span>
                  <span className="node-detail">{s.college} &bull; {s.year}</span>
                  <div className="node-skills">
                    {s.skills.map((sk) => <span key={sk} className="skill-tag">{sk}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="tree-connector">
            <svg width="60" height="120" viewBox="0 0 60 120">
              <path d="M 0 40 C 30 40, 30 30, 60 30" fill="none" stroke="var(--mint-300)" strokeWidth="2" />
              <path d="M 0 40 C 30 40, 30 90, 60 90" fill="none" stroke="var(--mint-300)" strokeWidth="2" />
            </svg>
          </div>

          {/* Alumni column */}
          <div className="tree-column">
            <div className="tree-col-label">Alumni</div>
            {treeData.alumni.map((a, i) => (
              <div key={i} className="tree-node alumni-node" style={{ animationDelay: `${i * 100 + 200}ms` }}>
                <div className="node-avatar alumni-avatar">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div className="node-info">
                  <span className="node-name">{a.name}</span>
                  <span className="node-detail">{a.company} &bull; {a.role}</span>
                  <span className="node-year">Class of {a.year}</span>
                  <div className="node-skills">
                    {a.skills.map((sk) => <span key={sk} className="skill-tag shared">{sk}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="tree-connector">
            <svg width="60" height="120" viewBox="0 0 60 120">
              <path d="M 0 30 C 30 30, 30 30, 60 30" fill="none" stroke="var(--mint-300)" strokeWidth="2" />
              <path d="M 0 90 C 30 90, 30 90, 60 90" fill="none" stroke="var(--mint-300)" strokeWidth="2" />
            </svg>
          </div>

          {/* Company column */}
          <div className="tree-column">
            <div className="tree-col-label">Company</div>
            {treeData.industry.map((c, i) => (
              <div key={i} className="tree-node company-node" style={{ animationDelay: `${i * 100 + 400}ms` }}>
                <div className="node-avatar company-avatar">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                </div>
                <div className="node-info">
                  <span className="node-name">{c.name}</span>
                  <span className="node-detail">{c.role}</span>
                  <span className="node-connection">via {c.connection}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
