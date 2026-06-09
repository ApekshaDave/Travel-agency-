import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Train, Search, Calendar, Users, ArrowLeftRight,
  Clock, MapPin, ChevronRight, CheckCircle, Lock, ArrowRight,
  Sparkles, X, ChevronDown
} from 'lucide-react'
import { MOCK_TRAINS } from '../utils/multiModalApi';
import toast from 'react-hot-toast'

const TRAIN_CLASSES = [
  'SL',
  '3A',
  '2A',
  '1A',
  'CC',
  'EC'
];

const CLASS_COLORS = {
  '1A': 'text-violet-700 bg-violet-50 border-violet-300',
  '2A': 'text-sky-700 bg-sky-50 border-sky-300',
  '3A': 'text-amber-700 bg-amber-50 border-amber-300',
  'SL': 'text-green-700 bg-green-50 border-green-300',
  'CC': 'text-orange-700 bg-orange-50 border-orange-300',
  '2S': 'text-slate-500 bg-slate-100 border-slate-200',
}

const POPULAR_ROUTES = [
  { from: 'NDLS', fromCity: 'New Delhi', to: 'BCT', toCity: 'Mumbai Central' },
  { from: 'NDLS', fromCity: 'New Delhi', to: 'HWH', toCity: 'Howrah (Kolkata)' },
  { from: 'MAS', fromCity: 'Chennai Central', to: 'SBC', toCity: 'Bengaluru' },
  { from: 'BCT', fromCity: 'Mumbai Central', to: 'ADI', toCity: 'Ahmedabad' },
]

// ── Seat Availability Badge ───────────────────────────────────────────────────
function AvailBadge({ available, waitlist }) {
  if (waitlist > 0) {
    return (
      <span className="text-amber-400 text-xs font-medium">WL {waitlist}</span>
    )
  }
  if (available === 0) {
    return <span className="text-red-400 text-xs font-medium">Full</span>
  }
  return (
    <span className={`text-xs font-medium ${available < 10 ? 'text-amber-400' : 'text-sage-400'}`}>
      Avail {available}
    </span>
  )
}

