import { useState} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileText, Download, Send, ChevronRight, Plus,
  CheckCircle, Plane, Search
} from 'lucide-react'
import {
 
  formatINR, GST_RATES
} from '../utils/billingEngine'
import toast from 'react-hot-toast'
import StaffNav from '../components/layout/StaffNav'

// ── Mock invoice list ─────────────────────────────────────────────────────────
const INVOICES = [
  {
    id: 'INV-2503-1001', bookingRef: 'VAI-A7X2K1', pnr: 'AIXTV8',
    customer: 'Rajesh Kumar', email: 'rajesh.k@techcorp.in',
    route: 'DEL → BOM', date: '10 Mar 2025', amount: 6628, status: 'paid',
    type: 'retail',
  },
  {
    id: 'INV-2503-1002', bookingRef: 'VAI-B3M9P4', pnr: 'IGXR45',
    customer: 'Priya Mehta', email: 'priya.m@startup.io',
    route: 'BOM → BLR', date: '11 Mar 2025', amount: 3462, status: 'paid',
    type: 'retail',
  },
  {
    id: 'INV-2503-1003', bookingRef: 'VAI-C1D8F7', pnr: 'VSYZ91',
    customer: 'Vikram Nair', email: 'v.nair@corp.com',
    route: 'BLR → CCU', date: '12 Mar 2025', amount: 4760, status: 'refunded',
    type: 'retail',
  },
  {
    id: 'INV-2503-1004', bookingRef: 'CORP-TECHCORP-MAR25', pnr: 'MULTI',
    customer: 'TechCorp India', email: 'finance@techcorp.in',
    route: 'Multiple routes', date: '13 Mar 2025', amount: 48200, status: 'paid',
    type: 'corporate',
  },
  {
    id: 'INV-2503-1005', bookingRef: 'VAI-D2K5F8', pnr: 'EK512X',
    customer: 'Arjun Kapoor', email: 'arjun.k@nexusbpo.com',
    route: 'BOM → DXB', date: '14 Mar 2025', amount: 33426, status: 'pending',
    type: 'corporate',
  },
]

