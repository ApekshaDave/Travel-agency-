/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/apiClient'

const AuthContext = createContext(null)

const DEFAULT_AGENCIES = [
  { name: 'Star Voyages', regId: 'STAR-12' },
  { name: 'Blue Sky Travels', regId: 'BLUE-45' },
  { name: 'VoyageAI Direct', regId: 'VAI-101' }
]

const DEFAULT_STAFF = [
  { name: 'Agent Smith', email: 'agent@voyageai.com', password: 'password', agencyName: 'Star Voyages', position: 'Senior Agent' },
  { name: 'Sneha Iyer', email: 'sneha@voyageai.com', password: 'password', agencyName: 'VoyageAI Direct', position: 'Manager' }
]

// Seed databases if not present in localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('voyageai_registered_agencies')) {
    localStorage.setItem('voyageai_registered_agencies', JSON.stringify(DEFAULT_AGENCIES))
  }
  if (!localStorage.getItem('voyageai_registered_staff')) {
    localStorage.setItem('voyageai_registered_staff', JSON.stringify(DEFAULT_STAFF))
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('voyageai_user')
      return stored ? JSON.parse(stored) : null
    } catch (err) {
      console.error(err)
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('voyageai_jwt_token'))
  const [loading, setLoading] = useState(true)

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = localStorage.getItem('voyageai_jwt_token')
        if (!storedToken) {
          setLoading(false)
          return
        }
        const session = await api.request('/api/auth/session')
        if (session.user) {
          setUser(session.user)
          setToken(storedToken)
        }
      } catch (err) {
        localStorage.removeItem('voyageai_jwt_token')
        localStorage.removeItem('voyageai_user')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (email, password, options = {}) => {
    setLoading(true)
    try {
      const response = await api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, isStaffLogin: options.staff })
      })

      if (options.staff && response.user.role === 'user') {
        throw new Error('You are not registered as agent register yourself')
      }

      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('voyageai_jwt_token', response.token)
      localStorage.setItem('voyageai_user', JSON.stringify(response.user))
      return response.user
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password, name, options = {}) => {
    setLoading(true)
    try {
      const response = await api.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, ...options })
      })
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('voyageai_jwt_token', response.token)
      localStorage.setItem('voyageai_user', JSON.stringify(response.user))
      return response.user
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeProfileRegister = async (registrationDetails) => {
    setLoading(true)
    try {
      const response = await api.request('/api/auth/register-profile', {
        method: 'POST',
        body: JSON.stringify(registrationDetails)
      })

      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('voyageai_jwt_token', response.token)
      localStorage.setItem('voyageai_user', JSON.stringify(response.user))
      return response.user
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.request('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.warn("Logout request failed:", err)
    }
    localStorage.removeItem('voyageai_jwt_token')
    localStorage.removeItem('voyageai_user')
    setUser(null)
    setToken(null)
  }

  const signInWithOAuth = async (provider, intent = 'user') => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/auth/${provider}?intent=${intent}`
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, completeProfileRegister, logout, signInWithOAuth, isAuthenticated: !!user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
