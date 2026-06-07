import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    ChevronLeft, RefreshCw, AlertTriangle, CheckCircle,
    Clock, Plane, Calendar, MapPin
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import toast from 'react-hot-toast'

// Mock data for initial view
const MOCK_TRIPS = [
    { id: 'T-101', name: 'Goa Summer Escape', status: 'upcoming', date: '2025-06-20', route: 'BOM → GOI', price: 12500 },
    { id: 'T-102', name: 'Business: Delhi Summit', status: 'booked', date: '2025-05-15', route: 'BLR → DEL', price: 8400 },
    { id: 'T-103', name: 'Winter in Manali', status: 'completed', date: '2024-12-10', route: 'DEL → KUL', price: 15000 },
]

export default function CancelRefundPage() {
    const { user } = useAuth()
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate fetching user-specific bookings
        setTimeout(() => {
            setTrips(MOCK_TRIPS)
            setLoading(false)
        }, 800)
    }, [user])

    const handleCancelRequest = async (trip) => {
        if (trip.status !== 'upcoming') {
            toast.error('Only upcoming trips can be cancelled.')
            return
        }

        try {
            const { error } = await supabase.from('booking_issues').insert([{
                user_id: user?.id,
                trip_id: trip.id,
                issue_type: 'Cancellation Request',
                description: `User requested cancellation for trip: ${trip.name}`,
                customer_name: user?.name || 'Guest',
                customer_email: user?.email,
                customer_phone: user?.phone || 'N/A',
                status: 'open'
            }])

            if (error) throw error
            toast.success('Cancellation request sent to agent!')
        } catch (err) {
            toast.error('Failed to send request: ' + err.message)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/post-booking" className="inline-flex items-center gap-2 text-muted hover:text-gold-400 mb-6 transition-colors text-sm font-bold uppercase tracking-tighter">
                    <ChevronLeft className="w-4 h-4" /> Back to Manage Trip
                </Link>

                <h1 className="font-display text-4xl font-bold text-white mb-2">Cancellations & Refunds</h1>
                <p className="text-muted mb-8">Select an upcoming trip to request cancellation and check refund eligibility.</p>

                {loading ? (
                    <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-gold-400 animate-spin" /></div>
                ) : (
                    <div className="space-y-4">
                        {trips.map((trip) => (
                            <motion.div
                                key={trip.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass border border-border rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Plane className={`w-6 h-6 ${trip.status === 'upcoming' ? 'text-gold-400' : 'text-muted'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{trip.name} <span className="text-xs text-muted font-normal">({trip.id})</span></h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.date}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.route}</span>
                                            <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold ${trip.status === 'upcoming' ? 'bg-gold-400/10 text-gold-400 border-gold-400/20' : 'bg-white/5 text-muted border-white/10'
                                                }`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-white font-bold">₹{trip.price.toLocaleString()}</div>
                                        <p className="text-[10px] text-muted uppercase tracking-widest">Paid Amount</p>
                                    </div>
                                    {trip.status === 'upcoming' ? (
                                        <button onClick={() => handleCancelRequest(trip)} className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-all">
                                            Request Cancellation
                                        </button>
                                    ) : (
                                        <div className="px-6 py-2.5 bg-white/5 border border-white/10 text-muted rounded-xl text-sm font-bold opacity-50">Locked</div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}