import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plane, Train, Bus, Car, Map, ArrowRight,
  ChevronRight, RotateCcw, AlertTriangle, CheckCircle2,
  Calendar, MapPin, DollarSign, 
} from 'lucide-react'

// Mock upcoming trips — replace with real data
const MOCK_UPCOMING_TRIPS = [
  {
    id: 'VAI-MULT-99',
    name: 'Golden Triangle & Beyond',
    agentName: 'Rahul Sharma',
    segments: [
      { id: 's1', type: 'flight',   label: 'Air India AI 619',    from: 'DEL', to: 'BOM', date: '15 Mar', price: 5800,  pnr: 'AIXTV8'  },
      { id: 's2', type: 'train',    label: 'Shatabdi Exp 12001',  from: 'BOM', to: 'PUN', date: '16 Mar', price: 1200,  pnr: null       },
      { id: 's3', type: 'roadways', label: 'Ola Sedan AC',        from: 'Pune', to: 'Lonavala', date: '17 Mar', price: 650, pnr: null  },
    ],
  },
  {
    id: 'VAI-GOA-12',
    name: 'Goa Beach Escape',
    agentName: 'Priya Nair',
    segments: [
      { id: 's4', type: 'flight',   label: 'IndiGo 6E 721',   from: 'DEL', to: 'GOI', date: '22 Apr', price: 4200, pnr: 'GXTV12' },
      { id: 's5', type: 'bus',      label: 'KTCL Sleeper Bus', from: 'Goa', to: 'Mysore', date: '26 Apr', price: 800, pnr: null  },
    ],
  },
  {
    id: 'VAI-MAN-07',
    name: 'Manali Mountain Trip',
    agentName: 'Arjun Singh',
    segments: [
      { id: 's6', type: 'flight',   label: 'SpiceJet SG 112', from: 'DEL', to: 'KUU', date: '1 May', price: 3900, pnr: 'MXTV07' },
      { id: 's7', type: 'roadways', label: 'Tempo Traveller',  from: 'Bhuntar', to: 'Manali', date: '1 May', price: 1400, pnr: null },
    ],
  },
]

const CANCEL_TYPES = [
  { id: 'entire',  icon: Map,   label: 'Entire Trip',          desc: 'Cancel all flights, trains, and transfers' },
  { id: 'flight',  icon: Plane, label: 'A Flight',             desc: 'Cancel one specific flight segment' },
  { id: 'train',   icon: Train, label: 'A Train',              desc: 'Cancel a train booking' },
  { id: 'bus',     icon: Bus,   label: 'A Bus',                desc: 'Cancel a bus or coach segment' },
  { id: 'roadways',icon: Car,   label: 'A Cab / Transfer',     desc: 'Cancel a road transfer or taxi' },
]

const SEGMENT_ICON = { flight: Plane, train: Train, bus: Bus, roadways: Car }
const SEGMENT_COLOR = {
  flight:   'bg-blue-50 text-blue-600',
  train:    'bg-sky-50 text-sky-600',
  bus:      'bg-violet-50 text-violet-600',
  roadways: 'bg-orange-50 text-orange-600',
}

