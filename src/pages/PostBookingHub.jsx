import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle, Plane, Package, RefreshCw, MessageCircle, Train, Bus, Car, Map,
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
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-600',
    link: '/post-booking/checkin',
  },
  {
    id: 'addons',
    icon: Package,
    title: 'Add-ons & Upgrades',
    desc: 'Seat upgrade, meals, extra baggage',
    badge: 'Available',
    badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600',
    link: '/post-booking/addons',
  },
  {
    id: 'change',
    icon: RefreshCw,
    title: 'Change Flight',
    desc: 'Reschedule to a different date or time',
    badge: '₹2,000 fee',
    badgeColor: 'bg-sky-50 text-sky-600 border-sky-200',
    iconBg: 'bg-sky-50 text-sky-600',
    link: '/post-booking/change',
  },
  {
    id: 'cancel',
    icon: RotateCcw,
    title: 'Cancel & Refund',
    desc: 'Check refund eligibility and initiate',
    badge: 'Partial refund',
    badgeColor: 'bg-orange-50 text-orange-600 border-orange-200',
    iconBg: 'bg-orange-50 text-orange-600',
    link: "/post-booking/cancel",
  },
  {
    id: 'report_issue',
    icon: AlertCircle,
    title: 'Report Booking Issue',
    desc: 'File a formal request regarding baggage, seats, or meals',
    badge: 'Agent Alert',
    badgeColor: 'bg-red-50 text-red-500 border-red-200',
    iconBg: 'bg-red-50 text-red-500',
    link: '#',
  },
  {
    id: 'support',
    icon: Headphones,
    title: 'AI Support',
    desc: 'Ask anything about your booking',
    badge: 'Instant',
    badgeColor: 'bg-violet-50 text-violet-600 border-violet-200',
    iconBg: 'bg-violet-50 text-violet-600',
    link: '/chat',
  },
  {
    id: 'ticket',
    icon: Download,
    title: 'Download Ticket',
    desc: 'Save e-ticket as PDF to your device',
    badge: 'PDF + Mobile',
    badgeColor: 'bg-slate-100 text-slate-500 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-500',
    link: '#',
  },
]

