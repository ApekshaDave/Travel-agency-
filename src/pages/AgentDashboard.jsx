import { useState, useEffect } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, Clock, MessageCircle, Sparkles, Zap, ArrowRight, Phone, Send,
  Mail, User, Plane, XCircle, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from './supabaseClient'
import StaffNav from '../components/layout/StaffNav'

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
    sla: '08:15',
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
    sla: '12:34',
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
    sla: '04:12',
  },
]

const PRIORITY_STYLES = {
  high: { badge: 'bg-red-500/15 text-red-400 border-red-500/20', dot: 'bg-red-400', label: 'High' },
  medium: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20', dot: 'bg-amber-400', label: 'Medium' },
  low: { badge: 'bg-sage-400/15 text-sage-400 border-sage-400/20', dot: 'bg-sage-400', label: 'Low' },
}

const TYPE_ICONS = {
  payment_fail: '💳',
  visa_risk: '🛂',
  corporate_policy: '🏢',
  refund: '↩️',
  technical: '⚙️',
}

// ── Case Card Component ──────────────────────────────────────────────────────
function CaseCard({ c, i, selectedCase, setSelectedCase, handleResolve }) {
  const priority = PRIORITY_STYLES[c.priority]
  const priorityBorder = {
    high: 'border-l-red-400',
    medium: 'border-l-amber-400',
    low: 'border-l-sage-400',
  }[c.priority]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
      className={`glass border-l-4 rounded-2xl p-4 cursor-pointer transition-all duration-200 group flex items-start gap-4 ${selectedCase?.id === c.id
        ? 'border-gold-400/30 bg-gold-400/5'
        : `border-border border-l-border/50 hover:border-gold-400/30 ${priorityBorder}`
        }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-lg">{TYPE_ICONS[c.type]}</span>
          <span className="font-semibold text-white text-sm group-hover:text-gold-300 transition-colors">{c.typeLabel}</span>
          <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${priority.badge}`}>
            {priority.label}
          </span>
          {c.sla && c.status !== 'resolved' && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-lg border border-red-400/20">
              <Clock className="w-2.5 h-2.5" /> SLA: {c.sla}
            </span>
          )}
        </div>

        <div className="flex items-center gap-x-3 gap-y-1 text-[11px] text-muted flex-wrap">
          <span className="flex items-center gap-1 font-medium text-white/70"><User className="w-3 h-3" />{c.customer}</span>
          <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{c.route}</span>
          <span>{c.amount}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.created}</span>
        </div>

        <p className="mt-3 text-muted/80 text-xs leading-relaxed line-clamp-2 md:line-clamp-none bg-white/5 p-2 rounded-lg border border-white/5 italic">
          "{c.aiSummary}"
        </p>
      </div>

      <div className="flex flex-col items-end gap-3 self-center">
        {c.status !== 'resolved' && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); handleResolve(c.id) }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-400 text-void text-[10px] rounded-lg font-bold shadow-lg"
          >
            <CheckCircle className="w-3 h-3" /> Resolve
          </motion.button>
        )}
        <div className="flex items-center gap-2 text-muted group-hover:text-gold-400 transition-colors">
          <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Case Detail Panel ────────────────────────────────────────────────────────
