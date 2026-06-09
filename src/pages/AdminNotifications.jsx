import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Bell, CheckCircle, AlertTriangle, ChevronRight, Zap,
  Clock, Search, ToggleRight, ToggleLeft, RefreshCw,
  Send, MessageSquare, Phone, Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import StaffNav from '../components/layout/StaffNav'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ROUTING_RULES = [
  { id: 'WF-001', name: 'High-Value Booking Alert', condition: 'Booking > ₹50,000', route: 'Finance Manager + Senior Agent', channels: ['Email', 'Dashboard'], active: true, triggeredToday: 3 },
  { id: 'WF-002', name: 'Refund Auto-Approval', condition: 'Refund < ₹5,000 AND >30 days before departure', route: 'Auto-process', channels: ['Email to customer', 'Ledger update'], active: true, triggeredToday: 1 },
  { id: 'WF-003', name: 'Corporate Policy Breach', condition: 'Booking exceeds fare cap', route: 'Corporate manager', channels: ['Email', 'Dashboard', 'Slack'], active: true, triggeredToday: 2 },
  { id: 'WF-004', name: 'Payment Failure Escalation', condition: 'Payment fails after 2 retries', route: 'Agent dashboard', channels: ['Dashboard alert', 'SMS'], active: true, triggeredToday: 1 },
  { id: 'WF-005', name: 'Monthly Statement Generation', condition: '1st of every month at 08:00', route: 'Finance team', channels: ['Auto-email', 'Finance dashboard'], active: true, triggeredToday: 0 },
]

export default function AdminNotifications() {
  const { token } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('issues')
  const [routingRules, setRoutingRules] = useState(ROUTING_RULES)
  const [resolving, setResolving] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState({})

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // Stable fetch function for the manual refresh button
  const loadIssues = useCallback(() => {
    setLoading(true)
    fetch(`${API}/api/booking_issues`, { headers })
      .then(r => r.json())
      .then(data => setIssues(Array.isArray(data) ? data : []))
      .catch(err => { console.error(err); toast.error('Failed to load issues') })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Initial load — async IIFE keeps setState out of the effect body directly
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${API}/api/booking_issues`, { headers })
        const data = await res.json()
        if (!cancelled) setIssues(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) { console.error(err); toast.error('Failed to load issues') }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleMarkComplete = async (issueId) => {
    const note = resolutionNotes[issueId] || 'Issue resolved by admin'
    setResolving(issueId)
    try {
      await fetch(`${API}/api/booking_issues?id=${issueId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'resolved', resolution_note: note }),
      })
      // Push notification to customer dashboard (updates trip record's status)
      toast.success('Issue resolved — customer will be notified')
      loadIssues()
    } catch {
      toast.error('Failed to update issue')
    } finally {
      setResolving(null)
    }
  }

  const toggleRule = (id) => {
    setRoutingRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  const openIssues     = issues.filter(i => i.status === 'open').length
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length

  const filtered = issues.filter(issue => {
    if (filter !== 'all' && issue.status !== filter) return false
    if (search && !issue.customer_name?.toLowerCase().includes(search.toLowerCase()) &&
        !issue.description?.toLowerCase().includes(search.toLowerCase()) &&
        !issue.issue_type?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50 pt-36 pb-16 px-4">
      <StaffNav />
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              <Link to="/finance" className="hover:text-blue-600 transition-colors">Finance</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700">Admin Alerts</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Admin Alerts
              {openIssues > 0 && (
                <span className="px-2.5 py-0.5 bg-red-100 text-red-600 border border-red-200 text-sm font-bold rounded-full">
                  {openIssues} open
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1">Customer issue reports, booking exceptions and workflow routing</p>
          </div>
          <button onClick={loadIssues} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open Issues',     value: openIssues,                              icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50 border-red-100'    },
            { label: 'Resolved',        value: resolvedIssues,                          icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50 border-green-100'},
            { label: 'Total Issues',    value: issues.length,                           icon: Bell,          color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-100'  },
            { label: 'Active Workflows',value: routingRules.filter(r => r.active).length, icon: Zap,         color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100'},
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`bg-white border rounded-2xl p-4 shadow-sm ${bg}`}>
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
          {[
            { key: 'issues',  label: 'Customer Issues', icon: MessageSquare },
            { key: 'routing', label: 'Workflow Routing', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {key === 'issues' && openIssues > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${activeTab === key ? 'bg-white/25 text-white' : 'bg-red-100 text-red-600'}`}>
                  {openIssues}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Issues Tab */}
          {activeTab === 'issues' && (
            <motion.div key="issues" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Filters */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search issues..."
                    className="pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-900 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-200 w-48 shadow-sm" />
                </div>
                {['all', 'open', 'resolved'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all shadow-sm ${
                      filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
                    }`}>{f}</button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-400">Loading issues...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold">No issues found</p>
                  <p className="text-slate-400 text-sm mt-1">All customer issues are resolved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((issue, i) => {
                    const isOpen = issue.status === 'open'
                    return (
                      <motion.div key={issue.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                          isOpen ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-green-200'
                        }`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isOpen ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {(issue.customer_name || 'U').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-slate-900">{issue.customer_name || 'Unknown Customer'}</span>
                                  <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase ${
                                    isOpen ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
                                  }`}>{issue.status}</span>
                                  {issue.issue_type && (
                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium capitalize">
                                      {issue.issue_type}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{issue.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                                  {issue.customer_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>{issue.customer_email}</span>}
                                  {issue.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{issue.customer_phone}</span>}
                                  {issue.created_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{new Date(issue.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Resolution note if resolved */}
                            {issue.resolution_note && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold">Resolution: </span>{issue.resolution_note}
                                </div>
                              </div>
                            )}

                            {/* Resolve panel for open issues */}
                            {isOpen && (
                              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <p className="text-xs text-slate-600 font-semibold mb-2">Add resolution note & notify customer:</p>
                                <textarea
                                  value={resolutionNotes[issue.id] || ''}
                                  onChange={e => setResolutionNotes(prev => ({ ...prev, [issue.id]: e.target.value }))}
                                  placeholder="Describe the resolution..."
                                  rows={2}
                                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 resize-none mb-2"
                                />
                                <button
                                  onClick={() => handleMarkComplete(issue.id)}
                                  disabled={resolving === issue.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  {resolving === issue.id ? 'Sending...' : 'Mark Resolved & Notify Customer'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Routing Tab */}
          {activeTab === 'routing' && (
            <motion.div key="routing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-4">
                <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm leading-relaxed">
                  Workflow routing rules control how billing events and alerts are automatically directed to the right people.
                  VoyageAI evaluates each booking event against these rules in real-time.
                </p>
              </div>
              {routingRules.map((rule, i) => (
                <motion.div key={rule.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${rule.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-blue-600">{rule.id}</span>
                        {rule.triggeredToday > 0 && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 text-xs rounded-full">{rule.triggeredToday}× today</span>
                        )}
                      </div>
                      <h3 className="text-slate-900 font-semibold mb-1">{rule.name}</h3>
                      <p className="text-slate-500 text-xs mb-1"><span className="font-medium text-slate-700">When: </span>{rule.condition}</p>
                      <p className="text-slate-500 text-xs mb-2"><span className="font-medium text-slate-700">Route to: </span>{rule.route}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.channels.map(ch => (
                          <span key={ch} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600">{ch}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => toggleRule(rule.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all flex-shrink-0 shadow-sm ${
                        rule.active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                      {rule.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {rule.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}