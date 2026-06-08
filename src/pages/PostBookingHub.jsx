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
    badgeColor: 'bg-green-50 text-green-700 border-green-200',
    color: 'text-green-600 bg-green-50',
    link: '/post-booking/checkin',
  },
  {
    id: 'addons',
    icon: Package,
    title: 'Add-ons & Upgrades',
    desc: 'Seat upgrade, meals, extra baggage',
    badge: 'Available',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    color: 'text-amber-600 bg-amber-50',
    link: '/post-booking/addons',
  },
  {
    id: 'change',
    icon: RefreshCw,
    title: 'Change Flight',
    desc: 'Reschedule to a different date or time',
    badge: '₹2,000 fee',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    color: 'text-blue-600 bg-blue-50',
    link: '/post-booking/change',
  },
  {
    id: 'cancel',
    icon: RotateCcw,
    title: 'Cancel & Refund',
    desc: 'Check refund eligibility and initiate',
    badge: 'Partial refund',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    color: 'text-orange-600 bg-orange-50',
    link: '/post-booking/cancel',
  },
  {
    id: 'report_issue',
    icon: AlertCircle,
    title: 'Report Booking Issue',
    desc: 'File a formal request regarding baggage, seats, or meals',
    badge: 'Agent Alert',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    color: 'text-red-600 bg-red-50',
    link: '#',
  },
  {
    id: 'support',
    icon: Headphones,
    title: 'AI Support',
    desc: 'Ask anything about your booking',
    badge: 'Instant',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    color: 'text-purple-600 bg-purple-50',
    link: '/chat',
  },
  {
    id: 'ticket',
    icon: Download,
    title: 'Download Ticket',
    desc: 'Save e-ticket as PDF to your device',
    badge: 'PDF + Mobile',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    color: 'text-slate-600 bg-slate-50',
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
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95 }} 
        animate={{ scale: 1 }} 
        className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <FileWarning className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">File Booking Issue</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="issueCategorySelect" 
              className="text-[10px] uppercase text-slate-400 font-bold block mb-1.5 tracking-wider"
            >
              Issue Category
            </label>
            <select
              id="issueCategorySelect"
              name="issueCategory"
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none focus:border-blue-500 transition-colors"
            >
              {['Seat Preference', 'Meal Choice', 'Baggage Allowance', 'Payment Discrepancy', 'Name Correction', 'Other'].map(opt => (
                <option key={opt} value={opt} className="bg-white">{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label 
              htmlFor="issueDescriptionTextArea" 
              className="text-[10px] uppercase text-slate-400 font-bold block mb-1.5 tracking-wider"
            >
              Details
            </label>
            <textarea
              id="issueDescriptionTextArea"
              name="issueDescription"
              required 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={4} 
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none focus:border-blue-500 resize-none transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50">
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
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Soft bright gradient accent layers mimicking Homepage background configuration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-5xl mx-auto relative z-10">

        {/* Breadcrumb Navigation / Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mb-3">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors font-medium">My Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600">Manage Trip</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-bold">{ACTIVE_TRIP.id}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-1 tracking-tight">
            Manage Your Trip
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">Review itinerary details, customize flight add-ons, or request processing updates.</p>
        </motion.div>

        {/* Quick Help AI Prompt Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center gap-3 p-4 bg-white border border-blue-100 rounded-2xl shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all hover:border-blue-200 group"
        >
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 animate-pulse" />
          <label htmlFor="aiQuickQuestionInput" className="sr-only">Ask a quick question about your booking</label>
          <input
            id="aiQuickQuestionInput"
            name="aiQuickQuestion"
            placeholder="Quick Question? Try: 'Can I change my seat?' or 'Check my refund value'"
            className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 outline-none"
            onKeyDown={e => e.key === 'Enter' && navigate(`/chat?prompt=${e.target.value}`)}
          />
          <kbd className="hidden sm:block px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-400 font-mono shadow-sm">ENTER</kbd>
          <ArrowRight className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 group-focus-within:translate-x-0.5 transition-all" />
        </motion.div>

        {/* Current Trip Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 shadow-sm"
        >
          <h2 className="text-slate-900 font-display font-bold text-xl mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" /> {ACTIVE_TRIP.name}
          </h2>

          <div className="space-y-4">
            {ACTIVE_TRIP.segments.map((seg, idx) => {
              const Icon = seg.type === 'flight' ? Plane : seg.type === 'train' ? Train : seg.type === 'bus' ? Bus : Car
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/60 border border-slate-100/80 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/70 flex items-center justify-center flex-shrink-0 border border-blue-100/50">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-900 font-bold text-xs uppercase tracking-wider">{seg.type}</span>
                      <span className="text-slate-400 text-xs font-mono">{seg.date} · {seg.depart}</span>
                    </div>
                    <p className="text-slate-600 text-xs truncate font-medium">
                      {seg.from} → {seg.to} · {seg.airline || seg.name || seg.provider || seg.vehicle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 border border-green-100 font-bold uppercase tracking-wider rounded-md inline-block mb-1">Confirmed</span>
                    {seg.pnr && <div className="text-[10px] font-mono text-slate-400">PNR: <span className="font-bold text-slate-700">{seg.pnr}</span></div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Web Check-in Priority Reminder Banner */}
          {ACTIVE_TRIP.segments.some(s => s.checkinOpen) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex items-center justify-between gap-4 p-4 bg-green-50/60 border border-green-100 rounded-2xl flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-green-900 font-bold text-sm">Web Check-in is Active!</p>
                  <p className="text-green-600 text-xs font-medium">Closes at {checkinSegment?.checkinCloses} on day of departure.</p>
                </div>
              </div>
              <Link
                to="/post-booking/checkin"
                className="flex items-center gap-2 px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-700/10 hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                Check In Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Main Interface Content Split */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* Left Block: Interactive Action Cards */}
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Available Trip Services</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              
              {/* Conditional Big Highlight Card for Pending Check-in */}
              {checkinSegment && (
                <Link
                  to="/post-booking/checkin"
                  className="border border-green-200 bg-green-50/20 hover:bg-green-50/40 rounded-2xl p-6 group transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">Digital Web Check-in</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Confirm travel safety profiles, pick preferred seating arrangements, and get your pass.</p>
                        <p className="text-green-700 text-[11px] font-bold mt-2.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Closes strictly at {checkinSegment.checkinCloses}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 text-[10px] rounded-full font-bold uppercase tracking-wider">Priority</span>
                      <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid of Auxiliary Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                {SERVICES.filter(s => s.id !== 'checkin' || !checkinSegment).map(({ id, icon: Icon, title, desc, badge, badgeColor, color, link }, i) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={id === 'report_issue' ? '#' : link}
                      onClick={id === 'report_issue' ? () => setShowIssueModal(true) : undefined}
                      className="block bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-2xl p-5 group transition-all duration-200 h-full hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} border border-slate-50 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] rounded-full border font-bold uppercase tracking-wider ${badgeColor}`}>
                          {badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{desc}</p>

                      {/* Extra Subtext Context labels to mirror HomePage detail layouts */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors font-medium">
                        <span>
                          {id === 'addons' ? 'Up to 2h before departure' :
                            id === 'change' ? 'Standard rescheduling rates' :
                              id === 'cancel' ? 'Est. Refund: ₹4,800' :
                                id === 'report_issue' ? 'Agent response time < 4h' : 'Available 24/7'}
                        </span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Smart Embedded Support Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-blue-100 rounded-2xl p-5 bg-gradient-to-r from-blue-50/30 to-transparent flex items-center justify-between flex-wrap gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm">Need personalized assistance?</p>
                  <p className="text-slate-500 text-xs">Chat instantly with VoyageAI to fetch layover alerts, terminal updates, or food requests.</p>
                </div>
              </div>
              <Link
                to="/chat"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Ask AI
              </Link>
            </motion.div>
          </div>

          {/* Right Block: Sidebar Components (Timeline & Digital Pass) */}
          <div className="space-y-4">
            
            {/* Timeline Tracking Block */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 pb-2">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Trip Progression
              </h3>
              <div className="space-y-0">
                {TIMELINE.map(({ icon: Icon, label, time, done, active }, i) => (
                  <div key={label} className="flex gap-3 relative">
                    {/* Progression Connecting bar lines */}
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute left-3.5 top-7 w-px h-full ${done ? 'bg-green-200' : 'bg-slate-100'}`} />
                    )}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 z-10 border ${done ? 'bg-green-50 border-green-200' :
                      active ? 'bg-amber-50 border-amber-200 ring-4 ring-amber-500/5' :
                        'bg-slate-50 border-slate-100'
                      }`}>
                      <Icon className={`w-3 h-3 ${done ? 'text-green-600' : active ? 'text-amber-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="pb-5 flex-1">
                      <p className={`text-xs font-bold ${done ? 'text-slate-600 font-semibold' : active ? 'text-slate-900' : 'text-slate-400'}`}>
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live QR Status Block */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Mobile Boarding Pass
              </h3>
              <p className="text-slate-400 text-[11px] mb-4 leading-relaxed font-medium">
                Once web check-in is complete, scan this token directly at security checkpoints.
              </p>
              <div className="w-full aspect-square rounded-2xl bg-slate-50/60 border border-slate-100/70 flex items-center justify-center p-4">
                {checkinSegment ? (
                  <div className="text-center p-4">
                    <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Locked Until Check-in</p>
                  </div>
                ) : (
                  <QrCode className="w-full h-full text-slate-800" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Issues Report Overlay Trigger */}
      <AnimatePresence>
        {showIssueModal && <IssueReportModal onClose={() => setShowIssueModal(false)} user={user} />}
      </AnimatePresence>

    </div>
  )
}