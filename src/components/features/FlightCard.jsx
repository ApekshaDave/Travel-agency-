import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, Star, ChevronDown, ArrowRight, Plane, CheckCircle } from 'lucide-react'

export default function FlightCard({ flight, onSelect, variant = 'search' }) {
  const [expanded, setExpanded] = useState(false)

  const isChat = variant === 'chat'

  if (isChat) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass border border-border hover:border-gold-400/30 rounded-2xl p-4 cursor-pointer group transition-all duration-200"
        onClick={() => onSelect(flight)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center">
              <span className="text-lg">{flight.logo || '✈️'}</span>
            </div>
            <span className="font-semibold text-white text-sm">{flight.airline}</span>
            {flight.recommended && (
              <span className="px-2 py-0.5 bg-gold-400/15 text-gold-400 text-xs rounded-full font-medium border border-gold-400/20">
                Best Value
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-gold-400 text-lg">₹{flight.price.toLocaleString()}</div>
            <div className="text-muted text-xs">{flight.class}</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="font-semibold text-white">{flight.depart}</div>
            <div className="text-muted text-xs">{flight.from}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted text-xs mb-1">
              <Clock className="w-3 h-3" /> {flight.duration}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-10 h-px bg-border" />
              <Plane className="w-3 h-3 text-muted" />
              <div className="w-10 h-px bg-border" />
            </div>
            <div className="text-muted text-xs mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">{flight.arrive}</div>
            <div className="text-muted text-xs">{flight.to}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(flight.amenities || []).slice(0, 2).map(a => (
              <span key={a} className="text-xs text-muted flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-sage-400" /> {a}
              </span>
            ))}
          </div>
          <span className="text-xs text-gold-400 font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
            Select <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>
    )
  }

  // Standard/Search variant
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass border rounded-2xl overflow-hidden transition-all duration-300 ${
        flight.recommended ? 'border-gold-400/30' : 'border-border hover:border-border/80'
      }`}
    >
      {flight.recommended && (
        <div className="px-5 py-2 bg-gradient-to-r from-gold-400/10 to-transparent border-b border-gold-400/20 flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="text-xs text-gold-300 font-medium">Recommended by VoyageAI</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Airline */}
          <div className="flex items-center gap-2 w-28">
            <span className="text-2xl">{flight.logo}</span>
            <div>
              <div className="text-white text-sm font-semibold">{flight.airline}</div>
              <div className="text-muted text-xs font-mono">{flight.code}</div>
            </div>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-3 min-w-48">
            <div className="text-center">
              <div className="text-white font-bold text-xl">{flight.depart}</div>
              <div className="text-muted text-xs font-mono">{flight.from}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-muted text-xs mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {flight.duration}
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-gradient-to-r from-border to-gold-400/30" />
                <Plane className="w-3.5 h-3.5 text-gold-400" />
                <div className="flex-1 h-px bg-gradient-to-r from-gold-400/30 to-border" />
              </div>
              <div className="text-muted text-xs mt-1">{flight.stops === 0 ? '✓ Direct' : `${flight.stops} stop`}</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-xl">{flight.arrive}</div>
              <div className="text-muted text-xs font-mono">{flight.to}</div>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <div className="text-gold-400 font-bold text-2xl">₹{flight.price.toLocaleString()}</div>
              <div className="text-muted text-xs">{flight.class} · {flight.seats || 5} seats left</div>
              {flight.tag && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-surface text-xs text-gold-400 border border-gold-400/20 rounded-full">
                  {flight.tag}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(flight)}
              className="px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm hover:shadow-gold transition-all duration-200 flex items-center gap-2"
            >
              Select <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Amenities + expand */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex gap-4">
            {(flight.amenities || []).map(a => (
              <span key={a} className="text-xs text-muted flex items-center gap-1">
                <Zap className="w-3 h-3 text-sage-400" /> {a}
              </span>
            ))}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
          >
            Details <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted text-xs mb-1">Baggage</div>
                  <div className="text-white">{flight.baggage || '15kg cabin + 15kg check-in'}</div>
                </div>
                <div>
                  <div className="text-muted text-xs mb-1">Cancellation</div>
                  <div className="text-white">₹3,500 fee</div>
                </div>
                <div>
                  <div className="text-muted text-xs mb-1">Date Change</div>
                  <div className="text-white">₹2,000 + fare diff</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
