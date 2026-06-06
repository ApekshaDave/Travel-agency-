import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search, Plane, ArrowLeftRight,
  ArrowRight, Sparkles, Shield
} from 'lucide-react'
import { searchFlights } from '../utils/multiModalApi'
import { useBookingStore } from '../store/bookingStore'
import toast from 'react-hot-toast'
import FlightCard from '../components/features/FlightCard'

const MOCK_FLIGHTS = [
  {
    id: 1, airline: 'IndiGo', code: '6E 204', logo: '🔵',
    from: 'DEL', fromCity: 'Delhi', to: 'BOM', toCity: 'Mumbai',
    depart: '06:00', arrive: '08:10', duration: '2h 10m', stops: 0,
    price: 4299, class: 'Economy', seats: 4, tag: 'Cheapest',
    amenities: ['USB charging', 'Snacks'],
  },
  {
    id: 2, airline: 'Air India', code: 'AI 619', logo: '🔴',
    from: 'DEL', fromCity: 'Delhi', to: 'BOM', toCity: 'Mumbai',
    depart: '09:30', arrive: '11:50', duration: '2h 20m', stops: 0,
    price: 5800, class: 'Economy', seats: 9, tag: 'Best Value', recommended: true,
    amenities: ['Meal included', 'Extra legroom'],
  },
  {
    id: 3, airline: 'Vistara', code: 'UK 955', logo: '🟣',
    from: 'DEL', fromCity: 'Delhi', to: 'BOM', toCity: 'Mumbai',
    depart: '14:15', arrive: '16:30', duration: '2h 15m', stops: 0,
    price: 7200, class: 'Economy', seats: 2, tag: 'Premium',
    amenities: ['Meal included', 'Priority boarding', 'Extra baggage'],
  },
  {
    id: 4, airline: 'SpiceJet', code: 'SG 112', logo: '🟠',
    from: 'DEL', fromCity: 'Delhi', to: 'BOM', toCity: 'Mumbai',
    depart: '19:45', arrive: '22:10', duration: '2h 25m', stops: 0,
    price: 3850, class: 'Economy', seats: 12, tag: 'Budget',
    amenities: ['USB charging'],
  },
]

