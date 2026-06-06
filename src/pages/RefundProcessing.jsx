import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  RefreshCw, ChevronRight, CheckCircle, Clock, DollarSign, Download, Sparkles, Shield, Info, Search 
} from 'lucide-react'
import { calculateRefund, formatINR } from '../utils/billingEngine'
import toast from 'react-hot-toast'

import { getAIRecommendation } from '../utils/multiModalApi'
import StaffNav from '../components/layout/StaffNav'

const PENDING_REFUNDS = [
  {
    id: 'REF-001',
    bookingRef: 'VAI-C1D8F7',
    customer: 'Vikram Nair',
    email: 'v.nair@corp.com',
    route: 'BLR → CCU',
    airline: 'Vistara',
    departDate: '2025-04-20',
    cancelledAt: '2025-03-12',
    price: 6100,
    status: 'pending_approval',
    reason: 'Personal emergency',
    addons: [{ name: 'Meal', price: 350, refundable: false }],
    requestedAt: '2 hours ago',
  },
  {
    id: 'REF-002',
    bookingRef: 'VAI-E9X3K7',
    customer: 'Sana Sheikh',
    email: 's.sheikh@gmail.com',
    route: 'DEL → DXB',
    airline: 'Emirates',
    departDate: '2025-03-25',
    cancelledAt: '2025-03-14',
    price: 18200,
    status: 'processing',
    reason: 'Flight cancelled by airline',
    addons: [{ name: 'Travel Insurance', price: 499, refundable: true }],
    requestedAt: '1 day ago',
  },
  {
    id: 'REF-003',
    bookingRef: 'VAI-G4P7Q2',
    customer: 'Ananya Sharma',
    email: 'a.sharma@startup.io',
    route: 'BOM → SIN',
    airline: 'Singapore Airlines',
    departDate: '2025-05-10',
    cancelledAt: '2025-03-10',
    price: 24500,
    status: 'approved',
    reason: 'Travel plans changed',
    addons: [{ name: 'Extra Baggage', price: 800, refundable: true }, { name: 'Meal', price: 420, refundable: false }],
    requestedAt: '4 days ago',
  },
]

const COMPLETED_REFUNDS = [
  {
    id: 'REF-000', bookingRef: 'VAI-A2B3C4', customer: 'Rohit Sharma',
    route: 'DEL → BOM', amount: 4800, completedAt: '8 Mar 2025', status: 'completed',
  },
  {
    id: 'REF-099', bookingRef: 'VAI-X9Y8Z7', customer: 'Meera Nair',
    route: 'BLR → HYD', amount: 1200, completedAt: '5 Mar 2025', status: 'completed',
  },
]

