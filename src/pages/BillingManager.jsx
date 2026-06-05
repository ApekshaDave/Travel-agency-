import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Zap, CheckCircle, Clock, AlertTriangle, ChevronRight,
  Plus, Settings, ToggleLeft, ToggleRight, ArrowRight,
  Bell, Mail, RefreshCw, Play
} from 'lucide-react'

import toast from 'react-hot-toast'

// ── Automation rules ──────────────────────────────────────────────────────────
const DEFAULT_RULES = [
  {
    id: 'rule-1',
    name: 'Invoice on Booking Confirmed',
    trigger: 'booking_confirmed',
    triggerLabel: 'Booking Confirmed',
    triggerIcon: '✈️',
    actions: ['Generate invoice', 'Email to customer', 'Update ledger', 'Notify finance team'],
    active: true,
    priority: 1,
    lastRan: '2 min ago',
    runCount: 847,
    category: 'billing',
  },
  {
    id: 'rule-2',
    name: 'Add-on Purchase Billing',
    trigger: 'addon_purchased',
    triggerLabel: 'Add-on Purchased',
    triggerIcon: '🎒',
    actions: ['Append to existing invoice', 'Send updated invoice', 'Log transaction'],
    active: true,
    priority: 2,
    lastRan: '18 min ago',
    runCount: 312,
    category: 'billing',
  },
  {
    id: 'rule-3',
    name: 'Refund Processing Workflow',
    trigger: 'refund_processed',
    triggerLabel: 'Refund Processed',
    triggerIcon: '↩️',
    actions: ['Calculate refund amount', 'Initiate bank transfer', 'Generate credit note', 'Notify customer & finance'],
    active: true,
    priority: 1,
    lastRan: '1 hour ago',
    runCount: 56,
    category: 'refund',
  },
  {
    id: 'rule-4',
    name: 'Flight Change Fee Billing',
    trigger: 'flight_changed',
    triggerLabel: 'Flight Changed',
    triggerIcon: '🔄',
    actions: ['Charge change fee (₹2,000)', 'Bill fare difference if applicable', 'Generate amendment invoice'],
    active: true,
    priority: 2,
    lastRan: '3 hours ago',
    runCount: 124,
    category: 'billing',
  },
  {
    id: 'rule-5',
    name: 'Corporate Monthly Statement',
    trigger: 'corporate_monthly',
    triggerLabel: 'Monthly (1st of month)',
    triggerIcon: '🏢',
    actions: ['Compile all corporate bookings', 'Generate consolidated invoice', 'Email to finance contact', 'Update corporate ledger'],
    active: true,
    priority: 1,
    lastRan: '1 Mar 2025',
    runCount: 18,
    category: 'corporate',
  },
  {
    id: 'rule-6',
    name: 'Cancellation Penalty Alert',
    trigger: 'booking_cancelled',
    triggerLabel: 'Booking Cancelled',
    triggerIcon: '❌',
    actions: ['Calculate penalty per policy', 'Notify customer of refund amount', 'Generate cancellation invoice', 'Alert finance team'],
    active: false,
    priority: 2,
    lastRan: 'Never',
    runCount: 0,
    category: 'refund',
  },
  {
    id: 'rule-7',
    name: 'Low Balance Finance Alert',
    trigger: 'balance_threshold',
    triggerLabel: 'Balance < ₹10,000',
    triggerIcon: '⚠️',
    actions: ['Alert finance manager via email', 'Pause non-critical workflows', 'Create priority task'],
    active: true,
    priority: 1,
    lastRan: 'Never triggered',
    runCount: 0,
    category: 'alert',
  },
]

