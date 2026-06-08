import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Users, Building2, Phone, Briefcase, ArrowRight,
  ChevronDown, User, Plane
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/apiClient'
import { Link } from 'react-router-dom'

export default function CompleteProfile() {
  const { completeProfileRegister } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tempToken    = searchParams.get('token')
  const defaultEmail = searchParams.get('email') || ''
  const defaultName  = searchParams.get('name') || ''
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

  const inputClass = "w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
  const inputClassPlain = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">VoyageAI</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
              Complete Profile Setup
            </div>
            <h1 className="text-slate-900 text-3xl font-bold tracking-tight">Tell us about yourself</h1>
            <p className="text-slate-500 text-sm mt-2">Just a few quick details to configure your workspace.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setRole('user'); setErrors({}) }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center flex flex-col items-center gap-2.5 ${
                  role === 'user'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold text-sm ${role === 'user' ? 'text-blue-700' : 'text-slate-700'}`}>Traveler Account</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Plan and book AI-first trips</div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setRole('agent'); setErrors({}) }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center flex flex-col items-center gap-2.5 ${
                  role === 'agent'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'agent' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold text-sm ${role === 'agent' ? 'text-blue-700' : 'text-slate-700'}`}>Travel Agent</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Manage staff portals and queries</div>
                </div>
              </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Verified email */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-500 font-medium">Verified Google Account</span>
                <span className="text-slate-800 font-semibold font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">{defaultEmail}</span>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
                    placeholder="John Doe"
                    className={inputClass}
                    required
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: '' })) }}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                    required
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
              </div>

              {/* Agent-only fields */}
              {role === 'agent' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                  {/* Position */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Your Position / Role</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Manager, Agent, etc."
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* Agency options */}
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">Agency Registry Options</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                        <input type="radio" name="agencyRegisterType" checked={isAgencyRegistered} onChange={() => setIsAgencyRegistered(true)} className="accent-blue-600" />
                        Join Registered Agency
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                        <input type="radio" name="agencyRegisterType" checked={!isAgencyRegistered} onChange={() => setIsAgencyRegistered(false)} className="accent-blue-600" />
                        Register New Agency
                      </label>
                    </div>

                    {isAgencyRegistered ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Select Registered Agency</label>
                        <div className="relative">
                          <select
                            value={selectedAgency}
                            onChange={(e) => setSelectedAgency(e.target.value)}
                            className={`${inputClassPlain} appearance-none cursor-pointer`}
                          >
                            {registeredAgencies.length === 0 && (
                              <option value="">No agencies registered yet</option>
                            )}
                            {registeredAgencies.map((a) => (
                              <option key={a.name} value={a.name}>{a.name} ({a.reg_id})</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">New Agency Name</label>
                          <input
                            type="text"
                            value={agencyName}
                            onChange={(e) => { setAgencyName(e.target.value); if (errors.agencyName) setErrors(p => ({ ...p, agencyName: '' })) }}
                            placeholder="Zen Travel"
                            className={inputClassPlain}
                            required
                          />
                          {errors.agencyName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.agencyName}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Agency Registration ID</label>
                          <input
                            type="text"
                            value={agencyRegId}
                            onChange={(e) => { setAgencyRegId(e.target.value); if (errors.agencyRegId) setErrors(p => ({ ...p, agencyRegId: '' })) }}
                            placeholder="ZEN-99"
                            className={inputClassPlain}
                            required
                          />
                          {errors.agencyRegId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.agencyRegId}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
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
        </div>
      </div>
    </div>
  )
}