const STATUS_STYLES = {
  pending_approval: { badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20', label: 'Pending Approval' },
  processing: { badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20', label: 'Processing' },
  approved: { badge: 'bg-sage-400/10 text-sage-400 border-sage-400/20', label: 'Approved' },
  completed: { badge: 'bg-sage-400/10 text-sage-400 border-sage-400/20', label: 'Completed' },
  rejected: { badge: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejected' },
}

function RefundCard({ refund, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const calc = calculateRefund(refund)
  const st = STATUS_STYLES[refund.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-all"
    >
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-xs text-gold-400">{refund.id}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${st.badge}`}>
                  {st.label}
                </span>
              </div>
              <div className="text-white font-semibold">{refund.customer}</div>
              <div className="text-muted text-xs">
                {refund.route} · {refund.airline} · Departs {new Date(refund.departDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-muted text-xs mt-0.5">
                Reason: <span className="text-white/70">{refund.reason}</span>
                <span className="mx-1.5">·</span>
                Requested {refund.requestedAt}
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-muted text-xs mb-1">Refund Amount</div>
            <div className="text-gold-400 font-bold text-xl">{formatINR(calc.totalRefund)}</div>
            <div className="text-muted text-xs">of {formatINR(refund.price)} paid</div>
            <div className="text-sage-400 text-xs mt-0.5">{calc.refundPercent}% refundable</div>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
              {/* Refund breakdown */}
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-3">Refund Calculation</p>
                <div className="glass border border-border rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Original amount paid</span>
                    <span className="text-white">{formatINR(calc.originalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Refund rate ({calc.refundPercent}%)</span>
                    <span className="text-white">{formatINR(calc.baseRefund)}</span>
                  </div>
                  {calc.addonRefund > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted">Refundable add-ons</span>
                      <span className="text-sage-400">+{formatINR(calc.addonRefund)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted">Processing fee</span>
                    <span className="text-amber-400">−{formatINR(calc.processingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border pt-2">
                    <span className="text-white">Total Refund</span>
                    <span className="text-gold-400 text-lg">{formatINR(calc.totalRefund)}</span>
                  </div>
                </div>
                <p className="text-muted text-xs mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> {calc.penaltyRule} · Est. {calc.estimatedDays}
                </p>
              </div>

              {/* AI assessment */}
              <div className="p-3 bg-gold-400/8 border border-gold-400/20 rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-gold-200/70 text-xs leading-relaxed">
                  <span className="text-gold-300 font-semibold">AI Assessment: </span>
                  Refund is within policy. Customer has {Math.floor((new Date(refund.departDate) - new Date(refund.cancelledAt)) / (1000 * 60 * 60 * 24))} days until departure.
                  {calc.refundPercent >= 75 ? ' Recommend auto-approval.' : ' Manual review recommended.'}
                </p>
              </div>

              {/* Action buttons */}
              {refund.status === 'pending_approval' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onReject(refund.id)}
                    className="px-5 py-2.5 glass border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-all"
                  >
                    Reject
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onApprove(refund.id)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-sage-500 to-sage-400 text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Refund of {formatINR(calc.totalRefund)}
                  </motion.button>
                </div>
              )}
              {refund.status === 'approved' && (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onApprove(refund.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Process Bank Transfer — {formatINR(calc.totalRefund)}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function RefundProcessing() {
  const [refunds, setRefunds] = useState(PENDING_REFUNDS)
  const [activeTab, setActiveTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [aiTip, setAiTip] = useState('')

  useEffect(() => {
  getAIRecommendation(
    'Give a concise travel tip for someone checking in for a DEL→BOM flight'
  ).then(setAiTip).catch(() => {})
}, [])

  const handleApprove = (id) => {
    setRefunds(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: r.status === 'pending_approval' ? 'approved' : 'completed' }
        : r
    ))
    const r = refunds.find(r => r.id === id)
    const calc = calculateRefund(r)
    toast.success(`Refund of ${formatINR(calc.totalRefund)} approved`)
  }

  const handleReject = (id) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    toast.error('Refund rejected and customer notified')
  }

  const filtered = (activeTab === 'completed' ? COMPLETED_REFUNDS : refunds)
    .filter(r => !search ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingRef.toLowerCase().includes(search.toLowerCase())
    )

  const pendingCount = refunds.filter(r => r.status === 'pending_approval').length
  const processingCount = refunds.filter(r => r.status === 'processing' || r.status === 'approved').length

  return (
    <div className="min-h-screen pt-28 pb-10 px-4">
      <StaffNav/>
      <div className="max-w-4xl mx-auto">
        {aiTip && (
  <div className="flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
    <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
    <p className="text-gold-200/80 text-sm">{aiTip}</p>
  </div>
)}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Link to="/finance" className="hover:text-gold-400 transition-colors">Finance</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Refund Processing</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Refunds</h1>
            <p className="text-muted text-sm mt-0.5">AI-assessed refund requests with policy-based calculations</p>
          </div>
          <button
            onClick={() => toast.success('Exporting refund report...')}
            className="flex items-center gap-2 px-4 py-2.5 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Needs Approval', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
            { label: 'In Processing', value: processingCount, icon: RefreshCw, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
            { label: 'Total Pending', value: formatINR(refunds.reduce((s, r) => s + calculateRefund(r).totalRefund, 0)), icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`glass border rounded-2xl p-4 ${bg}`}>
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <div className={`font-bold text-xl ${color}`}>{value}</div>
              <div className="text-muted text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Policy reminder */}
        <div className="flex items-start gap-3 p-4 glass border border-sky-400/20 rounded-2xl mb-5 bg-sky-400/5">
          <Shield className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="text-sky-200/70 text-xs leading-relaxed">
            <span className="text-sky-300 font-semibold">Refund Policy: </span>
            &gt;30 days before: full refund · 7–30 days: 75% · 2–7 days: 50% · 24–48h: 25% · &lt;24h: no refund.
            Processing fee of ₹500 applies. AI auto-calculates amounts per booking.
          </div>
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex gap-1">
            {[
              { key: 'pending', label: `Pending (${refunds.length})` },
              { key: 'completed', label: `Completed (${COMPLETED_REFUNDS.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20'
                    : 'text-muted hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="ai-input pl-8 pr-3 py-2 rounded-lg text-xs w-44"
            />
          </div>
        </div>

        {/* Refund cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-sage-400/40 mx-auto mb-3" />
              <p className="text-muted">No refunds found.</p>
            </div>
          )}

          {activeTab === 'pending' && refunds.map((refund, i) => (
            <motion.div key={refund.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <RefundCard refund={refund} onApprove={handleApprove} onReject={handleReject} />
            </motion.div>
          ))}

          {activeTab === 'completed' && COMPLETED_REFUNDS.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass border border-border rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <div className="font-mono text-xs text-gold-400 mb-0.5">{r.id}</div>
                <div className="text-white font-medium">{r.customer} · {r.route}</div>
                <div className="text-muted text-xs">{r.bookingRef} · Completed {r.completedAt}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sage-400 font-bold">{formatINR(r.amount)}</span>
                <span className="px-2 py-0.5 text-xs rounded-full border bg-sage-400/10 text-sage-400 border-sage-400/20 font-medium">
                  Completed
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
