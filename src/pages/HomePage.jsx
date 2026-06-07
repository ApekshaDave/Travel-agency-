import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles, ArrowRight, Plane, Globe2, Zap,
  MessageSquare, TrendingUp, MapPin, ChevronRight,
  Clock, Users, Building2, Train, Bus, CheckCircle, Map,
  Star, Shield, Headphones
} from 'lucide-react'

const DESTINATIONS = [
  { city: 'Bali', country: 'Indonesia', temp: '28°C', tag: 'Beach & Culture', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80' },
  { city: 'Paris', country: 'France', temp: '18°C', tag: 'Romance & Art', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80' },
  { city: 'Tokyo', country: 'Japan', temp: '22°C', tag: 'Culture & Tech', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80' },
  { city: 'Dubai', country: 'UAE', temp: '35°C', tag: 'Luxury & Sky', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80' },
  { city: 'New York', country: 'USA', temp: '20°C', tag: 'Business & Life', img: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=500&q=80' },
  { city: 'Maldives', country: 'Maldives', temp: '30°C', tag: 'Paradise & Reefs', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500&q=80' },
]

const STATS = [
  { value: '50K+', label: 'Happy Travelers', icon: Users, color: 'text-brand' },
  { value: '94%', label: 'Bookings Automated', icon: Zap, color: 'text-accent' },
  { value: '3.2×', label: 'Faster Than Portals', icon: Clock, color: 'text-success' },
  { value: '40%', label: 'Cost Reduction', icon: TrendingUp, color: 'text-info' },
]

const CHAT_EXAMPLES = [
  '"Book me Delhi to Singapore next Friday, economy, under ₹20,000"',
  '"Find me a 5-day beach trip in December with flexible dates"',
  '"I need to fly to London on the 15th, check visa requirements"',
  '"Change my Mumbai flight to the evening departure"',
]

const HOW_STEPS = [
  {
    step: '01', title: 'Tell AI your plan',
    desc: 'Type naturally — "I want to visit Thailand next month, budget ₹50K, 7 nights." No forms, no filters.',
    icon: MessageSquare, color: 'text-accent', preview: 'Book me a trip to Bali...',
  },
  {
    step: '02', title: 'AI curates options',
    desc: 'VoyageAI searches live inventory, checks visa rules, and presents the best options for you.',
    icon: Sparkles, color: 'text-brand', preview: '3 Best Flights Found',
  },
  {
    step: '03', title: 'Confirm and fly',
    desc: 'Confirm with one click. AI handles check-in, seat selection, and changes after you book.',
    icon: Plane, color: 'icon-box-green', preview: 'Ticket Confirmed! ✓',
  },
]

const QUICK_LINKS = [
  { label: 'Trip Builder', icon: Sparkles, path: '/trip-builder', color: 'bg-pink-50 text-pink-600' },
  { label: 'Visa Checker', icon: Globe2, path: '/visa', color: 'bg-blue-50 text-blue-600' },
  { label: 'AI Chat', icon: MessageSquare, path: '/chat', color: 'bg-orange-50 text-orange-600' },
]

function DestinationImage({ src, alt }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <MapPin className="w-12 h-12 text-blue-400" />
      </div>
    )
  }
  return (
    <img
      src={src} alt={alt} onError={() => setError(true)}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
  )
}

export default function HomePage() {
  const [chatIdx, setChatIdx] = useState(0)
  const [chatVisible, setChatVisible] = useState(true)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    const interval = setInterval(() => {
      setChatVisible(false)
      setTimeout(() => {
        setChatIdx(i => (i + 1) % CHAT_EXAMPLES.length)
        setChatVisible(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-hidden">
      {/* ─── HERO (light, vibrant) ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-surface-light">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-surface-subtle pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 to-transparent pointer-events-none" />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,110,189,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />

        {/* Orbiting plane (now a subtle background element) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -ml-3 -mt-3 hidden lg:block"
          style={{ originX: '50%', originY: '50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div style={{ transform: 'translateX(270px)' }}>
            <Plane className="w-5 h-5 text-white/20" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-200 bg-brand-50 text-brand-600 backdrop-blur mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-bold tracking-wider uppercase">AI-First Travel Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 text-slate-900"
          >
            <span>Travel the way</span>
            <br />
            <span className="text-shimmer italic">you imagine it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Just describe your trip. VoyageAI understands you, finds the best flights,
            books instantly, and manages everything after — all through natural conversation.
          </motion.p>

          {/* Chat demo */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <div className="glass-dark rounded-2xl p-4 flex items-center gap-4 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center flex-shrink-0 shadow-accent-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <motion.p
                key={chatIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: chatVisible ? 1 : 0, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm md:text-base text-white/70 italic flex-1 text-left"
              >
                {CHAT_EXAMPLES[chatIdx]}
              </motion.p>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="typing-dot w-1.5 h-1.5 bg-orange-400 rounded-full" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </motion.div> */}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/passenger-details"
                className="inline-flex items-center gap-3 px-8 py-4 bg-brand-gradient text-white font-bold text-lg rounded-2xl shadow-brand hover:shadow-[0_0_40px_rgba(26,110,189,0.5)] transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                Let's Start Travelling
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/search"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-semibold text-lg rounded-2xl transition-all duration-300"
              >
                <Plane className="w-5 h-5 text-blue-300" />
                Search Flights
              </Link>
            </motion.div> */}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="hidden md:flex absolute bottom-8 right-8 flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1.5">
            <motion.div
              className="w-1 h-1.5 bg-orange-400 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── QUICK LINKS (now on white bg) ────────────────────────────────── */}
      <section className="bg-white py-10 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold text-center mb-6">Quick Access</p>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ label, icon: Icon, path, color }) => {
              const IconComponent = Icon; // Renamed to avoid conflict with JSX element
              return (
                <Link
                  key={label}
                  to={path}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group hover:-translate-y-1 hover:shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-surface rounded-2xl p-6 border border-border shadow-sm text-center hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-display text-3xl font-bold text-slate-900 mb-1">{value}</p>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-tag">How VoyageAI Works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">
              Three steps. Zero friction.
            </h2>
            <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
              From idea to boarding pass in minutes — powered by AI that understands you.
            </p>
          </motion.div>

          <div className="space-y-12">
            {HOW_STEPS.map(({ step, title, desc, icon: Icon, color, preview }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center bg-surface-subtle shadow-sm`}>
                    <Icon className="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1 max-w-md">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                    Step {step} · {preview}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEQUENTIAL JOURNEY ───────────────────────────────────────────── */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-tag">Your Journey</span>
            <h2 className="font-display text-4xl font-bold text-slate-900">A Seamless Travel Experience</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">No more jumping between tabs. We guide you from imagination to boarding.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 relative">
            <div className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent hidden md:block" />
            {[
              { step: '01', label: 'Imagine', desc: 'Chat with AI to shape your journey.', icon: MessageSquare, bg: 'bg-blue-500', iconColor: 'text-white' },
              { step: '02', label: 'Select', desc: 'Pick the best flights and stays.', icon: Plane, bg: 'bg-orange-500', iconColor: 'text-white' },
              { step: '03', label: 'Customize', desc: 'Add meals, seats & protection.', icon: Zap, bg: 'bg-purple-500', iconColor: 'text-white' },
              { step: '04', label: 'Fly', desc: 'One-click book & auto check-in.', icon: CheckCircle, bg: 'bg-green-500', iconColor: 'text-white' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 bg-surface rounded-2xl p-6 text-center border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                  <s.icon className={`w-7 h-7 ${s.iconColor}`} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Step {s.step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{s.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12 flex-wrap gap-4"
          >
            <div>
              <span className="section-tag">Trending Destinations</span>
              <h2 className="font-display text-4xl font-bold text-slate-900">Where will you go?</h2>
            </div>
            <Link to="/search" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESTINATIONS.map(({ city, country, temp, tag, img }, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 shadow-sm hover:shadow-xl transition-shadow border border-border"
              >
                <DestinationImage src={img} alt={city} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white">{city}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-sm mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {country}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-300 font-bold text-sm">{temp}</div>
                      <div className="text-white/60 text-xs mt-0.5">{tag}</div>
                    </div>
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Link
                    to={`/chat?dest=${city}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brand-hover transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> Plan Trip
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST SIGNALS ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'Bank-grade encryption on every transaction', color: 'icon-box-blue' },
              { icon: Star, title: '4.9/5 Rating', desc: 'Based on 12,000+ verified customer reviews', color: 'icon-box-amber' },
              { icon: Headphones, title: '24/7 Support', desc: 'Expert travel agents available around the clock', color: 'icon-box-green' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-surface-subtle`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="bg-white py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0E2042 0%, #1558A0 40%, #112D56 70%, #1A0E28 100%)'
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative z-10 p-10 lg:p-16 text-center">
              <Globe2 className="w-14 h-14 text-orange-400 mx-auto mb-6" />
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Your next adventure<br />starts with a sentence.
              </h2>
              <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
                No more travel portals. No more phone calls. Just tell VoyageAI what you want.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-brand-gradient text-white font-bold text-base rounded-2xl shadow-brand hover:shadow-[0_0_40px_rgba(26,110,189,0.5)] transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5" />
                    Try VoyageAI Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <Link to="/corporate" className="text-sm text-blue-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                  For agencies & corporates <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center shadow-accent-sm">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">VoyageAI</span>
            </div>
            <p className="text-slate-500 text-sm">© 2025 VoyageAI · AI-First Travel Platform</p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
