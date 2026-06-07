import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const role = searchParams.get('role')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const phone = searchParams.get('phone')

    if (!token || !role || !email) {
      toast.error('Authentication callback failed. Missing credentials.')
      navigate('/login')
      return
    }

    try {
      // 1. Establish session in localStorage
      localStorage.setItem('voyageai_jwt_token', token)

      const loggedUser = {
        email,
        name: decodeURIComponent(name || 'Traveler'),
        role,
        phone: phone ? decodeURIComponent(phone) : ''
      }

      localStorage.setItem('voyageai_user', JSON.stringify(loggedUser))

      // 2. Set user state in AuthContext
      setUser(loggedUser)

      // 3. Notify success
      toast.success(`Welcome to your journey, ${loggedUser.name}!`)

      // 4. Redirect based on role
      const isStaff = role === 'agent' || role === 'admin' || role === 'finance'
      navigate(isStaff ? '/agent' : '/dashboard', { replace: true })
    } catch (err) {
      console.error('Session establishment error:', err)
      toast.error('Failed to log in. Please try again.')
      navigate('/login')
    }
  }, [searchParams, navigate, setUser])

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
