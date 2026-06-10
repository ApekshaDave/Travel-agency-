import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search, Plane, ArrowLeftRight,
  ArrowRight, Sparkles, Shield,
} from 'lucide-react'
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

const inputCls = "w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"

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
  const setSearchParamsStore   = useBookingStore(state => state.setSearchParams)

  const handleSearch = async () => {
    setLoading(true)
    setView('results')
    setSelectedFlight(null)
    try {
      setSearchParamsStore({ from, to, date, travelers, cabinClass })
      await new Promise(resolve => setTimeout(resolve, 1500))
      setFlightsList(MOCK_FLIGHTS)
      setSearched(true)
    } catch (err) {
      console.error('Flight Search failed:', err)
      toast.error('Search failed. Showing offline listings.')
      setFlightsList(MOCK_FLIGHTS)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const swapCities = () => { setFrom(to); setTo(from) }

  const sortedFlights = [...flightsList].sort((a, b) => {
    if (sortBy === 'price')    return a.price - b.price
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration)
    if (sortBy === 'depart')   return a.depart.localeCompare(b.depart)
    return 0
  })

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900 mb-1">
                {view === 'input' ? 'Plan Your Flight' : 'Select Departure'}
              </h1>
              {view === 'input' && (
                <p className="text-slate-500">
                  Enter your details or try{' '}
                  <Link to="/chat" className="text-blue-600 hover:underline font-semibold">AI Planning</Link>
                </p>
              )}
            </div>
            {view === 'results' && (
              <button
                onClick={() => setView('input')}
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                Change Search
              </button>
            )}
          </div>
        </motion.div>

        {/* Search form / summary */}
        <AnimatePresence mode="wait">
          {view === 'input' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm overflow-hidden"
            >
              {/* Trip type tabs */}
              <div className="flex gap-1 mb-6">
                {[
                  { key: 'oneWay', label: 'One Way' },
                  { key: 'roundTrip', label: 'Round Trip' },
                  { key: 'multiCity', label: 'Multi City' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTripType(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      tripType === key
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-semibold uppercase tracking-wider">From</label>
                  <input value={from} onChange={e => setFrom(e.target.value)} className={inputCls} />
                </div>

                <button
                  onClick={swapCities}
                  className="p-3 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-xl text-slate-400 self-end transition-all"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>

                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-semibold uppercase tracking-wider">To</label>
                  <input value={to} onChange={e => setTo(e.target.value)} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-semibold uppercase tracking-wider">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block font-semibold uppercase tracking-wider">Travelers</label>
                  <select value={travelers} onChange={e => setTravelers(Number(e.target.value))} className={`${inputCls} appearance-none cursor-pointer`}>
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} traveler{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="self-end flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                >
                  <Search className="w-4 h-4" /> Find Flights
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{from.split('(')[1]?.replace(')', '')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-bold text-slate-900">{to.split('(')[1]?.replace(')', '')}</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{travelers} Traveler · {cabinClass}</p>
                </div>
              </div>
              <button
                onClick={() => setView('input')}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
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
              className="text-center py-16"
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-blue-100 border-t-blue-500"
                />
                <Plane className="absolute inset-0 m-auto w-6 h-6 text-blue-500" />
              </div>
              <p className="text-slate-500 text-sm">Searching live flight inventory...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Results header */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-slate-900 font-semibold text-lg">{sortedFlights.length} flights found</h2>
                  <p className="text-slate-500 text-sm">{from} → {to} · {travelers} traveler · {cabinClass}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Sort:</span>
                  {['price', 'duration', 'depart'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === s
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-slate-500 hover:text-slate-900 border border-transparent'
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
                className="mb-5 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl"
              >
                <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm">
                  <span className="font-semibold">AI Tip:</span> Fares on this route are 12% below average this week. The 6E 204 morning flight has the best on-time performance (96%).
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
                    <FlightCard flight={flight} onSelect={f => setSelectedFlight(f)} />
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
                    className="mt-6 bg-white border border-blue-100 rounded-2xl p-6 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 60%, #EEF2FF 100%)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
                          ✈ {selectedFlight.airline} selected
                        </h3>
                        <p className="text-slate-500 text-sm">
                          {selectedFlight.depart} → {selectedFlight.arrive} · {selectedFlight.duration} · {selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-600 font-bold text-2xl font-mono">₹{selectedFlight.price.toLocaleString()}</div>
                        <p className="text-slate-400 text-xs">per person</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        to="/book"
                        onClick={() => setSelectedFlightStore(selectedFlight)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                      >
                        <Shield className="w-4 h-4" />
                        Continue to Booking
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setSelectedFlight(null)}
                        className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-sm font-medium transition-all"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-blue-200" />
            </div>
            <h3 className="font-display text-xl text-slate-900 font-bold mb-2">Where to next?</h3>
            <p className="text-slate-500 text-sm mb-6">Enter your route above or let AI plan it for you.</p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Try AI Search instead
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}