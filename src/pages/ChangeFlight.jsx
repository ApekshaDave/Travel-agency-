import React from 'react'
import { useState, useEffect } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  RefreshCw, ChevronRight, ArrowRight, Clock, Plane,
  CheckCircle, Calendar,
  ChevronLeft, Sparkles, Info, Zap
} from 'lucide-react'


const ORIGINAL_FLIGHT = {
  airline: 'Air India', code: 'AI 619', logo: '🔴',
  from: 'DEL', to: 'BOM',
  depart: '09:30', arrive: '11:50',
  date: 'Mon, 15 Mar 2025', duration: '2h 20m',
  class: 'Economy', seat: '14C',
}

const ALTERNATIVE_FLIGHTS = [
  {
    id: 'alt1', airline: 'Air India', code: 'AI 665', logo: '🔴',
    depart: '06:00', arrive: '08:10', duration: '2h 10m', stops: 0,
    changeFee: 2000, fareDiff: -1200, date: 'Mon, 15 Mar 2025',
    seats: 6, tag: 'Earlier · Cheaper',
  },
  {
    id: 'alt2', airline: 'Air India', code: 'AI 811', logo: '🔴',
    depart: '14:30', arrive: '16:45', duration: '2h 15m', stops: 0,
    changeFee: 2000, fareDiff: 0, date: 'Mon, 15 Mar 2025',
    seats: 12, tag: 'Afternoon',
  },
  {
    id: 'alt3', airline: 'Air India', code: 'AI 619', logo: '🔴',
    depart: '09:30', arrive: '11:50', duration: '2h 20m', stops: 0,
    changeFee: 2000, fareDiff: 800, date: 'Tue, 16 Mar 2025',
    seats: 9, tag: 'Next Day',
  },
  {
    id: 'alt4', airline: 'Air India', code: 'AI 671', logo: '🔴',
    depart: '19:45', arrive: '22:05', duration: '2h 20m', stops: 0,
    changeFee: 2000, fareDiff: -400, date: 'Mon, 15 Mar 2025',
    seats: 3, tag: 'Evening',
  },
]

