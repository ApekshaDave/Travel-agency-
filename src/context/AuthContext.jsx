/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState} from 'react'

// TODO: Replace mock with real Supabase auth:
// import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext(null)

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
  const [loading] = useState(false)



  const login = async (email, password, options = {}) => {
    // TODO: Replace with real Supabase auth:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) throw error
    // return data.user

    // Mock auth — accepts any valid email/password
    const isStaffEmail =
  email.includes('agent') ||
  email.includes('admin') ||
  email.includes('staff')

const role = options.staff
  ? (isStaffEmail
      ? (email.includes('admin') ? 'admin' : 'agent')
      : 'user')
  : email.includes('finance')
    ? 'finance'
    : 'user'

    const mockUser = {
      id: `user_${Math.random().toString(36).slice(2, 8)}`,
      email,
      name: email.split('@')[0],
      role,
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
