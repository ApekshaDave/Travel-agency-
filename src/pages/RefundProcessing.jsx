import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  RefreshCw, ChevronRight, CheckCircle, Clock, DollarSign,
  Download, Sparkles, Shield, Info, Search, Lock, XCircle
} from 'lucide-react'
import { calculateRefund, formatINR } from '../utils/billingEngine'
import toast from 'react-hot-toast'
import { getAIRecommendation } from '../utils/multiModalApi'
import StaffNav from '../components/layout/StaffNav'

const PENDING_REFUNDS = [
  {
    id: 'REF-001', bookingRef: 'VAI-C1D8F7', customer: 'Vikram Nair',
    email: 'v.nair@corp.com', route: 'BLR → CCU', airline: 'Vistara',
    departDate: '2025-04-20', cancelledAt: '2025-03-12', price: 6100,
    status: 'pending_approval', reason: 'Personal emergency',
    addons: [{ name: 'Meal', price: 350, refundable: false }],
    requestedAt: '2 hours ago',
  },
  {
    id: 'REF-002', bookingRef: 'VAI-E9X3K7', customer: 'Sana Sheikh',
    email: 's.sheikh@gmail.com', route: 'DEL → DXB', airline: 'Emirates',
    departDate: '2025-03-25', cancelledAt: '2025-03-14', price: 18200,
    status: 'processing', reason: 'Flight cancelled by airline',
    addons: [{ name: 'Travel Insurance', price: 499, refundable: true }],
    requestedAt: '1 day ago',
  },
  {
    id: 'REF-003', bookingRef: 'VAI-G4P7Q2', customer: 'Ananya Sharma',
    email: 'a.sharma@startup.io', route: 'BOM → SIN', airline: 'Singapore Airlines',
    departDate: '2025-05-10', cancelledAt: '2025-03-10', price: 24500,
    status: 'approved', reason: 'Travel plans changed',
    addons: [{ name: 'Extra Baggage', price: 800, refundable: true }, { name: 'Meal', price: 420, refundable: false }],
    requestedAt: '4 days ago',
  },
]

const COMPLETED_REFUNDS = [
  { id: 'REF-000', bookingRef: 'VAI-A2B3C4', customer: 'Rohit Sharma', route: 'DEL → BOM', amount: 4800, completedAt: '8 Mar 2025', status: 'completed' },
  { id: 'REF-099', bookingRef: 'VAI-X9Y8Z7', customer: 'Meera Nair',   route: 'BLR → HYD', amount: 1200, completedAt: '5 Mar 2025', status: 'completed' },
]

