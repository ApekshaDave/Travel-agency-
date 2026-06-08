/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/apiClient'

const AuthContext = createContext(null)

function parseStoredUser(raw) {
  try {
    const u = JSON.parse(raw)
    if (!u) return null
    // Always ensure user_metadata exists so Navbar UserPill never crashes
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

  // Start loading=false if we already have a stored user — avoids flash of login page
  const [loading, setLoading] = useState(() => !localStorage.getItem('voyageai_user'))
  const loadingRef = useRef(loading)

  // ── Enriched user setter — always writes user_metadata ──────────────────
  const setUser = useCallback((u) => {
    if (!u) {
      setUserState(null)
      return
    }
    const enriched = {
      ...u,
      user_metadata: u.user_metadata || {
        full_name: u.name || '',
        email: u.email || '',
      },
    }
    setUserState(enriched)
    localStorage.setItem('voyageai_user', JSON.stringify(enriched))
  }, [])

  // ── Session validation on mount ──────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('voyageai_jwt_token')

    if (!storedToken) {
      if (loadingRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
      return
    }

    let cancelled = false

    // Safety timeout — if backend is slow/down, don't block the UI forever
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
        // Only clear session on explicit auth rejection — not network errors
        if (status === 401 || status === 403) {
          localStorage.removeItem('voyageai_jwt_token')
          localStorage.removeItem('voyageai_user')
          setUserState(null)
          setToken(null)
        }
        // Network errors: keep the stored user so the app still works offline
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

  // ── Called by AuthCallback after OAuth redirect ──────────────────────────
  // This is the single source of truth for token + user state after OAuth
  const handleOAuthCallback = useCallback((jwtToken, userObj) => {
    setUser(userObj)
    setToken(jwtToken)
    localStorage.setItem('voyageai_jwt_token', jwtToken)
  }, [setUser])

  // ── Email/password login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password, options = {}) => {
    setLoading(true)
    try {
      const response = await api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, isStaffLogin: options.staff }),
      })

      if (options.staff && response.user?.role === 'user') {
        throw new Error('This account is not registered as a travel agent.')
      }

      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('voyageai_jwt_token', response.token)
      return response.user
    } finally {
      setLoading(false)
    }
  }, [setUser])

  // ── Signup ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (email, password, name, options = {}) => {
    setLoading(true)
    try {
      const response = await api.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, ...options }),
      })
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('voyageai_jwt_token', response.token)
      return response.user
    } finally {
      setLoading(false)
    }
  }, [setUser])

  // ── Complete profile (new Google users) ──────────────────────────────────
  const completeProfileRegister = useCallback(async (registrationDetails) => {
    const response = await api.request('/api/auth/register-profile', {
      method: 'POST',
      body: JSON.stringify(registrationDetails),
    })
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('voyageai_jwt_token', response.token)
    return response.user
  }, [setUser])

  // ── OAuth redirect — sends user to backend which redirects to FRONTEND_URL ──
  // The backend MUST use process.env.FRONTEND_URL for the redirect, not localhost
  const signInWithOAuth = useCallback((provider, intent = 'user') => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/auth/${provider}?intent=${intent}`
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.request('/api/auth/logout', { method: 'POST' })
    } catch {
      // Best-effort — clear client state regardless
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
      login,
      signup,
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