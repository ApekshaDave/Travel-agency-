
import { useState, useEffect, useCallback } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, Clock, MessageCircle, Sparkles, Zap, ArrowRight, Phone, Send,
  Mail, User, Plane, XCircle, ChevronRight, DollarSign, Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../utils/supabaseClient'
import StaffNav from '../components/layout/StaffNav'

const PRIORITY_STYLES = {
  high: { badge: 'bg-red-100 text-red-600 border-red-200', dot: 'bg-red-500', label: 'High' },
  medium: { badge: 'bg-amber-100 text-amber-600 border-amber-200', dot: 'bg-amber-500', label: 'Medium' },
  low: { badge: 'bg-green-100 text-green-600 border-green-200', dot: 'bg-green-500', label: 'Low' },
}

const TYPE_ICONS = {
  payment_fail: '💳', visa_risk: '🛂', corporate_policy: '🏢', refund: '↩️', technical: '⚙️',
}

function CaseCard({ c, i, selectedCase, setSelectedCase, handleResolve }) {
  const priority = PRIORITY_STYLES[c.priority] || PRIORITY_STYLES.medium
  const borderColor = { high: 'border-l-red-500', medium: 'border-l-amber-500', low: 'border-l-green-500' }[c.priority] || 'border-l-slate-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
      className={`bg-white border-l-4 border border-slate-200 rounded-2xl p-4 cursor-pointer transition-all duration-200 group flex items-start gap-4 hover:shadow-md ${
        selectedCase?.id === c.id ? 'border-blue-500 bg-blue-50' : borderColor
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-lg">{TYPE_ICONS[c.type] || '📋'}</span>
          <span className="font-semibold text-slate-900 text-sm">{c.typeLabel}</span>
          <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${priority.badge}`}>
            {priority.label}
          </span>
          {c.sla && c.status !== 'resolved' && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded-lg border border-red-200">
              <Clock className="w-2.5 h-2.5" /> SLA: {c.sla}
            </span>
          )}
        </div>
        <div className="flex items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-slate-700"><User className="w-3 h-3" />{c.customer}</span>
          <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{c.route}</span>
          <span>{c.amount}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.created}</span>
        </div>
        <p className="mt-3 text-slate-500 text-xs leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
          &ldquo;{c.aiSummary}&rdquo;
        </p>
      </div>
      <div className="flex flex-col items-end gap-3 self-center">
        {c.status !== 'resolved' && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); handleResolve(c.id, 'Resolved by agent') }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-[10px] rounded-lg font-bold"
          >
            <CheckCircle className="w-3 h-3" /> Resolve
          </motion.button>
        )}
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors">
          <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  )
}

const BRANCHES = [
  { id: 'all', label: 'All Issues', icon: MessageCircle },
  { id: 'trip', label: 'Trip Operations', icon: Plane },
  { id: 'payment', label: 'Payments', icon: DollarSign },
  { id: 'technical', label: 'Technical', icon: Zap },
  { id: 'cancellation', label: 'Cancellations', icon: XCircle },
]