// ── Recent workflow runs ──────────────────────────────────────────────────────
const RECENT_RUNS = [
  { id: 'run-001', rule: 'Invoice on Booking Confirmed', status: 'success', time: '2 min ago', booking: 'VAI-A7X2K1', duration: '0.3s' },
  { id: 'run-002', rule: 'Add-on Purchase Billing', status: 'success', time: '18 min ago', booking: 'VAI-B3M9P4', duration: '0.2s' },
  { id: 'run-003', rule: 'Invoice on Booking Confirmed', status: 'success', time: '45 min ago', booking: 'VAI-D2K5F8', duration: '0.4s' },
  { id: 'run-004', rule: 'Refund Processing Workflow', status: 'success', time: '1 hr ago', booking: 'VAI-C1D8F7', duration: '1.2s' },
  { id: 'run-005', rule: 'Flight Change Fee Billing', status: 'failed', time: '2 hrs ago', booking: 'VAI-E9X3K7', duration: '0.8s', error: 'Payment gateway timeout' },
  { id: 'run-006', rule: 'Invoice on Booking Confirmed', status: 'success', time: '3 hrs ago', booking: 'VAI-F1M2P4', duration: '0.3s' },
]

// ── Notification routing config ───────────────────────────────────────────────
const NOTIFICATION_CHANNELS = [
  {
    id: 'email_finance',
    name: 'Finance Team Email',
    type: 'email',
    icon: Mail,
    target: 'finance@voyageai.in',
    events: ['refund_processed', 'corporate_monthly', 'booking_cancelled'],
    active: true,
  },
  {
    id: 'email_admin',
    name: 'Admin Notifications',
    type: 'email',
    icon: Mail,
    target: 'admin@voyageai.in',
    events: ['booking_confirmed', 'flight_changed'],
    active: true,
  },
  {
    id: 'slack_ops',
    name: 'Slack #operations',
    type: 'slack',
    icon: Bell,
    target: '#operations',
    events: ['refund_processed', 'flight_changed', 'booking_cancelled'],
    active: false,
  },
  {
    id: 'webhook_erp',
    name: 'ERP Webhook',
    type: 'webhook',
    icon: Zap,
    target: 'https://erp.yourcompany.in/webhook',
    events: ['booking_confirmed', 'corporate_monthly'],
    active: false,
  },
]

const CATEGORY_COLORS = {
  billing: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
  refund: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  corporate: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  alert: 'text-red-400 bg-red-500/10 border-red-500/20',
}

