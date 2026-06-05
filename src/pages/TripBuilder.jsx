import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, Plane, Train, Bus, Building2, Trash2, Clock,  ChevronRight,
  CheckCircle, DollarSign, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateMultiModalTrip } from '../utils/multiModalApi'

// ── Segment types ─────────────────────────────────────────────────────────────
const SEGMENT_TYPES = [
  { id: 'flight', label: 'Flight', icon: Plane, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
  { id: 'train', label: 'Train', icon: Train, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  { id: 'bus', label: 'Bus', icon: Bus, color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
  { id: 'hotel', label: 'Hotel', icon: Building2, color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20' },
]

// ── Sample itinerary presets ──────────────────────────────────────────────────
const PRESET_TRIPS = [
  {
    id: 'golden-triangle',
    name: 'Golden Triangle',
    desc: 'Delhi → Agra → Jaipur → Delhi',
    duration: '6 days',
    icon: '🏛',
    segments: [
      { id: 'a', type: 'flight', from: 'Mumbai', to: 'Delhi', date: '20 Mar', detail: 'IndiGo 6E 204 · 06:00–08:10', price: 4299, icon: '✈️' },
      { id: 'b', type: 'hotel', from: 'Delhi', to: '', date: '20–21 Mar', detail: 'The Lalit New Delhi · 2 nights', price: 12000, icon: '🏨' },
      { id: 'c', type: 'train', from: 'Delhi', to: 'Agra', date: '22 Mar', detail: 'Shatabdi 12001 · 06:15–08:10', price: 645, icon: '🚂' },
      { id: 'd', type: 'hotel', from: 'Agra', to: '', date: '22–23 Mar', detail: 'Trident Agra · 1 night', price: 7800, icon: '🏨' },
      { id: 'e', type: 'bus', from: 'Agra', to: 'Jaipur', date: '23 Mar', detail: 'VRL Travels AC · 09:00–14:30', price: 550, icon: '🚌' },
      { id: 'f', type: 'hotel', from: 'Jaipur', to: '', date: '23–25 Mar', detail: 'Jai Mahal Palace · 2 nights', price: 18000, icon: '🏨' },
      { id: 'g', type: 'flight', from: 'Jaipur', to: 'Mumbai', date: '25 Mar', detail: 'Air India AI 473 · 18:30–20:15', price: 3800, icon: '✈️' },
    ],
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters',
    desc: 'Kochi → Alleppey → Kovalam',
    duration: '5 days',
    icon: '🌴',
    segments: [
      { id: 'a', type: 'flight', from: 'Delhi', to: 'Kochi', date: '15 Apr', detail: 'Vistara UK 861 · 07:30–10:45', price: 6200, icon: '✈️' },
      { id: 'b', type: 'hotel', from: 'Kochi', to: '', date: '15–16 Apr', detail: 'Taj Malabar Resort · 1 night', price: 9800, icon: '🏨' },
      { id: 'c', type: 'bus', from: 'Kochi', to: 'Alleppey', date: '16 Apr', detail: 'KSRTC · 08:00–09:30', price: 120, icon: '🚌' },
      { id: 'd', type: 'hotel', from: 'Alleppey', to: '', date: '16–18 Apr', detail: 'Houseboat (Kettuvallam) · 2 nights', price: 16000, icon: '🏨' },
      { id: 'e', type: 'bus', from: 'Alleppey', to: 'Kovalam', date: '18 Apr', detail: 'KSRTC · 10:00–13:30', price: 220, icon: '🚌' },
      { id: 'f', type: 'hotel', from: 'Kovalam', to: '', date: '18–20 Apr', detail: 'Leela Kovalam · 2 nights', price: 22000, icon: '🏨' },
      { id: 'g', type: 'flight', from: 'Trivandrum', to: 'Delhi', date: '20 Apr', detail: 'IndiGo 6E 841 · 11:00–14:00', price: 5600, icon: '✈️' },
    ],
  },
]

// ── Segment display component ─────────────────────────────────────────────────
function TripSegment({ segment, onRemove, index }) {
  const segType = SEGMENT_TYPES.find(t => t.id === segment.type) || SEGMENT_TYPES[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-4"
    >
      <div className="flex flex-col items-center flex-shrink-0 pt-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${segType.bg} ${segType.color} flex-shrink-0`}>
          <span className="text-base">{segment.icon}</span>
        </div>
        <div className="w-px flex-1 bg-border/40 mt-2 min-h-4" />
      </div>

      <div className="flex-1 pb-4 min-w-0">
        <div className="glass border border-border rounded-2xl p-4 transition-all hover:border-border/80">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider ${segType.color}`}>
                  {segType.label}
                </span>
                <span className="text-muted text-xs font-mono">{segment.date}</span>
              </div>
              <div className="text-white font-semibold text-sm mb-0.5">
                {segment.from}{segment.to ? ` → ${segment.to}` : ''}
              </div>
              <div className="text-muted text-xs">{segment.detail}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-gold-400 font-bold text-sm">₹{segment.price.toLocaleString()}</span>
              {onRemove && (
                <button
                  onClick={() => onRemove(segment.id)}
                  className="p-1.5 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main TripBuilder ──────────────────────────────────────────────────────────
export default function TripBuilder() {
  const [prompt, setPrompt] = useState('')
  const inputRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [activeTrip, setActiveTrip] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    setActiveTrip(null)

    try {
      // Now calls Groq via multiModalApi.js
      const trip = await generateMultiModalTrip(prompt)
      setActiveTrip({ ...trip, isAI: true })
      toast.success('Trip itinerary generated!')
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary. Check your VITE_GROQ_API_KEY.')
    } finally {
      setGenerating(false)
    }
  }

  const handlePreset = (preset) => {
    setActiveTrip({ ...preset, isAI: false })
    setError(null)
  }

  const removeSegment = (id) => {
    setActiveTrip(prev => ({
      ...prev,
      segments: prev.segments.filter(s => s.id !== id),
    }))
  }

  const totalCost = activeTrip?.segments?.reduce((sum, s) => sum + (s.price || 0), 0) || 0

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Trip Builder</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Multi-Modal Trip Builder</h1>
          <p className="text-muted">Describe your trip in plain language — AI combines flights, trains, buses & hotels.</p>
        </motion.div>

        {/* AI prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-6 mb-6"
        >
          <label className="text-xs text-muted uppercase tracking-wider mb-3 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Describe Your Trip (Groq AI)
          </label>
          <div 
            className="flex gap-3 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
              placeholder='e.g. "Plan a 6-day trip from Delhi covering Agra and Jaipur, budget ₹50,000, mid-March"'
              className="flex-1 bg-transparent text-white text-sm placeholder-muted resize-none outline-none min-h-[60px] leading-relaxed relative z-10"
              rows={2}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className={`px-5 py-3 font-bold rounded-xl flex items-center gap-2 self-end transition-all flex-shrink-0 ${
                !prompt.trim() || generating
                  ? 'bg-surface text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 to-gold-400 text-void shadow-gold-sm hover:shadow-gold'
              }`}
            >
              {generating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? 'Building...' : 'Generate'}
            </motion.button>
          </div>
          <p className="text-muted/50 text-xs mt-3">Powered by Groq LPU · Responses in ~2 seconds</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Presets */}
        {!activeTrip && !generating && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <h2 className="font-display text-xl font-bold text-white mb-4">Or start from a preset</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {PRESET_TRIPS.map(preset => (
                <motion.button
                  key={preset.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePreset(preset)}
                  className="glass border border-border hover:border-gold-400/20 rounded-2xl p-5 text-left transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{preset.icon}</span>
                    <div>
                      <div className="font-display text-white font-bold group-hover:text-gold-300 transition-colors">{preset.name}</div>
                      <div className="text-muted text-sm mb-2">{preset.desc}</div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {preset.duration}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                          ₹{preset.segments.reduce((s, seg) => s + seg.price, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold"
              >
                <Sparkles className="w-8 h-8 text-void" />
              </motion.div>
              <h3 className="font-display text-xl text-white mb-2">Building your itinerary...</h3>
              <p className="text-muted text-sm">Groq LPU is combining flights, trains, buses & hotels</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active trip */}
        <AnimatePresence>
          {activeTrip && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-2xl font-bold text-white">{activeTrip.name || activeTrip.tripName}</h2>
                    {activeTrip.isAI && (
                      <span className="px-2 py-0.5 bg-gold-400/15 border border-gold-400/20 text-gold-400 text-xs rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Groq AI
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm">{activeTrip.desc} · {activeTrip.duration}</p>
                </div>
                <button
                  onClick={() => setActiveTrip(null)}
                  className="px-3 py-2 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all"
                >
                  ← Back
                </button>
              </div>

              <div className="grid lg:grid-cols-[1fr_260px] gap-6">
                {/* Timeline */}
                <div>
                  <AnimatePresence>
                    {activeTrip.segments?.map((seg, i) => (
                      <TripSegment
                        key={seg.id}
                        segment={seg}
                        index={i}
                        onRemove={removeSegment}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Sidebar summary */}
                <div className="space-y-4">
                  <div className="glass border border-border rounded-2xl p-5 sticky top-28">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold-400" /> Trip Summary
                    </h3>

                    <div className="space-y-2 mb-4">
                      {SEGMENT_TYPES.map(type => {
                        const segs = activeTrip.segments?.filter(s => s.type === type.id) || []
                        if (!segs.length) return null
                        const subtotal = segs.reduce((s, seg) => s + seg.price, 0)
                        const TypeIcon = type.icon
                        return (
                          <div key={type.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`w-3.5 h-3.5 ${type.color}`} />
                              <span className="text-muted">{type.label} ({segs.length})</span>
                            </div>
                            <span className="text-white/80">₹{subtotal.toLocaleString()}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between mb-4">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-gold-400 font-bold text-lg">₹{totalCost.toLocaleString()}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toast.success('Itinerary saved to your bookings!')}
                      className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Save Itinerary
                    </motion.button>

                    <Link
                      to="/chat"
                      className="mt-3 w-full py-2.5 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Refine with AI
                    </Link>
                  </div>

                  {/* AI highlights */}
                  {activeTrip.highlights?.length > 0 && (
                    <div className="glass border border-gold-400/20 rounded-2xl p-4 bg-gold-400/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-gold-400" />
                        <span className="text-gold-300 font-semibold text-sm">Trip Highlights</span>
                      </div>
                      <ul className="space-y-1.5">
                        {activeTrip.highlights.map((h, i) => (
                          <li key={i} className="text-gold-200/70 text-xs flex items-start gap-1.5">
                            <span className="text-gold-400 mt-0.5">→</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI tips */}
                  {activeTrip.tips?.length > 0 && (
                    <div className="glass border border-border rounded-2xl p-4">
                      <div className="text-white text-sm font-semibold mb-2">💡 Travel Tips</div>
                      <ul className="space-y-1.5">
                        {activeTrip.tips.map((tip, i) => (
                          <li key={i} className="text-muted text-xs">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}