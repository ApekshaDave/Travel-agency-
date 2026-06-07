import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Users, Building2, Phone, Briefcase, ArrowRight, 
  Sparkles, CheckCircle2, ChevronDown, PlusCircle, User 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/apiClient'

export default function CompleteProfile() {
  const { completeProfileRegister } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tempToken = searchParams.get('token')
  const defaultEmail = searchParams.get('email') || ''
  const defaultName = searchParams.get('name') || ''

  // Form state
  const [role, setRole] = useState('user') // 'user' or 'agent'
  const [name, setName] = useState(defaultName)
  const [phone, setPhone] = useState('')
  
  // Agent specific
  const [position, setPosition] = useState('Agent')
  const [isAgencyRegistered, setIsAgencyRegistered] = useState(true)
  const [selectedAgency, setSelectedAgency] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyRegId, setAgencyRegId] = useState('')

  const [registeredAgencies, setRegisteredAgencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch existing agencies
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
        if (agencies.length > 0) {
          setSelectedAgency(agencies[0].name)
        }
      } catch (err) {
        console.error('Failed to load agencies', err)
      }
    }
    fetchAgencies()
  }, [tempToken, navigate])

  const validate = () => {
    let isValid = true
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Full name is required'
      isValid = false
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
      isValid = false
    }

    if (role === 'agent') {
      if (!isAgencyRegistered) {
        if (!agencyName.trim()) {
          newErrors.agencyName = 'Agency name is required'
          isValid = false
        }
        if (!agencyRegId.trim()) {
          newErrors.agencyRegId = 'Agency registration ID is required'
          isValid = false
        }
      }
    }

    setErrors(newErrors)
    return isValid
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
      
      const isStaff = user.role === 'agent' || user.role === 'admin' || user.role === 'finance'
      navigate(isStaff ? '/staff' : '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Profile completion failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-20 px-4 bg-void">
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-gold-400/20 text-gold-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Complete Profile Setup
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">Tell us about yourself</h1>
          <p className="text-muted text-sm mt-2">Just a few quick details to configure your customizable workspaces.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="glass border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle line background effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />

          {/* Role Cards Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setRole('user'); setErrors({}); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all text-center flex flex-col items-center gap-2.5 ${
                role === 'user' 
                  ? 'border-gold-400/30 bg-gold-400/5 text-white' 
                  : 'border-white/5 hover:border-white/10 text-muted'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'user' ? 'bg-gold-400/10 text-gold-400' : 'bg-white/5'}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Traveler Account</div>
                <div className="text-[10px] opacity-70 mt-0.5">Plan and book AI-first trips</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setRole('agent'); setErrors({}); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all text-center flex flex-col items-center gap-2.5 ${
                role === 'agent' 
                  ? 'border-red-400/30 bg-red-400/5 text-white' 
                  : 'border-white/5 hover:border-white/10 text-muted'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'agent' ? 'bg-red-400/10 text-red-400' : 'bg-white/5'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Travel Agent</div>
                <div className="text-[10px] opacity-70 mt-0.5">Manage staff portals and queries</div>
              </div>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Displaying verified email */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs flex justify-between items-center">
              <span className="text-muted">Verified Google Account</span>
              <span className="text-white font-semibold font-mono bg-white/5 px-2.5 py-1 rounded-lg">{defaultEmail}</span>
            </div>

            {/* Common field: Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                  }}
                  placeholder="John Doe"
                  className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                  required
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.name}</p>}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:${role === 'agent' ? 'text-red-400' : 'text-gold-400'} transition-colors`} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
                  }}
                  placeholder="+91 98765 43210"
                  className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                  required
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.phone}</p>}
            </div>

            {/* Travel Agent Specific */}
            {role === 'agent' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                
                {/* Position / Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Your Position/Role</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-red-400 transition-colors" />
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Manager, Agent, etc."
                      className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Agency Registry Choices */}
                <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">Agency Registry Options</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-white transition-colors">
                      <input
                        type="radio"
                        name="agencyRegisterType"
                        checked={isAgencyRegistered}
                        onChange={() => setIsAgencyRegistered(true)}
                        className="accent-red-500"
                      />
                      Join Registered Agency
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-white transition-colors">
                      <input
                        type="radio"
                        name="agencyRegisterType"
                        checked={!isAgencyRegistered}
                        onChange={() => setIsAgencyRegistered(false)}
                        className="accent-red-500"
                      />
                      Register New Agency
                    </label>
                  </div>

                  {/* Selecting Registered Agency */}
                  {isAgencyRegistered ? (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] uppercase tracking-widest text-muted font-bold block ml-1">Select Registered Agency</label>
                      <div className="relative">
                        <select
                          value={selectedAgency}
                          onChange={(e) => setSelectedAgency(e.target.value)}
                          className="ai-input w-full px-4 py-3.5 rounded-2xl text-sm bg-surface text-white border border-border appearance-none cursor-pointer"
                        >
                          {registeredAgencies.map((a) => (
                            <option key={a.name} value={a.name}>{a.name} ({a.reg_id})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    /* Register new agency inputs */
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">New Agency Name</label>
                        <input
                          type="text"
                          value={agencyName}
                          onChange={(e) => {
                            setAgencyName(e.target.value)
                            if (errors.agencyName) setErrors(prev => ({ ...prev, agencyName: '' }))
                          }}
                          placeholder="Zen Travel"
                          className="ai-input w-full px-4 py-3 rounded-2xl text-sm"
                          required
                        />
                        {errors.agencyName && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.agencyName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">New Agency Registration ID</label>
                        <input
                          type="text"
                          value={agencyRegId}
                          onChange={(e) => {
                            setAgencyRegId(e.target.value)
                            if (errors.agencyRegId) setErrors(prev => ({ ...prev, agencyRegId: '' }))
                          }}
                          placeholder="ZEN-99"
                          className="ai-input w-full px-4 py-3 rounded-2xl text-sm"
                          required
                        />
                        {errors.agencyRegId && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.agencyRegId}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-6 text-void font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'agent' 
                  ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-red-500/20' 
                  : 'bg-gold-gradient text-void shadow-gold'
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
                  <span>Create Account & Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
