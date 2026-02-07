import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AuthPage.css'

const DEMO_STUDENTS = [
  { id: 'student_001', name: 'Tirth Chudasama', email: 'tirth@college.edu' },
  { id: 'student_002', name: 'Aisha Khan', email: 'aisha@university.ac.in' },
]

export default function AuthPage() {
  const { register, login, demoLogin } = useAuth()
  const [tab, setTab] = useState('login') // 'login' | 'signup' | 'demo'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Signup form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password })
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
          <span className="auth-badge">Student Portal</span>
          <p>Connect with alumni, find mentors, grow your career</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
            Log In
          </button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>
            Sign Up
          </button>
          <button className={`auth-tab ${tab === 'demo' ? 'active' : ''}`} onClick={() => { setTab('demo'); setError('') }}>
            Demo
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Student Account'}
            </button>
          </form>
        )}

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@college.edu" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="auth-divider"><span>or continue with demo</span></div>
            <button type="button" className="auth-btn demo" onClick={() => setTab('demo')}>
              Use Demo Account
            </button>
          </form>
        )}

        {tab === 'demo' && (
          <div className="auth-form">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Quick login with a pre-configured student account:
            </p>
            <div className="demo-users">
              {DEMO_STUDENTS.map(s => (
                <button key={s.id} className="demo-user-btn" onClick={() => handleDemoLogin(s.id)} disabled={loading}>
                  <div className="demo-avatar">{s.name.charAt(0)}</div>
                  <div className="demo-info">
                    <h4>{s.name}</h4>
                    <p>{s.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
