import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle, Plane, Package, RefreshCw, MessageCircle, Train, Bus, Car, Building2, Map,
  Download, Clock, ChevronRight, Sparkles, AlertCircle, FileWarning,
  QrCode, Smartphone, ArrowRight, RotateCcw, Headphones, Bell, Star, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'

const MOCK_ACTIVE_TRIP = {
  id: 'VAI-MULT-99',
  name: 'Golden Triangle & Beyond',
  status: 'confirmed',
  segments: [
    { type: 'flight', airline: 'Air India', code: 'AI 619', logo: '🔴', from: 'DEL', to: 'BOM', depart: '09:30', arrive: '11:50', date: '15 Mar', status: 'confirmed', pnr: 'AIXTV8', checkinOpen: true, checkinCloses: '07:30' },
    { type: 'train', name: 'Shatabdi Exp', code: '12001', from: 'BOM', to: 'PUN', depart: '14:30', arrive: '17:15', date: '16 Mar', status: 'confirmed' },
    { type: 'roadways', provider: 'Ola Cabs', vehicle: 'Sedan AC', from: 'Pune', to: 'Lonavala', depart: '09:00', date: '17 Mar', status: 'confirmed' }
  ]
}

const SERVICES = [
  {
    id: 'checkin',
    icon: CheckCircle,
    title: 'Digital Check-in',
    desc: 'Verify details and get your tickets/passes',
    badge: 'Open Now',
    badgeColor: 'bg-sage-400/15 text-sage-400 border-sage-400/20',
    color: 'text-sage-400',
    glow: 'hover:border-sage-400/30',
    link: '/post-booking/checkin',
  },
  {
    id: 'addons',
    icon: Package,
    title: 'Add-ons & Upgrades',
    desc: 'Seat upgrade, meals, extra baggage',
    badge: 'Available',
    badgeColor: 'bg-gold-400/15 text-gold-400 border-gold-400/20',
    color: 'text-gold-400',
    glow: 'hover:border-gold-400/30',
    link: '/post-booking/addons',
  },
  {
    id: 'change',
    icon: RefreshCw,
    title: 'Change Flight',
    desc: 'Reschedule to a different date or time',
    badge: '₹2,000 fee',
    badgeColor: 'bg-sky-400/15 text-sky-400 border-sky-400/20',
    color: 'text-sky-400',
    glow: 'hover:border-sky-400/30',
    link: '/post-booking/change',
  },
  {
    id: 'cancel',
    icon: RotateCcw,
    title: 'Cancel & Refund',
    desc: 'Check refund eligibility and initiate',
    badge: 'Partial refund',
    badgeColor: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
    color: 'text-amber-400',
    glow: 'hover:border-amber-400/30',
    link: '/post-booking/cancel',
  },
  {
    id: 'report_issue',
    icon: AlertCircle,
    title: 'Report Booking Issue',
    desc: 'File a formal request regarding baggage, seats, or meals',
    badge: 'Agent Alert',
    badgeColor: 'bg-red-400/15 text-red-400 border-red-400/20',
    color: 'text-red-400',
    glow: 'hover:border-red-400/30',
    link: '#',
  },
  {
    id: 'support',
    icon: Headphones,
    title: 'AI Support',
    desc: 'Ask anything about your booking',
    badge: 'Instant',
    badgeColor: 'bg-violet-400/15 text-violet-400 border-violet-400/20',
    color: 'text-violet-400',
    glow: 'hover:border-violet-400/30',
    link: '/chat',
  },
  {
    id: 'ticket',
    icon: Download,
    title: 'Download Ticket',
    desc: 'Save e-ticket as PDF to your device',
    badge: 'PDF + Mobile',
    badgeColor: 'bg-muted/20 text-muted border-muted/20',
    color: 'text-muted',
    glow: 'hover:border-border/80',
    link: '#',
  },
]

const TIMELINE = [
  { icon: CheckCircle, label: 'Booking Confirmed', time: '5 Feb, 10:23 AM', done: true, color: 'text-sage-400' },
  { icon: Bell, label: 'Web Check-in Opens (48h before)', time: '13 Mar, 09:30 AM', done: false, active: true, color: 'text-gold-400' },
  { icon: QrCode, label: 'Boarding Pass Generated', time: 'After check-in', done: false, color: 'text-sky-400' },
  { icon: Plane, label: 'Flight Departs', time: '15 Mar, 09:30 AM', done: false, color: 'text-white' },
  { icon: Star, label: 'Rate Your Experience', time: 'After landing', done: false, color: 'text-gold-400' },
]

