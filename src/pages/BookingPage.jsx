import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import {
  User, Mail, Phone, CreditCard, Lock, CheckCircle,
  Plane, Clock, ArrowRight, Shield, 
  Sparkles, ShieldCheck
} from 'lucide-react'
import StepProgress from '../components/common/StepProgress'
import StickyActionBar from '../components/common/StickyActionBar'
import PolicyBanner from '../components/common/PolicyBanner'
import { useBookingStore } from '../store/bookingStore'
import toast from 'react-hot-toast'

const STEPS = ['Traveler Details', 'Add-ons', 'Payment', 'Confirmation']

const mockFlight = {
  airline: 'Air India', code: 'AI 619',
  from: 'DEL', fromCity: 'Delhi',
  to: 'BOM', toCity: 'Mumbai',
  depart: '09:30', arrive: '11:50', duration: '2h 20m', stops: 0,
  price: 5800, class: 'Economy', logo: '🔴',
}

export default function BookingPage() {
  const {
    selectedFlight,
    travelerDetails,
    setTravelerDetails,
    addons: storeAddons,
    setAddons: setStoreAddons,
    setBookingRef: setStoreBookingRef
  } = useBookingStore()

  const flight = selectedFlight || mockFlight
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: travelerDetails?.firstName || '',
    lastName: travelerDetails?.lastName || '',
    email: travelerDetails?.email || '',
    phone: travelerDetails?.phone || '',
    dob: travelerDetails?.dob || '',
    passport: travelerDetails?.passport || '',
    nationality: travelerDetails?.nationality || '',
  })
  const [addons, setAddons] = useState(storeAddons || { meal: false, baggage: false, insurance: false, lounge: false })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '', expiry: '', cvv: '', cardName: '',
    upiId: '',
    bank: '',
  })
  const [paying, setPaying] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingRef] = useState(() => `VAI-${Math.random().toString(36).substring(2,8).toUpperCase()}`)

  const [errors, setErrors] = useState({})
  const [paymentErrors, setPaymentErrors] = useState({})

  const addonTotal = (addons.meal ? 350 : 0) + (addons.baggage ? 800 : 0) + (addons.insurance ? 499 : 0) + (addons.lounge ? 1200 : 0)
  const total = flight.price + addonTotal

  const validateTravelerDetails = () => {
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-]{10,15}$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number (10-15 digits)'
    }

    if (!form.dob) {
      newErrors.dob = 'Date of birth is required'
    } else {
      const dobDate = new Date(form.dob)
      const today = new Date()
      if (dobDate >= today) {
        newErrors.dob = 'Date of birth must be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePayment = () => {
    const newErrors = {}
    if (paymentMethod === 'card') {
      const cleanCard = paymentForm.cardNumber.replace(/\s+/g, '')
      if (!cleanCard) {
        newErrors.cardNumber = 'Card number is required'
      } else if (!/^\d{15,19}$/.test(cleanCard)) {
        newErrors.cardNumber = 'Card number should be 15-19 digits'
      }

      if (!paymentForm.expiry.trim()) {
        newErrors.expiry = 'Expiry is required'
      } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentForm.expiry.trim())) {
        newErrors.expiry = 'Use MM/YY format'
      }

      if (!paymentForm.cvv.trim()) {
        newErrors.cvv = 'CVV is required'
      } else if (!/^\d{3,4}$/.test(paymentForm.cvv.trim())) {
        newErrors.cvv = 'Must be 3 or 4 digits'
      }

      if (!paymentForm.cardName.trim()) {
        newErrors.cardName = 'Name on card is required'
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentForm.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required'
      } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(paymentForm.upiId.trim())) {
        newErrors.upiId = 'Invalid UPI ID format (e.g. name@bank)'
      }
    } else if (paymentMethod === 'netbanking') {
      if (!paymentForm.bank) {
        newErrors.bank = 'Please select a bank'
      }
    }

    setPaymentErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep0Next = () => {
    if (validateTravelerDetails()) {
      setTravelerDetails(form)
      setStep(1)
    } else {
      toast.error('Please fix the errors in the traveler details form.')
    }
  }

  const handleConfirm = () => {
    if (!validatePayment()) {
      toast.error('Please fill in the payment details correctly.')
      return
    }
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setConfirmed(true)
      setStoreBookingRef(bookingRef)
      setStep(3)
    }, 2200)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <StepProgress steps={STEPS} currentStep={3} />
          <div className="glass gradient-border rounded-3xl p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-sage-400 to-sage-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(126,200,164,0.4)]"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">Booking Confirmed! ✈</h2>
            <p className="text-muted mb-2">Booking reference: <span className="font-mono text-gold-400 font-bold">{bookingRef}</span></p>
            <p className="text-muted text-sm mb-8">E-ticket sent to {form.email || 'your email'}. Check-in opens 48h before departure.</p>

            <div className="glass border border-border rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{flight.airline} · {flight.code}</div>
                  <div className="text-muted text-sm">{flight.fromCity} → {flight.toCity}</div>
                </div>
                <div className="text-gold-400 font-bold">₹{total.toLocaleString()}</div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted">
                <span>{flight.depart} → {flight.arrive}</span>
                <span>·</span>
                <span>{flight.duration}</span>
                <span>·</span>
                <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="flex-1 py-3 glass border border-border hover:border-gold-400/30 rounded-xl text-white text-sm font-medium text-center transition-all"
              >
                View My Trips
              </Link>
              <Link
                to="/chat"
                className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-gold-sm"
              >
                <Sparkles className="w-4 h-4" /> Ask AI Assistant
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
          <p className="text-muted text-lg">Review details and confirm payment to secure your seat</p>
        </motion.div>

        <StepProgress steps={STEPS} currentStep={step} />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main form */}
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {/* STEP 0: Traveler Details */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass gradient-border rounded-3xl p-6"
                >
                  <h2 className="font-display text-xl font-bold text-white mb-5">Traveler Details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'firstName', label: `First Name`, required: true, icon: User, placeholder: 'As on passport' },
                      { key: 'lastName', label: `Last Name`, required: true, icon: User, placeholder: 'As on passport' },
                      { key: 'email', label: `Email`, required: true, icon: Mail, placeholder: 'ticket@email.com', type: 'email' },
                      { key: 'phone', label: `Phone`, required: true, icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
                      { key: 'dob', label: 'Date of Birth', required: true, icon: null, placeholder: '', type: 'date' },
                      { key: 'passport', label: 'Passport Number', required: false, icon: null, placeholder: 'Optional for domestic' },
                    ].map(({ key, label, required, icon: Icon, placeholder, type = 'text' }) => (
                      <div key={key}>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">
                          {label} {required && <span className="text-red-400">*</span>}
                        </label>
                        <div className="relative">
                          {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-muted" />}
                          <input
                            type={type}
                            value={form[key] || ''}
                            onChange={e => {
                              setForm(f => ({ ...f, [key]: e.target.value }))
                              if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
                            }}
                            placeholder={placeholder}
                            className={`ai-input w-full py-3 rounded-xl text-white text-sm ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
                          />
                        </div>
                        {errors[key] && <p className="text-red-400 text-xs mt-1 font-medium">{errors[key]}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-start gap-3 p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                    <Shield className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sky-200/80 text-xs leading-relaxed">
                      Your data is encrypted and never shared with third parties. We comply with DPDP Act 2023.
                    </p>
                  </div>

                  <button
                    onClick={handleStep0Next}
                    className="mt-5 w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Add-ons <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 1: Add-ons */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass gradient-border rounded-3xl p-6"
                >
                  <h2 className="font-display text-xl font-bold text-white mb-5">Enhance Your Journey</h2>
                  <div className="space-y-3">
                    {[
                      { key: 'meal', label: 'Meal Selection', desc: 'Choose from Veg, Non-Veg, Jain options', price: 350, icon: '🍽' },
                      { key: 'baggage', label: 'Extra Baggage 15kg', desc: 'Add 15kg checked baggage allowance', price: 800, icon: '🧳' },
                      { key: 'insurance', label: 'Travel Insurance', desc: 'Trip cancellation + medical coverage', price: 499, icon: '🛡', badge: 'Recommended' },
                      { key: 'lounge', label: 'Airport Lounge Access', desc: 'Relax in the business lounge pre-flight', price: 1200, icon: '🛋' },
                    ].map(({ key, label, desc, price, icon, badge }) => (
                      <div
                        key={key}
                        onClick={() => setAddons(a => ({ ...a, [key]: !a[key] }))}
                        className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                          addons[key]
                            ? 'border-gold-400/40 bg-gold-400/5'
                            : 'border-border hover:border-border/80 glass'
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{label}</span>
                            {badge && (
                              <span className="px-2 py-0.5 bg-sage-400/15 text-sage-400 text-xs rounded-full border border-sage-400/20">{badge}</span>
                            )}
                          </div>
                          <div className="text-muted text-xs mt-0.5">{desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold-400 font-semibold">+₹{price}</div>
                          <div className={`w-5 h-5 rounded-full border-2 mt-1 ml-auto flex items-center justify-center transition-all ${
                            addons[key] ? 'bg-gold-400 border-gold-400' : 'border-muted'
                          }`}>
                            {addons[key] && <CheckCircle className="w-3 h-3 text-void" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="px-5 py-3 glass border border-border rounded-xl text-muted text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        setStoreAddons(addons)
                        setStep(2)
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm flex items-center justify-center gap-2"
                    >
                      Continue to Payment <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass gradient-border rounded-3xl p-6"
                >
                  <h2 className="font-display text-xl font-bold text-white mb-5">Payment</h2>

                  <div className="flex gap-3 mb-5">
                    {[
                      { id: 'card', label: 'Credit/Debit Card' },
                      { id: 'upi', label: 'UPI' },
                      { id: 'netbanking', label: 'Net Banking' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.id)
                          setPaymentErrors({})
                        }}
                        className={`flex-1 py-2.5 border rounded-xl text-sm transition-all ${
                          paymentMethod === method.id
                            ? 'bg-gold-400/10 border-gold-400 text-gold-400 font-medium'
                            : 'glass border-border text-muted hover:text-white hover:border-gold-400/20'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted" />
                          <input
                            type="text"
                            value={paymentForm.cardNumber}
                            onChange={e => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                              setPaymentForm(f => ({ ...f, cardNumber: formatted }))
                              if (paymentErrors.cardNumber) setPaymentErrors(prev => ({ ...prev, cardNumber: '' }))
                            }}
                            placeholder="4242 4242 4242 4242"
                            className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm font-mono"
                          />
                        </div>
                        {paymentErrors.cardNumber && <p className="text-red-400 text-xs mt-1 font-medium">{paymentErrors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Expiry</label>
                          <input
                            type="text"
                            value={paymentForm.expiry}
                            onChange={e => {
                              let value = e.target.value.replace(/\D/g, '').slice(0, 4)
                              if (value.length > 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2)
                              }
                              setPaymentForm(f => ({ ...f, expiry: value }))
                              if (paymentErrors.expiry) setPaymentErrors(prev => ({ ...prev, expiry: '' }))
                            }}
                            placeholder="MM / YY"
                            className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm font-mono"
                          />
                          {paymentErrors.expiry && <p className="text-red-400 text-xs mt-1 font-medium">{paymentErrors.expiry}</p>}
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">CVV</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted" />
                            <input
                              type="password"
                              value={paymentForm.cvv}
                              onChange={e => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                                setPaymentForm(f => ({ ...f, cvv: value }))
                                if (paymentErrors.cvv) setPaymentErrors(prev => ({ ...prev, cvv: '' }))
                              }}
                              placeholder="•••"
                              className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm font-mono"
                            />
                          </div>
                          {paymentErrors.cvv && <p className="text-red-400 text-xs mt-1 font-medium">{paymentErrors.cvv}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Name on Card</label>
                        <input
                          type="text"
                          value={paymentForm.cardName}
                          onChange={e => {
                            setPaymentForm(f => ({ ...f, cardName: e.target.value }))
                            if (paymentErrors.cardName) setPaymentErrors(prev => ({ ...prev, cardName: '' }))
                          }}
                          placeholder="FULL NAME"
                          className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm uppercase"
                        />
                        {paymentErrors.cardName && <p className="text-red-400 text-xs mt-1 font-medium">{paymentErrors.cardName}</p>}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">UPI ID / VPA</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={paymentForm.upiId}
                            onChange={e => {
                              setPaymentForm(f => ({ ...f, upiId: e.target.value }))
                              if (paymentErrors.upiId) setPaymentErrors(prev => ({ ...prev, upiId: '' }))
                            }}
                            placeholder="john@okaxis"
                            className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm"
                          />
                        </div>
                        {paymentErrors.upiId && <p className="text-red-400 text-xs mt-1 font-medium">{paymentErrors.upiId}</p>}
                        <p className="text-[10px] text-muted mt-1.5">Enter your Virtual Payment Address (e.g., name@upi)</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Select Bank</label>
                        <select
                          value={paymentForm.bank}
                          onChange={e => {
                            setPaymentForm(f => ({ ...f, bank: e.target.value }))
                            if (paymentErrors.bank) setPaymentErrors(prev => ({ ...prev, bank: '' }))
                          }}
                          className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm bg-void border border-border"
                        >
                          <option value="" className="bg-void text-white">-- Select Your Bank --</option>
                          <option value="sbi" className="bg-void text-white">State Bank of India</option>
                          <option value="hdfc" className="bg-void text-white">HDFC Bank</option>
                          <option value="icici" className="bg-void text-white">ICICI Bank</option>
                          <option value="axis" className="bg-void text-white">Axis Bank</option>
                          <option value="kotak" className="bg-void text-white">Kotak Mahindra Bank</option>
                        </select>
                        {paymentErrors.bank && <p className="text-red-400 text-xs mt-1 font-medium">{paymentErrors.bank}</p>}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <Lock className="w-3.5 h-3.5 text-sage-400" />
                    256-bit SSL encrypted · PCI DSS compliant
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button onClick={() => setStep(1)} className="px-5 py-3 glass border border-border rounded-xl text-muted text-sm">Back</button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={paying}
                      className="flex-1 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold hover:shadow-[0_0_40px_rgba(232,180,41,0.5)] transition-all flex items-center justify-center gap-2"
                    >
                      {paying ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <Plane className="w-4 h-4" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay ₹{total.toLocaleString()} & Confirm
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="glass border border-border rounded-2xl p-5 sticky top-28">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-gold-400" /> Booking Summary
              </h3>

              {/* Flight */}
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{flight.logo}</span>
                  <span className="text-white font-semibold text-sm">{flight.airline}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted mt-2">
                  <span>{flight.fromCity}</span>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-8 h-px bg-border" />
                    <Plane className="w-3 h-3" />
                    <div className="w-8 h-px bg-border" />
                  </div>
                  <span>{flight.toCity}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-muted">
                  <span>{flight.depart}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{flight.duration}</span>
                  <span>{flight.arrive}</span>
                </div>
              </div>

              {/* Fare breakdown */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-muted">
                  <span>Base fare</span>
                  <span className="text-white">₹{flight.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Taxes & fees</span>
                  <span className="text-white">Included</span>
                </div>
                {addonTotal > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Add-ons</span>
                    <span className="text-white">₹{addonTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span className="text-white">Total</span>
                  <span className="text-gold-400">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Security notice */}
              <div className="flex items-start gap-2 p-3 bg-sage-400/10 border border-sage-400/20 rounded-xl">
                <Shield className="w-4 h-4 text-sage-400 flex-shrink-0 mt-0.5" />
                <p className="text-sage-300/80 text-xs">Price locked for 10 minutes. Instant e-ticket delivery.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Mobile Footer */}
      {step < 3 && (
        <StickyActionBar>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">₹{total.toLocaleString()}</span>
            <span className="text-muted text-[10px] uppercase tracking-wider italic">Total Amount</span>
          </div>
          <button
            onClick={() => {
              if (step === 0) handleStep0Next()
              else if (step === 1) {
                setStoreAddons(addons)
                setStep(2)
              }
              else if (step === 2) handleConfirm()
            }}
            className="px-6 py-3 bg-gold-gradient text-void font-bold rounded-xl shadow-gold flex items-center gap-2 text-sm"
          >
            {step === 2 ? 'Pay & Confirm' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </StickyActionBar>
      )}
    </div>
  )
}
