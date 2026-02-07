import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Upload, FileText, Sparkles, CheckCircle } from 'lucide-react'
import { auth } from '../../localStore'
import './OnboardingPage.css'

const STUDENT_MCQ = [
  { id: 'q1', question: 'What is your primary career interest?', options: ['Software Engineering', 'Data Science / ML', 'Product Management', 'Design / UX', 'Research / Academia'] },
  { id: 'q2', question: 'How do you prefer to learn new skills?', options: ['Online courses', 'Building projects', 'Reading documentation', 'Mentorship', 'Hackathons'] },
  { id: 'q3', question: 'What stage is your career at?', options: ['Just exploring', 'Looking for internships', 'Preparing for placements', 'Planning higher studies', 'Working on a startup'] },
]

const INTEREST_OPTIONS = [
  'Web Development', 'Mobile Apps', 'AI / ML', 'Data Science',
  'Cloud & DevOps', 'Cybersecurity', 'Product Management', 'UI/UX Design',
  'Blockchain', 'Open Source', 'Startups', 'Research',
  'Competitive Programming', 'Game Development', 'IoT', 'Finance & Fintech',
]

export default function OnboardingPage() {
  const { user, completeOnboarding, uploadResume } = useAuth()

  const [step, setStep] = useState(1) // 1: resume, 2: details, 3: MCQ, 4: interests → done
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Resume
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [resumeResult, setResumeResult] = useState(null)

  // Step 2: Details
  const [bio, setBio] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [location, setLocation] = useState('')
  const [college, setCollege] = useState(user?.college || '')
  const [graduationYear, setGraduationYear] = useState(user?.graduation_year || '')

  // Step 3: MCQ
  const [mcqQuestions, setMcqQuestions] = useState([])
  const [mcqAnswers, setMcqAnswers] = useState({})
  const [mcqLoading, setMcqLoading] = useState(false)

  // Step 4: Interests
  const [interests, setInterests] = useState([])

  // Fetch MCQ questions when reaching step 3
  useEffect(() => {
    if (step === 3 && mcqQuestions.length === 0) {
      setMcqLoading(true)
      setMcqQuestions(STUDENT_MCQ)
      setMcqLoading(false)
    }
  }, [step])

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
        answers = mcqQuestions.map(q => ({
          question_id: q.id,
          question_text: q.question,
          selected_option: mcqAnswers[q.id] || '',
        })).filter(a => a.selected_option)
      }

      await completeOnboarding({
        bio,
        interests,
        skills: resumeResult?.skills || undefined,
        answers,
        linkedin_url: linkedin,
        github_url: github,
        location,
        college,
        graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
      })
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding')
    }
    setLoading(false)
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Welcome, {user?.name?.split(' ')[0] || 'Student'}! 👋</h2>
        <p className="onboard-subtitle">Let's set up your profile in 4 quick steps</p>

        <div className="steps-indicator">
          <div className={`step-dot ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`} />
          <div className={`step-dot ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`} />
          <div className={`step-dot ${step > 3 ? 'done' : step === 3 ? 'active' : ''}`} />
          <div className={`step-dot ${step === 4 ? 'active' : ''}`} />
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* ========== STEP 1: Resume Upload ========== */}
        {step === 1 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>Upload Your Resume</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              We'll extract your skills, experience, and more automatically
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
                    <span>Analyzing your resume with AI...</span>
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

                {resumeResult.name && (
                  <div className="extracted-section">
                    <div className="extracted-detail">
                      <span className="detail-label">Name detected</span>
                      <span className="detail-value">{resumeResult.name}</span>
                    </div>
                    {resumeResult.passout_year && (
                      <div className="extracted-detail">
                        <span className="detail-label">Graduation Year</span>
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

        {/* ========== STEP 2: Profile Details ========== */}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Tell us about yourself</h3>

            <div className="auth-form">
              <div className="form-group">
                <label>Short Bio</label>
                <input type="text" placeholder="CS student passionate about AI and open source"
                  value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <div className="form-group">
                <label>College / University</label>
                <input type="text" placeholder="IIT Bombay, MIT..."
                  value={college} onChange={e => setCollege(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)}>
                  <option value="">Select</option>
                  {[2024,2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Mumbai, India" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input type="url" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input type="url" placeholder="https://github.com/..." value={github} onChange={e => setGithub(e.target.value)} />
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
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>Quick Questions</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Help us personalize your experience with a few quick questions
            </p>

            {mcqLoading ? (
              <div style={{ textAlign: 'center', padding: 30 }}>
                <div className="spinner-small" />
                <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>Loading questions...</p>
              </div>
            ) : (
              <div className="mcq-questions">
                {mcqQuestions.map((q, idx) => (
                  <div key={q.id} className="mcq-block">
                    <h4 className="mcq-q-title">{idx + 1}. {q.question}</h4>
                    <div className="mcq-options">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          className={`mcq-option ${mcqAnswers[q.id] === opt ? 'selected' : ''}`}
                          onClick={() => setMcqAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        >
                          <span className="mcq-radio">{mcqAnswers[q.id] === opt ? '●' : '○'}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="onboard-nav">
              <button className="auth-btn secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="auth-btn primary" onClick={() => setStep(4)}>Continue →</button>
            </div>
          </>
        )}

        {/* ========== STEP 4: Interests ========== */}
        {step === 4 && (
          <>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>What are you interested in?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select topics to get personalized mentor & event recommendations
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