// ── Train Card ────────────────────────────────────────────────────────────────
function TrainCard({ train, selectedClass, onClassSelect, onBook, i }) {
  const [expanded, setExpanded] = useState(false)
  const cls = train.classes[selectedClass] || Object.values(train.classes)[0]
  const clsKey = train.classes[selectedClass] ? selectedClass : Object.keys(train.classes)[0]
  const isAvailable = cls && !cls.waitlist && cls.available > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md group"
    >
      <div className="p-5">
        {/* Train name & number */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Train className="w-4 h-4 text-gold-400" />
              <span className="font-display font-bold text-slate-900 text-lg">{train.name}</span>
              {train.superfast && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-xs rounded-full font-medium">
                  Superfast
                </span>
              )}
            </div>
            <span className="font-mono text-slate-400 text-sm"># {train.number}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {train.runsOn.slice(0, 3).map(d => (
              <span key={d} className="px-2 py-0.5 bg-surface border border-border rounded text-xs text-slate-400 font-mono">
                {d}
              </span>
            ))}
            {train.runsOn.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-slate-400">+{train.runsOn.length - 3}</span>
            )}
          </div>
        </div>

        {/* Route visual */}
        <div className="flex items-center gap-4 mb-5">
          <div className="text-center w-24">
            <div className="font-bold text-3xl text-slate-900">{train.depart}</div>
            <div className="font-mono text-blue-600 font-semibold mt-0.5">{train.from}</div>
            <div className="text-slate-400 text-xs truncate">{train.fromCity}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-slate-400 text-xs mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {train.duration}
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300/50 to-slate-200" />
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Train className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-blue-300/50" />
            </div>
            <div className="text-slate-400 text-xs mt-1.5">{train.distance}</div>
          </div>
          <div className="text-center w-24">
            <div className="font-bold text-3xl text-slate-900">{train.arrive}</div>
            <div className="font-mono text-blue-600 font-semibold mt-0.5">{train.to}</div>
            <div className="text-slate-400 text-xs truncate">{train.toCity}</div>
          </div>
        </div>

        {/* Class selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(train.classes).map(([code, data]) => (
            <button
              key={code}
              onClick={() => onClassSelect(code)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl border text-xs transition-all ${
                selectedClass === code
                  ? CLASS_COLORS[code]
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <span className="font-bold">{code}</span>
              <span className="text-[10px] mt-0.5 opacity-70">{TRAIN_CLASSES[code]?.split(' ').slice(-1)[0]}</span>
              <span className="font-semibold mt-0.5">₹{data.fare}</span>
              <AvailBadge available={data.available} waitlist={data.waitlist} />
            </button>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {train.pantry && (
              <span className="text-xs text-slate-400 flex items-center gap-1">🍽 Pantry car</span>
            )}
            {train.tatkalAvailable && (
              <span className="text-xs text-slate-400 flex items-center gap-1">⚡ Tatkal</span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Schedule <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {cls && (
              <div className="text-right">
                <div className="text-blue-700 font-bold text-xl">₹{cls.fare}</div>
                <div className="text-slate-400 text-xs">{TRAIN_CLASSES[clsKey]}</div>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onBook(train, clsKey, cls)}
              disabled={!isAvailable}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all ${
                isAvailable
                  ? 'text-white shadow-md hover:shadow-lg'
                  : cls?.waitlist
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
                  : 'bg-surface text-slate-400 border border-border cursor-not-allowed'
              }`}
              style={isAvailable ? {background:'linear-gradient(135deg,#1A6EBD,#1558A0)'} : {}}
            >
              {isAvailable ? (
                <><Lock className="w-3.5 h-3.5" /> Book</>
              ) : cls?.waitlist ? (
                <>WL Book</>
              ) : (
                <>Sold Out</>
              )}
            </motion.button>
          </div>
        </div>

        {/* Expanded schedule */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Intermediate Stops</p>
                <div className="space-y-2 text-xs text-slate-400">
                  {[
                    { station: train.fromCity, time: train.depart, dist: '0 km', type: 'origin' },
                    { station: 'Mathura Jn', time: '+1h 30m', dist: '141 km', type: 'stop' },
                    { station: 'Agra Cantt', time: '+2h 10m', dist: '195 km', type: 'stop' },
                    { station: 'Gwalior', time: '+3h 45m', dist: '321 km', type: 'stop' },
                    { station: train.toCity, time: train.arrive, dist: train.distance, type: 'dest' },
                  ].map(({ station, time, dist, type }) => (
                    <div key={station} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        type === 'origin' || type === 'dest' ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                      <span className={type === 'origin' || type === 'dest' ? 'text-slate-900 font-medium' : ''}>{station}</span>
                      <span className="ml-auto font-mono">{time}</span>
                      <span className="text-slate-300 w-16 text-right">{dist}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main Train Search Page ────────────────────────────────────────────────────
export default function TrainSearch() {
  const [from, setFrom] = useState('New Delhi (NDLS)')
  const [to, setTo] = useState('Mumbai Central (BCT)')
  const [date, setDate] = useState('2025-03-20')
  const [passengers, setPassengers] = useState(1)
  const [selectedClass, setSelectedClass] = useState('3A')
  const [quota, setQuota] = useState('GN')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookedTrain, setBookedTrain] = useState(null)

  const swap = () => { setFrom(to); setTo(from) }

  const handleSearch = () => {
    setLoading(true)
    setSearched(false)
    setTimeout(() => { setLoading(false); setSearched(true) }, 1300)
  }

  const handleBook = (train, classCode, classData) => {
    if (!classData.available && !classData.waitlist) return
    setBookedTrain({ train, classCode, classData })
    toast.success(`🚂 ${train.name} booked in ${TRAIN_CLASSES[classCode]}!`)
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Trains</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-slate-900 mb-1">Book Train Tickets</h1>
          <p className="text-slate-500">All Indian Railways routes — live availability, Tatkal, and instant booking.</p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 mb-8"
        >
          {/* Quota selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'GN', label: 'General' },
              { id: 'TQ', label: 'Tatkal' },
              { id: 'PT', label: 'Premium Tatkal' },
              { id: 'LD', label: 'Ladies' },
              { id: 'SS', label: 'Senior Citizen' },
            ].map(q => (
              <button
                key={q.id}
                onClick={() => setQuota(q.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  quota === q.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-300'
                    : 'text-slate-400 hover:text-slate-700 border border-transparent'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">From</label>
              <div className="relative">
                <Train className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input value={from} onChange={e => setFrom(e.target.value)}
                  placeholder="Station or City"
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
                  placeholder="Station or City"
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
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-deep">{n}</option>)}
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

          {/* Class selector row */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(TRAIN_CLASSES).map(([code, name]) => (
              <button
                key={code}
                onClick={() => setSelectedClass(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedClass === code
                    ? CLASS_COLORS[code]
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {code} — {name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Popular routes */}
        {!searched && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="font-display text-xl font-bold text-slate-800 mb-4">Popular Routes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {POPULAR_ROUTES.map(route => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() => {
                    setFrom(`${route.fromCity} (${route.from})`)
                    setTo(`${route.toCity} (${route.to})`)
                    handleSearch()
                  }}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 flex items-center gap-3 text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <Train className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-white text-sm font-medium group-hover:text-blue-600 transition-colors">
                      {route.fromCity}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 inline mx-2" />
                    <span className="text-white text-sm font-medium">{route.toCity}</span>
                    <div className="text-muted text-xs font-mono mt-0.5">{route.from} → {route.to}</div>
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
                animate={{ x: [0, 60, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-fit"
              >
                <Train className="w-10 h-10 text-blue-500" />
              </motion.div>
              <p className="text-slate-500 text-sm">Checking train availability...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-slate-900 font-semibold text-lg">{MOCK_TRAINS.length} trains found</h2>
                  <p className="text-slate-500 text-sm">{from.split('(')[0].trim()} → {to.split('(')[0].trim()} · {new Date(date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}</p>
                </div>
              </div>

              {/* AI tip */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-5 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm">
                  <span className="text-blue-700 font-semibold">AI Tip: </span>
                  The Rajdhani Express (12301) is the fastest on this route. Book 3A for best value — 54 seats available. Tatkal opens at 10 AM, one day before travel.
                </p>
              </motion.div>

              <div className="space-y-4">
                {MOCK_TRAINS.map((train, i) => (
                  <TrainCard
                    key={train.id}
                    train={train}
                    selectedClass={selectedClass}
                    onClassSelect={setSelectedClass}
                    onBook={handleBook}
                    i={i}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booked confirmation */}
        <AnimatePresence>
          {bookedTrain && (
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
                    {bookedTrain.train.name} · {TRAIN_CLASSES[bookedTrain.classCode]} · ₹{bookedTrain.classData.fare * passengers}
                  </p>
                </div>
                <button onClick={() => setBookedTrain(null)} className="text-slate-400 hover:text-slate-700">
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