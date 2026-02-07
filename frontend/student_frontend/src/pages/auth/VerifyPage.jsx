import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck } from 'lucide-react'
import './AuthPage.css'

export default function VerifyPage() {
  const { verifyStudent, user } = useAuth()
  const [college, setCollege] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [studentEmail, setStudentEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await verifyStudent({
        college,
        graduation_year: graduationYear,
        student_email: studentEmail,
      })
      if (res.verified) {
        setSuccess(true)
      } else {
        setError(res.message || 'Verification failed')
      }
    } catch (err) {
      setError(err.message || 'Verification failed')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="verify-card">
          <div className="verify-icon">
            <ShieldCheck size={32} color="var(--mint-500, #22c55e)" />
          </div>
          <h2>Verified! ✓</h2>
          <p className="verify-desc">
            Your student status has been verified. Redirecting to onboarding...
          </p>
          <div className="auth-success">SheerID verification complete (mock)</div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="verify-card">
        <div className="verify-icon">
          <ShieldCheck size={32} color="var(--mint-500, #22c55e)" />
        </div>
        <h2>Verify Student Status</h2>
        <p className="verify-desc">
          We use SheerID to verify your student identity. This gives you access to exclusive features.
        </p>

        <div className="sheerid-badge">
          <ShieldCheck size={14} />
          Powered by SheerID
          <span className="mock-tag">DEMO</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label>College / University</label>
            <input
              type="text"
              placeholder="MIT, Stanford, IIT Bombay..."
              value={college}
              onChange={e => setCollege(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Expected Graduation Year</label>
            <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)} required>
              <option value="">Select year</option>
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>College Email (.edu / .ac.in)</label>
            <input
              type="email"
              placeholder="you@college.edu"
              value={studentEmail}
              onChange={e => setStudentEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify My Student Status'}
          </button>
        </form>

        <div className="skip-link">
          <button onClick={() => {
            // Skip verification — auto-verify for demo
            verifyStudent({
              college: 'Demo University',
              graduation_year: 2026,
              student_email: user?.email || 'demo@college.edu',
            })
          }}>
            Skip for demo →
          </button>
        </div>
      </div>
    </div>
  )
}
