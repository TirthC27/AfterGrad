/* ───────────────────────────────────────────────
   AfterGrad — localStorage Data Store
   Shared across student & alumni frontends.
   Everything runs 100% offline in the browser.
   ─────────────────────────────────────────────── */

// ─── helpers ────────────────────────────────────
const get = (key) => { try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null } }
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))
const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ─── SEED DATA ──────────────────────────────────
const SEED_PROFILES = [
  { id:'student_001', clerk_user_id:'student_001', role:'student', name:'Tirth Patel', email:'tirth@college.edu', password:'student123', college:'IIT Gandhinagar', graduation_year:2025, student_verified:true, onboarding_completed:true, skills:['React','Python','Machine Learning'], bio:'CS undergrad passionate about AI', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Tirth', location:'Gujarat, India', linkedin_url:'', github_url:'' },
  { id:'student_002', clerk_user_id:'student_002', role:'student', name:'Ananya Sharma', email:'ananya@college.edu', password:'student123', college:'BITS Pilani', graduation_year:2026, student_verified:true, onboarding_completed:true, skills:['JavaScript','Node.js','UI/UX'], bio:'Full-stack dev & design enthusiast', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', location:'Rajasthan, India', linkedin_url:'', github_url:'' },
  { id:'alumni_001', clerk_user_id:'alumni_001', role:'alumni', name:'Priya Mehta', email:'priya@google.com', password:'alumni123', company:'Google', job_title:'Senior SWE', passout_year:2018, onboarding_completed:true, skills:['System Design','Go','Kubernetes','Mentoring'], bio:'6 yrs at Google, love giving back', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', location:'Bangalore, India', linkedin_url:'https://linkedin.com/in/priyamehta', github_url:'https://github.com/priyamehta', verified:true },
  { id:'alumni_002', clerk_user_id:'alumni_002', role:'alumni', name:'Raj Kumar', email:'raj@microsoft.com', password:'alumni123', company:'Microsoft', job_title:'PM Lead', passout_year:2016, onboarding_completed:true, skills:['Product Management','Azure','Strategy'], bio:'Leading products at Microsoft', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj', location:'Hyderabad, India', linkedin_url:'', github_url:'', verified:true },
  { id:'alumni_003', clerk_user_id:'alumni_003', role:'alumni', name:'Sneha Iyer', email:'sneha@startup.io', password:'alumni123', company:'FinLeap', job_title:'CTO & Co-founder', passout_year:2017, onboarding_completed:true, skills:['Startups','React Native','Fundraising','Leadership'], bio:'Built and scaled 2 startups', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', location:'Mumbai, India', linkedin_url:'', github_url:'', verified:true },
  { id:'alumni_004', clerk_user_id:'alumni_004', role:'alumni', name:'Arun Nair', email:'arun@amazon.com', password:'alumni123', company:'Amazon', job_title:'Data Science Manager', passout_year:2015, onboarding_completed:true, skills:['Machine Learning','Python','Data Engineering','AWS'], bio:'Leading ML team at Amazon', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun', location:'Chennai, India', linkedin_url:'', github_url:'', verified:true },
]

const SEED_EVENTS = [
  { id:'evt_001', title:'AI & Career Paths', description:'Panel discussion on AI roles in tech industry with live Q&A', event_type:'online', start_time:'2026-03-15T10:00:00Z', end_time:'2026-03-15T12:00:00Z', venue_name:'Zoom Webinar', geo_lat:null, geo_lng:null, allow_requests:true, created_by:'alumni_001', alumni:[{id:'alumni_001',name:'Priya Mehta',company:'Google',job_title:'Senior SWE',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'}] },
  { id:'evt_002', title:'Resume Building Workshop', description:'Hands-on session to craft strong tech resumes with real examples', event_type:'online', start_time:'2026-03-20T14:00:00Z', end_time:'2026-03-20T16:00:00Z', venue_name:'Google Meet', geo_lat:null, geo_lng:null, allow_requests:true, created_by:'alumni_002', alumni:[{id:'alumni_002',name:'Raj Kumar',company:'Microsoft',job_title:'PM Lead',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj'}] },
  { id:'evt_003', title:'Startup Mixer Night', description:'Networking evening with founders and VCs. Food and drinks included!', event_type:'offline', start_time:'2026-04-05T18:00:00Z', end_time:'2026-04-05T21:00:00Z', venue_name:'WeWork BKC, Mumbai', geo_lat:19.0654, geo_lng:72.8688, allow_requests:true, created_by:'alumni_003', alumni:[{id:'alumni_003',name:'Sneha Iyer',company:'FinLeap',job_title:'CTO & Co-founder',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha'}] },
  { id:'evt_004', title:'Data Science Bootcamp', description:'Full-day bootcamp covering ML pipelines, feature engineering and deployments', event_type:'offline', start_time:'2026-04-12T09:00:00Z', end_time:'2026-04-12T17:00:00Z', venue_name:'IIT Campus Auditorium', geo_lat:23.2156, geo_lng:72.6369, allow_requests:true, created_by:'alumni_004', alumni:[{id:'alumni_004',name:'Arun Nair',company:'Amazon',job_title:'Data Science Manager',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun'}] },
  { id:'evt_005', title:'Open Source Hackathon', description:'48-hour hackathon to contribute to top open-source projects', event_type:'online', start_time:'2026-05-01T00:00:00Z', end_time:'2026-05-03T00:00:00Z', venue_name:'Discord', geo_lat:null, geo_lng:null, allow_requests:false, created_by:'alumni_001', alumni:[{id:'alumni_001',name:'Priya Mehta',company:'Google',job_title:'Senior SWE',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'},{id:'alumni_004',name:'Arun Nair',company:'Amazon',job_title:'Data Science Manager',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun'}] },
]

const SEED_EVENT_REQUESTS = [
  { id:'er_001', event_id:'evt_003', student_id:'student_001', alumni_id:'alumni_003', message:'Would love to attend the mixer!', status:'accepted', location_granted:true, created_at:'2026-02-01T10:00:00Z', granted_at:'2026-02-02T08:00:00Z', revoked_at:null },
  { id:'er_002', event_id:'evt_004', student_id:'student_001', alumni_id:'alumni_004', message:'Excited about the bootcamp', status:'pending', location_granted:false, created_at:'2026-02-05T10:00:00Z', granted_at:null, revoked_at:null },
]

const SEED_OFFERINGS = [
  { id:'off_001', alumni_id:'alumni_001', topic:'System Design Interview Prep', description:'1-on-1 coaching for FAANG system design rounds', duration:60, price:0, tags:['system-design','interviews','faang'], active:true, alumni:{id:'alumni_001',name:'Priya Mehta',company:'Google',job_title:'Senior SWE',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',verified:true} },
  { id:'off_002', alumni_id:'alumni_002', topic:'Product Management 101', description:'Learn how to break into PM roles at top companies', duration:45, price:0, tags:['product','career','strategy'], active:true, alumni:{id:'alumni_002',name:'Raj Kumar',company:'Microsoft',job_title:'PM Lead',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',verified:true} },
  { id:'off_003', alumni_id:'alumni_003', topic:'Startup Fundraising Guide', description:'How to pitch VCs, build decks and close rounds', duration:60, price:0, tags:['startups','fundraising','pitching'], active:true, alumni:{id:'alumni_003',name:'Sneha Iyer',company:'FinLeap',job_title:'CTO & Co-founder',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',verified:true} },
  { id:'off_004', alumni_id:'alumni_004', topic:'ML Career Roadmap', description:'Navigate your data science career from junior to lead', duration:30, price:0, tags:['machine-learning','career','data-science'], active:true, alumni:{id:'alumni_004',name:'Arun Nair',company:'Amazon',job_title:'Data Science Manager',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun',verified:true} },
  { id:'off_005', alumni_id:'alumni_001', topic:'Code Review & Best Practices', description:'Get your code reviewed by a Google engineer', duration:45, price:0, tags:['coding','best-practices','golang'], active:true, alumni:{id:'alumni_001',name:'Priya Mehta',company:'Google',job_title:'Senior SWE',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',verified:true} },
]

const SEED_MENTORSHIP_REQUESTS = [
  { id:'mr_001', student_id:'student_001', offering_id:'off_001', alumni_id:'alumni_001', note:'I have Google onsite next month, would love guidance', status:'accepted', created_at:'2026-01-15T10:00:00Z', responded_at:'2026-01-16T08:00:00Z', topic:'System Design Interview Prep', duration:60, student:{name:'Tirth Patel',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Tirth'}, alumni:{name:'Priya Mehta',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'} },
  { id:'mr_002', student_id:'student_002', offering_id:'off_003', alumni_id:'alumni_003', note:'Building a health-tech startup, need fundraising advice', status:'pending', created_at:'2026-02-01T10:00:00Z', responded_at:null, topic:'Startup Fundraising Guide', duration:60, student:{name:'Ananya Sharma',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya'}, alumni:{name:'Sneha Iyer',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha'} },
  { id:'mr_003', student_id:'student_001', offering_id:'off_004', alumni_id:'alumni_004', note:'Want to pivot from SWE to ML', status:'pending', created_at:'2026-02-03T10:00:00Z', responded_at:null, topic:'ML Career Roadmap', duration:30, student:{name:'Tirth Patel',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Tirth'}, alumni:{name:'Arun Nair',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun'} },
]

const SEED_SESSIONS = [
  { id:'sess_001', request_id:'mr_001', student_id:'student_001', alumni_id:'alumni_001', topic:'System Design Interview Prep', duration:60, status:'scheduled', scheduled_at:'2026-03-01T10:00:00Z', completed_at:null, alumni_completed:false, student_completed:false, student:{name:'Tirth Patel',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Tirth'}, alumni:{name:'Priya Mehta',avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',company:'Google'} },
]

const SEED_GIGS = [
  { id:'gig_001', title:'React Dashboard UI', company:'Google', description:'Build an internal analytics dashboard component with React and D3', gig_type:'project', stipend:15000, duration:'2 weeks', skills_required:['React','D3.js','TypeScript'], posted_by:'alumni_001', status:'open', created_at:'2026-01-20T00:00:00Z' },
  { id:'gig_002', title:'ML Model Benchmarking', company:'Amazon', description:'Benchmark and compare NLP models for text classification tasks', gig_type:'research', stipend:20000, duration:'3 weeks', skills_required:['Python','PyTorch','NLP'], posted_by:'alumni_004', status:'open', created_at:'2026-01-25T00:00:00Z' },
  { id:'gig_003', title:'Mobile App Testing Intern', company:'FinLeap', description:'QA testing for our React Native fintech app across platforms', gig_type:'internship', stipend:25000, duration:'1 month', skills_required:['React Native','Testing','Mobile'], posted_by:'alumni_003', status:'open', created_at:'2026-02-01T00:00:00Z' },
  { id:'gig_004', title:'Content Writing — Tech Blog', company:'Microsoft', description:'Write 5 technical blog posts about cloud computing and Azure services', gig_type:'project', stipend:8000, duration:'1 week', skills_required:['Technical Writing','Cloud','Azure'], posted_by:'alumni_002', status:'open', created_at:'2026-02-03T00:00:00Z' },
  { id:'gig_005', title:'Data Pipeline Intern', company:'Amazon', description:'Help build ETL pipelines using AWS Glue and Redshift', gig_type:'internship', stipend:30000, duration:'2 months', skills_required:['Python','AWS','SQL','ETL'], posted_by:'alumni_004', status:'open', created_at:'2026-02-05T00:00:00Z' },
]

const SEED_GIG_APPLICATIONS = [
  { id:'ga_001', gig_id:'gig_001', student_id:'student_001', status:'pending', note:'I have strong React experience', applied_at:'2026-02-01T00:00:00Z' },
]

const SEED_INVITATIONS = [
  { id:'inv_001', event_id:'evt_001', student_id:'student_001', alumni_id:'alumni_002', role:'speaker', message:'Would love you to speak about PM careers!', status:'pending', created_at:'2026-02-01T00:00:00Z', student:{name:'Tirth Patel'}, event:{title:'AI & Career Paths'} },
  { id:'inv_002', event_id:'evt_003', student_id:'student_002', alumni_id:'alumni_001', role:'judge', message:'Your expertise would be amazing', status:'accepted', created_at:'2026-01-28T00:00:00Z', student:{name:'Ananya Sharma'}, event:{title:'Startup Mixer Night'} },
]

const SEED_CAMPAIGNS = [
  { id:'camp_001', title:'Annual Scholarship Fund', description:'Help underprivileged students access quality education', category:'scholarship', goal:500000, raised:325000, donors:142, created_by:'alumni_001', image:'🎓', created_at:'2026-01-01T00:00:00Z' },
  { id:'camp_002', title:'Campus Lab Equipment', description:'Upgrade computer science lab with latest hardware', category:'infrastructure', goal:300000, raised:180000, donors:89, created_by:'alumni_002', image:'🔬', created_at:'2026-01-05T00:00:00Z' },
  { id:'camp_003', title:'Student Emergency Fund', description:'Emergency financial aid for students in crisis', category:'emergency', goal:200000, raised:95000, donors:67, created_by:'alumni_003', image:'🆘', created_at:'2026-01-10T00:00:00Z' },
  { id:'camp_004', title:'Hackathon Prize Pool', description:'Fund prizes for the upcoming inter-college hackathon', category:'events', goal:100000, raised:72000, donors:45, created_by:'alumni_001', image:'🏆', created_at:'2026-01-15T00:00:00Z' },
  { id:'camp_005', title:'Library Digitalization', description:'Convert physical archives to digital format', category:'infrastructure', goal:150000, raised:20000, donors:18, created_by:'alumni_004', image:'📚', created_at:'2026-02-01T00:00:00Z' },
  { id:'camp_006', title:'Sports Complex Renovation', description:'Modernize the sports facilities and add new courts', category:'infrastructure', goal:800000, raised:410000, donors:203, created_by:'alumni_002', image:'⚽', created_at:'2025-12-15T00:00:00Z' },
]

const SEED_DONATIONS = [
  { id:'don_001', campaign_id:'camp_001', donor_id:'student_001', amount:500, donor_name:'Tirth Patel', created_at:'2026-02-01T00:00:00Z' },
]

const SEED_LINEAGE = [
  { id:'lin_001', alumni_id:'alumni_001', student_id:'student_001', relationship:'mentor', since:'2026-01-15T00:00:00Z' },
]

const SEED_ONBOARDING = []

// ─── INIT: seed once ────────────────────────────
export function initStore() {
  if (get('ag_seeded')) return
  set('ag_profiles', SEED_PROFILES)
  set('ag_events', SEED_EVENTS)
  set('ag_event_requests', SEED_EVENT_REQUESTS)
  set('ag_offerings', SEED_OFFERINGS)
  set('ag_mentorship_requests', SEED_MENTORSHIP_REQUESTS)
  set('ag_sessions', SEED_SESSIONS)
  set('ag_gigs', SEED_GIGS)
  set('ag_gig_applications', SEED_GIG_APPLICATIONS)
  set('ag_invitations', SEED_INVITATIONS)
  set('ag_campaigns', SEED_CAMPAIGNS)
  set('ag_donations', SEED_DONATIONS)
  set('ag_lineage', SEED_LINEAGE)
  set('ag_onboarding', SEED_ONBOARDING)
  set('ag_seeded', true)
  console.log('[AfterGrad] 🌱 localStorage seeded with demo data')
}

// Call on import
initStore()

// ─── generic helpers ────────────────────────────
const getAll    = (key) => get(key) || []
const getById   = (key, id) => getAll(key).find(x => x.id === id) || null
const add       = (key, item) => { const arr = getAll(key); arr.push(item); set(key, arr); return item }
const update    = (key, id, patch) => { const arr = getAll(key); const i = arr.findIndex(x => x.id === id); if(i>=0){ arr[i]={...arr[i],...patch}; set(key,arr); return arr[i] } return null }
const remove    = (key, id) => { set(key, getAll(key).filter(x => x.id !== id)) }

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
export const auth = {
  login(email, password) {
    const profiles = getAll('ag_profiles')
    const profile = profiles.find(p => p.email === email)
    if (!profile) throw new Error('No account found with that email')
    if (profile.password !== password) throw new Error('Incorrect password')
    console.log(`[Auth] ✅ Login: ${profile.name} (${profile.role})`)
    return { profile, needs_onboarding: !profile.onboarding_completed, needs_verification: profile.role === 'student' && !profile.student_verified }
  },

  register({ name, email, password, role }) {
    const profiles = getAll('ag_profiles')
    if (profiles.find(p => p.email === email)) throw new Error('Email already registered')
    const profile = {
      id: uid(role), clerk_user_id: uid(role), role, name, email, password,
      onboarding_completed: false, student_verified: false,
      skills: [], bio: '', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g,'')}`,
      college: '', graduation_year: null, location: '', company: '', job_title: '', passout_year: null,
      linkedin_url: '', github_url: '',
    }
    add('ag_profiles', profile)
    console.log(`[Auth] 📝 Registered: ${name} as ${role}`)
    return { profile }
  },

  verifyStudent(userId, { college, graduation_year, student_email }) {
    const profile = update('ag_profiles', userId, { student_verified: true, college, graduation_year: parseInt(graduation_year) })
    console.log(`[Auth] 🎓 Verified student: ${profile?.name}`)
    return { verified: true }
  },

  completeOnboarding(userId, data) {
    const patch = { onboarding_completed: true }
    // Use provided skills, or keep existing profile skills
    if (data.skills) {
      patch.skills = data.skills
    } else {
      const existing = getById('ag_profiles', userId)
      if (existing?.skills?.length) patch.skills = existing.skills
    }
    if (data.bio) patch.bio = data.bio
    if (data.company) patch.company = data.company
    if (data.job_title) patch.job_title = data.job_title
    if (data.passout_year) patch.passout_year = data.passout_year
    if (data.experience) patch.experience = data.experience
    if (data.interests) patch.interests = data.interests
    if (data.linkedin_url !== undefined) patch.linkedin_url = data.linkedin_url
    if (data.github_url !== undefined) patch.github_url = data.github_url
    if (data.location) patch.location = data.location
    if (data.college) patch.college = data.college
    if (data.graduation_year) patch.graduation_year = data.graduation_year
    const profile = update('ag_profiles', userId, patch)
    // Save onboarding answers
    if (data.answers) {
      add('ag_onboarding', { id: uid('onb'), user_id: userId, answers: data.answers, created_at: new Date().toISOString() })
    }
    console.log(`[Auth] 🎉 Onboarding complete: ${profile?.name}`)
    return { profile }
  },

  getProfile(userId) {
    return getById('ag_profiles', userId)
  },

  updateProfile(userId, patch) {
    const profile = update('ag_profiles', userId, patch)
    console.log(`[Auth] ✏️ Profile updated: ${profile?.name}`)
    return profile
  },

  searchProfiles(role) {
    const all = getAll('ag_profiles')
    return role ? all.filter(p => p.role === role) : all
  },
}

// ═══════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════
export const events = {
  getAll() { return getAll('ag_events') },

  getById(id) { return getById('ag_events', id) },

  create(data) {
    const creator = getById('ag_profiles', data.created_by)
    const event = {
      id: uid('evt'), ...data,
      alumni: creator ? [{ id: creator.id, name: creator.name, company: creator.company, job_title: creator.job_title, avatar: creator.avatar }] : [],
    }
    add('ag_events', event)
    console.log(`[Events] 📅 Created: "${event.title}" by ${creator?.name}`)
    return event
  },

  // Location request
  getRequestStatus(eventId, studentId) {
    const reqs = getAll('ag_event_requests')
    const r = reqs.find(x => x.event_id === eventId && x.student_id === studentId)
    if (!r) return { status: null }
    return { status: r.status, alumni_id: r.alumni_id, request_id: r.id }
  },

  getLocation(eventId, studentId) {
    const reqs = getAll('ag_event_requests')
    const r = reqs.find(x => x.event_id === eventId && x.student_id === studentId && x.status === 'accepted')
    if (!r) return { access_granted: false }
    const evt = getById('ag_events', eventId)
    return { access_granted: true, geo_lat: evt?.geo_lat, geo_lng: evt?.geo_lng, granted_at: r.granted_at }
  },

  sendRequest({ event_id, student_id, alumni_id, message }) {
    const req = { id: uid('er'), event_id, student_id, alumni_id, message, status: 'pending', location_granted: false, created_at: new Date().toISOString(), granted_at: null, revoked_at: null }
    // Add student name & event title for display
    const student = getById('ag_profiles', student_id)
    const event = getById('ag_events', event_id)
    req.student_name = student?.name
    req.event_title = event?.title
    req.alumni_avatar = getById('ag_profiles', alumni_id)?.avatar
    req.alumni_name = getById('ag_profiles', alumni_id)?.name
    req.alumni_company = getById('ag_profiles', alumni_id)?.company
    add('ag_event_requests', req)
    console.log(`[Events] 📨 Location request: ${student?.name} → event ${event?.title}`)
    return req
  },

  getStudentRequests(studentId) {
    return getAll('ag_event_requests').filter(r => r.student_id === studentId).map(r => {
      const evt = getById('ag_events', r.event_id)
      const alumni = getById('ag_profiles', r.alumni_id)
      return { ...r, event_title: evt?.title, alumni_name: alumni?.name, alumni_company: alumni?.company, alumni_avatar: alumni?.avatar }
    })
  },

  getAlumniRequests(alumniId) {
    return getAll('ag_event_requests').filter(r => r.alumni_id === alumniId || getAll('ag_events').find(e => e.id === r.event_id && e.created_by === alumniId)).map(r => {
      const student = getById('ag_profiles', r.student_id)
      const evt = getById('ag_events', r.event_id)
      return { ...r, student_name: student?.name, event_title: evt?.title }
    })
  },

  acceptRequest(reqId) {
    const req = update('ag_event_requests', reqId, { status: 'accepted', location_granted: true, granted_at: new Date().toISOString() })
    console.log(`[Events] ✅ Request accepted: ${reqId}`)
    return req
  },

  rejectRequest(reqId) {
    const req = update('ag_event_requests', reqId, { status: 'rejected' })
    console.log(`[Events] ❌ Request rejected: ${reqId}`)
    return req
  },

  revokeRequest(reqId) {
    const req = update('ag_event_requests', reqId, { status: 'revoked', location_granted: false, revoked_at: new Date().toISOString() })
    console.log(`[Events] 🔒 Access revoked: ${reqId}`)
    return req
  },
}

// ═══════════════════════════════════════════════
// MENTORSHIP
// ═══════════════════════════════════════════════
export const mentorship = {
  getOfferings() { return getAll('ag_offerings').filter(o => o.active) },

  getAlumniOfferings(alumniId) { return getAll('ag_offerings').filter(o => o.alumni_id === alumniId) },

  createOffering(data) {
    const alumni = getById('ag_profiles', data.alumni_id)
    const offering = {
      id: uid('off'), ...data, active: true,
      alumni: alumni ? { id: alumni.id, name: alumni.name, company: alumni.company, job_title: alumni.job_title, avatar: alumni.avatar, verified: true } : {},
    }
    add('ag_offerings', offering)
    console.log(`[Mentorship] 📚 New offering: "${offering.topic}" by ${alumni?.name}`)
    return offering
  },

  toggleOffering(offeringId) {
    const off = getById('ag_offerings', offeringId)
    if (off) update('ag_offerings', offeringId, { active: !off.active })
    console.log(`[Mentorship] 🔄 Toggled offering: ${offeringId}`)
    return off
  },

  createRequest({ student_id, offering_id, note }) {
    const offering = getById('ag_offerings', offering_id)
    const student = getById('ag_profiles', student_id)
    const req = {
      id: uid('mr'), student_id, offering_id, alumni_id: offering?.alumni_id,
      note, status: 'pending', created_at: new Date().toISOString(), responded_at: null,
      topic: offering?.topic, duration: offering?.duration,
      student: { name: student?.name, avatar: student?.avatar },
      alumni: { name: offering?.alumni?.name, avatar: offering?.alumni?.avatar },
    }
    add('ag_mentorship_requests', req)
    console.log(`[Mentorship] 🙋 Request: ${student?.name} → "${offering?.topic}"`)
    return req
  },

  getStudentRequests(studentId) { return getAll('ag_mentorship_requests').filter(r => r.student_id === studentId) },
  getAlumniRequests(alumniId) { return getAll('ag_mentorship_requests').filter(r => r.alumni_id === alumniId) },

  acceptRequest(reqId) {
    const req = update('ag_mentorship_requests', reqId, { status: 'accepted', responded_at: new Date().toISOString() })
    // Create session automatically
    if (req) {
      const session = {
        id: uid('sess'), request_id: reqId, student_id: req.student_id, alumni_id: req.alumni_id,
        topic: req.topic, duration: req.duration, status: 'scheduled',
        scheduled_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        completed_at: null, alumni_completed: false, student_completed: false,
        student: req.student, alumni: { ...req.alumni, company: getById('ag_profiles', req.alumni_id)?.company },
      }
      add('ag_sessions', session)
      console.log(`[Mentorship] ✅ Request accepted + session created: ${reqId}`)
    }
    return req
  },

  rejectRequest(reqId) {
    update('ag_mentorship_requests', reqId, { status: 'rejected', responded_at: new Date().toISOString() })
    console.log(`[Mentorship] ❌ Request rejected: ${reqId}`)
  },

  cancelRequest(reqId) {
    update('ag_mentorship_requests', reqId, { status: 'cancelled', responded_at: new Date().toISOString() })
    console.log(`[Mentorship] 🚫 Request cancelled: ${reqId}`)
  },

  getSessions(userId) { return getAll('ag_sessions').filter(s => s.student_id === userId || s.alumni_id === userId) },
  getStudentSessions(studentId) { return getAll('ag_sessions').filter(s => s.student_id === studentId) },
  getAlumniSessions(alumniId) { return getAll('ag_sessions').filter(s => s.alumni_id === alumniId) },

  completeSessionStudent(sessionId) {
    const sess = getById('ag_sessions', sessionId)
    if (!sess) return
    const patch = { student_completed: true }
    if (sess.alumni_completed) { patch.status = 'completed'; patch.completed_at = new Date().toISOString() }
    else { patch.status = 'awaiting_completion' }
    update('ag_sessions', sessionId, patch)
    console.log(`[Mentorship] ✅ Student marked session complete: ${sessionId}`)
  },

  completeSessionAlumni(sessionId) {
    const sess = getById('ag_sessions', sessionId)
    if (!sess) return
    const patch = { alumni_completed: true }
    if (sess.student_completed) { patch.status = 'completed'; patch.completed_at = new Date().toISOString() }
    else { patch.status = 'awaiting_completion' }
    update('ag_sessions', sessionId, patch)
    console.log(`[Mentorship] ✅ Alumni marked session complete: ${sessionId}`)
  },
}

// ═══════════════════════════════════════════════
// GIGS
// ═══════════════════════════════════════════════
export const gigs = {
  getAll() { return getAll('ag_gigs') },

  create(data) {
    const gig = { id: uid('gig'), ...data, status: 'open', created_at: new Date().toISOString() }
    add('ag_gigs', gig)
    console.log(`[Gigs] 💼 Created: "${gig.title}"`)
    return gig
  },

  apply({ gig_id, student_id, note }) {
    const app = { id: uid('ga'), gig_id, student_id, note, status: 'pending', applied_at: new Date().toISOString() }
    add('ag_gig_applications', app)
    const gig = getById('ag_gigs', gig_id)
    console.log(`[Gigs] 📩 Application: student → "${gig?.title}"`)
    return app
  },

  getApplications(gigId) { return getAll('ag_gig_applications').filter(a => a.gig_id === gigId) },
  getStudentApplications(studentId) { return getAll('ag_gig_applications').filter(a => a.student_id === studentId) },
}

// ═══════════════════════════════════════════════
// DONATIONS
// ═══════════════════════════════════════════════
export const donations = {
  getCampaigns() { return getAll('ag_campaigns') },

  donate({ campaign_id, donor_id, amount, donor_name }) {
    const don = { id: uid('don'), campaign_id, donor_id, amount: Number(amount), donor_name, created_at: new Date().toISOString() }
    add('ag_donations', don)
    // Update campaign raised amount
    const camp = getById('ag_campaigns', campaign_id)
    if (camp) {
      update('ag_campaigns', campaign_id, { raised: camp.raised + Number(amount), donors: camp.donors + 1 })
    }
    console.log(`[Donations] 💰 ${donor_name} donated ₹${amount} to "${camp?.title}"`)
    return don
  },

  getCampaignDonations(campaignId) { return getAll('ag_donations').filter(d => d.campaign_id === campaignId) },

  createCampaign(data) {
    const camp = { id: uid('camp'), ...data, raised: 0, donors: 0, created_at: new Date().toISOString() }
    add('ag_campaigns', camp)
    console.log(`[Donations] 🎯 New campaign: "${camp.title}"`)
    return camp
  },
}

// ═══════════════════════════════════════════════
// INVITATIONS (student invites alumni to event)
// ═══════════════════════════════════════════════
export const invitations = {
  create({ event_id, student_id, alumni_id, role, message }) {
    const student = getById('ag_profiles', student_id)
    const event = getById('ag_events', event_id)
    const inv = {
      id: uid('inv'), event_id, student_id, alumni_id, role, message, status: 'pending',
      created_at: new Date().toISOString(),
      student: { name: student?.name }, event: { title: event?.title },
      alumni_name: getById('ag_profiles', alumni_id)?.name,
    }
    add('ag_invitations', inv)
    console.log(`[Invitations] ✉️ ${student?.name} invited alumni to "${event?.title}" as ${role}`)
    return inv
  },

  getForAlumni(alumniId) { return getAll('ag_invitations').filter(i => i.alumni_id === alumniId) },
  getForStudent(studentId) { return getAll('ag_invitations').filter(i => i.student_id === studentId) },
  getForEvent(eventId) { return getAll('ag_invitations').filter(i => i.event_id === eventId) },

  accept(invId) {
    update('ag_invitations', invId, { status: 'accepted' })
    console.log(`[Invitations] ✅ Accepted: ${invId}`)
  },

  decline(invId) {
    update('ag_invitations', invId, { status: 'declined' })
    console.log(`[Invitations] ❌ Declined: ${invId}`)
  },
}

// ═══════════════════════════════════════════════
// LINEAGE
// ═══════════════════════════════════════════════
export const lineage = {
  getForStudent(studentId) {
    return getAll('ag_lineage').filter(l => l.student_id === studentId).map(l => ({
      ...l, alumni: getById('ag_profiles', l.alumni_id),
    }))
  },
  getForAlumni(alumniId) {
    return getAll('ag_lineage').filter(l => l.alumni_id === alumniId).map(l => ({
      ...l, student: getById('ag_profiles', l.student_id),
    }))
  },
}

// ═══════════════════════════════════════════════
// RESUME (real PDF/DOCX parsing via resumeParser)
// ═══════════════════════════════════════════════

export const resume = {
  /** @param {string} userId  @param {File} file  @param {object} parsed — result from parseResume() */
  save(userId, file, parsed) {
    const profile = getById('ag_profiles', userId)
    const skills = parsed.skills?.length ? parsed.skills : (profile?.skills || [])

    const extracted = {
      name: parsed.name || profile?.name || 'User',
      skills,
      skills_count: skills.length,
      passout_year: parsed.passout_year || profile?.graduation_year || profile?.passout_year || null,
      experience_summary: parsed.experience_summary || '',
    }

    const patch = { resume_uploaded: true, resume_file: file.name, skills }
    if (parsed.name) patch.name = parsed.name
    if (parsed.passout_year) {
      if (profile?.role === 'alumni') patch.passout_year = parsed.passout_year
      else patch.graduation_year = parsed.passout_year
    }
    update('ag_profiles', userId, patch)

    console.log(`[Resume] 📄 Parsed ${file.name} for ${userId} — ${skills.length} skills found:`, skills)
    return { extracted }
  },
}

export default { auth, events, mentorship, gigs, donations, invitations, lineage, resume, initStore }
