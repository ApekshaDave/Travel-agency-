import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Bell, CheckCircle, AlertTriangle, ChevronRight, Zap,
  Clock, ArrowRight, Sparkles, Search, X,
  ToggleRight, ToggleLeft
} from 'lucide-react'
import { formatINR } from '../utils/billingEngine'
import toast from 'react-hot-toast'
import { useMemo } from 'react';

// ── Notification data ─────────────────────────────────────────────────────────
const ALL_NOTIFICATIONS = [
  {
    id: 'N001', type: 'billing', priority: 'high', read: false,
    title: 'New Invoice Generated', time: '2 min ago', timestamp: Date.now() - 120000,
    body: 'Invoice INV-2503-1005 for ₹33,426 generated for Arjun Kapoor (Nexus BPO). Payment pending.',
    icon: '🧾', action: { label: 'View Invoice', to: '/finance/invoices' },
    meta: { bookingRef: 'VAI-D2K5F8', amount: 33426 },
  },
  {
    id: 'N002', type: 'refund', priority: 'high', read: false,
    title: 'Refund Approval Required', time: '18 min ago', timestamp: Date.now() - 1080000,
    body: 'Refund request from Vikram Nair (₹4,760) needs finance approval. Cancellation 38 days before departure — full refund eligible.',
    icon: '↩️', action: { label: 'Review Request', to: '/finance/refunds' },
    meta: { bookingRef: 'VAI-C1D8F7', amount: 4760 },
  },
  {
    id: 'N003', type: 'corporate', priority: 'medium', read: false,
    title: 'TechCorp Monthly Statement Due', time: '1 hour ago', timestamp: Date.now() - 3600000,
    body: 'Monthly statement for TechCorp India (₹48,200) is ready to be generated and emailed to finance@techcorp.in.',
    icon: '🏢', action: { label: 'Generate Statement', to: '/finance/corporate' },
    meta: { account: 'TechCorp India', amount: 48200 },
  },
  {
    id: 'N004', type: 'alert', priority: 'high', read: false,
    title: 'Payment Gateway Error', time: '2 hours ago', timestamp: Date.now() - 7200000,
    body: 'Booking VAI-E9X3K7 payment failed after 3 retries. Stripe error: card_declined. Customer Vikram Nair notified.',
    icon: '⚠️', action: { label: 'View Case', to: '/agent' },
    meta: { bookingRef: 'VAI-E9X3K7', error: 'card_declined' },
  },
  {
    id: 'N005', type: 'booking', priority: 'low', read: true,
    title: 'High-Value Booking Confirmed', time: '3 hours ago', timestamp: Date.now() - 10800000,
    body: 'Business class BOM→LHR booking confirmed for Arjun Kapoor — ₹1,12,000. Corporate policy exception approved by manager.',
    icon: '✅', action: { label: 'View Booking', to: '/dashboard' },
    meta: { bookingRef: 'VAI-C5F2K8', amount: 112000 },
  },
  {
    id: 'N006', type: 'billing', priority: 'medium', read: true,
    title: 'Amadeus Commission Invoice', time: '1 day ago', timestamp: Date.now() - 86400000,
    body: 'GDS commission debit of ₹3,200 for Q1 2025 has been processed and logged in the ledger.',
    icon: '💳', action: { label: 'View Ledger', to: '/finance' },
    meta: { amount: 3200 },
  },
  {
    id: 'N007', type: 'corporate', priority: 'low', read: true,
    title: 'Nexus BPO Compliance Alert', time: '2 days ago', timestamp: Date.now() - 172800000,
    body: 'Nexus BPO policy compliance dropped to 88% this month. 2 bookings exceeded fare cap by ₹4,200 total.',
    icon: '📋', action: { label: 'View Account', to: '/finance/corporate' },
    meta: { account: 'Nexus BPO', compliance: 88 },
  },
  {
    id: 'N008', type: 'alert', priority: 'medium', read: true,
    title: 'Visa Risk Escalation Resolved', time: '3 days ago', timestamp: Date.now() - 259200000,
    body: 'Agent resolved UK transit visa issue for Priya Mehta. Customer rebooked via direct BOM→JFK route. Case ESC-002 closed.',
    icon: '🛂', action: { label: 'View Case', to: '/agent' },
    meta: { caseId: 'ESC-002' },
  },
]

