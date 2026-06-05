import { createContext, useContext, useState, useEffect } from 'react'

// TODO: Replace mock with real Supabase auth:
// import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, restore session from localStorage (mock)
    const stored = localStorage.getItem('voyageai_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)

    // TODO: Replace with Supabase session listener:
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    //   setUser(session?.user ?? null)
    //   setLoading(false)
    // })
    // return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    // TODO: Replace with real Supabase auth:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) throw error
    // return data.user

    // Mock auth — accepts any valid email/password
    const mockUser = {
      id: `user_${Math.random().toString(36).slice(2, 8)}`,
      email,
      name: email.split('@')[0],
      role: email.includes('agent') ? 'agent' : email.includes('finance') ? 'finance' : 'user',
    }
    localStorage.setItem('voyageai_user', JSON.stringify(mockUser))
    setUser(mockUser)
    return mockUser
  }

  const signup = async (email, password, name) => {
    // TODO: Replace with real Supabase auth:
    // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    // if (error) throw error
    // return data.user

    const mockUser = {
      id: `user_${Math.random().toString(36).slice(2, 8)}`,
      email,
      name,
      role: 'user',
    }
    localStorage.setItem('voyageai_user', JSON.stringify(mockUser))
    setUser(mockUser)
    return mockUser
  }

  const logout = async () => {
    // TODO: Replace with: await supabase.auth.signOut()
    localStorage.removeItem('voyageai_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
