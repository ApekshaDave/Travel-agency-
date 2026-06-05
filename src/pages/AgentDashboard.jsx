import { useState, useEffect } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, Clock, MessageCircle, Sparkles,
  Eye, BarChart3, Zap, Bell,
   ArrowRight, Phone, Mail,
  Search, User, Plane, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Mock escalated cases ─────────────────────────────────────────────────────
const CASES = [
  {
    id: 'ESC-001',
    priority: 'high',
    type: 'payment_fail',
    typeLabel: 'Payment Failed',
    customer: 'Rajesh Kumar',
    email: 'rajesh.k@techcorp.in',
    phone: '+91 98765 43210',
    route: 'DEL → SIN',
    date: '22 Mar 2025',
    amount: '₹28,500',
    created: '2 min ago',
    status: 'open',
    aiSummary: 'Customer attempted to book DEL→SIN business class. Payment declined at gateway (card expired). Customer has valid alternate card on file. Requires manual override or alternate payment collection.',
    aiAction: 'Collect alternate payment or offer EMI option',
    chatLog: [
      { role: 'user', msg: 'My payment keeps failing for the Singapore booking', time: '10:31 AM' },
      { role: 'ai', msg: 'I see your Visa card ending 4821 was declined. Would you like to try your other saved card ending 9302?', time: '10:31 AM' },
      { role: 'user', msg: 'Yes please try that one', time: '10:32 AM' },
      { role: 'ai', msg: 'That card also declined. This may require manual agent assistance. Transferring you now.', time: '10:32 AM' },
    ],
  },
  {
    id: 'ESC-002',
    priority: 'high',
    type: 'visa_risk',
    typeLabel: 'Visa Risk',
    customer: 'Priya Mehta',
    email: 'priya.m@startup.io',
    phone: '+91 87654 32109',
    route: 'BOM → LHR → JFK',
    date: '18 Mar 2025',
    amount: '₹95,000',
    created: '15 min ago',
    status: 'open',
    aiSummary: 'Customer has a BOM→LHR→JFK itinerary with 4h transit at Heathrow. Indian passport holders require a UK transit visa (DATV) even for airside transit. Customer was not aware and booking is not yet confirmed.',
    aiAction: 'Inform customer about UK DATV requirement. Offer direct BOM→JFK alternative via AI or rebook.',
    chatLog: [
      { role: 'user', msg: 'Book me Mumbai to New York via London, 18th March', time: '09:15 AM' },
      { role: 'ai', msg: 'Found a great option via Heathrow. Before I confirm — Indian passport holders need a UK Direct Airside Transit Visa for LHR. This costs ~£35 and takes 5-10 days. Shall I find a direct alternative instead?', time: '09:15 AM' },
      { role: 'user', msg: 'I need this date, can a travel agent help me?', time: '09:17 AM' },
    ],
  },
  {
    id: 'ESC-003',
    priority: 'medium',
    type: 'corporate_policy',
    typeLabel: 'Policy Exception',
    customer: 'Arjun Kapoor',
    email: 'arjun.k@nexusbpo.com',
    phone: '+91 76543 21098',
    route: 'BOM → LHR',
    date: '25 Mar 2025',
    amount: '₹1,12,000',
    created: '42 min ago',
    status: 'pending',
    aiSummary: 'Corporate employee requesting Business Class BOM→LHR (₹1.12L). Company policy cap is ₹80,000 for international routes. Fare exceeds cap by ₹32,000. Manager approval pending — no response in 30 mins.',
    aiAction: 'Escalate to finance approver or offer Economy option at ₹68,000',
    chatLog: [
      { role: 'user', msg: 'I need business class London for the client meeting', time: '08:00 AM' },
      { role: 'ai', msg: 'Found British Airways BOM→LHR Business at ₹1,12,000. Your company policy cap is ₹80,000. Requesting manager approval from Sneha Iyer...', time: '08:01 AM' },
      { role: 'ai', msg: 'No response from approver after 30 minutes. Escalating to travel desk.', time: '08:31 AM' },
    ],
  },
  {
    id: 'ESC-004',
    priority: 'low',
    type: 'refund',
    typeLabel: 'Refund Request',
    customer: 'Sana Sheikh',
    email: 'sana.s@gmail.com',
    phone: '+91 65432 10987',
    route: 'DEL → DXB',
    date: '10 Mar 2025',
    amount: '₹18,200',
    created: '2 hours ago',
    status: 'resolved',
    aiSummary: 'Customer cancelled DEL→DXB booking within 24h of purchase. Per policy, full refund applicable minus ₹500 processing fee. Refund of ₹17,700 initiated automatically by AI. Customer confirmed receipt.',
    aiAction: 'Resolved automatically — no agent action needed',
    chatLog: [
      { role: 'user', msg: 'I need to cancel my Dubai flight and get a refund', time: '06:00 AM' },
      { role: 'ai', msg: 'Your booking is within 24h of purchase — you qualify for a full refund. Processing ₹17,700 (minus ₹500 fee) to your original card. Done in 5-7 days.', time: '06:00 AM' },
      { role: 'user', msg: 'Thank you!', time: '06:01 AM' },
    ],
  },
  {
    id: 'ESC-005',
    priority: 'medium',
    type: 'technical',
    typeLabel: 'Technical Error',
    customer: 'Vikram Nair',
    email: 'vikram.n@corp.com',
    phone: '+91 54321 09876',
    route: 'BLR → SIN',
    date: '20 Mar 2025',
    amount: '₹22,400',
    created: '3 hours ago',
    status: 'open',
    aiSummary: 'Booking confirmed and payment deducted but PNR generation failed in airline system. Customer has payment receipt but no ticket. Requires manual PNR issuance with Air India GDS.',
    aiAction: 'Issue PNR manually in Amadeus GDS. Cross-reference payment receipt ID: PAY-2024031205.',
    chatLog: [
      { role: 'user', msg: 'I paid but never got my ticket!', time: '03:30 PM' },
      { role: 'ai', msg: 'I can see your payment of ₹22,400 was received (Ref: PAY-2024031205). The ticket generation had a technical error. Escalating to our team immediately — you will receive your ticket within 2 hours.', time: '03:30 PM' },
    ],
  },
]

