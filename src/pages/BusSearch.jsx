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
  'Volvo AC Sleeper': 'text-violet-700 bg-violet-50 border-violet-300',
  'AC Semi-Sleeper': 'text-sky-700 bg-sky-50 border-sky-300',
  'Airavat Club Class': 'text-amber-700 bg-amber-50 border-amber-300',
  'Non-AC Sleeper': 'text-slate-500 bg-slate-100 border-slate-200',
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-900 text-sm font-semibold">Select Seat</p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-sm bg-slate-100 border border-slate-200" />
            <span className="text-slate-500">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-sm bg-blue-400 border border-blue-600" />
            <span className="text-slate-500">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-4 rounded-sm bg-border/40 border border-border/20" />
            <span className="text-slate-500">Taken</span>
          </div>
        </div>
      </div>

      {/* Bus front */}
      <div className="flex justify-center mb-3">
        <div className="w-12 h-6 bg-blue-50 border border-blue-200 rounded-t-full flex items-center justify-center">
          <span className="text-blue-600 text-xs font-mono">FRONT</span>
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
                      isSelected ? 'bg-blue-500 border-blue-600 text-white shadow-md' :
                      'bg-surface border-border text-slate-400 hover:border-gold-400/30 hover:text-white'
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
                      isSelected ? 'bg-blue-500 border-blue-600 text-white shadow-md' :
                      'bg-surface border-border text-slate-400 hover:border-gold-400/30 hover:text-white'
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
      className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-slate-900 font-bold text-base">{bus.operator}</span>
              {bus.government && (
                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs rounded-full font-medium">
                  Govt.
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${typeColor}`}>
                {bus.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="font-mono">{bus.busNo}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {bus.rating} ({bus.ratingCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bus.liveTracking && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Track
              </span>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center w-20">
            <div className="font-bold text-2xl text-slate-900">{bus.depart}</div>
            <div className="text-slate-500 text-xs mt-0.5">{bus.fromCity}</div>
            <div className="text-slate-400 text-xs">{bus.fromTerminal}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-muted text-xs mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {bus.duration}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300/40 to-slate-200" />
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Bus className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-gold-400/30" />
            </div>
            <div className="text-muted text-xs mt-1">{bus.distance}</div>
          </div>
          <div className="text-center w-20">
            <div className="font-bold text-2xl text-slate-900">{bus.arrive}</div>
            <div className="text-slate-500 text-xs mt-0.5">{bus.toCity}</div>
            <div className="text-slate-400 text-xs">{bus.toTerminal}</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {bus.amenities.map(a => (
            <span key={a} className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border rounded-full text-xs text-slate-400">
              {a === 'Charging Port' ? <Zap className="w-3 h-3" /> :
               a === 'CCTV' ? <Shield className="w-3 h-3" /> :
               <CheckCircle className="w-3 h-3" />}
              {a}
            </span>
          ))}
        </div>

        {/* Seat availability bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{bus.seatsAvailable} seats left</span>
            <span className={bus.seatsAvailable < 10 ? 'text-amber-600' : 'text-slate-400'}>
              {filledPct}% filled
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${filledPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                filledPct > 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-blue-700 font-bold text-2xl">₹{bus.fare}</div>
            <div className="text-slate-400 text-xs">{bus.cancellationPolicy}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSeatMap(!showSeatMap)}
              className="flex items-center gap-1.5 px-4 py-2.5 glass border border-border hover:border-gold-400/20 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
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
              className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
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
            className="overflow-hidden border-t border-slate-200"
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
                  className="mt-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div>
                    <span className="text-blue-700 text-sm font-semibold">
                      Seats {selectedSeats.join(', ')} selected
                    </span>
                    <div className="text-blue-500 text-xs mt-0.5">
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Buses</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-slate-900 mb-1">Book Bus Tickets</h1>
          <p className="text-slate-500">Volvo sleepers, semi-sleepers, government buses — live seat selection.</p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">From</label>
              <div className="relative">
                <Bus className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input value={from} onChange={e => setFrom(e.target.value)}
                  placeholder="City or Bus Stand"
                  className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm" />
              </div>
            </div>
            <button onClick={swap} className="p-3 glass border border-border hover:border-gold-400/30 rounded-xl text-slate-400 hover:text-gold-400 transition-all self-end">
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input value={to} onChange={e => setTo(e.target.value)}
                  placeholder="City or Bus Stand"
                  className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select value={passengers} onChange={e => setPassengers(+e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm appearance-none">
                  {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-deep">{n}</option>)}
                </select>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSearch} disabled={loading}
              className="px-6 py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-end" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
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
            <h2 className="font-display text-xl font-bold text-slate-800 mb-4">Popular Bus Routes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {POPULAR_BUS_ROUTES.map(route => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() => { setFrom(route.fromCity); setTo(route.toCity); handleSearch() }}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 flex items-center gap-3 text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <Bus className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-white text-sm font-medium group-hover:text-blue-600 transition-colors">
                      {route.fromCity}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 inline mx-2" />
                    <span className="text-white text-sm font-medium">{route.toCity}</span>
                    <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {route.duration} approx.
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
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
                <Bus className="w-10 h-10 text-blue-500" />
              </motion.div>
              <p className="text-slate-500 text-sm">Finding buses from {from} to {to}...</p>
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
                  <h2 className="text-slate-900 font-semibold text-lg">{filtered.length} buses found</h2>
                  <p className="text-slate-500 text-sm">{from} → {to} · {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-xs">Sort:</span>
                  {['recommended', 'price', 'rating', 'depart'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        sortBy === s ? 'bg-blue-50 text-blue-700 border border-blue-300' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* AI tip */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="mb-5 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm">
                  <span className="text-blue-700 font-semibold">AI Tip: </span>
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
              className="fixed bottom-6 right-6 bg-white border border-green-200 rounded-2xl p-4 shadow-card max-w-sm z-40"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-slate-900 font-semibold text-sm"></p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {bookedBus.bus.operator} · Seat{bookedBus.seats.length > 1 ? 's' : ''} {bookedBus.seats.join(', ')} · ₹{bookedBus.bus.fare * bookedBus.seats.length}
                  </p>
                </div>
                <button onClick={() => setBookedBus(null)} className="text-slate-400 hover:text-slate-700">
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