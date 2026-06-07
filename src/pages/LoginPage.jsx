import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plane, Globe, ShieldCheck, Sparkles, MapPin, Camera, Compass } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const FLOATING_ICONS = [
  { icon: Plane,   size: 'w-8 h-8',  color: 'text-coral-400',  pos: 'top-[12%] left-[8%]',  delay: 0 },
  { icon: MapPin,  size: 'w-7 h-7',  color: 'text-ocean-400',  pos: 'top-[20%] right-[10%]', delay: 1.5 },
  { icon: Compass, size: 'w-9 h-9',  color: 'text-sand-400',   pos: 'bottom-[25%] left-[6%]', delay: 0.8 },
  { icon: Camera,  size: 'w-7 h-7',  color: 'text-sky-400',    pos: 'bottom-[15%] right-[8%]', delay: 2 },
  { icon: Plane,   size: 'w-5 h-5',  color: 'text-forest-400', pos: 'top-[45%] left-[3%]',   delay: 1.2 },
  { icon: MapPin,  size: 'w-5 h-5',  color: 'text-sunset-400', pos: 'top-[60%] right-[4%]',  delay: 0.4 },
]

export default function LoginPage() {
  const { signInWithOAuth, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (user) {
      const isStaff = user.role === 'agent' || user.role === 'admin' || user.role === 'finance'
      navigate(isStaff ? '/staff' : '/dashboard', { replace: true })
    }
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) {
      if (err === 'oauth_failed') toast.error('Google Authentication failed. Please try again.')
      else if (err === 'email_not_provided') toast.error('Could not retrieve email from Google Account.')
      else toast.error('Sign-in failed. Please contact support.')
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
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden travel-hero-bg">

      {/* ── Vivid background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(0,201,177,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
             style={{ background: 'radial-gradient(ellipse, rgba(69,183,209,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Starfield dots */}
      <div className="absolute inset-0 starfield pointer-events-none" />

      {/* ── Floating icons ── */}
      {FLOATING_ICONS.map(({ icon: Icon, size, color, pos, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} opacity-30 pointer-events-none`}
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon className={`${size} ${color}`} />
        </motion.div>
      ))}

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-coral"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #F7C948)' }}
            >
              <Plane className="w-7 h-7 text-white" />
            </motion.div>
            <div className="text-left">
              <span className="font-display font-bold text-3xl text-white block">VoyageAI</span>
              <span className="text-xs text-ocean-400 font-semibold tracking-widest uppercase">Travel Agency</span>
            </div>
          </Link>
          <h1 className="text-white text-2xl font-bold">Your next adventure awaits ✈️</h1>
          <p className="text-muted mt-2 text-sm">One click access for travellers & agency staff</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative rounded-[2rem] p-8 sm:p-10 overflow-hidden"
          style={{
            background: 'rgba(22, 32, 50, 0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,201,177,0.05)'
          }}
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-0.5 rounded-full"
               style={{ background: 'linear-gradient(90deg, transparent, #FF6B6B, #F7C948, #00C9B1, transparent)' }} />

          <div className="space-y-6 text-center">
            {/* Icon ring */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="w-18 h-18 rounded-full flex items-center justify-center relative"
                   style={{
                     width: 72, height: 72,
                     background: 'linear-gradient(135deg, rgba(0,201,177,0.2), rgba(69,183,209,0.1))',
                     border: '2px solid rgba(0,201,177,0.3)'
                   }}>
                <ShieldCheck className="w-9 h-9 text-ocean-400" />
              </div>
            </motion.div>

            <div>
              <h2 className="text-white font-bold text-xl">Secure Single Sign-On</h2>
              <p className="text-muted text-sm mt-1">
                Customers & agency staff use the same Google login
              </p>
            </div>

            {/* Google button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl font-bold text-lg cursor-pointer transition-all"
              style={{
                background: 'white',
                color: '#0D1B2A',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
              }}
            >
              {/* Google G logo */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>

            {/* Role info cards */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { emoji: '🧳', label: 'Travellers', desc: 'Book & track trips' },
                { emoji: '🏢', label: 'Agency Staff', desc: 'Manage itineraries' },
              ].map(({ emoji, label, desc }) => (
                <div key={label} className="rounded-xl p-3 text-left"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xl mb-1">{emoji}</div>
                  <div className="text-white text-xs font-bold">{label}</div>
                  <div className="text-muted text-[10px] mt-0.5">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full opacity-30"
               style={{ background: 'linear-gradient(90deg, transparent, #00C9B1, transparent)' }} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 space-y-1"
        >
          <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: '#00C9B1' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">Smart role detection on sign-in</span>
          </div>
          <p className="text-xs text-muted max-w-xs mx-auto">
            New users are guided through a quick profile setup. Agency staff are automatically redirected to the control panel.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