function RuleCard({ rule, onToggle, onRun }) {
  const [expanded, setExpanded] = useState(false)
  const catStyle = CATEGORY_COLORS[rule.category] || CATEGORY_COLORS.billing

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass border rounded-2xl overflow-hidden transition-all duration-200 ${
        rule.active ? 'border-border hover:border-border/80' : 'border-border/40 opacity-60'
      }`}
    >
      <div className="p-4 flex items-center gap-4 flex-wrap">
        {/* Trigger icon */}
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0 text-xl">
          {rule.triggerIcon}
        </div>

        {/* Rule info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-white font-semibold text-sm">{rule.name}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full border capitalize ${catStyle}`}>
              {rule.category}
            </span>
            {rule.priority === 1 && (
              <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs rounded-full">
                High priority
              </span>
            )}
          </div>
          <div className="text-muted text-xs">
            Trigger: <span className="text-white/70">{rule.triggerLabel}</span>
            <span className="mx-1.5">·</span>
            {rule.actions.length} actions
            <span className="mx-1.5">·</span>
            Ran {rule.runCount} times
            <span className="mx-1.5">·</span>
            Last: {rule.lastRan}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onRun(rule)}
            className="p-1.5 text-muted hover:text-sage-400 transition-colors"
            title="Run now"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted hover:text-white transition-colors"
            title="View actions"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(rule.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              rule.active
                ? 'bg-sage-400/15 text-sage-400 border-sage-400/20'
                : 'bg-surface text-muted border-border'
            }`}
          >
            {rule.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            {rule.active ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-4">
              <p className="text-muted text-xs uppercase tracking-wider mb-2">Actions (in order)</p>
              <div className="space-y-1.5">
                {rule.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-gold-400/15 border border-gold-400/20 text-gold-400 text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white/80 text-sm">{action}</span>
                    <ArrowRight className="w-3 h-3 text-border ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function BillingManager() {
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [channels, setChannels] = useState(NOTIFICATION_CHANNELS)
  const [activeTab, setActiveTab] = useState('rules')

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
    toast.success('Rule updated')
  }

  const toggleChannel = (id) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
    toast.success('Channel updated')
  }

  const runRule = (rule) => {
    toast.success(`Running "${rule.name}"...`)
    setTimeout(() => toast.success(`✓ "${rule.name}" completed successfully`), 1500)
  }

  const activeRules = rules.filter(r => r.active).length
  const totalRuns = rules.reduce((s, r) => s + r.runCount, 0)

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <Link to="/finance" className="hover:text-gold-400 transition-colors">Finance</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Billing Manager</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Billing Automation</h1>
            <p className="text-muted text-sm mt-0.5">Configure triggers, workflows and notification routing</p>
          </div>
          <button
            onClick={() => toast('Custom rule builder coming in Phase 4!')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm text-sm"
          >
            <Plus className="w-4 h-4" /> New Rule
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Active Rules', value: activeRules, icon: ToggleRight, color: 'text-sage-400' },
            { label: 'Total Rules', value: rules.length, icon: Settings, color: 'text-gold-400' },
            { label: 'Total Runs', value: totalRuns.toLocaleString(), icon: Zap, color: 'text-sky-400' },
            { label: 'Failed (24h)', value: RECENT_RUNS.filter(r => r.status === 'failed').length, icon: AlertTriangle, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass border border-border rounded-xl p-4">
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-muted text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-border">
          {[
            { key: 'rules', label: 'Automation Rules', icon: Zap },
            { key: 'runs', label: 'Recent Runs', icon: Clock },
            { key: 'notifications', label: 'Notification Channels', icon: Bell },
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
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Rules tab */}
          {activeTab === 'rules' && (
            <motion.div key="rules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {rules.map((rule, i) => (
                <motion.div key={rule.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <RuleCard rule={rule} onToggle={toggleRule} onRun={runRule} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Recent runs tab */}
          {activeTab === 'runs' && (
            <motion.div key="runs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border/60">
                <h3 className="text-white font-semibold text-sm">Recent Workflow Executions</h3>
              </div>
              <div className="divide-y divide-border/30">
                {RECENT_RUNS.map((run, i) => (
                  <motion.div key={run.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3.5 flex-wrap"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      run.status === 'success'
                        ? 'bg-sage-400/15 border border-sage-400/20'
                        : 'bg-red-500/15 border border-red-500/20'
                    }`}>
                      {run.status === 'success'
                        ? <CheckCircle className="w-3.5 h-3.5 text-sage-400" />
                        : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{run.rule}</div>
                      <div className="text-muted text-xs font-mono">{run.booking} · {run.time} · {run.duration}</div>
                      {run.error && <div className="text-red-400 text-xs mt-0.5">⚠ {run.error}</div>}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full border font-medium capitalize ${
                      run.status === 'success'
                        ? 'bg-sage-400/10 text-sage-400 border-sage-400/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {run.status}
                    </span>
                    {run.status === 'failed' && (
                      <button
                        onClick={() => { toast.success('Retrying...'); setTimeout(() => toast.success('Retry successful!'), 1500) }}
                        className="flex items-center gap-1 px-2.5 py-1 glass border border-border rounded-lg text-xs text-muted hover:text-gold-400 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="p-4 bg-sky-400/8 border border-sky-400/20 rounded-2xl flex items-start gap-3 mb-4">
                <Bell className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-sky-200/70 text-sm leading-relaxed">
                  Notification channels control where billing events and alerts are sent. Toggle to activate. 
                  Connect Slack or webhook to integrate with your internal tools.
                </p>
              </div>

              {channels.map((channel, i) => {
                const Icon = channel.icon
                return (
                  <motion.div key={channel.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`glass border rounded-2xl p-5 transition-all ${
                      channel.active ? 'border-border' : 'border-border/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{channel.name}</div>
                          <div className="text-muted text-xs font-mono mt-0.5">{channel.target}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          channel.active
                            ? 'bg-sage-400/15 text-sage-400 border-sage-400/20'
                            : 'bg-surface text-muted border-border'
                        }`}
                      >
                        {channel.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {channel.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <p className="text-muted text-xs mb-2">Subscribed events:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {channel.events.map(ev => (
                          <span key={ev} className="px-2 py-0.5 bg-surface border border-border rounded-full text-xs text-muted font-mono">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