const TIMELINE = [
  { icon: CheckCircle, label: 'Booking Confirmed', time: '5 Feb, 10:23 AM', done: true },
  { icon: Bell, label: 'Web Check-in Opens (48h before)', time: '13 Mar, 09:30 AM', done: false, active: true },
  { icon: QrCode, label: 'Boarding Pass Generated', time: 'After check-in', done: false },
  { icon: Plane, label: 'Flight Departs', time: '15 Mar, 09:30 AM', done: false },
  { icon: Star, label: 'Rate Your Experience', time: 'After landing', done: false },
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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <FileWarning className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">File Booking Issue</h2>
            <p className="text-xs text-slate-500">An agent will respond within 2–4 hours</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Issue Category</label>
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {['Seat Preference', 'Meal Choice', 'Baggage Allowance', 'Payment Discrepancy', 'Name Correction', 'Other'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Details</label>
            <textarea
              required value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
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

  const checkinSegment = ACTIVE_TRIP.segments.find(s => s.checkinOpen)

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mb-3">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">My Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Manage Trip</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-mono text-xs font-bold">{ACTIVE_TRIP.id}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-1">Manage Your Trip</h1>
          <p className="text-slate-500">Review itinerary, modify segments, and manage digital check-ins.</p>
        </motion.div>

        {/* ── AI Prompt Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 hover:border-slate-300 transition-all shadow-sm"
        >
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input
            placeholder="Ask — 'Can I change my seat?' or 'How do I get a refund?'"
            className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 outline-none"
            onKeyDown={e => e.key === 'Enter' && navigate(`/chat?prompt=${e.target.value}`)}
          />
          <kbd className="hidden sm:block px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-400 font-mono">ENTER</kbd>
          <ArrowRight className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 group-focus-within:translate-x-1 transition-all" />
        </motion.div>

        {/* ── Trip Summary Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm"
        >
          <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-500" /> {ACTIVE_TRIP.name}
          </h2>

          <div className="space-y-3">
            {ACTIVE_TRIP.segments.map((seg, idx) => {
              const Icon = seg.type === 'flight' ? Plane : seg.type === 'train' ? Train : seg.type === 'bus' ? Bus : Car
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}
                  >
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-900 font-bold text-sm uppercase">{seg.type}</span>
                      <span className="text-slate-400 text-[10px] font-mono">{seg.date} · {seg.depart}</span>
                    </div>
                    <p className="text-slate-600 text-xs truncate">
                      {seg.from} → {seg.to} · {seg.airline || seg.name || seg.provider || seg.vehicle}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight block mb-1">Confirmed</span>
                    {seg.pnr && (
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-500">
                        PNR: {seg.pnr}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Check-in alert */}
          {ACTIVE_TRIP.segments.some(s => s.checkinOpen) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-5 flex items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-emerald-700 font-semibold text-sm">Web Check-in is Open!</p>
                  <p className="text-emerald-600/70 text-xs">Closes at {checkinSegment?.checkinCloses} on day of departure</p>
                </div>
              </div>
              <Link
                to="/post-booking/checkin"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Check In Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* ── Services grid ── */}
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">What do you need?</h2>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Featured Check-in when open */}
              {checkinSegment && (
                <Link
                  to="/post-booking/checkin"
                  className="bg-white border-2 border-emerald-300 rounded-2xl p-6 group transition-all duration-300 relative overflow-hidden hover:shadow-md hover:border-emerald-400"
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-100 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xl group-hover:text-blue-600 transition-colors">Web Check-in is Open</h3>
                        <p className="text-slate-500 text-sm mt-0.5">Select your seat and get your mobile boarding pass</p>
                        <p className="text-emerald-600 text-xs font-mono mt-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Closes at {checkinSegment.checkinCloses} — {checkinSegment.checkinCloses === '07:30' ? '6 hours from now' : 'Limited time left'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full font-bold">Priority Action</span>
                      <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {SERVICES.filter(s => s.id !== 'checkin' || !checkinSegment).map(({ id, icon: Icon, title, desc, badge, badgeColor, iconBg, link }, i) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={id === 'report_issue' ? '#' : link}
                      onClick={id === 'report_issue' ? () => setShowIssueModal(true) : undefined}
                      className="block bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-5 group transition-all duration-200 h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase tracking-wider ${badgeColor}`}>
                          {badge}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{desc}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-blue-500 transition-colors">
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

            {/* ── AI Assistant strip ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl p-5 border border-blue-100 flex items-center justify-between flex-wrap gap-4"
              style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 60%, #EEF2FF 100%)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">Have a question about your trip?</p>
                  <p className="text-slate-500 text-xs">Ask VoyageAI — flight status, baggage rules, transit info, anything.</p>
                </div>
              </div>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-4 py-2.5 text-white font-bold text-sm rounded-xl shadow-sm transition-all hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                <MessageCircle className="w-4 h-4" /> Ask AI
              </Link>
            </motion.div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Trip Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 mb-5 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Trip Timeline
              </h3>
              <div className="space-y-0">
                {TIMELINE.map(({ icon: Icon, label, time, done, active }, i) => (
                  <div key={label} className="flex gap-3 relative">
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute left-4 top-8 w-px h-full ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 z-10 border ${
                      done
                        ? 'bg-emerald-50 border-emerald-200'
                        : active
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-slate-50 border-slate-200'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="pb-5 flex-1">
                      <p className={`text-sm font-medium ${done ? 'text-slate-400' : active ? 'text-slate-900' : 'text-slate-400'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mobile Boarding Pass */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-500" /> Mobile Boarding Pass
              </h3>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Complete web check-in first. Your boarding pass QR will appear here.
              </p>
              <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                {checkinSegment ? (
                  <div className="text-center">
                    <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">Check in to unlock</p>
                  </div>
                ) : (
                  <QrCode className="w-16 h-16 text-blue-400" />
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