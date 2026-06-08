
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Bell, DollarSign, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StaffNav from '../components/layout/StaffNav'

const STAFF_LINKS = [
  {
    title: 'Agent Desk',
    desc: 'Manage escalated cases, traveler support queues, urgent trip issues, and agent actions.',
    to: '/agent',
    icon: AlertTriangle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    hover: 'hover:border-blue-400',
  },
  {
    title: 'Finance Office',
    desc: 'View revenue data, booking payments, refund workflows, invoices, and ledger activity.',
    to: '/finance',
    icon: DollarSign,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    hover: 'hover:border-blue-400',
  },
  {
    title: 'Admin Alerts',
    desc: 'Track operational alerts, finance notifications, booking exceptions, and routing rules.',
    to: '/finance/notifications',
    icon: Bell,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    hover: 'hover:border-blue-400',
  },
]

export default function StaffPage() {
  const { user } = useAuth()
  const canUseStaff = user?.role === 'agent' || user?.role === 'admin' || user?.role === 'finance'

  return (
    <div className="min-h-screen bg-white pt-36 pb-16 px-4">
      <StaffNav />
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Travel Agent Portal
          </div>
          <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Staff Section</h1>
          <p className="text-slate-500 max-w-2xl">
            Dedicated workspaces for travel agents managing customer support, finance, and site operations.
          </p>
        </motion.div>

        {!canUseStaff && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <LockKeyhole className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-slate-900 font-semibold">Staff login required</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Agent Desk, Finance Office, and Admin Alerts are restricted to staff accounts.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
            >
              Sign In as Staff
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {STAFF_LINKS.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={canUseStaff ? item.to : '/login'}
                  className={`bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between ${item.hover} hover:shadow-md transition-all group`}
                >
                  <div>
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${item.bg}`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900 mb-2">{item.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-blue-600">
                    <span>{canUseStaff ? 'Open workspace' : 'Sign in to access'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
