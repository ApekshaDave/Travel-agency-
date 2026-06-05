import React from 'react'
import { useState, useEffect } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle, Plane, ChevronRight, ArrowRight,
  Download, Smartphone, QrCode, ShieldCheck, AlertTriangle,
  ChevronLeft, Sparkles, MapPin, Star
} from 'lucide-react'
import StepProgress from '../components/common/StepProgress'
import StickyActionBar from '../components/common/StickyActionBar'

// ── Seat map data ────────────────────────────────────────────────────────────
const ROWS = 30
const COLS = ['A','B','C','','D','E','F']
const OCCUPIED = new Set([
  '1A','1B','1C','1D','1E','1F',
  '2A','2C','2D','2F',
  '3B','3D','3E',
  '5A','5B','5C','5D','5E','5F',
  '7A','7C','7D','7F',
  '9B','9E',
  '10A','10B','10C','10D','10E','10F',
  '12D','12E','12F',
  '14A','14B','14D','14E',
  '16C','16D',
  '18A','18B','18C',
  '20D','20E','20F',
  '22A','22C','22D',
  '24B','24E','24F',
  '26A','26B','26C','26D','26E','26F',
  '28A','28C','28D','28F',
])
const EXIT_ROWS = [12, 20]
const EXTRA_LEGROOM = [13, 21]

function getSeatClass(row) {
  if (row <= 3) return 'premium'
  if (EXTRA_LEGROOM.includes(row)) return 'extra'
  return 'standard'
}

function getSeatPrice(row, col) {
  if (row <= 3) return 800
  if (EXTRA_LEGROOM.includes(row)) return 500
  if (col === 'A' || col === 'F') return 300
  return 0
}

const SEAT_COLORS = {
  occupied: 'bg-border/40 border-border cursor-not-allowed',
  selected: 'bg-gradient-to-br from-gold-500 to-gold-400 border-gold-400 shadow-gold-sm cursor-pointer scale-105',
  premium: 'bg-violet-500/20 border-violet-500/30 hover:bg-violet-500/35 cursor-pointer',
  extra: 'bg-sky-500/20 border-sky-500/30 hover:bg-sky-500/35 cursor-pointer',
  standard: 'bg-surface border-border/60 hover:bg-subtle/60 hover:border-border cursor-pointer',
}

// ── Boarding Pass Component ──────────────────────────────────────────────────

