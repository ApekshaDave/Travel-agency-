import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Globe, Sparkles,
  ShieldCheck,
  Plane,
  Building2,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [loadingIntent, setLoadingIntent] = useState(null) // 'user' | 'agent' | null
  const navigate = useNavigate()

  const { user, signInWithOAuth } = useAuth()

  // Redirect users who are already logged in
  useEffect(() => {
    if (user) {
      const isActuallyStaff = user.role === 'agent' || user.role === 'admin' || user.role === 'finance'
      navigate(isActuallyStaff ? '/staff' : '/dashboard', { replace: true })
    }
  }, [user, navigate])

  // intent = 'user' for traveler, 'agent' for travel agent
  const handleSocialLogin = async (provider, intent = 'user') => {
    setLoadingIntent(intent)
    try {
      await signInWithOAuth(provider, intent)
      // Page redirects automatically to Google — no need to reset state
    } catch (err) {
      toast.error(`${provider} login failed: ${err.message}`)
      setLoadingIntent(null)
    }
  }

  const isLoading = loadingIntent !== null

  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 bg-white">
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="relative z-10 w-full max-w-[900px] flex flex-col md:flex-row glass border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl">

        {/* Left Side: Brand Panel */}
        <div className="hidden md:flex md:w-[45%] bg-blue-600 p-12 flex-col justify-between text-white relative">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Plane className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-display font-bold text-2xl">VoyageAI</span>
            </Link>

            <h2 className="font-display text-4xl font-bold leading-tight mb-6">
              Travel the way<br /><span className="italic opacity-80">you imagine it.</span>
            </h2>

            <div className="space-y-6 mt-12">
              {[
                { icon: Sparkles, text: 'AI-first personalized itineraries' },
                { icon: ShieldCheck, text: 'Safe & Secure cloud transactions' },
                { icon: Users, text: '24/7 Agent Override Support' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/60 text-[11px] leading-relaxed relative z-10 pt-8 border-t border-white/10">
            By continuing, you agree to our Terms of Service and Privacy Policy. VoyageAI protects your data with bank-grade encryption.
          </p>
        </div>

        {/* Right Side: Google Auth */}
        <div className="flex-1 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full text-center">
            <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm mb-10">Choose your path to begin your journey.</p>

            <div className="space-y-4">

              {/* Traveler button — intent = 'user' */}
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                onClick={() => handleSocialLogin('google', 'user')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-blue-500/20 shadow-lg hover:bg-blue-700 transition-all text-lg group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingIntent === 'user' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Globe className="w-6 h-6 text-white" />
                    Continue as Traveler
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                  </>
                )}
              </motion.button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="px-4 bg-white text-slate-400 font-bold">Or</span>
                </div>
              </div>

              {/* Travel Agent button — intent = 'agent' */}
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                onClick={() => handleSocialLogin('google', 'agent')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingIntent === 'agent' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5 text-blue-600" />
                    I am a Travel Agent
                  </>
                )}
              </motion.button>
            </div>

            {/* Redirect hint while loading */}
            {isLoading && (
              <p className="mt-6 text-xs text-slate-400 font-medium animate-pulse">
                Redirecting to Google — please wait...
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}