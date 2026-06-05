import { useState, useEffect } from 'react'
import { getAIRecommendation } from '../utils/multiModalApi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Package, CheckCircle, ChevronRight,
  Plane, Star, ShieldCheck, Utensils,
  Headphones, Zap, Lock, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'


const ADDON_CATEGORIES = [
  {
    id: 'seat',
    icon: Star,
    label: 'Seat Upgrades',
    color: 'text-violet-400',
    border: 'border-violet-400/20',
    bg: 'bg-violet-400/10',
    items: [
      {
        id: 'seat_biz',
        title: 'Upgrade to Business Class',
        desc: 'Lie-flat seat, 3-course meal, priority boarding & lounge access',
        price: 8500,
        tag: 'Best Value',
        icon: '🛋',
        popular: true,
      },
      {
        id: 'seat_premium',
        title: 'Premium Economy',
        desc: 'Extra 6" legroom, dedicated overhead bin, priority disembark',
        price: 2500,
        icon: '💺',
      },
      {
        id: 'seat_exit',
        title: 'Exit Row Seat',
        desc: 'Maximum legroom. Row 12 or 20. Requires able-bodied confirmation.',
        price: 800,
        icon: '🚪',
      },
    ],
  },
  {
    id: 'baggage',
    icon: Package,
    label: 'Baggage',
    color: 'text-sky-400',
    border: 'border-sky-400/20',
    bg: 'bg-sky-400/10',
    items: [
      {
        id: 'bag_15',
        title: '15kg Extra Check-in Baggage',
        desc: 'Adds 15kg to your standard allowance. Pre-purchase saves vs airport counter.',
        price: 800,
        icon: '🧳',
        popular: true,
      },
      {
        id: 'bag_30',
        title: '30kg Extra Check-in Baggage',
        desc: 'For heavy travellers. Best rate when bought in advance online.',
        price: 1400,
        icon: '📦',
        tag: 'Save 30%',
      },
      {
        id: 'bag_sport',
        title: 'Sports Equipment',
        desc: 'Surfboard, bicycle, ski gear, golf bag — one item up to 30kg.',
        price: 2000,
        icon: '🏊',
      },
    ],
  },
  {
    id: 'meal',
    icon: Utensils,
    label: 'Meals & Beverages',
    color: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/10',
    items: [
      {
        id: 'meal_veg',
        title: 'Indian Vegetarian Meal',
        desc: 'Paneer/Dal with rice, roti, accompaniments. Jain option available.',
        price: 350,
        icon: '🥗',
        popular: true,
      },
      {
        id: 'meal_nonveg',
        title: 'Non-Vegetarian Meal',
        desc: 'Chicken/mutton based main with rice or bread and condiments.',
        price: 420,
        icon: '🍗',
      },
      {
        id: 'meal_snack',
        title: 'Snack Box',
        desc: 'Assorted savoury snacks, juice, and dessert. Light option.',
        price: 220,
        icon: '🍪',
      },
    ],
  },
  {
    id: 'comfort',
    icon: Headphones,
    label: 'Comfort & Lounge',
    color: 'text-sage-400',
    border: 'border-sage-400/20',
    bg: 'bg-sage-400/10',
    items: [
      {
        id: 'lounge',
        title: 'Airport Lounge Access',
        desc: 'Pre-departure lounge at T2 DEL. Includes food, beverages, showers, WiFi.',
        price: 1200,
        icon: '🛋',
        popular: true,
        tag: 'Recommended',
      },
      {
        id: 'wifi',
        title: 'In-flight WiFi',
        desc: 'Stream and browse during your flight. Full-flight pass included.',
        price: 299,
        icon: '📶',
      },
      {
        id: 'blanket',
        title: 'Comfort Kit',
        desc: 'Fleece blanket, neck pillow, eyeshade, and earplugs.',
        price: 450,
        icon: '🛏',
      },
    ],
  },
  {
    id: 'insurance',
    icon: ShieldCheck,
    label: 'Insurance & Protection',
    color: 'text-gold-400',
    border: 'border-gold-400/20',
    bg: 'bg-gold-400/10',
    items: [
      {
        id: 'ins_basic',
        title: 'Basic Travel Insurance',
        desc: 'Trip cancellation + medical emergency coverage up to ₹5 lakhs.',
        price: 499,
        icon: '🛡',
        popular: true,
        tag: 'Recommended',
      },
      {
        id: 'ins_premium',
        title: 'Premium Protection',
        desc: 'Full cancellation, delay compensation, lost baggage, medical up to ₹25L.',
        price: 999,
        icon: '💼',
      },
    ],
  },
]

