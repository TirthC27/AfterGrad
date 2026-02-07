import React, { useState } from 'react'
import { auth, initStore } from '../localStore'
import './LandingPage.css'

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setConfirmPassword(''); setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      initStore()
      const data = auth.login(email, password)
      const profile = data.profile
      if (profile.role === 'student') {
        localStorage.setItem('aftergrad_student', JSON.stringify(profile))
        window.location.href = '/'
      } else {
        localStorage.setItem('aftergrad_alumni', JSON.stringify(profile))
        window.location.href = '/alumni/'
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    try {
      initStore()
      const data = auth.register({ name: name.trim(), email, password, role: selectedRole })
      const profile = data.profile
      if (profile.role === 'student') {
        localStorage.setItem('aftergrad_student', JSON.stringify(profile))
        window.location.href = '/'
      } else {
        localStorage.setItem('aftergrad_alumni', JSON.stringify(profile))
        window.location.href = '/alumni/'
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  /* ── Role Selection ── */
  if (!selectedRole) {
    return (
      <div className="landing-container">
        {/* ── Header / Hero ── */}
        <div className="landing-hero">
          <div className="landing-hero-inner">
            <span className="landing-logo">🎓</span>
            <h1 className="landing-title">AfterGrad</h1>
          </div>
          <p className="landing-subtitle">Connect. Mentor. Grow.</p>
        </div>

        {/* ── Portal Cards ── */}
        <div className="landing-cards">
          <div className="landing-card" onClick={() => setSelectedRole('student')}>
            <div className="landing-card-icon">👨‍🎓</div>
            <h2>Student Portal</h2>
            <p>Find mentors, attend events, explore opportunities</p>
            <button className="landing-btn student-btn">Continue as Student →</button>
          </div>

          <div className="landing-card" onClick={() => setSelectedRole('alumni')}>
            <div className="landing-card-icon">🎯</div>
            <h2>Alumni Portal</h2>
            <p>Mentor students, host events, give back</p>
            <button className="landing-btn alumni-btn">Continue as Alumni →</button>
          </div>
        </div>

        {/* ── Demo Credentials ── */}
        <div className="landing-demo">
          <p>Demo Credentials: student → tirth@college.edu / student123</p>
          <p>alumni → priya@google.com / alumni123</p>
        </div>
      </div>
    )
  }

  /* ── Split-Screen Login / Register ── */
  return (
    <div className="auth-page">
      <div className="auth-split-card">
        {/* ── Left: Form ── */}
        <div className="auth-left">
          <button className="auth-back-btn" onClick={() => { setSelectedRole(null); resetForm(); setIsRegister(false) }}>
            ← Back
          </button>

          <div className="auth-logo-icon">
            {selectedRole === 'student' ? '👨‍🎓' : '🎯'}
          </div>

          <h1 className="auth-heading">
            {isRegister ? 'Create Account' : 'Welcome back!'}
          </h1>
          <p className="auth-subheading">
            {isRegister
              ? `Register as ${selectedRole === 'student' ? 'Student' : 'Alumni'} to get started!`
              : `Please enter your credentials to sign in!`}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {isRegister ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-field">
                <label>Full Name <span className="req">*</span></label>
                <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Email <span className="req">*</span></label>
                <input type="email" placeholder="email@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Password <span className="req">*</span></label>
                <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Confirm Password <span className="req">*</span></label>
                <input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label>Email <span className="req">*</span></label>
                <input type="email" placeholder="email@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Password <span className="req">*</span></label>
                <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <a href="#" className="auth-forgot" onClick={e => e.preventDefault()}>Forgot password?</a>
            </form>
          )}

          {!isRegister && (
            <>
              <div className="auth-divider"><span>OR</span></div>
              <div className="auth-social-row">
                <button className="auth-social-btn" type="button">
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.03 24.03 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Use Google
                </button>
                <button className="auth-social-btn" type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.47 2H3.53A1.45 1.45 0 0 0 2 3.47v17.06A1.45 1.45 0 0 0 3.47 22h17.06A1.45 1.45 0 0 0 22 20.53V3.47A1.45 1.45 0 0 0 20.53 2h.06zM8.09 18.74h-3v-9h3v9zM6.59 8.48a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 1 1 0 3.12zM18.91 18.74h-3v-4.26c0-1.08-.43-1.58-1.22-1.58-.86 0-1.39.58-1.39 1.58v4.26h-3v-9h3v1.22a3.07 3.07 0 0 1 2.65-1.47c1.76 0 2.96 1.08 2.96 3.37v5.88z"/></svg>
                  Use LinkedIn
                </button>
              </div>
            </>
          )}

          <div className="auth-toggle">
            {isRegister ? (
              <p>Already have an account?&nbsp; <button className="toggle-link" onClick={() => { setIsRegister(false); setError('') }}>Sign in</button></p>
            ) : (
              <p>Don't have an account yet?&nbsp; <button className="toggle-link" onClick={() => { setIsRegister(true); setError('') }}>Sign up</button></p>
            )}
          </div>

          {!isRegister && (
            <p className="auth-demo-hint">
              Demo: {selectedRole === 'student' ? 'tirth@college.edu / student123' : 'priya@google.com / alumni123'}
            </p>
          )}
        </div>

        {/* ── Right: Gradient Panel ── */}
        <div className="auth-right">
          <div className="auth-right-inner" />
        </div>
      </div>
    </div>
  )
}
