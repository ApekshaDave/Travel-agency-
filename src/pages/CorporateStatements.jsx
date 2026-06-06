import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building2, ChevronRight, Download, Send, FileText,
  Plane, DollarSign, TrendingUp, TrendingDown,Sparkles, Mail, Shield, Search
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { formatINR } from '../utils/billingEngine'
import toast from 'react-hot-toast'
import StaffNav from '../components/layout/StaffNav'

// ── Mock corporate accounts ───────────────────────────────────────────────────
const CORPORATE_ACCOUNTS = [
  {
    id: 'CORP-001',
    name: 'TechCorp India',
    logo: '🔵',
    contact: 'Sneha Iyer',
    email: 'finance@techcorp.in',
    gstin: '27AATCI2345B1Z8',
    plan: 'Enterprise',
    creditLimit: 500000,
    currentBalance: 48200,
    totalThisMonth: 48200,
    totalLastMonth: 42800,
    trips: 23,
    employees: 150,
    policyCompliance: 94,
    status: 'active',
    lastStatementDate: '1 Mar 2025',
    nextStatementDate: '1 Apr 2025',
    monthlyData: [
      { month: 'Oct', spend: 38000 },
      { month: 'Nov', spend: 41200 },
      { month: 'Dec', spend: 56800 },
      { month: 'Jan', spend: 39400 },
      { month: 'Feb', spend: 42800 },
      { month: 'Mar', spend: 48200 },
    ],
    recentBookings: [
      { ref: 'VAI-A7X2K1', traveler: 'Rohit Sharma', route: 'DEL→BOM', date: '15 Mar', amount: 5800, status: 'confirmed' },
      { ref: 'VAI-B3M9P4', traveler: 'Priya Mehta', route: 'BOM→BLR', date: '18 Mar', amount: 3299, status: 'confirmed' },
      { ref: 'VAI-C5F2K8', traveler: 'Arjun Kapoor', route: 'BOM→LHR', date: '25 Mar', amount: 112000, status: 'flagged' },
    ],
  },
  {
    id: 'CORP-002',
    name: 'Nexus BPO',
    logo: '🟣',
    contact: 'Kavita Rao',
    email: 'accounts@nexusbpo.com',
    gstin: '29AANBN7890C1Z2',
    plan: 'Business',
    creditLimit: 200000,
    currentBalance: 18600,
    totalThisMonth: 18600,
    totalLastMonth: 22100,
    trips: 11,
    employees: 64,
    policyCompliance: 88,
    status: 'active',
    lastStatementDate: '1 Mar 2025',
    nextStatementDate: '1 Apr 2025',
    monthlyData: [
      { month: 'Oct', spend: 14200 },
      { month: 'Nov', spend: 19800 },
      { month: 'Dec', spend: 28400 },
      { month: 'Jan', spend: 16600 },
      { month: 'Feb', spend: 22100 },
      { month: 'Mar', spend: 18600 },
    ],
    recentBookings: [
      { ref: 'VAI-D4M1P7', traveler: 'Raj Patel', route: 'HYD→DEL', date: '12 Mar', amount: 4100, status: 'confirmed' },
      { ref: 'VAI-E6K3N9', traveler: 'Nisha Verma', route: 'BLR→BOM', date: '20 Mar', amount: 3200, status: 'confirmed' },
    ],
  },
  {
    id: 'CORP-003',
    name: 'Atlas Pharma',
    logo: '🟢',
    contact: 'Ramesh Gupta',
    email: 'travel@atlaspharma.in',
    gstin: '06AAACA5678D1Z4',
    plan: 'Business',
    creditLimit: 300000,
    currentBalance: 0,
    totalThisMonth: 0,
    totalLastMonth: 31500,
    trips: 0,
    employees: 92,
    policyCompliance: 100,
    status: 'inactive',
    lastStatementDate: '1 Mar 2025',
    nextStatementDate: '1 Apr 2025',
    monthlyData: [
      { month: 'Oct', spend: 22000 },
      { month: 'Nov', spend: 18500 },
      { month: 'Dec', spend: 41200 },
      { month: 'Jan', spend: 28900 },
      { month: 'Feb', spend: 31500 },
      { month: 'Mar', spend: 0 },
    ],
    recentBookings: [],
  },
]

