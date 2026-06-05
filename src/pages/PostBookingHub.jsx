
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle, Plane, Package, RefreshCw, MessageCircle,
  Download, Clock, ChevronRight, Sparkles,
  QrCode, Smartphone, ArrowRight, RotateCcw, Headphones, Bell, Star, Zap
} from 'lucide-react'

const ACTIVE_BOOKING = {
  id: 'VAI-A7X2K1',
  pnr: 'AIXTV8',
  airline: 'Air India',
  code: 'AI 619',
  logo: '🔴',
  from: 'DEL', fromCity: 'Delhi', fromAirport: 'Indira Gandhi International',
  to: 'BOM', toCity: 'Mumbai', toAirport: 'Chhatrapati Shivaji Maharaj International',
  depart: '09:30', arrive: '11:50',
  date: 'Monday, 15 March 2025',
  duration: '2h 20m',
  terminal: 'T2', gate: 'B14',
  seat: '14C', seatType: 'Window',
  class: 'Economy',
  status: 'confirmed',
  checkinOpen: true,
  checkinCloses: '07:30',
  baggageAllowance: '15kg cabin + 15kg check-in',
  price: 5800,
}

const SERVICES = [
  {
    id: 'checkin',
    icon: CheckCircle,
    title: 'Web Check-in',
    desc: 'Get your boarding pass in 30 seconds',
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

export default function PostBookingHub() {
  

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/dashboard" className="hover:text-gold-400 transition-colors">My Trips</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{ACTIVE_BOOKING.id}</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Manage Your Trip</h1>
          <p className="text-muted">Everything you need before, during, and after your flight.</p>
        </motion.div>

        {/* Flight Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-6 mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{ACTIVE_BOOKING.logo}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{ACTIVE_BOOKING.airline}</span>
                  <span className="font-mono text-muted text-sm">{ACTIVE_BOOKING.code}</span>
                  <span className="px-2 py-0.5 bg-sage-400/15 text-sage-400 border border-sage-400/20 text-xs rounded-full font-medium">
                    Confirmed
                  </span>
                </div>
                <p className="text-muted text-sm">{ACTIVE_BOOKING.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="font-mono text-xs text-muted px-3 py-1.5 glass border border-border rounded-lg">
                PNR: {ACTIVE_BOOKING.pnr}
              </span>
              <span className="font-mono text-xs text-muted px-3 py-1.5 glass border border-border rounded-lg">
                {ACTIVE_BOOKING.id}
              </span>
            </div>
          </div>

          {/* Route visual */}
          <div className="flex items-center gap-6 mb-5">
            <div>
              <div className="font-bold text-4xl text-white">{ACTIVE_BOOKING.depart}</div>
              <div className="font-mono text-gold-400 font-semibold text-lg">{ACTIVE_BOOKING.from}</div>
              <div className="text-muted text-xs mt-1 max-w-28">{ACTIVE_BOOKING.fromAirport}</div>
              <div className="text-muted text-xs mt-0.5">Terminal {ACTIVE_BOOKING.terminal}</div>
            </div>

            <div className="flex-1 flex flex-col items-center px-4">
              <div className="text-muted text-xs mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {ACTIVE_BOOKING.duration} · Direct
              </div>
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-gradient-to-r from-gold-400/40 to-border" />
                <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-gold-400" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-gold-400/40" />
              </div>
              <div className="text-muted text-xs mt-2">Non-stop</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-4xl text-white">{ACTIVE_BOOKING.arrive}</div>
              <div className="font-mono text-gold-400 font-semibold text-lg">{ACTIVE_BOOKING.to}</div>
              <div className="text-muted text-xs mt-1 max-w-28 text-right">{ACTIVE_BOOKING.toAirport}</div>
            </div>
          </div>

          {/* Seat & baggage info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-border/40">
            {[
              { label: 'Seat', value: `${ACTIVE_BOOKING.seat} (${ACTIVE_BOOKING.seatType})`, icon: '💺' },
              { label: 'Class', value: ACTIVE_BOOKING.class, icon: '🎫' },
              { label: 'Baggage', value: ACTIVE_BOOKING.baggageAllowance, icon: '🧳' },
              { label: 'Gate', value: ACTIVE_BOOKING.gate, icon: '🚪' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="text-center sm:text-left">
                <div className="text-muted text-xs uppercase tracking-wider mb-1">{icon} {label}</div>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

          {/* Check-in alert */}
          {ACTIVE_BOOKING.checkinOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center justify-between gap-3 p-4 bg-sage-400/10 border border-sage-400/25 rounded-2xl flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sage-400/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-sage-400" />
                </div>
                <div>
                  <p className="text-sage-300 font-semibold text-sm">Web Check-in is Open!</p>
                  <p className="text-sage-300/60 text-xs">Closes at {ACTIVE_BOOKING.checkinCloses} on day of departure</p>
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
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {SERVICES.map(({ id, icon: Icon, title, desc, badge, badgeColor, color, glow, link }, i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -3 }}
                >
                  <Link
                    to={link}
                    className={`block glass border border-border ${glow} rounded-2xl p-5 group transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-surface flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${badgeColor}`}>
                        {badge}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-gold-300 transition-colors">{title}</h3>
                    <p className="text-muted text-xs leading-relaxed">{desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted group-hover:text-white transition-colors">
                      Get started <ChevronRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              ))}
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 z-10 ${
                      done ? 'bg-sage-400/20 border border-sage-400/30' :
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
                {ACTIVE_BOOKING.checkinOpen ? (
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
    </div>
  )
}
