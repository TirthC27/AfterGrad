import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Upload, FileText, Sparkles, CheckCircle } from 'lucide-react'
import { auth } from '../../localStore'
import './OnboardingPage.css'

const ALUMNI_MCQ = [
  { id: 'q1', question: 'How would you like to contribute?', options: ['Mentoring students', 'Guest lectures / Talks', 'Posting internships / Gigs', 'Donating to campaigns', 'All of the above'] },
  { id: 'q2', question: 'How many years of industry experience do you have?', options: ['1-3 years', '3-5 years', '5-10 years', '10+ years'] },
  { id: 'q3', question: 'How often can you mentor students?', options: ['Weekly', 'Bi-weekly', 'Monthly', 'Occasionally'] },
]

const INTEREST_OPTIONS = [
  'Mentoring', 'Career Guidance', 'Tech Talks', 'Networking',
  'Startup Ecosystem', 'Open Source', 'AI / ML', 'Web Development',
  'Cloud & DevOps', 'Product Management', 'Research', 'Finance & Fintech',
  'Hiring & Recruitment', 'Diversity & Inclusion', 'Social Impact', 'Workshops',
]

export default function OnboardingPage() {
  const { user, completeOnboarding, uploadResume } = useAuth()

  const [step, setStep] = useState(1) // 1: resume, 2: details, 3: MCQs, 4: interests
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Resume
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [resumeResult, setResumeResult] = useState(null)

  // Step 2: Details
  const [bio, setBio] = useState('')
  const [company, setCompany] = useState(user?.company || '')
  const [jobTitle, setJobTitle] = useState(user?.job_title || '')
  const [passoutYear, setPassoutYear] = useState(user?.passout_year || '')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [location, setLocation] = useState('')

  // Step 3: MCQ questions
  const [mcqQuestions, setMcqQuestions] = useState([])
  const [mcqAnswers, setMcqAnswers] = useState({})

  // Step 4: Interests
  const [interests, setInterests] = useState([])

  // Load MCQ questions
  useEffect(() => {
    setMcqQuestions(ALUMNI_MCQ)
  }, [])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  const handleUploadResume = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadResume(file)
      setResumeResult(result.extracted)
      // Auto-fill passout year if extracted
      if (result.extracted?.passout_year && !passoutYear) {
        setPassoutYear(result.extracted.passout_year)
      }
    } catch (err) {
      setError(err.message || 'Failed to parse resume')
    }
    setUploading(false)
  }

  const toggleInterest = (item) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      // Prepare MCQ answers
      let answers = undefined
      if (Object.keys(mcqAnswers).length > 0) {
        answers = mcqQuestions
          .filter(q => mcqAnswers[q.id])
          .map(q => ({
            question_id: q.id,
            question_text: q.question,
            selected_option: mcqAnswers[q.id],
          }))
      }

      await completeOnboarding({
        bio,
        interests,
        skills: resumeResult?.skills || undefined,
        answers,
        linkedin_url: linkedin,
        github_url: github,
        location,
        company,
        job_title: jobTitle,
        passout_year: passoutYear ? parseInt(passoutYear) : undefined,
      })
    } catch (err) {
      setError(err.message || 'Failed to save')
    }
    setLoading(false)
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Welcome, {user?.name?.split(' ')[0] || 'Alumni'}! 👋</h2>
        <p className="onboard-subtitle">Let's set up your alumni profile in 4 quick steps</p>

        <div className="steps-indicator">
          <div className={`step-dot ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`} />
          <div className={`step-dot ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`} />
          <div className={`step-dot ${step > 3 ? 'done' : step === 3 ? 'active' : ''}`} />
          <div className={`step-dot ${step === 4 ? 'active' : ''}`} />
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* ========== STEP 1: Resume ========== */}
        {step === 1 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>Upload Your Resume</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              We'll extract your skills, experience & passout year automatically
            </p>

            {!file && !resumeResult && (
              <div className="resume-upload-area">
                <div className="upload-icon">
                  <Upload size={24} color="var(--mint-500, #22c55e)" />
                </div>
                <h4>Drop your resume here</h4>
                <p>PDF or DOCX • Max 10MB</p>
                <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
              </div>
            )}

            {file && !resumeResult && (
              <>
                <div className="file-selected">
                  <div className="file-icon">
                    <FileText size={16} />
                  </div>
                  <div className="file-info">
                    <h5>{file.name}</h5>
                    <p>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button className="remove-file" onClick={() => setFile(null)}>×</button>
                </div>

                {uploading ? (
                  <div className="upload-progress">
                    <div className="spinner-small" />
                    <span>Analyzing your resume...</span>
                  </div>
                ) : (
                  <button className="auth-btn primary" onClick={handleUploadResume} style={{ width: '100%' }}>
                    <Sparkles size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Extract Skills from Resume
                  </button>
                )}
              </>
            )}

            {resumeResult && (
              <>
                <div className="auth-success" style={{ marginBottom: 16 }}>
                  <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Resume parsed successfully!
                </div>

                {(resumeResult.name || resumeResult.passout_year) && (
                  <div className="extracted-section">
                    {resumeResult.name && (
                      <div className="extracted-detail">
                        <span className="detail-label">Name</span>
                        <span className="detail-value">{resumeResult.name}</span>
                      </div>
                    )}
                    {resumeResult.passout_year && (
                      <div className="extracted-detail">
                        <span className="detail-label">Passout Year</span>
                        <span className="detail-value">{resumeResult.passout_year}</span>
                      </div>
                    )}
                  </div>
                )}

                {resumeResult.skills?.length > 0 && (
                  <div className="extracted-section">
                    <h4>
                      Skills Found <span className="count">{resumeResult.skills_count}</span>
                    </h4>
                    <div className="skill-tags">
                      {resumeResult.skills.map(s => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeResult.experience_summary && (
                  <div className="extracted-section">
                    <h4>Experience Summary</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {resumeResult.experience_summary}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="onboard-nav">
              <button className="auth-btn secondary" onClick={() => setStep(2)}>
                {resumeResult ? 'Next' : 'Skip for now'}
              </button>
              {resumeResult && (
                <button className="auth-btn primary" onClick={() => setStep(2)}>
                  Continue →
                </button>
              )}
            </div>
          </>
        )}

        {/* ========== STEP 2: Profile ========== */}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Your Professional Info</h3>

            <div className="auth-form">
              <div className="form-group">
                <label>Short Bio</label>
                <input type="text" placeholder="Senior Engineer at Google, passionate about mentoring"
                  value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" placeholder="Google, Amazon, Startup Name..."
                  value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" placeholder="Senior Software Engineer"
                  value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Passout Year</label>
                <select value={passoutYear} onChange={e => setPassoutYear(e.target.value)}>
                  <option value="">Select</option>
                  {Array.from({ length: 30 }, (_, i) => 2000 + i).map(y =>
                    <option key={y} value={y}>{y}</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Bangalore, India"
                  value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input type="url" placeholder="https://linkedin.com/in/..."
                  value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              </div>
              <div className="form-group">
                <label>GitHub URL (optional)</label>
                <input type="url" placeholder="https://github.com/..."
                  value={github} onChange={e => setGithub(e.target.value)} />
              </div>
            </div>

            <div className="onboard-nav">
              <button className="auth-btn secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="auth-btn primary" onClick={() => setStep(3)}>Continue →</button>
            </div>
          </>
        )}

        {/* ========== STEP 3: MCQ Questions ========== */}
        {step === 3 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>Quick Questions About You</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Help us personalize your experience
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {mcqQuestions.map((q, qi) => (
                <div key={q.id} style={{
                  padding: 16, borderRadius: 12,
                  background: 'rgba(34,197,94,0.03)',
                  border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #fff)', marginBottom: 12 }}>
                    {qi + 1}. {q.question}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setMcqAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        style={{
                          padding: '10px 14px', borderRadius: 10, border: '1px solid',
                          borderColor: mcqAnswers[q.id] === opt ? '#22c55e' : 'var(--glass-border, rgba(255,255,255,0.1))',
                          background: mcqAnswers[q.id] === opt ? 'rgba(34,197,94,0.15)' : 'transparent',
                          color: mcqAnswers[q.id] === opt ? '#22c55e' : 'var(--text-secondary, #ccc)',
                          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textAlign: 'left',
                          fontWeight: mcqAnswers[q.id] === opt ? 600 : 400,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="onboard-nav">
              <button className="auth-btn secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="auth-btn primary" onClick={() => setStep(4)}>Continue →</button>
            </div>
          </>
        )}

        {/* ========== STEP 4: Interests ========== */}
        {step === 4 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>What do you want to help with?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select areas where you'd like to mentor or contribute
            </p>

            <div className="interests-grid">
              {INTEREST_OPTIONS.map(item => (
                <button
                  key={item}
                  className={`interest-chip ${interests.includes(item) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="onboard-nav">
              <button className="auth-btn secondary" onClick={() => setStep(3)}>← Back</button>
              <button className="auth-btn primary" onClick={handleComplete} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
