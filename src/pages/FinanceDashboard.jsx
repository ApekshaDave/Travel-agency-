import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, FileText,
  RefreshCw, Clock, Download, ArrowUpRight, ArrowDownRight,
  Receipt, Package, Building2, CreditCard, Search
} from 'lucide-react'
import { MOCK_LEDGER, getLedgerSummary, formatINR } from '../utils/billingEngine'
import StaffNav from '../components/layout/StaffNav'
import { supabase } from '../utils/supabaseClient'

// ── Recharts for revenue chart ────────────────────────────────────────────────
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

const REVENUE_DATA = [
  { month: 'Oct', bookings: 142000, addons: 28400, corporate: 310000 },
  { month: 'Nov', bookings: 168000, addons: 31200, corporate: 285000 },
  { month: 'Dec', bookings: 224000, addons: 45800, corporate: 342000 },
  { month: 'Jan', bookings: 198000, addons: 38600, corporate: 298000 },
  { month: 'Feb', bookings: 215000, addons: 42100, corporate: 318000 },
  { month: 'Mar', bookings: 248000, addons: 51200, corporate: 387000 },
]

const CATEGORY_DATA = [
  { name: 'Flight Bookings', value: 248000, color: '#E8B429' },
  { name: 'Corporate', value: 387000, color: '#38B6F0' },
  { name: 'Add-ons', value: 51200, color: '#7EC8A4' },
  { name: 'Insurance', value: 18400, color: '#A78BFA' },
]

