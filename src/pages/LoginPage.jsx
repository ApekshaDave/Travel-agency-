import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail, Lock, ArrowRight, Globe,
  Sparkles, ShieldCheck, Plane, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { FaGithub } from "react-icons/fa"
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ name: '', email: '', password: '' })
  
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup } = useAuth()

  const from = location.state?.from?.pathname || '/dashboard'

  const validate = () => {
    let isValid = true
    const newErrors = { name: '', email: '', password: '' }

    if (!isLogin && !name.trim()) {
      newErrors.name = 'Full name is required'
      isValid = false
    }

    if (!email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
        toast.success('Welcome back to VoyageAI!')
      } else {
        await signup(email, password, name)
        toast.success('Account created successfully!')
      }
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-void via-deep/50 to-void pointer-events-none" />

      {/* Animated Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-400/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -60, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">

        {/* Left Side: Brand & Social Proof */}
        <div className="hidden md:flex md:w-[45%] bg-white/5 p-12 flex-col justify-between border-r border-white/5">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <Plane className="w-5 h-5 text-void" />
              </div>
              <span className="font-display font-bold text-2xl text-white">VoyageAI</span>
            </Link>

            <h2 className="font-display text-4xl font-bold text-white mb-6 leading-tight">
              Start your <br />
              <span className="text-shimmer italic">imaginary</span> journey.
            </h2>

            <div className="space-y-6">
              {[
                { icon: Sparkles, text: 'AI-first personalized planning', color: 'text-gold-400' },
                { icon: ShieldCheck, text: 'Secure multi-modal bookings', color: 'text-sky-400' },
                { icon: CheckCircle2, text: 'Automated changes & check-ins', color: 'text-sage-400' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-4 group"
                >
                  <div className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-white/5 group-hover:border-gold-400/30 transition-all`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-muted text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/5">
            <p className="text-muted text-xs leading-relaxed">
              Join 50,000+ travelers using VoyageAI to automate their journeys across 120 countries.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-16">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-muted text-sm">
                {isLogin
                  ? 'Access your travels and AI assistant.'
                  : 'Get started with the world\'s most intuitive travel platform.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Full Name</label>
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                      }}
                      placeholder="John Doe"
                      className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                    }}
                    placeholder="name@company.com"
                    className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-bold">Password</label>
                  {isLogin && (
                    <button type="button" className="text-[10px] text-gold-400 hover:underline">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                    }}
                    placeholder="••••••••"
                    className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-gold-gradient text-void font-bold rounded-2xl shadow-gold hover:shadow-[0_0_40px_rgba(232,180,41,0.3)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                  />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="px-4 bg-[#0B111B] text-muted">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 glass border border-white/5 hover:bg-white/5 rounded-xl transition-all text-xs font-medium text-white">
                <Globe className="w-4 h-4" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 glass border border-white/5 hover:bg-white/5 rounded-xl transition-all text-xs font-medium text-white">
                <FaGithub className="w-4 h-4" /> Github
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors({ name: '', email: '', password: '' })
                }}
                className="text-gold-400 font-bold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
