import { useState, useEffect } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Plane, Clock, MapPin, CheckCircle, AlertTriangle,
  RefreshCw, ChevronRight, CloudRain, Wind,Sparkles, Eye, Zap,
  Thermometer, ArrowRight
} from 'lucide-react'

const FLIGHT_DATA = {
  code: 'AI 619',
  airline: 'Air India',
  logo: '🔴',
  from: 'DEL', fromCity: 'Delhi', fromFull: 'Indira Gandhi International',
  to: 'BOM', toCity: 'Mumbai', toFull: 'Chhatrapati Shivaji Maharaj International',
  scheduledDepart: '09:30',
  actualDepart: '09:42',
  scheduledArrive: '11:50',
  estimatedArrive: '12:02',
  status: 'airborne', // scheduled | boarding | departed | airborne | landed | delayed | cancelled
  delay: 12,
  gate: 'B14',
  terminal: 'T2',
  aircraft: 'Airbus A320',
  registration: 'VT-PPK',
  altitude: '37,000 ft',
  speed: '820 km/h',
  progress: 62, // percent
  departed: '09:42',
  distance: '1,148 km',
  remaining: '437 km',
  timeRemaining: '32 min',
}

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', icon: Clock },
  boarding: { label: 'Boarding', color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20', icon: Users },
  departed: { label: 'Departed', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: Plane },
  airborne: { label: 'In Flight', color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20', icon: Plane },
  landed: { label: 'Landed', color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20', icon: CheckCircle },
  delayed: { label: 'Delayed', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: AlertTriangle },
}

const TIMELINE_EVENTS = [
  { time: '09:15', label: 'Gate B14 opened for boarding', done: true },
  { time: '09:30', label: 'Scheduled departure', done: true, note: 'On time' },
  { time: '09:38', label: 'Pushback from gate', done: true },
  { time: '09:42', label: 'Wheels off (departed)', done: true, note: '+12 min delay' },
  { time: '10:15', label: 'Cruising altitude reached', done: true },
  { time: '11:30', label: 'Descent begins', done: false },
  { time: '12:02', label: 'Estimated landing (BOM)', done: false, active: true },
  { time: '12:15', label: 'Gate arrival & deboarding', done: false },
]

const WEATHER = {
  DEL: { temp: '24°C', condition: 'Partly Cloudy', wind: '12 km/h NW', visibility: '8 km', icon: '⛅' },
  BOM: { temp: '31°C', condition: 'Hazy', wind: '18 km/h SW', visibility: '5 km', icon: '🌫' },
}

// Animated flight path SVG
function FlightPath({ progress }) {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Ground */}
        <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(30,45,66,0.8)" strokeWidth="1" />

        {/* Dashed route path */}
        <path
          d={`M 20 80 Q 200 10 380 80`}
          fill="none"
          stroke="rgba(232,180,41,0.2)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />

        {/* Completed path */}
        <path
          d={`M 20 80 Q 200 10 380 80`}
          fill="none"
          stroke="rgba(232,180,41,0.7)"
          strokeWidth="2"
          strokeDasharray={`${progress * 4.4} 440`}
        />

        {/* Origin dot */}
        <circle cx="20" cy="80" r="5" fill="#E8B429" opacity="0.8" />
        <text x="20" y="95" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">DEL</text>

        {/* Destination dot */}
        <circle cx="380" cy="80" r="5" fill="rgba(232,180,41,0.3)" />
        <text x="380" y="95" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">BOM</text>

        {/* Animated plane on path */}
        {(() => {
          const t = progress / 100
          
          const cpx = 200, cpy = 10
          const bx = 20, by = 80, ex = 380, ey = 80
          const px = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cpx + t * t * ex
          const py = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cpy + t * t * ey

          // tangent angle
          const dx = 2 * (1 - t) * (cpx - bx) + 2 * t * (ex - cpx)
          const dy = 2 * (1 - t) * (cpy - by) + 2 * t * (ey - cpy)
          const angle = Math.atan2(dy, dx) * 180 / Math.PI

          return (
            <g transform={`translate(${px},${py}) rotate(${angle})`}>
              <circle r="8" fill="rgba(232,180,41,0.15)" />
              <text x="0" y="4" textAnchor="middle" fontSize="10">✈</text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

export default function FlightStatusPage() {
  const [flightCode, setFlightCode] = useState('AI 619')
  const [searched, setSearched] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const [aiTip, setAiTip] = useState('')

useEffect(() => {
  getAIRecommendation('Give a concise travel tip...')
    .then(setAiTip).catch(() => {})
}, [])

  const statusCfg = STATUS_CONFIG[FLIGHT_DATA.status]
  const StatusIcon = statusCfg.icon

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setLastRefresh(new Date())
    }, 1200)
  }

  // Auto-refresh every 60s
  useEffect(() => {
    const timer = setInterval(handleRefresh, 60000)
    return () => clearInterval(timer)
  }, [])

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
            <Link to="/post-booking" className="hover:text-gold-400 transition-colors">Manage Trip</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Flight Status</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Live Flight Status</h1>
          <p className="text-muted">Real-time tracking powered by AviationStack API</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass border border-border rounded-2xl p-4 mb-6 flex gap-3"
        >
          <div className="relative flex-1">
            <Plane className="absolute left-3 top-3 w-4 h-4 text-muted" />
            <input
              value={flightCode}
              onChange={e => setFlightCode(e.target.value)}
              placeholder="Flight number e.g. AI 619"
              className="ai-input w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setSearched(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-sm shadow-gold-sm flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Track
          </motion.button>
        </motion.div>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Status banner */}
            <div className={`flex items-center justify-between p-4 border rounded-2xl ${statusCfg.bg} flex-wrap gap-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${statusCfg.color}`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold text-lg ${statusCfg.color}`}>{statusCfg.label}</div>
                  <div className="text-muted text-xs">
                    {FLIGHT_DATA.status === 'airborne' && `${FLIGHT_DATA.timeRemaining} remaining · ETA ${FLIGHT_DATA.estimatedArrive}`}
                    {FLIGHT_DATA.delay > 0 && ` · ${FLIGHT_DATA.delay} min delay`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted text-xs">Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 0.8, ease: 'linear' }}
                  onClick={handleRefresh}
                  className="p-2 glass border border-border rounded-lg text-muted hover:text-white transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Main flight card */}
            <div className="glass gradient-border rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{FLIGHT_DATA.logo}</span>
                  <div>
                    <div className="text-white font-bold">{FLIGHT_DATA.airline}</div>
                    <div className="font-mono text-muted text-sm">{FLIGHT_DATA.code} · {FLIGHT_DATA.aircraft}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  <div>Reg: {FLIGHT_DATA.registration}</div>
                </div>
              </div>

              {/* Route & times */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-muted text-xs uppercase tracking-wider mb-1">Departed</div>
                  <div className="font-bold text-3xl text-white">{FLIGHT_DATA.actualDepart}</div>
                  <div className="font-mono text-gold-400 font-semibold">{FLIGHT_DATA.from}</div>
                  <div className="text-muted text-xs mt-1">{FLIGHT_DATA.fromFull}</div>
                  {FLIGHT_DATA.delay > 0 && (
                    <div className="text-amber-400 text-xs mt-0.5">+{FLIGHT_DATA.delay} min late</div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-muted text-xs mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {FLIGHT_DATA.timeRemaining} left
                  </div>
                  <FlightPath progress={FLIGHT_DATA.progress} />
                  <div className="text-gold-400 text-xs font-medium">{FLIGHT_DATA.progress}% complete</div>
                </div>

                <div className="text-right">
                  <div className="text-muted text-xs uppercase tracking-wider mb-1">Estimated Arrival</div>
                  <div className="font-bold text-3xl text-white">{FLIGHT_DATA.estimatedArrive}</div>
                  <div className="font-mono text-gold-400 font-semibold">{FLIGHT_DATA.to}</div>
                  <div className="text-muted text-xs mt-1">{FLIGHT_DATA.toFull}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-surface rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${FLIGHT_DATA.progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                />
              </div>

              {/* Live stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp, label: 'Altitude', value: FLIGHT_DATA.altitude, color: 'text-sky-400' },
                  { icon: Zap, label: 'Speed', value: FLIGHT_DATA.speed, color: 'text-gold-400' },
                  { icon: MapPin, label: 'Distance', value: FLIGHT_DATA.distance, color: 'text-sage-400' },
                  { icon: ArrowRight, label: 'Remaining', value: FLIGHT_DATA.remaining, color: 'text-muted' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="glass border border-border rounded-xl p-3 text-center">
                    <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                    <div className="text-white font-semibold text-sm">{value}</div>
                    <div className="text-muted text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Two column: timeline + weather */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Timeline */}
              <div className="glass border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-400" /> Flight Timeline
                </h3>
                <div className="space-y-0">
                  {TIMELINE_EVENTS.map(({ time, label, done, active, note }, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {i < TIMELINE_EVENTS.length - 1 && (
                        <div className={`absolute left-4 top-7 w-px h-full ${done ? 'bg-gold-400/30' : 'bg-border/40'}`} />
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 z-10 ${
                        done ? 'bg-gold-400/15 border border-gold-400/25' :
                        active ? 'bg-sage-400/15 border border-sage-400/25' :
                        'bg-surface border border-border'
                      }`}>
                        {done
                          ? <CheckCircle className="w-3.5 h-3.5 text-gold-400" />
                          : active
                          ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                              <Plane className="w-3.5 h-3.5 text-sage-400" />
                            </motion.div>
                          : <Clock className="w-3.5 h-3.5 text-muted/40" />
                        }
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${done ? 'text-white/70' : active ? 'text-white font-semibold' : 'text-muted'}`}>
                            {label}
                          </span>
                          {note && <span className="text-xs text-amber-400">{note}</span>}
                        </div>
                        <span className={`text-xs font-mono ${done ? 'text-gold-400/60' : 'text-muted/50'}`}>{time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div className="space-y-4">
                {Object.entries(WEATHER).map(([code, w]) => (
                  <div key={code} className="glass border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                      <span className="text-lg">{w.icon}</span>
                      Weather at {code === 'DEL' ? 'Delhi' : 'Mumbai'} ({code})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Thermometer, label: 'Temperature', value: w.temp },
                        { icon: CloudRain, label: 'Condition', value: w.condition },
                        { icon: Wind, label: 'Wind', value: w.wind },
                        { icon: Eye, label: 'Visibility', value: w.visibility },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2">
                          <Icon className="w-3.5 h-3.5 text-muted flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-muted text-xs">{label}</div>
                            <div className="text-white text-sm font-medium">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Gate info */}
                <div className="glass border border-gold-400/15 rounded-2xl p-5 bg-gold-400/5">
                  <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-400" /> Gate Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Terminal (DEL)</span>
                      <span className="text-white font-medium">{FLIGHT_DATA.terminal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Departure Gate</span>
                      <span className="text-white font-medium">{FLIGHT_DATA.gate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Arrival Gate (BOM)</span>
                      <span className="text-muted">To be announced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Needed for StatusIcon in STATUS_CONFIG
function TrendingUp({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function Users({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
