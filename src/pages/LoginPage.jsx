import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail, Lock, ArrowRight, Globe, Phone,
  Sparkles, ShieldCheck, Plane, CheckCircle2,
  Building2, Users, HelpCircle, Info, ChevronDown, UserCheck, PlusCircle, User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { FaGithub } from "react-icons/fa"
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)
  const [loginTab, setLoginTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') === 'agency' ? 'agency' : 'customer'
  })
  const [registerTab, setRegisterTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') === 'agency' ? 'agency' : 'customer'
  })

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isAgencyRegistered, setIsAgencyRegistered] = useState(false)
  const [agencyName, setAgencyName] = useState('')
  const [agencyRegId, setAgencyRegId] = useState('')
  const [selectedAgency, setSelectedAgency] = useState('Star Voyages')
  const [position, setPosition] = useState('Agent')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showInfoDropdown, setShowInfoDropdown] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState([])
  const [registeredAgencies, setRegisteredAgencies] = useState([])

  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup, user, signInWithOAuth } = useAuth()

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data } = await supabase.from('agencies').select('*').order('name')
      if (data) setRegisteredAgencies(data)
    }

    const saved = JSON.parse(localStorage.getItem('voyageai_saved_accounts') || '[]')
    setSavedAccounts(saved)
    fetchAgencies()

    if (user && !isRecovery) {
      const isActuallyStaff = user.role === 'agent' || user.role === 'admin' || user.role === 'finance'
      navigate(isActuallyStaff ? '/staff' : '/dashboard', { replace: true })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
        setIsLogin(true)
        toast.success('Recovery link verified. Please set your new password.')
      }
    })

    return () => subscription.unsubscribe()
  }, [user, isRecovery])

  const validate = () => {
    let isValid = true
    const newErrors = {}

    if (!isLogin) {
      if (registerTab === 'customer') {
        if (!name.trim()) { newErrors.name = 'Full name is required'; isValid = false }
        if (!phone.trim()) { newErrors.phone = 'Phone number is required'; isValid = false }
      } else {
        if (!name.trim()) { newErrors.name = 'Full name is required'; isValid = false }
        if (!isAgencyRegistered) {
          if (!agencyName.trim()) { newErrors.agencyName = 'Agency name is required'; isValid = false }
          if (!agencyRegId.trim()) { newErrors.agencyRegId = 'Agency registration ID is required'; isValid = false }
        }
      }
    }

    if (!email) {
      newErrors.email = 'Email is required'; isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'; isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'; isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'; isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Email is required to reset password' })
      toast.error('Please enter your email address first.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      })
      if (error) throw error
      toast.success('Password reset link sent to your email!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (isRecovery) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        toast.success('Password updated! You can now sign in.')
        setIsRecovery(false)
        return
      }

      if (isLogin) {
        const isStaffLogin = loginTab === 'agency'
        const loggedUser = await login(email, password, { staff: isStaffLogin })
        const actualRole = loggedUser?.role || 'user'
        const isActuallyStaff = actualRole === 'agent' || actualRole === 'admin' || actualRole === 'finance'

        toast.success(`Welcome back, ${loggedUser.name || 'Traveler'}!`)

        const redirectPath = !isActuallyStaff
          ? '/dashboard'
          : (from.includes('/staff') || from.includes('/agent') || from.includes('/finance') ? from : '/staff')

        navigate(redirectPath, { replace: true })
      } else {
        if (registerTab === 'customer') {
          await signup(email, password, name, {
            phone,
            emailRedirectTo: `${window.location.origin}/dashboard`
          })
          toast.success('Customer account created successfully!')
          navigate(from, { replace: true })
        } else {
          let targetAgency = selectedAgency

          if (!isAgencyRegistered) {
            const { error: agencyErr } = await supabase
              .from('agencies')
              .insert([{ name: agencyName, reg_id: agencyRegId }])
            if (agencyErr) throw new Error('Agency registration failed: ' + agencyErr.message)
            targetAgency = agencyName
          }

          await signup(email, password, name, {
            staff: true,
            agencyName: targetAgency,
            position,
            emailRedirectTo: `${window.location.origin}/staff`
          })

          toast.success(`Registered successfully! Welcome to ${targetAgency}.`)
          navigate('/staff', { replace: true })
        }
      }
    } catch (err) {
      const errorMsg = err.message?.toLowerCase() || ''
      if (isLogin && err.message === 'You are not registered as agent register yourself') {
        toast.error(err.message, { icon: '🚫' })
      } else if (isLogin && errorMsg.includes('email not confirmed')) {
        toast.error(
          (t) => (
            <span>
              Invalid credentials.
              <button
                className="ml-2 text-gold-400 font-bold underline"
                onClick={() => { handleForgotPassword(); toast.dismiss(t.id) }}
              >
                Forgot Password?
              </button>
            </span>
          ),
          { duration: 6000 }
        )
      } else {
        toast.error(err.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      toast.error(`${provider} login failed: ${err.message}`)
    }
  }

  const handleQuickLogin = async (account) => {
    setLoading(true)
    try {
      const isStaff = account.role === 'agent' || account.role === 'admin' || account.role === 'finance'
      const loggedUser = await login(account.email, 'password', { staff: isStaff })
      const actualRole = loggedUser?.role || 'user'
      const isActuallyStaff = actualRole === 'agent' || actualRole === 'admin' || actualRole === 'finance'
      toast.success(`Welcome back, ${loggedUser.name}!`)
      navigate(!isActuallyStaff ? '/dashboard' : '/staff', { replace: true })
    } catch (err) {
      const errorMsg = err.message?.toLowerCase() || ''
      if (errorMsg.includes('invalid login credentials') || errorMsg.includes('user not found')) {
        toast.error('Account not found in Supabase. Please Register this email first!')
      } else {
        toast.error(err.message || 'Quick Sign-In failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const activeSaved = savedAccounts.filter(a => {
    const isStaffRole = a.role === 'agent' || a.role === 'admin'
    return isLogin
      ? (loginTab === 'agency' ? isStaffRole : !isStaffRole)
      : (registerTab === 'agency' ? isStaffRole : !isStaffRole)
  })

  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden bg-void">
      {/* Background */}
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-void via-deep/50 to-void pointer-events-none" />

      {/* Animated glows */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-400/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">

        {/* ── Left: Brand panel ── */}
        <div className="hidden md:flex md:w-[40%] bg-white/5 p-12 flex-col justify-between border-r border-white/5">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <Plane className="w-5 h-5 text-void" />
              </div>
              <span className="font-display font-bold text-2xl text-white">VoyageAI</span>
            </Link>

            <h2 className="font-display text-3xl font-bold text-white mb-6 leading-tight">
              Start your <br />
              <span className="text-gold-400 italic">next adventure</span> here.
            </h2>

            <div className="space-y-6">
              {[
                { icon: Sparkles, text: 'AI-first personalized itineraries', color: 'text-gold-400' },
                { icon: ShieldCheck, text: 'Consolidated checkout options', color: 'text-sky-400' },
                { icon: Users, text: 'Agent override coordination', color: 'text-sage-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-white/5 group-hover:border-gold-400/30 transition-all">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-muted text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-muted text-xs leading-relaxed">
              VoyageAI simplifies journeys for thousands of travelers and agency desk staff everyday.
            </p>
          </div>
        </div>

        {/* ── Right: Forms ── */}
        <div className="flex-1 p-6 sm:p-10 md:p-12 lg:p-14">
          <div className="max-w-md mx-auto">

            {/* Sign In / Register toggle */}
            {!isRecovery && (
              <div className="flex justify-center md:justify-start gap-6 mb-8 border-b border-white/5 pb-2">
                <button
                  onClick={() => { setIsLogin(true); setErrors({}) }}
                  className={`text-lg font-bold pb-2 border-b-2 transition-all ${isLogin ? 'text-white border-gold-400' : 'text-muted border-transparent hover:text-white'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsLogin(false); setErrors({}) }}
                  className={`text-lg font-bold pb-2 border-b-2 transition-all ${!isLogin ? 'text-white border-gold-400' : 'text-muted border-transparent hover:text-white'}`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Sub-tabs */}
            {isLogin && !isRecovery ? (
              <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setLoginTab('customer')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginTab === 'customer' ? 'bg-gold-gradient text-void shadow' : 'text-muted hover:text-white'}`}
                >
                  Customer Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginTab('agency')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginTab === 'agency' ? 'bg-red-500/20 text-red-300 border border-red-500/20 shadow' : 'text-muted hover:text-white'}`}
                >
                  Travel Agency Login
                </button>
              </div>
            ) : (
              !isRecovery && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRegisterTab('customer')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${registerTab === 'customer' ? 'bg-gold-400/10 text-gold-400 border-gold-400/30' : 'glass border-border text-muted hover:text-white'}`}
                  >
                    <User className="w-4 h-4" /> Are you a normal customer?
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterTab('agency')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${registerTab === 'agency' ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'glass border-border text-muted hover:text-white'}`}
                  >
                    <Building2 className="w-4 h-4" /> Travel Agency Member?
                  </button>
                </div>
              )
            )}

            {/* Saved accounts */}
            {activeSaved.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
              >
                <span className="text-[10px] text-gold-400/80 font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Saved Profiles (Click to login)
                </span>
                <div className="space-y-2">
                  {activeSaved.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="w-full p-2.5 rounded-xl border border-white/5 glass hover:border-gold-400/30 hover:bg-gold-400/5 transition-all text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${acc.role === 'user' ? 'bg-sky-500/10 text-sky-400' : 'bg-red-500/10 text-red-300'}`}>
                          {acc.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold">{acc.name}</p>
                          <p className="text-muted text-[10px]">{acc.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted italic flex items-center gap-0.5">
                        {acc.role === 'user' ? 'Customer' : acc.agencyName || 'Staff'} · Quick Sign In
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Main form ── */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Form title row */}
              <div className="flex items-center justify-between">
                <h4 className="text-white text-sm font-bold">
                  {isRecovery
                    ? 'Set New Password'
                    : isLogin
                      ? (loginTab === 'customer' ? 'Customer Sign In' : 'Travel Agency Sign In')
                      : (registerTab === 'customer' ? 'Customer Account Registration' : 'Agency Staff Registry')
                  }
                </h4>

                {/* Info dropdown — customer registration only */}
                {!isLogin && registerTab === 'customer' && (
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowInfoDropdown(true)}
                      onMouseLeave={() => setShowInfoDropdown(false)}
                      onClick={() => setShowInfoDropdown(v => !v)}
                      className="p-1 text-gold-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    >
                      <Info className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider underline">General Info</span>
                    </button>
                    <AnimatePresence>
                      {showInfoDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-56 glass border border-gold-400/20 rounded-xl p-3 shadow-2xl z-30 space-y-2 text-xs text-left"
                        >
                          <p className="text-gold-300 font-bold border-b border-white/5 pb-1">Included My Travel Pages:</p>
                          <ul className="space-y-1 text-muted">
                            <li>✈️ Flight Search: Book domestic &amp; international flights</li>
                            <li>🏨 Stays/Hotels: Premium hotel selection</li>
                            <li>🚂 Train Bookings: Ticket reservations</li>
                            <li>🚌 Bus Booking: Seat reservations</li>
                            <li>🧭 Trip Builder: Consolidated AI itineraries</li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Agency registry options */}
              {!isLogin && registerTab === 'agency' && (
                <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">Agency Registry Options</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-white transition-colors">
                      <input type="radio" name="agencyRegisterType" checked={!isAgencyRegistered} onChange={() => setIsAgencyRegistered(false)} className="accent-red-500" />
                      No, Register New Agency
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-white transition-colors">
                      <input type="radio" name="agencyRegisterType" checked={isAgencyRegistered} onChange={() => setIsAgencyRegistered(true)} className="accent-red-500" />
                      Yes, My Agency is Registered
                    </label>
                  </div>
                  {isAgencyRegistered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs rounded-xl flex items-start gap-2"
                    >
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>Your agency is registered. Fill the details below, new member.</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Name */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Full Name</label>
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                    <input
                      type="text" value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
                      placeholder="John Doe"
                      className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.name}</p>}
                </div>
              )}

              {/* Phone — customer only */}
              {!isLogin && registerTab === 'customer' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                    <input
                      type="tel" value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: '' })) }}
                      placeholder="+91 98765 43210"
                      className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.phone}</p>}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                  <input
                    type="email" value={email} disabled={isRecovery}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })) }}
                    placeholder="name@company.com"
                    className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-bold">Password</label>
                  {isLogin && (
                    <button type="button" onClick={handleForgotPassword} className="text-[10px] text-gold-400 hover:underline">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                  <input
                    type="password" value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })) }}
                    placeholder={isRecovery ? 'New Password' : '••••••••'}
                    className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              {/* Agency fields — registration only */}
              {!isLogin && registerTab === 'agency' && (
                <div className="space-y-4 p-4 border border-white/5 bg-white/[0.01] rounded-2xl">
                  {isAgencyRegistered ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Select Registered Agency</label>
                      <div className="relative">
                        <select
                          value={selectedAgency}
                          onChange={(e) => setSelectedAgency(e.target.value)}
                          className="ai-input w-full px-4 py-3 rounded-2xl text-sm bg-surface text-white border border-border appearance-none cursor-pointer"
                        >
                          {registeredAgencies.map((a) => (
                            // FIX: was a.regId — Supabase returns snake_case a.reg_id
                            <option key={a.id ?? a.name} value={a.name}>{a.name} ({a.reg_id})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">New Agency Name</label>
                        <input
                          type="text" value={agencyName}
                          onChange={(e) => { setAgencyName(e.target.value); if (errors.agencyName) setErrors(p => ({ ...p, agencyName: '' })) }}
                          placeholder="Zen Travel"
                          className="ai-input w-full px-4 py-3 rounded-2xl text-sm"
                        />
                        {errors.agencyName && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.agencyName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">New Agency Registration ID</label>
                        <input
                          type="text" value={agencyRegId}
                          onChange={(e) => { setAgencyRegId(e.target.value); if (errors.agencyRegId) setErrors(p => ({ ...p, agencyRegId: '' })) }}
                          placeholder="ZEN-99"
                          className="ai-input w-full px-4 py-3 rounded-2xl text-sm"
                        />
                        {errors.agencyRegId && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.agencyRegId}</p>}
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Your Position/Role</label>
                    <input
                      type="text" value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Manager, Agent, etc."
                      className="ai-input w-full px-4 py-3 rounded-2xl text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${(!isLogin && registerTab === 'agency') || (isLogin && loginTab === 'agency')
                    ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-red-500/20 hover:shadow-red-500/30'
                    : 'bg-gold-gradient text-void shadow-gold hover:shadow-[0_0_40px_rgba(232,180,41,0.3)]'
                  }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full"
                  />
                ) : (
                  <>
                    {isRecovery
                      ? 'Update Password'
                      : isLogin
                        ? 'Sign In'
                        : (registerTab === 'customer' ? 'Create Customer Account' : 'Register & Grant Staff Access')
                    }
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {isRecovery && (
                <button
                  type="button"
                  onClick={() => setIsRecovery(false)}
                  className="w-full text-xs text-muted hover:text-white transition-colors"
                >
                  Cancel Password Reset
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="px-4 bg-[#0B111B] text-muted">Or continue with</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 py-3 glass border border-white/5 hover:bg-white/5 rounded-xl transition-all text-xs font-medium text-white"
              >
                <Globe className="w-4 h-4" /> Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 py-3 glass border border-white/5 hover:bg-white/5 rounded-xl transition-all text-xs font-medium text-white"
              >
                <FaGithub className="w-4 h-4" /> Github
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-muted">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}) }}
                className="text-gold-400 font-bold hover:underline"
              >
                {isLogin ? 'Register now' : 'Sign in here'}
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
