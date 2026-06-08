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
  CheckCircle2,
  User,
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
    <div className="min-h-screen bg-white">

      {/* ── Top bar ── */}
      <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
          >
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900">VoyageAI</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Sign In
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="flex min-h-[calc(100vh-65px)]">

        {/* Left decorative panel */}
        <div
          className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-12"
          style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EEF2FF 100%)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Step 1 of 2</span>
              <h2 className="font-display text-4xl font-bold text-slate-900 leading-tight mt-2">
                Let's get<br />
                <span
                  className="italic"
                  style={{
                    background: 'linear-gradient(135deg, #1A6EBD 0%, #3B82F6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  you started.
                </span>
              </h2>
              <p className="text-slate-500 text-sm mt-4 leading-relaxed">
                Sign in with Google to access your personalised VoyageAI workspace in seconds.
              </p>
            </div>

            <div className="space-y-5 mt-12">
              {[
                { icon: CheckCircle2, text: 'Verify with Google', done: false, active: true },
                { icon: User, text: 'Personal details', done: false, active: false },
                { icon: Plane, text: 'Workspace ready', done: false, active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium ${item.active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.text}
                  </span>
                  {item.active && (
                    <span className="ml-auto text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Now
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[11px] text-slate-400 leading-relaxed border-t border-slate-200 pt-6">
            Your information is protected with bank-grade encryption and never shared with third parties.
          </p>
        </div>

        {/* Right: auth buttons */}
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h1 className="text-slate-900 text-2xl font-bold">Welcome to VoyageAI</h1>
              <p className="text-slate-500 text-sm mt-1">Choose your path to begin your journey.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm space-y-5">

              {/* Traveler button */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">I am a Traveler</label>
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  onClick={() => handleSocialLogin('google', 'user')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 text-white font-bold rounded-2xl shadow-sm transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                >
                  {loadingIntent === 'user' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Continue as Traveler
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>
                <p className="text-[11px] text-slate-400 text-center">Plan & book AI-first trips</p>
              </div>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-[10px] uppercase tracking-widest text-slate-400 font-bold">Or</span>
                </div>
              </div>

              {/* Travel Agent button */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">I am a Travel Agent</label>
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  onClick={() => handleSocialLogin('google', 'agent')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingIntent === 'agent' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Continue as Travel Agent
                      <ArrowRight className="w-4 h-4 ml-1 text-slate-400" />
                    </>
                  )}
                </motion.button>
                <p className="text-[11px] text-slate-400 text-center">Manage clients, staff & queries</p>
              </div>

              {/* Google note */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400">Secured via Google OAuth</span>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              </div>

            </div>

            {/* Redirect hint while loading */}
            {isLoading && (
              <p className="mt-5 text-xs text-slate-400 font-medium animate-pulse text-center">
                Redirecting to Google — please wait...
              </p>
            )}

            <p className="text-center text-xs text-slate-400 mt-6">
              By continuing you agree to our{' '}
              <a href="#" className="text-blue-500 hover:underline">Terms</a> and{' '}
              <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}