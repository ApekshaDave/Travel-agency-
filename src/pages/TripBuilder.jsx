import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, Plane, Train, Bus, Building2, Trash2, Clock, ChevronRight,
  CheckCircle, DollarSign, Zap, Compass, Landmark, Utensils, Trees, ShoppingBag, MapPin,
  Edit3, Coffee, Sun, Moon, Calendar as CalendarIcon, HelpCircle, Car, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateMultiModalTrip } from '../utils/multiModalApi'
import { saveTrip } from '../utils/tripStore'
import { useAuth } from '../context/AuthContext'
import { getTripById } from '../utils/tripStore'

// ── Segment types ─────────────────────────────────────────────────────────────
const SEGMENT_TYPES = [
  { id: 'flight', label: 'Flight', icon: Plane, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
  { id: 'train', label: 'Train', icon: Train, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  { id: 'bus', label: 'Bus', icon: Bus, color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
  { id: 'roadways', label: 'Roadways', icon: Car, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  { id: 'hotel', label: 'Hotel', icon: Building2, color: 'text-sage-400', bg: 'bg-sage-400/10 border-sage-400/20' },
]

const TRANSPORT_TYPES = ['flight', 'train', 'bus', 'roadways']

// ── Sample itinerary presets ──────────────────────────────────────────────────
const PRESET_TRIPS = [
  {
    id: 'golden-triangle',
    name: 'Golden Triangle',
    desc: 'Delhi → Agra → Jaipur → Delhi',
    duration: '6 days',
    icon: '🏛',
    segments: [
      { id: 'a', type: 'flight', from: 'Mumbai', to: 'Delhi', date: '20 Mar', detail: 'IndiGo 6E 204 · 06:00–08:10', price: 4299, icon: '✈️' },
      { id: 'b', type: 'hotel', from: 'Delhi', to: '', date: '20–21 Mar', detail: 'The Lalit New Delhi · 2 nights', price: 12000, icon: '🏨' },
      { id: 'c', type: 'train', from: 'Delhi', to: 'Agra', date: '22 Mar', detail: 'Shatabdi 12001 · 06:15–08:10', price: 645, icon: '🚂' },
      { id: 'd', type: 'hotel', from: 'Agra', to: '', date: '22–23 Mar', detail: 'Trident Agra · 1 night', price: 7800, icon: '🏨' },
      { id: 'e', type: 'bus', from: 'Agra', to: 'Jaipur', date: '23 Mar', detail: 'VRL Travels AC · 09:00–14:30', price: 550, icon: '🚌' },
      { id: 'f', type: 'hotel', from: 'Jaipur', to: '', date: '23–25 Mar', detail: 'Jai Mahal Palace · 2 nights', price: 18000, icon: '🏨' },
      { id: 'g', type: 'flight', from: 'Jaipur', to: 'Mumbai', date: '25 Mar', detail: 'Air India AI 473 · 18:30–20:15', price: 3800, icon: '✈️' },
    ],
    costComparison: {
      flightCost: "₹4,299",
      trainCost: "₹645",
      busCost: "₹550",
      roadwaysCost: "₹1,800",
      analysis: "Flights are the fastest way to travel between Mumbai and Delhi. Shatabdi trains are highly comfortable for Delhi to Agra. AC buses or private roadways/cabs are cheap and direct for the Agra to Jaipur route.",
      aiSuggestion: "We recommend taking a flight from Mumbai to Delhi, the Shatabdi train to Agra, and a roadways cab to Jaipur for the best cost-to-time ratio."
    },
    flightOptions: [
      { id: 'f-gt-1', airline: 'IndiGo', flightNo: '6E 204', price: 4299, depart: '06:00', arrive: '08:10', duration: '2h 10m', stops: 0, logo: '✈️' },
      { id: 'f-gt-2', airline: 'Air India', flightNo: 'AI 809', price: 5100, depart: '09:30', arrive: '11:45', duration: '2h 15m', stops: 0, logo: '✈️' }
    ],
    hotelOptions: [
      { id: 'h-gt-1', name: 'The Lalit New Delhi', pricePerNight: 6000, rating: 4.6, stars: 5, area: 'Connaught Place', image: 'Luxury 5-star hotel in the heart of Delhi' },
      { id: 'h-gt-2', name: 'Trident Agra', pricePerNight: 7800, rating: 4.5, stars: 5, area: 'Taj East Gate Road', image: 'Beautiful gardens, close to the Taj Mahal' },
      { id: 'h-gt-3', name: 'Jai Mahal Palace', pricePerNight: 9000, rating: 4.8, stars: 5, area: 'Civil Lines', image: '18th-century palace hotel in Jaipur' }
    ],
    trainOptions: [
      { id: 't-gt-1', name: 'Shatabdi Express', trainNo: '12001', price: 645, depart: '06:15', arrive: '08:10', duration: '1h 55m' },
      { id: 't-gt-2', name: 'Taj Express', trainNo: '12280', price: 375, depart: '06:55', arrive: '09:40', duration: '2h 45m' }
    ],
    busOptions: [
      { id: 'b-gt-1', operator: 'VRL Travels AC', type: 'AC Seater/Sleeper', price: 550, depart: '09:00', arrive: '14:30', duration: '5h 30m' },
      { id: 'b-gt-2', operator: 'Gujarat Travels', type: 'Volvo AC Multi-Axle', price: 650, depart: '10:00', arrive: '15:15', duration: '5h 15m' }
    ],
    roadwaysOptions: [
      { id: 'r-gt-1', vehicle: 'Etios Sedan (AC)', provider: 'Ola Outstation', price: 1800, detail: 'Delhi to Agra one-way private taxi drop' },
      { id: 'r-gt-2', vehicle: 'Innova SUV (AC)', provider: 'Savaari Cabs', price: 2900, detail: 'Comfortable road trip with driver' }
    ],
    placesToVisit: [
      { name: 'Taj Mahal (Agra)', description: 'The world\'s most famous monument of love. Stroll through the lush gardens.', funFact: 'The color of Taj Mahal changes depending on the time of day.', recommendedTime: 'Sunrise', visitDuration: '2-3 hours', category: 'History', price: 50 },
      { name: 'Amber Fort (Jaipur)', description: 'A grand hilltop fortress featuring magnificent courtyards and Sheesh Mahal.', funFact: 'The mirrors inside Sheesh Mahal are imported from Belgium.', recommendedTime: 'Morning', visitDuration: '3 hours', category: 'Adventure', price: 100 },
      { name: 'Hawa Mahal (Jaipur)', description: 'The famous Palace of Winds featuring a unique honeycomb facade.', funFact: 'It has 953 small windows designed to let royal women observe street life.', recommendedTime: 'Early Morning', visitDuration: '1 hour', category: 'History', price: 50 }
    ],
    restaurants: {
      veg: [
        { name: 'Sattvik Restaurant', cuisine: 'North Indian', specialty: 'Rose Petal Kheer', costForTwo: '₹1,200', description: 'Fine-dining pure-vegetarian restaurant serving north-Indian delicacies.' }
      ],
      nonVeg: [
        { name: 'Karim\'s (Delhi)', cuisine: 'Mughlai', specialty: 'Mutton Korma & Seekh Kebabs', costForTwo: '₹900', description: 'Legendary culinary institution near Jama Masjid.' }
      ]
    },
    itineraryDays: [
      {
        day: 1,
        title: "Delhi Arrival & Monuments",
        theme: "Heritage",
        morning: { activity: "Arrive in Delhi", description: "Fly in from Mumbai and transfer to Connaught Place.", duration: "2h", cost: "Free", tip: "Use prepaid airport cabs." },
        afternoon: { activity: "Explore Red Fort", description: "Vast Mughal palace fort complex constructed of red sandstone.", duration: "2h", cost: "₹80", tip: "Hire an official guide at entrance." },
        evening: { activity: "India Gate Walk", description: "War memorial glowing at sunset, with street food vendors around.", duration: "1.5h", cost: "Free", tip: "Try local dry-fruit kulfi." },
        meals: { breakfast: "In-flight meal", lunch: "Karim's Jama Masjid", dinner: "Sattvik CP" },
        transport: "Auto Rickshaw / Taxi",
        estimatedDayBudget: "₹2,500"
      }
    ]
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters',
    desc: 'Kochi → Alleppey → Kovalam',
    duration: '5 days',
    icon: '🌴',
    segments: [
      { id: 'a', type: 'flight', from: 'Delhi', to: 'Kochi', date: '15 Apr', detail: 'Vistara UK 861 · 07:30–10:45', price: 6200, icon: '✈️' },
      { id: 'b', type: 'hotel', from: 'Kochi', to: '', date: '15–16 Apr', detail: 'Taj Malabar Resort · 1 night', price: 9800, icon: '🏨' },
      { id: 'c', type: 'bus', from: 'Kochi', to: 'Alleppey', date: '16 Apr', detail: 'KSRTC · 08:00–09:30', price: 120, icon: '🚌' },
      { id: 'd', type: 'hotel', from: 'Alleppey', to: '', date: '16–18 Apr', detail: 'Houseboat (Kettuvallam) · 2 nights', price: 16000, icon: '🏨' },
      { id: 'e', type: 'bus', from: 'Alleppey', to: 'Kovalam', date: '18 Apr', detail: 'KSRTC · 10:00–13:30', price: 220, icon: '🚌' },
      { id: 'f', type: 'hotel', from: 'Kovalam', to: '', date: '18–20 Apr', detail: 'Leela Kovalam · 2 nights', price: 22000, icon: '🏨' },
      { id: 'g', type: 'flight', from: 'Trivandrum', to: 'Delhi', date: '20 Apr', detail: 'IndiGo 6E 841 · 11:00–14:00', price: 5600, icon: '✈️' },
    ],
    costComparison: {
      flightCost: "₹6,200",
      trainCost: "₹1,100",
      busCost: "₹220",
      roadwaysCost: "₹2,200",
      analysis: "Flights save nearly 24 hours of travel time from Delhi. Within Kerala, local state transport buses are extremely economical but standard. Cabs and self-drive offer scenic roadway trips.",
      aiSuggestion: "Take the flight to Kochi, then use private roadways to travel to Alleppey and Kovalam for the ultimate scenic comfort."
    },
    flightOptions: [
      { id: 'f-kb-1', airline: 'Vistara', flightNo: 'UK 861', price: 6200, depart: '07:30', arrive: '10:45', duration: '3h 15m', stops: 0, logo: '✈️' },
      { id: 'f-kb-2', airline: 'IndiGo', flightNo: '6E 841', price: 5600, depart: '11:00', arrive: '14:00', duration: '3h 00m', stops: 0, logo: '✈️' }
    ],
    hotelOptions: [
      { id: 'h-kb-1', name: 'Taj Malabar Resort', pricePerNight: 9800, rating: 4.7, stars: 5, area: 'Willingdon Island', image: 'Luxury heritage resort overlooking Kochi harbor' },
      { id: 'h-kb-2', name: 'Alleppey Deluxe Houseboat', pricePerNight: 8000, rating: 4.6, stars: 4, area: 'Punnamada Lake', image: 'Private premium floating villa with meals' },
      { id: 'h-kb-3', name: 'Leela Kovalam', pricePerNight: 11000, rating: 4.8, stars: 5, area: 'Kovalam Beachfront', image: 'Cliff-top luxury resort with infinity pool' }
    ],
    trainOptions: [
      { id: 't-kb-1', name: 'Kochi-Trivandrum Express', trainNo: '16301', price: 450, depart: '08:30', arrive: '13:15', duration: '4h 45m' }
    ],
    busOptions: [
      { id: 'b-kb-1', operator: 'KSRTC Swift', type: 'AC Seater', price: 220, depart: '08:00', arrive: '11:30', duration: '3h 30m' }
    ],
    roadwaysOptions: [
      { id: 'r-kb-1', vehicle: 'Swift Hatchback (AC)', provider: 'Indus Self-Drive', price: 2200, detail: 'Self-drive hatchback with unlimited kms' },
      { id: 'r-kb-2', vehicle: 'Crysta SUV (AC)', provider: 'Kerala Car Rental', price: 4500, detail: 'Premium private SUV with tourist guide driver' }
    ],
    placesToVisit: [
      { name: 'Fort Kochi Chinese Fishing Nets', description: 'Watch fishermen operate the massive, cantilevered Chinese fishing nets along Fort Kochi coastline.', funFact: 'Introduced by Chinese explorers in the 14th century.', recommendedTime: 'Sunset', visitDuration: '1 hour', category: 'Nature', price: 0 },
      { name: 'Alleppey Backwaters Houseboat', description: 'Glide along tranquil, palm-fringed canals, vast paddy fields on a traditional houseboat.', funFact: 'Alleppey is known as the Venice of the East.', recommendedTime: 'Afternoon', visitDuration: '4-6 hours', category: 'Nature', price: 250 },
      { name: 'Kovalam Beach & Lighthouse', description: 'Relax on the sandy shores and climb the spiral stairs of the striped lighthouse.', funFact: 'The lighthouse beach is one of the most photographed shorelines.', recommendedTime: 'Evening', visitDuration: '2 hours', category: 'Adventure', price: 20 }
    ],
    restaurants: {
      veg: [
        { name: 'Brindhavan Vegetarian', cuisine: 'Kerala', specialty: 'Ghee Roast Dosa & Elaneer Payasam', costForTwo: '₹400', description: 'Top-rated vegetarian food chain in Kochi.' }
      ],
      nonVeg: [
        { name: 'Paragon Restaurant', cuisine: 'Malabar', specialty: 'Kozhikode Chicken Biryani', costForTwo: '₹800', description: 'Famous coastal culinary icon in Kochi.' }
      ]
    },
    itineraryDays: [
      {
        day: 1,
        title: "Kochi Arrival & Heritage Tour",
        theme: "Heritage",
        morning: { activity: "Arrive Kochi & Check-in", description: "Check in at Taj Malabar overlooking Kochi harbor.", duration: "2h", cost: "Free", tip: "Request a harbor view room." },
        afternoon: { activity: "Chinese Fishing Nets", description: "Walk around Fort Kochi and observe historic cantilever fishing structures.", duration: "2h", cost: "Free", tip: "Help pull the nets with local fishermen." },
        evening: { activity: "Kathakali Performance", description: "Watch classical Kerala dance-drama performance.", duration: "1.5h", cost: "₹300", tip: "Arrive 30 mins early to watch makeup artists work." },
        meals: { breakfast: "Airport Cafe", lunch: "Paragon Fort Kochi", dinner: "Brindhavan CP" },
        transport: "Auto / Tuk-tuk",
        estimatedDayBudget: "₹1,800"
      }
    ]
  },
]

// ── Segment display component ─────────────────────────────────────────────────
function TripSegment({ segment, onRemove, onEdit, index, isAgent }) {
  const segType = SEGMENT_TYPES.find(t => t.id === segment.type) || SEGMENT_TYPES[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-4"
    >
      <div className="flex flex-col items-center flex-shrink-0 pt-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${segType.bg} ${segType.color} flex-shrink-0`}>
          <span className="text-base">{segment.icon}</span>
        </div>
        <div className="w-px flex-1 bg-border/40 mt-2 min-h-4" />
      </div>

      <div className="flex-1 pb-4 min-w-0">
        <div className="glass border border-border rounded-2xl p-4 transition-all hover:border-border/80">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider ${segType.color}`}>
                  {segType.label}
                </span>
                <span className="text-muted text-xs font-mono">{segment.date}</span>
              </div>
              <div className="text-white font-semibold text-sm mb-0.5">
                {segment.from}{segment.to ? ` → ${segment.to}` : ''}
              </div>
              <div className="text-muted text-xs">{segment.detail}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-gold-400 font-bold text-sm font-mono">₹{segment.price.toLocaleString()}</span>
              {isAgent && onEdit && (
                <button
                  onClick={() => onEdit(segment)}
                  className="p-1.5 text-muted hover:text-gold-400 transition-colors rounded-lg hover:bg-gold-400/10"
                  title="Edit segment details (Agent Only)"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(segment.id)}
                  className="p-1.5 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main TripBuilder ──────────────────────────────────────────────────────────


export default function TripBuilder() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const inputRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  
  const [activeTrip, setActiveTrip] = useState(() => {
  const params = new URLSearchParams(window.location.search)
  const agentViewId = params.get('agentView')
  if (agentViewId) {
    const entry = getTripById(agentViewId)
    if (entry) {
      return {
        ...entry.trip,
        isAgentView: true,
        customerName: entry.customer.name,
        customerEmail: entry.customer.email,
      }
    }
  }
  return null
})


  
  


  // Sync active trip to localStorage when it changes
  useEffect(() => {
    if (activeTrip) {
      localStorage.setItem('voyageai_active_trip', JSON.stringify(activeTrip))
    } else {
      localStorage.removeItem('voyageai_active_trip')
    }
  }, [activeTrip])

  // Cross-tab sync for active trip
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'voyageai_active_trip') {
        if (e.newValue) {
          try {
            setActiveTrip(JSON.parse(e.newValue))
          } catch(e) {console.error(e)}
        } else {
          setActiveTrip(null)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('itinerary')
  const [sandboxAgentMode, setSandboxAgentMode] = useState(false)

  const canUseAgentOverride =
  user?.role === 'agent' || user?.role === 'admin'

  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const isAgent = canUseAgentOverride && sandboxAgentMode

  // Helper to safely backfill restaurants list to exactly 10 options
  const backfillRestaurants = (list, isVeg) => {
    const defaultVeg = [
      { name: "Pure Govinda Bhoj", cuisine: "Sattvik", specialty: "Lassi & Paneer Thali", costForTwo: "₹550", description: "Serene ambience and highly pure food." },
      { name: "The Green Plate", cuisine: "South Indian", specialty: "Malgudi Filter Coffee & Ghee Idli", costForTwo: "₹300", description: "Quick service, authentic regional flavors." },
      { name: "Garden Delights Cafe", cuisine: "Continental", specialty: "Avocado Sourdough & Herbal Teas", costForTwo: "₹700", description: "Modern aesthetic cafe serving organic salads." },
      { name: "Spice Route Diner", cuisine: "Gujarati / Rajasthani", specialty: "Maharaja Unlimited Thali", costForTwo: "₹800", description: "Royal heritage thali experience." },
      { name: "Shri Balaji Restaurant", cuisine: "North Indian Veg", specialty: "Dal Makhani & Butter Naan", costForTwo: "₹450", description: "Hygienic local Punjabi spot." },
      { name: "Urban Sprouts Bistro", cuisine: "Vegan / Healthy", specialty: "Zucchini Noodles & Tofu Wrap", costForTwo: "₹650", description: "Healthy guilt-free bowls." },
      { name: "Swathi Veg Diner", cuisine: "Andhra Meals", specialty: "Hyderabadi Veg Biryani & Gongura Pachadi", costForTwo: "₹400", description: "Spicy and traditional meals." },
      { name: "Organic Root Bistro", cuisine: "Farm to Table", specialty: "Jackfruit Biryani & Millet Crepes", costForTwo: "₹600", description: "Nutritious local grain specialties." },
      { name: "Royal Sweet & Chat House", cuisine: "North Indian Sweets", specialty: "Kesar Rasmalai & Raj Kachori", costForTwo: "₹250", description: "Great street food chat stops." },
      { name: "Flavors of South", cuisine: "Chettinad Veg", specialty: "Appam with Veg Stew", costForTwo: "₹350", description: "Authentic spicy Chettinad veg items." }
    ]

    const defaultNonVeg = [
      { name: "The Tandoor Emperor", cuisine: "Mughlai", specialty: "Mutton Seekh Kebab & Garlic Naan", costForTwo: "₹950", description: "Historic clay oven culinary recipes." },
      { name: 'Royal Biryani Corner', cuisine: 'Hyderabadi', specialty: 'Special Chicken Biryani', costForTwo: '₹800', description: 'Famous local recipe for biryani lovers.' },
      { name: "Coastal Spice Bay", cuisine: "Seafood", specialty: "Butter Garlic Prawns & Fish Curry", costForTwo: "₹1,200", description: "Fresh fish catch cooked with local spices." },
      { name: "Mughlai Heritage Diner", cuisine: "North Indian Non-Veg", specialty: "Chicken Jahangiri & Rumali Roti", costForTwo: "₹850", description: "Rich creamy gravies and kebabs." },
      { name: "Angara Grill House", cuisine: "Barbecue", specialty: "Tandoori Chicken & Grill Platters", costForTwo: "₹1,100", description: "Live grilling tables and spicy dips." } ,
      { name: "Golden Sea Catch", cuisine: "Malabar Seafood", specialty: "Karimeen Pollichathu", costForTwo: "₹1,000", description: "Traditional banana leaf fish fries." },
      { name: "Biryani & Kebab Plaza", cuisine: "Awadhi", specialty: "Galouti Kebabs & Warqi Paratha", costForTwo: "₹900", description: "Melt-in-mouth soft meat kebabs." },
      { name: "Spicy Path Corner", cuisine: "Andhra Non-Veg", specialty: "Nellore Fish Curry & Spicy Chicken Fry", costForTwo: "₹750", description: "Authentic fiery hot Andhra spices." },
      { name: "Tandoori Junction", cuisine: "Punjabi Non-Veg", specialty: "Butter Chicken & Tandoori Roti", costForTwo: "₹800", description: "Rich butter-loaded chicken tikka gravies." },
      { name: "Peshawri Grill", cuisine: "Northwest Frontier", specialty: "Sikandari Raan", costForTwo: "₹2,500", description: "Fine-dining premium slow-cooked meat chops." }
    ]

    const source = list || []
    const defaults = isVeg ? defaultVeg : defaultNonVeg
    const result = [...source]
    while (result.length < 10) {
      result.push(defaults[result.length % defaults.length])
    }
    return result.slice(0, 10)
  }

  // Helper to safely backfill attractions to exactly 10 options
  const backfillAttractions = (list) => {
    const defaultAttractions = [
      { name: 'Heritage Gate Plaza', description: 'Magnificent landmark arch marking the entry to the old city.', funFact: 'Completed in 1911 to commemorate royal visits.', recommendedTime: 'Sunset', visitDuration: '1 hour', category: 'History', price: 30 },
      { name: 'Symphony Gardens', description: 'Lush botanical garden featuring musical fountains and rose beds.', funFact: 'Houses over 300 rare orchid species.', recommendedTime: 'Late Afternoon', visitDuration: '2 hours', category: 'Nature', price: 50 },
      { name: 'Adventure Hills Park', description: 'Cliff-side park offering zip-lining, rope climbing and rock wall challenges.', funFact: 'Boasts India\'s longest canopy walk.', recommendedTime: 'Morning', visitDuration: '3 hours', category: 'Adventure', price: 350 },
      { name: 'Craft Bazaar Market', description: 'Artisan village where weavers and potters sell directly.', funFact: 'All proceeds go directly to rural craftsmen.', recommendedTime: 'Afternoon', visitDuration: '2 hours', category: 'Shopping', price: 20 },
      { name: 'Food Street Alley', description: 'A vibrant late-night lane serving authentic regional dishes.', funFact: 'Most stalls have been running for 3 generations.', recommendedTime: 'Night', visitDuration: '1.5 hours', category: 'Food', price: 0 },
      { name: 'Old Town Fort', description: 'Ancient battlements with panoramic views of the entire valley.', funFact: 'Stood undefeated during multiple historic sieges.', recommendedTime: 'Sunrise', visitDuration: '2.5 hours', category: 'History', price: 80 },
      { name: 'Peace Lake Sanctuary', description: 'Serene boating lagoon surrounded by dense green groves.', funFact: 'Stopover destination for migratory siberian birds.', recommendedTime: 'Early Morning', visitDuration: '2 hours', category: 'Nature', price: 150 },
      { name: 'Zip-line Wilderness', description: 'Thrilling aerial zip-line rides flying above local forest canopies.', funFact: 'Fastest zip-line reach up to 60km/h.', recommendedTime: 'Morning', visitDuration: '1.5 hours', category: 'Adventure', price: 450 },
      { name: 'Central Shopping Emporium', description: 'State-sponsored store selling pure silk sarees and carvings.', funFact: 'Fixed price ensures no bargaining pressure.', recommendedTime: 'Afternoon', visitDuration: '2 hours', category: 'Shopping', price: 0 },
      { name: 'Spicy Dining Hub', description: 'Popular culinary spot famous for regional spicy curry pots.', funFact: 'Features a dish that made it to record books.', recommendedTime: 'Evening', visitDuration: '1 hour', category: 'Food', price: 0 }
    ]
    const source = list || []
    const result = [...source]
    while (result.length < 10) {
      result.push(defaultAttractions[result.length % defaultAttractions.length])
    }
    return result.slice(0, 10)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    setActiveTrip(null)
    setActiveTab('itinerary')

    try {
      const trip = await generateMultiModalTrip(prompt)
      
      // Enriched AI response package
      const enrichedTrip = {
        ...trip,
        isAI: true,
        flightOptions: trip.flightOptions || [
          { id: 'f-opt-1', airline: 'IndiGo', flightNo: '6E-102', price: 4500, depart: '06:00', arrive: '08:15', duration: '2h 15m', stops: 0, logo: '✈️' },
          { id: 'f-opt-2', airline: 'Air India', flightNo: 'AI-204', price: 5400, depart: '14:30', arrive: '16:50', duration: '2h 20m', stops: 0, logo: '✈️' }
        ],
        hotelOptions: trip.hotelOptions || [
          { id: 'h-opt-1', name: 'Grand Royal Stay', pricePerNight: 3200, rating: 4.4, stars: 4, area: 'City Center', image: 'Comfortable luxury lodging' },
          { id: 'h-opt-2', name: 'Elite Haven Residency', pricePerNight: 2100, rating: 4.0, stars: 3, area: 'Near Sightseeing Hub', image: 'Scenic and budget-friendly' }
        ],
        trainOptions: trip.trainOptions || [
          { id: 't-opt-1', name: 'Rajdhani Express', trainNo: '12951', price: 1500, depart: '16:30', arrive: '08:30', duration: '16h 00m' },
          { id: 't-opt-2', name: 'Duronto Express', trainNo: '12267', price: 1100, depart: '23:15', arrive: '15:30', duration: '16h 15m' }
        ],
        busOptions: trip.busOptions || [
          { id: 'b-opt-1', operator: 'Neeta Travels', type: 'Volvo AC Sleeper', price: 900, depart: '19:00', arrive: '07:30', duration: '12h 30m' },
          { id: 'b-opt-2', operator: 'IntrCity SmartBus', type: 'AC Seater/Sleeper', price: 780, depart: '20:30', arrive: '09:00', duration: '12h 30m' }
        ],
        roadwaysOptions: trip.roadwaysOptions || [
          { id: 'r-opt-1', vehicle: 'Swift Sedan (AC)', provider: 'Ola Outstation', price: 2200, detail: 'Comfortable private car drop with experienced driver' },
          { id: 'r-opt-2', vehicle: 'Innova MPV (AC)', provider: 'MakeMyTrip Outstation', price: 3800, detail: 'Spacious vehicle, ideal for group tour' }
        ],
        costComparison: trip.costComparison || {
          flightCost: '₹4,500',
          trainCost: '₹1,500',
          busCost: '₹900',
          roadwaysCost: '₹2,200',
          analysis: 'Flights are 6x faster but trains/roadways are highly budget-friendly. Cabs/Roadways are great for custom highway stopovers.',
          aiSuggestion: 'Since you want a custom road trip, hiring private roadways provides maximum exploration flexibility.'
        },
        restaurants: {
          veg: backfillRestaurants(trip.restaurants?.veg, true),
          nonVeg: backfillRestaurants(trip.restaurants?.nonVeg, false)
        },
        itineraryDays: trip.itineraryDays || [
          {
            day: 1,
            title: "Arrival and Leisure Walk",
            theme: "Arrival",
            morning: { activity: "Airport/Station pickup", description: "Transfer to your selected stay and unpack.", duration: "2h", cost: "Free", tip: "Coordinate with operator beforehand." },
            afternoon: { activity: "Explore Local Markets", description: "Wander the traditional bazaars and handicraft stores.", duration: "3h", cost: "Free", tip: "Great time to pick souvenirs." },
            evening: { activity: "Enjoy Sunset at Lakeshore", description: "Watch boats sail against beautiful skyline reflections.", duration: "2h", cost: "₹100", tip: "Grab local street snacks here." },
            meals: { breakfast: "Resort Diner", lunch: "Sagar Ratna", dinner: "The Mughal Emperor" },
            transport: "Auto-rickshaws",
            estimatedDayBudget: "₹1,200"
          }
        ],
        placesToVisit: backfillAttractions(trip.placesToVisit)
      }

      setActiveTrip(enrichedTrip)
      toast.success('Trip itinerary generated!')
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary. Check your VITE_GROQ_API_KEY.')
    } finally {
      setGenerating(false)
    }
  }

  const handlePreset = (preset) => {
    const enriched = {
      ...preset,
      isAI: false,
      flightOptions: preset.flightOptions || [
        { id: 'f-pr-1', airline: 'IndiGo', flightNo: '6E 204', price: 4299, depart: '06:00', arrive: '08:10', duration: '2h 10m', stops: 0, logo: '✈️' },
        { id: 'f-pr-2', airline: 'Air India', flightNo: 'AI 473', price: 3800, depart: '18:30', arrive: '20:15', duration: '1h 45m', stops: 0, logo: '✈️' }
      ],
      hotelOptions: preset.hotelOptions || [
        { id: 'h-pr-1', name: 'Taj Mahal Palace', pricePerNight: 9000, rating: 4.8, stars: 5, area: 'Heritage Zone', image: 'Five-star royal palace experience' },
        { id: 'h-pr-2', name: 'The Lalit', pricePerNight: 6000, rating: 4.6, stars: 5, area: 'Connaught Circle', image: 'Premium corporate stay' }
      ],
      trainOptions: preset.trainOptions || [
        { id: 't-pr-1', name: 'Shatabdi Express', trainNo: '12001', price: 645, depart: '06:15', arrive: '08:10', duration: '1h 55m' }
      ],
      busOptions: preset.busOptions || [
        { id: 'b-pr-1', operator: 'VRL Travels AC', type: 'AC Sleeper', price: 550, depart: '09:00', arrive: '14:30', duration: '5h 30m' }
      ],
      roadwaysOptions: preset.roadwaysOptions || [
        { id: 'r-pr-1', vehicle: 'Swift Dzire Sedan', provider: 'Ola Cabs', price: 2000, detail: 'Intercity travel package with toll coverage' }
      ],
      costComparison: preset.costComparison || {
        flightCost: '₹4,299',
        trainCost: '₹645',
        busCost: '₹550',
        roadwaysCost: '₹2,000',
        analysis: 'Flights save travel time. Trains represent the best balance of comfort and pricing. Roadways let you stop at historic highway spots.',
        aiSuggestion: 'We suggest a combination of flights and train segments for safety and comfort.'
      },
      restaurants: {
        veg: backfillRestaurants(preset.restaurants?.veg, true),
        nonVeg: backfillRestaurants(preset.restaurants?.nonVeg, false)
      },
      itineraryDays: preset.itineraryDays || [
        {
          day: 1,
          title: "Heritage Fort Walk",
          theme: "History",
          morning: { activity: "Airport Transfer", description: "Cab directly to your pre-booked palace resort.", duration: "1.5h", cost: "Free", tip: "Pre-book with travel agency." },
          afternoon: { activity: "Visit Old Fort Walls", description: "Walk ancient stone battlements and explore artifacts.", duration: "2h", cost: "₹50", tip: "Hire local guides for facts." },
          evening: { activity: "Bazaar Spice Tour", description: "Guided tour through colorful, pungent old markets.", duration: "2.5h", cost: "Free", tip: "Stay hydrated and watch pockets." },
          meals: { breakfast: "Airport Cafe", lunch: "Karim's", dinner: "Sattvik CP" },
          transport: "Auto rickshaw",
          estimatedDayBudget: "₹1,500"
        }
      ],
      placesToVisit: backfillAttractions(preset.placesToVisit)
    }

    setActiveTrip(enriched)
    setError(null)
    setActiveTab('itinerary')
  }

  const removeSegment = (id) => {
    setActiveTrip(prev => ({
      ...prev,
      segments: prev.segments.filter(s => s.id !== id),
    }))
  }

  const getTransportEndpoints = (segments) => {
    const existingTransport = segments.find(s => TRANSPORT_TYPES.includes(s.type))
    return {
      from: existingTransport?.from || 'Origin',
      to: existingTransport?.to || 'Destination',
    }
  }

  const replaceSelectedTransport = (segments, newSegment) => [
    newSegment,
    ...segments.filter(s => !TRANSPORT_TYPES.includes(s.type)),
  ]

  // Swap methods for Flight, Hotel, Train, Bus, Roadways options
  const selectFlightOption = (option) => {
    setActiveTrip(prev => {
      const copy = { ...prev }
      const endpoints = getTransportEndpoints(prev.segments)
      const newSegment = {
        id: 'seg-flight',
        type: 'flight',
        from: endpoints.from,
        to: endpoints.to,
        date: 'Day 1 · ' + option.depart,
        detail: `${option.airline} ${option.flightNo} · ${option.duration} · ${option.stops === 0 ? 'Direct' : option.stops + ' Stops'}`,
        price: option.price,
        icon: '✈️'
      }
      copy.segments = replaceSelectedTransport(prev.segments, newSegment)
      return copy
    })
    toast.success(`${option.airline} flight selected!`)
  }

  const selectHotelOption = (option) => {
    setActiveTrip(prev => {
      const copy = { ...prev }
      const days = parseInt(prev.duration) || 5
      const newSegment = {
        id: 'seg-hotel',
        type: 'hotel',
        from: option.name,
        to: '',
        date: `Stay duration`,
        detail: `${option.area} · ${option.stars}★ Hotel · Rating: ${option.rating}/5`,
        price: option.pricePerNight * days,
        icon: '🏨'
      }
      const hasHotel = prev.segments.some(s => s.type === 'hotel')
      if (hasHotel) {
        copy.segments = prev.segments.map(s => s.type === 'hotel' ? newSegment : s)
      } else {
        copy.segments = [...prev.segments, newSegment]
      }
      return copy
    })
    toast.success(`${option.name} hotel selected!`)
  }

  const selectTrainOption = (option) => {
    setActiveTrip(prev => {
      const copy = { ...prev }
      const endpoints = getTransportEndpoints(prev.segments)
      const newSegment = {
        id: 'seg-train',
        type: 'train',
        from: endpoints.from,
        to: endpoints.to,
        date: 'Day 1 · ' + option.depart,
        detail: `${option.name} (${option.trainNo}) · ${option.duration}`,
        price: option.price,
        icon: '🚂'
      }
      copy.segments = replaceSelectedTransport(prev.segments, newSegment)
      return copy
    })
    toast.success(`${option.name} train selected!`)
  }

  const selectBusOption = (option) => {
    setActiveTrip(prev => {
      const copy = { ...prev }
      const endpoints = getTransportEndpoints(prev.segments)
      const newSegment = {
        id: 'seg-bus',
        type: 'bus',
        from: endpoints.from,
        to: endpoints.to,
        date: 'Day 1 · ' + option.depart,
        detail: `${option.operator} · ${option.type} · ${option.duration}`,
        price: option.price,
        icon: '🚌'
      }
      copy.segments = replaceSelectedTransport(prev.segments, newSegment)
      return copy
    })
    toast.success(`${option.operator} bus selected!`)
  }

  const selectRoadwaysOption = (option) => {
    setActiveTrip(prev => {
      const copy = { ...prev }
      const endpoints = getTransportEndpoints(prev.segments)
      const newSegment = {
        id: 'seg-roadways',
        type: 'roadways',
        from: endpoints.from,
        to: endpoints.to,
        date: 'Day 1',
        detail: `${option.vehicle} · via ${option.provider} · ${option.detail}`,
        price: option.price,
        icon: '🚗'
      }
      copy.segments = replaceSelectedTransport(prev.segments, newSegment)
      return copy
    })
    toast.success(`${option.vehicle} roadways selected!`)
  }

  // Travel Agent Editing Launchers
  const openEditModal = (itemType, indexOrId, data, extra = {}) => {
    setEditingItem({ type: itemType, idOrIndex: indexOrId, extra })
    setEditForm({ ...data })
  }

  const saveAgentEdits = () => {
    setActiveTrip(prev => {
      const copy = { ...prev }
      
      if (editingItem.type === 'metadata') {
        copy.tripName = editForm.tripName || copy.tripName || copy.name
        copy.name = editForm.tripName || copy.name
        copy.desc = editForm.desc || copy.desc
        copy.duration = editForm.duration || copy.duration
      }
      else if (editingItem.type === 'segment') {
        copy.segments = copy.segments.map(seg => 
          seg.id === editingItem.idOrIndex ? { ...seg, ...editForm, price: Number(editForm.price) || 0 } : seg
        )
      }
      else if (editingItem.type === 'itinerary') {
        copy.itineraryDays = copy.itineraryDays.map((d, i) => 
          i === editingItem.idOrIndex ? { ...d, ...editForm } : d
        )
      }
      else if (editingItem.type === 'dining') {
        const cat = editingItem.extra.category // 'veg' | 'nonVeg'
        copy.restaurants[cat] = copy.restaurants[cat].map((r, i) =>
          i === editingItem.idOrIndex ? { ...r, ...editForm } : r
        )
      }
      else if (editingItem.type === 'attraction') {
        copy.placesToVisit = copy.placesToVisit.map((p, i) =>
          i === editingItem.idOrIndex ? { ...p, ...editForm, price: Number(editForm.price) || 0 } : p
        )
      }
      else if (editingItem.type === 'costComparison') {
        copy.costComparison = { ...copy.costComparison, ...editForm }
      }

      return copy
    })
    
    setEditingItem(null)
    toast.success('Itinerary successfully updated by Agent!')
  }

  // Total Calculation Logic (Package vs Grand Trip Cost)
  const daysCount = activeTrip ? (parseInt(activeTrip.duration) || 5) : 5
  
  // 1. Stays Cost
  const staysCost = activeTrip?.segments
    ?.filter(s => s.type === 'hotel')
    ?.reduce((sum, s) => sum + (s.price || 0), 0) || 0

  // 2. Transportation Cost (Flight, Train, Bus, Roadways)
  const transportCost = activeTrip?.segments
    ?.filter(s => s.type === 'flight' || s.type === 'train' || s.type === 'bus' || s.type === 'roadways')
    ?.reduce((sum, s) => sum + (s.price || 0), 0) || 0

  const selectedTransportSegments = activeTrip?.segments
    ?.filter(s => TRANSPORT_TYPES.includes(s.type)) || []

  // 3. Sightseeing & Entry Fee Cost (from top 10 attractions list)
  const sightsCost = activeTrip?.placesToVisit
    ?.reduce((sum, p) => sum + (Number(p.price) || 0), 0) || 0

  // 4. Dining Food Cost estimate (₹1,200 per day * number of days)
  const estFoodCost = daysCount * 1200

  // Grand Trip Total Cost (all-inclusive)
  const grandTripTotal = staysCost + transportCost + sightsCost + estFoodCost

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 flex items-start justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-muted text-xs sm:text-sm mb-2 sm:mb-3 flex-wrap">
              <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="text-white">Trip Builder</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Trip Builder</h1>
            <p className="text-muted text-sm">Describe your destination — AI generates flights, trains, buses, roadways & hotels.</p>
          </div>

          {/* Sandbox Agent Switcher */}
          {canUseAgentOverride && (
          <div className="glass border border-border/80 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-xs font-semibold text-white/80 hidden sm:block">Agent Override</span>
            <span className="text-xs font-semibold text-white/80 sm:hidden">Agent</span>
            <button
              onClick={() => {
                setSandboxAgentMode(!sandboxAgentMode)
                toast.success(sandboxAgentMode ? 'Switched to Traveler View' : 'Switched to Travel Agent Mode!')
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${isAgent ? 'bg-gold-500' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-void shadow-sm transform transition-transform ${isAgent ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          )}
        </motion.div>

        {/* AI prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass gradient-border rounded-3xl p-6 mb-6"
        >
          <label className="text-xs text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Enter Destination & Preferences
          </label>
          <div 
            className="flex gap-3 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
              placeholder='e.g. "Create me a 5 days itinerary for Hyderabad with all the best places to visit, vegetarian food preference, Delhi starting point"'
              className="flex-1 bg-transparent text-white text-sm placeholder-muted resize-none outline-none min-h-[60px] leading-relaxed relative z-10"
              rows={2}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className={`px-5 py-3 font-bold rounded-xl flex items-center gap-2 self-end transition-all flex-shrink-0 ${
                !prompt.trim() || generating
                  ? 'bg-surface text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 to-gold-400 text-void shadow-gold-sm hover:shadow-gold'
              }`}
            >
              {generating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? 'Building...' : 'Build Trip'}
            </motion.button>
          </div>
          <p className="text-muted/50 text-xs mt-3">Powered by VoyageAI Intelligence LPU · Consolidates flights, hotels, trains, buses & roadways</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Presets */}
        {!activeTrip && !generating && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <h2 className="font-display text-xl font-bold text-white mb-4">Or start from a preset</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {PRESET_TRIPS.map(preset => (
                <motion.button
                  key={preset.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePreset(preset)}
                  className="glass border border-border hover:border-gold-400/20 rounded-2xl p-5 text-left transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{preset.icon}</span>
                    <div>
                      <div className="font-display text-white font-bold group-hover:text-gold-300 transition-colors">{preset.name}</div>
                      <div className="text-muted text-sm mb-2">{preset.desc}</div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {preset.duration}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                          ₹{preset.segments.reduce((s, seg) => s + seg.price, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold"
              >
                <Sparkles className="w-8 h-8 text-void" />
              </motion.div>
              <h3 className="font-display text-xl text-white mb-2">Analyzing destination and travel routes...</h3>
              <p className="text-muted text-sm">Combining flight schedules, trains, buses, private cabs, restaurants & stays</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active trip workspace */}
        <AnimatePresence>
          {activeTrip && !generating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              
              {/* Agent mode banner */}
              {isAgent && (
                <div className="mb-6 p-4 bg-gold-400/10 border border-gold-400/20 text-gold-300 text-xs rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold-400 animate-pulse" />
                    <span><strong>Travel Agent Override Enabled</strong>: Click the edit icons (📝) next to any component to tweak pricing or titles.</span>
                  </div>
                  <button 
                    onClick={() => openEditModal('metadata', 'meta', { 
                      tripName: activeTrip.tripName || activeTrip.name, 
                      desc: activeTrip.desc,
                      duration: activeTrip.duration 
                    })}
                    className="px-3 py-1 bg-gold-400 text-void font-bold rounded-lg flex items-center gap-1 hover:bg-gold-300 transition-colors hover:text-white"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Trip Metadata
                  </button>
                </div>
              )}

              {activeTrip?.isAgentView && (
  <div className="mb-6 p-4 bg-sky-400/10 border border-sky-400/20 rounded-2xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Users className="w-4 h-4 text-sky-400" />
      <div>
        <p className="text-sky-300 font-semibold text-sm">Viewing Customer Trip</p>
        <p className="text-sky-300/60 text-xs">
          Built by {activeTrip.customerName} ({activeTrip.customerEmail})
        </p>
      </div>
    </div>
    <Link
      to="/agent/trips"
      className="px-3 py-1.5 glass border border-sky-400/20 text-sky-400 text-xs font-bold rounded-lg hover:bg-sky-400/10 transition-all"
    >
      ← Back to Requests
    </Link>
  </div>
)}

              {/* Title Header */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-2xl font-bold text-white">
                      {activeTrip.tripName || activeTrip.name}
                    </h2>
                    {activeTrip.isAI && (
                      <span className="px-2 py-0.5 bg-gold-400/15 border border-gold-400/20 text-gold-400 text-xs rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> VoyageAI LPU
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm">{activeTrip.desc} · {activeTrip.duration}</p>
                </div>
                <button
                  onClick={() => setActiveTrip(null)}
                  className="px-3 py-2 glass border border-border rounded-xl text-sm text-muted hover:text-white transition-all"
                >
                  ← Back to Planner
                </button>
              </div>

              {/* Cost Comparison Analyzer Banner */}
              {activeTrip.costComparison && (
                <div className="mb-8 glass border border-white/5 rounded-3xl p-5 relative overflow-hidden bg-surface/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-gold-400" /> AI Transportation Expense Analyzer & Recommendation
                    </h3>
                    {isAgent && (
                      <button 
                        onClick={() => openEditModal('costComparison', 'comp', activeTrip.costComparison)}
                        className="text-muted hover:text-gold-400 transition-colors"
                        title="Edit Cost Comparison Suggestion"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { type: 'Flight', cost: activeTrip.costComparison.flightCost, icon: Plane, color: 'text-gold-400', progress: 85 },
                      { type: 'Train', cost: activeTrip.costComparison.trainCost, icon: Train, color: 'text-sky-400', progress: 30 },
                      { type: 'Bus', cost: activeTrip.costComparison.busCost, icon: Bus, color: 'text-violet-400', progress: 15 },
                      { type: 'Roadways', cost: activeTrip.costComparison.roadwaysCost || '₹2,500', icon: Car, color: 'text-orange-400', progress: 50 }
                    ].map(mode => {
                      const ModeIcon = mode.icon
                      return (
                        <div key={mode.type} className="bg-white/2 border border-white/5 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted font-medium">{mode.type}</span>
                            <ModeIcon className={`w-4 h-4 ${mode.color}`} />
                          </div>
                          <div className="text-lg font-bold text-white mb-2">{mode.cost}</div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-400 rounded-full" style={{ width: `${mode.progress}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-4 rounded-2xl border border-gold-400/20 bg-gold-400/5 text-xs text-gold-200 leading-relaxed">
                    <p className="mb-2"><strong>Route Analysis:</strong> {activeTrip.costComparison.analysis}</p>
                    <p className="font-semibold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-gold-400" /> Suggestion: {activeTrip.costComparison.aiSuggestion}</p>
                  </div>
                </div>
              )}

              {/* Main Layout Grid — stacks on mobile/tablet, side-by-side on xl+ */}
              <div className="grid xl:grid-cols-[1fr_320px] gap-5 xl:gap-6 items-start">
                
                {/* Left: Interactive custom subpages */}
                <div>
                  
                  {/* Custom Navigation Tab Headers — horizontally scrollable on all screens */}
                  <div className="-mx-1 px-1">
                    <div className="flex overflow-x-auto gap-0.5 border-b border-white/10 pb-px mb-5 sm:mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {[
                        { id: 'itinerary', label: '📋 Plan' },
                        { id: 'flights', label: '✈️ Flights' },
                        { id: 'hotels', label: '🏨 Stays' },
                        { id: 'trains', label: '🚂 Trains' },
                        { id: 'buses', label: '🚌 Buses' },
                        { id: 'roadways', label: '🚗 Roadways' },
                        { id: 'attractions', label: '🏛 Sights' },
                        { id: 'dining', label: '🍲 Dining' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap -mb-px flex-shrink-0 ${
                            activeTab === tab.id
                              ? 'border-gold-400 text-gold-400'
                              : 'border-transparent text-muted hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Contents */}
                  <AnimatePresence mode="wait">
                    
                    {/* ITINERARY TAB */}
                    {activeTab === 'itinerary' && (
                      <motion.div key="itinerary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        
                        {/* Day-by-Day Detailed Schedule */}
                        <div className="space-y-4">
                          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gold-400" /> Detailed Daily Schedule
                          </h3>
                          
                          {activeTrip.itineraryDays?.map((day, dIdx) => (
                            <div key={dIdx} className="glass border border-border rounded-2xl p-5 relative overflow-hidden">
                              
                              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/20 flex flex-col items-center justify-center text-gold-400">
                                    <span className="font-bold text-sm leading-none">{day.day}</span>
                                    <span className="text-[9px] uppercase font-bold tracking-tighter">Day</span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-base">{day.title}</h4>
                                    <span className="text-[10px] text-muted font-bold tracking-widest uppercase">{day.theme} · Budget: {day.estimatedDayBudget}</span>
                                  </div>
                                </div>
                                {isAgent && (
                                  <button 
                                    onClick={() => openEditModal('itinerary', dIdx, day)}
                                    className="p-1.5 text-muted hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
                                    title="Edit Day Itinerary"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="space-y-4 pl-1 border-l border-white/5">
                                {/* Morning, Afternoon, Evening Slots */}
                                {[
                                  { slot: 'morning', label: 'Morning Slot', icon: Coffee, color: 'text-amber-400' },
                                  { slot: 'afternoon', label: 'Afternoon Slot', icon: Sun, color: 'text-gold-400' },
                                  { slot: 'evening', label: 'Evening Slot', icon: Moon, color: 'text-sky-400' }
                                ].map(time => {
                                  const details = day[time.slot]
                                  if (!details) return null
                                  const IconComponent = time.icon
                                  return (
                                    <div key={time.slot} className="flex gap-3">
                                      <div className="flex flex-col items-center">
                                        <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                                          <IconComponent className={`w-3.5 h-3.5 ${time.color}`} />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-white/40">{time.label}</div>
                                        <h5 className="font-bold text-sm text-white mt-0.5">{details.activity}</h5>
                                        <p className="text-muted text-xs leading-relaxed mt-1">{details.description}</p>
                                        <div className="flex items-center gap-3 text-[10px] font-semibold text-gold-400/80 mt-1">
                                          <span>⏱ {details.duration}</span>
                                          <span>💵 Cost: {details.cost}</span>
                                          {details.tip && <span className="text-sky-300/80">💡 Tip: {details.tip}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Daily dining recommendations */}
                              {day.meals && (
                                <div className="mt-4 p-3 bg-white/2 rounded-xl border border-white/5 text-xs">
                                  <div className="font-semibold text-white/80 mb-2 flex items-center gap-1.5">
                                    <Utensils className="w-3.5 h-3.5 text-sage-400" /> Restaurant Recommendations
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[['Breakfast', day.meals.breakfast], ['Lunch', day.meals.lunch], ['Dinner', day.meals.dinner]].map(([meal, desc]) => (
                                      <div key={meal}>
                                        <span className="text-muted font-medium text-[10px] uppercase">{meal}</span>
                                        <p className="text-white/70 truncate mt-0.5" title={desc}>{desc}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Daily transport tips */}
                              {day.transport && (
                                <div className="mt-3 text-[10px] text-muted flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-sky-400" />
                                  <span>Daily travel recommendation: {day.transport}</span>
                                </div>
                              )}

                            </div>
                          ))}
                        </div>

                      </motion.div>
                    )}

                    {/* FLIGHTS TAB */}
                    {activeTab === 'flights' && (
                      <motion.div key="flights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg font-bold text-white">Compare Flight Options (Price/Individual)</h3>
                          <span className="text-xs text-muted">Select an option to replace active flight segment</span>
                        </div>
                        <div className="space-y-3">
                          {activeTrip.flightOptions?.map((fOpt, idx) => {
                            const isActiveFlight = activeTrip.segments.some(s => s.type === 'flight' && s.price === fOpt.price && s.detail.includes(fOpt.flightNo))
                            return (
                              <div key={fOpt.id || idx} className={`glass border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${isActiveFlight ? 'border-gold-400 bg-gold-400/5' : 'border-border'}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{fOpt.logo || '✈️'}</span>
                                  <div>
                                    <h4 className="text-white font-bold text-sm">{fOpt.airline} <span className="text-muted text-xs font-normal">({fOpt.flightNo})</span></h4>
                                    <div className="text-muted text-xs flex items-center gap-3 mt-1 font-mono">
                                      <span>🛫 {fOpt.depart} – {fOpt.arrive}</span>
                                      <span>⏱ {fOpt.duration}</span>
                                      <span>💺 {fOpt.stops === 0 ? 'Non-Stop' : `${fOpt.stops} Stops`}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-gold-400 font-bold text-base">₹{fOpt.price.toLocaleString()}</span>
                                  <button
                                    onClick={() => selectFlightOption(fOpt)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      isActiveFlight
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-400/20'
                                        : 'bg-gold-gradient text-void hover:opacity-90 shadow-gold-sm'
                                    }`}
                                  >
                                    {isActiveFlight ? '✓ Selected' : 'Select Flight'}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* HOTELS/STAYS TAB */}
                    {activeTab === 'hotels' && (
                      <motion.div key="hotels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg font-bold text-white">Compare Hotel & Resort Options (Price/Night)</h3>
                          <span className="text-xs text-muted">Select an option to replace active hotel segment</span>
                        </div>
                        <div className="space-y-3">
                          {activeTrip.hotelOptions?.map((hOpt, idx) => {
                            const days = parseInt(activeTrip.duration) || 5
                            const isActiveHotel = activeTrip.segments.some(s => s.type === 'hotel' && s.from === hOpt.name)
                            return (
                              <div key={hOpt.id || idx} className={`glass border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${isActiveHotel ? 'border-gold-400 bg-gold-400/5' : 'border-border'}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🏨</span>
                                  <div>
                                    <h4 className="text-white font-bold text-sm">{hOpt.name}</h4>
                                    <p className="text-muted text-xs mt-1">{hOpt.area} · {hOpt.stars}★ Hotel</p>
                                    <div className="text-[10px] text-gold-300 font-medium flex items-center gap-1.5 mt-1">
                                      <span>⭐ {hOpt.rating}/5 Rating</span>
                                      <span className="text-muted">·</span>
                                      <span className="text-muted italic truncate">{hOpt.image}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                                  <div>
                                    <span className="text-gold-400 font-bold text-base">₹{hOpt.pricePerNight.toLocaleString()}</span>
                                    <div className="text-[9px] text-muted">₹{(hOpt.pricePerNight * days).toLocaleString()} total ({days} nights)</div>
                                  </div>
                                  <button
                                    onClick={() => selectHotelOption(hOpt)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      isActiveHotel
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-400/20'
                                        : 'bg-gold-gradient text-void hover:opacity-90 shadow-gold-sm'
                                    }`}
                                  >
                                    {isActiveHotel ? '✓ Selected' : 'Select Stay'}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* TRAINS TAB */}
                    {activeTab === 'trains' && (
                      <motion.div key="trains" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg font-bold text-white">Compare Train Options (Price/Individual)</h3>
                          <span className="text-xs text-muted">Select an option to replace active train segment</span>
                        </div>
                        <div className="space-y-3">
                          {activeTrip.trainOptions?.map((tOpt, idx) => {
                            const isActiveTrain = activeTrip.segments.some(s => s.type === 'train' && s.price === tOpt.price && s.detail.includes(tOpt.trainNo))
                            return (
                              <div key={tOpt.id || idx} className={`glass border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${isActiveTrain ? 'border-gold-400 bg-gold-400/5' : 'border-border'}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🚂</span>
                                  <div>
                                    <h4 className="text-white font-bold text-sm">{tOpt.name} <span className="text-muted text-xs font-normal">({tOpt.trainNo})</span></h4>
                                    <div className="text-muted text-xs flex items-center gap-3 mt-1 font-mono">
                                      <span>🛫 {tOpt.depart} – {tOpt.arrive}</span>
                                      <span>⏱ {tOpt.duration}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-gold-400 font-bold text-base">₹{tOpt.price.toLocaleString()}</span>
                                  <button
                                    onClick={() => selectTrainOption(tOpt)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      isActiveTrain
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-400/20'
                                        : 'bg-gold-gradient text-void hover:opacity-90 shadow-gold-sm'
                                    }`}
                                  >
                                    {isActiveTrain ? '✓ Selected' : 'Select Train'}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* BUSES TAB */}
                    {activeTab === 'buses' && (
                      <motion.div key="buses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg font-bold text-white">Compare Bus Options (Price/Individual)</h3>
                          <span className="text-xs text-muted">Select an option to replace active bus segment</span>
                        </div>
                        <div className="space-y-3">
                          {activeTrip.busOptions?.map((bOpt, idx) => {
                            const isActiveBus = activeTrip.segments.some(s => s.type === 'bus' && s.price === bOpt.price && s.detail.includes(bOpt.operator))
                            return (
                              <div key={bOpt.id || idx} className={`glass border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${isActiveBus ? 'border-gold-400 bg-gold-400/5' : 'border-border'}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🚌</span>
                                  <div>
                                    <h4 className="text-white font-bold text-sm">{bOpt.operator} <span className="text-muted text-xs font-normal">({bOpt.type})</span></h4>
                                    <div className="text-muted text-xs flex items-center gap-3 mt-1 font-mono">
                                      <span>🛫 {bOpt.depart} – {bOpt.arrive}</span>
                                      <span>⏱ {bOpt.duration}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-gold-400 font-bold text-base">₹{bOpt.price.toLocaleString()}</span>
                                  <button
                                    onClick={() => selectBusOption(bOpt)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      isActiveBus
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-400/20'
                                        : 'bg-gold-gradient text-void hover:opacity-90 shadow-gold-sm'
                                    }`}
                                  >
                                    {isActiveBus ? '✓ Selected' : 'Select Bus'}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ROADWAYS TAB */}
                    {activeTab === 'roadways' && (
                      <motion.div key="roadways" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-lg font-bold text-white">Compare Roadways & Cab Hire (Price/Trip Drop)</h3>
                          <span className="text-xs text-muted">Select an option to replace active roadways segment</span>
                        </div>
                        <div className="space-y-3">
                          {activeTrip.roadwaysOptions?.map((rOpt, idx) => {
                            const isActiveRoad = activeTrip.segments.some(s => s.type === 'roadways' && s.price === rOpt.price && s.detail.includes(rOpt.provider))
                            return (
                              <div key={rOpt.id || idx} className={`glass border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${isActiveRoad ? 'border-gold-400 bg-gold-400/5' : 'border-border'}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🚗</span>
                                  <div>
                                    <h4 className="text-white font-bold text-sm">{rOpt.vehicle} <span className="text-muted text-xs font-normal">({rOpt.provider})</span></h4>
                                    <p className="text-muted text-xs mt-1 leading-relaxed">{rOpt.detail}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-gold-400 font-bold text-base">₹{rOpt.price.toLocaleString()}</span>
                                  <button
                                    onClick={() => selectRoadwaysOption(rOpt)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                      isActiveRoad
                                        ? 'bg-gold-500/10 text-gold-400 border border-gold-400/20'
                                        : 'bg-gold-gradient text-void hover:opacity-90 shadow-gold-sm'
                                    }`}
                                  >
                                    {isActiveRoad ? '✓ Selected' : 'Select Roadways'}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* SIGHTS TAB (TOP 10 SIGHTS) */}
                    {activeTab === 'attractions' && (
                      <motion.div key="attractions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="mb-2">
                          <h3 className="font-display text-lg font-bold text-white">Top 10 Attractions to Visit & Enjoy</h3>
                          <p className="text-xs text-muted">A dedicated countdown of the best points of interest in this city.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                          {activeTrip.placesToVisit?.map((place, pIdx) => {
                            const cat = getCategoryDetails(place.category)
                            const CatIcon = cat.icon
                            return (
                              <div key={pIdx} className="glass border border-border rounded-2xl p-5 flex flex-col justify-between transition-all group hover:border-gold-400/20 relative overflow-hidden bg-surface/5">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-gold-400/15 text-gold-400 font-bold text-xs flex items-center justify-center font-mono">
                                      {(pIdx + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${cat.bg} ${cat.color}`}>
                                      <CatIcon className="w-3 h-3" />
                                      {cat.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-muted font-bold flex items-center gap-0.5"><Clock className="w-3 h-3" /> {place.visitDuration}</span>
                                    {isAgent && (
                                      <button
                                        onClick={() => openEditModal('attraction', pIdx, place)}
                                        className="text-muted hover:text-gold-400 transition-colors"
                                        title="Edit Attraction Details"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-white font-bold text-sm mb-1.5 group-hover:text-gold-300 transition-colors">{place.name}</h4>
                                  <p className="text-muted text-xs leading-relaxed mb-4">{place.description}</p>
                                </div>

                                <div className="mt-auto pt-3 border-t border-white/5 space-y-1.5 text-[10px]">
                                  <div className="flex items-center justify-between text-white/70">
                                    <span>Best Hour: <strong>{place.recommendedTime}</strong></span>
                                    <span className="text-gold-400 font-bold">Ticket: ₹{place.price || 0}</span>
                                  </div>
                                  {place.funFact && (
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-[9px] text-gold-300/80 italic leading-relaxed">
                                      <strong>Fact:</strong> {place.funFact}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* DINING FINDER TAB (VEG / NON-VEG DIET SPLIT) */}
                    {activeTab === 'dining' && (
                      <motion.div key="dining" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="font-display text-lg font-bold text-white">Top 10 Food Joints & Restaurants</h3>
                            <p className="text-xs text-muted font-medium">Exactly 10 vegetarian and 10 non-vegetarian/mixed dining hotspots.</p>
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          
                          {/* Vegetarian Diner Column */}
                          <div className="space-y-4">
                            <h4 className="font-display text-sm font-bold text-emerald-400 flex items-center gap-2 pb-2 border-b border-emerald-500/10">
                              🥦 Top 10 Pure Veg Restaurants
                            </h4>
                            <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
                              {activeTrip.restaurants?.veg?.map((rest, rIdx) => (
                                <div key={rIdx} className="glass border border-emerald-500/10 rounded-2xl p-4 relative bg-emerald-500/2 hover:border-emerald-500/30 transition-all">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center">{(rIdx+1)}</span>
                                      <h5 className="font-bold text-sm text-white">{rest.name}</h5>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-[9px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded font-bold">{rest.cuisine}</span>
                                      {isAgent && (
                                        <button 
                                          onClick={() => openEditModal('dining', rIdx, rest, { category: 'veg' })}
                                          className="text-muted hover:text-gold-400 transition-colors"
                                          title="Edit Restaurant"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-muted text-xs leading-relaxed mb-3">{rest.description}</p>
                                  <div className="flex items-center justify-between text-[10px] font-semibold pt-2 border-t border-white/5 text-emerald-300/80">
                                    <span>🌟 Specialty: {rest.specialty}</span>
                                    <span>💰 Budget: {rest.costForTwo} for 2</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Non-Vegetarian Diner Column */}
                          <div className="space-y-4">
                            <h4 className="font-display text-sm font-bold text-rose-400 flex items-center gap-2 pb-2 border-b border-rose-500/10">
                              🍗 Top 10 Non-Veg / Mixed Diner Spots
                            </h4>
                            <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
                              {activeTrip.restaurants?.nonVeg?.map((rest, rIdx) => (
                                <div key={rIdx} className="glass border border-rose-500/10 rounded-2xl p-4 relative bg-rose-500/2 hover:border-rose-500/30 transition-all">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 w-5 h-5 rounded flex items-center justify-center">{(rIdx+1)}</span>
                                      <h5 className="font-bold text-sm text-white">{rest.name}</h5>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-[9px] bg-rose-400/10 text-rose-400 border border-rose-400/20 px-2 py-0.5 rounded font-bold">{rest.cuisine}</span>
                                      {isAgent && (
                                        <button 
                                          onClick={() => openEditModal('dining', rIdx, rest, { category: 'nonVeg' })}
                                          className="text-muted hover:text-gold-400 transition-colors"
                                          title="Edit Restaurant"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-muted text-xs leading-relaxed mb-3">{rest.description}</p>
                                  <div className="flex items-center justify-between text-[10px] font-semibold pt-2 border-t border-white/5 text-rose-300/80">
                                    <span>🍗 Specialty: {rest.specialty}</span>
                                    <span>💰 Budget: {rest.costForTwo} for 2</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Right: Summary panel — sticky only on xl+ screens, normal flow on smaller screens */}
                <div className="space-y-4 xl:sticky xl:top-24">
                  
                  {/* Comprehensive Summary card */}
                  <div className="glass border border-border rounded-2xl p-5 bg-surface/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <DollarSign className="w-4.5 h-4.5 text-gold-400" /> Full Trip Cost Breakdown
                      </h3>
                      <span className="text-[8px] uppercase bg-gold-400/20 border border-gold-400/30 text-gold-400 px-2 py-0.5 rounded-full font-bold">
                        All-Inclusive
                      </span>
                    </div>

                    {/* Selected package components */}
                    <div className="space-y-2.5 mb-4 text-xs">
                      
                      {/* 1. Stays */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-sage-400" />
                          <span className="text-muted">Stays & Hotels</span>
                        </div>
                        <span className="text-white font-mono">₹{staysCost.toLocaleString()}</span>
                      </div>

                      {/* 2. Transportation — broken out per mode */}
                      {['flight', 'train', 'bus', 'roadways'].map(mode => {
                        const modeSegs = activeTrip?.segments?.filter(s => s.type === mode) || []
                        if (modeSegs.length === 0) return null
                        const modeCost = modeSegs.reduce((sum, s) => sum + (s.price || 0), 0)
                        const modeIcons = { flight: Plane, train: Train, bus: Bus, roadways: Car }
                        const modeColors = { flight: 'text-gold-400', train: 'text-sky-400', bus: 'text-violet-400', roadways: 'text-orange-400' }
                        const MIcon = modeIcons[mode]
                        return (
                          <div key={mode} className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                              <MIcon className={`w-3.5 h-3.5 ${modeColors[mode]}`} />
                              <span className="text-muted capitalize">{mode === 'roadways' ? 'Roadways/Cab' : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                            </div>
                            <span className="text-white font-mono">₹{modeCost.toLocaleString()}</span>
                          </div>
                        )
                      })}

                      {/* 3. Sightseeing — individual places with ticket prices */}
                      {selectedTransportSegments.length > 0 && (
                        <div className="border-b border-white/5 pb-2 pl-5 -mt-1 space-y-1">
                          {selectedTransportSegments.map(seg => (
                            <div key={seg.id} className="text-[9px] text-muted/70 truncate" title={seg.detail}>
                              Selected: {seg.detail}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedTransportSegments.length === 0 && (
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <Plane className="w-3.5 h-3.5 text-muted/60" />
                            <span className="text-muted">Transportation</span>
                          </div>
                          <span className="text-muted/70 font-mono">Not selected</span>
                        </div>
                      )}

                      <div className="border-b border-white/5 pb-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Landmark className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-muted">Sightseeing Admissions</span>
                          </div>
                          <span className="text-white font-mono">₹{sightsCost.toLocaleString()}</span>
                        </div>
                        {activeTrip?.placesToVisit?.length > 0 && (
                          <div className="space-y-1 pl-5 max-h-32 overflow-y-auto scrollbar-thin">
                            {activeTrip.placesToVisit.map((p, i) => (
                              <div key={i} className="flex items-center justify-between text-[9px]">
                                <span className="text-muted/70 truncate pr-2" title={p.name}>{i + 1}. {p.name}</span>
                                <span className={`flex-shrink-0 font-mono ${Number(p.price) > 0 ? 'text-amber-300/80' : 'text-muted/50'}`}>
                                  {Number(p.price) > 0 ? `₹${Number(p.price).toLocaleString()}` : 'Free'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 4. Food & Dining Estimate — ₹1,200/day */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-3.5 h-3.5 text-rose-400" />
                          <div>
                            <span className="text-muted">Est. Food & Dining</span>
                            <div className="text-[9px] text-muted/50">{daysCount} days × ₹1,200/day</div>
                          </div>
                        </div>
                        <span className="text-white font-mono">₹{estFoodCost.toLocaleString()}</span>
                      </div>

                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between mb-4">
                      <div>
                        <span className="text-white font-bold text-sm block">Trip Grand Total</span>
                        <span className="text-[10px] text-muted italic">Stays + Transport + Sights + Food</span>
                      </div>
                      <span className="text-gold-400 font-bold text-xl font-mono">₹{grandTripTotal.toLocaleString()}</span>
                    </div>

                    {/* Save itinerary option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {const entry = saveTrip(activeTrip, user)
toast.success(`Trip saved! Ref: ${entry.id.slice(-6).toUpperCase()}`)
}}
                      className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl shadow-gold-sm hover:shadow-gold transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <CheckCircle className="w-4 h-4" /> Save Package Details
                    </motion.button>

                    <Link
                      to="/chat"
                      className="mt-3 w-full py-2.5 glass border border-border rounded-xl text-xs text-muted hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Refine details with AI
                    </Link>
                  </div>

                  {/* Selected Package Components Timeline */}
                  <div className="glass border border-border rounded-2xl p-4 space-y-3">
                    <span className="text-white text-xs font-semibold uppercase tracking-wider block">Package Components</span>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {activeTrip.segments?.map((seg, i) => (
                          <TripSegment
                            key={seg.id}
                            segment={seg}
                            index={i}
                            isAgent={isAgent}
                            onEdit={(segment) => openEditModal('segment', segment.id, segment)}
                            onRemove={removeSegment}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Highlights section */}
                  {activeTrip.highlights?.length > 0 && (
                    <div className="glass border border-gold-400/20 rounded-2xl p-4 bg-gold-400/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-gold-400" />
                        <span className="text-gold-300 font-semibold text-xs uppercase tracking-wider">Highlights</span>
                      </div>
                      <ul className="space-y-1.5">
                        {activeTrip.highlights.map((h, i) => (
                          <li key={i} className="text-gold-200/70 text-xs flex items-start gap-1.5">
                            <span className="text-gold-400 mt-0.5">→</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TRAVEL AGENT INLINE EDIT MODAL OVERLAY */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass border border-gold-400/20 max-w-lg w-full rounded-3xl p-6 shadow-gold-lg max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-gold-400" />
                Agent Edit Control ({editingItem.type.toUpperCase()})
              </h3>
              <span className="text-[10px] text-gold-300 font-bold bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">Agent Control</span>
            </div>

            <div className="space-y-4">
              {/* Form inputs for METADATA */}
              {editingItem.type === 'metadata' && (
                <>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Trip Itinerary Title</label>
                    <input 
                      type="text" 
                      value={editForm.tripName || ''} 
                      onChange={e => setEditForm({ ...editForm, tripName: e.target.value })}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Trip Short Description</label>
                    <textarea 
                      value={editForm.desc || ''} 
                      onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Duration Description</label>
                    <input 
                      type="text" 
                      value={editForm.duration || ''} 
                      onChange={e => setEditForm({ ...editForm, duration: e.target.value })}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                    />
                  </div>
                </>
              )}

              {/* Form inputs for SEGMENT */}
              {editingItem.type === 'segment' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">From Destination</label>
                      <input 
                        type="text" 
                        value={editForm.from || ''} 
                        onChange={e => setEditForm({ ...editForm, from: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">To Destination</label>
                      <input 
                        type="text" 
                        value={editForm.to || ''} 
                        onChange={e => setEditForm({ ...editForm, to: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Booking/Departure Details</label>
                    <input 
                      type="text" 
                      value={editForm.detail || ''} 
                      onChange={e => setEditForm({ ...editForm, detail: e.target.value })}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Travel Date</label>
                      <input 
                        type="text" 
                        value={editForm.date || ''} 
                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Cost / Price (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.price || 0} 
                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form inputs for ITINERARY DAY */}
              {editingItem.type === 'itinerary' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Day Heading</label>
                      <input 
                        type="text" 
                        value={editForm.title || ''} 
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Theme / Focus Tag</label>
                      <input 
                        type="text" 
                        value={editForm.theme || ''} 
                        onChange={e => setEditForm({ ...editForm, theme: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Morning, Afternoon, Evening Slot Editing */}
                  {['morning', 'afternoon', 'evening'].map(slotKey => {
                    const slotData = editForm[slotKey] || {}
                    return (
                      <div key={slotKey} className="p-3 bg-white/2 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] text-gold-400 font-bold uppercase block ">{slotKey} Schedule</span>
                        <input 
                          type="text"
                          placeholder="Activity Title"
                          value={slotData.activity || ''}
                          onChange={e => {
                            const updatedSlot = { ...slotData, activity: e.target.value }
                            setEditForm({ ...editForm, [slotKey]: updatedSlot })
                          }}
                          className="w-full bg-white/5 border border-border/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-gold-400"
                        />
                        <textarea 
                          placeholder="Activity Description"
                          value={slotData.description || ''}
                          onChange={e => {
                            const updatedSlot = { ...slotData, description: e.target.value }
                            setEditForm({ ...editForm, [slotKey]: updatedSlot })
                          }}
                          rows={2}
                          className="w-full bg-white/5 border border-border/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none resize-none focus:border-gold-400"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            type="text"
                            placeholder="Duration (e.g. 2h)"
                            value={slotData.duration || ''}
                            onChange={e => {
                              const updatedSlot = { ...slotData, duration: e.target.value }
                              setEditForm({ ...editForm, [slotKey]: updatedSlot })
                            }}
                            className="w-full bg-white/5 border border-border/60 rounded px-2 py-1 text-[10px] text-white focus:border-gold-400 outline-none"
                          />
                          <input 
                            type="text"
                            placeholder="Cost (e.g. ₹500)"
                            value={slotData.cost || ''}
                            onChange={e => {
                              const updatedSlot = { ...slotData, cost: e.target.value }
                              setEditForm({ ...editForm, [slotKey]: updatedSlot })
                            }}
                            className="w-full bg-white/5 border border-border/60 rounded px-2 py-1 text-[10px] text-white focus:border-gold-400 outline-none"
                          />
                          <input 
                            type="text"
                            placeholder="Local Tip"
                            value={slotData.tip || ''}
                            onChange={e => {
                              const updatedSlot = { ...slotData, tip: e.target.value }
                              setEditForm({ ...editForm, [slotKey]: updatedSlot })
                            }}
                            className="w-full bg-white/5 border border-border/60 rounded px-2 py-1 text-[10px] text-white focus:border-gold-400 outline-none"
                          />
                        </div>
                      </div>
                    )
                  })}

                  {/* Meals & transport */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Meals Overview</label>
                      <input 
                        type="text" 
                        value={editForm.meals ? `${editForm.meals.breakfast || ''} / ${editForm.meals.lunch || ''} / ${editForm.meals.dinner || ''}` : ''} 
                        onChange={e => {
                          const parts = e.target.value.split('/')
                          setEditForm({
                            ...editForm,
                            meals: {
                              breakfast: parts[0]?.trim() || '',
                              lunch: parts[1]?.trim() || '',
                              dinner: parts[2]?.trim() || ''
                            }
                          })
                        }}
                        placeholder="Bfast / Lunch / Dinner"
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Local Transit Mode</label>
                      <input 
                        type="text" 
                        value={editForm.transport || ''} 
                        onChange={e => setEditForm({ ...editForm, transport: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form inputs for DINING */}
              {editingItem.type === 'dining' && (
                <>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Restaurant Name</label>
                    <input 
                      type="text" 
                      value={editForm.name || ''} 
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Cuisine / Diet Type</label>
                      <input 
                        type="text" 
                        value={editForm.cuisine || ''} 
                        onChange={e => setEditForm({ ...editForm, cuisine: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Specialty Dish</label>
                      <input 
                        type="text" 
                        value={editForm.specialty || ''} 
                        onChange={e => setEditForm({ ...editForm, specialty: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Estimated Cost For Two</label>
                    <input 
                      type="text" 
                      value={editForm.costForTwo || ''} 
                      onChange={e => setEditForm({ ...editForm, costForTwo: e.target.value })}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Restaurant Description</label>
                    <textarea 
                      value={editForm.description || ''} 
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Form inputs for ATTRACTION */}
              {editingItem.type === 'attraction' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Attraction Name</label>
                      <input 
                        type="text" 
                        value={editForm.name || ''} 
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Sight Category</label>
                      <input 
                        type="text" 
                        value={editForm.category || ''} 
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Description of Sight</label>
                    <textarea 
                      value={editForm.description || ''} 
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Visit Duration</label>
                      <input 
                        type="text" 
                        value={editForm.visitDuration || ''} 
                        onChange={e => setEditForm({ ...editForm, visitDuration: e.target.value })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Best Time</label>
                      <input 
                        type="text" 
                        value={editForm.recommendedTime || ''} 
                        onChange={e => setEditForm({ ...editForm, recommendedTime: e.target.value })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Entry Fee (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.price || 0} 
                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">💡 Local Insight / Trivia</label>
                    <textarea 
                      value={editForm.funFact || ''} 
                      onChange={e => setEditForm({ ...editForm, funFact: e.target.value })}
                      rows={2}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Form inputs for COST COMPARISON */}
              {editingItem.type === 'costComparison' && (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Flight Price</label>
                      <input 
                        type="text" 
                        value={editForm.flightCost || ''} 
                        onChange={e => setEditForm({ ...editForm, flightCost: e.target.value })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Train Price</label>
                      <input 
                        type="text" 
                        value={editForm.trainCost || ''} 
                        onChange={e => setEditForm({ ...editForm, trainCost: e.target.value })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Bus Price</label>
                      <input 
                        type="text" 
                        value={editForm.busCost || ''} 
                        onChange={e => setEditForm({ ...editForm, busCost: e.target.value })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted uppercase font-bold block mb-1">Road Price</label>
                      <input 
                        type="text" 
                        value={editForm.roadwaysCost || ''} 
                        onChange={e => setEditForm({ ...editForm, roadwaysCost: e.target.value })}
                        className="w-full bg-white/5 border border-border/60 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Cost Analysis Explanation</label>
                    <textarea 
                      value={editForm.analysis || ''} 
                      onChange={e => setEditForm({ ...editForm, analysis: e.target.value })}
                      rows={2}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">AI Recommendation Suggestion</label>
                    <input 
                      type="text" 
                      value={editForm.aiSuggestion || ''} 
                      onChange={e => setEditForm({ ...editForm, aiSuggestion: e.target.value })}
                      className="w-full bg-white/5 border border-border/80 rounded-xl px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
              <button 
                onClick={() => setEditingItem(null)} 
                className="px-4 py-2 border border-border rounded-xl text-xs text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveAgentEdits} 
                className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-void font-bold rounded-xl text-xs shadow-gold-sm hover:opacity-90 transition-opacity"
              >
                Save Edits
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}

// ── Category helper function ──────────────────────────────────────────────────
const getCategoryDetails = (category) => {
  const normalized = (category || '').toLowerCase()
  if (normalized.includes('history') || normalized.includes('culture') || normalized.includes('monument')) {
    return { icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', label: 'History' }
  }
  if (normalized.includes('food') || normalized.includes('dining') || normalized.includes('restaurant') || normalized.includes('cafe')) {
    return { icon: Utensils, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20', label: 'Food' }
  }
  if (normalized.includes('nature') || normalized.includes('beach') || normalized.includes('scenic') || normalized.includes('park')) {
    return { icon: Trees, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: 'Nature' }
  }
  if (normalized.includes('adventure') || normalized.includes('activity') || normalized.includes('explore')) {
    return { icon: Compass, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', label: 'Adventure' }
  }
  if (normalized.includes('shopping') || normalized.includes('market') || normalized.includes('bazaar')) {
    return { icon: ShoppingBag, color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', label: 'Shopping' }
  }
  // Default fallback
  return { icon: MapPin, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20', label: category || 'Attraction' }
}
