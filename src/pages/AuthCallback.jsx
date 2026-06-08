// ─── AuthCallback.jsx ────────────────────────────────────────────────────────
// Drop this file at: src/pages/AuthCallback.jsx
// It handles the redirect from your backend after OAuth (Google etc.)
// The backend sends: /auth/callback?token=...&role=...&email=...&name=...

import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { handleOAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handled = useRef(false) // prevent double-fire in StrictMode

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token       = searchParams.get('token')
    const role        = searchParams.get('role')
    const email       = searchParams.get('email')
    const name        = searchParams.get('name')
    const phone       = searchParams.get('phone')
    const needsProfile = searchParams.get('needs_profile') === 'true'
    const intent      = searchParams.get('intent') || 'user'

    // ── No token at all — something went wrong upstream ──
    if (!token || !email) {
      toast.error('Authentication failed — missing credentials.')
      navigate('/login', { replace: true })
      return
    }

    // ── New Google user who hasn't filled in their profile yet ──
    if (needsProfile) {
      navigate(
        `/complete-profile?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}&intent=${intent}`,
        { replace: true }
      )
      return
    }

    // ── Normal login — role must be present ──
    if (!role) {
      toast.error('Authentication failed — missing role.')
      navigate('/login', { replace: true })
      return
    }

    try {
      const decodedName = decodeURIComponent(name || 'Traveller')

      const loggedUser = {
        email,
        name: decodedName,
        role,
        phone: phone ? decodeURIComponent(phone) : '',
        // user_metadata mirrors Supabase shape so Navbar UserPill works
        user_metadata: {
          full_name: decodedName,
          email,
        },
      }

      handleOAuthCallback(token, loggedUser)

      toast.success(`Welcome back, ${decodedName}! 👋`, { duration: 3000 })

      const isStaff = ['agent', 'admin', 'finance'].includes(role)
      navigate(isStaff ? '/agent' : '/dashboard', { replace: true })
    } catch (err) {
      console.error('Session establishment error:', err)
      toast.error('Failed to log in. Please try again.')
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate, handleOAuthCallback])

  return (
    <div className="min-h-screen flex items-center justify-center bg-void relative">
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="text-center relative z-10 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold mx-auto"
        >
          <Sparkles className="w-6 h-6 text-void" />
        </motion.div>
        <h2 className="text-white font-semibold text-lg">Establishing Secure Session…</h2>
        <p className="text-muted text-xs">Verifying credentials and routing workspace…</p>
      </div>
    </div>
  )
}