// ── Workflow routing rules ────────────────────────────────────────────────────
const ROUTING_RULES = [
  {
    id: 'WF-001',
    name: 'High-Value Booking Alert',
    condition: 'Booking amount > ₹50,000',
    route: 'Finance Manager + Senior Agent',
    channels: ['Email', 'Dashboard'],
    active: true,
    triggeredToday: 3,
  },
  {
    id: 'WF-002',
    name: 'Refund Auto-Approval',
    condition: 'Refund < ₹5,000 AND >30 days before departure',
    route: 'Auto-process (no human needed)',
    channels: ['Email to customer', 'Ledger update'],
    active: true,
    triggeredToday: 1,
  },
  {
    id: 'WF-003',
    name: 'Corporate Policy Breach',
    condition: 'Corporate booking exceeds fare cap',
    route: 'Corporate manager + Travel desk',
    channels: ['Email', 'Dashboard', 'Slack'],
    active: true,
    triggeredToday: 2,
  },
  {
    id: 'WF-004',
    name: 'Payment Failure Escalation',
    condition: 'Payment fails after 2 retries',
    route: 'Agent dashboard + Customer support',
    channels: ['Dashboard alert', 'SMS to customer'],
    active: true,
    triggeredToday: 1,
  },
  {
    id: 'WF-005',
    name: 'Monthly Statement Generation',
    condition: '1st of every month at 08:00 AM',
    route: 'Finance team + Corporate clients',
    channels: ['Auto-email to all clients', 'Finance dashboard'],
    active: true,
    triggeredToday: 0,
  },
  {
    id: 'WF-006',
    name: 'International Visa Warning',
    condition: 'Booking involves transit through restricted countries',
    route: 'Agent desk + Customer warning',
    channels: ['In-chat warning', 'Agent escalation'],
    active: true,
    triggeredToday: 2,
  },
]

