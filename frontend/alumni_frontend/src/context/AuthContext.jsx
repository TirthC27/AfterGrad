import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, resume as resumeStore, initStore } from '../localStore'
import { parseResume } from '../resumeParser'

initStore()

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('aftergrad_alumni')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const persist = (profile) => {
    setUser(profile)
    localStorage.setItem('aftergrad_alumni', JSON.stringify(profile))
  }

  const register = ({ name, email }) => {
    const res = auth.register({ name, email, role: 'alumni', password: 'alumni123' })
    persist(res.profile)
    return res
  }

  const demoLogin = (userId = 'alumni_001') => {
    const profile = auth.getProfile(userId)
    if (!profile) throw new Error('Demo user not found')
    persist(profile)
    return { profile }
  }

  const passwordLogin = ({ email, password }) => {
    const res = auth.login(email, password)
    if (!res) throw new Error('Invalid email or password')
    const profile = res.profile
    if (profile.role === 'alumni') {
      persist(profile)
    } else {
      localStorage.setItem('aftergrad_student', JSON.stringify(profile))
    }
    return { profile, role: profile.role }
  }

  const login = ({ email }) => {
    const all = auth.searchProfiles('alumni')
    const found = all.find(p => p.email === email)
    if (!found) throw new Error('No alumni account with that email')
    persist(found)
    return { profile: found }
  }

  const completeOnboarding = (onboardingData) => {
    const result = auth.completeOnboarding(user.id, onboardingData)
    persist(result.profile)
    return result
  }

  const uploadResume = async (file) => {
    const parsed = await parseResume(file)
    const result = resumeStore.save(user.id, file, parsed)
    const updated = auth.getProfile(user.id)
    if (updated) persist(updated)
    return result
  }

  const refreshProfile = () => {
    if (!user) return
    const profile = auth.getProfile(user.id)
    if (profile) persist(profile)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('aftergrad_alumni')
  }

  const needsOnboarding = user && !user.onboarding_completed

  return (
    <AuthContext.Provider value={{
      user, loading, login, passwordLogin, register, demoLogin,
      completeOnboarding, uploadResume,
      refreshProfile, logout,
      needsOnboarding,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
