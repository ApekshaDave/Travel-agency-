import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Bus, Search, Calendar, Users, ArrowLeftRight, Clock,
  MapPin, ChevronRight, CheckCircle, Star, Lock,
  ArrowRight, Sparkles, X, Zap, Shield, ChevronDown
} from 'lucide-react'
import { MOCK_BUSES } from '../utils/multiModalApi'
import toast from 'react-hot-toast'



const BUS_TYPE_COLORS = {
  'Volvo AC Sleeper': 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  'AC Semi-Sleeper': 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  'Airavat Club Class': 'text-gold-400 bg-gold-400/10 border-gold-400/20',
  'Non-AC Sleeper': 'text-muted bg-surface border-border',
}

const POPULAR_BUS_ROUTES = [
  { from: 'BLR', fromCity: 'Bengaluru', to: 'HYD', toCity: 'Hyderabad', duration: '9h' },
  { from: 'MUM', fromCity: 'Mumbai', to: 'PUN', toCity: 'Pune', duration: '3.5h' },
  { from: 'DEL', fromCity: 'Delhi', to: 'AGR', toCity: 'Agra', duration: '4h' },
  { from: 'CHN', fromCity: 'Chennai', to: 'PNQ', toCity: 'Pondicherry', duration: '3h' },
]

// ── Seat map component ────────────────────────────────────────────────────────
function BusSeatMap({ totalSeats, available, onSeatSelect, selectedSeats }) {
  const rows = Math.ceil(totalSeats / 4)
  const occupiedCount = totalSeats - available
  const occupiedSeats = new Set(
    Array.from({ length: occupiedCount }, (_, i) => i + 1)
  )

  return (
    <div className="glass border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white text-sm font-semibold">Select Seat</p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-sm bg-surface border border-border" />
            <span className="text-muted">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-sm bg-gold-400/60 border border-gold-400" />
            <span className="text-muted">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-sm bg-border/40 border border-border/20" />
            <span className="text-muted">Taken</span>
          </div>
        </div>
      </div>

      {/* Bus front */}
      <div className="flex justify-center mb-3">
        <div className="w-12 h-6 bg-gold-400/15 border border-gold-400/30 rounded-t-full flex items-center justify-center">
          <span className="text-gold-400 text-xs font-mono">FRONT</span>
        </div>
      </div>

      {/* Seat grid */}
      <div className="grid gap-1.5">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="grid grid-cols-[1fr_0.3fr_1fr] gap-1.5">
            {/* Left side — 2 seats */}
            <div className="grid grid-cols-2 gap-1.5">
              {[r * 4 + 1, r * 4 + 2].map(seatNum => {
                if (seatNum > totalSeats) return <div key={seatNum} />
                const isOccupied = occupiedSeats.has(seatNum)
                const isSelected = selectedSeats.includes(seatNum)
                return (
                  <motion.button
                    key={seatNum}
                    whileHover={!isOccupied ? { scale: 1.1 } : {}}
                    whileTap={!isOccupied ? { scale: 0.95 } : {}}
                    onClick={() => !isOccupied && onSeatSelect(seatNum)}
                    disabled={isOccupied}
                    className={`w-full h-8 rounded-sm text-xs font-mono font-bold border transition-all ${
                      isOccupied ? 'bg-border/30 border-border/20 text-muted/30 cursor-not-allowed' :
                      isSelected ? 'bg-gold-400/70 border-gold-400 text-void shadow-gold-sm' :
                      'bg-surface border-border text-muted hover:border-gold-400/30 hover:text-white'
                    }`}
                    title={`Seat ${seatNum}`}
                  >
                    {seatNum}
                  </motion.button>
                )
              })}
            </div>
            {/* Aisle */}
            <div />
            {/* Right side — 2 seats */}
            <div className="grid grid-cols-2 gap-1.5">
              {[r * 4 + 3, r * 4 + 4].map(seatNum => {
                if (seatNum > totalSeats) return <div key={seatNum} />
                const isOccupied = occupiedSeats.has(seatNum)
                const isSelected = selectedSeats.includes(seatNum)
                return (
                  <motion.button
                    key={seatNum}
                    whileHover={!isOccupied ? { scale: 1.1 } : {}}
                    whileTap={!isOccupied ? { scale: 0.95 } : {}}
                    onClick={() => !isOccupied && onSeatSelect(seatNum)}
                    disabled={isOccupied}
                    className={`w-full h-8 rounded-sm text-xs font-mono font-bold border transition-all ${
                      isOccupied ? 'bg-border/30 border-border/20 text-muted/30 cursor-not-allowed' :
                      isSelected ? 'bg-gold-400/70 border-gold-400 text-void shadow-gold-sm' :
                      'bg-surface border-border text-muted hover:border-gold-400/30 hover:text-white'
                    }`}
                    title={`Seat ${seatNum}`}
                  >
                    {seatNum}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bus card ──────────────────────────────────────────────────────────────────
function BusCard({ bus, onBook, i }) {
  const [showSeatMap, setShowSeatMap] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState([])
  const typeColor = BUS_TYPE_COLORS[bus.type] || BUS_TYPE_COLORS['Non-AC Sleeper']
  const filledPct = Math.round(((bus.totalSeats - bus.seatsAvailable) / bus.totalSeats) * 100)

  const handleSeatSelect = (num) => {
    setSelectedSeats(prev =>
      prev.includes(num) ? prev.filter(s => s !== num) : [...prev, num]
    )
  }

  const handleBook = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    onBook(bus, selectedSeats)
    setShowSeatMap(false)
    setSelectedSeats([])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      className="glass border border-border hover:border-gold-400/20 rounded-2xl overflow-hidden transition-all duration-200"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-white font-bold text-base">{bus.operator}</span>
              {bus.government && (
                <span className="px-2 py-0.5 bg-sage-400/15 text-sage-400 border border-sage-400/20 text-xs rounded-full font-medium">
                  Govt.
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${typeColor}`}>
                {bus.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted text-xs">
              <span className="font-mono">{bus.busNo}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                {bus.rating} ({bus.ratingCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bus.liveTracking && (
              <span className="flex items-center gap-1 px-2 py-1 bg-sage-400/10 border border-sage-400/20 text-sage-400 text-xs rounded-lg">
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-pulse" /> Live Track
              </span>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center w-20">
            <div className="font-bold text-2xl text-white">{bus.depart}</div>
            <div className="text-muted text-xs mt-0.5">{bus.fromCity}</div>
            <div className="text-muted/50 text-xs">{bus.fromTerminal}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-muted text-xs mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {bus.duration}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-border" />
              <div className="w-7 h-7 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                <Bus className="w-3.5 h-3.5 text-gold-400" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-gold-400/30" />
            </div>
            <div className="text-muted text-xs mt-1">{bus.distance}</div>
          </div>
          <div className="text-center w-20">
            <div className="font-bold text-2xl text-white">{bus.arrive}</div>
            <div className="text-muted text-xs mt-0.5">{bus.toCity}</div>
            <div className="text-muted/50 text-xs">{bus.toTerminal}</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {bus.amenities.map(a => (
            <span key={a} className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full text-xs text-muted">
              {a === 'Charging Port' ? <Zap className="w-3 h-3" /> :
               a === 'CCTV' ? <Shield className="w-3 h-3" /> :
               <CheckCircle className="w-3 h-3" />}
              {a}
            </span>
          ))}
        </div>

        {/* Seat availability bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>{bus.seatsAvailable} seats left</span>
            <span className={bus.seatsAvailable < 10 ? 'text-amber-400' : 'text-muted'}>
              {filledPct}% filled
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${filledPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                filledPct > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-gold-500 to-gold-400'
              }`}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-gold-400 font-bold text-2xl">₹{bus.fare}</div>
            <div className="text-muted text-xs">{bus.cancellationPolicy}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSeatMap(!showSeatMap)}
              className="flex items-center gap-1.5 px-4 py-2.5 glass border border-border hover:border-gold-400/20 rounded-xl text-sm text-muted hover:text-white transition-all"
            >
              Select Seat <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSeatMap ? 'rotate-180' : ''}`} />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (showSeatMap && selectedSeats.length > 0) {
                  handleBook()
                } else {
                  setShowSeatMap(true)
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm hover:shadow-gold transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              {showSeatMap && selectedSeats.length > 0 ? `Book ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}` : 'Book'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Seat map */}
      <AnimatePresence>
        {showSeatMap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="p-5">
              <BusSeatMap
                totalSeats={bus.totalSeats}
                available={bus.seatsAvailable}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
              {selectedSeats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between p-3 bg-gold-400/8 border border-gold-400/20 rounded-xl"
                >
                  <div>
                    <span className="text-gold-300 text-sm font-semibold">
                      Seats {selectedSeats.join(', ')} selected
                    </span>
                    <div className="text-gold-200/60 text-xs mt-0.5">
                      Total: ₹{bus.fare * selectedSeats.length}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleBook}
                    className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm"
                  >
                    Confirm Booking
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Bus Search Page ──────────────────────────────────────────────────────
export default function BusSearch() {
  const [from, setFrom] = useState('Bengaluru')
  const [to, setTo] = useState('Hyderabad')
  const [date, setDate] = useState('2025-03-20')
  const [passengers, setPassengers] = useState(1)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [bookedBus, setBookedBus] = useState(null)
  const [filterType] = useState("");

  const swap = () => { setFrom(to); setTo(from) }

  const handleSearch = () => {
    setLoading(true)
    setSearched(false)
    setTimeout(() => { setLoading(false); setSearched(true) }, 1100)
  }

  const handleBook = (bus, seats) => {
    setBookedBus({ bus, seats })
    toast.success(`🚌 ${bus.operator} booked! Seat${seats.length > 1 ? 's' : ''} ${seats.join(', ')} confirmed.`)
  }

  const filtered = MOCK_BUSES
    .filter(b => filterType === 'all' || b.type.toLowerCase().includes(filterType))
    .sort((a, b) => {
      if (sortBy === 'price') return a.fare - b.fare
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'depart') return a.depart.localeCompare(b.depart)
      return 0
    })

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Buses</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Book Bus Tickets</h1>
          <p className="text-muted">Volvo sleepers, semi-sleepers, government buses — live seat selection.</p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-5 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">From</label>
              <div className="relative">
                <Bus className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input value={from} onChange={e => setFrom(e.target.value)}
                  placeholder="City or Bus Stand"
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
              </div>
            </div>
            <button onClick={swap} className="p-3 glass border border-border hover:border-gold-400/30 rounded-xl text-muted hover:text-gold-400 transition-all self-end">
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input value={to} onChange={e => setTo(e.target.value)}
                  placeholder="City or Bus Stand"
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <select value={passengers} onChange={e => setPassengers(+e.target.value)}
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm appearance-none">
                  {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-deep">{n}</option>)}
                </select>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSearch} disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center gap-2 self-end"
            >
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Search className="w-4 h-4" /></motion.div>
                : <Search className="w-4 h-4" />
              }
              Search
            </motion.button>
          </div>
        </motion.div>

        {/* Popular routes */}
        {!searched && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="font-display text-xl font-bold text-white mb-4">Popular Bus Routes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {POPULAR_BUS_ROUTES.map(route => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() => { setFrom(route.fromCity); setTo(route.toCity); handleSearch() }}
                  className="glass border border-border hover:border-gold-400/20 rounded-2xl p-4 flex items-center gap-3 text-left transition-all group"
                >
                  <Bus className="w-5 h-5 text-gold-400/60 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-white text-sm font-medium group-hover:text-gold-300 transition-colors">
                      {route.fromCity}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted inline mx-2" />
                    <span className="text-white text-sm font-medium">{route.toCity}</span>
                    <div className="text-muted text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {route.duration} approx.
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-gold-400 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-14">
              <motion.div
                animate={{ x: [0, 50, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-fit"
              >
                <Bus className="w-10 h-10 text-gold-400" />
              </motion.div>
              <p className="text-muted text-sm">Finding buses from {from} to {to}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Filters */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-white font-semibold text-lg">{filtered.length} buses found</h2>
                  <p className="text-muted text-sm">{from} → {to} · {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-xs">Sort:</span>
                  {['recommended', 'price', 'rating', 'depart'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        sortBy === s ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20' : 'text-muted hover:text-white'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* AI tip */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="mb-5 flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-gold-200/70 text-sm">
                  <span className="text-gold-300 font-semibold">AI Tip: </span>
                  KSRTC Airavat is the highest-rated bus on this route (4.5★) and has live tracking. VRL Travels offers the most seats. Book window seats (1, 5, 9...) for scenic views.
                </p>
              </motion.div>

              <div className="space-y-4">
                {filtered.map((bus, i) => (
                  <BusCard key={bus.id} bus={bus} onBook={handleBook} i={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booked confirmation */}
        <AnimatePresence>
          {bookedBus && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-6 right-6 glass border border-sage-400/30 bg-sage-400/10 rounded-2xl p-4 shadow-card max-w-sm z-40"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-sage-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Bus Booked!</p>
                  <p className="text-muted text-xs mt-0.5">
                    {bookedBus.bus.operator} · Seat{bookedBus.seats.length > 1 ? 's' : ''} {bookedBus.seats.join(', ')} · ₹{bookedBus.bus.fare * bookedBus.seats.length}
                  </p>
                </div>
                <button onClick={() => setBookedBus(null)} className="text-muted hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