function CaseDetail({ caseData, onClose, onResolve, onInstructionsSent, onAgentApprove }) {
  const [note, setNote] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const isFinanceIssue = caseData.typeLabel === 'Finance Issue'
  const priority = PRIORITY_STYLES[caseData.priority] || PRIORITY_STYLES.medium

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase bg-blue-100 text-blue-700 border-blue-200`}>
              {caseData.typeLabel}
            </span>
            <span className="font-mono text-xs text-slate-400">{caseData.id}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase ${priority.badge}`}>
              {priority.label}
            </span>
          </div>
          <p className="text-slate-400 text-xs">{caseData.created}</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Customer info */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">Customer</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {caseData.customer?.[0] || '?'}
            </div>
            <div>
              <div className="text-slate-900 font-semibold">{caseData.customer}</div>
              <div className="text-slate-500 text-xs">{caseData.email}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${caseData.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all">
              <Phone className="w-3 h-3" /> Call
            </a>
            <a href={`mailto:${caseData.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all">
              <Mail className="w-3 h-3" /> Email
            </a>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all">
              <MessageCircle className="w-3 h-3" /> Chat
            </button>
          </div>
        </div>

        {/* Booking info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-semibold">Booking Details</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Route', caseData.route], ['Date', caseData.date], ['Amount', caseData.amount], ['Status', caseData.status]].map(([k, v]) => (
              <div key={k}>
                <div className="text-slate-400 text-[10px] uppercase font-bold">{k}</div>
                <div className="text-slate-900 font-semibold capitalize mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">AI Case Summary</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">{caseData.aiSummary}</p>
          {caseData.aiAction && (
            <div className="flex items-start gap-2 pt-2 mt-2 border-t border-blue-100">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs font-medium">{caseData.aiAction}</p>
            </div>
          )}
        </div>

        {/* Agent note */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-semibold">Add Resolution Note</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe action taken..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Actions footer */}
      {caseData.status !== 'resolved' && (
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50">
          {!isResolving ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setIsResolving(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" /> Resolve Case
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-slate-700 text-xs font-bold uppercase tracking-wider">Resolution Center</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Type instructions or resolution details..."
                className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 text-sm h-20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
              <div className="flex gap-2">
                {!isFinanceIssue ? (
                  <button
                    onClick={() => onResolve(caseData.id, 'Issue has been resolved')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => onAgentApprove(caseData.id, note || 'Agent approved.')}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Send to Finance
                  </button>
                )}
                <button
                  disabled={!note.trim()}
                  onClick={() => onInstructionsSent(caseData.id, note)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> Send Instructions
                </button>
              </div>
              <button onClick={() => setIsResolving(false)} className="w-full text-[10px] text-slate-400 hover:underline uppercase">
                Go Back
              </button>
            </motion.div>
          )}

          {!isResolving && caseData.aiAction && (
            <button
              onClick={() => { onResolve(caseData.id, `AI Action Applied: ${caseData.aiAction}`); toast.success('Action: ' + caseData.aiAction) }}
              className="w-full py-2.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> {caseData.aiAction}
            </button>
          )}

          {!isResolving && (
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
              <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function AgentDashboard() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [filter] = useState('all')
  const [branch, setBranch] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [aiTip, setAiTip] = useState('')

  const fetchIssues = useCallback(async () => {
    const { data, error } = await supabase
      .from('booking_issues').select('*').order('created_at', { ascending: false })
    if (!error) {
      setCases((data || []).map(item => ({
        ...item,
        customer: item.customer_name,
        email: item.customer_email,
        phone: item.customer_phone,
        typeLabel: item.issue_type,
        created: new Date(item.created_at).toLocaleDateString(),
        priority: item.priority || 'high',
        aiSummary: item.description,
        chatLog: [],
      })))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('booking_issues').select('*').order('created_at', { ascending: false })
      if (cancelled) return
      if (!error) {
        setCases((data || []).map(item => ({
          ...item,
          customer: item.customer_name,
          email: item.customer_email,
          phone: item.customer_phone,
          typeLabel: item.issue_type,
          created: new Date(item.created_at).toLocaleDateString(),
          priority: item.priority || 'high',
          aiSummary: item.description,
          chatLog: [],
        })))
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    getAIRecommendation('Give a concise one-line tip for travel agents handling escalated cases today.')
      .then(result => setAiTip(result)).catch(() => {})
  }, [])

  const filtered = cases.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (branch !== 'all') {
      if (branch === 'trip' && !['Visa Risk', 'Trip Request'].includes(c.typeLabel)) return false
      if (branch === 'payment' && !['Payment Failed', 'Finance Issue'].includes(c.typeLabel)) return false
      if (branch === 'technical' && !['Technical Error', 'Technical Issue'].includes(c.typeLabel)) return false
      if (branch === 'cancellation' && !['Cancellation Request', 'Refund Request'].includes(c.typeLabel)) return false
    }
    if (search) {
      const q = search.toLowerCase()
      if (!c.customer?.toLowerCase().includes(q) && !c.route?.toLowerCase().includes(q) && !String(c.id).toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleResolve = async (id, message) => {
    try {
      const { error } = await supabase.from('booking_issues').update({ status: 'resolved', resolution_note: message }).eq('id', id)
      if (error) throw error
      toast.success('Issue marked as resolved!')
      fetchIssues()
      if (selectedCase?.id === id) setSelectedCase(null)
    } catch (err) { toast.error('Update failed: ' + err.message) }
  }

  const handleInstructionsSent = async (id, note) => {
    try {
      const { error } = await supabase.from('booking_issues').update({ status: 'pending', resolution_note: note }).eq('id', id)
      if (error) throw error
      toast.success('Instructions sent!')
      fetchIssues()
      if (selectedCase?.id === id) setSelectedCase(null)
    } catch (err) { toast.error('Update failed: ' + err.message) }
  }

  const handleAgentApprove = async (id, note) => {
    try {
      const { error } = await supabase.from('booking_issues').update({ status: 'pending', resolution_note: note, escalated_to_finance: true }).eq('id', id)
      if (error) throw error
      toast.success('Sent to Finance team!')
      fetchIssues()
      if (selectedCase?.id === id) setSelectedCase(null)
    } catch (err) { toast.error('Update failed: ' + err.message) }
  }

  const openCases = cases.filter(c => c.status === 'open').length
  const pendingCases = cases.filter(c => c.status === 'pending').length
  const resolvedCases = 7 + cases.filter(c => c.status === 'resolved').length

  const stats = [
    { label: 'Open Cases', value: openCases, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Pending', value: pendingCases, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Resolved Today', value: resolvedCases, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: 'Efficiency', value: '94%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  ]

  void loading

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-8 px-4">
      <StaffNav />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="py-6 flex items-end justify-between border-b border-slate-200 mb-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Agent Control</h1>
            <div className="flex items-center gap-1">
              {['summary', 'queue'].map(v => (
                <button
                  key={v}
                  onClick={() => { setView(v); setSelectedCase(null) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    view === v ? 'text-blue-600 bg-blue-50 border border-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {v}
                </button>
              ))}
              {selectedCase && (
                <div className="flex items-center gap-2 text-blue-600">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold">Active: {selectedCase.id}</span>
                </div>
              )}
            </div>
          </div>
          <span className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {openCases} High Priority
          </span>
        </motion.div>

        {/* AI Tip */}
        {aiTip && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-slate-700 text-sm">{aiTip}</p>
          </div>
        )}

        <div className="min-h-[600px] flex flex-col md:flex-row gap-8">

          {/* Branch Sidebar */}
          {(view === 'queue' || view === 'work') && !selectedCase && (
            <div className="w-full md:w-56 flex-shrink-0 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Support Branches</p>
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBranch(b.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    branch === b.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <b.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{b.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1">
            {view === 'summary' && !selectedCase && (
              <div className="space-y-10">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`bg-white border rounded-2xl p-4 ${bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest text-right">{label}</span>
                      </div>
                      <div className={`font-bold text-2xl ${color}`}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Urgent cases */}
                <div>
                  <h2 className="text-slate-900 font-bold text-xl mb-5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Needs Immediate Focus
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {cases.filter(c => c.priority === 'high' && c.status !== 'resolved').slice(0, 4).map((c, i) => (
                      <CaseCard key={c.id} c={c} i={i} handleResolve={handleResolve} selectedCase={selectedCase}
                        setSelectedCase={(item) => { setSelectedCase(item); setView('work') }} />
                    ))}
                  </div>
                  {cases.filter(c => c.priority === 'high' && c.status !== 'resolved').length === 0 && (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No high-priority cases right now</p>
                      <p className="text-slate-400 text-sm mt-1">Great work keeping up with the queue!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(view === 'queue' || view === 'work') && (
              <div className={`grid gap-6 ${selectedCase ? 'lg:grid-cols-[300px_1fr]' : 'grid-cols-1'}`}>

                {/* Task sidebar */}
                <div className={`${selectedCase ? 'block' : 'hidden'} space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Remaining Tasks</div>
                  {cases.filter(c => c.status !== 'resolved').map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedCase?.id === c.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-slate-400">{c.id}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_STYLES[c.priority]?.dot || 'bg-slate-300'}`} />
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{c.customer}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.typeLabel}</div>
                    </div>
                  ))}
                </div>

                {/* Main workspace */}
                <div className="min-w-0">
                  {selectedCase ? (
                    <CaseDetail
                      caseData={selectedCase}
                      onClose={() => { setSelectedCase(null); setView('summary') }}
                      onResolve={handleResolve}
                      onInstructionsSent={handleInstructionsSent}
                      onAgentApprove={handleAgentApprove}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
                        <h2 className="text-slate-900 font-bold text-xl">Full Queue</h2>
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-slate-400" />
                          <input
                            placeholder="Search tickets..."
                            className="bg-white border border-slate-200 text-slate-900 text-xs px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-56 placeholder:text-slate-400"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                          <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">No cases found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filtered.map((c, i) => (
                            <CaseCard key={c.id} c={c} i={i} handleResolve={handleResolve} selectedCase={selectedCase}
                              setSelectedCase={(item) => { setSelectedCase(item); setView('work') }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
