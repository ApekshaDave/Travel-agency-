import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plane, Globe, ShieldCheck, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signInWithOAuth, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    // If already logged in, redirect away
    if (user) {
      const isStaff = user.role === 'agent' || user.role === 'admin' || user.role === 'finance'
      const redirectPath = !isStaff ? '/dashboard' : '/staff'
      navigate(redirectPath, { replace: true })
    }

    // Check for errors in URL
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) {
      if (err === 'oauth_failed') {
        toast.error('Google Authentication failed. Please try again.')
      } else if (err === 'email_not_provided') {
        toast.error('Could not retrieve email from Google Account.')
      } else {
        toast.error('Sign-in failed. Please contact support.')
      }
    }
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    try {
      await signInWithOAuth('google')
    } catch (err) {
      toast.error('Failed to start Google Sign-In: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 bg-void">
      <div className="absolute inset-0 starfield pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Plane className="w-6 h-6 text-void" />
            </div>
            <span className="font-display font-bold text-3xl text-white">VoyageAI</span>
          </Link>
          <h1 className="text-white text-2xl font-bold tracking-tight">Welcome to the future of travel</h1>
          <p className="text-muted mt-2">Sign in to sync your AI-planned journeys across all devices.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Subtle line background effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />

          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold-400 animate-pulse">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg">Secure Account Access</h2>
              <p className="text-muted text-xs mt-1">Single sign-on for both customers and agency staff.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-4 bg-white text-void font-bold rounded-2xl shadow-xl hover:shadow-white/10 transition-all text-lg cursor-pointer"
            >
              <Globe className="w-6 h-6 text-blue-500" />
              Continue with Google
            </motion.button>

            <div className="pt-2">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">One-click secure access</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="text-center mt-8 space-y-2 text-xs text-muted/60"
        >
          <div className="flex items-center justify-center gap-1.5 text-gold-400/80 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Auto-Redirection</span>
          </div>
          <p className="max-w-xs mx-auto leading-relaxed">
            Registered agency staff are automatically redirected to Agent Control. New accounts can complete their profile registry immediately after sign-in.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
