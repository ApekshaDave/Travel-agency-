import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building2,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Clock,
  Zap,
  BarChart3,
  Globe2,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  Settings,
  Lock
} from 'lucide-react'

const POLICIES = [
  { label: 'Economy Only', status: true, icon: '✈' },
  { label: 'Fare Cap: ₹8,000', status: true, icon: '💰' },
  { label: 'Approval required >₹10K', status: true, icon: '✅' },
  { label: 'Preferred: IndiGo, Air India', status: true, icon: '⭐' },
  { label: '30-day advance booking', status: false, icon: '📅' },
]

const CORPORATE_FEATURES = [
  {
    icon: Shield,
    title: 'Policy Auto-Enforcement',
    desc: 'Fare caps, preferred airlines, and approval workflows are applied in real-time — no manual checks needed.',
    color: 'text-gold-400',
  },
  {
    icon: Users,
    title: 'Traveler Profiles',
    desc: 'Employee details, passport info, and seat preferences are pre-filled. Zero re-entry on every booking.',
    color: 'text-sky-400',
  },
  {
    icon: BarChart3,
    title: 'Spend Analytics',
    desc: 'Dashboard for admins showing team travel spend, savings vs market rate, and policy compliance scores.',
    color: 'text-sage-400',
  },
  {
    icon: Zap,
    title: 'One-Click Approval',
    desc: 'Managers get instant notifications and can approve or reject trips from mobile in seconds.',
    color: 'text-gold-400',
  },
  {
    icon: Globe2,
    title: 'Multi-Destination',
    desc: 'Multi-city and international routes with automatic transit visa warnings before booking.',
    color: 'text-sky-400',
  },
  {
    icon: Lock,
    title: 'SSO & HRMS Integration',
    desc: 'Connect with your existing HR systems. Employee data syncs automatically.',
    color: 'text-sage-400',
  },
]

const MOCK_TEAM_TRIPS = [
  {
    name: 'Rohit Sharma', dept: 'Sales', route: 'DEL → BOM',
    date: '15 Mar', fare: '₹5,800', status: 'approved', policy: 'ok',
  },
  {
    name: 'Priya Mehta', dept: 'Engineering', route: 'BLR → HYD',
    date: '18 Mar', fare: '₹3,200', status: 'pending', policy: 'ok',
  },
  {
    name: 'Arjun Kapoor', dept: 'Finance', route: 'BOM → DEL',
    date: '20 Mar', fare: '₹12,500', status: 'flagged', policy: 'exceeds cap',
  },
  {
    name: 'Sneha Iyer', dept: 'HR', route: 'MAA → CCU',
    date: '22 Mar', fare: '₹6,100', status: 'approved', policy: 'ok',
  },
]

