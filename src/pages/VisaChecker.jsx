import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, Search, CheckCircle, AlertTriangle, Clock,
  Globe2, ChevronRight, ArrowRight, Sparkles, Info,
  FileText, DollarSign, Calendar, RefreshCw, Users,
  ExternalLink, Plane
} from 'lucide-react'
// ✅ Now imports from multiModalApi.js which uses Groq internally
import { getVisaRequirements } from '../utils/multiModalApi'

const NATIONALITY_OPTIONS = [
  'Indian', 'Pakistani', 'Bangladeshi', 'Sri Lankan', 'Nepali',
  'American', 'British', 'Canadian', 'Australian', 'German',
  'French', 'Japanese', 'Chinese', 'Brazilian', 'South African',
]

const POPULAR_DESTINATIONS = [
  { name: 'Thailand', flag: '🇹🇭', typical: 'Visa on Arrival (30 days free for Indians)' },
  { name: 'Singapore', flag: '🇸🇬', typical: 'Visa required (e-Visa available)' },
  { name: 'Dubai (UAE)', flag: '🇦🇪', typical: 'Visa on Arrival (30 days, free for Indians)' },
  { name: 'Malaysia', flag: '🇲🇾', typical: 'Visa free for Indians (30 days)' },
  { name: 'Maldives', flag: '🇲🇻', typical: 'Visa on Arrival (30 days, free)' },
  { name: 'UK', flag: '🇬🇧', typical: 'Visa required (Standard Visitor Visa)' },
  { name: 'USA', flag: '🇺🇸', typical: 'Visa required (B1/B2 Tourist Visa)' },
  { name: 'Schengen (France)', flag: '🇫🇷', typical: 'Schengen Visa required' },
  { name: 'Japan', flag: '🇯🇵', typical: 'Visa required (eVisa available)' },
  { name: 'Australia', flag: '🇦🇺', typical: 'ETA / e-Visa required' },
  { name: 'Canada', flag: '🇨🇦', typical: 'Visa required' },
  { name: 'Sri Lanka', flag: '🇱🇰', typical: 'ETA online (free for Indians)' },
]

