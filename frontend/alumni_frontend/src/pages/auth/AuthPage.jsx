import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AuthPage.css'

const DEMO_ALUMNI = [
  { id: 'alumni_001', name: 'Priya Sharma', company: 'Google', email: 'priya@google.com' },
  { id: 'alumni_002', name: 'Rahul Verma', company: 'Amazon', email: 'rahul@amazon.com' },
  { id: 'alumni_003', name: 'Sneha Patel', company: 'Microsoft', email: 'sneha@microsoft.com' },
  { id: 'alumni_004', name: 'Arjun Mehta', company: 'Flipkart', email: 'arjun@flipkart.com' },
]

export default function AuthPage() {
  const { register, login, demoLogin } = useAuth()
  const [tab, setTab] = useState('demo') // demo first for alumni
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loginEmail, setLoginEmail] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email })
    } catch (err) {
      setError(err.message || 'Signup failed')
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email: loginEmail })
    } catch (err) {
      setError(err.message || 'Login failed')
    }
    setLoading(false)
  }

  const handleDemoLogin = async (userId) => {
    setError('')
    setLoading(true)
    try {
      await demoLogin(userId)
    } catch (err) {
      setError(err.message || 'Demo login failed')
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>AfterGrad</h1>
          <span className="auth-badge">Alumni Portal</span>
          <p>Mentor students, manage events, give back to your community</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'demo' ? 'active' : ''}`} onClick={() => { setTab('demo'); setError('') }}>
            Demo Login
          </button>
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
            Log In
          </button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {tab === 'demo' && (
          <div className="auth-form">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Quick login with a pre-configured alumni account:
            </p>
            <div className="demo-users">
              {DEMO_ALUMNI.map(a => (
                <button key={a.id} className="demo-user-btn" onClick={() => handleDemoLogin(a.id)} disabled={loading}>
                  <div className="demo-avatar">{a.name.charAt(0)}</div>
                  <div className="demo-info">
                    <h4>{a.name}</h4>
                    <p>{a.company} · {a.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@company.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="auth-divider"><span>or use demo</span></div>
            <button type="button" className="auth-btn demo" onClick={() => setTab('demo')}>
              Demo Login
            </button>
          </form>
        )}

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Alumni Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
