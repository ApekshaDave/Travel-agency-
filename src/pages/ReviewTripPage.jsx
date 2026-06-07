import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    CheckCircle, Edit3, ArrowRight, User, Mail, Phone, CreditCard,
    Plane, Train, Bus, Car, Building2, Map, DollarSign, Sparkles, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { submitTripToAgent } from '../utils/tripStore';
import { generateMultiModalTrip } from '../utils/multiModalApi'; // For mock booking

const SEGMENT_TYPES = {
    flight: { icon: Plane, label: 'Flight' },
    train: { icon: Train, label: 'Train' },
    bus: { icon: Bus, label: 'Bus' },
    roadways: { icon: Car, label: 'Roadways' },
    hotel: { icon: Building2, label: 'Hotel' },
};

export default function ReviewTripPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trip, setTrip] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        const storedTrip = localStorage.getItem('voyageai_active_trip');
        const storedPassengers = localStorage.getItem('voyageai_passenger_details');

        if (storedTrip) {
            setTrip(JSON.parse(storedTrip));
        }
        if (storedPassengers) {
            setPassengers(JSON.parse(storedPassengers));
        }

        if (!storedTrip && !storedPassengers) {
            toast.error('No trip details found. Please start planning your trip.');
            navigate('/');
        }
    }, [navigate]);

    const handleConfirmBooking = async () => {
        if (!trip || !passengers.length) {
            toast.error('Missing trip or passenger details.');
            return;
        }

        setLoading(true);
        try {
            // Simulate Groq booking for transportation and stay
            // In a real app, this would involve API calls to booking systems
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

            // Update trip object with passenger details
            const fullTripDetails = {
                ...trip,
                passengers: passengers,
                status: 'pending_agent_review',
                bookedAt: new Date().toISOString(),
            };

            // Submit to agent
            const submittedTrip = submitTripToAgent(fullTripDetails, user);

            setConfirmed(true);
            toast.success('Booking request sent to travel agent!');
            localStorage.removeItem('voyageai_active_trip');
            localStorage.removeItem('voyageai_passenger_details');

            // Redirect to dashboard or confirmation page
            navigate('/dashboard', { replace: true });

        } catch (error) {
            console.error('Booking confirmation failed:', error);
            toast.error('Failed to confirm booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!trip || !passengers.length) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
                <p className="text-muted">Loading trip details...</p>
            </div>
        );
    }

    const totalCost = trip.totalCost || 0; // Assuming totalCost is calculated in TripBuilder

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 bg-surface-light">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Review Your Trip</h1>
                    <p className="text-slate-600">Please review all details before confirming your booking.</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Trip Summary */}
                    <div className="space-y-8">
                        {/* Passenger Details */}
                        <div className="glass border border-border rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-bold text-slate-900">Passenger Details</h2>
                                <Link to="/passenger-details" className="text-brand-primary hover:underline flex items-center gap-1">
                                    <Edit3 className="w-4 h-4" /> Edit
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {passengers.map((p, index) => (
                                    <div key={index} className="border-b border-border/50 pb-3 last:border-b-0">
                                        <h3 className="font-semibold text-slate-800 text-lg mb-2">Passenger {index + 1}</h3>
                                        <p className="text-slate-700"><span className="font-medium">Name:</span> {p.name}</p>
                                        <p className="text-slate-700"><span className="font-medium">Email:</span> {p.email}</p>
                                        <p className="text-slate-700"><span className="font-medium">Phone:</span> {p.phone}</p>
                                        <p className="text-slate-700"><span className="font-medium">Aadhar:</span> {p.aadhar}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Itinerary Overview */}
                        <div className="glass border border-border rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-bold text-slate-900">Trip Itinerary</h2>
                                <Link to="/trip-builder" className="text-brand-primary hover:underline flex items-center gap-1">
                                    <Edit3 className="w-4 h-4" /> Edit
                                </Link>
                            </div>
                            <h3 className="font-semibold text-slate-800 text-lg mb-2">{trip.tripName || trip.name}</h3>
                            <p className="text-slate-700 mb-4">{trip.desc} · {trip.duration}</p>

                            <div className="space-y-4">
                                {trip.segments?.map((segment, index) => {
                                    const SegmentIcon = SEGMENT_TYPES[segment.type]?.icon || Map;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-surface-subtle rounded-xl border border-border">
                                            <SegmentIcon className="w-5 h-5 text-brand-primary" />
                                            <div>
                                                <p className="font-medium text-slate-800">{segment.from} {segment.to && `→ ${segment.to}`}</p>
                                                <p className="text-slate-600 text-sm">{segment.detail} · {segment.date} · ₹{segment.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cost & Confirmation */}
                    <div className="space-y-8">
                        {/* Cost Breakdown */}
                        <div className="glass border border-border rounded-3xl p-6">
                            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Cost Breakdown</h2>
                            <div className="space-y-2 text-slate-700">
                                <div className="flex justify-between">
                                    <span>Base Trip Cost</span>
                                    <span>₹{(totalCost - (trip.estimatedFoodCost || 0)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Food & Activities</span>
                                    <span>₹{(trip.estimatedFoodCost || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-border pt-3 mt-3">
                                    <span>Total Estimated Cost</span>
                                    <span className="text-brand-primary">₹{totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation */}
                        <div className="glass border border-brand-400/20 rounded-3xl p-6 bg-brand-50">
                            <h2 className="font-display text-xl font-bold text-brand-700 mb-4">Ready to Book?</h2>
                            <p className="text-brand-600 mb-6">
                                By confirming, your trip details will be sent to a VoyageAI travel agent who will finalize all bookings.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleConfirmBooking}
                                disabled={loading}
                                className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl shadow-brand hover:shadow-brand/40 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Plane className="w-5 h-5" />
                                        </motion.div>
                                        Finalizing Bookings...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" /> Confirm & Send to Agent
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Agent Info (after confirmation) */}
                        {confirmed && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass border border-success/20 rounded-3xl p-6 bg-success/5"
                            >
                                <h2 className="font-display text-xl font-bold text-success mb-4">Your Travel Agent</h2>
                                <p className="text-success-dark mb-4">
                                    Your request has been sent! A dedicated VoyageAI travel agent will review your trip and contact you shortly.
                                </p>
                                <div className="space-y-2 text-success-dark">
                                    <p className="flex items-center gap-2"><User className="w-4 h-4" /> Agent Smith</p>
                                    <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> agent@voyageai.com</p>
                                    <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}