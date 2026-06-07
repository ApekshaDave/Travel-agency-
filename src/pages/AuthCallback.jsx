import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { handleOAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const role  = searchParams.get('role')
    const email = searchParams.get('email')
    const name  = searchParams.get('name')
    const phone = searchParams.get('phone')
    const needsProfile = searchParams.get('needs_profile') === 'true'

    if (!token || !email) {
      toast.error('Authentication failed. Missing credentials.')
      navigate('/login')
      return
    }

    // If the backend says this Google user has no profile yet,
    // send them to complete-profile with the temp token + intent
    if (needsProfile) {
      const intent = searchParams.get('intent') || 'user'
      navigate(
        `/complete-profile?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}&intent=${intent}`,
        { replace: true }
      )
      return
    }

    if (!role) {
      toast.error('Authentication failed. Missing role.')
      navigate('/login')
      return
    }

    try {
      const loggedUser = {
        email,
        name: decodeURIComponent(name || 'Traveler'),
        role,
        phone: phone ? decodeURIComponent(phone) : '',
        // Mirror what Supabase user_metadata looks like so Navbar UserPill works
        user_metadata: {
          full_name: decodeURIComponent(name || 'Traveler'),
          email,
        }
      }

      // Use the context method so token state + localStorage stay in sync
      handleOAuthCallback(token, loggedUser)

      toast.success(`Welcome back, ${loggedUser.name}!`)

      const isStaff = ['agent', 'admin', 'finance'].includes(role)
      navigate(isStaff ? '/staff' : '/dashboard', { replace: true })
    } catch (err) {
      console.error('Session establishment error:', err)
      toast.error('Failed to log in. Please try again.')
      navigate('/login')
    }
  }, [searchParams, navigate, handleOAuthCallback])

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-void">
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="text-center relative z-10 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold mx-auto"
        >
          <Sparkles className="w-6 h-6 text-void" />
        </motion.div>
        <h2 className="text-white font-semibold text-lg">Establishing Secure Session...</h2>
        <p className="text-muted text-xs">Verifying credentials and routing workspace...</p>
      </div>
    </div>
  )
}