const STATUS_STYLES = {
  paid: { badge: 'bg-sage-400/10 text-sage-400 border-sage-400/20', dot: 'bg-sage-400' },
  pending: { badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20', dot: 'bg-amber-400 animate-pulse' },
  refunded: { badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20', dot: 'bg-sky-400' },
  overdue: { badge: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400 animate-pulse' },
}

// ── Invoice Preview Component ─────────────────────────────────────────────────
function InvoicePreview({ invoice }) {
  const sampleBreakdown = {
    baseFare: 5500,
    taxes: 0,
    serviceFee: 299,
    addonTotal: 499,
    subtotal: 6298,
    gstOnFare: 275,
    addonGst: 90,
    serviceGst: 54,
    totalGst: 419,
    grandTotal: 6717,
    gstRate: GST_RATES.ECONOMY_DOMESTIC,
    addons: [{ name: 'Travel Insurance', price: 499 }],
  }

  return (
    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl text-sm">
      {/* Invoice header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
              <Plane className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <div className="font-bold text-lg">VoyageAI</div>
              <div className="text-gray-400 text-xs font-mono">Travel Services</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-yellow-400 font-bold text-xl">{invoice.id}</div>
            <div className="text-gray-400 text-xs">{invoice.date}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-400 mb-0.5">From</div>
            <div className="font-semibold">VoyageAI Travel Pvt. Ltd.</div>
            <div className="text-gray-400">Mumbai, Maharashtra — 400001</div>
            <div className="text-gray-400">GSTIN: 27AABCV1234A1Z5</div>
          </div>
          <div>
            <div className="text-gray-400 mb-0.5">Billed To</div>
            <div className="font-semibold">{invoice.customer}</div>
            <div className="text-gray-400">{invoice.email}</div>
            {invoice.type === 'corporate' && (
              <div className="text-gray-400">GSTIN: As per company record</div>
            )}
          </div>
        </div>
      </div>

      {/* Flight details */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Flight Details</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">{invoice.route}</div>
            <div className="text-gray-500 text-xs">PNR: {invoice.pnr} · Booking: {invoice.bookingRef}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-800 font-semibold">{invoice.date}</div>
            <div className="text-gray-500 text-xs">Economy Class</div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="p-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-500 pb-2 font-medium">Description</th>
              <th className="text-right text-gray-500 pb-2 font-medium">Amount</th>
              <th className="text-right text-gray-500 pb-2 font-medium">GST</th>
              <th className="text-right text-gray-500 pb-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-50">
              <td className="py-2">Base Fare (Economy Domestic)</td>
              <td className="text-right py-2">{formatINR(sampleBreakdown.baseFare)}</td>
              <td className="text-right py-2 text-gray-400">5%</td>
              <td className="text-right py-2">{formatINR(sampleBreakdown.baseFare + sampleBreakdown.gstOnFare)}</td>
            </tr>
            <tr className="border-b border-gray-50">
              <td className="py-2">Platform Service Fee</td>
              <td className="text-right py-2">{formatINR(sampleBreakdown.serviceFee)}</td>
              <td className="text-right py-2 text-gray-400">18%</td>
              <td className="text-right py-2">{formatINR(sampleBreakdown.serviceFee + sampleBreakdown.serviceGst)}</td>
            </tr>
            {sampleBreakdown.addons.map(a => (
              <tr key={a.name} className="border-b border-gray-50">
                <td className="py-2">{a.name}</td>
                <td className="text-right py-2">{formatINR(a.price)}</td>
                <td className="text-right py-2 text-gray-400">18%</td>
                <td className="text-right py-2">{formatINR(a.price + Math.round(a.price * 0.18))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td colSpan="3" className="pt-3 font-semibold text-gray-800">Total GST</td>
              <td className="text-right pt-3 text-gray-500">{formatINR(sampleBreakdown.totalGst)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="pt-1 font-bold text-gray-900 text-sm">Grand Total</td>
              <td className="text-right pt-1 font-bold text-gray-900 text-sm">{formatINR(sampleBreakdown.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment info */}
      <div className="px-5 pb-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Payment Method:</span>
              <span className="text-gray-800 ml-1 font-medium">Credit Card ****3829</span>
            </div>
            <div>
              <span className="text-gray-500">Payment Ref:</span>
              <span className="text-gray-800 ml-1 font-mono">PAY-20250310045</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="text-green-600 ml-1 font-semibold">✓ Paid</span>
            </div>
            <div>
              <span className="text-gray-500">Invoice No:</span>
              <span className="text-gray-800 ml-1 font-mono">{invoice.id}</span>
            </div>
          </div>
        </div>
        <div className="text-center mt-4 text-xs text-gray-400">
          VoyageAI Travel Pvt. Ltd. · CIN: U63090MH2024PTC000123 · support@voyageai.in
        </div>
      </div>
    </div>
  )
}

// ── Invoice Generator Form ────────────────────────────────────────────────────
function InvoiceGeneratorModal({ onClose, onGenerate }) {
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', bookingRef: '', pnr: '',
    route: '', date: '', baseFare: '', cabinClass: 'ECONOMY',
    isInternational: false, isCorporate: false,
  })

  const handleGenerate = () => {
    if (!form.customerName || !form.baseFare) {
      toast.error('Please fill in required fields')
      return
    }
    onGenerate(form)
    toast.success('Invoice generated successfully!')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="glass border border-border rounded-3xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold text-white">Generate Invoice</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">✕</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Customer Name *</label>
              <input
                value={form.customerName}
                onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                placeholder="Rajesh Kumar"
                className="ai-input w-full px-3 py-2.5 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                value={form.customerEmail}
                onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
                className="ai-input w-full px-3 py-2.5 rounded-xl text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Booking Ref</label>
              <input
                value={form.bookingRef}
                onChange={e => setForm(f => ({ ...f, bookingRef: e.target.value }))}
                placeholder="VAI-XXXXX"
                className="ai-input w-full px-3 py-2.5 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">PNR</label>
              <input
                value={form.pnr}
                onChange={e => setForm(f => ({ ...f, pnr: e.target.value }))}
                placeholder="AIXTV8"
                className="ai-input w-full px-3 py-2.5 rounded-xl text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Route</label>
            <input
              value={form.route}
              onChange={e => setForm(f => ({ ...f, route: e.target.value }))}
              placeholder="DEL → BOM"
              className="ai-input w-full px-3 py-2.5 rounded-xl text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Base Fare (₹) *</label>
              <input
                type="number"
                value={form.baseFare}
                onChange={e => setForm(f => ({ ...f, baseFare: e.target.value }))}
                placeholder="5500"
                className="ai-input w-full px-3 py-2.5 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Cabin Class</label>
              <select
                value={form.cabinClass}
                onChange={e => setForm(f => ({ ...f, cabinClass: e.target.value }))}
                className="ai-input w-full px-3 py-2.5 rounded-xl text-muted text-sm appearance-none"
              >
                {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map(c => (
                  <option key={c} value={c} className="bg-deep">{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            {[
              { key: 'isInternational', label: 'International route' },
              { key: 'isCorporate', label: 'Corporate invoice' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    form[key] ? 'bg-gold-400 border-gold-400' : 'border-muted'
                  }`}
                >
                  {form[key] && <CheckCircle className="w-3 h-3 text-void" />}
                </div>
                <span className="text-sm text-white/80">{label}</span>
              </label>
            ))}
          </div>

          {/* GST preview */}
          {form.baseFare && (
            <div className="p-3 bg-surface/60 border border-border rounded-xl text-xs">
              {(() => {
                const base = parseFloat(form.baseFare) || 0
                const gstKey = form.isInternational ? 'INTERNATIONAL' :
                  form.cabinClass === 'BUSINESS' || form.cabinClass === 'FIRST' ? 'BUSINESS_DOMESTIC' : 'ECONOMY_DOMESTIC'
                const rate = GST_RATES[gstKey]
                const gst = Math.round(base * rate.total)
                const fee = 299
                const feeGst = Math.round(fee * 0.18)
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted">
                      <span>Base fare GST ({rate.label})</span>
                      <span className="text-white">{formatINR(gst)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Service fee + GST</span>
                      <span className="text-white">{formatINR(fee + feeGst)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-border pt-1">
                      <span className="text-white">Est. Grand Total</span>
                      <span className="text-gold-400">{formatINR(base + gst + fee + feeGst)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-3 glass border border-border rounded-xl text-muted text-sm">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-gold-sm"
          >
            <FileText className="w-4 h-4" /> Generate Invoice
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Invoice Manager ──────────────────────────────────────────────────────
export default function InvoiceManager() {
  const [invoices, setInvoices] = useState(INVOICES)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = invoices.filter(inv => {
    if (filterType !== 'all' && inv.type !== filterType) return false
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false
    if (search &&
      !inv.customer.toLowerCase().includes(search.toLowerCase()) &&
      !inv.id.toLowerCase().includes(search.toLowerCase()) &&
      !inv.bookingRef.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleGenerate = (form) => {
    const newInv = {
      id: `INV-2503-${1006 + invoices.length}`,
      bookingRef: form.bookingRef || 'VAI-NEW',
      pnr: form.pnr || 'N/A',
      customer: form.customerName,
      email: form.customerEmail,
      route: form.route || 'N/A',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: Math.round(parseFloat(form.baseFare || 0) * 1.1),
      status: 'pending',
      type: form.isCorporate ? 'corporate' : 'retail',
    }
    setInvoices(prev => [newInv, ...prev])
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4">
      <StaffNav />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Link to="/finance" className="hover:text-gold-400 transition-colors">Finance</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Invoice Manager</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Invoices</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm"
          >
            <Plus className="w-4 h-4" /> New Invoice
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Invoiced', value: formatINR(invoices.reduce((s, i) => s + i.amount, 0)), color: 'text-gold-400' },
            { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, color: 'text-sage-400' },
            { label: 'Pending', value: invoices.filter(i => i.status === 'pending').length, color: 'text-amber-400' },
            { label: 'Refunded', value: invoices.filter(i => i.status === 'refunded').length, color: 'text-sky-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass border border-border rounded-xl p-4 text-center">
              <div className={`font-bold text-2xl ${color}`}>{value}</div>
              <div className="text-muted text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className={`grid gap-5 ${selectedInvoice ? 'lg:grid-cols-[1fr_420px]' : ''}`}>
          {/* Invoice list */}
          <div className="glass border border-border rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-border/60 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-36">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search invoices..." className="ai-input w-full pl-8 pr-3 py-2 rounded-lg text-xs" />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="ai-input px-3 py-2 rounded-lg text-xs text-muted">
                <option value="all">All types</option>
                <option value="retail">Retail</option>
                <option value="corporate">Corporate</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="ai-input px-3 py-2 rounded-lg text-xs text-muted">
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Invoice rows */}
            <div className="divide-y divide-border/30">
              {filtered.map((inv, i) => {
                const st = STATUS_STYLES[inv.status]
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/2 transition-all group flex-wrap ${
                      selectedInvoice?.id === inv.id ? 'bg-gold-400/5' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-xs text-gold-400">{inv.id}</span>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full border capitalize ${
                          inv.type === 'corporate' ? 'bg-violet-400/10 text-violet-400 border-violet-400/20' :
                          'bg-sky-400/10 text-sky-400 border-sky-400/20'
                        }`}>{inv.type}</span>
                      </div>
                      <div className="text-white text-sm font-medium group-hover:text-gold-300 transition-colors truncate">{inv.customer}</div>
                      <div className="text-muted text-xs">{inv.route} · {inv.date} · {inv.bookingRef}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold">{formatINR(inv.amount)}</div>
                      <span className={`px-2 py-0.5 text-xs rounded-full border font-medium capitalize ${st.badge}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); toast.success('Sending invoice...') }}
                        className="p-1.5 text-muted hover:text-gold-400 transition-colors" title="Send">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); toast.success('Downloading PDF...') }}
                        className="p-1.5 text-muted hover:text-sky-400 transition-colors" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted text-sm">No invoices found.</div>
              )}
            </div>
          </div>

          {/* Invoice Preview */}
          <AnimatePresence>
            {selectedInvoice && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Invoice Preview</h3>
                  <div className="flex gap-2">
                    <button onClick={() => toast.success('Sent to ' + selectedInvoice.email)}
                      className="flex items-center gap-1.5 px-3 py-1.5 glass border border-border rounded-lg text-xs text-muted hover:text-gold-400 transition-all">
                      <Send className="w-3 h-3" /> Send
                    </button>
                    <button onClick={() => toast.success('Downloading PDF...')}
                      className="flex items-center gap-1.5 px-3 py-1.5 glass border border-border rounded-lg text-xs text-muted hover:text-sky-400 transition-all">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </div>
                <InvoicePreview invoice={selectedInvoice} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generator Modal */}
        <AnimatePresence>
          {showGenerator && (
            <InvoiceGeneratorModal onClose={() => setShowGenerator(false)} onGenerate={handleGenerate} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
