import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  DollarSign,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import StaffNav from '../components/layout/StaffNav'

const STAFF_LINKS = [
  {
    title: 'Agent Desk',
    desc: 'Manage escalated cases, traveler support queues, urgent trip issues, and agent actions.',
    to: '/agent',
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    title: 'Finance Office',
    desc: 'View revenue data, booking payments, refund workflows, invoices, and ledger activity.',
    to: '/finance',
    icon: DollarSign,
    color: 'text-gold-400',
    bg: 'bg-gold-400/10 border-gold-400/20',
  },
  {
    title: 'Admin Alerts',
    desc: 'Track operational alerts, finance notifications, booking exceptions, and routing rules.',
    to: '/finance/notifications',
    icon: Bell,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
]

export default function StaffPage() {
  const { user } = useAuth()
  const canUseStaff = user?.role === 'agent' || user?.role === 'admin'

  return (
    <div className="min-h-screen pt-36 pb-16 px-4">
      <StaffNav />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Travel Agent Portal
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Staff Section</h1>
          <p className="text-muted max-w-2xl">
            Dedicated workspaces for travel agents managing customer support, finance, and site operations.
          </p>
        </motion.div>

        {!canUseStaff && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-red-500/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <LockKeyhole className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Staff login required</h2>
                <p className="text-muted text-sm mt-1">
                  Agent Desk, Finance Office, and Admin Alerts are separate from customer travel pages.
                </p>
              </div>
            </div>
            <Link
              to="/staff-login"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500/15 border border-red-500/25 text-red-300 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
            >
              Staff Login
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
                  to={canUseStaff ? item.to : '/staff-login'}
                  className="glass border border-border rounded-2xl p-5 h-full flex flex-col justify-between hover:border-red-400/30 hover:bg-white/[0.03] transition-all group"
                >
                  <div>
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${item.bg}`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h2 className="font-display text-xl font-bold text-white mb-2">{item.title}</h2>
                    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-red-300">
                    <span>{canUseStaff ? 'Open workspace' : 'Login to open'}</span>
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