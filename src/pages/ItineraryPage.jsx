import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Sparkles, MapPin, Calendar, DollarSign,
  Sun, Moon, Coffee, Utensils,
  AlertTriangle, CheckCircle, ChevronDown, Plane,
  ArrowRight, Globe2, Shield, Package
} from 'lucide-react'
import { generateItinerary } from '../utils/aiItinerary'

function DayCard({ day, index }) {
  const [open, setOpen] = useState(index === 0)

  const slots = [
    { key: 'morning', label: 'Morning', icon: Coffee, color: 'text-amber-400' },
    { key: 'afternoon', label: 'Afternoon', icon: Sun, color: 'text-gold-400' },
    { key: 'evening', label: 'Evening', icon: Moon, color: 'text-sky-400' },
  ]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-400/10 border border-gold-400/20 flex flex-col items-center justify-center">
            <span className="text-gold-400 font-bold text-lg leading-none">{day.day}</span>
            <span className="text-gold-400/60 text-xs">Day</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{day.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-muted text-xs">{day.theme}</span>
              <span className="text-border">·</span>
              <span className="text-gold-400/70 text-xs font-medium">{day.estimatedDayBudget}</span>
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/40 pt-4 space-y-4">
              {/* Time slots */}
              {slots.map(({ key, label, icon: Icon, color }) => {
                const slot = day[key]
                if (!slot) return null
                return (
                  <div key={key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="w-px flex-1 bg-border/40 mt-2" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-xs font-medium ${color} uppercase tracking-wider`}>{label}</span>
                          <h4 className="font-semibold text-white mt-0.5">{slot.activity}</h4>
                          <p className="text-muted text-sm mt-1 leading-relaxed">{slot.description}</p>
                          {slot.tip && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-sky-300/70">
                              <span className="flex-shrink-0">💡</span> {slot.tip}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-white/60 text-xs">{slot.duration}</div>
                          <div className="text-gold-400/80 text-xs mt-0.5">{slot.cost}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Meals */}
              {day.meals && (
                <div className="p-4 bg-surface/50 rounded-xl border border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-sage-400" />
                    <span className="text-white text-sm font-semibold">Where to Eat</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[['breakfast', '🌅'], ['lunch', '☀️'], ['dinner', '🌙']].map(([meal, emoji]) => (
                      <div key={meal}>
                        <div className="text-muted capitalize mb-1">{emoji} {meal}</div>
                        <div className="text-white/80">{day.meals[meal]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport */}
              {day.transport && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300/70">{day.transport}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ItineraryPage() {
  const [searchParams] = useSearchParams()
  const destination = searchParams.get('dest') || 'Bangkok, Thailand'
  const days = parseInt(searchParams.get('days') || '5')
  const budget = searchParams.get('budget') || 'moderate'

  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('itinerary')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await generateItinerary({ destination, days, budget })
        setItinerary(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [destination, days, budget])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center mb-6 shadow-gold"
        >
          <Sparkles className="w-8 h-8 text-void" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Planning your trip…</h2>
        <div className="space-y-2 text-center">
          {[
            'Researching top attractions',
            'Curating local dining spots',
            'Calculating daily budgets',
            'Checking travel advisories',
          ].map((step, i) => (
            <motion.p
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.5 }}
              className="text-muted text-sm flex items-center gap-2 justify-center"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ delay: i * 0.5, duration: 0.4 }}
              >
                ✓
              </motion.span>
              {step}
            </motion.p>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Couldn't generate itinerary</h2>
          <p className="text-muted mb-4 text-sm">{error}</p>
          <Link to="/chat" className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-sm">
            Try AI Chat instead
          </Link>
        </div>
      </div>
    )
  }

  if (!itinerary) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">{itinerary.destination}</span>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                {itinerary.destination}
              </h1>
              <p className="text-muted max-w-xl leading-relaxed">{itinerary.summary}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/search"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm"
              >
                <Plane className="w-4 h-4" /> Book Flights
              </Link>
            </div>
          </div>

          {/* Trip stats */}
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { icon: Calendar, label: `${itinerary.totalDays} Days` },
              { icon: DollarSign, label: itinerary.budgetLevel },
              { icon: MapPin, label: itinerary.destination },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 glass border border-border rounded-xl text-sm text-muted">
                <Icon className="w-3.5 h-3.5 text-gold-400" />
                {label}
              </div>
            ))}
          </div>

          {/* Highlights */}
          {itinerary.highlights && (
            <div className="mt-4 flex flex-wrap gap-2">
              {itinerary.highlights.map(h => (
                <span key={h} className="px-3 py-1 bg-gold-400/10 border border-gold-400/20 text-gold-300 text-xs rounded-full">
                  ★ {h}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Warnings */}
        {itinerary.warnings?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 space-y-2"
          >
            {itinerary.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200/80 text-sm">{w}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {[
            { key: 'itinerary', label: 'Day by Day', icon: Calendar },
            { key: 'budget', label: 'Budget', icon: DollarSign },
            { key: 'practical', label: 'Travel Info', icon: Globe2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeSection === key
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Itinerary tab */}
          {activeSection === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {itinerary.days?.map((day, i) => (
                <DayCard key={day.day} day={day} index={i} />
              ))}
            </motion.div>
          )}

          {/* Budget tab */}
          {activeSection === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass border border-border rounded-2xl p-6"
            >
              <h2 className="font-display text-2xl font-bold text-white mb-5">Estimated Budget</h2>
              <div className="space-y-3">
                {itinerary.estimatedTotalBudget && Object.entries(itinerary.estimatedTotalBudget).map(([key, val]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-3 border-b border-border/40 last:border-0 ${
                      key === 'total' ? 'font-bold text-lg pt-4' : ''
                    }`}
                  >
                    <span className={key === 'total' ? 'text-white' : 'text-muted capitalize'}>{key}</span>
                    <span className={key === 'total' ? 'text-gold-400 text-xl' : 'text-white'}>{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Practical tab */}
          {activeSection === 'practical' && (
            <motion.div
              key="practical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {itinerary.practicalInfo && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      ['Best Time to Visit', itinerary.practicalInfo.bestTimeToVisit, Calendar],
                      ['Currency', itinerary.practicalInfo.currency, DollarSign],
                      ['Language', itinerary.practicalInfo.language, Globe2],
                      ['Emergency', itinerary.practicalInfo.emergencyNumbers, Shield],
                    ].map(([label, value, Icon]) => (
                      <div key={label} className="glass border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-gold-400" />
                          <span className="text-muted text-xs uppercase tracking-wider">{label}</span>
                        </div>
                        <p className="text-white text-sm">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Visa */}
                  <div className="glass border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-sky-400" />
                      <span className="text-white font-semibold">Visa Information</span>
                    </div>
                    <p className="text-muted text-sm">{itinerary.practicalInfo.visaInfo}</p>
                  </div>

                  {/* Packing tips */}
                  {itinerary.practicalInfo.packingTips && (
                    <div className="glass border border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-sage-400" />
                        <span className="text-white font-semibold">What to Pack</span>
                      </div>
                      <div className="space-y-1.5">
                        {itinerary.practicalInfo.packingTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-muted">
                            <CheckCircle className="w-3.5 h-3.5 text-sage-400 flex-shrink-0 mt-0.5" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 glass gradient-border rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h3 className="font-semibold text-white mb-1">Ready to book this trip?</h3>
            <p className="text-muted text-sm">VoyageAI will find the best flights for your dates.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/chat?dest=${destination}`}
              className="flex items-center gap-2 px-4 py-2.5 glass border border-gold-400/20 text-gold-400 text-sm font-medium rounded-xl"
            >
              <Sparkles className="w-4 h-4" /> Ask AI
            </Link>
            <Link
              to="/search"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm"
            >
              <Plane className="w-4 h-4" /> Search Flights <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