const TYPE_CONFIG = {
  billing: { color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20', dot: 'bg-gold-400' },
  refund: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  corporate: { color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', dot: 'bg-violet-400' },
  alert: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  booking: { color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20', dot: 'bg-sage-400' },
}

const PRIORITY_STYLES = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-muted',
}

function NotificationItem({ notif, onRead, onDismiss }) {
  const typeConfig = TYPE_CONFIG[notif.type] || TYPE_CONFIG.booking

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      className={`flex gap-4 p-4 rounded-2xl border transition-all group ${
        !notif.read
          ? 'glass border-border bg-white/2'
          : 'border-transparent hover:border-border/40'
      }`}
    >
      {/* Unread indicator */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
        {!notif.read && (
          <span className={`w-2 h-2 rounded-full ${typeConfig.dot} animate-pulse`} />
        )}
        <span className={`text-xl ${notif.read ? 'opacity-50' : ''}`}>{notif.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${notif.read ? 'text-white/60' : 'text-white'}`}>
              {notif.title}
            </span>
            <span className={`text-xs font-medium ${PRIORITY_STYLES[notif.priority]}`}>
              {notif.priority}
            </span>
            <span className={`px-1.5 py-0.5 text-xs rounded-full border capitalize ${typeConfig.bg} ${typeConfig.color}`}>
              {notif.type}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-muted text-xs">{notif.time}</span>
            <button
              onClick={() => onDismiss(notif.id)}
              className="p-1 text-muted/0 group-hover:text-muted hover:text-white transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-muted text-xs leading-relaxed mb-2">{notif.body}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {notif.meta && Object.entries(notif.meta).map(([k, v]) => (
            <span key={k} className="font-mono text-xs text-muted/60 bg-surface px-2 py-0.5 rounded-md border border-border/40">
              {k}: {typeof v === 'number' && k === 'amount' ? formatINR(v) : v}
            </span>
          ))}
          {notif.action && (
            <Link
              to={notif.action.to}
              onClick={() => onRead(notif.id)}
              className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium ml-auto"
            >
              {notif.action.label} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS)
  const [routingRules, setRoutingRules] = useState(ROUTING_RULES)
  const [activeTab, setActiveTab] = useState('notifications')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const filterPriority = 'all'

  const unreadCount = notifications.filter(n => !n.read).length

  const totalToday = useMemo(() => {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  return notifications.filter(
    n => n.timestamp >= startOfToday.getTime()
  ).length
  }, [notifications])

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notification dismissed')
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const toggleRule = (id) => {
    setRoutingRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
    toast.success('Routing rule updated')
  }

  const filtered = notifications.filter(n => {
    if (filterType !== 'all' && n.type !== filterType) return false
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) &&
        !n.body.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  
  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Link to="/finance" className="hover:text-gold-400 transition-colors">Finance</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Admin Notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-red-500/15 text-red-400 border border-red-500/20 text-sm font-bold rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-muted text-sm mt-0.5">Admin alerts, billing events, and workflow routing</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2.5 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all">
                <CheckCircle className="w-4 h-4" /> Mark All Read
              </button>
            )}
          </div>
        </motion.div>

        {/* Quick stats */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
  {[
    { label: 'Unread', value: unreadCount, color: 'text-red-400', icon: Bell },
    { label: 'High Priority', value: notifications.filter(n => n.priority === 'high' && !n.read).length, color: 'text-amber-400', icon: AlertTriangle },
    { label: 'Total Today', value: totalToday, color: 'text-gold-400', icon: Clock },
  
    { label: 'Active Workflows', value: routingRules.filter(r => r.active).length, color: 'text-sage-400', icon: Zap },
  ].map(({ label, value, color, icon: Icon }) => (
    <div key={label} className="glass border border-border rounded-xl p-4">
      <Icon className={`w-4 h-4 ${color} mb-2`} />
      <div className={`font-bold text-xl ${color}`}>{value}</div>
      <div className="text-muted text-xs mt-0.5">{label}</div>
    </div>
  ))}
</div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-border">
          {[
            { key: 'notifications', label: 'All Notifications', icon: Bell },
            { key: 'routing', label: 'Workflow Routing', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === key ? 'border-gold-400 text-gold-400' : 'border-transparent text-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === 'notifications' && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <motion.div key="notifs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Filter row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search notifications..." className="ai-input pl-8 pr-3 py-2 rounded-lg text-xs w-48" />
                </div>
                {['all', 'billing', 'refund', 'corporate', 'alert', 'booking'].map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      filterType === t ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20' : 'text-muted hover:text-white'
                    }`}
                  >{t}</button>
                ))}
              </div>

              {/* Notifications list */}
              <div className="space-y-2">
                <AnimatePresence>
                  {filtered.map(n => (
                    <NotificationItem key={n.id} notif={n} onRead={markRead} onDismiss={dismiss} />
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="text-center py-14">
                    <Bell className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                    <p className="text-muted">No notifications match your filter.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Routing rules tab */}
          {activeTab === 'routing' && (
            <motion.div key="routing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-sky-400/8 border border-sky-400/20 rounded-2xl mb-4">
                <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-sky-200/70 text-xs leading-relaxed">
                  Workflow routing rules control how billing events and alerts are automatically directed to the right people and systems.
                  VoyageAI evaluates each booking event against these rules in real-time.
                </p>
              </div>

              {routingRules.map((rule, i) => (
                <motion.div key={rule.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass border rounded-2xl p-5 transition-all ${rule.active ? 'border-border' : 'border-border/40 opacity-60'}`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gold-400/70">{rule.id}</span>
                        {rule.triggeredToday > 0 && (
                          <span className="px-2 py-0.5 bg-sage-400/10 text-sage-400 border border-sage-400/20 text-xs rounded-full">
                            {rule.triggeredToday}× today
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold mb-1">{rule.name}</h3>
                      <div className="text-muted text-xs mb-2">
                        <span className="text-white/60">When: </span>{rule.condition}
                      </div>
                      <div className="text-muted text-xs mb-2">
                        <span className="text-white/60">Route to: </span>{rule.route}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.channels.map(ch => (
                          <span key={ch} className="px-2 py-0.5 bg-surface border border-border rounded-full text-xs text-muted">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${
                        rule.active
                          ? 'bg-sage-400/15 text-sage-400 border-sage-400/20'
                          : 'bg-surface text-muted border-border'
                      }`}
                    >
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
