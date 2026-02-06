import React, { useState, useRef } from 'react'
import './MicroGigs.css'

const GIGS = [
  {
    id: 'gig_001',
    title: 'Frontend Intern — React Dashboard',
    company: 'Google',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg',
    logoFallback: 'G',
    type: 'Internship',
    duration: '3 months',
    stipend: '₹40,000/mo',
    location: 'Bangalore (Hybrid)',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    posted: '2 days ago',
    applicants: 42,
    description: 'Build internal dashboards for the Google Cloud Platform team. Work with senior engineers on production-grade React applications.',
    urgent: true,
  },
  {
    id: 'gig_002',
    title: 'Backend Engineering Intern',
    company: 'Amazon',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg',
    logoFallback: 'A',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹50,000/mo',
    location: 'Hyderabad (On-site)',
    skills: ['Python', 'AWS', 'DynamoDB', 'FastAPI'],
    posted: '5 days ago',
    applicants: 87,
    description: 'Join the AWS Lambda team to build scalable microservices. Work on distributed systems handling millions of requests per second.',
    urgent: false,
  },
  {
    id: 'gig_003',
    title: 'UI/UX Design Intern',
    company: 'Microsoft',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg',
    logoFallback: 'M',
    type: 'Internship',
    duration: '4 months',
    stipend: '₹35,000/mo',
    location: 'Remote',
    skills: ['Figma', 'Design Systems', 'Prototyping'],
    posted: '1 day ago',
    applicants: 31,
    description: 'Design user interfaces for Microsoft Teams features. Collaborate with PMs and engineers to ship polished experiences to millions.',
    urgent: true,
  },
  {
    id: 'gig_004',
    title: 'Data Science Research Intern',
    company: 'Flipkart',
    logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/flipkart.svg',
    logoFallback: 'F',
    type: 'Internship',
    duration: '3 months',
    stipend: '₹30,000/mo',
    location: 'Bangalore (On-site)',
    skills: ['Python', 'ML', 'Pandas', 'TensorFlow'],
    posted: '1 week ago',
    applicants: 65,
    description: 'Build recommendation models for product discovery. Use large-scale datasets to improve search relevance and personalization.',
    urgent: false,
  },
  {
    id: 'gig_005',
    title: 'DevOps Intern — CI/CD Pipeline',
    company: 'Razorpay',
    logo: '',
    logoFallback: 'R',
    type: 'Micro Gig',
    duration: '6 weeks',
    stipend: '₹25,000/mo',
    location: 'Remote',
    skills: ['Docker', 'GitHub Actions', 'Kubernetes'],
    posted: '3 days ago',
    applicants: 18,
    description: 'Set up automated CI/CD pipelines for microservices. Containerize applications and deploy to Kubernetes clusters.',
    urgent: false,
  },
  {
    id: 'gig_006',
    title: 'Mobile Dev Intern — Flutter',
    company: 'CRED',
    logo: '',
    logoFallback: 'C',
    type: 'Internship',
    duration: '4 months',
    stipend: '₹45,000/mo',
    location: 'Bangalore (Hybrid)',
    skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
    posted: '4 days ago',
    applicants: 53,
    description: 'Build premium mobile experiences for the CRED app. Work on performance optimization and new feature development.',
    urgent: true,
  },
]

export default function MicroGigs() {
  const [selectedGig, setSelectedGig] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const cardRefs = useRef([])

  const filtered = typeFilter === 'all' ? GIGS : GIGS.filter(g => g.type === typeFilter)

  const handleMouseMove = (e, idx) => {
    const card = cardRefs.current[idx]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8
    card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`
  }
  const handleMouseLeave = (idx) => {
    const card = cardRefs.current[idx]
    if (card) card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0)'
  }

  return (
    <div className="gigs-page">
      <div className="gigs-header">
        <div>
          <h1 className="gigs-title">Micro Gigs & Internships</h1>
          <p className="gigs-subtitle">Curated opportunities from alumni companies. Apply with one click.</p>
        </div>
      </div>

      <div className="gigs-filters">
        {['all', 'Internship', 'Micro Gig'].map(t => (
          <button key={t} className={`gf-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? '🔥 All' : t === 'Internship' ? '🎓 Internships' : '⚡ Micro Gigs'}
          </button>
        ))}
      </div>

      <div className="gigs-grid">
        {filtered.map((gig, idx) => (
          <div
            key={gig.id}
            className={`gig-card ${selectedGig === gig.id ? 'expanded' : ''}`}
            ref={el => (cardRefs.current[idx] = el)}
            style={{ animationDelay: `${idx * 100}ms` }}
            onMouseMove={e => handleMouseMove(e, idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
            onClick={() => setSelectedGig(selectedGig === gig.id ? null : gig.id)}
          >
            {/* Glow effect */}
            <div className="gig-glow" />

            {gig.urgent && <div className="gig-urgent-badge">🔥 Urgent</div>}

            <div className="gig-card-top">
              <div className="gig-company-logo">
                {gig.logoFallback}
              </div>
              <div className="gig-top-info">
                <span className="gig-company">{gig.company}</span>
                <span className="gig-type-tag">{gig.type}</span>
              </div>
            </div>

            <h3 className="gig-title">{gig.title}</h3>

            <div className="gig-meta-row">
              <span className="gig-meta">📍 {gig.location}</span>
              <span className="gig-meta">⏱ {gig.duration}</span>
            </div>

            <div className="gig-stipend-row">
              <span className="gig-stipend">{gig.stipend}</span>
              <span className="gig-posted">{gig.posted}</span>
            </div>

            <div className="gig-skills">
              {gig.skills.map(s => <span key={s} className="gig-skill">{s}</span>)}
            </div>

            {selectedGig === gig.id && (
              <div className="gig-expanded-content">
                <p className="gig-description">{gig.description}</p>
                <div className="gig-applicants">👥 {gig.applicants} applicants</div>
                <button className="gig-apply-btn" onClick={e => { e.stopPropagation(); alert('Application sent!') }}>
                  Apply Now →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
