import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail, Plane, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function StaffLoginPage() {
  const [email, setEmail] = useState('agent@voyageai.com')
  const [password, setPassword] = useState('agent123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/staff'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid staff email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
try {
  const loggedInUser = await login(email, password, { staff: true })
  
  if (loggedInUser.role !== 'agent' && loggedInUser.role !== 'admin') {
    await logout()
    setError('Access denied. Only travel agents and admins can use the Staff Portal.')
    return
  }
  
  toast.success('Staff access granted')
  navigate(from, { replace: true })
} catch (err) {
  toast.error(err.message || 'Staff login failed')
} finally {
  setLoading(false)
}
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1fr] glass border border-red-500/15 rounded-3xl overflow-hidden">
        <div className="hidden lg:flex bg-red-500/5 border-r border-white/5 p-10 flex-col justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Plane className="w-5 h-5 text-void" />
            </div>
            <span className="font-display font-bold text-2xl text-white">VoyageAI</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-bold uppercase tracking-wider mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Portal
            </div>
            <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
              Travel agent operations login.
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              Access Agent Desk, Finance Office, and Admin Alerts without entering customer My Travel pages.
            </p>
          </div>

          <p className="text-muted text-xs">Use an agent or admin account for staff operations.</p>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-8">
            <Link to="/staff" className="text-red-300 text-xs font-bold hover:underline">
              Staff Section
            </Link>
            <h2 className="text-2xl font-bold text-white mt-3 mb-2">Staff Login</h2>
            <p className="text-muted text-sm">Sign in as a travel agent to manage the site.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Staff Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-red-300 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted font-bold ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-red-300 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="ai-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-500/15 border border-red-500/25 text-red-200 font-bold rounded-2xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Enter Staff Portal'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">Customer account?</span>
            <Link to="/login" className="text-gold-400 font-bold hover:underline">
              Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
