/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/apiClient'

const AuthContext = createContext(null)

function parseStoredUser(raw) {
  try {
    const u = JSON.parse(raw)
    if (!u) return null
    if (!u.user_metadata) {
      u.user_metadata = { full_name: u.name || '', email: u.email || '' }
    }
    return u
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() =>
    parseStoredUser(localStorage.getItem('voyageai_user'))
  )
  const [token, setToken] = useState(() => localStorage.getItem('voyageai_jwt_token'))
  const [loading, setLoading] = useState(() => !localStorage.getItem('voyageai_user'))
  const loadingRef = useRef(loading)

  const setUser = useCallback((u) => {
    if (!u) { setUserState(null); return }
    const enriched = {
      ...u,
      user_metadata: u.user_metadata || { full_name: u.name || '', email: u.email || '' }
    }
    setUserState(enriched)
    localStorage.setItem('voyageai_user', JSON.stringify(enriched))
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem('voyageai_jwt_token')

    // No token — not logged in, stop loading immediately
    if (!storedToken) {
      if (loadingRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
      return
    }

    let cancelled = false

    // Safety timeout — if backend takes >4s, stop showing spinner
    // User stays logged in from localStorage
    const timeout = setTimeout(() => {
      if (!cancelled && loadingRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }, 4000)

    const validateSession = async () => {
      try {
        const session = await api.request('/api/auth/session')
        if (cancelled) return
        if (session?.user) {
          setUser(session.user)
          setToken(storedToken)
        }
      } catch (err) {
        if (cancelled) return
        const status = err?.status || err?.statusCode
        if (status === 401 || status === 403) {
          localStorage.removeItem('voyageai_jwt_token')
          localStorage.removeItem('voyageai_user')
          setUserState(null)
          setToken(null)
        }
        // Network errors keep the stored user intact
      } finally {
        clearTimeout(timeout)
        if (!cancelled && loadingRef.current) {
          loadingRef.current = false
          setLoading(false)
        }
      }
    }

    validateSession()
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [setUser])

  const handleOAuthCallback = useCallback((jwtToken, userObj) => {
    setUser(userObj)
    setToken(jwtToken)
    localStorage.setItem('voyageai_jwt_token', jwtToken)
  }, [setUser])

  const completeProfileRegister = useCallback(async (registrationDetails) => {
    const response = await api.request('/api/auth/register-profile', {
      method: 'POST',
      body: JSON.stringify(registrationDetails)
    })
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('voyageai_jwt_token', response.token)
    return response.user
  }, [setUser])

  const signInWithOAuth = useCallback((provider, intent = 'user') => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/auth/${provider}?intent=${intent}`
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.request('/api/auth/logout', { method: 'POST' })
    } catch {
      // Best-effort
    }
    localStorage.removeItem('voyageai_jwt_token')
    localStorage.removeItem('voyageai_user')
    setUserState(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      setUser,
      signInWithOAuth,
      completeProfileRegister,
      handleOAuthCallback,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}