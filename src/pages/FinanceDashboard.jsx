import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, FileText,
  RefreshCw, Clock, Download, ArrowUpRight, ArrowDownRight,
  Receipt, Package, Building2, CreditCard, Search
} from 'lucide-react'
import { MOCK_LEDGER, getLedgerSummary, formatINR } from '../utils/billingEngine'
import StaffNav from '../components/layout/StaffNav'


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
  { name: 'Flight Bookings', value: 248000, color: '#3B82F6' },
  { name: 'Corporate', value: 387000, color: '#38B6F0' },
  { name: 'Add-ons', value: 51200, color: '#7EC8A4' },
  { name: 'Insurance', value: 18400, color: '#A78BFA' },
]

const CATEGORY_ICONS = {
  booking: { icon: '✈️', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
  addon: { icon: '🎒', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  corporate: { icon: '🏢', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
  refund: { icon: '↩️', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  commission: { icon: '💼', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' },
}

const STATUS_STYLES = {
  settled: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  processing: 'bg-sky-50 text-sky-600 border-sky-100',
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  failed: 'bg-red-50 text-red-600 border-red-100',
}

// ── Custom tooltip for charts ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-md">
      <p className="text-slate-400 text-xs mb-2 font-mono">{label}</p>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color }} className="text-xs">{name}</span>
          <span className="text-slate-900 font-semibold">{formatINR(value)}</span>
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
      color: 'text-blue-500',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Total Debits (Mar)',
      value: formatINR(summary.debits),
      change: '-3.2%',
      positive: true,
      icon: TrendingDown,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 border-emerald-100',
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
    <div className="min-h-screen pt-36 pb-10 px-4 bg-white">
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
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="font-display text-3xl font-bold text-slate-900">Finance Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm">Revenue, billing, invoices and payment ledger</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date range */}
            {['week', 'month', 'quarter', 'year'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${dateRange === r
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-slate-500 hover:text-slate-900 border border-transparent'
                  }`}
              >
                {r}
              </button>
            ))}
            <Link
              to="/finance/invoices"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-blue-200 rounded-xl text-sm text-slate-500 hover:text-slate-900 transition-all"
            >
              <FileText className="w-4 h-4" /> Invoices
            </Link>
            <Link
              to="/finance/billing"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-blue-700 transition-all"
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
              className={`bg-white border rounded-2xl p-5 shadow-sm ${bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${color}`} />
                {positive !== null && (
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}
                  </span>
                )}
                {positive === null && (
                  <span className="text-xs text-slate-400">{change}</span>
                )}
              </div>
              <div className="font-bold text-2xl text-slate-900 mb-0.5">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
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
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Revenue Breakdown
              </h2>
              <div className="flex gap-1">
                {['area', 'bar'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveChart(t)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${activeChart === t
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-slate-400 hover:text-slate-900'
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
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="corporate" name="Corporate" stroke="#38B6F0" strokeWidth={2} fill="url(#skyGrad)" />
                  <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#3B82F6" strokeWidth={2} fill="url(#blueGrad)" />
                  <Area type="monotone" dataKey="addons" name="Add-ons" stroke="#7EC8A4" strokeWidth={2} fill="url(#sageGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={filteredRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="corporate" name="Corporate" fill="#38B6F0" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="bookings" name="Bookings" fill="#3B82F6" radius={[3, 3, 0, 0]} />
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
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> By Category (Mar)
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
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {CATEGORY_DATA.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-slate-500">{name}</span>
                  </div>
                  <span className="text-slate-900 font-medium">{formatINR(value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { icon: FileText, label: 'Generate Invoice', desc: 'Create & send', to: '/finance/invoices', color: 'text-blue-500' },
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
                className="block bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm rounded-2xl p-4 group transition-all duration-200"
              >
                <Icon className={`w-6 h-6 ${color} mb-3 group-hover:scale-110 transition-transform`} />
                <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{label}</div>
                <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Transaction Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Ledger header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" /> Transaction Ledger
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={searchTx}
                  onChange={e => setSearchTx(e.target.value)}
                  placeholder="Search transactions..."
                  className="bg-white border border-slate-200 pl-8 pr-3 py-2 rounded-lg text-xs w-44 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="settled">Settled</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:border-blue-200 transition-all">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span>Type</span>
            <span>Description</span>
            <span className="hidden sm:block">Ref</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {filteredLedger.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
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
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${cat.bg} flex-shrink-0`}>
                    {cat.icon}
                  </div>

                  {/* Description */}
                  <div className="min-w-0">
                    <div className="text-slate-900 text-sm font-medium truncate group-hover:text-blue-600 transition-colors">
                      {tx.description}
                    </div>
                    <div className="text-slate-400 text-xs font-mono mt-0.5">{tx.date} · {tx.id}</div>
                  </div>

                  {/* Booking ref */}
                  <div className="hidden sm:block font-mono text-xs text-slate-400 whitespace-nowrap">
                    {tx.bookingRef}
                  </div>

                  {/* Status */}
                  <span className={`px-2 py-0.5 text-xs rounded-full border font-medium whitespace-nowrap capitalize ${STATUS_STYLES[tx.status]}`}>
                    {tx.status}
                  </span>

                  {/* Amount */}
                  <div className={`text-right font-bold text-sm whitespace-nowrap ${tx.type === 'credit' ? 'text-emerald-600' : 'text-amber-500'
                    }`}>
                    {tx.type === 'credit' ? '+' : ''}{formatINR(tx.amount)}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Ledger footer totals */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50">
            <div className="text-slate-400 text-xs">{filteredLedger.length} transactions shown</div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Credits:</span>
                <span className="text-emerald-600 font-bold">{formatINR(summary.credits)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Debits:</span>
                <span className="text-amber-500 font-bold">{formatINR(summary.debits)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Net:</span>
                <span className="text-slate-900 font-bold">{formatINR(summary.net)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}