export default function CancelRefundPage() {
  const navigate = useNavigate()

  // Step 1 — choose cancel type
  // Step 2 — choose trip
  // Step 3 — choose specific segment (if not 'entire')
  const [step, setStep] = useState(1)
  const [cancelType, setCancelType] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedSegment, setSelectedSegment] = useState(null)

  const availableTrips = cancelType === 'entire'
    ? MOCK_UPCOMING_TRIPS
    : MOCK_UPCOMING_TRIPS.filter(t => t.segments.some(s => s.type === cancelType))

  const availableSegments = selectedTrip
    ? selectedTrip.segments.filter(s => cancelType === 'entire' || s.type === cancelType)
    : []

  const handleTypeSelect = (type) => {
    setCancelType(type)
    setSelectedTrip(null)
    setSelectedSegment(null)
    setStep(2)
  }

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip)
    setSelectedSegment(null)
    if (cancelType === 'entire') {
      setStep(3) // go straight to confirm step
    } else {
      setStep(3)
    }
  }

  const handleSegmentSelect = (seg) => {
    setSelectedSegment(seg)
  }

  const handleProceed = () => {
    const dest = selectedSegment
      ? `${selectedSegment.from} → ${selectedSegment.to}`
      : selectedTrip?.name || ''
    const label = selectedSegment?.label || selectedTrip?.name || ''

    navigate(
      `/chat?cancel=${encodeURIComponent(label)}&cancelDest=${encodeURIComponent(dest)}&agentName=${encodeURIComponent(selectedTrip?.agentName || '')}`
    )
  }

  const canProceed = cancelType === 'entire'
    ? !!selectedTrip
    : !!(selectedTrip && selectedSegment)

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/post-booking" className="hover:text-blue-600 transition-colors">Manage Trip</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Cancel & Refund</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">Cancel & Refund</h1>
          <p className="text-slate-500 text-sm">Tell us what you'd like to cancel and we'll connect you to your agent.</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['What to cancel', 'Which trip', 'Confirm'].map((label, i) => {
            const n = i + 1
            const done    = step > n
            const current = step === n
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  done    ? 'bg-blue-600 text-white' :
                  current ? 'bg-blue-100 text-blue-600 border-2 border-blue-500' :
                            'bg-slate-100 text-slate-400'
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${current ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                {i < 2 && <div className="flex-1 h-px bg-slate-200 ml-1" />}
              </div>
            )
          })}
        </div>

        {/* ── STEP 1 — What do you want to cancel? ── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
            >
              <p className="text-sm font-semibold text-slate-700 mb-4">What would you like to cancel?</p>
              <div className="space-y-2.5">
                {CANCEL_TYPES.map((ct, i) => {
                  const Icon = ct.icon
                  return (
                    <motion.button
                      key={ct.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleTypeSelect(ct.id)}
                      className="w-full flex items-center gap-4 p-4 bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl text-left transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{ct.label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{ct.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 — Which trip? ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">Which trip?</p>
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline font-semibold">← Change</button>
              </div>

              {availableTrips.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No upcoming trips with a {cancelType} booking found.
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTrips.map((trip, i) => {
                    const isSelected = selectedTrip?.id === trip.id
                    const segCount = trip.segments.filter(s => cancelType === 'entire' || s.type === cancelType).length
                    return (
                      <motion.button
                        key={trip.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleTripSelect(trip)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Map className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{trip.name}</p>
                            <p className="text-xs text-slate-400">{trip.id} · {segCount} {cancelType === 'entire' ? 'segment' : cancelType}{segCount > 1 ? 's' : ''}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        {/* Segment pills */}
                        <div className="flex flex-wrap gap-2">
                          {trip.segments
                            .filter(s => cancelType === 'entire' || s.type === cancelType)
                            .map(s => {
                              const Icon = SEGMENT_ICON[s.type] || Plane
                              return (
                                <span key={s.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${SEGMENT_COLOR[s.type] || 'bg-slate-100 text-slate-500'}`}>
                                  <Icon className="w-3 h-3" /> {s.from} → {s.to} · {s.date}
                                </span>
                              )
                            })
                          }
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3 — Pick segment + confirm ── */}
          {step === 3 && selectedTrip && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {cancelType === 'entire' ? 'Confirm cancellation' : 'Which segment?'}
                </p>
                <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline font-semibold">← Back</button>
              </div>

              {/* Segment selector — only for non-entire */}
              {cancelType !== 'entire' && (
                <div className="space-y-2.5">
                  {availableSegments.map((seg, i) => {
                    const Icon = SEGMENT_ICON[seg.type] || Plane
                    const colorCls = SEGMENT_COLOR[seg.type] || 'bg-slate-50 text-slate-500'
                    const isSelected = selectedSegment?.id === seg.id
                    return (
                      <motion.button
                        key={seg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSegmentSelect(seg)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : colorCls
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{seg.label}</p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {seg.from} → {seg.to}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {seg.date}</span>
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><DollarSign className="w-3 h-3" /> {seg.price.toLocaleString()}</span>
                            </div>
                            {seg.pnr && <p className="text-[10px] text-slate-400 font-mono mt-1">PNR: {seg.pnr}</p>}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Summary card */}
              <AnimatePresence>
                {(cancelType === 'entire' || selectedSegment) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                  >
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cancellation Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Trip</span>
                      <span className="font-semibold text-slate-900">{selectedTrip.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Cancelling</span>
                      <span className="font-semibold text-slate-900">
                        {cancelType === 'entire'
                          ? 'Entire trip'
                          : `${selectedSegment?.from} → ${selectedSegment?.to} (${selectedSegment?.label})`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Agent</span>
                      <span className="font-semibold text-slate-900">{selectedTrip.agentName}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-xs leading-relaxed">
                  Cancellation charges may apply based on your fare type and time before departure. Your agent will confirm the final refund amount.
                </p>
              </div>

              {/* Proceed button */}
              <motion.button
                whileHover={canProceed ? { scale: 1.01 } : {}}
                whileTap={canProceed ? { scale: 0.99 } : {}}
                onClick={handleProceed}
                disabled={!canProceed}
                className="w-full py-4 font-bold text-base rounded-2xl flex items-center justify-center gap-3 transition-all"
                style={canProceed
                  ? { background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)', color: 'white' }
                  : { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
                }
              >
                <RotateCcw className="w-5 h-5" />
                Proceed to Cancellation
                {canProceed && <ArrowRight className="w-4 h-4" />}
              </motion.button>
              <p className="text-center text-xs text-slate-400">You'll confirm once more in chat before anything is cancelled.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}