import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Users, Building2, Phone, Briefcase, ArrowRight,
  ChevronDown, User, Plane, Sparkles, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/apiClient'
import { Link } from 'react-router-dom'

export default function CompleteProfile() {
  const { completeProfileRegister } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tempToken     = searchParams.get('token')
  const defaultEmail  = searchParams.get('email') || ''
  const defaultName   = searchParams.get('name') || ''
  const intentFromUrl = searchParams.get('intent') === 'agent' ? 'agent' : 'user'

  const [role, setRole] = useState(intentFromUrl)
  const [name, setName] = useState(defaultName)
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('Agent')
  const [isAgencyRegistered, setIsAgencyRegistered] = useState(true)
  const [selectedAgency, setSelectedAgency] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyRegId, setAgencyRegId] = useState('')
  const [registeredAgencies, setRegisteredAgencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!tempToken) {
      toast.error('Session expired or invalid. Please sign in again.')
      navigate('/login')
      return
    }
    const fetchAgencies = async () => {
      try {
        const agencies = await api.request('/api/agencies')
        setRegisteredAgencies(agencies)
        if (agencies.length > 0) setSelectedAgency(agencies[0].name)
      } catch (err) {
        console.error('Failed to load agencies', err)
      }
    }
    fetchAgencies()
  }, [tempToken, navigate])

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Full name is required'
    if (!phone.trim()) newErrors.phone = 'Phone number is required'
    if (role === 'agent' && !isAgencyRegistered) {
      if (!agencyName.trim()) newErrors.agencyName = 'Agency name is required'
      if (!agencyRegId.trim()) newErrors.agencyRegId = 'Agency registration ID is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const details = {
        token: tempToken,
        role,
        name,
        phone,
        position: role === 'agent' ? position : undefined,
        agencyName: role === 'agent' ? (isAgencyRegistered ? selectedAgency : agencyName) : undefined,
        agencyRegId: role === 'agent' && !isAgencyRegistered ? agencyRegId : undefined,
        isNewAgency: role === 'agent' && !isAgencyRegistered
      }
      const user = await completeProfileRegister(details)
      toast.success(`Welcome to VoyageAI, ${user.name}!`)
      const isStaff = ['agent', 'admin', 'finance'].includes(user.role)
      navigate(isStaff ? '/staff' : '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Profile completion failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = "w-full py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
  const inputWithIcon = `${inputBase} pl-11 pr-4`
  const inputPlain = `${inputBase} px-4`

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top bar — matches HomePage footer style ── */}
      <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
          >
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900">VoyageAI</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Profile Setup
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="flex min-h-[calc(100vh-65px)]">

        {/* Left decorative panel — mirrors LoginPage */}
        <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-12"
          style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EEF2FF 100%)' }}
        >
          {/* Soft orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Step 2 of 2</span>
              <h2 className="font-display text-4xl font-bold text-slate-900 leading-tight mt-2">
                Almost there.<br />
                <span className="italic" style={{
                  background: 'linear-gradient(135deg, #1A6EBD 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Let's set you up.</span>
              </h2>
              <p className="text-slate-500 text-sm mt-4 leading-relaxed">
                Tell us a bit about yourself so we can personalise your VoyageAI workspace.
              </p>
            </div>

            <div className="space-y-5 mt-12">
              {[
                { icon: CheckCircle2, text: 'Google account verified', done: true },
                { icon: User, text: 'Personal details', done: false },
                { icon: Plane, text: 'Workspace ready', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.done
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-400'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium ${item.done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.text}
                  </span>
                  {item.done && (
                    <span className="ml-auto text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[11px] text-slate-400 leading-relaxed border-t border-slate-200 pt-6">
            Your information is protected with bank-grade encryption and never shared with third parties.
          </p>
        </div>

        {/* Right: form */}
        <div className="flex-1 flex items-start justify-center py-12 px-4 overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Mobile header */}
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-slate-900 text-2xl font-bold">Tell us about yourself</h1>
              <p className="text-slate-500 text-sm mt-1">Just a few details to set up your workspace.</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h1 className="text-slate-900 text-2xl font-bold">Complete your profile</h1>
              <p className="text-slate-500 text-sm mt-1">Just a few details to personalise your workspace.</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              {[
                { value: 'user', label: 'Traveler', sub: 'Plan & book AI-first trips', icon: Users },
                { value: 'agent', label: 'Travel Agent', sub: 'Manage staff & queries', icon: Building2 },
              ].map(({ value, label, sub, icon: Icon }) => (
                <motion.div
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setRole(value); setErrors({}) }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center flex flex-col items-center gap-2 ${
                    role === value
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === value ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${role === value ? 'text-blue-700' : 'text-slate-700'}`}>{label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm space-y-5">

              {/* Verified email pill */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-slate-500 font-medium">Verified account</span>
                </div>
                <span className="text-xs text-slate-800 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono truncate max-w-[180px]">
                  {defaultEmail}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
                      placeholder="John Doe"
                      className={inputWithIcon}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: '' })) }}
                      placeholder="+91 98765 43210"
                      className={inputWithIcon}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone}</p>}
                </div>

                {/* Agent-only fields */}
                <AnimatePresence>
                  {role === 'agent' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 overflow-hidden"
                    >
                      {/* Position */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Position</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Manager, Agent, etc."
                            className={inputWithIcon}
                          />
                        </div>
                      </div>

                      {/* Agency section */}
                      <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider block">Agency Options</span>
                        <div className="flex gap-5">
                          {[
                            { val: true, label: 'Join Registered' },
                            { val: false, label: 'Register New' },
                          ].map(({ val, label }) => (
                            <label key={label} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                              <input
                                type="radio"
                                name="agencyRegisterType"
                                checked={isAgencyRegistered === val}
                                onChange={() => setIsAgencyRegistered(val)}
                                className="accent-blue-600"
                              />
                              {label}
                            </label>
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          {isAgencyRegistered ? (
                            <motion.div key="select" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Agency</label>
                              <div className="relative">
                                <select
                                  value={selectedAgency}
                                  onChange={(e) => setSelectedAgency(e.target.value)}
                                  className={`${inputPlain} appearance-none cursor-pointer`}
                                >
                                  {registeredAgencies.length === 0 && <option value="">No agencies registered yet</option>}
                                  {registeredAgencies.map((a) => (
                                    <option key={a.name} value={a.name}>{a.name} ({a.reg_id})</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div key="new" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency Name</label>
                                <input
                                  type="text"
                                  value={agencyName}
                                  onChange={(e) => { setAgencyName(e.target.value); if (errors.agencyName) setErrors(p => ({ ...p, agencyName: '' })) }}
                                  placeholder="Zen Travel"
                                  className={inputPlain}
                                />
                                {errors.agencyName && <p className="text-red-500 text-xs font-medium">{errors.agencyName}</p>}
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration ID</label>
                                <input
                                  type="text"
                                  value={agencyRegId}
                                  onChange={(e) => { setAgencyRegId(e.target.value); if (errors.agencyRegId) setErrors(p => ({ ...p, agencyRegId: '' })) }}
                                  placeholder="ZEN-99"
                                  className={inputPlain}
                                />
                                {errors.agencyRegId && <p className="text-red-500 text-xs font-medium">{errors.agencyRegId}</p>}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                  style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>

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