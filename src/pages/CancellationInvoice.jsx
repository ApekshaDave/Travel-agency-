import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plane, Train, Car, MapPin, Calendar, Clock,
  ChevronRight, RotateCcw, AlertTriangle, ArrowRight, IndianRupee
} from 'lucide-react'

// Mock upcoming trips — replace with real data from your store/API
const MOCK_UPCOMING_TRIPS = [
  {
    id: 'VAI-MULT-99',
    name: 'Golden Triangle & Beyond',
    destination: 'Delhi → Mumbai → Pune',
    date: '15 Mar 2025',
    duration: '3 nights',
    type: 'flight',
    status: 'confirmed',
    agentName: 'Rahul Sharma',
    refundEstimate: '₹4,800',
    pnr: 'AIXTV8',
  },
  {
    id: 'VAI-GOA-12',
    name: 'Goa Beach Escape',
    destination: 'Delhi → Goa',
    date: '22 Apr 2025',
    duration: '5 nights',
    type: 'flight',
    status: 'confirmed',
    agentName: 'Priya Nair',
    refundEstimate: '₹7,200',
    pnr: 'GXTV12',
  },
  {
    id: 'VAI-MAN-07',
    name: 'Manali Mountain Trip',
    destination: 'Delhi → Manali',
    date: '1 May 2025',
    duration: '4 nights',
    type: 'roadways',
    status: 'confirmed',
    agentName: 'Arjun Singh',
    refundEstimate: '₹2,400',
    pnr: null,
  },
]

const TYPE_ICON = {
  flight: Plane,
  train: Train,
  roadways: Car,
  car: Car,
}

export default function CancelRefundPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const handleProceed = () => {
    if (!selected) return
    const trip = MOCK_UPCOMING_TRIPS.find(t => t.id === selected)
    navigate(
      `/chat?cancel=${encodeURIComponent(trip.id)}&cancelDest=${encodeURIComponent(trip.destination)}&agentName=${encodeURIComponent(trip.agentName || '')}`
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/post-booking" className="hover:text-blue-600 transition-colors">Manage Trip</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Cancel & Refund</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Cancel & Refund</h1>
          <p className="text-slate-500 text-sm">Select the trip you'd like to cancel. Your agent will process the refund.</p>
        </motion.div>

        {/* Warning notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-7"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-semibold">Cancellation charges may apply</p>
            <p className="text-amber-700/80 text-xs mt-0.5 leading-relaxed">
              Refund amount depends on your fare type and how far in advance you cancel. 
              The estimate shown is approximate — your agent will confirm the final amount.
            </p>
          </div>
        </motion.div>

        {/* Trip list */}
        <div className="space-y-3 mb-7">
          {MOCK_UPCOMING_TRIPS.map((trip, i) => {
            const Icon = TYPE_ICON[trip.type] || Plane
            const isSelected = selected === trip.id
            return (
              <motion.button
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setSelected(isSelected ? null : trip.id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-bold text-base ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                          {trip.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5 text-slate-500 text-xs">
                          <MapPin className="w-3 h-3" />
                          {trip.destination}
                        </div>
                      </div>
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {trip.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {trip.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <IndianRupee className="w-3 h-3" /> Est. refund: {trip.refundEstimate}
                      </span>
                    </div>

                    {trip.pnr && (
                      <p className="mt-2 text-[10px] text-slate-400 font-mono">PNR: {trip.pnr}</p>
                    )}
                  </div>
                </div>

                {/* Expanded agent info when selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-blue-200 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">
                            {(trip.agentName || 'A').charAt(0)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          <span className="font-semibold">{trip.agentName}</span> is managing this trip and will process your refund.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        {/* Proceed button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <motion.button
            whileHover={selected ? { scale: 1.01 } : {}}
            whileTap={selected ? { scale: 0.99 } : {}}
            onClick={handleProceed}
            disabled={!selected}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
              selected
                ? 'text-white shadow-md hover:shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            style={selected ? { background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' } : {}}
          >
            <RotateCcw className="w-5 h-5" />
            {selected ? 'Proceed to Cancellation' : 'Select a trip to continue'}
            {selected && <ArrowRight className="w-4 h-4" />}
          </motion.button>
          <p className="text-center text-xs text-slate-400 mt-3">
            You'll be asked to confirm once more before anything is cancelled.
          </p>
        </motion.div>
      </div>
    </div>
  )
}