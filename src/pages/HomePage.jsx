import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles, ArrowRight, Plane, Globe2, ShieldCheck, Zap, Bot,
  MessageSquare, TrendingUp, MapPin, ChevronRight,
  Clock, Users, Building2, Train, Bus, CheckCircle, Map
} from 'lucide-react'

const DESTINATIONS = [
  { city: 'Bali', country: 'Indonesia', temp: '28°C', tag: 'Beach & Culture', color: 'from-amber-500/20 to-orange-600/10', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
  { city: 'Paris', country: 'France', temp: '18°C', tag: 'Romance & Art', color: 'from-rose-500/20 to-pink-600/10', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
  { city: 'Tokyo', country: 'Japan', temp: '22°C', tag: 'Culture & Tech', color: 'from-violet-500/20 to-purple-600/10', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80' },
  { city: 'Dubai', country: 'UAE', temp: '35°C', tag: 'Luxury & Sky', color: 'from-yellow-500/20 to-gold-600/10', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80' },
  { city: 'New York', country: 'USA', temp: '20°C', tag: 'Business & Life', color: 'from-blue-500/20 to-sky-600/10', img: 'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=400&q=80' },
  { city: 'Maldives', country: 'Maldives', temp: '30°C', tag: 'Paradise & Reefs', color: 'from-teal-500/20 to-cyan-600/10', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80' },
]

const FEATURES = [
  {
    icon: Bot,
    title: 'Conversational Booking',
    desc: 'Just describe your trip in plain language. Our AI understands intent, budget, and preferences — no forms, no filters.',
    color: 'text-gold-400',
    glow: 'shadow-gold-sm',
  },
  {
    icon: ShieldCheck,
    title: 'Smart Risk Warnings',
    desc: 'Transit visa requirements, travel advisories, and policy violations are flagged before you confirm — not after.',
    color: 'text-sky-400',
    glow: 'shadow-sky',
  },
  {
    icon: Building2,
    title: 'Corporate Self-Booking',
    desc: 'Company fare caps, traveler profiles, and approval flows are enforced automatically in the background.',
    color: 'text-sage-400',
    glow: '',
  },
  {
    icon: Zap,
    title: 'Post-Booking Automation',
    desc: 'Web check-in, seat selection, baggage add-ons, and change requests — all through the same AI interface.',
    color: 'text-gold-400',
    glow: '',
  },
  {
    icon: MessageSquare,
    title: 'Multilingual & Voice',
    desc: 'Speak or type in your language. VoyageAI supports text and voice conversation across multiple languages.',
    color: 'text-sky-400',
    glow: '',
  },
  {
    icon: TrendingUp,
    title: 'Price Intelligence',
    desc: 'AI monitors fare trends and alerts you to book before prices rise — or waits when they\'re expected to drop.',
    color: 'text-sage-400',
    glow: '',
  },
]

const STATS = [
  { value: '94%', label: 'Bookings automated', icon: Zap },
  { value: '3.2x', label: 'Faster than portals', icon: Clock },
  { value: '40%', label: 'Cost reduction', icon: TrendingUp },
  { value: '50K+', label: 'Happy travelers', icon: Users },
]

const QUICK_SELECT = [
  { label: 'Flights', path: '/search', icon: Plane },
  { label: 'Hotels', path: '/hotels', icon: Building2 },
  { label: 'Buses', path: '/buses', icon: Bus },
  { label: 'Trains', path: '/trains', icon: Train },
  { label: 'AI Plan', path: '/chat', icon: Sparkles },
]

const CHAT_EXAMPLES = [
  '"Book me Delhi to Singapore next Friday, economy, under ₹20,000"',
  '"Find me a 5-day beach trip in December with flexible dates"',
  '"I need to fly to London for a meeting on the 15th, check visa requirements"',
  '"Change my Mumbai flight to the evening departure"',
]

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
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        {/* Background layers */}
        <div className="absolute inset-0 starfield" />
        <div className="absolute inset-0 bg-hero-glow" />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232,180,41,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Orbiting plane */}
        <motion.div
          className="absolute top-1/2 left-1/2 -ml-3 -mt-3 hidden lg:block"
          style={{ originX: '50%', originY: '50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            style={{ transform: 'translateX(280px)' }}
          >
            <Plane className="w-5 h-5 text-gold-400/40" />
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
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-gold-400/20 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-mono text-gold-300 tracking-wider uppercase">
              AI-First Travel Platform
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.92] mb-6"
          >
            <span className="text-white">Travel the way</span>
            <br />
            <span className="text-shimmer italic">you imagine it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Just describe your trip. VoyageAI understands you, finds the best flights,
            books instantly, and manages everything after — all through natural conversation.
          </motion.p>

          {/* Chat demo input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="glass gradient-border rounded-2xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center flex-shrink-0 shadow-gold-sm">
                <Sparkles className="w-4 h-4 text-void" />
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
                  <span key={i} className="typing-dot w-1.5 h-1.5 bg-gold-400 rounded-full" style={{ animationDelay: `${i*0.2}s` }} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/chat"
                className="inline-flex items-center gap-4 px-10 py-5 bg-gold-gradient text-void font-bold text-lg rounded-2xl shadow-gold hover:shadow-[0_0_50px_rgba(232,180,41,0.4)] transition-all duration-300"
              >
                <Sparkles className="w-6 h-6" />
                Start Planning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/search"
                className="inline-flex items-center gap-3 px-10 py-5 glass border border-white/10 hover:border-white/20 text-white font-semibold text-lg rounded-2xl transition-all duration-300"
              >
                <Plane className="w-5 h-5 text-gold-400" />
                Traditional Search
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator - Moved to bottom-right to avoid CTA overlap */}
        <motion.div
          className="absolute bottom-10 right-10 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase rotate-90 mb-8 origin-center">Scroll</span>
            <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center p-1.5 transition-colors group-hover:border-gold-400/50">
              <motion.div 
                className="w-1 h-1.5 bg-gold-400 rounded-full"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────── */}
      <section className="py-16 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-gold-400/60 mr-2" />
                  <span className="font-display font-bold text-4xl text-white">{value}</span>
                </div>
                <p className="text-muted text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUICK SELECT ─────────────────────────────────────────── */}
      <section className="py-12 px-6 border-b border-border/40 bg-surface/5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-12">
          <span className="text-[10px] uppercase font-display font-bold text-white tracking-[0.3em] opacity-40">Quick Select:</span>
          {[
            { label: 'Hotels', icon: Building2, path: '/hotels', color: 'hover:text-sky-400' },
            { label: 'Buses', icon: Bus, path: '/buses', color: 'hover:text-gold-400' },
            { label: 'Trains', icon: Train, path: '/trains', color: 'hover:text-sage-400' },
            { label: 'Trip Builder', icon: Map, path: '/trip-builder', color: 'hover:text-gold-400' },
          ].map(m => (
            <Link key={m.label} to={m.path} className={`flex items-center gap-3 group transition-all transform hover:scale-105`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-gold-400/30 transition-all">
                <m.icon className="w-5 h-5 text-muted group-hover:text-gold-400 transition-colors" />
              </div>
              <span className={`text-sm font-bold text-muted group-hover:text-white transition-colors`}>{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── SEQUENTIAL JOURNEY ─────────────────────────────────────────── */}
      <section className="py-24 px-6 flex flex-col items-center">
        <div className="max-w-4xl text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-white mb-4">A Sequenced Travel Experience.</h2>
          <p className="text-muted">No more jumping between tabs. We guide you from imagination to boarding.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative max-w-6xl w-full">
           <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden md:block" />
           {[
             { step: '01', label: 'Imagine', desc: 'Chat with AI to shape your journey.', icon: MessageSquare, color: 'text-gold-400' },
             { step: '02', label: 'Select', desc: 'Pick the best flights and stays.', icon: Plane, color: 'text-sky-400' },
             { step: '03', label: 'Customize', desc: 'Add meals, seats, and protection.', icon: Zap, color: 'text-sage-400' },
             { step: '04', label: 'Fly', desc: 'One-click book & automated check-in.', icon: CheckCircle, color: 'text-gold-400' },
           ].map((s) => (
             <motion.div key={s.step} className="relative z-10 glass p-6 rounded-3xl text-center group hover:border-gold-400/20 transition-all">
                <div className={`w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Step {s.step}</div>
                <h3 className="font-bold text-white mb-2">{s.label}</h3>
                <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-deep/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-4 block">How VoyageAI Works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              Three steps. Zero friction.
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-[calc(100%-96px)] bg-gradient-to-b from-gold-400/30 via-sky-400/20 to-transparent hidden md:block" />

            {[
              {
                step: '01',
                title: 'Tell AI your plan',
                desc: 'Type or speak naturally — "I want to visit Thailand next month, budget ₹50K, 7 nights." No forms, no filters.',
                icon: MessageSquare,
                color: 'gold',
                preview: 'Book me a trip to Bali...'
              },
              {
                step: '02',
                title: 'AI curates options',
                desc: 'VoyageAI searches live inventory, checks visa rules, and presents the 3 best options tailored for you.',
                icon: Sparkles,
                color: 'sky',
                preview: '3 Best Flights Found'
              },
              {
                step: '03',
                title: 'Confirm and fly',
                desc: 'Confirm with one click. AI handles check-in, seat selection, and any changes after you book.',
                icon: Plane,
                color: 'sage',
                preview: 'Ticket Confirmed!'
              },
            ].map(({ step, title, desc, icon: Icon, color, preview }, i) => {
              const colors = {
                gold: { border: 'border-gold-400/20', bg: 'bg-gold-400/10', text: 'text-gold-400', glow: 'shadow-gold-sm' },
                sky: { border: 'border-sky-400/20', bg: 'bg-sky-400/10', text: 'text-sky-400', glow: 'shadow-sky' },
                sage: { border: 'border-sage-400/20', bg: 'bg-sage-400/10', text: 'text-sage-400', glow: 'shadow-sage' },
              }[color]

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`relative flex items-center gap-8 mb-20 ${i % 2 !== 0 ? 'md:flex-row-reverse md:text-right text-left' : ''}`}
                >
                  <div className={`flex-shrink-0 w-32 h-32 glass rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed ${colors.border}`}>
                    <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-1`}>
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <span className={`font-mono text-xs font-bold opacity-60`}>STEP {step}</span>
                  </div>
                  <div className="flex-1 max-w-md">
                    <span className={`px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} text-[10px] uppercase font-bold tracking-widest mb-2 inline-block`}>{preview}</span>
                    <h3 className="font-display text-2xl font-bold text-white mb-3">{title}</h3>
                    <p className="text-muted leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12 flex-wrap gap-4"
          >
            <div>
              <span className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-3 block">Trending Destinations</span>
              <h2 className="font-display text-4xl font-bold text-white">Where will you go?</h2>
            </div>
            <Link to="/search" className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESTINATIONS.map(({ city, country, temp, tag, color, img }, i) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative overflow-hidden rounded-3xl cursor-pointer h-64"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${img})` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white">{city}</h3>
                      <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {country}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-semibold">{temp}</div>
                      <div className="text-white/50 text-xs mt-1">{tag}</div>
                    </div>
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Link
                    to={`/chat?dest=${city}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gold-400/90 text-void text-xs font-bold rounded-lg"
                  >
                    <Sparkles className="w-3 h-3" /> Plan Trip
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass gradient-border rounded-3xl p-12 text-center overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-gold-400/10 rounded-full blur-3xl" />

            <Globe2 className="w-12 h-12 text-gold-400 mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Your next adventure<br />starts with a sentence.
            </h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
              No more travel portals. No more phone calls. Just tell VoyageAI what you want.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-base rounded-2xl shadow-gold hover:shadow-[0_0_50px_rgba(232,180,41,0.5)] transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  Try VoyageAI Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <Link to="/corporate" className="text-sm text-muted hover:text-gold-400 transition-colors font-medium flex items-center gap-1">
                For agencies & corporates <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Plane className="w-4 h-4 text-void" />
              </div>
              <span className="font-display font-bold text-white">VoyageAI</span>
            </div>
            <p className="text-muted text-sm">© 2025 VoyageAI · AI-First Travel Platform · Phase 1</p>
            <div className="flex gap-6 text-sm text-muted">
              <a href="#" className="hover:text-gold-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
