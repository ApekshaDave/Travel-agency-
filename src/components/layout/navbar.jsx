import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Train, Bus, Building2, Map,
  MessageCircle, LayoutDashboard, Menu, X,
  Sparkles, AlertTriangle, RefreshCw, DollarSign,
  Bell, ChevronDown, Globe2
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Book Travel',
    links: [
      { to: '/search',       label: 'Flights',       icon: Plane },
      { to: '/hotels',       label: 'Hotels',        icon: Building2 },
      { to: '/trains',       label: 'Trains',        icon: Train },
      { to: '/buses',        label: 'Buses',         icon: Bus },
      { to: '/trip-builder', label: 'Trip Builder',  icon: Map },
      { to: '/visa',         label: 'Visa Checker',  icon: Globe2 },
    ],
  },
  {
    label: 'My Travel',
    links: [
      { to: '/chat',         label: 'AI Assistant',  icon: MessageCircle },
      { to: '/dashboard',    label: 'My Trips',      icon: LayoutDashboard },
      { to: '/post-booking', label: 'Manage Trip',   icon: RefreshCw },
      { to: '/corporate',    label: 'Corporate',     icon: Building2 },
    ],
  },
  {
    label: 'Back Office',
    staff: true,
    links: [
      { to: '/agent',                label: 'Agent Desk',    icon: AlertTriangle, badge: 'live' },
      { to: '/finance',              label: 'Finance',       icon: DollarSign },
      { to: '/finance/notifications',label: 'Admin Alerts',  icon: Bell, badge: '3' },
    ],
  },
]

function NavDropdown({ group, active }) {
  const [open, setOpen] = useState(false)
  const hasActive = group.links.some(l => active === l.to || active.startsWith(l.to + '/'))

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
        hasActive
          ? 'text-gold-400'
          : group.staff
          ? 'text-red-400/70 hover:text-red-400'
          : 'text-muted hover:text-white'
      }`}>
        {group.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        {group.staff && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-48 glass border border-border rounded-xl p-1.5 shadow-card z-50"
          >
            {group.links.map(({ to, label, icon: Icon, badge }) => {
              const isActive = active === to || active.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-gold-400/10 text-gold-400'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  {badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      badge === 'live'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gold-400/20 text-gold-400'
                    }`}>
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const active = location.pathname

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-deep/90 backdrop-blur-xl border-b border-border/60 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-sm">
                <Plane className="w-4 h-4 text-void" strokeWidth={2.5} />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-xl bg-gold-400/20 blur-md"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Voyage<span className="text-gold-400">AI</span>
              </span>
              <span className="text-[10px] text-muted font-mono uppercase tracking-widest">
                Intelligent Travel
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_GROUPS.map(group => (
              <NavDropdown key={group.label} group={group} active={active} />
            ))}
          </div>

          {/* CTA + bell */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/finance/notifications"
              className="relative p-2 text-muted hover:text-gold-400 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-semibold text-sm rounded-xl shadow-gold-sm hover:shadow-gold transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" /> Plan with AI
              </Link>
            </motion.div>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-muted hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 glass border-b border-border mx-4 mt-2 rounded-2xl p-4 max-h-[80vh] overflow-y-auto"
          >
            {NAV_GROUPS.map(group => (
              <div key={group.label} className="mb-3">
                <p className={`text-xs uppercase tracking-widest px-4 py-1.5 font-medium ${
                  group.staff ? 'text-red-400/60' : 'text-muted/60'
                }`}>
                  {group.label}
                </p>
                {group.links.map(({ to, label, icon: Icon, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    {badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        badge === 'live'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gold-400/20 text-gold-400'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mt-2 pt-3 border-t border-border">
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-semibold text-sm rounded-xl"
              >
                <Sparkles className="w-4 h-4" /> Plan with AI
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