// ── Tooltip ───────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-border rounded-xl p-3 shadow-card text-xs">
      <p className="text-muted mb-1 font-mono">{label}</p>
      <p className="text-gold-400 font-bold">{formatINR(payload[0]?.value)}</p>
    </div>
  )
}

// ── Corporate Account Card ────────────────────────────────────────────────────
function AccountCard({ account, onSelect, selected }) {
  const growth = account.totalLastMonth > 0
    ? (((account.totalThisMonth - account.totalLastMonth) / account.totalLastMonth) * 100).toFixed(1)
    : 0
  const isGrowth = parseFloat(growth) >= 0
  const utilizationPct = Math.round((account.currentBalance / account.creditLimit) * 100)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect(account)}
      className={`glass border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
        selected?.id === account.id
          ? 'border-gold-400/40 bg-gold-400/5'
          : 'border-border hover:border-border/80'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{account.logo}</span>
          <div>
            <div className="text-white font-bold">{account.name}</div>
            <div className="text-muted text-xs">{account.plan} · {account.employees} employees</div>
          </div>
        </div>
        <div className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
          account.status === 'active'
            ? 'bg-sage-400/10 text-sage-400 border-sage-400/20'
            : 'bg-border text-muted border-border'
        }`}>
          {account.status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'This Month', value: formatINR(account.totalThisMonth), color: 'text-gold-400' },
          { label: 'Trips', value: account.trips, color: 'text-sky-400' },
          { label: 'Compliance', value: `${account.policyCompliance}%`, color: account.policyCompliance >= 90 ? 'text-sage-400' : 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={`font-bold text-lg ${color}`}>{value}</div>
            <div className="text-muted text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Credit utilization bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Credit used</span>
          <span>{formatINR(account.currentBalance)} / {formatINR(account.creditLimit)}</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(utilizationPct, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={`h-full rounded-full ${
              utilizationPct > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-gold-500 to-gold-400'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs font-medium ${isGrowth ? 'text-sage-400' : 'text-amber-400'}`}>
          {isGrowth ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(parseFloat(growth))}% vs last month
        </div>
        <span className="text-muted text-xs flex items-center gap-1">
          Statement due {account.nextStatementDate} <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  )
}