export default function ChangeFlight() {
  const [step, setStep] = useState(0) // 0=reasons, 1=alternatives, 2=confirm, 3=done
  const [reason, setReason] = useState('')
  const [selectedDate, setSelectedDate] = useState('2025-03-15')
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [aiTip, setAiTip] = useState('')

useEffect(() => {
  getAIRecommendation('Give a concise travel tip...')
    .then(setAiTip).catch(() => {})
}, [])

  const REASONS = [
    { id: 'meeting', label: 'Meeting rescheduled', icon: '📅' },
    { id: 'personal', label: 'Personal emergency', icon: '🏠' },
    { id: 'earlier', label: 'Want an earlier flight', icon: '⏰' },
    { id: 'later', label: 'Want a later flight', icon: '🌙' },
    { id: 'diff_day', label: 'Travelling on different day', icon: '📆' },
    { id: 'other', label: 'Other reason', icon: '✏️' },
  ]

  const totalCost = selectedFlight
    ? 2000 + (selectedFlight.fareDiff > 0 ? selectedFlight.fareDiff : 0)
    : 0

  const handleConfirm = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setStep(3)
    }, 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {aiTip && (
  <div className="flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
    <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
    <p className="text-gold-200/80 text-sm">{aiTip}</p>
  </div>
)}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/post-booking" className="hover:text-gold-400 transition-colors">Manage Trip</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Change Flight</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Change Your Flight</h1>
          <p className="text-muted">AI 619 · Delhi → Mumbai · 15 March 2025</p>
        </motion.div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Reason', 'New Flight', 'Confirm'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-gold-400' : 'text-muted'}`}>
                <div className={`w-7 h-7 rounded-full text-xs font-bold border flex items-center justify-center ${
                  i < step ? 'bg-gold-400 border-gold-400 text-void' :
                  i === step ? 'bg-gold-400/15 border-gold-400' : 'bg-surface border-border'
                }`}>
                  {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="text-sm hidden sm:block">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-gold-400' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 0: Reason */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass gradient-border rounded-3xl p-7"
            >
              {/* Current flight */}
              <div className="flex items-center gap-3 p-4 bg-surface/60 border border-border rounded-2xl mb-6">
                <span className="text-2xl">{ORIGINAL_FLIGHT.logo}</span>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{ORIGINAL_FLIGHT.airline} · {ORIGINAL_FLIGHT.code}</div>
                  <div className="text-muted text-xs">{ORIGINAL_FLIGHT.date} · {ORIGINAL_FLIGHT.depart}–{ORIGINAL_FLIGHT.arrive}</div>
                </div>
                <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Changing
                </div>
              </div>

              {/* Fee notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 text-sm font-semibold">Change Fee: ₹2,000</p>
                  <p className="text-amber-200/60 text-xs mt-0.5">
                    Plus any fare difference if the new flight is more expensive. Refund applied if cheaper.
                  </p>
                </div>
              </div>

              <h2 className="font-display text-xl font-bold text-white mb-4">Why are you changing?</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {REASONS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setReason(id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      reason === id
                        ? 'border-gold-400/40 bg-gold-400/8 text-white'
                        : 'glass border-border text-muted hover:text-white hover:border-border/80'
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {reason === id && <CheckCircle className="w-3.5 h-3.5 text-gold-400 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* New travel date */}
              <div className="mb-6">
                <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Preferred New Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="ai-input w-full pl-9 pr-4 py-3 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => reason && setStep(1)}
                disabled={!reason}
                className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  reason
                    ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-void shadow-gold-sm'
                    : 'bg-surface text-muted cursor-not-allowed'
                }`}
              >
                Find Available Flights <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1: Alternatives */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 glass border border-gold-400/15 rounded-2xl">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <p className="text-gold-200/70 text-sm">
                  VoyageAI found {ALTERNATIVE_FLIGHTS.length} flights on your preferred date. Change fee of ₹2,000 applies to all.
                </p>
              </div>

              {ALTERNATIVE_FLIGHTS.map((flight, i) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelectedFlight(flight)}
                  className={`glass border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                    selectedFlight?.id === flight.id
                      ? 'border-gold-400/40 bg-gold-400/5'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 w-32">
                      <span className="text-xl">{flight.logo}</span>
                      <div>
                        <div className="text-white text-sm font-semibold">{flight.airline}</div>
                        <div className="text-muted text-xs font-mono">{flight.code}</div>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-3 min-w-40">
                      <div className="text-center">
                        <div className="text-white font-bold text-xl">{flight.depart}</div>
                        <div className="text-muted text-xs">DEL</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-muted text-xs mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {flight.duration}
                        </div>
                        <div className="w-full flex items-center gap-1">
                          <div className="flex-1 h-px bg-border" />
                          <Plane className="w-3 h-3 text-gold-400/50" />
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="text-muted text-xs mt-1">Direct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-xl">{flight.arrive}</div>
                        <div className="text-muted text-xs">BOM</div>
                      </div>
                    </div>

                    <div className="text-right ml-auto">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs px-2 py-0.5 glass border border-border rounded-full text-muted">{flight.tag}</span>
                      </div>
                      <div className="text-muted text-xs">{flight.date}</div>
                      <div className="mt-1">
                        <div className="text-white text-sm font-semibold">Change fee: ₹2,000</div>
                        {flight.fareDiff !== 0 && (
                          <div className={`text-xs font-medium ${flight.fareDiff > 0 ? 'text-amber-400' : 'text-sage-400'}`}>
                            {flight.fareDiff > 0 ? `+₹${flight.fareDiff} fare diff` : `₹${Math.abs(flight.fareDiff)} refund`}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedFlight?.id === flight.id && (
                      <div className="w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-void" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="px-5 py-3 glass border border-border rounded-xl text-muted text-sm flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => selectedFlight && setStep(2)}
                  disabled={!selectedFlight}
                  className={`flex-1 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    selectedFlight
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-void shadow-gold-sm'
                      : 'bg-surface text-muted cursor-not-allowed'
                  }`}
                >
                  Continue with {selectedFlight ? `${selectedFlight.code} ${selectedFlight.depart}` : 'selected flight'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Confirm */}
          {step === 2 && selectedFlight && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass gradient-border rounded-3xl p-7"
            >
              <h2 className="font-display text-2xl font-bold text-white mb-6">Confirm Change</h2>

              {/* Change comparison */}
              <div className="space-y-3 mb-6">
                <div className="p-4 bg-surface/60 border border-border rounded-2xl">
                  <p className="text-muted text-xs uppercase tracking-wider mb-2">Original Flight</p>
                  <div className="flex items-center gap-3">
                    <span>{ORIGINAL_FLIGHT.logo}</span>
                    <div>
                      <div className="text-white/60 text-sm font-medium line-through">{ORIGINAL_FLIGHT.code}</div>
                      <div className="text-muted text-xs">{ORIGINAL_FLIGHT.date} · {ORIGINAL_FLIGHT.depart}–{ORIGINAL_FLIGHT.arrive}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gold-400/15 border border-gold-400/20 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </div>
                </div>

                <div className="p-4 bg-gold-400/8 border border-gold-400/25 rounded-2xl">
                  <p className="text-gold-400/70 text-xs uppercase tracking-wider mb-2">New Flight</p>
                  <div className="flex items-center gap-3">
                    <span>{selectedFlight.logo}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{selectedFlight.code}</div>
                      <div className="text-muted text-xs">{selectedFlight.date} · {selectedFlight.depart}–{selectedFlight.arrive}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="p-4 glass border border-border rounded-xl mb-6 space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Change fee</span>
                  <span className="text-white">₹2,000</span>
                </div>
                {selectedFlight.fareDiff > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Fare difference</span>
                    <span className="text-amber-400">+₹{selectedFlight.fareDiff}</span>
                  </div>
                )}
                {selectedFlight.fareDiff < 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Fare refund</span>
                    <span className="text-sage-400">-₹{Math.abs(selectedFlight.fareDiff)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span className="text-white">Total to pay</span>
                  <span className="text-gold-400 text-lg">₹{totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-3 glass border border-border rounded-xl text-muted text-sm flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Zap className="w-4 h-4" /></motion.div> Processing...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Pay ₹{totalCost.toLocaleString()} & Confirm Change</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Done */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass gradient-border rounded-3xl p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-400 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-gold"
              >
                <CheckCircle className="w-10 h-10 text-void" />
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Flight Changed! ✈</h2>
              <p className="text-muted mb-2">
                Your booking is now on <span className="text-white font-semibold">{selectedFlight?.code} at {selectedFlight?.depart}</span>
              </p>
              <p className="text-muted text-sm mb-8">Updated e-ticket sent to your email. Web check-in opens 48h before departure.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/dashboard" className="px-5 py-3 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all">
                  My Trips
                </Link>
                <Link to="/post-booking" className="px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-sm flex items-center gap-2 shadow-gold-sm">
                  Manage Trip <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