const STATS = [
  { label: 'Open Cases', value: 3, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { label: 'Pending Approval', value: 1, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  { label: 'Resolved Today', value: 8, icon: CheckCircle, color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20' },
  { label: 'Automation Rate', value: '87%', icon: Zap, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
]

const PRIORITY_STYLES = {
  high: { badge: 'bg-red-500/15 text-red-400 border-red-500/20', dot: 'bg-red-400', label: 'High' },
  medium: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: 'Medium' },
  low: { badge: 'bg-sage-400/15 text-sage-400 border-sage-400/20', dot: 'bg-sage-400', label: 'Low' },
}

const STATUS_STYLES = {
  open: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  resolved: 'bg-sage-400/10 text-sage-400 border-sage-400/20',
}

const TYPE_ICONS = {
  payment_fail: '💳',
  visa_risk: '🛂',
  corporate_policy: '🏢',
  refund: '↩️',
  technical: '⚙️',
}

// ── Case Detail Panel ────────────────────────────────────────────────────────
function CaseDetail({ caseData, onClose, onResolve }) {
  const [note, setNote] = useState('')
  const priority = PRIORITY_STYLES[caseData.priority]

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="glass border border-border rounded-2xl overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-5 border-b border-border/60 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{TYPE_ICONS[caseData.type]}</span>
            <span className="font-mono text-xs text-muted">{caseData.id}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${priority.badge}`}>
              {priority.label} Priority
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-white">{caseData.typeLabel}</h2>
          <p className="text-muted text-xs">{caseData.created}</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-muted hover:text-white transition-colors">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Customer info */}
        <div className="glass border border-border rounded-xl p-4">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Customer</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/20 flex items-center justify-center">
              <span className="text-sky-400 font-bold">{caseData.customer[0]}</span>
            </div>
            <div>
              <div className="text-white font-semibold">{caseData.customer}</div>
              <div className="text-muted text-xs">{caseData.email}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${caseData.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all">
              <Phone className="w-3 h-3" /> Call
            </a>
            <a href={`mailto:${caseData.email}`} className="flex items-center gap-1.5 px-3 py-1.5 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all">
              <Mail className="w-3 h-3" /> Email
            </a>
            <button className="flex items-center gap-1.5 px-3 py-1.5 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all">
              <MessageCircle className="w-3 h-3" /> Chat
            </button>
          </div>
        </div>

        {/* Booking info */}
        <div className="glass border border-border rounded-xl p-4">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Booking Details</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['Route', caseData.route],
              ['Date', caseData.date],
              ['Amount', caseData.amount],
              ['Status', caseData.status],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-muted text-xs">{k}</div>
                <div className="text-white font-medium capitalize">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-4 bg-gold-400/8 border border-gold-400/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 text-sm font-semibold">AI Case Summary</span>
          </div>
          <p className="text-gold-200/70 text-xs leading-relaxed mb-3">{caseData.aiSummary}</p>
          <div className="flex items-start gap-2 pt-2 border-t border-gold-400/15">
            <ArrowRight className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-gold-300 text-xs font-medium">{caseData.aiAction}</p>
          </div>
        </div>

        {/* Chat transcript */}
        <div>
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Chat Transcript</p>
          <div className="space-y-2">
            {caseData.chatLog.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                  msg.role === 'user'
                    ? 'bg-sky-500/15 border border-sky-500/20 text-white rounded-tr-sm'
                    : 'glass border border-border text-white/80 rounded-tl-sm'
                }`}>
                  <p className="leading-relaxed">{msg.msg}</p>
                  <p className="text-muted/50 text-xs mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent note */}
        <div>
          <p className="text-muted text-xs uppercase tracking-wider mb-2">Add Resolution Note</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe action taken..."
            className="ai-input w-full px-4 py-3 rounded-xl text-white text-sm resize-none h-20"
          />
        </div>
      </div>

      {/* Actions footer */}
      {caseData.status !== 'resolved' && (
        <div className="p-4 border-t border-border/60 flex gap-2">
          <button className="flex-1 py-2.5 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all">
            Escalate Further
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { onResolve(caseData.id); toast.success('Case marked as resolved') }}
            className="flex-1 py-2.5 bg-gradient-to-r from-sage-500 to-sage-400 text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Mark Resolved
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const [cases, setCases] = useState(CASES)
  const [selectedCase, setSelectedCase] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [aiTip, setAiTip] = useState('')

useEffect(() => {
  getAIRecommendation('Give a concise travel tip...')
    .then(setAiTip).catch(() => {})
}, [])

  const filtered = cases.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.customer.toLowerCase().includes(search.toLowerCase()) &&
        !c.route.toLowerCase().includes(search.toLowerCase()) &&
        !c.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleResolve = (id) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c))
    if (selectedCase?.id === id) {
      setSelectedCase(prev => ({ ...prev, status: 'resolved' }))
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {aiTip && (
  <div className="flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
    <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
    <p className="text-gold-200/80 text-sm">{aiTip}</p>
  </div>
)}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Agent Dashboard</h1>
              <span className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 text-xs rounded-full font-medium animate-pulse">
                {cases.filter(c => c.status === 'open').length} Live
              </span>
            </div>
            <p className="text-muted text-sm">Exception cases escalated from AI — requires human action</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all">
              <Bell className="w-4 h-4" /> Notifications
            </button>
            <button className="flex items-center gap-2 px-3 py-2 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all">
              <BarChart3 className="w-4 h-4" /> Reports
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STATS.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass border rounded-2xl p-4 ${bg}`}
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="font-bold text-2xl text-white">{value}</div>
              <div className="text-muted text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main layout */}
        <div className={`grid gap-5 ${selectedCase ? 'lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>

          {/* Cases list */}
          <div>
            {/* Filters & search */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by customer, route, ID..."
                  className="ai-input w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex gap-1">
                {['all', 'open', 'pending', 'resolved'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      filter === f
                        ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20'
                        : 'text-muted hover:text-white border border-transparent'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases */}
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-10 h-10 text-sage-400/40 mx-auto mb-3" />
                  <p className="text-muted">No cases match your filter.</p>
                </div>
              )}
              {filtered.map((c, i) => {
                const priority = PRIORITY_STYLES[c.priority]
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                    className={`glass border rounded-2xl p-4 cursor-pointer transition-all duration-200 group ${
                      selectedCase?.id === c.id
                        ? 'border-gold-400/30 bg-gold-400/5'
                        : 'border-border hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Priority dot + type */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <span className={`w-2 h-2 rounded-full ${priority.dot} ${c.status === 'open' ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-lg">{TYPE_ICONS[c.type]}</span>
                            <span className="font-semibold text-white text-sm group-hover:text-gold-300 transition-colors">{c.typeLabel}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${priority.badge}`}>
                              {priority.label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full border font-medium capitalize ${STATUS_STYLES[c.status]}`}>
                              {c.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.customer}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{c.route}</span>
                            <span>·</span>
                            <span>{c.amount}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.created}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI summary preview */}
                      <div className="flex-1 min-w-48 hidden md:block">
                        <p className="text-muted text-xs leading-relaxed line-clamp-2">{c.aiSummary}</p>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                        {c.status !== 'resolved' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); handleResolve(c.id) }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-sage-400/15 border border-sage-400/20 text-sage-400 text-xs rounded-lg font-medium"
                          >
                            <CheckCircle className="w-3 h-3" /> Resolve
                          </motion.button>
                        )}
                        <Eye className="w-4 h-4 text-muted group-hover:text-gold-400 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Case detail panel */}
          <AnimatePresence>
            {selectedCase && (
              <div className="h-fit sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
                <CaseDetail
                  caseData={selectedCase}
                  onClose={() => setSelectedCase(null)}
                  onResolve={handleResolve}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
