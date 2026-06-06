import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Train, Bus, Building2, Map,
  LayoutDashboard, Menu, X,
  Sparkles, AlertTriangle, RefreshCw, DollarSign,
  Bell, ChevronDown, ArrowRight, ShieldCheck, LogIn
} from 'lucide-react'

const NAV_LINKS = [
  { to: '/search',       label: 'Flights',       icon: Plane },
  { to: '/hotels',       label: 'Hotels',        icon: Building2 },
  { to: '/trains',       label: 'Trains',        icon: Train },
  { to: '/buses',        label: 'Buses',         icon: Bus },
  { to: '/trip-builder', label: 'Trip Builder',  icon: Map },
  { to: '/chat',         label: 'AI Assistant',  icon: Sparkles, primary: true },
]

const USER_LINKS = [
  { to: '/dashboard',    label: 'My Trips',      icon: LayoutDashboard },
  { to: '/post-booking', label: 'Manage Booking', icon: RefreshCw },
  { to: '/corporate',    label: 'Corporate',     icon: Building2 },
]

const STAFF_LINKS = [
  { to: '/staff',                label: 'Staff Home',     icon: ShieldCheck },
  { to: '/staff-login',          label: 'Staff Login',    icon: LogIn },
  { to: '/agent',                label: 'Agent Desk',    icon: AlertTriangle, badge: 'Urgent' },
  { to: '/finance',              label: 'Finance Office', icon: DollarSign },
  { to: '/finance/notifications',label: 'Admin Alerts',  icon: Bell, badge: '3' },
]

function GenericDropdown({ label, links, active, isStaff }) {
  const [open, setOpen] = useState(false)
  const hasActive = links.some(l => active === l.to || active.startsWith(l.to + '/'))

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
        hasActive ? 'text-gold-400' : isStaff ? 'text-red-400/70 hover:text-red-400' : 'text-muted hover:text-white'
      }`}>
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-48 glass border border-border rounded-xl p-1.5 shadow-card z-50"
          >
            {links.map(({ to, label, icon: Icon, badge }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  active === to || active.startsWith(to + '/')
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
                {badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isStaff ? 'bg-red-500/20 text-red-400' : 'bg-gold-400/20 text-gold-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            ))}
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

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-void/90 backdrop-blur-xl border-b border-border py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold-sm">
            <Plane className="w-4 h-4 text-void" />
          </div>
          <span className="font-display font-bold text-lg text-white">VoyageAI</span>
        </Link>

        {/* Desktop - Sequenced */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-1 border-r border-border pr-6 mr-2">
            {NAV_LINKS.map(link => {
              const isLinkActive = active === link.to || active.startsWith(link.to + '/')
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive 
                      ? 'text-gold-400 bg-gold-400/5 shadow-[0_0_20px_rgba(232,180,41,0.05)]' 
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <GenericDropdown label="My Travel" links={USER_LINKS} active={active} />
            <GenericDropdown label="Staff" links={STAFF_LINKS} active={active} isStaff />
            <div className="h-6 w-px bg-white/10 mx-2" />
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all hover:border-gold-400/30"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-muted" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu - Fully Improved */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-b border-border overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-gold-400 mb-2 px-3 font-semibold">Plan Voyage</p>
                {NAV_LINKS.map(l => {
                  const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl font-medium transition-all ${
                        isLinkActive
                          ? 'text-gold-400 bg-gold-400/5'
                          : 'text-white hover:text-gold-400 hover:bg-white/5'
                      }`}
                    >
                      <l.icon className="w-4 h-4 text-gold-400/80" />
                      {l.label}
                    </Link>
                  )
                })}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted mb-2 px-3 font-semibold">My Travel</p>
                {USER_LINKS.map(l => {
                  const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all ${
                        isLinkActive
                          ? 'text-gold-400 bg-gold-400/5'
                          : 'text-muted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <l.icon className="w-4 h-4 text-sky-400/70" />
                      {l.label}
                    </Link>
                  )
                })}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-red-400/70 mb-2 px-3 font-semibold">Staff Desk</p>
                {STAFF_LINKS.map(l => {
                  const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-all ${
                        isLinkActive
                          ? 'text-red-400 bg-red-500/5'
                          : 'text-muted hover:text-red-400 hover:bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <l.icon className="w-4 h-4 text-red-400/70" />
                        <span>{l.label}</span>
                      </div>
                      {l.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400">
                          {l.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-white/5">
                <Link 
                  to="/login" 
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 bg-gold-gradient text-void font-bold rounded-xl flex items-center justify-center gap-2 shadow-gold"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
