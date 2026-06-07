/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, hasSupabase } from '../utils/supabaseClient'

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
  const [loading, setLoading] = useState(false)

  // Listen to Supabase auth state changes if active
  useEffect(() => {
    if (hasSupabase && supabase) {
      setLoading(true)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const email = session.user.email

          // Query PostgreSQL staff registry via Supabase
          const { data: staffData } = await supabase
            .from('staff_members')
            .select('*')
            .eq('email', email)
            .maybeSingle()

          const mockUser = {
            id: session.user.id,
            email: email,
            name: session.user.user_metadata?.name || email.split('@')[0],
            role: staffData ? (email.includes('admin') ? 'admin' : 'agent') : 'user',
            agencyName: staffData?.agency_name || null,
            position: staffData?.position || null
          }

          localStorage.setItem('voyageai_user', JSON.stringify(mockUser))
          setUser(mockUser)
        } else {
          localStorage.removeItem('voyageai_user')
          setUser(null)
        }
        setLoading(false)
      })
      return () => subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password, options = {}) => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const isStaff = options.staff || email.includes('agent') || email.includes('staff') || email.includes('admin')
      let staffData = null

      if (isStaff) {
        const { data: dbStaff } = await supabase
          .from('staff_members')
          .select('*')
          .eq('email', email)
          .maybeSingle()
        staffData = dbStaff
      }

      const mockUser = {
        id: data.user.id,
        email: email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: staffData ? (email.includes('admin') ? 'admin' : 'agent') : 'user',
        agencyName: staffData?.agency_name || null,
        position: staffData?.position || null
      }

      // Save local device caching profile
      const saved = JSON.parse(localStorage.getItem('voyageai_saved_accounts') || '[]')
      if (!saved.some(a => a.email.toLowerCase() === mockUser.email.toLowerCase())) {
        saved.push({
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          agencyName: mockUser.agencyName
        })
        localStorage.setItem('voyageai_saved_accounts', JSON.stringify(saved))
      }
      setUser(mockUser)
      return mockUser
    } else {
      // Local Mock DB Fallback
      const staffList = JSON.parse(localStorage.getItem('voyageai_registered_staff') || '[]')
      const isStaff = options.staff || email.includes('agent') || email.includes('staff') || email.includes('admin')

      let matchedUser = null
      let role = 'user'

      if (isStaff) {
        const staffMember = staffList.find(s => s.email.toLowerCase() === email.toLowerCase())
        if (staffMember) {
          if (staffMember.password !== password) {
            throw new Error('Invalid staff credentials')
          }
          matchedUser = staffMember
          role = email.includes('admin') ? 'admin' : 'agent'
        } else {
          role = email.includes('admin') ? 'admin' : 'agent'
          matchedUser = { name: email.split('@')[0], email, agencyName: 'Star Voyages', position: 'Agent' }
        }
      } else {
        matchedUser = { name: email.split('@')[0], email }
        role = 'user'
      }

      const mockUser = {
        id: matchedUser.id || `user_${Math.random().toString(36).slice(2, 8)}`,
        email: matchedUser.email,
        name: matchedUser.name,
        role,
        agencyName: matchedUser.agencyName || null,
        position: matchedUser.position || null
      }

      localStorage.setItem('voyageai_user', JSON.stringify(mockUser))

      const saved = JSON.parse(localStorage.getItem('voyageai_saved_accounts') || '[]')
      if (!saved.some(a => a.email.toLowerCase() === mockUser.email.toLowerCase())) {
        saved.push({
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          agencyName: mockUser.agencyName
        })
        localStorage.setItem('voyageai_saved_accounts', JSON.stringify(saved))
      }

      setUser(mockUser)
      return mockUser
    }
  }

  const signup = async (email, password, name, options = {}) => {
    if (hasSupabase && supabase) {
      const isStaff = options.staff || !!options.agencyName
      const role = isStaff ? (email.includes('admin') ? 'admin' : 'agent') : 'user'

      const authOptions = { data: { name, role, phone: options.phone } }
      if (options.emailRedirectTo) authOptions.emailRedirectTo = options.emailRedirectTo

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: authOptions
      })
      if (error) throw error

      if (isStaff) {
        // Register in PostgreSQL staff_members table via Supabase client
        const { error: dbError } = await supabase
          .from('staff_members')
          .insert({
            user_id: data.user.id,
            name,
            email,
            agency_name: options.agencyName,
            position: options.position || 'Agent'
          })
        if (dbError) throw dbError

        // Save new agency registry to PostgreSQL if needed
        const { data: existingAg } = await supabase
          .from('agencies')
          .select('*')
          .eq('name', options.agencyName)
          .maybeSingle()

        if (!existingAg) {
          await supabase.from('agencies').insert({
            name: options.agencyName,
            reg_id: `REG-${Math.floor(100 + Math.random() * 900)}`
          })
        }
      }

      const mockUser = {
        id: data.user.id,
        email,
        name,
        role,
        agencyName: options.agencyName || null,
        position: options.position || null
      }

      const saved = JSON.parse(localStorage.getItem('voyageai_saved_accounts') || '[]')
      if (!saved.some(a => a.email.toLowerCase() === mockUser.email.toLowerCase())) {
        saved.push({
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          agencyName: mockUser.agencyName
        })
        localStorage.setItem('voyageai_saved_accounts', JSON.stringify(saved))
      }
      setUser(mockUser)
      return mockUser
    } else {
      // Local Mock DB Fallback
      const isStaff = options.staff || !!options.agencyName
      let role = 'user'
      let agencyName = null
      let position = null

      if (isStaff) {
        role = email.includes('admin') ? 'admin' : 'agent'
        agencyName = options.agencyName
        position = options.position || 'Agent'

        const staffList = JSON.parse(localStorage.getItem('voyageai_registered_staff') || '[]')
        if (staffList.some(s => s.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email is already registered as a travel agent')
        }

        const newStaff = { name, email, password, agencyName, position }
        staffList.push(newStaff)
        localStorage.setItem('voyageai_registered_staff', JSON.stringify(staffList))
      } else {
        role = 'user'
      }

      const mockUser = {
        id: `user_${Math.random().toString(36).slice(2, 8)}`,
        email,
        name,
        role,
        agencyName,
        position
      }

      localStorage.setItem('voyageai_user', JSON.stringify(mockUser))

      const saved = JSON.parse(localStorage.getItem('voyageai_saved_accounts') || '[]')
      if (!saved.some(a => a.email.toLowerCase() === mockUser.email.toLowerCase())) {
        saved.push({
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          agencyName: mockUser.agencyName
        })
        localStorage.setItem('voyageai_saved_accounts', JSON.stringify(saved))
      }

      setUser(mockUser)
      return mockUser
    }
  }

  const logout = async () => {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut()
    }
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