const STATUS_STYLES = {
  pending_approval: { badge: 'bg-amber-50 text-amber-700 border-amber-200',   label: 'Pending Approval' },
  processing:       { badge: 'bg-sky-50 text-sky-700 border-sky-200',         label: 'Processing'       },
  approved:         { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved'     },
  completed:        { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed'    },
  rejected:         { badge: 'bg-red-50 text-red-600 border-red-200',         label: 'Rejected'         },
}

// ── Refund Card ───────────────────────────────────────────────────────────────
function RefundCard({ refund, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const calc = calculateRefund(refund)
  const st = STATUS_STYLES[refund.status] || STATUS_STYLES.pending_approval
  const isActionable = refund.status === 'pending_approval' || refund.status === 'approved'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      {/* Header row — always visible */}
      <div className="p-5 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono text-xs text-blue-600 font-bold">{refund.id}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase tracking-wider ${st.badge}`}>
                  {st.label}
                </span>
              </div>
              <div className="text-slate-900 font-semibold text-sm">{refund.customer}</div>
              <div className="text-slate-500 text-xs mt-0.5">
                {refund.route} · {refund.airline} · Departs {new Date(refund.departDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">
                Reason: <span className="text-slate-600 font-medium">{refund.reason}</span>
                <span className="mx-1.5">·</span>
                Requested {refund.requestedAt}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-slate-400 text-xs mb-0.5">Refund Amount</div>
            <div className="text-blue-700 font-bold text-xl">{formatINR(calc.totalRefund)}</div>
            <div className="text-slate-400 text-xs">of {formatINR(refund.price)} paid</div>
            <div className="text-emerald-600 text-xs font-semibold mt-0.5">{calc.refundPercent}% refundable</div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">

              {/* Refund breakdown table */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Refund Calculation</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original amount paid</span>
                    <span className="text-slate-900 font-medium">{formatINR(calc.originalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Refund rate ({calc.refundPercent}%)</span>
                    <span className="text-slate-900 font-medium">{formatINR(calc.baseRefund)}</span>
                  </div>
                  {calc.addonRefund > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Refundable add-ons</span>
                      <span className="text-emerald-600 font-medium">+{formatINR(calc.addonRefund)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processing fee</span>
                    <span className="text-amber-600 font-medium">−{formatINR(calc.processingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-2 mt-1">
                    <span className="text-slate-900">Total Refund</span>
                    <span className="text-blue-700 text-lg">{formatINR(calc.totalRefund)}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  {calc.penaltyRule} · Est. {calc.estimatedDays}
                </p>
              </div>

              {/* AI assessment */}
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-600 text-xs leading-relaxed">
                  <span className="text-blue-700 font-semibold">AI Assessment: </span>
                  {refund.reason === 'Flight cancelled by airline'
                    ? 'Full refund is strongly recommended — airline-initiated cancellations qualify for 100% reimbursement under DGCA guidelines.'
                    : `Standard ${calc.refundPercent}% policy applies. Cancellation is ${calc.daysBeforeDeparture} days before departure.`
                  }
                </p>
              </div>

              {/* Add-ons breakdown */}
              {refund.addons?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Add-ons</p>
                  <div className="space-y-1.5">
                    {refund.addons.map(a => (
                      <div key={a.name} className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-slate-600 font-medium">{a.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-mono">{formatINR(a.price)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${a.refundable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {a.refundable ? 'Refundable' : 'Non-refundable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {isActionable && (
                <div className="flex gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onReject(refund.id)}
                    className="flex-1 py-2.5 bg-red-50 border border-red-200 text-red-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Refund
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onApprove(refund.id)}
                    className="flex-[2] py-2.5 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,#1A6EBD,#1558A0)' }}
                  >
                    <Lock className="w-4 h-4" />
                    {refund.status === 'pending_approval' ? 'Approve' : 'Process Transfer'} — {formatINR(calc.totalRefund)}
                  </motion.button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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

  const pendingCount    = refunds.filter(r => r.status === 'pending_approval').length
  const processingCount = refunds.filter(r => r.status === 'processing' || r.status === 'approved').length
  const totalPending    = refunds.reduce((s, r) => s + calculateRefund(r).totalRefund, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffNav />

      {/* ── PAGE HEADER ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-8 pt-36">
        <div className="max-w-4xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 flex-wrap">
              <Link to="/finance" className="hover:text-blue-600 transition-colors font-medium">Finance</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700 font-semibold">Refund Processing</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-1">Refunds</h1>
            <p className="text-slate-500 text-sm">AI-assessed refund requests with policy-based calculations</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => toast.success('Exporting refund report…')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all font-medium shadow-sm self-start"
          >
            <Download className="w-4 h-4" /> Export Report
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* AI Tip banner */}
        {aiTip && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl"
          >
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-slate-700 text-sm leading-relaxed">{aiTip}</p>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Needs Approval', value: pendingCount,            icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200'   },
            { label: 'In Processing',  value: processingCount,         icon: RefreshCw,   color: 'text-sky-600',     bg: 'bg-sky-50 border-sky-200'       },
            { label: 'Total Pending',  value: formatINR(totalPending), icon: DollarSign,  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'     },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-2xl p-5 shadow-sm ${bg}`}
            >
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <div className={`font-bold text-xl ${color}`}>{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Policy reminder */}
        <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-slate-600 text-xs leading-relaxed">
            <span className="text-slate-900 font-semibold">Refund Policy: </span>
            &gt;30 days before: <strong>full refund</strong> · 7–30 days: <strong>75%</strong> · 2–7 days: <strong>50%</strong> · 24–48h: <strong>25%</strong> · &lt;24h: <strong>no refund</strong>.
            {' '}Processing fee of ₹500 applies. AI auto-calculates amounts per booking.
          </div>
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {[
              { key: 'pending',   label: `Pending (${refunds.length})`           },
              { key: 'completed', label: `Completed (${COMPLETED_REFUNDS.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                style={activeTab === key ? { background: 'linear-gradient(135deg,#1A6EBD,#1558A0)' } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer or ref…"
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 w-48 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Refund cards */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold">No refunds found</p>
              <p className="text-slate-400 text-sm mt-1">Try a different search or tab.</p>
            </div>
          )}

          {activeTab === 'pending' && refunds.map((refund, i) => (
            <motion.div key={refund.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <RefundCard refund={refund} onApprove={handleApprove} onReject={handleReject} />
            </motion.div>
          ))}

          {activeTab === 'completed' && COMPLETED_REFUNDS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div>
                <div className="font-mono text-xs text-blue-600 font-bold mb-0.5">{r.id}</div>
                <div className="text-slate-900 font-semibold text-sm">{r.customer} · {r.route}</div>
                <div className="text-slate-400 text-xs mt-0.5">{r.bookingRef} · Completed {r.completedAt}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold text-base">{formatINR(r.amount)}</span>
                <span className="px-2.5 py-0.5 text-[10px] rounded-full border font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
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