const VISA_TYPE_CONFIG = {
  'visa on arrival': { color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20', icon: CheckCircle, label: 'Visa on Arrival' },
  'e-visa': { color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', icon: Globe2, label: 'e-Visa' },
  'visa free': { color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20', icon: CheckCircle, label: 'Visa Free' },
  'visa required': { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: AlertTriangle, label: 'Visa Required' },
  'embassy visa': { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: AlertTriangle, label: 'Embassy Visa' },
}

function VisaResultCard({ data }) {
  const visaType = data.visaType?.toLowerCase() || 'visa required'
  const config = VISA_TYPE_CONFIG[visaType] || VISA_TYPE_CONFIG['visa required']
  const ConfigIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main status */}
      <div className={`glass border rounded-2xl p-6 ${config.bg}`}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${config.color}`}>
                <ConfigIcon className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-bold text-xl ${config.color}`}>{config.label}</div>
                <div className="text-muted text-sm">{data.nationality} → {data.destination}</div>
              </div>
            </div>
          </div>
          <span className="text-muted text-xs">Last updated: {data.lastUpdated}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Clock, label: 'Duration', value: data.duration || 'N/A' },
            { icon: DollarSign, label: 'Cost', value: data.cost || 'Free' },
            { icon: Calendar, label: 'Processing', value: data.processingTime || 'N/A' },
            { icon: RefreshCw, label: 'Entries', value: data.entries || 'Single' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass border border-white/10 rounded-xl p-3 text-center">
              <Icon className={`w-4 h-4 ${config.color} mx-auto mb-1`} />
              <div className="text-white font-semibold text-sm">{value}</div>
              <div className="text-muted text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transit visa warning */}
      {data.transitVisa?.required && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-bold mb-1">⚠ Transit Visa Required</p>
            <p className="text-red-200/70 text-sm leading-relaxed">{data.transitVisa.note}</p>
            {data.transitVisa.countries?.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {data.transitVisa.countries.map(c => (
                  <span key={c} className="px-2 py-0.5 bg-red-500/15 border border-red-500/20 text-red-300 text-xs rounded-full">{c}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Warnings */}
      {data.warnings?.length > 0 && (
        <div className="space-y-2">
          {data.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200/80 text-sm">{w}</p>
            </div>
          ))}
        </div>
      )}

      {/* Documents required */}
      {data.documentsRequired?.length > 0 && (
        <div className="glass border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold-400" /> Documents Required
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.documentsRequired.map((doc, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-sage-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/80">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to apply */}
      {data.whereToApply && (
        <div className="glass border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-sky-400" /> How to Apply
          </h3>
          <p className="text-muted text-sm mb-3">{data.whereToApply}</p>
          {data.onlineApplication && (
            <div className="flex items-center gap-2 text-sky-400 text-sm">
              <ExternalLink className="w-4 h-4" />
              <span>Online application available</span>
            </div>
          )}
          {data.validity && (
            <p className="text-muted text-sm mt-2">Visa validity: <span className="text-white">{data.validity}</span></p>
          )}
        </div>
      )}

      {/* Health requirements */}
      {data.healthRequirements?.length > 0 && (
        <div className="glass border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sage-400" /> Health Requirements
          </h3>
          {data.healthRequirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-sage-400 flex-shrink-0 mt-0.5" />
              <span className="text-white/80">{req}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {data.tips?.length > 0 && (
        <div className="p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 font-semibold text-sm">AI Travel Tips</span>
          </div>
          <ul className="space-y-1.5">
            {data.tips.map((tip, i) => (
              <li key={i} className="text-gold-200/70 text-xs flex items-start gap-1.5">
                <span className="text-gold-400 mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emergency contact */}
      {data.emergencyContact && (
        <p className="text-muted text-xs text-center">
          Emergency contact: <span className="text-white/70">{data.emergencyContact}</span>
        </p>
      )}
    </motion.div>
  )
}

// ── Main Visa Checker Page ────────────────────────────────────────────────────
export default function VisaChecker() {
  const [nationality, setNationality] = useState('Indian')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCheck = async (dest = destination) => {
    if (!dest || !nationality) return
    setLoading(true)
    setResult(null)
    setError(null)
    setDestination(dest)

    try {
      // getVisaRequirements now uses Groq via multiModalApi.js
      const data = await getVisaRequirements(nationality, dest)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not fetch visa requirements. Check your VITE_GROQ_API_KEY in .env')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Visa Checker</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Visa Requirements</h1>
          <p className="text-muted">AI-powered real-time visa info — documents, fees, transit rules and more.</p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-6 mb-8"
        >
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Your Passport / Nationality</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <select
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm appearance-none"
                >
                  {NATIONALITY_OPTIONS.map(n => (
                    <option key={n} value={n} className="bg-deep">{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Destination Country</label>
              <div className="relative">
                <Globe2 className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  placeholder="e.g. Thailand, Japan, UK..."
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleCheck()}
              disabled={loading || !destination}
              className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2 self-end transition-all ${
                !destination
                  ? 'bg-surface text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 to-gold-400 text-void shadow-gold-sm hover:shadow-gold'
              }`}
            >
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Search className="w-4 h-4" /></motion.div>
                : <Shield className="w-4 h-4" />
              }
              Check
            </motion.button>
          </div>
          <p className="text-muted/50 text-xs mt-3">Powered by Groq LPU · Results in ~2 seconds</p>
        </motion.div>

        {/* Popular destinations */}
        {!result && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h2 className="font-display text-xl font-bold text-white mb-4">Popular Destinations for {nationality} Passport</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {POPULAR_DESTINATIONS.map(dest => (
                <motion.button
                  key={dest.name}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheck(dest.name)}
                  className="glass border border-border hover:border-gold-400/20 rounded-2xl p-4 flex items-center gap-3 text-left transition-all group"
                >
                  <span className="text-2xl flex-shrink-0">{dest.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold group-hover:text-gold-300 transition-colors">{dest.name}</div>
                    <div className="text-muted text-xs truncate mt-0.5">{dest.typical}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-gold-400 transition-colors flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold"
              >
                <Shield className="w-8 h-8 text-void" />
              </motion.div>
              <h3 className="font-display text-xl text-white mb-2">Checking visa requirements...</h3>
              <p className="text-muted text-sm">Querying Groq AI for {nationality} → {destination}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold mb-1">Could not fetch visa info</p>
                <p className="text-red-200/60 text-sm">{error}</p>
                <p className="text-red-200/50 text-xs mt-2">Make sure your VITE_GROQ_API_KEY is set in .env</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl font-bold text-white">
                  {nationality} → {result.destination}
                </h2>
                <button
                  onClick={() => { setResult(null); setDestination('') }}
                  className="flex items-center gap-1.5 px-3 py-2 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all"
                >
                  <Search className="w-3.5 h-3.5" /> New Search
                </button>
              </div>

              <VisaResultCard data={result} />

              {/* Book flight CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 glass border border-gold-400/20 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 bg-gold-400/5"
              >
                <div>
                  <p className="text-white font-semibold">Ready to book your trip?</p>
                  <p className="text-muted text-sm">Search flights to {result.destination}</p>
                </div>
                <Link
                  to={`/search?to=${result.destination}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm"
                >
                  <Plane className="w-4 h-4" /> Search Flights <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}