function BoardingPass({ booking, seat }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3 }}
      className="relative overflow-hidden rounded-3xl"
      style={{ background: 'linear-gradient(135deg, #161F2E 0%, #0D1421 100%)', border: '1px solid rgba(232,180,41,0.3)' }}
    >
      {/* Top gold stripe */}
      <div className="h-1.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-400 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-void" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm">VoyageAI</div>
              <div className="text-muted text-xs font-mono">BOARDING PASS</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted text-xs">STATUS</div>
            <div className="text-sage-400 font-bold text-sm flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> CHECKED IN
            </div>
          </div>
        </div>

        {/* Passenger */}
        <div className="mb-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-1">Passenger</div>
          <div className="font-display font-bold text-white text-2xl">RAJESH KUMAR</div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 mb-5">
          <div>
            <div className="font-mono font-bold text-4xl text-white">{booking.from}</div>
            <div className="text-muted text-xs">{booking.fromCity}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-muted text-xs mb-1">{booking.duration}</div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-400/40" />
              <Plane className="w-4 h-4 text-gold-400" />
              <div className="flex-1 h-px bg-gradient-to-r from-gold-400/40 to-transparent" />
            </div>
            <div className="text-muted text-xs mt-1">Non-stop</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-4xl text-white">{booking.to}</div>
            <div className="text-muted text-xs">{booking.toCity}</div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-4 gap-3 mb-5 pb-5 border-b border-dashed border-border">
          {[
            { label: 'Date', value: '15 MAR 2025' },
            { label: 'Departs', value: booking.depart },
            { label: 'Seat', value: seat || booking.seat },
            { label: 'Class', value: 'ECONOMY' },
            { label: 'Gate', value: booking.gate },
            { label: 'Terminal', value: booking.terminal },
            { label: 'PNR', value: booking.pnr },
            { label: 'Seq No.', value: '042' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-muted text-xs uppercase tracking-wider">{label}</div>
              <div className="text-white font-mono font-bold text-sm mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        {/* Barcode area */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-muted text-xs mb-2">Scan at security & gate</div>
            {/* Fake barcode */}
            <div className="flex items-end gap-px h-10">
              {Array.from({ length: 60 }, (_, i) => (
                <div
                  key={i}
                  className="bg-white flex-1"
                  style={{ height: `${30 + Math.sin(i * 0.7) * 20 + (i % 7) * 3}%` }}
                />
              ))}
            </div>
            <div className="font-mono text-xs text-muted/60 mt-1 tracking-widest">AIXTV8 AI619 14C 15MAR</div>
          </div>
          <div className="text-right">
            <div className="text-muted text-xs mb-2">QR Code</div>
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-void" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gold stripe */}
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />
    </motion.div>
  )
}

const BOOKING = {
  from: 'DEL', fromCity: 'Delhi',
  to: 'BOM', toCity: 'Mumbai',
  depart: '09:30', arrive: '11:50',
  date: '15 Mar 2025', duration: '2h 20m',
  gate: 'B14', terminal: 'T2',
  pnr: 'AIXTV8', seat: '14C',
}

// ── Main CheckIn Page ────────────────────────────────────────────────────────
export default function CheckInPage() {
  const [step, setStep] = useState(0) // 0=verify, 1=seatmap, 2=boarding pass
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [filter, setFilter] = useState('all') // all | window | aisle | extra

  const [aiTip, setAiTip] = useState('')

useEffect(() => {
  getAIRecommendation('Give a concise travel tip...')
    .then(setAiTip).catch(() => {})
}, [])

  const selectSeat = (seatId) => {
    if (OCCUPIED.has(seatId)) return
    setSelectedSeat(selectedSeat === seatId ? null : seatId)
  }

  const seatPrice = selectedSeat
    ? getSeatPrice(parseInt(selectedSeat), selectedSeat.replace(/\d+/, ''))
    : 0

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {aiTip && (
  <div className="flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
    <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
    <p className="text-gold-200/80 text-sm">{aiTip}</p>
  </div>
)}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/dashboard" className="hover:text-gold-400 transition-colors">My Trips</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/post-booking" className="hover:text-gold-400 transition-colors">Manage Trip</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Web Check-in</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Web Check-in</h1>
          <p className="text-muted text-lg">Select a seat and confirm details to get your boarding pass</p>
          <div className="flex items-center gap-2 mt-4 mb-8 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
            <Plane className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-mono text-white/80">AI 619 · Delhi (DEL) → Mumbai (BOM) · 15 March</span>
          </div>
        </motion.div>

        {/* Step indicator */}
        <StepProgress 
          steps={['Verify Identity', 'Choose Seat', 'Boarding Pass']} 
          currentStep={step} 
        />

        <AnimatePresence mode="wait">

          {/* STEP 0: Verify */}
          {step === 0 && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass gradient-border rounded-3xl p-7"
            >
              <ShieldCheck className="w-10 h-10 text-gold-400 mb-4" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Verify Your Identity</h2>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Confirm your booking details before we issue your boarding pass.
              </p>

              <div className="space-y-4 mb-6">
                {[
                  { label: 'Full Name (as on passport)', value: 'Rajesh Kumar', verified: true },
                  { label: 'Booking Reference', value: 'AIXTV8', verified: true },
                  { label: 'Date of Birth', placeholder: 'DD / MM / YYYY', type: 'date' },
                  { label: 'Last 4 digits of card used', placeholder: '•••• •••• •••• 3829' },
                ].map(({ label, value, verified, placeholder, type }) => (
                  <div key={label}>
                    <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
                    <div className="relative">
                      <input
                        type={type || 'text'}
                        defaultValue={value}
                        readOnly={!!value}
                        placeholder={placeholder}
                        className={`ai-input w-full px-4 py-3 rounded-xl text-sm ${
                          value ? 'text-white/70' : 'text-white'
                        }`}
                      />
                      {verified && (
                        <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-sage-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gold-400/8 border border-gold-400/20 rounded-xl mb-5 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-gold-200/70 text-xs leading-relaxed">
                  VoyageAI has pre-filled your details from your profile. Just verify and continue.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center justify-center gap-2"
              >
                Verified — Choose My Seat <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* STEP 1: Seat Map */}
          {step === 1 && (
            <motion.div
              key="seatmap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid lg:grid-cols-[1fr_240px] gap-6">
                {/* Seat map */}
                <div className="glass gradient-border rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-display text-xl font-bold text-white">Choose Your Seat</h2>
                    <div className="flex gap-1.5">
                      {['all','window','aisle','extra'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                            filter === f
                              ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20'
                              : 'text-muted hover:text-white border border-transparent'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Legend - Prominent Swatches */}
                  <div className="mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Seat Categories</p>
                    <div className="flex items-center gap-6 text-xs text-muted flex-wrap">
                      {[
                        { color: 'bg-surface border border-white/10', label: 'Standard', sub: 'Free' },
                        { color: 'bg-sky-500/20 border border-sky-500/30', label: 'Legroom', sub: '+₹500' },
                        { color: 'bg-violet-500/20 border border-violet-500/30', label: 'Premium', sub: '+₹800' },
                        { color: 'bg-border/30 border border-border opacity-50', label: 'Occupied', sub: 'N/A' },
                      ].map(({ color, label, sub }) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg ${color}`} />
                          <div>
                            <div className="text-white font-medium-">{label}</div>
                            <div className="text-[10px] opacity-60">{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plane shape wrapper */}
                  <div className="overflow-auto">
                    {/* Nose */}
                    <div className="flex justify-center mb-2">
                      <Plane className="w-8 h-8 text-gold-400/40 -rotate-0" style={{ transform: 'rotate(-90deg)' }} />
                    </div>

                    {/* Column headers */}
                    <div className="flex items-center gap-1 mb-2 px-2">
                      <div className="w-8 text-center text-xs text-muted font-mono">#</div>
                      {COLS.map((col, i) => (
                        <div key={i} className={`${col === '' ? 'w-4' : 'flex-1'} text-center text-xs font-mono font-bold ${
                          col === 'A' || col === 'F' ? 'text-sky-400' :
                          col === 'C' || col === 'D' ? 'text-muted' : 'text-muted'
                        }`}>
                          {col}
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
                      {Array.from({ length: ROWS }, (_, ri) => {
                        const row = ri + 1
                        const isExit = EXIT_ROWS.includes(row)
                        const isExtra = EXTRA_LEGROOM.includes(row)
                        return (
                          <React.Fragment key={row}>
                            {isExit && (
                              <div className="flex items-center gap-2 py-1 text-xs text-amber-400/70 font-mono">
                                <div className="flex-1 h-px bg-amber-400/20" />
                                EXIT ROW
                                <div className="flex-1 h-px bg-amber-400/20" />
                              </div>
                            )}
                            <div className="flex items-center gap-1 px-2">
                              <div className="w-8 text-center text-xs text-muted/50 font-mono">{row}</div>
                              {COLS.map((col, ci) => {
                                if (col === '') return <div key={ci} className="w-4" />
                                const seatId = `${row}${col}`
                                const isOccupied = OCCUPIED.has(seatId)
                                const isSelected = selectedSeat === seatId
                                const seatClass = getSeatClass(row, col)
                              

                                let colorClass
                                if (isSelected) colorClass = SEAT_COLORS.selected
                                else if (isOccupied) colorClass = SEAT_COLORS.occupied
                                else if (seatClass === 'premium') colorClass = SEAT_COLORS.premium
                                else if (seatClass === 'extra' || isExtra) colorClass = SEAT_COLORS.extra
                                else colorClass = SEAT_COLORS.standard

                                return (
                                  <motion.button
                                    key={col}
                                    whileHover={!isOccupied ? { scale: 1.15 } : {}}
                                    whileTap={!isOccupied ? { scale: 0.95 } : {}}
                                    onClick={() => selectSeat(seatId)}
                                    className={`flex-1 aspect-[3/4] rounded text-xs font-mono font-bold border transition-all duration-150 ${colorClass}`}
                                    title={isOccupied ? 'Occupied' : `${seatId} — ${seatClass}`}
                                  >
                                    {isSelected ? '✓' : ''}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Selected seat info */}
                  <div className="glass border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-white mb-3 text-sm">Selected Seat</h3>
                    {selectedSeat ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="text-center py-4">
                          <div className="text-5xl font-display font-bold text-gold-400 mb-1">{selectedSeat}</div>
                          <div className="text-muted text-sm">
                            {selectedSeat.endsWith('A') || selectedSeat.endsWith('F') ? '🪟 Window' :
                             selectedSeat.endsWith('C') || selectedSeat.endsWith('D') ? '🚶 Aisle' : '🪑 Middle'}
                          </div>
                          {seatPrice > 0 && (
                            <div className="mt-2 text-gold-400 font-bold">+₹{seatPrice}</div>
                          )}
                          {seatPrice === 0 && (
                            <div className="mt-2 text-sage-400 text-sm font-medium">Free</div>
                          )}
                        </div>
                        <div className="text-xs text-muted space-y-1">
                          {EXTRA_LEGROOM.includes(parseInt(selectedSeat)) && (
                            <div className="flex items-center gap-1.5 text-sky-300">
                              <Star className="w-3 h-3" /> Extra legroom row
                            </div>
                          )}
                          {parseInt(selectedSeat) <= 3 && (
                            <div className="flex items-center gap-1.5 text-violet-300">
                              <Star className="w-3 h-3" /> Premium front section
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-6 text-muted">
                        <div className="w-12 h-12 bg-surface rounded-xl mx-auto mb-2 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-muted/40" />
                        </div>
                        <p className="text-xs">Click a seat on the map</p>
                      </div>
                    )}
                  </div>

                  {/* Your current seat */}
                  <div className="glass border border-border rounded-2xl p-4">
                    <p className="text-muted text-xs mb-1">Your assigned seat</p>
                    <p className="text-white font-mono font-bold text-xl">{BOOKING.seat}</p>
                    <p className="text-muted text-xs mt-0.5">Keep this or choose a new one above</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm flex items-center justify-center gap-2"
                  >
                    Confirm{selectedSeat ? ` Seat ${selectedSeat}` : ' & Check In'} <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={() => setStep(0)}
                    className="w-full py-2.5 text-muted text-sm flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                </div>
              </div>
          </motion.div>
          )}
          {/* STEP 2: Boarding Pass */}
          {step === 2 && (
            <motion.div
              key="boarding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Success banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-sage-400/10 border border-sage-400/25 rounded-2xl mb-6"
              >
                <CheckCircle className="w-5 h-5 text-sage-400 flex-shrink-0" />
                <div>
                  <p className="text-sage-300 font-semibold">You're checked in!</p>
                  <p className="text-sage-300/60 text-xs">Boarding pass ready · Seat {selectedSeat || BOOKING.seat} confirmed</p>
                </div>
              </motion.div>

              <div className="grid lg:grid-cols-[1fr_240px] gap-6">
                <BoardingPass booking={BOOKING} seat={selectedSeat || BOOKING.seat} />

                {/* Actions */}
                <div className="space-y-3">
                  {[
                    { icon: Download, label: 'Download PDF', desc: 'Save to device', color: 'text-gold-400', primary: true },
                    { icon: Smartphone, label: 'Add to Wallet', desc: 'Apple / Google Pay', color: 'text-sky-400' },
                    { icon: QrCode, label: 'Share via WhatsApp', desc: 'Send to co-traveler', color: 'text-sage-400' },
                  ].map(({ icon: Icon, label, desc, color, primary }) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                        primary
                          ? 'bg-gradient-to-r from-gold-500 to-gold-400 border-transparent text-void'
                          : 'glass border-border hover:border-border/80 text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${primary ? 'text-void' : color}`} />
                      <div>
                        <div className={`font-semibold text-sm ${primary ? 'text-void' : 'text-white'}`}>{label}</div>
                        <div className={`text-xs ${primary ? 'text-void/70' : 'text-muted'}`}>{desc}</div>
                      </div>
                    </motion.button>
                  ))}

                  <div className="p-4 glass border border-amber-400/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 text-xs font-semibold mb-1">Arrive by 07:00 AM</p>
                        <p className="text-amber-200/60 text-xs">Gate closes 30 min before departure. Carry this boarding pass (print or digital).</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/post-booking"
                    className="flex items-center justify-center gap-2 w-full py-3 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all"
                  >
                    Back to Trip Manager
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sticky Bar */}
        {step === 1 && selectedSeat && (
          <StickyActionBar>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">Seat {selectedSeat}</span>
              <span className="text-muted text-xs capitalize">{getSeatClass(parseInt(selectedSeat))} · {seatPrice > 0 ? `₹${seatPrice}` : 'Free'}</span>
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gold-gradient text-void font-bold rounded-xl shadow-gold flex items-center gap-2 text-sm"
            >
              Confirm & Check-in <ArrowRight className="w-4 h-4" />
            </button>
          </StickyActionBar>
        )}
      </div>
    </div>
        )
      }
