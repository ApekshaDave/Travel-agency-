import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Users, User, Mail, Phone, CreditCard, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PassengerDetailsPage() {
    const navigate = useNavigate();
    const [groupSize, setGroupSize] = useState('solo'); // 'solo', 'small', 'big'
    const [numPassengers, setNumPassengers] = useState(1);
    const [passengers, setPassengers] = useState([{ name: '', email: '', phone: '', aadhar: '' }]);
    const [errors, setErrors] = useState({});

    const handleGroupSizeChange = (size) => {
        setGroupSize(size);
        let newNum = 1;
        if (size === 'small') newNum = 2;
        if (size === 'big') newNum = 6;
        setNumPassengers(newNum);
        setPassengers(Array.from({ length: newNum }, () => ({ name: '', email: '', phone: '', aadhar: '' })));
        setErrors({});
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
        setErrors(prev => ({ ...prev, [`${field}-${index}`]: '' }));
    };

    const validate = () => {
        let isValid = true;
        const newErrors = {};

        passengers.forEach((p, index) => {
            if (!p.name.trim()) {
                newErrors[`name-${index}`] = 'Name is required';
                isValid = false;
            }
            if (!p.email.trim()) {
                newErrors[`email-${index}`] = 'Email is required';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
                newErrors[`email-${index}`] = 'Invalid email';
                isValid = false;
            }
            if (!p.phone.trim()) {
                newErrors[`phone-${index}`] = 'Phone is required';
                isValid = false;
            } else if (!/^\+?[\d\s-]{10,15}$/.test(p.phone)) {
                newErrors[`phone-${index}`] = 'Invalid phone';
                isValid = false;
            }
            if (!p.aadhar.trim()) {
                newErrors[`aadhar-${index}`] = 'Aadhar is required';
                isValid = false;
            } else if (!/^\d{12}$/.test(p.aadhar)) {
                newErrors[`aadhar-${index}`] = 'Invalid Aadhar (12 digits)';
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        if (validate()) {
            // Store passenger data in local storage or context for TripBuilder
            localStorage.setItem('voyageai_passenger_details', JSON.stringify(passengers));
            navigate('/trip-builder');
        } else {
            toast.error('Please fill in all required passenger details correctly.');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 bg-surface-light">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Who's Travelling?</h1>
                    <p className="text-slate-600">Tell us about your group so we can tailor your trip.</p>
                </motion.div>

                <div className="glass border border-border rounded-3xl p-6 mb-8">
                    <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Select Your Group Size</h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={() => handleGroupSizeChange('solo')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all ${groupSize === 'solo' ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-border text-slate-600 hover:border-brand-200'}`}
                        >
                            <User className="w-8 h-8 mb-2" />
                            <span className="font-semibold">Solo Traveller</span>
                        </button>
                        <button
                            onClick={() => handleGroupSizeChange('small')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all ${groupSize === 'small' ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-border text-slate-600 hover:border-brand-200'}`}
                        >
                            <Users className="w-8 h-8 mb-2" />
                            <span className="font-semibold">Small Group (2-5)</span>
                        </button>
                        <button
                            onClick={() => handleGroupSizeChange('big')}
                            className={`flex flex-col items-center p-4 rounded-xl border transition-all ${groupSize === 'big' ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-border text-slate-600 hover:border-brand-200'}`}
                        >
                            <Users className="w-8 h-8 mb-2" />
                            <span className="font-semibold">Big Group (6+)</span>
                        </button>
                    </div>

                    {groupSize === 'small' && (
                        <div className="mb-6">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Number of Passengers (2-5)</label>
                            <input
                                type="number"
                                min="2"
                                max="5"
                                value={numPassengers}
                                onChange={(e) => {
                                    const val = Math.min(5, Math.max(2, parseInt(e.target.value) || 2));
                                    setNumPassengers(val);
                                    setPassengers(Array.from({ length: val }, () => ({ name: '', email: '', phone: '', aadhar: '' })));
                                }}
                                className="ai-input w-full px-4 py-3 rounded-xl text-slate-900 text-sm"
                            />
                        </div>
                    )}

                    {groupSize === 'big' && (
                        <div className="mb-6">
                            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Number of Passengers</label>
                            <input
                                type="number"
                                min="6"
                                value={numPassengers}
                                onChange={(e) => {
                                    const val = Math.max(6, parseInt(e.target.value) || 6);
                                    setNumPassengers(val);
                                    setPassengers(Array.from({ length: val }, () => ({ name: '', email: '', phone: '', aadhar: '' })));
                                }}
                                className="ai-input w-full px-4 py-3 rounded-xl text-slate-900 text-sm"
                            />
                        </div>
                    )}

                    <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Passenger Details</h2>
                    {passengers.map((p, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="space-y-4 mb-6 p-4 border border-border rounded-xl bg-surface-subtle"
                        >
                            <h3 className="font-semibold text-slate-800 text-lg mb-2">Passenger {index + 1}</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                        placeholder="John Doe"
                                        className="ai-input w-full px-4 py-3 rounded-xl text-slate-900 text-sm"
                                    />
                                    {errors[`name-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`name-${index}`]}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        value={p.email}
                                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                                        placeholder="john.doe@example.com"
                                        className="ai-input w-full px-4 py-3 rounded-xl text-slate-900 text-sm"
                                    />
                                    {errors[`email-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`email-${index}`]}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={p.phone}
                                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="ai-input w-full px-4 py-3 rounded-xl text-slate-900 text-sm"
                                    />
                                    {errors[`phone-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`phone-${index}`]}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Aadhar Card Number</label>
                                    <input
                                        type="text"
                                        value={p.aadhar}
                                        onChange={(e) => handlePassengerChange(index, 'aadhar', e.target.value)}
                                        placeholder="XXXX XXXX XXXX"
                                        maxLength="12"
                                        className="ai-input w-full px-4 py-3 rounded-xl text-slate-900 text-sm"
                                    />
                                    {errors[`aadhar-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`aadhar-${index}`]}</p>}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full py-4 mt-6 bg-brand-gradient text-white font-bold rounded-xl shadow-brand hover:shadow-brand/40 transition-all flex items-center justify-center gap-2"
                    >
                        Continue to Trip Planning <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}