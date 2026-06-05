import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plane, Sparkles, ArrowRight, Home, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,180,41,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Plane animation */}
        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Plane className="w-10 h-10 text-gold-400" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-4 block">Error 404</span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-4 leading-tight">
            Lost in the<br />
            <span className="text-shimmer italic">clouds.</span>
          </h1>
          <p className="text-muted text-lg mb-10 leading-relaxed">
            This page doesn't exist. Let's get you back on course.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold-gradient text-void font-bold text-base rounded-2xl shadow-gold hover:shadow-[0_0_50px_rgba(232,180,41,0.4)] transition-all"
              >
                <Home className="w-5 h-5" />
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/chat"
                className="inline-flex items-center gap-3 px-8 py-4 glass border border-gold-400/20 text-gold-400 font-semibold text-base rounded-2xl transition-all hover:bg-gold-400/5"
              >
                <Sparkles className="w-5 h-5" />
                Ask AI Assistant
              </Link>
            </motion.div>
          </div>

          {/* Quick links */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Search Flights', to: '/search', icon: Search },
              { label: 'My Trips', to: '/dashboard', icon: Plane },
              { label: 'Trip Builder', to: '/trip-builder', icon: Sparkles },
            ].map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-4 py-2 glass border border-border hover:border-gold-400/20 rounded-xl text-sm text-muted hover:text-white transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