function AddonItem({ item, selected, onToggle }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={() => onToggle(item.id)}
      className={`relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-gold-400/40 bg-gold-400/8'
          : 'border-border glass hover:border-border/80'
      }`}
    >
      {item.popular && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void text-xs font-bold rounded-full shadow-gold-sm">
          {item.tag || 'Popular'}
        </div>
      )}

      <span className="text-2xl flex-shrink-0">{item.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm mb-0.5">{item.title}</div>
        <div className="text-muted text-xs leading-relaxed">{item.desc}</div>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-gold-400 font-bold">+₹{item.price.toLocaleString()}</div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? 'bg-gold-400 border-gold-400' : 'border-muted'
        }`}>
          {selected && <CheckCircle className="w-3.5 h-3.5 text-void" />}
        </div>
      </div>
    </motion.div>
  )
}

export default function AddonsPage() {
  const [selected, setSelected] = useState(new Set())
  const [activeCategory, setActiveCategory] = useState('seat')
  const [purchasing, setPurchasing] = useState(false)
  const [aiTip, setAiTip] = useState('')

useEffect(() => {
  getAIRecommendation('Give a concise travel tip...')
    .then(setAiTip).catch(() => {})
}, [])
  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allItems = ADDON_CATEGORIES.flatMap(c => c.items)
  const selectedItems = allItems.filter(i => selected.has(i.id))
  const total = selectedItems.reduce((sum, i) => sum + i.price, 0)

  const handlePurchase = () => {
    setPurchasing(true)
    setTimeout(() => {
      setPurchasing(false)
      toast.success(`${selectedItems.length} add-on${selectedItems.length > 1 ? 's' : ''} added to your booking!`)
      setSelected(new Set())
    }, 1800)
  }

  const currentCategory = ADDON_CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {aiTip && (
  <div className="flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
    <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
    <p className="text-gold-200/80 text-sm">{aiTip}</p>
  </div>
)}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/post-booking" className="hover:text-gold-400 transition-colors">Manage Trip</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Add-ons & Upgrades</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Enhance Your Journey</h1>
          <p className="text-muted">AI 619 · Delhi → Mumbai · 15 March 2025</p>
        </motion.div>

        {/* AI recommendation banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl mb-7"
        >
          <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gold-200 text-sm font-semibold mb-1">VoyageAI Recommends</p>
            <p className="text-gold-200/60 text-xs leading-relaxed">
              Based on your travel history: the <span className="text-gold-300">Airport Lounge</span> access is popular on this route, and adding <span className="text-gold-300">15kg baggage</span> saves ₹400 vs buying at the counter.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {/* Category tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {ADDON_CATEGORIES.map(({ id, icon: Icon, label, color, bg }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    activeCategory === id
                      ? `${bg} ${color} border-current/20`
                      : 'glass border-border text-muted hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Items */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {currentCategory?.items.map(item => (
                  <AddonItem
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    onToggle={toggle}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="sticky top-28 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass border border-border rounded-2xl p-5"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-400" /> Your Add-ons
              </h3>

              {selectedItems.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                  <p className="text-muted text-xs">No add-ons selected yet</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {selectedItems.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-white/80 text-xs">{item.title}</span>
                      </div>
                      <span className="text-gold-400 font-medium text-xs">+₹{item.price.toLocaleString()}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedItems.length > 0 && (
                <>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-gold-400 font-bold text-lg">₹{total.toLocaleString()}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="mt-4 w-full py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center justify-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Zap className="w-4 h-4" />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Add to Booking
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted">
                    <ShieldCheck className="w-3 h-3 text-sage-400" /> Secure payment · Instant confirmation
                  </div>
                </>
              )}
            </motion.div>

            {/* Flight summary */}
            <div className="glass border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="w-4 h-4 text-gold-400" />
                <span className="text-white text-sm font-medium">AI 619</span>
              </div>
              <div className="text-muted text-xs space-y-0.5">
                <div>Delhi (DEL) → Mumbai (BOM)</div>
                <div>09:30 → 11:50 · 15 Mar 2025</div>
                <div>Seat 14C · Economy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