export default function CorporatePage() {
  const [demoMode, setDemoMode] = useState(false)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass border border-sky-400/20 rounded-full mb-6">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-mono text-sky-300 tracking-wider uppercase">Corporate Travel</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5">
            Business travel,<br />
            <span className="text-shimmer italic">finally intelligent.</span>
          </h1>
          <p className="text-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Give your employees an AI booking assistant that knows your policies, enforces fare caps,
            and routes exceptions to approvers — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/chat"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-base rounded-2xl shadow-gold hover:shadow-[0_0_40px_rgba(232,180,41,0.5)] transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Book a Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className="inline-flex items-center gap-2 px-6 py-4 glass border border-border hover:border-sky-400/30 text-white font-medium rounded-2xl transition-all"
            >
              <BarChart3 className="w-4 h-4 text-sky-400" />
              {demoMode ? 'Hide' : 'See'} Admin Dashboard
            </button>
          </div>
        </motion.div>

        {/* Admin Dashboard Demo */}
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="glass gradient-border rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-white">
                  TechCorp India — Travel Dashboard
                </h2>
                <span className="px-3 py-1 bg-sage-400/15 text-sage-400 border border-sage-400/20 text-xs rounded-full font-medium">
                  Live Demo
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'This Month Spend', value: '₹1.24L', icon: DollarSign, color: 'text-gold-400', sub: '+8% vs last month' },
                  { label: 'Trips Booked', value: '47', icon: Building2, color: 'text-sky-400', sub: '38 automated' },
                  { label: 'Policy Compliance', value: '94%', icon: Shield, color: 'text-sage-400', sub: '↑ from 87%' },
                  { label: 'Avg Savings/Trip', value: '₹1,200', icon: TrendingDown, color: 'text-gold-400', sub: 'vs direct booking' },
                ].map(({ label, value, icon: Icon, color, sub }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass border border-border rounded-xl p-4"
                  >
                    <Icon className={`w-4 h-4 ${color} mb-2`} />
                    <div className="font-bold text-2xl text-white">{value}</div>
                    <div className="text-muted text-xs mt-0.5">{label}</div>
                    <div className={`text-xs mt-1 ${color}`}>{sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Team trips table */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted" /> Pending & Recent Trips
                </h3>
                <div className="space-y-2">
                  {MOCK_TEAM_TRIPS.map((trip, i) => (
                    <motion.div
                      key={trip.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-3 glass border border-border rounded-xl flex-wrap"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sky-400 text-xs font-bold">{trip.name[0]}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{trip.name}</div>
                        <div className="text-muted text-xs">{trip.dept}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-white text-sm font-mono">{trip.route}</div>
                        <div className="text-muted text-xs">{trip.date}</div>
                      </div>

                      <div className="text-gold-400 font-semibold text-sm">{trip.fare}</div>

                      <div className="flex items-center gap-2">
                        {trip.policy !== 'ok' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-300 text-xs">{trip.policy}</span>
                          </div>
                        )}
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          trip.status === 'approved' ? 'bg-sage-400/10 text-sage-400 border-sage-400/20' :
                          trip.status === 'pending' ? 'bg-sky-400/10 text-sky-400 border-sky-400/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </div>
                      </div>

                      {trip.status === 'pending' && (
                        <div className="flex gap-1">
                          <button className="px-3 py-1.5 bg-sage-400/15 text-sage-400 border border-sage-400/20 text-xs rounded-lg font-medium">
                            Approve
                          </button>
                          <button className="px-3 py-1.5 glass border border-border text-muted text-xs rounded-lg">
                            Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Policy panel */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass gradient-border rounded-3xl p-7"
          >
            <Settings className="w-8 h-8 text-gold-400 mb-4" />
            <h3 className="font-display text-2xl font-bold text-white mb-2">Your policies, our rules.</h3>
            <p className="text-muted text-sm mb-5 leading-relaxed">
              Define your company travel policy once. VoyageAI enforces it on every booking, every time.
            </p>
            <div className="space-y-2.5">
              {POLICIES.map(({ label, status, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <span className="text-white/80 text-sm flex-1">{label}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    status ? 'bg-sage-400/20 border border-sage-400/30' : 'bg-surface border border-border'
                  }`}>
                    {status && <CheckCircle className="w-3 h-3 text-sage-400" />}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted text-xs mt-5">Fully configurable. Add unlimited custom rules.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="glass border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm mb-1">Without VoyageAI</p>
                  <p className="text-muted text-xs leading-relaxed">
                    Employees book on personal cards, skip policy, submit expense reports 3 weeks late,
                    and finance spends days reconciling. Average cost: ₹8,200/trip.
                  </p>
                </div>
              </div>
            </div>
            <div className="glass border border-sage-400/20 rounded-2xl p-5 bg-sage-400/5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-sage-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium text-sm mb-1">With VoyageAI</p>
                  <p className="text-muted text-xs leading-relaxed">
                    All bookings happen in one platform. Policy is enforced automatically.
                    Finance gets real-time reports. Average cost: ₹5,400/trip.
                  </p>
                  <p className="text-sage-400 text-xs font-semibold mt-1">→ Save ₹2,800 per trip on average</p>
                </div>
              </div>
            </div>
            <div className="glass border border-border rounded-2xl p-5">
              <p className="text-white font-semibold mb-3 text-sm">Trusted by teams at</p>
              <div className="flex gap-4 flex-wrap">
                {['TechCorp India', 'Nexus BPO', 'Atlas Pharma', 'Kiran Infra'].map(co => (
                  <div key={co} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-muted">
                    {co}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-display text-3xl font-bold text-white text-center mb-10">
            Everything your travel team needs.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORPORATE_FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="glass border border-border rounded-2xl p-5 group"
              >
                <Icon className={`w-7 h-7 ${color} mb-3 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass gradient-border rounded-3xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold-400/8 rounded-full blur-3xl" />
          <Building2 className="w-10 h-10 text-gold-400 mx-auto mb-5" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Ready to modernize your <br />corporate travel?
          </h2>
          <p className="text-muted mb-7 max-w-lg mx-auto text-sm leading-relaxed">
            Setup takes under 30 minutes. We'll configure your policies, import your employee list,
            and have your team booking through VoyageAI the same day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/chat"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-2xl shadow-gold hover:shadow-[0_0_40px_rgba(232,180,41,0.5)] transition-all"
            >
              <Sparkles className="w-5 h-5" /> Talk to Sales
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold-400 transition-colors font-medium"
            >
              Try self-serve booking <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