const normalizePrice = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function SearchPage() {
  const [tripType, setTripType] = useState('oneWay')
  const [from, setFrom] = useState('Delhi (DEL)')
  const [to, setTo] = useState('Mumbai (BOM)')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [travelers, setTravelers] = useState(1)
  const [cabinClass] = useState('Economy')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [sortBy, setSortBy] = useState('price')
  const [view, setView] = useState('input')
  const [flightsList, setFlightsList] = useState(MOCK_FLIGHTS)

  const setSelectedFlightStore = useBookingStore(state => state.setSelectedFlight)
  const setSearchParamsStore = useBookingStore(state => state.setSearchParams)

  const handleSearch = async () => {
    setLoading(true)
    setView('results')
    setSelectedFlight(null)
    try {
      setSearchParamsStore({
        from,
        to,
        date,
        travelers,
        cabinClass
      })

      const cleanFrom = from.includes('(') ? from.split('(')[1]?.replace(')', '') : from
      const cleanTo = to.includes('(') ? to.split('(')[1]?.replace(')', '') : to

      const res = await searchFlights({
        from: cleanFrom,
        to: cleanTo,
        date,
        passengers: travelers,
        travelClass: cabinClass
      })

      if (res && res.flights && res.flights.length > 0) {
        const mapped = res.flights.map((f, index) => ({
          ...f,
          id: f.id || `ai-${index}-${Date.now()}`,
          code: f.flightNo || f.code || 'AI 101',
          price: normalizePrice(f.price, MOCK_FLIGHTS[index % MOCK_FLIGHTS.length]?.price || 0),
          seats: f.seatsLeft || f.seats || 5,
          fromCity: f.fromCity || from.split(' ')[0] || from,
          toCity: f.toCity || to.split(' ')[0] || to,
          from: f.from || cleanFrom,
          to: f.to || cleanTo,
          tag: f.tag || (f.recommended ? 'Recommended' : ''),
          amenities: f.amenities || ['USB charging']
        }))
        setFlightsList(mapped)
      } else {
        setFlightsList(MOCK_FLIGHTS)
      }
      setSearched(true)
    } catch (err) {
      console.error('AI Flight Search failed:', err)
      toast.error('AI Search failed. Showing offline flight listings.')
      setFlightsList(MOCK_FLIGHTS)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const swapCities = () => {
    setFrom(to)
    setTo(from)
  }

  const sortedFlights = [...flightsList].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration)
    if (sortBy === 'depart') return a.depart.localeCompare(b.depart)
    return 0
  })

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header - Phased Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              {view === 'input' ? 'Plan Your Flight' : 'Select Departure'}
            </h1>
            {view === 'results' && (
              <button 
                onClick={() => setView('input')} 
                className="text-gold-400 text-sm font-medium hover:underline"
              >
                Change Search
              </button>
            )}
          </div>
          {view === 'input' && (
             <p className="text-muted">Enter your details or try <Link to="/chat" className="text-gold-400 underline">AI Planning</Link></p>
          )}
        </motion.div>

        {/* Phased Search Form */}
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass gradient-border rounded-3xl p-6 mb-8 overflow-hidden"
            >
               <div className="flex gap-1 mb-6">
                {['oneWay', 'roundTrip', 'multiCity'].map(type => (
                  <button key={type} onClick={() => setTripType(type)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tripType === type ? 'bg-gold-400/15 text-gold-400 border border-gold-400/25' : 'text-muted hover:text-white'}`}>{type === 'oneWay'? 'One Way': type === 'roundTrip'? 'Round Trip': 'Multi City'}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium uppercase tracking-wider">From</label>
                  <input value={from} onChange={e => setFrom(e.target.value)} className="ai-input w-full px-4 py-3 rounded-xl text-white text-sm" />
                </div>
                <button onClick={swapCities} className="p-3 glass border border-border rounded-xl text-muted self-end"><ArrowLeftRight className="w-4 h-4" /></button>
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium uppercase tracking-wider">To</label>
                  <input value={to} onChange={e => setTo(e.target.value)} className="ai-input w-full px-4 py-3 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium uppercase tracking-wider">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ai-input w-full px-4 py-3 rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1.5 block font-medium uppercase tracking-wider">Travelers</label>
                   <select value={travelers} onChange={e => setTravelers(Number(e.target.value))} className="ai-input w-full px-4 py-3 rounded-xl text-white text-sm appearance-none">
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} traveler</option>)}
                   </select>
                </div>
                <button onClick={handleSearch} className="px-8 py-3 bg-gold-gradient text-void font-bold rounded-xl shadow-gold hover:scale-105 transition-all self-end flex items-center gap-2">
                  <Search className="w-4 h-4" /> Find Flights
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border border-border/40 rounded-2xl p-4 mb-8 flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-white">{from.split('(')[1]?.replace(')','')}</div>
                  <ArrowRight className="w-4 h-4 text-muted" />
                  <div className="text-lg font-bold text-white">{to.split('(')[1]?.replace(')','')}</div>
                </div>
                <div className="h-8 w-px bg-border mx-2" />
                <div className="space-y-px">
                  <div className="text-xs font-bold text-white">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-[10px] text-muted uppercase tracking-widest">{travelers} Traveler · {cabinClass}</div>
                </div>
              </div>
              <button 
                onClick={() => setView('input')} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium border border-border/30 transition-all"
              >
                Modify
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-gold-400/20 border-t-gold-400"
                />
                <Plane className="absolute inset-0 m-auto w-6 h-6 text-gold-400" />
              </div>
              <p className="text-muted text-sm">Searching live flight inventory...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Results header */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    {sortedFlights.length} flights found
                  </h2>
                  <p className="text-muted text-sm">{from} → {to} · {travelers} traveler · {cabinClass}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Sort:</span>
                  {['price', 'duration', 'depart'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        sortBy === s
                          ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20'
                          : 'text-muted hover:text-white border border-transparent'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI tip */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-5 flex items-start gap-3 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl"
              >
                <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-sky-200/80 text-sm">
                  <span className="font-semibold text-sky-300">AI Tip:</span> Fares on this route are 12% below average this week. The 6E 204 morning flight has the best on-time performance (96%).
                </p>
              </motion.div>

              {/* Flight cards */}
              <div className="space-y-4">
                {sortedFlights.map((flight, i) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <FlightCard
                      flight={flight}
                      onSelect={(f) => setSelectedFlight(f)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Selected flight confirmation */}
              <AnimatePresence>
                {selectedFlight && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-6 glass gradient-border rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white mb-1">
                          ✈ {selectedFlight.airline} selected
                        </h3>
                        <p className="text-muted text-sm">
                          {selectedFlight.depart} → {selectedFlight.arrive} · {selectedFlight.duration} · {selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-gold-400 font-bold text-2xl">₹{selectedFlight.price.toLocaleString()}</div>
                        <p className="text-muted text-xs">per person</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        to="/book"
                        onClick={() => setSelectedFlightStore(selectedFlight)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold hover:shadow-[0_0_40px_rgba(232,180,41,0.4)] transition-all"
                      >
                        <Shield className="w-4 h-4" />
                        Continue to Booking
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setSelectedFlight(null)}
                        className="px-4 py-3 glass border border-border hover:border-border/80 rounded-xl text-muted text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 glass border border-border rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-gold-400/40" />
            </div>
            <h3 className="font-display text-xl text-white mb-2">Where to next?</h3>
            <p className="text-muted text-sm mb-6">Enter your route above or let AI plan it for you.</p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 glass border border-gold-400/20 text-gold-400 text-sm font-medium rounded-xl hover:bg-gold-400/5 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Try AI Search instead
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