function IssueReportModal({ onClose, user }) {
  const [issueType, setIssueType] = useState('Seat Preference')
  const [desc, setDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase.from('booking_issues').insert([{
        user_id: user?.id,
        trip_id: MOCK_ACTIVE_TRIP.id,
        issue_type: issueType,
        description: desc,
        customer_name: user?.name || 'Guest',
        customer_email: user?.email,
        customer_phone: user?.phone || 'N/A'
      }])

      if (error) throw error
      toast.success('Issue reported! An agent will contact you shortly.')
      onClose()
    } catch (err) {
      toast.error('Failed to send report: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass border border-red-500/20 rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <FileWarning className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">File Booking Issue</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase text-muted font-bold block mb-1.5">Issue Category</label>
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50"
            >
              {['Seat Preference', 'Meal Choice', 'Baggage Allowance', 'Payment Discrepancy', 'Name Correction', 'Other'].map(opt => (
                <option key={opt} value={opt} className="bg-void">{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-muted font-bold block mb-1.5">Details</label>
            <textarea
              required value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={4} className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 glass border border-border rounded-xl text-white text-sm font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send to Agents'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function PostBookingHub() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showIssueModal, setShowIssueModal] = useState(false)
  const ACTIVE_TRIP = MOCK_ACTIVE_TRIP

  // Find the first segment that has an open check-in
  const checkinSegment = ACTIVE_TRIP.segments.find(s => s.checkinOpen)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm mb-3">
            <Link to="/dashboard" className="hover:text-brand-primary transition-colors">My Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900">Manage Trip</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold-400 font-mono text-xs">{ACTIVE_TRIP.id}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-1">Manage Your Trip</h1>
          <p className="text-slate-600">Review itinerary, modify segments, and manage digital check-ins.</p>
        </motion.div>

        {/* AI Prompt Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center gap-3 p-4 glass border border-gold-400/20 rounded-2xl group focus-within:border-gold-400/50 transition-all hover:bg-gold-400/5"
        >
          <Sparkles className="w-5 h-5 text-gold-400 flex-shrink-0" />
          <input
            placeholder="Not sure? Ask — 'Can I change my seat?' or 'How do I get a refund?'"
            className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none"
            onKeyDown={e => e.key === 'Enter' && navigate(`/chat?prompt=${e.target.value}`)}
          />
          <kbd className="hidden sm:block px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-muted-foreground font-mono">ENTER</kbd>
          <ArrowRight className="w-4 h-4 text-muted group-focus-within:text-gold-400 group-focus-within:translate-x-1 transition-all" />
        </motion.div>

        {/* Trip Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-6 mb-8"
        >
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-gold-400" /> {ACTIVE_TRIP.name}
          </h2>

          <div className="space-y-4">
            {ACTIVE_TRIP.segments.map((seg, idx) => {
              const Icon = seg.type === 'flight' ? Plane : seg.type === 'train' ? Train : seg.type === 'bus' ? Bus : Car
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white/2 border border-border/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-sm uppercase">{seg.type}</span>
                      <span className="text-muted text-[10px] font-mono">{seg.date} · {seg.depart}</span>
                    </div>
                    <p className="text-white/80 text-xs truncate">
                      {seg.from} → {seg.to} · {seg.airline || seg.name || seg.provider || seg.vehicle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-sage-400 font-bold uppercase tracking-tighter block mb-1">Confirmed</span>
                    {seg.pnr && <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-muted">PNR: {seg.pnr}</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Check-in alert for active segments */}
          {ACTIVE_TRIP.segments.some(s => s.checkinOpen) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center justify-between gap-3 p-4 bg-sage-400/10 border border-sage-400/25 rounded-2xl flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sage-400/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-sage-400" />
                </div>
                <div>
                  <p className="text-sage-300 font-semibold text-sm">Web Check-in is Open!</p>
                  <p className="text-sage-300/60 text-xs">Closes at {checkinSegment?.checkinCloses} on day of departure</p>
                </div>
              </div>
              <Link
                to="/post-booking/checkin"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-400 text-void font-bold text-sm rounded-xl"
              >
                Check In Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* Services grid */}
          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-4">What do you need?</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Featured Check-in when open */}
              {checkinSegment && (
                <Link
                  to="/post-booking/checkin"
                  className="glass border border-sage-400/40 bg-sage-400/5 ring-1 ring-sage-400/20 rounded-2xl p-6 group transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-sage-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sage-400 text-void flex items-center justify-center shadow-lg shadow-sage-400/20">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xl group-hover:text-gold-300 transition-colors">Web Check-in is Open</h3>
                        <p className="text-muted text-sm mt-0.5">Select your seat and get your mobile boarding pass</p>
                        <p className="text-sage-400 text-xs font-mono mt-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
                          Closes at {checkinSegment.checkinCloses} — {checkinSegment.checkinCloses === '07:30' ? '6 hours from now' : 'Limited time left'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-sage-400/20 text-sage-400 border border-sage-400/20 text-xs rounded-full font-bold">Priority Action</span>
                      <ArrowRight className="w-5 h-5 text-sage-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {SERVICES.filter(s => s.id !== 'checkin' || !checkinSegment).map(({ id, icon: Icon, title, desc, badge, badgeColor, color, glow, link }, i) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={id === 'report_issue' ? '#' : link}
                      onClick={id === 'report_issue' ? () => setShowIssueModal(true) : undefined}
                      className={`block glass border border-border ${glow} rounded-2xl p-5 group transition-all duration-200 h-full`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase tracking-wider ${badgeColor}`}>
                          {badge}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gold-300 transition-colors">{title}</h3>
                      <p className="text-muted text-[11px] leading-relaxed line-clamp-2">{desc}</p>

                      {/* Context snippets */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-muted group-hover:text-white transition-colors">
                        <span className="font-mono">
                          {id === 'addons' ? 'Until 2h before departure' :
                            id === 'change' ? 'Fare diff. + ₹2,000' :
                              id === 'cancel' ? 'Refund Estimate: ₹4,800' :
                                id === 'report_issue' ? '2-4h Response Time' : 'Available 24/7'}
                        </span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Assistant strip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass border border-gold-400/20 rounded-2xl p-5 bg-gradient-to-r from-gold-400/5 to-transparent flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-400 rounded-xl flex items-center justify-center shadow-gold-sm">
                  <Sparkles className="w-5 h-5 text-void" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Have a question about your trip?</p>
                  <p className="text-muted text-xs">Ask VoyageAI — flight status, baggage rules, transit info, anything.</p>
                </div>
              </div>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm"
              >
                <MessageCircle className="w-4 h-4" /> Ask AI
              </Link>
            </motion.div>
          </div>

          {/* Sidebar: Timeline */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="glass border border-border rounded-2xl p-5"
            >
              <h3 className="font-semibold text-white mb-5 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" /> Trip Timeline
              </h3>
              <div className="space-y-0">
                {TIMELINE.map(({ icon: Icon, label, time, done, active }, i) => (
                  <div key={label} className="flex gap-3 relative">
                    {/* Connector line */}
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute left-4 top-8 w-px h-full ${done ? 'bg-sage-400/40' : 'bg-border/40'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 z-10 ${done ? 'bg-sage-400/20 border border-sage-400/30' :
                      active ? 'bg-gold-400/15 border border-gold-400/30' :
                        'bg-surface border border-border'
                      }`}>
                      <Icon className={`w-3.5 h-3.5 ${done ? 'text-sage-400' : active ? 'text-gold-400' : 'text-muted'}`} />
                    </div>
                    <div className="pb-5 flex-1">
                      <p className={`text-sm font-medium ${done ? 'text-white/60' : active ? 'text-white' : 'text-muted'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-muted/60 mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick QR */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass border border-border rounded-2xl p-5"
            >
              <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" /> Mobile Boarding Pass
              </h3>
              <p className="text-muted text-xs mb-4 leading-relaxed">
                Complete web check-in first. Your boarding pass QR will appear here.
              </p>
              <div className="w-full aspect-square rounded-xl bg-surface/60 border border-border flex items-center justify-center">
                {checkinSegment ? (
                  <div className="text-center">
                    <QrCode className="w-10 h-10 text-muted/30 mx-auto mb-2" />
                    <p className="text-muted text-xs">Check in to unlock</p>
                  </div>
                ) : (
                  <QrCode className="w-16 h-16 text-gold-400" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showIssueModal && <IssueReportModal onClose={() => setShowIssueModal(false)} user={user} />}
      </AnimatePresence>

    </div>
  )
}
