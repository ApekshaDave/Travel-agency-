import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Building2, Search, Calendar, Users, Star, Wifi,
  Coffee, Dumbbell, Waves, ChevronRight,
  MapPin, CheckCircle,
  Heart, Shield, Sparkles,
  X, Lock, Utensils, Car, Zap, Eye
} from 'lucide-react'
import { MOCK_HOTELS } from '../data/mockHotels'
import toast from 'react-hot-toast'

const AMENITY_ICONS = {
  'Pool': Waves, 'Gym': Dumbbell, 'WiFi': Wifi,
  'Restaurant': Utensils, 'Spa': Zap, 'Breakfast': Coffee,
  'Parking': Car, 'Airport Transfer': Car,
}

function StarRating({ rating, size = 'sm' }) {
  return (
    <div className={`flex items-center gap-0.5 ${size === 'lg' ? 'gap-1' : ''}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} ${
            i < rating ? 'text-gold-400 fill-gold-400' : 'text-muted'
          }`}
        />
      ))}
    </div>
  )
}

// ── Hotel Detail Modal ────────────────────────────────────────────────────────
function HotelModal({ hotel, nights, guests, onClose, onBook }) {
  const [selectedRoom, setSelectedRoom] = useState('standard')
  const [tab, setTab] = useState('overview')

  const rooms = [
    { id: 'standard', name: hotel.roomType, bed: hotel.bedType, price: hotel.pricePerNight, maxGuests: 2, size: '28 sqm' },
    { id: 'deluxe', name: 'Deluxe Room', bed: 'King', price: Math.round(hotel.pricePerNight * 1.3), maxGuests: 2, size: '36 sqm' },
    { id: 'suite', name: 'Junior Suite', bed: 'King', price: Math.round(hotel.pricePerNight * 2.1), maxGuests: 3, size: '52 sqm' },
  ]

  const selected = rooms.find(r => r.id === selectedRoom)
  const totalCost = selected.price * nights

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-void/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="glass border border-border rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Image header */}
        <div className="relative h-52 flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hotel.images[0]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-void/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-void/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-5">
            <StarRating rating={hotel.rating} size="lg" />
            <h2 className="font-display text-2xl font-bold text-white mt-1">{hotel.name}</h2>
            <div className="flex items-center gap-1 text-white/70 text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> {hotel.address}
            </div>
          </div>
          <div className="absolute bottom-4 right-5 text-right">
            <div className="text-gold-400 font-bold text-2xl">₹{hotel.pricePerNight.toLocaleString()}</div>
            <div className="text-white/50 text-xs">per night</div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-5 pt-4 border-b border-border/60 flex-shrink-0">
          {['overview', 'rooms', 'amenities'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${
                tab === t ? 'border-gold-400 text-gold-400' : 'border-transparent text-muted hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gold-400/15 border border-gold-400/20 rounded-xl flex items-center justify-center">
                    <span className="text-gold-400 font-bold">{hotel.reviewScore}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {hotel.reviewScore >= 9 ? 'Exceptional' : hotel.reviewScore >= 8 ? 'Excellent' : 'Very Good'}
                    </div>
                    <div className="text-muted text-xs">{hotel.reviewCount.toLocaleString()} reviews</div>
                  </div>
                </div>
                {hotel.cancellable && (
                  <div className="flex items-center gap-1.5 text-sage-400 text-sm">
                    <CheckCircle className="w-4 h-4" /> Free cancellation available
                  </div>
                )}
                {hotel.breakfastIncluded && (
                  <div className="flex items-center gap-1.5 text-sky-400 text-sm">
                    <Coffee className="w-4 h-4" /> Breakfast included
                  </div>
                )}
              </div>
              <p className="text-muted text-sm leading-relaxed">{hotel.highlight}</p>
              <div className="grid grid-cols-4 gap-2">
                {hotel.amenities.slice(0, 8).map(a => {
                  const Icon = AMENITY_ICONS[a] || CheckCircle
                  return (
                    <div key={a} className="flex items-center gap-1.5 text-xs text-muted">
                      <Icon className="w-3.5 h-3.5 text-gold-400/60" /> {a}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'rooms' && (
            <div className="space-y-3">
              {rooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                    selectedRoom === room.id
                      ? 'border-gold-400/40 bg-gold-400/5'
                      : 'glass border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-white font-semibold">{room.name}</div>
                      <div className="text-muted text-xs mt-0.5">
                        {room.bed} bed · {room.size} · Up to {room.maxGuests} guests
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-bold text-lg">₹{room.price.toLocaleString()}</div>
                      <div className="text-muted text-xs">per night</div>
                    </div>
                    {selectedRoom === room.id && (
                      <div className="w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center ml-2">
                        <CheckCircle className="w-3.5 h-3.5 text-void" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'amenities' && (
            <div className="grid grid-cols-2 gap-3">
              {hotel.amenities.map(a => {
                const Icon = AMENITY_ICONS[a] || CheckCircle
                return (
                  <div key={a} className="flex items-center gap-3 p-3 glass border border-border rounded-xl">
                    <div className="w-8 h-8 bg-gold-400/10 border border-gold-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gold-400" />
                    </div>
                    <span className="text-white text-sm">{a}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Booking footer */}
        <div className="p-5 border-t border-border/60 bg-surface/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-muted text-xs">
                {selected.name} · {nights} night{nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
              </div>
              <div className="text-white font-bold text-xl">
                ₹{totalCost.toLocaleString()}
                <span className="text-muted text-sm font-normal ml-2">total</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onBook(hotel, selected, totalCost); onClose() }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all"
            >
              <Lock className="w-4 h-4" /> Book Now
            </motion.button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Shield className="w-3.5 h-3.5 text-sage-400" /> Free cancellation before check-in ·
            <CheckCircle className="w-3 h-3 text-sage-400" /> Instant confirmation
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Hotel Card ────────────────────────────────────────────────────────────────
function HotelCard({ hotel, nights, onSelect }) {
  const [wishlist, setWishlist] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass border border-border hover:border-gold-400/20 rounded-2xl overflow-hidden group transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${hotel.images[0]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent" />
        <div className="absolute top-3 left-3">
          {hotel.tag && (
            <span className="px-2.5 py-1 bg-gold-400 text-void text-xs font-bold rounded-full shadow-gold-sm">
              {hotel.tag}
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); setWishlist(!wishlist) }}
          className="absolute top-3 right-3 w-8 h-8 bg-void/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-void/80"
        >
          <Heart className={`w-4 h-4 transition-all ${wishlist ? 'text-red-400 fill-red-400' : 'text-white'}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <StarRating rating={hotel.rating} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-white text-base group-hover:text-gold-300 transition-colors leading-tight">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="px-1.5 py-0.5 bg-gold-400/15 border border-gold-400/20 rounded text-gold-400 font-bold text-xs">
              {hotel.reviewScore}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{hotel.address}</span>
        </div>

        {/* Amenity pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hotel.amenities.slice(0, 4).map(a => (
            <span key={a} className="px-2 py-0.5 bg-surface border border-border rounded-full text-xs text-muted">
              {a}
            </span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-muted">+{hotel.amenities.length - 4} more</span>
          )}
        </div>

        {/* Flags */}
        <div className="flex gap-3 mb-4 text-xs">
          {hotel.cancellable && (
            <span className="flex items-center gap-1 text-sage-400">
              <CheckCircle className="w-3 h-3" /> Free cancel
            </span>
          )}
          {hotel.breakfastIncluded && (
            <span className="flex items-center gap-1 text-sky-400">
              <Coffee className="w-3 h-3" /> Breakfast
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gold-400 font-bold text-xl">₹{hotel.pricePerNight.toLocaleString()}</div>
            <div className="text-muted text-xs">
              per night · {nights > 1 ? `₹${(hotel.pricePerNight * nights).toLocaleString()} total` : ''}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(hotel)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold text-sm rounded-xl shadow-gold-sm hover:shadow-gold transition-all"
          >
            View <Eye className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Hotel Search Page ────────────────────────────────────────────────────
export default function HotelSearch() {
  const [city, setCity] = useState('Mumbai')
  const [checkIn, setCheckIn] = useState('2025-03-20')
  const [checkOut, setCheckOut] = useState('2025-03-23')
  const [guests, setGuests] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [sortBy, setSortBy] = useState('recommended')
  const [filterStars, setFilterStars] = useState([])
  const [maxPrice] = useState(50000)
  const [bookedHotel, setBookedHotel] = useState(null)

  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))

  const handleSearch = () => {
    setLoading(true)
    setSearched(false)
    setTimeout(() => { setLoading(false); setSearched(true) }, 1400)
  }

  const handleBook = (hotel, room, total) => {
    setBookedHotel({ hotel, room, total })
    toast.success(`🏨 ${hotel.name} booked! Confirmation sent to your email.`)
  }

  const filtered = MOCK_HOTELS
    .filter(h => filterStars.length === 0 || filterStars.includes(h.rating))
    .filter(h => h.pricePerNight <= maxPrice)
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.pricePerNight - b.pricePerNight
      if (sortBy === 'price_high') return b.pricePerNight - a.pricePerNight
      if (sortBy === 'rating') return b.reviewScore - a.reviewScore
      return 0
    })

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Hotels</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">Find Hotels</h1>
          <p className="text-muted">AI-curated stays — from budget to luxury, instant booking.</p>
        </motion.div>

        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-5 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-3 items-end">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">City / Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Mumbai, Goa, Delhi..."
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted" />
                <select value={guests} onChange={e => setGuests(+e.target.value)}
                  className="ai-input w-full pl-9 pr-3 py-3 rounded-xl text-white text-sm appearance-none">
                  {[1,2,3,4].map(n => <option key={n} value={n} className="bg-deep">{n} Guest{n>1?'s':''}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Rooms</label>
              <select value={rooms} onChange={e => setRooms(+e.target.value)}
                className="ai-input w-full px-3 py-3 rounded-xl text-white text-sm appearance-none">
                {[1,2,3].map(n => <option key={n} value={n} className="bg-deep">{n} Room{n>1?'s':''}</option>)}
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSearch} disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center gap-2 self-end"
            >
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Search className="w-4 h-4" /></motion.div>
                : <Search className="w-4 h-4" />
              }
              Search
            </motion.button>
          </div>
        </motion.div>

        {/* Destination picks (before search) */}
        {!searched && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="font-display text-2xl font-bold text-white mb-4">Popular Destinations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=300&q=70', hotels: 2840 },
                { city: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&q=70', hotels: 1240 },
                { city: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&q=70', hotels: 3120 },
                { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=300&q=70', hotels: 980 },
                { city: 'Udaipur', img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=300&q=70', hotels: 620 },
                { city: 'Manali', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&q=70', hotels: 480 },
              ].map(({ city: c, img, hotels }, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => { setCity(c); handleSearch() }}
                  className="relative rounded-2xl overflow-hidden h-28 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${img})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-void/10" />
                  <div className="absolute bottom-2.5 left-3">
                    <div className="text-white font-bold text-sm">{c}</div>
                    <div className="text-white/50 text-xs">{hotels.toLocaleString()} hotels</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold">
                <Building2 className="w-8 h-8 text-void" />
              </motion.div>
              <p className="text-muted text-sm">Finding best hotels in {city}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Result header + filters */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    {filtered.length} hotels in {city}
                  </h2>
                  <p className="text-muted text-sm">{checkIn} – {checkOut} · {nights} night{nights>1?'s':''} · {guests} guest{guests>1?'s':''}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted text-xs">Sort:</span>
                  {['recommended','price_low','price_high','rating'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                        sortBy === s ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20' : 'text-muted hover:text-white'
                      }`}>
                      {s.replace('_',' ')}
                    </button>
                  ))}
                  {/* Star filter */}
                  {[5,4,3].map(star => (
                    <button key={star}
                      onClick={() => setFilterStars(prev => prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star])}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        filterStars.includes(star) ? 'bg-gold-400/15 text-gold-400 border border-gold-400/20' : 'text-muted hover:text-white border border-transparent'
                      }`}>
                      <Star className={`w-3 h-3 ${filterStars.includes(star) ? 'fill-gold-400 text-gold-400' : ''}`} />{star}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI suggestion */}
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="mb-5 flex items-start gap-3 p-4 bg-gold-400/8 border border-gold-400/20 rounded-2xl">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-gold-200/70 text-sm">
                  <span className="text-gold-300 font-semibold">AI Pick: </span>
                  For {nights} nights, the <span className="text-gold-300">Trident Nariman Point</span> offers the best value with breakfast included at ₹{(14200 * nights).toLocaleString()} total. The Taj Mahal Palace is iconic but 2× the price.
                </p>
              </motion.div>

              {/* Hotel grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((hotel, i) => (
                  <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <HotelCard hotel={hotel} nights={nights} onSelect={setSelectedHotel} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotel Modal */}
        <AnimatePresence>
          {selectedHotel && (
            <HotelModal
              hotel={selectedHotel}
              nights={nights}
              guests={guests}
              onClose={() => setSelectedHotel(null)}
              onBook={handleBook}
            />
          )}
        </AnimatePresence>

        {/* Booked confirmation banner */}
        <AnimatePresence>
          {bookedHotel && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-6 right-6 glass border border-sage-400/30 bg-sage-400/10 rounded-2xl p-4 shadow-card max-w-sm z-40"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-sage-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">Hotel Booked!</p>
                  <p className="text-muted text-xs mt-0.5">{bookedHotel.hotel.name} · ₹{bookedHotel.total.toLocaleString()} · Confirmation sent</p>
                </div>
                <button onClick={() => setBookedHotel(null)} className="text-muted hover:text-white ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
