import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Car, Search, Calendar, MapPin, ChevronRight, CheckCircle, Sparkles, X, Shield, Clock, Users, Zap
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
        <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-700">Roadways</span>
                    </div>
                    <h1 className="font-display text-4xl font-bold text-slate-900 mb-1">Rent a Cab</h1>
                    <p className="text-slate-500">Intercity one-way drops and round-trip rentals with professional drivers.</p>
                </motion.div>

                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Pickup</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Drop</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input value={to} onChange={e => setTo(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 placeholder-slate-400 pl-9 pr-3 py-3 rounded-xl text-sm" />
                            </div>
                        </div>
                        <button onClick={handleSearch} className="px-8 py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}>
                            <Search className="w-4 h-4" /> Find Cabs
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {loading && (
                        <div className="text-center py-20">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-slate-500">Comparing provider rates...</p>
                        </div>
                    )}

                    {searched && !loading && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-slate-900 font-semibold text-lg">{MOCK_CABS.length} cabs available</h2>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 mb-6">
                                <Sparkles className="w-4 h-4 text-gold-400 mt-0.5" />
                                <p className="text-gold-200/70 text-xs">AI Tip: The Mumbai-Pune expressway has moderate traffic today. Innova Crysta is recommended for groups of 4+ for better comfort on the ghats.</p>
                            </div>

                            {MOCK_CABS.map((cab, i) => (
                                <motion.div
                                    key={cab.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:border-gold-400/20 transition-all group"
                                >
                                    <div className="flex items-start justify-between flex-wrap gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                                                <Car className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-slate-900 font-bold text-lg">{cab.vehicle} <span className="text-xs text-slate-400 font-normal">({cab.type})</span></h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cab.seats} Seats</span>
                                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-500" /> {cab.provider}</span>
                                                    <span className="flex items-center gap-1">⭐ {cab.rating}</span>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    {cab.features.map(f => (
                                                        <span key={f} className="px-2 py-0.5 bg-surface border border-border rounded text-[10px] text-slate-400">{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-blue-700 font-bold text-2xl">₹{cab.price.toLocaleString()}</div>
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">One Way Drop</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => { setBookedCab(cab); toast.success(`${cab.vehicle} booked!`) }}
                                                className="mt-4 px-6 py-2.5 text-white font-bold rounded-xl shadow-md text-sm" style={{background:"linear-gradient(135deg,#1A6EBD,#1558A0)"}}
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
                            { label: 'Verified Drivers', icon: Shield, color: 'text-green-600' },
                            { label: '24/7 Support', icon: Clock, color: 'text-sky-600' },
                            { label: 'Transparent Pricing', icon: Zap, color: 'text-blue-600' },
                            { label: 'Hygienic Cabs', icon: CheckCircle, color: 'text-orange-600' },
                        ].map(f => (
                            <div key={f.label} className="text-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <f.icon className={`w-6 h-6 ${f.color} mx-auto mb-2`} />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.label}</span>
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
                            className="fixed bottom-6 right-6 bg-white border border-green-200 rounded-2xl p-4 shadow-card max-w-sm z-40"
                        >
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-slate-900 font-semibold text-sm"></p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {bookedCab.vehicle} via {bookedCab.provider} · ₹{bookedCab.price.toLocaleString()} · Driver details will be sent 1h before pickup.
                                    </p>
                                </div>
                                <button onClick={() => setBookedCab(null)} className="text-slate-400 hover:text-slate-700">
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