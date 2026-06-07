import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Car, Search, Calendar, MapPin, ChevronRight, CheckCircle,
    ArrowRight, Sparkles, X, Shield, Clock, Users, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_CABS = [
    { id: 1, vehicle: 'Swift Dzire', type: 'Sedan', seats: 4, price: 2200, provider: 'Ola Outstation', rating: 4.5, features: ['AC', 'Toll Included'] },
    { id: 2, vehicle: 'Innova Crysta', type: 'SUV', seats: 6, price: 4500, provider: 'Savaari', rating: 4.8, features: ['AC', 'Carrier', 'Water'] },
    { id: 3, vehicle: 'Honda City', type: 'Premium Sedan', seats: 4, price: 3100, provider: 'MakeMyTrip', rating: 4.6, features: ['AC', 'Pillow', 'Music'] },
]

export default function RoadSearch() {
    const [from, setFrom] = useState('Mumbai')
    const [to, setTo] = useState('Pune')
    const [date, setDate] = useState('2025-03-20')
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [bookedCab, setBookedCab] = useState(null)

    const handleSearch = () => {
        setLoading(true)
        setSearched(false)
        setTimeout(() => { setLoading(false); setSearched(true) }, 1000)
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2 text-muted text-sm mb-3">
                        <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-white">Roadways</span>
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white mb-1">Rent a Cab</h1>
                    <p className="text-muted">Intercity one-way drops and round-trip rentals with professional drivers.</p>
                </motion.div>

                <div className="glass gradient-border rounded-3xl p-5 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                        <div>
                            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Pickup</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                                <input value={from} onChange={e => setFrom(e.target.value)} className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Drop</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                                <input value={to} onChange={e => setTo(e.target.value)} className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted" />
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
                            </div>
                        </div>
                        <button onClick={handleSearch} className="px-8 py-3 bg-gold-gradient text-void font-bold rounded-xl shadow-gold hover:scale-105 transition-all flex items-center gap-2">
                            <Search className="w-4 h-4" /> Find Cabs
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {loading && (
                        <div className="text-center py-20">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-2 border-gold-400 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-muted">Comparing provider rates...</p>
                        </div>
                    )}

                    {searched && !loading && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-semibold text-lg">{MOCK_CABS.length} cabs available</h2>
                            </div>

                            <div className="p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl flex items-start gap-3 mb-6">
                                <Sparkles className="w-4 h-4 text-gold-400 mt-0.5" />
                                <p className="text-gold-200/70 text-xs">AI Tip: The Mumbai-Pune expressway has moderate traffic today. Innova Crysta is recommended for groups of 4+ for better comfort on the ghats.</p>
                            </div>

                            {MOCK_CABS.map((cab, i) => (
                                <motion.div
                                    key={cab.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass border border-border rounded-2xl p-5 hover:border-gold-400/20 transition-all group"
                                >
                                    <div className="flex items-start justify-between flex-wrap gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                                                <Car className="w-6 h-6 text-gold-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">{cab.vehicle} <span className="text-xs text-muted font-normal">({cab.type})</span></h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cab.seats} Seats</span>
                                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-gold-400" /> {cab.provider}</span>
                                                    <span className="flex items-center gap-1">⭐ {cab.rating}</span>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    {cab.features.map(f => (
                                                        <span key={f} className="px-2 py-0.5 bg-surface border border-border rounded text-[10px] text-muted">{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-gold-400 font-bold text-2xl">₹{cab.price.toLocaleString()}</div>
                                            <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">One Way Drop</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => { setBookedCab(cab); toast.success(`${cab.vehicle} booked!`) }}
                                                className="mt-4 px-6 py-2.5 bg-gold-gradient text-void font-bold rounded-xl shadow-gold-sm text-sm"
                                            >
                                                Book Now
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!searched && !loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                        {[
                            { label: 'Verified Drivers', icon: Shield, color: 'text-sage-400' },
                            { label: '24/7 Support', icon: Clock, color: 'text-sky-400' },
                            { label: 'Transparent Pricing', icon: Zap, color: 'text-gold-400' },
                            { label: 'Hygienic Cabs', icon: CheckCircle, color: 'text-orange-400' },
                        ].map(f => (
                            <div key={f.label} className="text-center p-4 glass border border-white/5 rounded-2xl">
                                <f.icon className={`w-6 h-6 ${f.color} mx-auto mb-2`} />
                                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{f.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {bookedCab && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="fixed bottom-6 right-6 glass border border-sage-400/30 bg-sage-400/10 rounded-2xl p-4 shadow-card max-w-sm z-40"
                        >
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-sage-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">Cab Booked!</p>
                                    <p className="text-muted text-xs mt-0.5">
                                        {bookedCab.vehicle} via {bookedCab.provider} · ₹{bookedCab.price.toLocaleString()} · Driver details will be sent 1h before pickup.
                                    </p>
                                </div>
                                <button onClick={() => setBookedCab(null)} className="text-muted hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}