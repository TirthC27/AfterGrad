import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, resume, initStore } from '../localStore'
import { parseResume } from '../resumeParser'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initStore()
    const saved = localStorage.getItem('aftergrad_student')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const persist = (profile) => {
    setUser(profile)
    localStorage.setItem('aftergrad_student', JSON.stringify(profile))
  }

  const register = async ({ name, email, password }) => {
    const data = auth.register({ name, email, password, role: 'student' })
    persist(data.profile)
    return data
  }

  const demoLogin = async (userId = 'student_001') => {
    const profile = auth.getProfile(userId)
    if (!profile) throw new Error('Demo user not found')
    persist(profile)
    return { profile }
  }

  const passwordLogin = async ({ email, password }) => {
    const data = auth.login(email, password)
    const profile = data.profile
    if (profile.role === 'student') {
      persist(profile)
    } else {
      localStorage.setItem('aftergrad_alumni', JSON.stringify(profile))
    }
    return { profile, role: profile.role }
  }

  const login = async ({ email }) => {
    const profiles = auth.searchProfiles('student')
    const found = profiles.find(p => p.email === email)
    if (!found) throw new Error('No student account with that email')
    persist(found)
    return { profile: found }
  }

  const verifyStudent = async ({ college, graduation_year, student_email }) => {
    const data = auth.verifyStudent(user.id, { college, graduation_year, student_email })
    if (data.verified) {
      persist({ ...user, student_verified: true, college, graduation_year: parseInt(graduation_year) })
    }
    return data
  }

  const completeOnboarding = async (onboardingData) => {
    const data = auth.completeOnboarding(user.id, onboardingData)
    persist({ ...user, ...data.profile, onboarding_completed: true })
    return data
  }

  const uploadResume = async (file) => {
    // Real extraction: read PDF/DOCX → extract text → match skills
    const parsed = await parseResume(file)
    const result = resume.save(user.id, file, parsed)
    // Refresh user state so skills are reflected immediately
    const updated = auth.getProfile(user.id)
    if (updated) persist(updated)
    return result
  }

  const refreshProfile = async () => {
    if (!user) return
    const profile = auth.getProfile(user.id)
    if (profile) persist(profile)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('aftergrad_student')
  }

  const needsVerification = user && user.role === 'student' && !user.student_verified
  const needsOnboarding = user && !user.onboarding_completed

  return (
    <AuthContext.Provider value={{
      user, loading, login, passwordLogin, register, demoLogin,
      verifyStudent, completeOnboarding, uploadResume,
      refreshProfile, logout,
      needsVerification, needsOnboarding,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
