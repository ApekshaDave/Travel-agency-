import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Plane, Calendar, Clock, CheckCircle, 
  Download, RefreshCw, ChevronRight,
  MapPin, Star, TrendingUp, Sparkles, 
  ArrowRight, Bell, Shield, Map,
  XCircle, UserCheck, Ban, Wifi, Phone, Mail,
  Building2, Briefcase, MessageSquare, Hotel, Coffee,
  Car, ChevronDown, Users, IndianRupee, Tag, Edit3, FileText, Trash2
} from 'lucide-react'
import { getCustomerTrips, syncTripsWithSupabase } from '../utils/tripStore'
import { useAuth } from '../context/AuthContext'

// ─── Notification builder ────────────────────────────────────────────────────
function buildDynamicNotifications(customerTrips) {
  const notes = []
  customerTrips.forEach((entry) => {
    const tripName = entry.trip?.name || 'Your trip'
    const agentName = entry.assignedAgentName || entry.agentName || 'An agent'
    const time = entry.updatedAt
      ? new Date(entry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : ''

    if (entry.status === 'accepted' && entry.assignedAgentName)
      notes.push({ id: `accepted-${entry.id}`, type: 'success', icon: UserCheck, text: `${agentName} has accepted and is managing "${tripName}".`, time })
    if (entry.agentSentBack)
      notes.push({ id: `sentback-${entry.id}`, type: 'info', icon: RefreshCw, text: `Agent updated your itinerary for "${tripName}". Review the changes.`, time })
    if (entry.status === 'cancelled')
      notes.push({ id: `cancelled-${entry.id}`, type: 'error', icon: Ban, text: `"${tripName}" has been cancelled.${entry.cancelReason ? ` Reason: ${entry.cancelReason}` : ''}`, time })
    if (entry.status === 'rejected')
      notes.push({ id: `rejected-${entry.id}`, type: 'error', icon: XCircle, text: `Your request for "${tripName}" was declined.${entry.rejectReason ? ` Reason: ${entry.rejectReason}` : ''}`, time })
    if (entry.status === 'error' || entry.bookingError)
      notes.push({ id: `error-${entry.id}`, type: 'error', icon: Wifi, text: `A technical error occurred with "${tripName}". Please retry or contact support.`, time })
    if (entry.status === 'approved' || entry.status === 'confirmed')
      notes.push({ id: `approved-${entry.id}`, type: 'success', icon: CheckCircle, text: `"${tripName}" is confirmed! Your booking is all set.`, time })
    if (entry.status === 'pending' && !entry.agentSentBack && !entry.assignedAgentName)
      notes.push({ id: `pending-${entry.id}`, type: 'info', icon: Bell, text: `Waiting for an agent to pick up "${tripName}".`, time })
  })
  return notes
}

// ─── Icon helper for itinerary item types ────────────────────────────────────
function itemIcon(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('flight') || t.includes('air'))  return <Plane    className="w-3.5 h-3.5 text-blue-500"   />
  if (t.includes('hotel') || t.includes('stay'))  return <Hotel    className="w-3.5 h-3.5 text-purple-500" />
  if (t.includes('car')   || t.includes('cab')
                           || t.includes('transfer')) return <Car  className="w-3.5 h-3.5 text-orange-500" />
  if (t.includes('food')  || t.includes('meal')
                           || t.includes('dining'))   return <Coffee className="w-3.5 h-3.5 text-amber-500" />
  if (t.includes('activity') || t.includes('tour')
                             || t.includes('visit'))  return <MapPin className="w-3.5 h-3.5 text-green-500" />
  return <Tag className="w-3.5 h-3.5 text-slate-400" />
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: { label: '✓ Confirmed',  cls: 'bg-green-50 text-green-600 border-green-100'  },
    approved:  { label: '✓ Approved',   cls: 'bg-green-50 text-green-600 border-green-100'  },
    accepted:  { label: '✓ Accepted',   cls: 'bg-blue-50  text-blue-600  border-blue-100'   },
    booked:    { label: '✓ Booked',     cls: 'bg-blue-50  text-blue-600  border-blue-100'   },
    pending:   { label: '⏳ Pending',   cls: 'bg-amber-50 text-amber-600 border-amber-100'  },
    cancelled: { label: '✕ Cancelled', cls: 'bg-red-50   text-red-500   border-red-100'    },
    rejected:  { label: '✕ Rejected',  cls: 'bg-red-50   text-red-500   border-red-100'    },
    error:     { label: '⚠ Error',     cls: 'bg-red-50   text-red-500   border-red-100'    },
  }
  const s = map[status] || { label: status, cls: 'bg-slate-50 text-slate-500 border-slate-200' }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.cls}`}>{s.label}</span>
  )
}

// ─── Destination Card ────────────────────────────────────────────────────────
function DestinationCard({ entry }) {
  const [open, setOpen] = useState(false)

  const trip        = entry.trip || {}
  const destination = trip.destination || trip.name || 'Trip'
  const duration    = trip.duration    || ''
  const totalCost   = trip.totalCost
  const startDate   = trip.startDate   || trip.departureDate || ''
  const endDate     = trip.endDate     || ''
  const travelers   = trip.travelers   || trip.passengers    || ''
  const items       = trip.items       || trip.itinerary     || trip.flights || []

  // Agent
  const agentName     = entry.assignedAgentName
  const agentPhone    = entry.assignedAgentPhone
  const agentEmail    = entry.assignedAgentEmail
  const agentPosition = entry.position
  const agentAgency   = entry.agencyName
  const hasAgent      = !!(agentName)

  // Format date range nicely
  const dateLabel = startDate
    ? endDate
      ? `${new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
    >
      {/* ── Collapsed header — always visible ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Destination icon circle */}
          <div
            className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #3B82F6 100%)' }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-display font-bold text-slate-900 text-lg leading-tight truncate">
                {destination}
              </h3>
              <StatusBadge status={entry.status} />
              {entry.agentSentBack && (
                <span className="px-2 py-0.5 bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-bold rounded-full">
                  Agent Updated
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {dateLabel && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" /> {dateLabel}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" /> {duration}
                </span>
              )}
              {travelers && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" /> {travelers} {typeof travelers === 'number' ? 'traveller' + (travelers !== 1 ? 's' : '') : ''}
                </span>
              )}
              {totalCost && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <IndianRupee className="w-3 h-3" /> {Number(totalCost).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/trip-builder?view=${entry.id}`}
            onClick={e => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all"
          >
            <Map className="w-3.5 h-3.5" /> Full View
          </Link>
          <div className={`p-2 rounded-xl bg-slate-50 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* ── Expanded itinerary ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-5">

              {/* Itinerary items */}
              {items.length > 0 ? (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Itinerary</p>
                  <div className="space-y-2">
                    {items.map((item, idx) => {
                      const label    = item.name  || item.title   || item.description || item.type || `Item ${idx + 1}`
                      const detail   = item.detail || item.info   || item.note        || ''
                      const itemDate = item.date   || item.dateTime || item.time       || ''
                      const price    = item.price  || item.cost    || item.fare        || ''
                      const from     = item.from   || item.origin  || ''
                      const to       = item.to     || item.destination || ''
                      const pnr      = item.pnr    || item.bookingRef  || ''
                      const seat     = item.seat   || item.seatNo      || ''

                      return (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50/40 hover:border-blue-100 transition-all"
                        >
                          <div className="flex-shrink-0 w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                            {itemIcon(item.type || item.category || label)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <span className="text-slate-900 font-semibold text-sm">{label}</span>
                              {price && (
                                <span className="text-blue-600 font-bold text-xs flex-shrink-0">
                                  ₹{Number(price).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Flight-style from → to */}
                            {(from || to) && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-slate-600 font-mono">{from}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-600 font-mono">{to}</span>
                              </div>
                            )}

                            {/* Extra meta */}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                              {itemDate && <span className="text-xs text-slate-400">{itemDate}</span>}
                              {detail   && <span className="text-xs text-slate-500">{detail}</span>}
                              {pnr      && <span className="text-xs text-slate-400 font-mono">PNR: {pnr}</span>}
                              {seat     && <span className="text-xs text-slate-400">Seat {seat}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Itinerary details will appear here once your trip is confirmed.</p>
                </div>
              )}

              {/* Agent details */}
              {hasAgent && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Agent</p>
                  <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Name</div>
                      <div className="text-slate-900 font-semibold text-sm">{agentName}</div>
                    </div>
                    {agentPosition && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Position
                        </div>
                        <div className="text-slate-700 text-sm">{agentPosition}</div>
                      </div>
                    )}
                    {agentAgency && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Agency
                        </div>
                        <div className="text-slate-700 text-sm">{agentAgency}</div>
                      </div>
                    )}
                    {agentPhone && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Phone</div>
                        <a href={`tel:${agentPhone}`} className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {agentPhone}
                        </a>
                      </div>
                    )}
                    {agentEmail && (
                      <div className="col-span-2">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Email</div>
                        <a href={`mailto:${agentEmail}`} className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {agentEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={`/trip-builder?view=${entry.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Map className="w-3.5 h-3.5" /> View Full Trip
                </Link>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl hover:border-slate-300 transition-all">
                  <Download className="w-3.5 h-3.5 text-blue-500" /> Download
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl hover:border-slate-300 transition-all">
                  <RefreshCw className="w-3.5 h-3.5 text-orange-500" /> Modify
                </button>
                <Link
                  to="/chat"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl hover:border-blue-100 hover:text-blue-600 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Ask AI
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


// ─── Draft Card ──────────────────────────────────────────────────────────────
function DraftCard({ draft, onDelete }) {
  const trip       = draft.trip || {}
  const name       = trip.name || trip.destination || 'Trip Plan'
  const duration   = trip.duration || ''
  const totalCost  = trip.totalCost
  const days       = trip.itineraryDays?.length || 0
  const segments   = trip.segments?.length || 0
  const highlights = trip.highlights || []
  const created    = draft.createdAt
    ? new Date(draft.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-dashed border-blue-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
    >
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)' }}
          >
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-slate-900 text-base leading-tight truncate">{name}</h3>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-600 border-amber-100">✎ Draft</span>
            </div>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {created && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /> Saved {created}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" /> {duration}
                </span>
              )}
              {days > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {days} day{days !== 1 ? 's' : ''} planned
                </span>
              )}
              {totalCost && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <IndianRupee className="w-3 h-3" /> {Number(totalCost).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {highlights.slice(0, 2).map((h, i) => (
                  <span key={i} className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{h}</span>
                ))}
                {highlights.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{highlights.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              localStorage.setItem('voyageai_active_trip', JSON.stringify(draft.itinerary))
              window.location.href = '/review-trip'
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" /> Full View
          </button>
          <button
            onClick={() => onDelete(draft.id)}
            className="p-2 text-slate-300 hover:text-red-400 transition-colors rounded-xl hover:bg-red-50"
            title="Delete draft"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {segments > 0 && (
        <div className="border-t border-dashed border-blue-100 px-5 py-3 bg-blue-50/40">
          <div className="flex items-center gap-4 flex-wrap text-[11px] text-slate-500">
            {trip.segments?.filter(s => s.type === 'flight').length > 0 && (
              <span className="flex items-center gap-1">
                <Plane className="w-3 h-3 text-blue-500" />
                {trip.segments.filter(s => s.type === 'flight').length} flight{trip.segments.filter(s => s.type === 'flight').length > 1 ? 's' : ''}
              </span>
            )}
            {trip.segments?.filter(s => s.type === 'hotel').length > 0 && (
              <span className="flex items-center gap-1">
                <Hotel className="w-3 h-3 text-purple-500" />
                {trip.segments.filter(s => s.type === 'hotel').length} hotel{trip.segments.filter(s => s.type === 'hotel').length > 1 ? 's' : ''}
              </span>
            )}
            {trip.placesToVisit?.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-500" />
                {trip.placesToVisit.length} attraction{trip.placesToVisit.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('all')
  const { user } = useAuth()
  const [customerTrips, setCustomerTrips] = useState(() => user ? getCustomerTrips(user.id) : [])
  const [, setLoadingSync] = useState(false)
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('voyageai_trip_drafts') || '[]') } catch { return [] }
  })

  const deleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id)
    setDrafts(updated)
    localStorage.setItem('voyageai_trip_drafts', JSON.stringify(updated))
  }

  useEffect(() => {
    if (!user) return
    const sync = async () => {
      setLoadingSync(true)
      try {
        const synced = await syncTripsWithSupabase()
        setCustomerTrips(synced.filter(t => t.customer.id === user.id).reverse())
      } catch (err) {
        console.error('Failed to sync customer trips:', err)
      } finally {
        setLoadingSync(false)
      }
    }
    sync()
  }, [user])

  const agentUpdatedTrips     = customerTrips.filter(t => t.agentSentBack)
  const acceptedTrip          = customerTrips.find(t => t.status === 'accepted' && t.assignedAgentName)
  const dynamicNotifications  = buildDynamicNotifications(customerTrips)

  const agentMessages = customerTrips
    .filter(t => t.agentMessage)
    .map(t => ({
      id: t.id,
      tripName: t.trip?.name || t.trip?.destination || 'Your trip',
      agentName: t.assignedAgentName || t.agentName || 'Your Agent',
      message: t.agentMessage,
      time: t.updatedAt
        ? new Date(t.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : '',
    }))
    .reverse()

  // Tab filtering — based on trip status
  const ACTIVE_STATUSES    = ['upcoming', 'accepted', 'confirmed', 'approved', 'booked', 'pending']
  const COMPLETED_STATUSES = ['completed', 'cancelled', 'rejected']

  const filteredTrips = customerTrips.filter(t => {
    if (activeTab === 'all')       return true
    if (activeTab === 'upcoming')  return ACTIVE_STATUSES.includes(t.status)
    if (activeTab === 'completed') return COMPLETED_STATUSES.includes(t.status)
    return true
  })

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-surface-light">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between flex-wrap gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold text-slate-900 mb-1">My Trips</h1>
            <p className="text-slate-500">Your travel plans, itineraries and bookings</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-500" /> AI Assistant
            </Link>
            <Link
              to="/passenger-details"
              className="flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl shadow-sm text-white transition-all hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
            >
              <Plane className="w-4 h-4" /> New Booking
            </Link>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Trips',  value: customerTrips.length, icon: Plane,       color: 'text-blue-500',   bg: 'bg-blue-50'  },
            { label: 'Miles Flown',  value: '4,280',              icon: TrendingUp,  color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Savings',      value: '₹3,200',             icon: Star,        color: 'text-green-500',  bg: 'bg-green-50'  },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="font-bold text-xl text-slate-900">{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* ── Left column ── */}
          <div className="space-y-6">

            {/* Agent-updated banner */}
            {agentUpdatedTrips.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Agent Updated Your Itineraries
                </h2>
                <div className="space-y-3">
                  {agentUpdatedTrips.map(entry => (
                    <div key={entry.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-900 font-bold text-sm">
                              {entry.trip?.destination || entry.trip?.name}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-600 text-[10px] rounded-full font-bold">Updated by Agent</span>
                          </div>
                          <p className="text-slate-500 text-xs">
                            {entry.trip?.duration} · ₹{entry.trip?.totalCost?.toLocaleString()} · Updated by {entry.agentName}
                          </p>
                        </div>
                        <Link
                          to={`/trip-builder?view=${entry.id}`}
                          className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Map className="w-3.5 h-3.5" /> View Trip
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trips list */}
            <div>
              {/* Tabs */}
              <div className="flex gap-1 mb-5 flex-wrap">
                {['all', 'upcoming', 'completed', 'drafts'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                      activeTab === tab
                        ? tab === 'drafts'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                    {tab === 'all' && customerTrips.length > 0 && (
                      <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                        {customerTrips.length}
                      </span>
                    )}
                    {tab === 'drafts' && drafts.length > 0 && (
                      <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                        {drafts.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* ── Drafts tab ── */}
                {activeTab === 'drafts' && (
                  <>
                    {drafts.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-600 font-semibold">No saved drafts</p>
                        <p className="text-slate-400 text-sm mt-1 mb-4">Drafts appear here when you click "Review & Confirm Booking" in Trip Builder</p>
                        <Link
                          to="/trip-builder"
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                        >
                          <Sparkles className="w-4 h-4" /> Open Trip Builder
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-400 font-medium">{drafts.length} saved draft{drafts.length !== 1 ? 's' : ''}</p>
                          <button
                            onClick={() => { if (window.confirm('Clear all drafts?')) { setDrafts([]); localStorage.removeItem('voyageai_trip_drafts') } }}
                            className="text-[11px] text-red-400 hover:text-red-500 font-semibold hover:underline"
                          >
                            Clear all
                          </button>
                        </div>
                        {drafts.map((draft, i) => (
                          <motion.div key={draft.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <DraftCard draft={draft} onDelete={deleteDraft} />
                          </motion.div>
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* ── All / Upcoming / Completed tabs ── */}
                {activeTab !== 'drafts' && (
                  <>
                    {/* Inline drafts hint on 'all' tab */}
                    {activeTab === 'all' && drafts.length > 0 && (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">You have {drafts.length} unsent draft{drafts.length !== 1 ? 's' : ''}</div>
                            <div className="text-xs text-slate-500">Trip plans saved from Trip Builder, not yet confirmed</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('drafts')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-50 transition-all flex-shrink-0"
                        >
                          View Drafts <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {filteredTrips.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                      >
                        <DestinationCard entry={entry} />
                      </motion.div>
                    ))}

                    {filteredTrips.length === 0 && (
                      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                        <MapPin className="w-10 h-10 text-blue-200 mx-auto mb-3" />
                        <p className="text-slate-600 font-semibold">No {activeTab === 'all' ? '' : activeTab + ' '}trips yet</p>
                        <p className="text-slate-400 text-sm mt-1 mb-4">Build your first trip with the AI Trip Builder</p>
                        <Link
                          to="/passenger-details"
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
                        >
                          <Sparkles className="w-4 h-4" /> Start Planning
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Travel Partner Card */}
            {acceptedTrip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 60%, #F0F9FF 100%)' }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full blur-xl pointer-events-none" />
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                  </span>
                  Your Travel Partner
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Assigned Agent</div>
                    <div className="text-slate-900 font-bold text-base mt-0.5">{acceptedTrip.assignedAgentName}</div>
                  </div>
                  {acceptedTrip.assignedAgentPhone && (
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Phone</div>
                      <a href={`tel:${acceptedTrip.assignedAgentPhone}`} className="text-blue-600 hover:underline text-sm font-semibold block mt-0.5">{acceptedTrip.assignedAgentPhone}</a>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email</div>
                    <a href={`mailto:${acceptedTrip.assignedAgentEmail}`} className="text-blue-600 hover:underline text-sm font-semibold block mt-0.5">{acceptedTrip.assignedAgentEmail}</a>
                  </div>
                  <div className="pt-2 border-t border-blue-100 text-xs text-slate-500">
                    Trip: {acceptedTrip.trip?.destination || acceptedTrip.trip?.name}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Agent Messages */}
            {agentMessages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> Agent Messages
                  </span>
                  <span className="text-xs font-bold bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">
                    {agentMessages.length} new
                  </span>
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {agentMessages.map(({ id, tripName, agentName, message, time }) => (
                    <div key={id} className="rounded-xl border border-slate-100 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-3 h-3 text-blue-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">{agentName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{time}</span>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-xs text-slate-700 leading-relaxed">{message}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> re: {tripName}
                        </p>
                      </div>
                      <div className="px-3 pb-2.5">
                        <Link to="/chat" className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline">
                          Reply in chat <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" /> Notifications
                </span>
                {dynamicNotifications.length > 0 && (
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                    {dynamicNotifications.length}
                  </span>
                )}
              </h3>
              {dynamicNotifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">No notifications yet.</p>
                  <p className="text-slate-300 text-xs mt-0.5">Updates on your trips will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {dynamicNotifications.map(({ id, type, icon: Icon, text, time }) => (
                    <div
                      key={id}
                      className={`flex gap-3 p-2.5 rounded-xl border ${
                        type === 'success' ? 'bg-green-50 border-green-100' :
                        type === 'error'   ? 'bg-red-50 border-red-100'    :
                                            'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        type === 'success' ? 'text-green-500' :
                        type === 'error'   ? 'text-red-500'   : 'text-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-xs leading-relaxed">{text}</p>
                        {time && <p className="text-slate-400 text-xs mt-1">{time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Help Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 border border-blue-100 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #EEF2FF 70%, #F0F9FF 100%)' }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-xl pointer-events-none" />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Ask VoyageAI to change your itinerary, add a hotel, or answer any travel question.
              </p>
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                Open AI Chat <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Actions</h3>
              {[
                { icon: Shield,    label: 'Travel Insurance', desc: 'View policy' },
                { icon: Download,  label: 'All E-Tickets',    desc: 'Download'    },
                { icon: RefreshCw, label: 'Flight Status',    desc: 'Check live'  },
              ].map(({ icon: Icon, label, desc }) => (
                <button
                  key={label}
                  className="flex items-center justify-between w-full py-2.5 border-b border-slate-100 last:border-0 text-sm group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{desc} <ChevronRight className="w-3 h-3 inline" /></span>
                </button>
              ))}
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}