function CaseDetail({ caseData, onClose, onResolve, onInstructionsSent }) {
  const [note, setNote] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const priority = PRIORITY_STYLES[caseData.priority] || PRIORITY_STYLES.medium

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
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${msg.role === 'user'
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
        <div className="p-4 border-t border-border/60 space-y-4">
          {!isResolving ? (
            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={() => setIsResolving(true)}
                className="w-full py-3 bg-gold-gradient text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Resolve Case
              </motion.button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-gold-400/20">
              <p className="text-white text-xs font-bold uppercase tracking-wider">Resolution Center</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Type instructions or resolution details for the customer..."
                className="w-full bg-void/50 border border-border rounded-xl p-3 text-white text-sm h-24 focus:border-gold-400 outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => onResolve(caseData.id, 'Issue has been resolved')} className="flex-1 py-2 glass border border-sage-400/30 text-sage-400 rounded-lg text-xs font-bold">
                  Mark Resolved (Simple)
                </button>
                <button
                  disabled={!note.trim()}
                  onClick={() => onInstructionsSent(caseData.id, note)}
                  className="flex-1 py-2 bg-gold-400 text-void rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30"
                >
                  <Send className="w-3.5 h-3.5" /> Send Instructions
                </button>
              </div>
              <button onClick={() => setIsResolving(false)} className="w-full text-[10px] text-muted hover:underline uppercase">Go Back</button>
            </motion.div>
          )}

          {!isResolving && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { onResolve(caseData.id); toast.success('Action performed: ' + caseData.aiAction) }}
              className="w-full py-3 glass border border-gold-400/20 text-gold-400 font-bold rounded-xl text-sm flex flex-col items-center justify-center leading-tight shadow-gold"
            >
              <span>{caseData.aiAction}</span>
              <span className="text-[10px] opacity-70 font-medium mt-0.5">AI Recommended Action</span>
            </motion.button>
          )}

          {!isResolving && (
            <div className="flex gap-2">
              <button className="flex-1 py-2 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
              <button className="flex-1 py-2 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                className="flex-1 py-2 glass border border-border rounded-lg text-xs text-muted hover:text-white transition-all flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [filter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('summary') // summary, queue, work
  const [loading, setLoading] = useState(true)

  const [aiTip, setAiTip] = useState('')

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('booking_issues')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      const mapped = (data || []).map(item => ({
        ...item,
        customer: item.customer_name,
        email: item.customer_email,
        phone: item.customer_phone,
        typeLabel: item.issue_type,
        created: new Date(item.created_at).toLocaleDateString(),
        priority: 'high',
        aiSummary: item.description,
        chatLog: [] // Could be connected to a chat table later
      }))
      setCases(mapped)
    }
    setLoading(false)
  }

  useEffect(() => {
    getAIRecommendation('Give a concise one-line tip for travel agents handling escalated cases today.')
      .then(result => setAiTip(result))
      .catch(() => { })
  }, [])

  const filtered = cases.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.customer.toLowerCase().includes(search.toLowerCase()) &&
      !c.route.toLowerCase().includes(search.toLowerCase()) &&
      !c.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleResolve = async (id, message) => {
    try {
      const { error } = await supabase
        .from('booking_issues')
        .update({ status: 'resolved', resolution_note: message })
        .eq('id', id)

      if (error) throw error
      toast.success('Issue marked as resolved!')
      fetchIssues()
      if (selectedCase?.id === id) setSelectedCase(null)
    } catch (err) {
      toast.error('Update failed: ' + err.message)
    }
  }

  const handleInstructionsSent = async (id, note) => {
    try {
      const { error } = await supabase
        .from('booking_issues')
        .update({ status: 'pending', resolution_note: note })
        .eq('id', id)

      if (error) throw error
      toast.success('Instructions sent to customer!')
      fetchIssues()
      if (selectedCase?.id === id) setSelectedCase(null)
    } catch (err) {
      toast.error('Update failed: ' + err.message)
    }
  }

  const openCasesCount = cases.filter(c => c.status === 'open').length
  const pendingCasesCount = cases.filter(c => c.status === 'pending').length
  const resolvedCasesCount = 7 + cases.filter(c => c.status === 'resolved').length

  const stats = [
    { label: 'Open Cases', value: openCasesCount, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    { label: 'Pending Approval', value: pendingCasesCount, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
    { label: 'Resolved Today', value: resolvedCasesCount, icon: CheckCircle, color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20' },
    { label: 'Automation Rate', value: '87%', icon: Zap, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
  ]


  return (
    <div className="min-h-screen pt-28 pb-8 px-4">
      <StaffNav />
      <div className="max-w-7xl mx-auto">

        {/* Header - Phased Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-end justify-between border-b border-border/40 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">Agent Control</h1>
            <div className="flex items-center gap-1">
              {['summary', 'queue'].map(v => (
                <button
                  key={v}
                  onClick={() => { setView(v); setSelectedCase(null) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${view === v ? 'text-gold-400 bg-gold-400/5' : 'text-muted hover:text-white'
                    }`}
                >
                  {v}
                </button>
              ))}
              {selectedCase && (
                <div className="flex items-center gap-2 text-gold-400">
                  <ChevronRight className="w-4 h-4 text-muted" />
                  <span className="px-3 py-1 bg-gold-400/10 rounded-lg text-xs font-bold">Active: {selectedCase.id}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-full font-bold animate-pulse flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {cases.filter(c => c.status === 'open').length} High Priority
            </span>
          </div>
        </motion.div>

        {aiTip && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
            <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-gold-200/80 text-sm">{aiTip}</p>
          </div>
        )}


        {/* Dynamic Views */}
        <div className="min-h-[600px]">
          {view === 'summary' && !selectedCase && (
            <div className="space-y-12">
              {/* Stats (Compact) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`glass border rounded-2xl p-4 ${bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">{label}</span>
                    </div>
                    <div className="font-bold text-2xl text-white">{value}</div>
                  </div>
                ))}
              </div>

              {/* Urgent Phased Triage */}
              <div>
                <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Needs Your Immediate Focus
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {cases.filter(c => c.priority === 'high' && c.status !== 'resolved').slice(0, 4).map((c, i) => (
                    <CaseCard
                      key={c.id} c={c} i={i}
                      handleResolve={handleResolve}
                      selectedCase={selectedCase}
                      setSelectedCase={(caseItem) => { setSelectedCase(caseItem); setView('work') }}
                    />
                  ))}
                </div>
                {cases.filter(c => c.priority === 'high' && c.status !== 'resolved').length > 4 && (
                  <button onClick={() => setView('queue')} className="mt-6 w-full py-4 glass border border-border rounded-2xl text-muted hover:text-white transition-all text-sm font-medium">
                    View all {cases.filter(c => c.priority === 'high' && c.status !== 'resolved').length} high-priority cases
                  </button>
                )}
              </div>
            </div>
          )}

          {(view === 'queue' || view === 'work') && (
            <div className={`grid gap-6 ${selectedCase ? 'lg:grid-cols-[320px_1fr]' : 'grid-cols-1'}`}>

              {/* Sidebar List (only when in work mode) */}
              <div className={`${selectedCase ? 'block' : 'hidden'} space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar`}>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest px-2 mb-2">Remaining Tasks</div>
                {cases.filter(c => c.status !== 'resolved').map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedCase?.id === c.id
                      ? 'bg-gold-400/10 border-gold-400/30'
                      : 'border-border hover:border-white/10 text-muted'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono">{c.id}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_STYLES[c.priority].dot}`} />
                    </div>
                    <div className="text-xs font-bold text-white truncate">{c.customer}</div>
                    <div className="text-[10px] opacity-60 truncate">{c.typeLabel}</div>
                  </div>
                ))}
              </div>

              {/* Main Workspace */}
              <div className="min-w-0">
                {selectedCase ? (
                  <CaseDetail
                    caseData={selectedCase}
                    onClose={() => { setSelectedCase(null); setView('summary') }}
                    onResolve={handleResolve}
                    onInstructionsSent={handleInstructionsSent}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <h2 className="text-white font-bold text-xl uppercase tracking-tighter">Full Queue</h2>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted" />
                        <input
                          placeholder="Search tickets..."
                          className="bg-surface border border-border text-xs px-4 py-2 rounded-xl outline-none focus:border-gold-400/30 transition-all w-64"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {filtered.map((c, i) => (
                        <CaseCard
                          key={c.id} c={c} i={i}
                          handleResolve={handleResolve}
                          selectedCase={selectedCase}
                          setSelectedCase={(caseItem) => { setSelectedCase(caseItem); setView('work') }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
