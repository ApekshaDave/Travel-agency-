import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Plane, Calendar, Clock, CheckCircle,
  Download, RefreshCw, MessageCircle, ChevronRight,
  MapPin, Star, TrendingUp, Sparkles, Package,
  ArrowRight, Bell, MoreHorizontal, Shield, Map,
  XCircle, UserCheck, Ban, Wifi, Phone, Mail,
  Building2, Briefcase, MessageSquare
} from 'lucide-react'
import { getCustomerTrips, syncTripsWithSupabase } from '../utils/tripStore'
import { useAuth } from '../context/AuthContext'

// Derives live notifications from customerTrips data
function buildDynamicNotifications(customerTrips) {
  const notes = []

  customerTrips.forEach((entry) => {
    const tripName = entry.trip?.name || 'Your trip'
    const agentName = entry.assignedAgentName || entry.agentName || 'An agent'
    const time = entry.updatedAt
      ? new Date(entry.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : ''

    // Agent accepted / assigned
    if (entry.status === 'accepted' && entry.assignedAgentName) {
      notes.push({
        id: `accepted-${entry.id}`,
        type: 'success',
        icon: UserCheck,
        text: `${agentName} has accepted and is managing "${tripName}".`,
        time,
      })
    }

    // Agent sent back / updated the itinerary
    if (entry.agentSentBack) {
      notes.push({
        id: `sentback-${entry.id}`,
        type: 'info',
        icon: RefreshCw,
        text: `Agent updated your itinerary for "${tripName}". Review the changes.`,
        time,
      })
    }

    // Trip cancelled by user or agent
    if (entry.status === 'cancelled') {
      notes.push({
        id: `cancelled-${entry.id}`,
        type: 'error',
        icon: Ban,
        text: `"${tripName}" has been cancelled.${entry.cancelReason ? ` Reason: ${entry.cancelReason}` : ''}`,
        time,
      })
    }

    // Trip rejected by agent
    if (entry.status === 'rejected') {
      notes.push({
        id: `rejected-${entry.id}`,
        type: 'error',
        icon: XCircle,
        text: `Your request for "${tripName}" was declined by the agent.${entry.rejectReason ? ` Reason: ${entry.rejectReason}` : ''}`,
        time,
      })
    }

    // Payment or booking error
    if (entry.status === 'error' || entry.bookingError) {
      notes.push({
        id: `error-${entry.id}`,
        type: 'error',
        icon: Wifi,
        text: `A technical error occurred with "${tripName}". Please retry or contact support.`,
        time,
      })
    }

    // Approved / confirmed
    if (entry.status === 'approved' || entry.status === 'confirmed') {
      notes.push({
        id: `approved-${entry.id}`,
        type: 'success',
        icon: CheckCircle,
        text: `"${tripName}" is confirmed! Your booking is all set.`,
        time,
      })
    }

    // Pending — waiting for agent response
    if (entry.status === 'pending' && !entry.agentSentBack && !entry.assignedAgentName) {
      notes.push({
        id: `pending-${entry.id}`,
        type: 'info',
        icon: Bell,
        text: `Waiting for an agent to pick up "${tripName}".`,
        time,
      })
    }
  })

  return notes
}

const TRIPS = [
  {
    id: 'VAI-A7X2K1',
    status: 'upcoming',
    airline: 'Air India',
    logo: '🔴',
    code: 'AI 619',
    from: 'DEL', fromCity: 'Delhi',
    to: 'BOM', toCity: 'Mumbai',
    depart: '09:30', arrive: '11:50',
    date: 'Mon, 15 Mar 2025',
    duration: '2h 20m',
    price: 5800,
    class: 'Economy',
    pnr: 'AIXTV8',
    seat: '14C',
    checkinOpen: true,
  },
  {
    id: 'VAI-B3M9P4',
    status: 'upcoming',
    airline: 'IndiGo',
    logo: '🔵',
    code: '6E 5317',
    from: 'BOM', fromCity: 'Mumbai',
    to: 'BLR', toCity: 'Bengaluru',
    depart: '14:45', arrive: '16:15',
    date: 'Fri, 22 Mar 2025',
    duration: '1h 30m',
    price: 3299,
    class: 'Economy',
    pnr: 'IGXR45',
    seat: '22A',
    checkinOpen: false,
  },
  {
    id: 'VAI-C1D8F7',
    status: 'completed',
    airline: 'Vistara',
    logo: '🟣',
    code: 'UK 955',
    from: 'DEL', fromCity: 'Delhi',
    to: 'CCU', toCity: 'Kolkata',
    depart: '07:00', arrive: '09:15',
    date: 'Wed, 05 Feb 2025',
    duration: '2h 15m',
    price: 6100,
    class: 'Economy',
    pnr: 'VSYZ91',
    seat: '8F',
    checkinOpen: false,
  },
]


function TripCard({ trip, agentInfo }) {
  const [expanded, setExpanded] = useState(false)
  const isUpcoming = trip.status === 'upcoming'

  // Agent fields come from the matched customerTrip entry
  const agentName     = agentInfo?.assignedAgentName
  const agentPhone    = agentInfo?.assignedAgentPhone
  const agentEmail    = agentInfo?.assignedAgentEmail
  const agentPosition = agentInfo?.position
  const agentAgency   = agentInfo?.agencyName
  const hasAgent      = isUpcoming && agentName

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
        isUpcoming
          ? 'border-slate-200 hover:border-blue-200 hover:shadow-md'
          : 'border-slate-100 opacity-70 hover:opacity-90'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Status + ID */}
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isUpcoming
                ? 'bg-blue-50 text-blue-600 border-blue-100'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {isUpcoming ? '✈ Upcoming' : '✓ Completed'}
            </div>
            <span className="font-mono text-xs text-slate-400">{trip.id}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isUpcoming && trip.checkinOpen && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Web Check-in
              </motion.button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Route */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{trip.logo}</span>
            <div>
              <div className="text-slate-900 font-semibold text-sm">{trip.airline}</div>
              <div className="text-slate-400 text-xs font-mono">{trip.code}</div>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <div className="text-center">
              <div className="text-slate-900 font-bold text-xl">{trip.depart}</div>
              <div className="text-slate-400 text-xs font-mono">{trip.from}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {trip.duration}
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-200" />
                <Plane className="w-3 h-3 text-blue-400" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="text-slate-400 text-xs mt-1">Direct</div>
            </div>
            <div className="text-center">
              <div className="text-slate-900 font-bold text-xl">{trip.arrive}</div>
              <div className="text-slate-400 text-xs font-mono">{trip.to}</div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-blue-600 font-bold">₹{trip.price.toLocaleString()}</div>
            <div className="text-slate-400 text-xs">{trip.class}</div>
          </div>
        </div>

        {/* Date */}
        <div className="mt-3 flex items-center gap-2 text-slate-500 text-sm">
          <Calendar className="w-3.5 h-3.5" />
          {trip.date}
          <span className="mx-1">·</span>
          <MapPin className="w-3.5 h-3.5" />
          Seat {trip.seat}
          <span className="mx-1">·</span>
          <span className="font-mono">PNR: {trip.pnr}</span>
        </div>

        {/* Agent details — shown only for upcoming trips with an assigned agent */}
        {hasAgent && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Your Assigned Agent</span>
            </div>
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
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-4 flex flex-wrap gap-2 bg-slate-50">
              {[
                { icon: Download, label: 'Download Ticket', color: 'text-blue-500' },
                { icon: RefreshCw, label: 'Change Flight', color: 'text-orange-500' },
                { icon: Package, label: 'Add Baggage', color: 'text-green-500' },
                { icon: MessageCircle, label: 'Get Help', color: 'text-slate-500' },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs transition-all shadow-sm hover:shadow"
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-slate-700">{label}</span>
                </button>
              ))}
              <Link
                to="/chat"
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600 hover:bg-blue-100 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask AI about this trip
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('all')
  const { user } = useAuth()
  const [customerTrips, setCustomerTrips] = useState(() => user ? getCustomerTrips(user.id) : [])
  const [, setLoadingSync] = useState(false)

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

  const agentUpdatedTrips = customerTrips.filter(t => t.agentSentBack)
  const pendingTrips = customerTrips.filter(t => !t.agentSentBack)
  const acceptedTrip = customerTrips.find(t => t.status === 'accepted' && t.assignedAgentName)
  const dynamicNotifications = buildDynamicNotifications(customerTrips)

  // All agent messages across trips, newest first
  const agentMessages = customerTrips
    .filter(t => t.agentMessage)
    .map(t => ({
      id: t.id,
      tripName: t.trip?.name || 'Your trip',
      agentName: t.assignedAgentName || t.agentName || 'Your Agent',
      message: t.agentMessage,
      time: t.updatedAt
        ? new Date(t.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : '',
    }))
    .reverse()

  // Map customerTrip entries by a matching field so TripCard can show agent info
  // Matches on pnr or flightCode present in the customerTrip's trip data
  const agentInfoByPnr = {}
  customerTrips.forEach(entry => {
    if (entry.assignedAgentName) {
      // Store by trip id, pnr and flight codes found in the trip flights array
      const flights = entry.trip?.flights || []
      flights.forEach(f => {
        if (f.pnr) agentInfoByPnr[f.pnr] = entry
      })
      // Also index by entry id for direct lookup
      agentInfoByPnr[entry.id] = entry
    }
  })

  const filtered = TRIPS.filter(t =>
    activeTab === 'all' ? true :
      activeTab === 'upcoming' ? t.status === 'upcoming' :
        t.status === 'completed'
  )

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
            <p className="text-slate-500">Manage bookings, check-in, and get AI assistance</p>
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
            { label: 'Total Trips', value: TRIPS.length + customerTrips.length, icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Miles Flown', value: '4,280', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Savings', value: '₹3,200', icon: Star, color: 'text-green-500', bg: 'bg-green-50' },
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
          {/* Left column */}
          <div className="space-y-6">

            {/* Agent-updated itineraries banner */}
            {agentUpdatedTrips.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Agent Updated Your Itineraries
                </h2>
                <div className="space-y-3">
                  {agentUpdatedTrips.map(entry => (
                    <div key={entry.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-900 font-bold text-sm">{entry.trip.name}</span>
                            <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-600 text-[10px] rounded-full font-bold">Updated by Agent</span>
                          </div>
                          <p className="text-slate-500 text-xs">
                            {entry.trip.duration} · ₹{entry.trip.totalCost?.toLocaleString()} · Updated by {entry.agentName}
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

            {/* My Trip Builder packages */}
            {pendingTrips.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Map className="w-4 h-4 text-orange-500" />
                  My Trip Builder Packages
                </h2>
                <div className="space-y-2">
                  {pendingTrips.slice(0, 4).map(entry => (
                    <div key={entry.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-blue-100 hover:shadow-sm transition-all">
                      <div className="min-w-0">
                        <div className="text-slate-900 font-semibold text-sm truncate">{entry.trip.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {entry.trip.duration} · ₹{entry.trip.totalCost?.toLocaleString()} ·
                          <span className={`ml-1 font-medium ${
                            entry.status === 'pending' ? 'text-amber-500' :
                            entry.status === 'booked' ? 'text-green-500' : 'text-slate-400'
                          }`}>{entry.status}</span>
                        </div>
                      </div>
                      <Link
                        to={`/trip-builder?view=${entry.id}`}
                        className="px-3 py-1.5 bg-white border border-blue-100 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all flex-shrink-0 shadow-sm"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Booked Flights */}
            <div>
              {/* Tabs */}
              <div className="flex gap-1 mb-5">
                {['all', 'upcoming', 'completed'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filtered.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <TripCard trip={trip} agentInfo={agentInfoByPnr[trip.pnr] || null} />
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <Plane className="w-10 h-10 text-blue-200 mx-auto mb-3" />
                    <p className="text-slate-500">No {activeTab} trips found.</p>
                    <Link to="/search" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                      Book a flight →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
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
                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Trip: {acceptedTrip.trip.name}</span>
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
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Agent Messages
                  </span>
                  <span className="text-xs font-bold bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">
                    {agentMessages.length} new
                  </span>
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {agentMessages.map(({ id, tripName, agentName, message, time }) => (
                    <div key={id} className="rounded-xl border border-slate-100 overflow-hidden">
                      {/* Header row */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-3 h-3 text-blue-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">{agentName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{time}</span>
                      </div>
                      {/* Message bubble */}
                      <div className="px-3 py-2.5">
                        <p className="text-xs text-slate-700 leading-relaxed">{message}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <Plane className="w-2.5 h-2.5" /> re: {tripName}
                        </p>
                      </div>
                      {/* Reply link */}
                      <div className="px-3 pb-2.5">
                        <Link
                          to="/chat"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                        >
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
                        type === 'error'   ? 'bg-red-50 border-red-100' :
                                            'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        type === 'success' ? 'text-green-500' :
                        type === 'error'   ? 'text-red-500' :
                                            'text-blue-500'
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
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Ask VoyageAI to change your flight, add baggage, or answer any travel question.
              </p>
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
              >
                Open AI Chat <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Actions</h3>
              {[
                { icon: Shield, label: 'Travel Insurance', desc: 'View policy' },
                { icon: Download, label: 'All E-Tickets', desc: 'Download' },
                { icon: RefreshCw, label: 'Flight Status', desc: 'Check live', to: '/post-booking/status' },
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