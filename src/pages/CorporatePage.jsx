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
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Users,
    title: 'Traveler Profiles',
    desc: 'Employee details, passport info, and seat preferences are pre-filled. Zero re-entry on every booking.',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: BarChart3,
    title: 'Spend Analytics',
    desc: 'Dashboard for admins showing team travel spend, savings vs market rate, and policy compliance scores.',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Zap,
    title: 'One-Click Approval',
    desc: 'Managers get instant notifications and can approve or reject trips from mobile in seconds.',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Globe2,
    title: 'Multi-Destination',
    desc: 'Multi-city and international routes with automatic transit visa warnings before booking.',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Lock,
    title: 'SSO & HRMS Integration',
    desc: 'Connect with your existing HR systems. Employee data syncs automatically.',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-mono text-blue-600 tracking-wider uppercase font-bold">Corporate Travel</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 mb-5">
            Business travel,<br />
            <span className="italic" style={{
              background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 50%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>finally intelligent.</span>
          </h1>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Give your employees an AI booking assistant that knows your policies, enforces fare caps,
            and routes exceptions to approvers — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/chat"
                className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                <Sparkles className="w-5 h-5" />
                Book a Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className="inline-flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 font-bold rounded-2xl transition-all shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  TechCorp India — Travel Dashboard
                </h2>
                <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 text-xs rounded-full font-semibold">
                  Live Demo
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'This Month Spend', value: '₹1.24L', icon: DollarSign, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', sub: '+8% vs last month', subColor: 'text-amber-600' },
                  { label: 'Trips Booked', value: '47', icon: Building2, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', sub: '38 automated', subColor: 'text-blue-600' },
                  { label: 'Policy Compliance', value: '94%', icon: Shield, iconBg: 'bg-green-50', iconColor: 'text-green-600', sub: '↑ from 87%', subColor: 'text-green-600' },
                  { label: 'Avg Savings/Trip', value: '₹1,200', icon: TrendingDown, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', sub: 'vs direct booking', subColor: 'text-purple-600' },
                ].map(({ label, value, icon: Icon, iconBg, iconColor, sub, subColor }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                  >
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-2`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="font-bold text-2xl text-slate-900">{value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                    <div className={`text-xs mt-1 font-semibold ${subColor}`}>{sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Team trips table */}
              <div>
                <h3 className="text-slate-700 font-semibold mb-3 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Pending & Recent Trips
                </h3>
                <div className="space-y-2">
                  {MOCK_TEAM_TRIPS.map((trip, i) => (
                    <motion.div
                      key={trip.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex-wrap hover:bg-white transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold">{trip.name[0]}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 text-sm font-medium">{trip.name}</div>
                        <div className="text-slate-400 text-xs">{trip.dept}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-slate-800 text-sm font-mono font-semibold">{trip.route}</div>
                        <div className="text-slate-400 text-xs">{trip.date}</div>
                      </div>

                      <div className="text-blue-700 font-semibold text-sm">{trip.fare}</div>

                      <div className="flex items-center gap-2">
                        {trip.policy !== 'ok' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-amber-600 text-xs font-medium">{trip.policy}</span>
                          </div>
                        )}
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          trip.status === 'approved'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : trip.status === 'pending'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </div>
                      </div>

                      {trip.status === 'pending' && (
                        <div className="flex gap-1">
                          <button className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs rounded-lg font-semibold hover:bg-green-100 transition-colors">
                            Approve
                          </button>
                          <button className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-lg font-medium hover:bg-slate-200 transition-colors">
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
            className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Your policies, our rules.</h3>
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">
              Define your company travel policy once. VoyageAI enforces it on every booking, every time.
            </p>
            <div className="space-y-2.5">
              {POLICIES.map(({ label, status, icon }) => (
                <div key={label} className="flex items-center gap-3 py-1">
                  <span className="text-base">{icon}</span>
                  <span className="text-slate-700 text-sm flex-1">{label}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    status ? 'bg-green-100 border border-green-300' : 'bg-slate-100 border border-slate-200'
                  }`}>
                    {status && <CheckCircle className="w-3 h-3 text-green-600" />}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-5">Fully configurable. Add unlimited custom rules.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm mb-1">Without VoyageAI</p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Employees book on personal cards, skip policy, submit expense reports 3 weeks late,
                    and finance spends days reconciling. Average cost: ₹8,200/trip.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm mb-1">With VoyageAI</p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    All bookings happen in one platform. Policy is enforced automatically.
                    Finance gets real-time reports. Average cost: ₹5,400/trip.
                  </p>
                  <p className="text-green-700 text-xs font-bold mt-1">→ Save ₹2,800 per trip on average</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-slate-800 font-semibold mb-3 text-sm">Trusted by teams at</p>
              <div className="flex gap-3 flex-wrap">
                {['TechCorp India', 'Nexus BPO', 'Atlas Pharma', 'Kiran Infra'].map(co => (
                  <div key={co} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
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
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100 mb-4">Features</span>
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Everything your travel team needs.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORPORATE_FEATURES.map(({ icon: Icon, title, desc, iconBg, iconColor }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-blue-100 text-center"
          style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #EEF2FF 70%, #F0F9FF 100%)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 p-10 lg:p-14">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
            >
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Ready to modernize your <br />corporate travel?
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
              Setup takes under 30 minutes. We'll configure your policies, import your employee list,
              and have your team booking through VoyageAI the same day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                >
                  <Sparkles className="w-5 h-5" /> Talk to Sales
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium"
              >
                Try self-serve booking <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}