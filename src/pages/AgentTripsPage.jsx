import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Users, Calendar, DollarSign, Sparkles, Clock,
  CheckCircle, AlertTriangle, Trash2, ChevronDown, ChevronUp,
  RefreshCw, FileText, Map, UserCheck, EyeOff, Undo2, Car,
  Phone, User, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import StaffNav from '../components/layout/StaffNav'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const VEHICLE_TYPES = [
  { value: 'Sedan', label: 'Sedan', capacity: 4 },
  { value: 'SUV', label: 'SUV / MUV', capacity: 6 },
  { value: 'Tempo Traveller', label: 'Tempo Traveller', capacity: 12 },
  { value: 'Mini Bus', label: 'Mini Bus', capacity: 20 },
  { value: 'Luxury SUV', label: 'Luxury SUV', capacity: 5 },
]

const STATUS_CONFIG = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200', label: 'Pending Review', dot: 'bg-amber-500' },
  accepted: { color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200', label: 'Accepted', dot: 'bg-blue-500' },
  reviewed: { color: 'text-sky-700', bg: 'bg-sky-50 border border-sky-200', label: 'Reviewed', dot: 'bg-sky-500' },
  booked: { color: 'text-green-700', bg: 'bg-green-50 border border-green-200', label: 'Booked', dot: 'bg-green-500' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50 border border-red-200', label: 'Cancelled', dot: 'bg-red-500' },
  pending_agent_review: { color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200', label: 'Pending Review', dot: 'bg-amber-500' },
}

const SEGMENT_ICONS = { flight: '✈️', train: '🚂', bus: '🚌', roadways: '🚗', hotel: '🏨' }

// ─── Driver Assignment Panel ─────────────────────────────────────────────────
function DriverPanel({ tripData, passengers, onSave }) {
  const [driverName, setDriverName] = useState(tripData?.driverName || '')
  const [driverPhone, setDriverPhone] = useState(tripData?.driverPhone || '')
  const [vehicleType, setVehicleType] = useState(tripData?.vehicleType || 'SUV')
  const [saving, setSaving] = useState(false)

  const vehicle = VEHICLE_TYPES.find(v => v.value === vehicleType) || VEHICLE_TYPES[1]
  const vehiclesNeeded = Math.ceil((passengers || 1) / vehicle.capacity)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ driverName, driverPhone, vehicleType, vehiclesNeeded })
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 rounded-2xl p-4 border"
      style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Car className="w-4 h-4 text-amber-600" />
        <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">Road Trip — Driver & Vehicle Assignment</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Driver Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              value={driverName} onChange={e => setDriverName(e.target.value)}
              placeholder="Enter driver's full name"
              className="w-full border border-slate-200 bg-white text-slate-800 pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Driver Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              value={driverPhone} onChange={e => setDriverPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-slate-200 bg-white text-slate-800 pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Vehicle Type</label>
          <select
            value={vehicleType} onChange={e => setVehicleType(e.target.value)}
            className="w-full border border-slate-200 bg-white text-slate-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          >
            {VEHICLE_TYPES.map(v => (
              <option key={v.value} value={v.value}>
                {v.label} ({v.capacity} seats)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Vehicles Needed</label>
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-amber-600" />
            {vehiclesNeeded} × {vehicleType}
            <span className="text-slate-400 text-xs font-normal">({passengers} pax)</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !driverName}
        className="px-4 py-2 rounded-xl text-sm font-bold transition-all text-white flex items-center gap-2 disabled:opacity-50" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        {saving ? 'Saving…' : 'Save Driver Details'}
      </button>
    </motion.div>
  )
}

// ─── Trip Card ───────────────────────────────────────────────────────────────
function TripCard({ entry, onUpdate, onDelete, onAccept, onIgnore, currentUserEmail }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(entry.agent_notes || '')
  const [status, setStatus] = useState(entry.status || 'pending')
  const [accepting, setAccepting] = useState(false)

  const trip = entry.trip_data || {}
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const isAccepted = entry.status === 'accepted'
  const isMine = entry.assigned_agent_email === currentUserEmail
  const hasRoad = trip.segments?.some(s => s.type === 'roadways')

  const handleAccept = async () => {
    setAccepting(true)
    await onAccept(entry.id)
    setAccepting(false)
  }

  const handleDriverSave = async (driverDetails) => {
    const updatedTrip = { ...trip, ...driverDetails }
    await onUpdate(entry.id, { trip_data: updatedTrip, status: 'reviewed', agent_name: currentUserEmail })
    toast.success('Driver details saved!')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      style={{
        borderColor: entry.status === 'pending_agent_review'
          ? 'rgba(247, 201, 72, 0.2)'
          : isAccepted && isMine
            ? 'rgba(0, 201, 177, 0.3)'
            : status === 'pending'
              ? 'rgba(247, 201, 72, 0.2)'
              : 'rgba(255,255,255,0.08)'
      }}
    >
      {/* Accepted by me — ocean top bar */}
      {isAccepted && isMine && (
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #00A896, #00C9B1, #45B7D1)' }} />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Customer info */}
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-slate-900"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #F7C948)' }}
            >
              {(entry.customer_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-slate-900 font-bold text-sm">{entry.customer_name || 'Unknown'}</h3>
                <span className="text-slate-400 text-xs">{entry.customer_email}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-blue-700 font-bold text-base">{trip.name || 'Unnamed Trip'}</span>
                {trip.isAI && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                    style={{ background: 'rgba(247,201,72,0.12)', border: '1px solid rgba(247,201,72,0.25)', color: '#F7C948' }}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trip.duration}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {trip.passengers} pax</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-700 font-bold">₹{trip.totalCost?.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(entry.saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: status + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color} flex items-center gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${entry.status === 'pending_agent_review' ? 'animate-pulse' : ''}`} />
              {cfg.label}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Segment pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {(trip.segments || []).slice(0, 5).map((seg, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-1"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {SEGMENT_ICONS[seg.type] || '📍'} {seg.from}{seg.to ? ` → ${seg.to}` : ''}
            </span>
          ))}
        </div>

        {/* Quick Accept/Ignore bar for pending trips */}
        {status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white disabled:opacity-60" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
            >
              {accepting
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <UserCheck className="w-4 h-4" />}
              {accepting ? 'Accepting…' : 'Accept Trip'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onIgnore(entry.id, entry.customer_name)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-white border border-slate-200 transition-all hover:border-red-300 hover:text-red-600 shadow-sm"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#7A9BB5' }}
            >
              <EyeOff className="w-4 h-4" /> Ignore
            </motion.button>
          </div>
        )}

        {/* Already accepted by this agent */}
        {isAccepted && isMine && (
          <div
            className="mt-3 px-3 py-2 rounded-xl text-sm flex items-center gap-2"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-semibold">You are the assigned travel partner for this trip</span>
          </div>
        )}

        {/* Accepted by another agent */}
        {isAccepted && !isMine && (
          <div
            className="mt-3 px-3 py-2 rounded-xl text-sm flex items-center gap-2"
            style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
          >
            <AlertCircle className="w-4 h-4 text-sky-600" />
            <span className="text-sky-700 text-xs">Assigned to <strong>{entry.assigned_agent_name}</strong></span>
          </div>
        )}
      </div>

      {/* ── Expanded Detail Panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t"
            style={{ borderColor: undefined }}
          >
            <div className="p-5 space-y-5">
              {/* AI suggestion */}
              {trip.costComparison && (
                <div
                  className="p-4 rounded-xl"
                  style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}
                >
                  <p className="text-amber-700 text-xs font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Route Suggestion
                  </p>
                  <p className="text-xs" style={{ color: '#B45309' }}>
                    {trip.costComparison.aiSuggestion}
                  </p>
                </div>
              )}

              {/* Places */}
              {trip.placesToVisit?.length > 0 && (
                <div>
                  <p className="text-slate-700 text-xs font-bold mb-2 uppercase tracking-wider">Places Requested</p>
                  <div className="flex gap-2 flex-wrap">
                    {trip.placesToVisit.slice(0, 6).map((p, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500"
                        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Driver panel for road trips */}
              {hasRoad && (
                <DriverPanel
                  tripData={trip}
                  passengers={trip.passengers}
                  onSave={handleDriverSave}
                />
              )}

              {/* Agent controls */}
              <div className="space-y-3 pt-3 border-t" style={{ borderColor: undefined }}>
                <p className="text-slate-700 text-xs font-bold uppercase tracking-wider">Agent Actions</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Update Status</label>
                    <select
                      value={status} onChange={e => setStatus(e.target.value)}
                      className="w-full border border-slate-200 bg-white text-slate-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="booked">Booked</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Trip Ref ID</label>
                    <div
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono"
                      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      {entry.id.slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Agent Notes</label>
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Add notes for this trip request…"
                    rows={2}
                    className="w-full border border-slate-200 bg-white text-slate-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate(entry.id, { status, agent_notes: notes })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
                  >
                    <CheckCircle className="w-4 h-4" /> Save Changes
                  </button>
                  <Link
                    to={`/trip-builder?agentView=${entry.id}`}
                    className="flex-1 py-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-sky-700 hover:bg-sky-100 transition-all"
                    style={{ borderColor: 'rgba(69,183,209,0.2)' }}
                  >
                    <Map className="w-4 h-4" /> View Trip
                  </Link>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition-all"
                    style={{ borderColor: 'rgba(255,107,107,0.2)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentTripsPage() {
  const { user, token } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [undoStack, setUndoStack] = useState([]) // { id, customerName, timeoutId }

  // Stable header factory — avoids stale closures without making authHeaders a dep
  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token])

  // ── Load Trips (manual refresh, e.g. button) ──
  const loadTrips = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/trips`, { headers: getAuthHeaders() })
      const data = await res.json()
      setTrips(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  // ── Initial load — fetch inline so the linter doesn't trace setState into the effect ──
  useEffect(() => {
    let cancelled = false
    const fetchTrips = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/api/trips`, { headers: getAuthHeaders() })
        const data = await res.json()
        if (!cancelled) setTrips(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) toast.error('Failed to load trips')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTrips()
    return () => { cancelled = true }
  }, [getAuthHeaders])

  // ── Accept Trip ──
  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${API}/api/trips/accept?id=${id}`, {
        method: 'PATCH', headers: getAuthHeaders(),
      })
      if (!res.ok) {
        const err = await res.json()
        if (res.status === 409) toast.error('Another agent already accepted this trip.')
        else toast.error(err.message || 'Failed to accept')
        return
      }
      toast.success('🎉 You are now the Travel Partner for this trip!', { duration: 4000 })
      loadTrips()
    } catch {
      toast.error('Network error accepting trip')
    }
  }

  // ── Ignore Trip (with 5s undo) ──
  const handleIgnore = (id, customerName) => {
    // Optimistically remove from view
    setTrips(prev => prev.filter(t => t.id !== id))

    const timeoutId = setTimeout(async () => {
      // Commit the ignore to DB
      try {
        await fetch(`${API}/api/trips/ignore?id=${id}`, {
          method: 'PATCH', headers: getAuthHeaders(),
        })
      } catch { /* fail silently */ }
      setUndoStack(prev => prev.filter(u => u.id !== id))
    }, 5000)

    setUndoStack(prev => [...prev, { id, customerName, timeoutId }])
  }

  const handleUndo = (id) => {
    const item = undoStack.find(u => u.id === id)
    if (!item) return
    clearTimeout(item.timeoutId)
    setUndoStack(prev => prev.filter(u => u.id !== id))
    loadTrips() // restore
    toast.success('Restored! Trip is back in your queue.')
  }

  // ── Update Trip ──
  const handleUpdate = async (id, fields) => {
    try {
      const res = await fetch(`${API}/api/trips?id=${id}`, {
        method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error()
      toast.success('Trip updated!')
      loadTrips()
    } catch {
      toast.error('Failed to update trip')
    }
  }

  // ── Delete Trip ──
  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/trips?id=${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      toast.success('Trip removed')
      loadTrips()
    } catch {
      toast.error('Failed to delete trip')
    }
  }

  const statusCounts = {
    all: trips.length,
    pending: trips.filter(t => t.status === 'pending').length,
    accepted: trips.filter(t => t.status === 'accepted').length,
    reviewed: trips.filter(t => t.status === 'reviewed').length,
    booked: trips.filter(t => t.status === 'booked').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
  }

  const filtered = filter === 'all'
    ? trips
    : trips.filter(t => t.status === filter)

  const myAccepted = trips.filter(t => t.status === 'accepted' && t.assigned_agent_email === user?.email)

  return (
    <div className="min-h-screen bg-slate-50 pt-36 pb-16 px-4">
      <StaffNav />
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">
                Customer Trip Requests
              </h1>
              <p className="text-slate-500">Review & accept trip requests — accepted trips assign you as Travel Partner</p>
            </div>
            <button
              onClick={loadTrips}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all shadow-sm"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* My Accepted banner */}
        {myAccepted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl"
            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            <p className="text-blue-700 font-bold text-sm flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4" /> You are the Travel Partner for {myAccepted.length} trip(s)
            </p>
            {myAccepted.map(t => (
              <div key={t.id} className="text-xs text-slate-500">
                • {t.customer_name} — {t.trip_data?.name || 'Unnamed Trip'}
              </div>
            ))}
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { key: 'pending', label: 'Pending', icon: AlertTriangle, color: 'text-amber-600' },
            { key: 'accepted', label: 'Accepted', icon: UserCheck, color: 'text-blue-600' },
            { key: 'reviewed', label: 'Reviewed', icon: FileText, color: 'text-sky-600' },
            { key: 'booked', label: 'Booked', icon: CheckCircle, color: 'text-green-600' },
            { key: 'cancelled', label: 'Cancelled', icon: Trash2, color: 'text-red-500' },
          ].map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 text-center cursor-pointer"
              onClick={() => setFilter(key)}
              style={{ borderColor: filter === key ? 'rgba(0,201,177,0.3)' : undefined }}
            >
              <Icon className={`w-4 h-4 ${color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${color}`}>{statusCounts[key]}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'accepted', 'reviewed', 'booked', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                filter === f ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{
                background: filter === f ? '#EFF6FF' : 'white',
                borderColor: filter === f ? '#93C5FD' : '#E2E8F0',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({statusCounts[f] ?? trips.length})
            </button>
          ))}
        </div>

        {/* Trip list */}
        {loading ? (
          <div className="text-center py-20">
            <div
              className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p className="text-slate-500">Loading trips…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Plane className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-800 font-display text-xl mb-2">No trip requests yet</h3>
            <p className="text-slate-500 text-sm">When customers save trips in Trip Builder, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map(entry => (
                <TripCard
                  key={entry.id}
                  entry={entry}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onAccept={handleAccept}
                  onIgnore={handleIgnore}
                  currentUserEmail={user?.email}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Undo Toast Stack ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full max-w-sm px-4">
        <AnimatePresence>
          {undoStack.map(({ id, customerName }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="w-full rounded-2xl p-4 shadow-card"
              style={{ background: 'white', border: '1px solid #FECACA' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-slate-800 text-sm font-semibold">Trip by {customerName} hidden</p>
                    <p className="text-slate-400 text-xs">Will be permanently ignored in 5s</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUndo(id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="undo-progress h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FF6B6B, #F7C948)' }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}