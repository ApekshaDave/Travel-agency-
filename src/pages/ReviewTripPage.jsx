import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle, Edit3, ArrowRight, User, Mail, Phone,
  Plane, Train, Bus, Car, Building2, Map, Sparkles,
  ChevronRight, Shield, AlertTriangle, Loader2, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { submitTripToAgent } from '../utils/tripStore'

const SEGMENT_TYPES = {
  flight:   { icon: Plane,     label: 'Flight',    color: 'bg-blue-50 text-blue-600 border-blue-200' },
  train:    { icon: Train,     label: 'Train',     color: 'bg-sky-50 text-sky-600 border-sky-200' },
  bus:      { icon: Bus,       label: 'Bus',       color: 'bg-violet-50 text-violet-600 border-violet-200' },
  roadways: { icon: Car,       label: 'Roadways',  color: 'bg-orange-50 text-orange-600 border-orange-200' },
  hotel:    { icon: Building2, label: 'Hotel',     color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
}

export default function ReviewTripPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trip] = useState(() => {
    const stored = localStorage.getItem('voyageai_active_trip')
    return stored ? JSON.parse(stored) : null
  })
  const [passengers] = useState(() => {
    const stored = localStorage.getItem('voyageai_passenger_details')
    return stored ? JSON.parse(stored) : []
  })
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  // Redirect only if there is no trip — runs once on mount
  useEffect(() => {
    if (!localStorage.getItem('voyageai_active_trip')) {
      toast.error('No trip found. Please build your trip first.')
      navigate('/trip-builder')
    }
  }, [navigate])

  const grandTotal = trip?.segments?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || trip?.totalCost || 0
  const tripName   = trip?.tripName || trip?.name || 'Your Trip'

  const handleConfirmBooking = async () => {
    if (!trip) { toast.error('No trip details found.'); return }
    setLoading(true)
    try {
      const id = 'VAI-' + Math.random().toString(36).substring(2, 7).toUpperCase()
      setBookingId(id)

      await new Promise(resolve => setTimeout(resolve, 1800)) // simulate API

      const fullTripDetails = {
        ...trip,
        passengers,
        bookingId: id,
        status: 'pending_agent_review',
        bookedAt: new Date().toISOString(),
      }

      submitTripToAgent(fullTripDetails, user)
      setConfirmed(true)
      toast.success('Booking sent to your travel agent!')
      localStorage.removeItem('voyageai_active_trip')
      localStorage.removeItem('voyageai_passenger_details')
    } catch (err) {
      console.error(err)
      toast.error('Failed to confirm booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Booking Sent!</h1>
          <p className="text-slate-500 mb-6">
            Your trip has been submitted. A VoyageAI travel agent will review and contact you shortly.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Booking ID</span>
              <span className="font-mono font-bold text-blue-600">{bookingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Trip</span>
              <span className="font-semibold text-slate-900">{tripName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-slate-900">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="flex items-center justify-center gap-2 w-full py-3 text-white font-bold rounded-xl shadow-sm"
              style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
            >
              Go to My Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/post-booking"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Manage This Trip
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Loading/empty guard ─────────────────────────────────────────────────────
  if (!trip) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading trip details...</p>
        </div>
      </div>
    )
  }

  // ── Main review screen ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <Link to="/trip-builder" className="hover:text-blue-600 transition-colors">Trip Builder</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Review & Confirm</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-1">Review Your Trip</h1>
          <p className="text-slate-500">Please review all details before confirming your booking.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">

          {/* ── Left column ── */}
          <div className="space-y-5">

            {/* Passenger details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Passenger Details
                </h2>
                <Link
                  to="/passenger-details"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Link>
              </div>

              {passengers.length === 0 ? (
                <div className="px-5 py-4 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">No passenger details added</p>
                    <p className="text-xs text-amber-700/80 mt-0.5">You can still confirm — your agent will follow up.</p>
                  </div>
                  <Link
                    to="/passenger-details"
                    className="flex-shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Add
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {passengers.map((p, i) => (
                    <div key={i} className="px-5 py-4">
                      <p className="font-semibold text-slate-900 text-sm mb-2">Passenger {i + 1}</p>
                      <div className="space-y-1">
                        {p.name  && <p className="text-xs text-slate-600 flex items-center gap-2"><User className="w-3 h-3 text-slate-400" /> {p.name}</p>}
                        {p.email && <p className="text-xs text-slate-600 flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400" /> {p.email}</p>}
                        {p.phone && <p className="text-xs text-slate-600 flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400" /> {p.phone}</p>}
                        {p.aadhar && <p className="text-xs text-slate-500 flex items-center gap-2"><span className="text-slate-400 text-[10px] font-mono">AADHAR</span> {p.aadhar}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Itinerary segments */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Map className="w-4 h-4 text-blue-500" /> {tripName}
                  </h2>
                  {trip.duration && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {trip.duration}
                      {trip.desc && ` · ${trip.desc}`}
                    </p>
                  )}
                </div>
                <Link
                  to="/trip-builder"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {trip.segments?.map((seg, i) => {
                  const st = SEGMENT_TYPES[seg.type] || { icon: Map, label: seg.type, color: 'bg-slate-50 text-slate-500 border-slate-200' }
                  const Icon = st.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${st.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-semibold text-sm">
                          {seg.from}{seg.to ? ` → ${seg.to}` : ''}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                          {seg.detail} · {seg.date}
                        </p>
                      </div>
                      <span className="text-blue-600 font-bold text-sm font-mono flex-shrink-0">
                        ₹{Number(seg.price || 0).toLocaleString()}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">

            {/* Cost breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Cost Breakdown</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                {trip.segments?.map((seg, i) => {
                  const st = SEGMENT_TYPES[seg.type] || { label: seg.type }
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-500">{st.label} · {seg.from}{seg.to ? `→${seg.to}` : ''}</span>
                      <span className="text-slate-700 font-medium font-mono">₹{Number(seg.price || 0).toLocaleString()}</span>
                    </div>
                  )
                })}
                {trip.estimatedFoodCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Food & Activities (est.)</span>
                    <span className="text-slate-700 font-medium font-mono">₹{trip.estimatedFoodCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div
                className="px-5 py-4 border-t border-slate-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
              >
                <div>
                  <p className="text-blue-700 font-bold text-sm">Grand Total</p>
                  {trip.duration && <p className="text-blue-500 text-xs">{trip.duration} · all-inclusive</p>}
                </div>
                <span className="text-blue-700 font-bold text-xl font-mono">₹{grandTotal.toLocaleString()}</span>
              </div>
            </motion.div>

            {/* Policy note */}
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
              className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl"
            >
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-500 text-xs leading-relaxed">
                By confirming, your trip details will be sent to a VoyageAI travel agent who will finalise all bookings.
                Cancellation policies vary per segment.{' '}
                <a href="#" className="text-blue-500 hover:underline">Terms apply.</a>
              </p>
            </motion.div>

            {/* Confirm button */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <motion.button
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full py-4 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-3 text-base transition-all"
                style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finalising booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Send to Agent
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Your booking will be reviewed by a dedicated VoyageAI agent.
              </p>
            </motion.div>

            {/* AI refine link */}
            <Link
              to="/chat"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Refine details with AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}