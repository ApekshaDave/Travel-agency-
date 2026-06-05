import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import {
  User, Mail, Phone, CreditCard, Lock, CheckCircle,
  Plane, Clock, ArrowRight, Shield, 
  Sparkles
} from 'lucide-react'

const STEPS = ['Traveler Details', 'Add-ons', 'Payment', 'Confirmation']

const mockFlight = {
  airline: 'Air India', code: 'AI 619',
  from: 'DEL', fromCity: 'Delhi',
  to: 'BOM', toCity: 'Mumbai',
  depart: '09:30', arrive: '11:50', duration: '2h 20m', stops: 0,
  price: 5800, class: 'Economy', logo: '🔴',
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, i) => (
        <>
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                i < current
                  ? 'bg-gold-400 border-gold-400 text-void'
                  : i === current
                  ? 'bg-gold-400/15 border-gold-400 text-gold-400'
                  : 'bg-surface border-border text-muted'
              }`}
            >
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </motion.div>
            <span className={`text-xs mt-1.5 hidden sm:block ${
              i === current ? 'text-gold-400 font-medium' : 'text-muted'
            }`}>{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 max-w-16 transition-all duration-500 ${
              i < current ? 'bg-gold-400' : 'bg-border'
            }`} />
          )}
        </>
      ))}
    </div>
  )
}

export default function BookingPage() {
  const location = useLocation()
  const flight = location.state?.flight || mockFlight
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', passport: '', nationality: '',
  })
  const [addons, setAddons] = useState({ meal: false, baggage: false, insurance: false, lounge: false })
  const [paying, setPaying] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingRef] = useState(() => `VAI-${Math.random().toString(36).substring(2,8).toUpperCase()}`)

  const addonTotal = (addons.meal ? 350 : 0) + (addons.baggage ? 800 : 0) + (addons.insurance ? 499 : 0) + (addons.lounge ? 1200 : 0)
  const total = flight.price + addonTotal

  const handleConfirm = () => {
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setConfirmed(true)
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
          <StepIndicator current={3} />
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
          <h1 className="font-display text-3xl font-bold text-white mb-1">Complete Your Booking</h1>
          <p className="text-muted text-sm">Secure booking powered by VoyageAI</p>
        </motion.div>

        <StepIndicator current={step} />

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
                      { key: 'firstName', label: 'First Name', icon: User, placeholder: 'As on passport' },
                      { key: 'lastName', label: 'Last Name', icon: User, placeholder: 'As on passport' },
                      { key: 'email', label: 'Email', icon: Mail, placeholder: 'ticket@email.com', type: 'email' },
                      { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
                      { key: 'dob', label: 'Date of Birth', icon: null, placeholder: '', type: 'date' },
                      { key: 'passport', label: 'Passport Number', icon: null, placeholder: 'For international flights' },
                    ].map(({ key, label, icon: Icon, placeholder, type = 'text' }) => (
                      <div key={key}>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">{label}</label>
                        <div className="relative">
                          {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-muted" />}
                          <input
                            type={type}
                            value={form[key]}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className={`ai-input w-full py-3 rounded-xl text-white text-sm ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
                          />
                        </div>
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
                    onClick={() => setStep(1)}
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
                      onClick={() => setStep(2)}
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
                    {['Credit/Debit Card', 'UPI', 'Net Banking'].map(method => (
                      <button
                        key={method}
                        className="flex-1 py-2.5 glass border border-border hover:border-gold-400/30 rounded-xl text-sm text-muted hover:text-white transition-all"
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted" />
                        <input
                          placeholder="4242 4242 4242 4242"
                          className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Expiry</label>
                        <input placeholder="MM / YY" className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm font-mono" />
                      </div>
                      <div>
                        <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">CVV</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted" />
                          <input placeholder="•••" className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm font-mono" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1.5 block uppercase tracking-wider">Name on Card</label>
                      <input placeholder="FULL NAME" className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm uppercase" />
                    </div>
                  </div>

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
    </div>
  )
}
