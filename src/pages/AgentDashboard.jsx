import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, Clock, MessageCircle, Phone,
  Mail, Plane, Search, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import StaffNav from '../components/layout/StaffNav'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'


export default function AgentDashboard() {
  const { user, token } = useAuth()
  const [trips, setTrips] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [resolutionNote, setResolutionNote] = useState('')
  const [resolving, setResolving] = useState(false)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // Stable fetch function for the manual refresh button
  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/trips`, { headers }).then(r => r.json()),
      fetch(`${API}/api/booking_issues`, { headers }).then(r => r.json()),
    ])
      .then(([tripsData, issuesData]) => {
        setTrips(Array.isArray(tripsData) ? tripsData : [])
        setIssues(Array.isArray(issuesData) ? issuesData : [])
      })
      .catch(err => { console.error(err); toast.error('Failed to load data') })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Initial load — async IIFE keeps setState out of the effect body directly
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [tripsRes, issuesRes] = await Promise.all([
          fetch(`${API}/api/trips`, { headers }),
          fetch(`${API}/api/booking_issues`, { headers }),
        ])
        const tripsData  = await tripsRes.json()
        const issuesData = await issuesRes.json()
        if (!cancelled) {
          setTrips(Array.isArray(tripsData) ? tripsData : [])
          setIssues(Array.isArray(issuesData) ? issuesData : [])
        }
      } catch (err) {
        if (!cancelled) { console.error(err); toast.error('Failed to load data') }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleResolve = async (issueId, note) => {
    setResolving(true)
    try {
      await fetch(`${API}/api/booking_issues?id=${issueId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'resolved', resolution_note: note || 'Resolved by agent' }),
      })
      toast.success('Issue marked as resolved')
      setSelectedIssue(null)
      load()
    } catch {
      toast.error('Failed to resolve issue')
    } finally {
      setResolving(false)
    }
  }

  // Upcoming trips assigned to this agent (status = accepted)
  const myTrips = trips.filter(t => t.assigned_agent_email === user?.email && t.status === 'accepted')
  const pendingTrips = trips.filter(t => t.status === 'pending')

  const filteredIssues = issues.filter(issue => {
    if (filter !== 'all' && issue.status !== filter) return false
    if (search && !issue.customer_name?.toLowerCase().includes(search.toLowerCase()) &&
        !issue.issue_type?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openIssues   = issues.filter(i => i.status === 'open').length
  const resolvedToday = issues.filter(i => i.status === 'resolved').length

  const stats = [
    { label: 'Open Issues',     value: openIssues,           icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50 border-red-100'   },
    { label: 'My Trips',        value: myTrips.length,        icon: Plane,         color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-100'  },
    { label: 'Pending Trips',   value: pendingTrips.length,   icon: Clock,         color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100'},
    { label: 'Resolved Today',  value: resolvedToday,         icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50 border-green-100'},
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-36 pb-16 px-4">
      <StaffNav />
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
              <AlertTriangle className="w-3.5 h-3.5" /> Agent Desk
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Agent Desk</h1>
            <p className="text-slate-500 mt-1">Manage customer issues, trip requests and support cases</p>
          </div>
          <button onClick={load} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`bg-white border rounded-2xl p-5 shadow-sm ${bg}`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-500 text-xs mt-1">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── My Accepted Trips ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" /> My Upcoming Trips
                </h2>
                <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">{myTrips.length}</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {myTrips.length === 0 ? (
                  <div className="text-center py-10">
                    <Plane className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No accepted trips yet</p>
                  </div>
                ) : myTrips.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(t.customer_name || 'U').charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 text-sm truncate">{t.trip_data?.name || 'Unnamed Trip'}</div>
                        <div className="text-slate-500 text-xs truncate">{t.customer_name} · {t.customer_email}</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{t.trip_data?.duration || 'N/A'}
                          </span>
                          {t.trip_data?.totalCost && (
                            <span className="text-xs font-semibold text-emerald-600">
                              ₹{t.trip_data.totalCost.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {t.trip_data?.segments?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {t.trip_data.segments.slice(0, 2).map((seg, si) => (
                              <div key={si} className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span>{seg.type === 'flight' ? '✈️' : seg.type === 'hotel' ? '🏨' : '🚗'}</span>
                                <span>{seg.from || seg.name || seg.type}</span>
                                {seg.to && <span>→ {seg.to}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Customer Issues ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-red-500" /> Customer Issues
                  {openIssues > 0 && (
                    <span className="text-xs font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">{openIssues} open</span>
                  )}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search issues..."
                      className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-200 w-44" />
                  </div>
                  {['all', 'open', 'resolved'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Loading issues...</p>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No issues found</p>
                    <p className="text-slate-400 text-sm mt-1">All clear!</p>
                  </div>
                ) : filteredIssues.map((issue, i) => {
                  const isOpen = issue.status === 'open'
                  return (
                    <motion.div key={issue.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isOpen ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {(issue.customer_name || 'U').charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-semibold text-slate-900 text-sm">{issue.customer_name || 'Unknown'}</span>
                              <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase ${
                                isOpen ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
                              }`}>{issue.status}</span>
                              {issue.issue_type && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium">
                                  {issue.issue_type}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mt-1">{issue.description}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 flex-wrap">
                              {issue.customer_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{issue.customer_email}</span>}
                              {issue.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{issue.customer_phone}</span>}
                              {issue.created_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(issue.created_at).toLocaleDateString('en-IN')}</span>}
                            </div>
                            {issue.resolution_note && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                                ✓ {issue.resolution_note}
                              </div>
                            )}
                          </div>
                        </div>

                        {isOpen && (
                          <button
                            onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
                            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-bold hover:bg-blue-700 transition-all"
                          >
                            Resolve
                          </button>
                        )}
                      </div>

                      {/* Resolve panel */}
                      <AnimatePresence>
                        {selectedIssue?.id === issue.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-3">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                              <p className="text-xs text-blue-700 font-semibold mb-2">Resolution Note</p>
                              <textarea
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.target.value)}
                                placeholder="Describe how this issue was resolved..."
                                rows={2}
                                className="w-full text-xs bg-white border border-blue-200 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-300 resize-none mb-2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleResolve(issue.id, resolutionNote)}
                                  disabled={resolving}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  {resolving ? 'Saving...' : 'Mark Resolved'}
                                </button>
                                <button onClick={() => setSelectedIssue(null)}
                                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg font-medium hover:bg-slate-50">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}