import { useState} from 'react'
import { motion } from 'framer-motion'
import { getAllTrips, updateTripStatus, deleteTrip } from '../utils/tripStore'
import {
  Plane, Users, Calendar,
  DollarSign, Sparkles, Clock, CheckCircle, AlertTriangle,
  Trash2, ChevronDown, ChevronUp, RefreshCw, FileText, Map 
} from 'lucide-react'
import toast from 'react-hot-toast'
import StaffNav from '../components/layout/StaffNav'
import { Link } from 'react-router-dom'

const STATUS_CONFIG = {
  pending:   { color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20',  label: 'Pending Review' },
  reviewed:  { color: 'text-sky-400',    bg: 'bg-sky-400/10 border-sky-400/20',      label: 'Reviewed' },
  booked:    { color: 'text-sage-400',   bg: 'bg-sage-400/10 border-sage-400/20',    label: 'Booked' },
  cancelled: { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',      label: 'Cancelled' },
}

const SEGMENT_ICONS = {
  flight: '✈️', train: '🚂', bus: '🚌', roadways: '🚗', hotel: '🏨'
}

function TripCard({ entry, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(entry.agentNotes || '')
  const [status, setStatus] = useState(entry.status || 'pending')
  const cfg = STATUS_CONFIG[status]

  const handleSave = () => {
    onUpdate(entry.id, status, notes)
    toast.success('Trip updated!')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass border rounded-2xl overflow-hidden transition-all ${
        status === 'pending' ? 'border-amber-400/20' :
        status === 'booked'  ? 'border-sage-400/20' :
        status === 'cancelled' ? 'border-red-400/20' : 'border-border'
      }`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            {/* Customer avatar */}
            <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 font-bold text-sm">
                {entry.customer.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-bold text-sm">{entry.customer.name}</h3>
                <span className="text-muted text-xs">{entry.customer.email}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-gold-400 font-bold text-base">{entry.trip.name}</span>
                {entry.trip.isAI && (
                  <span className="px-2 py-0.5 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-[10px] rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI Generated
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {entry.trip.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {entry.trip.passengers} passenger{entry.trip.passengers > 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-gold-400" />
                  <span className="text-gold-400 font-bold">₹{entry.trip.totalCost.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(entry.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 glass border border-border rounded-xl text-muted hover:text-white transition-all"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Segment pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {entry.trip.segments.map((seg, i) => (
            <span key={i} className="px-2 py-1 glass border border-border rounded-lg text-xs text-muted flex items-center gap-1">
              {SEGMENT_ICONS[seg.type] || '📍'}
              {seg.from}{seg.to ? ` → ${seg.to}` : ''} · ₹{seg.price?.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border/50 p-5 space-y-5"
        >
          {/* Cost breakdown */}
          {entry.trip.costComparison && (
            <div className="p-4 bg-gold-400/5 border border-gold-400/20 rounded-xl">
              <p className="text-gold-300 text-xs font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Route Suggestion
              </p>
              <p className="text-gold-200/70 text-xs leading-relaxed">{entry.trip.costComparison.aiSuggestion}</p>
            </div>
          )}

          {/* Places to visit */}
          {entry.trip.placesToVisit?.length > 0 && (
            <div>
              <p className="text-white text-xs font-bold mb-2 uppercase tracking-wider">Places Requested</p>
              <div className="flex gap-2 flex-wrap">
                {entry.trip.placesToVisit.slice(0, 6).map((p, i) => (
                  <span key={i} className="px-2.5 py-1 glass border border-border rounded-lg text-xs text-muted">
                    {p.name}
                  </span>
                ))}
                {entry.trip.placesToVisit.length > 6 && (
                  <span className="px-2.5 py-1 glass border border-border rounded-lg text-xs text-muted">
                    +{entry.trip.placesToVisit.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Agent controls */}
          <div className="space-y-3 pt-3 border-t border-border/50">
            <p className="text-white text-xs font-bold uppercase tracking-wider">Agent Actions</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted uppercase font-bold block mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="pending" className="bg-deep">Pending Review</option>
                  <option value="reviewed" className="bg-deep">Reviewed</option>
                  <option value="booked" className="bg-deep">Booked</option>
                  <option value="cancelled" className="bg-deep">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase font-bold block mb-1">Ref ID</label>
                <div className="px-3 py-2 glass border border-border rounded-xl text-sm text-muted font-mono">
                  {entry.id.slice(-8).toUpperCase()}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted uppercase font-bold block mb-1">Agent Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes for this trip request..."
                rows={2}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm text-white outline-none resize-none focus:border-gold-400"
              />
            </div>

            <div className="flex gap-2">
  <button
    onClick={handleSave}
    className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-sm flex items-center justify-center gap-2"
  >
    <CheckCircle className="w-4 h-4" /> Save Changes
  </button>
  <Link
    to={`/trip-builder?agentView=${entry.id}`}
    className="flex-1 py-2.5 glass border border-sky-400/20 text-sky-400 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-sky-400/10 transition-all"
  >
    <Map className="w-4 h-4" /> View in Trip Builder
  </Link>
  <button
    onClick={() => onDelete(entry.id)}
    className="p-2.5 glass border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
  >
    <Trash2 className="w-4 h-4" />
  </button>
</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AgentTripsPage() {
  
  const [filter, setFilter] = useState('all')

  const [trips, setTrips] = useState(() => getAllTrips().reverse())
  const load = () => setTrips(getAllTrips().reverse())

  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter)

  const counts = {
    all: trips.length,
    pending: trips.filter(t => t.status === 'pending').length,
    reviewed: trips.filter(t => t.status === 'reviewed').length,
    booked: trips.filter(t => t.status === 'booked').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
  }

  const handleUpdate = (id, status, notes) => {
    updateTripStatus(id, status, notes)
    load()
  }

  const handleDelete = (id) => {
    deleteTrip(id)
    load()
    toast.success('Trip removed')
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <StaffNav />
      <div className="max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Customer Trip Requests</h1>
          <p className="text-muted">All trips built by customers via Trip Builder — review, annotate and act.</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: 'pending', label: 'Pending', color: 'text-amber-400', icon: AlertTriangle },
            { key: 'reviewed', label: 'Reviewed', color: 'text-sky-400', icon: FileText },
            { key: 'booked', label: 'Booked', color: 'text-sage-400', icon: CheckCircle },
            { key: 'cancelled', label: 'Cancelled', color: 'text-red-400', icon: Trash2 },
          ].map(({ key, label, color, icon: Icon }) => (
            <div key={key} className="glass border border-border rounded-2xl p-4">
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <div className={`text-2xl font-bold ${color}`}>{counts[key]}</div>
              <div className="text-muted text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'reviewed', 'booked', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === f
                  ? 'bg-gold-400/15 border-gold-400/30 text-gold-400'
                  : 'glass border-border text-muted hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] ?? trips.length})
            </button>
          ))}
          <button onClick={load} className="ml-auto p-1.5 glass border border-border rounded-xl text-muted hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Trip list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 glass border border-border rounded-3xl">
            <Plane className="w-12 h-12 text-muted/20 mx-auto mb-4" />
            <h3 className="text-white font-display text-xl mb-2">No trip requests yet</h3>
            <p className="text-muted text-sm">When customers save trips in Trip Builder, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(entry => (
              <TripCard
                key={entry.id}
                entry={entry}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}