const CATEGORY_ICONS = {
  booking: { icon: '✈️', color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
  addon: { icon: '🎒', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  corporate: { icon: '🏢', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
  refund: { icon: '↩️', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  commission: { icon: '💼', color: 'text-muted', bg: 'bg-surface border-border' },
}

const STATUS_STYLES = {
  settled: 'bg-sage-400/10 text-sage-400 border-sage-400/20',
  processing: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
}

// ── Custom tooltip for charts ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-border rounded-xl p-3 shadow-card">
      <p className="text-muted text-xs mb-2 font-mono">{label}</p>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color }} className="text-xs">{name}</span>
          <span className="text-white font-semibold">{formatINR(value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function FinanceDashboard() {
  const [dateRange, setDateRange] = useState('month')
  const [searchTx, setSearchTx] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeChart, setActiveChart] = useState('area')
  const [pendingEscalations, setPendingEscalations] = useState([])

  useEffect(() => {
    fetchFinanceEscalations()
  }, [])

  const fetchFinanceEscalations = async () => {
    const { data } = await supabase
      .from('booking_issues')
      .select('*')
      .eq('issue_type', 'Finance Issue')
      .eq('status', 'agent_approved')

    if (data) setPendingEscalations(data)
  }

  const handleFinalApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('booking_issues')
        .update({ status: 'resolved', resolution_note: 'Final finance approval completed.' })
        .eq('id', id)

      if (error) throw error
      toast.success('Finance approval finalized!')
      fetchFinanceEscalations()
    } catch (err) {
      toast.error('Final approval failed: ' + err.message)
    }
  }

  const getFilteredLedgerByDate = () => {
    return MOCK_LEDGER.filter(tx => {
      const day = parseInt(tx.date.split('-')[2], 10)
      if (dateRange === 'week' && day < 13) return false
      if (dateRange === 'month' && day < 11) return false
      if (dateRange === 'quarter' && day < 5) return false
      return true
    })
  }

  const getFilteredRevenueData = () => {
    switch (dateRange) {
      case 'week':
        return REVENUE_DATA.slice(-2)
      case 'month':
        return REVENUE_DATA.slice(-3)
      case 'quarter':
        return REVENUE_DATA.slice(-4)
      case 'year':
      default:
        return REVENUE_DATA
    }
  }

  const dateFilteredLedger = getFilteredLedgerByDate()
  const summary = getLedgerSummary(dateFilteredLedger)
  const filteredRevenueData = getFilteredRevenueData()

  const filteredLedger = dateFilteredLedger.filter(tx => {
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false
    if (searchTx && !tx.description.toLowerCase().includes(searchTx.toLowerCase()) &&
      !tx.bookingRef.toLowerCase().includes(searchTx.toLowerCase())) return false
    return true
  })

  const STATS = [
    {
      label: 'Total Revenue (Mar)',
      value: formatINR(summary.credits),
      change: '+18.4%',
      positive: true,
      icon: TrendingUp,
      color: 'text-gold-400',
      bg: 'bg-gold-400/10 border-gold-400/20',
    },
    {
      label: 'Total Debits (Mar)',
      value: formatINR(summary.debits),
      change: '-3.2%',
      positive: true,
      icon: TrendingDown,
      color: 'text-sage-400',
      bg: 'bg-sage-400/10 border-sage-400/20',
    },
    {
      label: 'Net Position',
      value: formatINR(summary.net),
      change: '+21.1%',
      positive: true,
      icon: BarChart3,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10 border-sky-400/20',
    },
    {
      label: 'Pending Settlement',
      value: formatINR(summary.pending),
      change: '3 transactions',
      positive: null,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
    },
  ]

  return (
    <div className="min-h-screen pt-36 pb-10 px-4">
      <StaffNav />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gold-400" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Finance Dashboard</h1>
            </div>
            <p className="text-muted text-sm">Revenue, billing, invoices and payment ledger</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date range */}
            {['week', 'month', 'quarter', 'year'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${dateRange === r
                  ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20'
                  : 'text-muted hover:text-white border border-transparent'
                  }`}
              >
                {r}
              </button>
            ))}
            <Link
              to="/finance/invoices"
              className="flex items-center gap-2 px-3 py-2 glass border border-border hover:border-gold-400/20 rounded-xl text-sm text-muted hover:text-white transition-all"
            >
              <FileText className="w-4 h-4" /> Invoices
            </Link>
            <Link
              to="/finance/billing"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-semibold text-sm rounded-xl shadow-gold-sm"
            >
              <Receipt className="w-4 h-4" /> Billing Manager
            </Link>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {STATS.map(({ label, value, change, positive, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass border rounded-2xl p-5 ${bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${color}`} />
                {positive !== null && (
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-sage-400' : 'text-amber-400'}`}>
                    {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}
                  </span>
                )}
                {positive === null && (
                  <span className="text-xs text-muted">{change}</span>
                )}
              </div>
              <div className="font-bold text-2xl text-white mb-0.5">{value}</div>
              <div className="text-muted text-xs">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 mb-7">
          {/* Revenue area/bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold-400" /> Revenue Breakdown
              </h2>
              <div className="flex gap-1">
                {['area', 'bar'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveChart(t)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${activeChart === t
                      ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20'
                      : 'text-muted hover:text-white'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {activeChart === 'area' ? (
                <AreaChart data={filteredRevenueData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8B429" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E8B429" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38B6F0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38B6F0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7EC8A4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7EC8A4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,66,0.8)" />
                  <XAxis dataKey="month" tick={{ fill: '#4B6070', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4B6070', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="corporate" name="Corporate" stroke="#38B6F0" strokeWidth={2} fill="url(#skyGrad)" />
                  <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#E8B429" strokeWidth={2} fill="url(#goldGrad)" />
                  <Area type="monotone" dataKey="addons" name="Add-ons" stroke="#7EC8A4" strokeWidth={2} fill="url(#sageGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={filteredRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,66,0.8)" />
                  <XAxis dataKey="month" tick={{ fill: '#4B6070', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4B6070', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="corporate" name="Corporate" fill="#38B6F0" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="bookings" name="Bookings" fill="#E8B429" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="addons" name="Add-ons" fill="#7EC8A4" radius={[3, 3, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          {/* Pie chart — revenue by category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass border border-border rounded-2xl p-5"
          >
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-gold-400" /> By Category (Mar)
            </h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map(({ color }, i) => (
                    <Cell key={i} fill={color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: '#161F2E', border: '1px solid #1E2D42', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {CATEGORY_DATA.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-muted">{name}</span>
                  </div>
                  <span className="text-white font-medium">{formatINR(value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { icon: FileText, label: 'Generate Invoice', desc: 'Create & send', to: '/finance/invoices', color: 'text-gold-400' },
            { icon: Receipt, label: 'Billing Manager', desc: 'Triggers & rules', to: '/finance/billing', color: 'text-sky-400' },
            { icon: RefreshCw, label: 'Process Refunds', desc: 'Pending: 2', to: '/finance/refunds', color: 'text-amber-400' },
            { icon: Building2, label: 'Corporate Statements', desc: 'Monthly reports', to: '/finance/corporate', color: 'text-violet-400' },
          ].map(({ icon: Icon, label, desc, to, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <Link
                to={to}
                className="block glass border border-border hover:border-gold-400/20 rounded-2xl p-4 group transition-all duration-200"
              >
                <Icon className={`w-6 h-6 ${color} mb-3 group-hover:scale-110 transition-transform`} />
                <div className="font-semibold text-white text-sm group-hover:text-gold-300 transition-colors">{label}</div>
                <div className="text-muted text-xs mt-0.5">{desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Transaction Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass border border-border rounded-2xl overflow-hidden"
        >
          {/* Ledger header */}
          <div className="p-5 border-b border-border/60 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold-400" /> Transaction Ledger
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted" />
                <input
                  value={searchTx}
                  onChange={e => setSearchTx(e.target.value)}
                  placeholder="Search transactions..."
                  className="ai-input pl-8 pr-3 py-2 rounded-lg text-xs w-44"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="ai-input px-3 py-2 rounded-lg text-xs text-muted"
              >
                <option value="all">All categories</option>
                <option value="booking">Bookings</option>
                <option value="addon">Add-ons</option>
                <option value="corporate">Corporate</option>
                <option value="refund">Refunds</option>
                <option value="commission">Commission</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="ai-input px-3 py-2 rounded-lg text-xs text-muted"
              >
                <option value="all">All statuses</option>
                <option value="settled">Settled</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-border/40 text-xs text-muted uppercase tracking-wider">
            <span>Type</span>
            <span>Description</span>
            <span className="hidden sm:block">Ref</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/30">
            {filteredLedger.length === 0 && (
              <div className="text-center py-10 text-muted text-sm">
                No transactions match your filter.
              </div>
            )}
            {filteredLedger.map((tx, i) => {
              const cat = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS.commission
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/2 transition-colors group"
                >
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${cat.bg} flex-shrink-0`}>
                    {cat.icon}
                  </div>

                  {/* Description */}
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate group-hover:text-gold-300 transition-colors">
                      {tx.description}
                    </div>
                    <div className="text-muted text-xs font-mono mt-0.5">{tx.date} · {tx.id}</div>
                  </div>

                  {/* Booking ref */}
                  <div className="hidden sm:block font-mono text-xs text-muted whitespace-nowrap">
                    {tx.bookingRef}
                  </div>

                  {/* Status */}
                  <span className={`px-2 py-0.5 text-xs rounded-full border font-medium whitespace-nowrap capitalize ${STATUS_STYLES[tx.status]}`}>
                    {tx.status}
                  </span>

                  {/* Amount */}
                  <div className={`text-right font-bold text-sm whitespace-nowrap ${tx.type === 'credit' ? 'text-sage-400' : 'text-amber-400'
                    }`}>
                    {tx.type === 'credit' ? '+' : ''}{formatINR(tx.amount)}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Ledger footer totals */}
          <div className="px-5 py-4 border-t border-border/60 flex items-center justify-between flex-wrap gap-3 bg-surface/30">
            <div className="text-muted text-xs">{filteredLedger.length} transactions shown</div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted">Credits:</span>
                <span className="text-sage-400 font-bold">{formatINR(summary.credits)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted">Debits:</span>
                <span className="text-amber-400 font-bold">{formatINR(summary.debits)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted">Net:</span>
                <span className="text-white font-bold">{formatINR(summary.net)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