// ── Account Detail Panel ──────────────────────────────────────────────────────
function AccountDetail({ account, onClose }) {
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      toast.success(`Statement for ${account.name} generated & emailed to ${account.email}`)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="glass border border-border rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{account.logo}</span>
          <div>
            <h3 className="font-display font-bold text-white text-lg">{account.name}</h3>
            <p className="text-muted text-xs">{account.contact} · {account.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-white transition-colors text-lg">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Spend chart */}
        <div>
          <p className="text-muted text-xs uppercase tracking-wider mb-3">6-Month Spend</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={account.monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,66,0.6)" />
              <XAxis dataKey="month" tick={{ fill: '#4B6070', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4B6070', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                {account.monthlyData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={i === account.monthlyData.length - 1 ? '#E8B429' : 'rgba(232,180,41,0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Account details */}
        <div className="glass border border-border rounded-xl p-4">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Account Info</p>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            {[
              ['GSTIN', account.gstin],
              ['Plan', account.plan],
              ['Credit Limit', formatINR(account.creditLimit)],
              ['Current Balance', formatINR(account.currentBalance)],
              ['Policy Compliance', `${account.policyCompliance}%`],
              ['Last Statement', account.lastStatementDate],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-muted text-xs">{k}</div>
                <div className="text-white font-medium text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        {account.recentBookings.length > 0 && (
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-3">Recent Bookings</p>
            <div className="space-y-2">
              {account.recentBookings.map(bk => (
                <div key={bk.ref} className="flex items-center justify-between gap-3 p-3 glass border border-border rounded-xl text-sm">
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">{bk.traveler}</div>
                    <div className="text-muted text-xs">{bk.route} · {bk.date}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gold-400 font-semibold text-sm">{formatINR(bk.amount)}</span>
                    <span className={`px-1.5 py-0.5 text-xs rounded-full border ${
                      bk.status === 'confirmed'
                        ? 'bg-sage-400/10 text-sage-400 border-sage-400/20'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    }`}>
                      {bk.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI summary */}
        <div className="p-3 bg-gold-400/8 border border-gold-400/20 rounded-xl flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-gold-200/70 text-xs leading-relaxed">
            <span className="text-gold-300 font-semibold">AI Insight: </span>
            {account.name} is spending{' '}
            {account.totalThisMonth > account.totalLastMonth ? 'more' : 'less'} than last month.
            Policy compliance at {account.policyCompliance}%
            {account.policyCompliance < 90 ? ' — flagged 2 policy breaches this month.' : ' — excellent.'}
            {account.currentBalance > account.creditLimit * 0.8 && ' Credit utilization is high, consider increasing limit.'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border/60 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-gold-sm"
        >
          {generating ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <FileText className="w-4 h-4" />
            </motion.div> Generating...</>
          ) : (
            <><FileText className="w-4 h-4" /> Generate & Email Statement</>
          )}
        </motion.button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toast.success('Downloading PDF...')}
            className="py-2.5 glass border border-border rounded-xl text-xs text-muted hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button
            onClick={() => toast.success(`Email sent to ${account.email}`)}
            className="py-2.5 glass border border-border rounded-xl text-xs text-muted hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" /> Send to Finance
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CorporateStatements() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const totalRevenue = CORPORATE_ACCOUNTS.reduce((s, a) => s + a.totalThisMonth, 0)
  const totalTrips = CORPORATE_ACCOUNTS.reduce((s, a) => s + a.trips, 0)
  const avgCompliance = Math.round(
    CORPORATE_ACCOUNTS.filter(a => a.status === 'active').reduce((s, a) => s + a.policyCompliance, 0) /
    CORPORATE_ACCOUNTS.filter(a => a.status === 'active').length
  )

  const filtered = CORPORATE_ACCOUNTS.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-28 pb-10 px-4">
      <StaffNav/>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Link to="/finance" className="hover:text-gold-400 transition-colors">Finance</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Corporate Statements</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Corporate Accounts</h1>
            <p className="text-muted text-sm">Monthly consolidated statements for corporate clients</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toast.success('Generating all statements...')}
              className="flex items-center gap-2 px-4 py-2.5 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all">
              <Send className="w-4 h-4" /> Send All Statements
            </button>
            <Link to="/corporate"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm text-sm">
              <Building2 className="w-4 h-4" /> Onboard Client
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Corporate Revenue (Mar)', value: formatINR(totalRevenue), icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
            { label: 'Active Accounts', value: CORPORATE_ACCOUNTS.filter(a => a.status === 'active').length, icon: Building2, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
            { label: 'Corporate Trips (Mar)', value: totalTrips, icon: Plane, color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
            { label: 'Avg Policy Compliance', value: `${avgCompliance}%`, icon: Shield, color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className={`glass border rounded-2xl p-4 ${bg}`}>
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <div className={`font-bold text-xl ${color}`}>{value}</div>
              <div className="text-muted text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search accounts..." className="ai-input w-full pl-8 pr-3 py-2 rounded-lg text-xs" />
          </div>
        </div>

        {/* Main layout */}
        <div className={`grid gap-5 ${selected ? 'lg:grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
          <div className="grid sm:grid-cols-2 gap-4 h-fit">
            {filtered.map((account, i) => (
              <motion.div key={account.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <AccountCard account={account} onSelect={setSelected} selected={selected} />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {selected && (
              <div className="sticky top-24 max-h-[calc(100vh-110px)] overflow-hidden flex flex-col">
                <AccountDetail account={selected} onClose={() => setSelected(null)} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
