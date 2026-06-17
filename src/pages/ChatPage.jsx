import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Sparkles, Send, Mic, Plane, Users,
  ArrowRight, RefreshCw, AlertTriangle, UserCheck, PhoneCall,
  Building2, CreditCard, Lock, CheckCircle2, ChevronRight, X, HelpCircle, Briefcase, FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { askGroqJSON, callGroq } from '../utils/groq'
import toast from 'react-hot-toast'

// Corporate policies rules definition
const CORPORATE_POLICIES = {
  none: {
    id: 'none',
    name: 'Individual Booking',
    rules: [
      'No company travel policies applied.',
      'All seat classes permitted.',
      'No price or carrier limits.'
    ],
    check: () => ({ ok: true, violations: [] })
  },
  google: {
    id: 'google',
    name: 'Google India',
    rules: [
      'Economy class only (no Premium Economy or Business).',
      'Maximum price limit: ₹7,500.',
      'Preferred carrier: IndiGo.'
    ],
    check: (flight) => {
      const violations = []
      if (flight.class !== 'Economy') {
        violations.push('Only Economy class is permitted under Google policy')
      }
      if (flight.price > 7500) {
        violations.push('Price (₹' + flight.price.toLocaleString() + ') exceeds Google maximum budget of ₹7,500')
      }
      if (flight.airline !== 'IndiGo') {
        violations.push('Non-preferred carrier selected (IndiGo is the preferred corporate carrier)')
      }
      return { ok: violations.length === 0, violations }
    }
  },
  reliance: {
    id: 'reliance',
    name: 'Reliance Industries',
    rules: [
      'Economy or Premium Economy class only.',
      'Maximum price limit: ₹10,000.',
      'Meal option must be included.'
    ],
    check: (flight) => {
      const violations = []
      if (flight.class !== 'Economy' && flight.class !== 'Premium Economy') {
        violations.push('Only Economy or Premium Economy is permitted under Reliance policy')
      }
      if (flight.price > 10000) {
        violations.push('Price (₹' + flight.price.toLocaleString() + ') exceeds Reliance budget of ₹10,000')
      }
      const hasMeal = (flight.amenities || []).some(a => a.toLowerCase().includes('meal'))
      if (!hasMeal) {
        violations.push('Travel policy requires flight ticket to include meal services')
      }
      return { ok: violations.length === 0, violations }
    }
  },
  tata: {
    id: 'tata',
    name: 'Tata Consultancy Services',
    rules: [
      'Preferred carriers: Air India & Vistara.',
      'Maximum price limit: ₹8,500.',
      'All seat classes permitted (under budget limit).'
    ],
    check: (flight) => {
      const violations = []
      const isPreferred = ['Air India', 'Vistara'].includes(flight.airline)
      if (!isPreferred) {
        violations.push('Non-preferred carrier selected (Air India and Vistara are TCS preferred carriers)')
      }
      if (flight.price > 8500) {
        violations.push('Price (₹' + flight.price.toLocaleString() + ') exceeds TCS maximum budget of ₹8,500')
      }
      return { ok: violations.length === 0, violations }
    }
  }
}

// Generate realistic flight options dynamically based on inputs
function generateMockFlights(fromCity, toCity, dateStr, cabinClass = 'Economy') {
  const cleanFrom = fromCity ? fromCity.split('(')[0].trim() : 'Delhi'
  const cleanTo = toCity ? toCity.split('(')[0].trim() : 'Mumbai'
  const codeFrom = fromCity && fromCity.includes('(') ? fromCity.match(/\(([^)]+)\)/)[1] : 'DEL'
  const codeTo = toCity && toCity.includes('(') ? toCity.match(/\(([^)]+)\)/)[1] : 'BOM'

  return [
    {
      id: 'fl-indigo-1',
      airline: 'IndiGo',
      code: '6E 204',
      logo: '🔵',
      from: codeFrom,
      fromCity: cleanFrom,
      to: codeTo,
      toCity: cleanTo,
      depart: '06:00',
      arrive: '08:10',
      duration: '2h 10m',
      stops: 0,
      price: cabinClass === 'Business' ? 12500 : cabinClass === 'Premium Economy' ? 6200 : 4299,
      class: cabinClass,
      seats: 4,
      amenities: ['USB charging', 'Snacks'],
      baggage: '15kg check-in, 7kg cabin'
    },
    {
      id: 'fl-airindia-2',
      airline: 'Air India',
      code: 'AI 619',
      logo: '🔴',
      from: codeFrom,
      fromCity: cleanFrom,
      to: codeTo,
      toCity: cleanTo,
      depart: '09:30',
      arrive: '11:50',
      duration: '2h 20m',
      stops: 0,
      price: cabinClass === 'Business' ? 14800 : cabinClass === 'Premium Economy' ? 7900 : 5800,
      class: cabinClass,
      seats: 9,
      recommended: true,
      amenities: ['Meal included', 'Extra legroom', 'USB charging'],
      baggage: '25kg check-in, 8kg cabin'
    },
    {
      id: 'fl-vistara-3',
      airline: 'Vistara',
      code: 'UK 955',
      logo: '🟣',
      from: codeFrom,
      fromCity: cleanFrom,
      to: codeTo,
      toCity: cleanTo,
      depart: '14:15',
      arrive: '16:30',
      duration: '2h 15m',
      stops: 0,
      price: cabinClass === 'Business' ? 18200 : cabinClass === 'Premium Economy' ? 9500 : 7200,
      class: cabinClass,
      seats: 2,
      amenities: ['Meal included', 'Priority boarding', 'Extra baggage'],
      baggage: '20kg check-in, 7kg cabin'
    },
    {
      id: 'fl-spicejet-4',
      airline: 'SpiceJet',
      code: 'SG 112',
      logo: '🟠',
      from: codeFrom,
      fromCity: cleanFrom,
      to: codeTo,
      toCity: cleanTo,
      depart: '19:45',
      arrive: '22:10',
      duration: '2h 25m',
      stops: 0,
      price: cabinClass === 'Business' ? 11200 : cabinClass === 'Premium Economy' ? 5800 : 3850,
      class: cabinClass,
      seats: 12,
      amenities: ['USB charging'],
      baggage: '15kg check-in, 7kg cabin'
    }
  ]
}

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // State Management
  const [corporateClient, setCorporateClient] = useState('none')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  // Local session bookings (for retrieval test)
  const [sessionBookings, setSessionBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('voyageai_session_bookings')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Selected flight in the active flow
  const [selectedFlight, setSelectedFlight] = useState(null)

  const recognitionRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Save Bookings
  const saveBookings = (newBookings) => {
    setSessionBookings(newBookings)
    localStorage.setItem('voyageai_session_bookings', JSON.stringify(newBookings))
  }

  // Load welcome message & search parameters from URL if any
  useEffect(() => {
    const dest = searchParams.get('dest')
    const initialText = dest
      ? `Hello! I see you want to fly to ${dest}. I can help you search for flights. Which city are you travelling from, and what is your departure date?`
      : `Welcome to VoyageAI Flight Booking Assistant! ✈️\n\nI can help you:\n• Search and discover domestic & international flights\n• Enforce company travel guidelines & policies\n• Book flights and issue e-tickets\n• Retrieve flight tickets by reference code (PNR)\n\nWhere would you like to fly today? (e.g., "Delhi to Bangalore tomorrow")`
    
    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        content: initialText,
        ts: Date.now()
      }
    ])
  }, [searchParams])

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'
      rec.onstart = () => {
        setIsListening(true)
        toast.success('Listening... Speak your flight request now.')
      }
      rec.onend = () => setIsListening(false)
      rec.onerror = (e) => {
        setIsListening(false)
        if (e.error !== 'no-speech') toast.error(`Speech recognition error: ${e.error}`)
      }
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        if (transcript) {
          setInput(prev => (prev ? prev + ' ' + transcript : transcript))
          toast.success('Speech captured!')
        }
      }
      recognitionRef.current = rec
    }
  }, [])

  const toggleListening = (e) => {
    e.stopPropagation()
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  // Intent parsing from text using Groq
  const detectFlightIntent = async (text) => {
    const today = new Date().toISOString().split('T')[0]
    const system = `You are VoyageAI's flight booking intent parser. Today's date is ${today} (Year 2026).
Analyze the user's input and extract details. Respond ONLY with a valid JSON object matching this schema (no code fences, no extra text):
{
  "intent": "flight_search" | "ticket_retrieve" | "reset_chat" | "general_chat",
  "from": "origin city/code (e.g. Bangalore, or null)",
  "to": "destination city/code (e.g. Mumbai, or null)",
  "date": "YYYY-MM-DD (format date relative to 2026. Or null)",
  "pnr": "PNR code if mentioned (e.g. VAI-3F8A2D, or null)",
  "corporateClient": "company name if user mentions booking for a company (Google, Tata, Reliance), else null"
}`

    try {
      return await askGroqJSON(`User input: "${text}"`, system, { maxTokens: 250, temperature: 0.15 })
    } catch (err) {
      console.warn('Intent parsing failed, using client fallback parser.', err)
      // client-side parser fallback
      const pnrMatch = text.match(/VAI-[A-Z0-9]{6}/i)
      if (pnrMatch) {
        return { intent: 'ticket_retrieve', pnr: pnrMatch[0].toUpperCase() }
      }
      if (/clear|reset|restart/i.test(text)) {
        return { intent: 'reset_chat' }
      }
      // Simple city detection
      const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Goa', 'Hyderabad', 'Pune']
      let from = null, to = null
      cities.forEach(city => {
        const regex = new RegExp(`(from\\s+)?${city}`, 'i')
        if (text.toLowerCase().includes('to ' + city.toLowerCase())) {
          to = city
        } else if (text.toLowerCase().includes('from ' + city.toLowerCase()) || text.toLowerCase().includes(city.toLowerCase())) {
          if (!to) from = city
        }
      })
      if (from || to) {
        return { intent: 'flight_search', from, to, date: new Date(Date.now() + 86400000).toISOString().split('T')[0] }
      }
      return { intent: 'general_chat' }
    }
  }

  // Handle message sending
  const sendMessage = async (overrideText = '') => {
    const textToSend = overrideText || input.trim()
    if (!textToSend || isTyping) return
    setInput('')

    // Append user message
    const userMsgId = 'msg-' + Date.now()
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: textToSend, ts: Date.now() }])
    setIsTyping(true)

    // Call intent parser
    const parsed = await detectFlightIntent(textToSend)

    // Handle intent
    if (parsed.intent === 'reset_chat') {
      setMessages([
        {
          id: 'msg-reset',
          role: 'assistant',
          content: 'Resetting assistant session. Where would you like to search flights today?',
          ts: Date.now()
        }
      ])
      setSelectedFlight(null)
      setIsTyping(false)
      return
    }

    if (parsed.intent === 'ticket_retrieve') {
      const pnrCode = parsed.pnr ? parsed.pnr.toUpperCase() : ''
      const found = sessionBookings.find(b => b.pnr === pnrCode)
      
      await new Promise(r => setTimeout(r, 1000))
      
      if (found) {
        setMessages(prev => [...prev, {
          id: 'msg-retrieve-' + Date.now(),
          role: 'assistant',
          content: `I found your booking matching reference ${pnrCode}! Here are your booking details:`,
          ticket: found,
          ts: Date.now()
        }])
      } else {
        setMessages(prev => [...prev, {
          id: 'msg-retrieve-fail-' + Date.now(),
          role: 'assistant',
          content: `I searched for a booking with reference "${pnrCode || textToSend}" but couldn't find any in the system. Make sure the code is correct (e.g. VAI-XXXXXX) or try typing "Retrieve booking VAI-XXXXXX".`,
          ts: Date.now()
        }])
      }
      setIsTyping(false)
      return
    }

    if (parsed.intent === 'flight_search') {
      const from = parsed.from || 'Delhi (DEL)'
      const to = parsed.to || 'Mumbai (BOM)'
      const date = parsed.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
      
      // Auto-set corporate policy if mentioned in text
      if (parsed.corporateClient) {
        const clientLower = parsed.corporateClient.toLowerCase()
        if (clientLower.includes('google')) setCorporateClient('google')
        else if (clientLower.includes('reliance')) setCorporateClient('reliance')
        else if (clientLower.includes('tata') || clientLower.includes('tcs')) setCorporateClient('tata')
      }

      // Generate list of flights
      const list = generateMockFlights(from, to, date, 'Economy')
      
      await new Promise(r => setTimeout(r, 1200))

      const policyName = CORPORATE_POLICIES[corporateClient].name
      setMessages(prev => [...prev, {
        id: 'msg-search-' + Date.now(),
        role: 'assistant',
        content: `I found these flight options for **${from} → ${to}** on **${date}** matching your parameters under your active corporate profile (${policyName}):`,
        flights: list,
        searchParams: { from, to, date },
        ts: Date.now()
      }])
      setIsTyping(false)
      return
    }

    // Default general chat response using Voyage AI SDK
    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }))
      chatHistory.push({ role: 'user', content: textToSend })

      const systemPrompt = `You are VoyageAI, an expert flight booking assistant. Today is Wednesday, June 17, 2026.
Help the user with natural language flight searches, travel booking, and retrieve tickets. 
Keep your response professional, friendly, and concise (under 180 words).
If they ask for policies:
- Google: Economy only, Max ₹7,500, Preferred IndiGo.
- TCS / Tata: Max ₹8,500, Preferred Air India/Vistara.
- Reliance: Economy/Premium Economy, Max ₹10,000, Meal must be included.
End with a helpful next step.`

      const reply = await callGroq(chatHistory, systemPrompt, { maxTokens: 350, temperature: 0.7 })
      
      setMessages(prev => [...prev, {
        id: 'msg-chat-' + Date.now(),
        role: 'assistant',
        content: reply,
        ts: Date.now()
      }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `I encountered an issue connecting to my travel index. Feel free to try search prompts like "Search flights from Delhi to Mumbai" or retrieve a ticket by typing "retrieve ticket VAI-XXXXXX".`,
        ts: Date.now()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle Select Flight
  const selectFlight = (flight) => {
    setSelectedFlight(flight)
    const policyResult = CORPORATE_POLICIES[corporateClient].check(flight)

    let contentText = `You have selected **${flight.airline} ${flight.code}** from **${flight.fromCity} (${flight.from}) → ${flight.toCity} (${flight.to})** departing at ${flight.depart} for **₹${flight.price.toLocaleString()}**.\n\n`
    
    if (!policyResult.ok) {
      contentText += `⚠️ **Policy Warning:** This selection violates your active corporate policy (${CORPORATE_POLICIES[corporateClient].name}):\n` + 
                     policyResult.violations.map(v => `• ${v}`).join('\n') + 
                     `\n\nWould you still like to proceed with the booking? Please fill out the traveler details below to proceed.`
    } else if (corporateClient !== 'none') {
      contentText += `✓ **Policy Compliant:** This selection is fully compliant with the ${CORPORATE_POLICIES[corporateClient].name} guidelines.\n\nPlease complete traveler details below to proceed.`
    } else {
      contentText += `Please enter the traveler details below to continue with the booking.`
    }

    setMessages(prev => [...prev, {
      id: 'msg-select-' + Date.now(),
      role: 'assistant',
      content: contentText,
      selectedFlight: flight,
      bookingForm: true,
      ts: Date.now()
    }])
  }

  // Submit traveler details
  const submitTravelerDetails = (formDetails, flight) => {
    setMessages(prev => [...prev, {
      id: 'msg-payment-' + Date.now(),
      role: 'assistant',
      content: `Details received for **${formDetails.firstName} ${formDetails.lastName}**.\n\nFlight: **${flight.airline} ${flight.code}** (₹${flight.price.toLocaleString()})\n\nPlease enter your payment details below to confirm the ticket purchase:`,
      selectedFlight: flight,
      bookingDetails: formDetails,
      paymentForm: true,
      ts: Date.now()
    }])
  }

  // Confirm payment & complete booking
  const confirmBooking = (formDetails, paymentDetails, flight) => {
    const pnr = 'VAI-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const newBooking = {
      pnr,
      flight,
      traveler: formDetails,
      payment: paymentDetails,
      status: 'confirmed',
      bookedAt: Date.now(),
      corporateClient
    }

    // Save booking to local state & localstorage
    const updated = [newBooking, ...sessionBookings]
    saveBookings(updated)
    setSelectedFlight(null)

    setMessages(prev => [...prev, {
      id: 'msg-confirm-' + Date.now(),
      role: 'assistant',
      content: `🎉 **Booking Confirmed!** Your ticket has been issued successfully under booking reference: **${pnr}**.\n\nAn e-ticket has been sent to **${formDetails.email}**. You can retrieve this ticket at any time by typing "retrieve ${pnr}" in the chat.`,
      ticket: newBooking,
      ts: Date.now()
    }])
  }

  // Form Components inline
  function TravelerForm({ onSubmit, flight }) {
    const [details, setDetails] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '', passport: '' })
    const [errors, setErrors] = useState({})

    const handleNext = (e) => {
      e.preventDefault()
      const newErrors = {}
      if (!details.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!details.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!details.email.trim()) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(details.email)) newErrors.email = 'Invalid email'
      if (!details.phone.trim()) newErrors.phone = 'Phone number is required'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      onSubmit(details, flight)
    }

    return (
      <form onSubmit={handleNext} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm max-w-md w-full space-y-3 mt-2">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Briefcase className="w-4 h-4 text-blue-600" /> Traveler Details
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">First Name</label>
            <input
              type="text"
              required
              placeholder="First Name"
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={details.firstName}
              onChange={e => setDetails({ ...details, firstName: e.target.value })}
            />
            {errors.firstName && <span className="text-[10px] text-red-500">{errors.firstName}</span>}
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Last Name</label>
            <input
              type="text"
              required
              placeholder="Last Name"
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={details.lastName}
              onChange={e => setDetails({ ...details, lastName: e.target.value })}
            />
            {errors.lastName && <span className="text-[10px] text-red-500">{errors.lastName}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="name@email.com"
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={details.email}
              onChange={e => setDetails({ ...details, email: e.target.value })}
            />
            {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Phone</label>
            <input
              type="tel"
              required
              placeholder="Phone Number"
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={details.phone}
              onChange={e => setDetails({ ...details, phone: e.target.value })}
            />
            {errors.phone && <span className="text-[10px] text-red-500">{errors.phone}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">DOB</label>
            <input
              type="date"
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={details.dob}
              onChange={e => setDetails({ ...details, dob: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Passport (Optional)</label>
            <input
              type="text"
              placeholder="Passport No."
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={details.passport}
              onChange={e => setDetails({ ...details, passport: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
        >
          Confirm Details & Proceed <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </form>
    )
  }

  function PaymentForm({ onSubmit, flight, bookingDetails }) {
    const [method, setMethod] = useState('card')
    const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
    const [upi, setUpi] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = (e) => {
      e.preventDefault()
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        onSubmit(bookingDetails, method === 'card' ? card : { upiId: upi }, flight)
      }, 1500)
    }

    return (
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm max-w-md w-full space-y-3 mt-2">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <CreditCard className="w-4 h-4 text-blue-600" /> Complete Payment (Mock)
        </h4>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${method === 'card' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            onClick={() => setMethod('card')}
          >
            Credit/Debit Card
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${method === 'upi' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            onClick={() => setMethod('upi')}
          >
            UPI ID
          </button>
        </div>

        {method === 'card' ? (
          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Card Number</label>
              <input
                type="text"
                required
                placeholder="4242 4242 4242 4242"
                className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                value={card.number}
                onChange={e => setCard({ ...card, number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Expiry</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  value={card.expiry}
                  onChange={e => setCard({ ...card, expiry: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">CVV</label>
                <input
                  type="password"
                  required
                  placeholder="•••"
                  className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  value={card.cvv}
                  onChange={e => setCard({ ...card, cvv: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Cardholder Name</label>
              <input
                type="text"
                required
                placeholder="NAME ON CARD"
                className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                value={card.name}
                onChange={e => setCard({ ...card, name: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">UPI Address</label>
            <input
              type="text"
              required
              placeholder="e.g. name@upi"
              className="w-full text-slate-800 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              value={upi}
              onChange={e => setUpi(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg">
          <Lock className="w-3.5 h-3.5 text-green-500" /> Secured connection. Total payment: ₹{flight.price.toLocaleString()}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          {submitting ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Plane className="w-3.5 h-3.5" />
              </motion.div>
              Authorizing Payment...
            </>
          ) : (
            <>Confirm & Pay ₹{flight.price.toLocaleString()}</>
          )}
        </button>
      </form>
    )
  }

  // Interactive Ticket Confirmation Component
  function TicketCard({ booking }) {
    const { flight, traveler, pnr, bookedAt, corporateClient } = booking

    return (
      <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden max-w-sm w-full shadow-md mt-2 group">
        {/* Ticket Top Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-5 py-3 text-white">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Boarding Pass</span>
            {corporateClient !== 'none' && (
              <span className="px-2 py-0.5 bg-amber-400 text-blue-900 text-[9px] font-bold rounded-full border border-amber-300">
                Corporate: {CORPORATE_POLICIES[corporateClient].name.split(' ')[0]}
              </span>
            )}
          </div>
          <div className="flex justify-between items-end mt-1">
            <h4 className="font-display font-extrabold text-lg leading-tight flex items-center gap-1.5">
              <Plane className="w-4.5 h-4.5" /> VoyageAI Flight
            </h4>
            <span className="font-mono text-sm font-bold bg-white/20 px-2 py-0.5 rounded border border-white/20">{pnr}</span>
          </div>
        </div>

        {/* Flight Details Block */}
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <span className="font-mono text-3xl font-extrabold text-slate-800">{flight.from}</span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">{flight.fromCity}</p>
            </div>
            <div className="flex-1 flex flex-col items-center px-4 relative">
              <div className="text-[9px] text-slate-400 font-medium mb-1">{flight.duration}</div>
              <div className="w-full flex items-center gap-1">
                <div className="h-px bg-slate-200 flex-1" />
                <Plane className="w-3.5 h-3.5 text-blue-600 rotate-90" />
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="text-[9px] text-slate-400 font-semibold mt-1">{flight.stops === 0 ? 'DIRECT' : flight.stops + ' STOP'}</div>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-extrabold text-slate-800">{flight.to}</span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">{flight.toCity}</p>
            </div>
          </div>

          {/* Times & Seat details */}
          <div className="grid grid-cols-3 gap-3 border-t border-b border-slate-100 py-3 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase mb-0.5">Depart</span>
              <span className="font-bold text-slate-700">{flight.depart}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase mb-0.5">Arrive</span>
              <span className="font-bold text-slate-700">{flight.arrive}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase mb-0.5">Seat Class</span>
              <span className="font-bold text-slate-700">{flight.class}</span>
            </div>
          </div>

          {/* Passenger details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase mb-0.5">Passenger Name</span>
              <span className="font-semibold text-slate-800 truncate block">{traveler.firstName} {traveler.lastName}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase mb-0.5">Contact</span>
              <span className="font-semibold text-slate-600 block">{traveler.phone}</span>
            </div>
          </div>
        </div>

        {/* Separator cutouts */}
        <div className="absolute left-0 right-0 h-4 flex items-center justify-between pointer-events-none -mx-2 mt-[-10px] z-10">
          <div className="w-4 h-4 bg-slate-50 border-r border-slate-200 rounded-full" />
          <div className="border-t border-dashed border-slate-200 flex-1 mx-2" />
          <div className="w-4 h-4 bg-slate-50 border-l border-slate-200 rounded-full" />
        </div>

        {/* Bottom Barcode section */}
        <div className="bg-slate-50 px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Issued Date</span>
            <span className="text-[10px] text-slate-600 font-semibold">{new Date(bookedAt).toLocaleDateString()}</span>
          </div>
          {/* Simulated Barcode */}
          <div className="flex items-center gap-0.5 bg-slate-900/5 px-3 py-1.5 rounded-lg opacity-85">
            {[1,3,2,1,4,1,2,3,1,2,1,4,1].map((w, idx) => (
              <span key={idx} className="h-6 bg-slate-800" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 flex bg-slate-50">
      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full px-4 border-r border-slate-200">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 flex items-center justify-between border-b border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md text-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-slate-900 text-lg leading-tight">
                AI Flight Booking Assistant
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>VoyageAI Flight Search LPU · Online</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'msg-clear-' + Date.now(),
                  role: 'assistant',
                  content: 'New flight search session started. Let me know where you are flying, or provide your corporate rules.',
                  ts: Date.now()
                }
              ])
              setSelectedFlight(null)
              toast.success('Session reset successfully')
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-200 hover:text-blue-600 rounded-xl text-xs text-slate-500 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset chat
          </button>
        </motion.div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-slate-200 border border-slate-300' : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow text-white font-bold'}`}>
                  {isUser ? <Users className="w-4 h-4 text-slate-600" /> : <Sparkles className="w-4 h-4 text-white" />}
                </div>

                {/* Content block */}
                <div className={`max-w-[75%] flex flex-col space-y-3.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Speechbubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-md' : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm'}`}>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                  </div>

                  {/* Flight Options Cards */}
                  {msg.flights && (
                    <div className="w-full space-y-3">
                      {msg.flights.map((flight) => {
                        const policyCheck = CORPORATE_POLICIES[corporateClient].check(flight)
                        const isSelected = selectedFlight?.id === flight.id
                        
                        return (
                          <div
                            key={flight.id}
                            className={`border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 relative ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'}`}
                          >
                            {/* Compliance header badge */}
                            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{flight.logo}</span>
                                <span className="font-bold text-slate-800 text-sm">{flight.airline}</span>
                                <span className="text-slate-400 text-xs font-mono">{flight.code}</span>
                              </div>
                              
                              {/* Policy check label */}
                              {corporateClient !== 'none' ? (
                                policyCheck.ok ? (
                                  <span className="px-2.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg border border-green-200">
                                    ✓ Policy Compliant
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg border border-red-200 flex items-center gap-1" title={policyCheck.violations.join(', ')}>
                                    ⚠️ Policy Violation
                                  </span>
                                )
                              ) : null}
                            </div>

                            {/* Flight path routing */}
                            <div className="grid grid-cols-3 items-center py-2.5 text-center">
                              <div className="text-left">
                                <div className="font-extrabold text-slate-800 text-base">{flight.depart}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-semibold">{flight.from}</div>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-400 mb-0.5">{flight.duration}</span>
                                <div className="w-full flex items-center gap-1">
                                  <div className="h-px bg-slate-200 flex-1" />
                                  <Plane className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                                  <div className="h-px bg-slate-200 flex-1" />
                                </div>
                                <span className="text-[9px] text-slate-400 mt-0.5">{flight.stops === 0 ? 'Direct' : flight.stops + ' stop'}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-extrabold text-slate-800 text-base">{flight.arrive}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-semibold">{flight.to}</div>
                              </div>
                            </div>

                            {/* Amenities and warnings listing */}
                            {!policyCheck.ok && corporateClient !== 'none' && (
                              <div className="mt-2.5 p-2 bg-red-50/50 rounded-xl border border-red-100 text-[11px] text-red-500 space-y-0.5">
                                {policyCheck.violations.map((v, i) => (
                                  <div key={i} className="flex items-start gap-1 font-medium">
                                    <span>•</span> <span>{v}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Selection actions footer */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="font-semibold">{flight.class}</span>
                                <span>•</span>
                                <span>{flight.baggage}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-blue-600 text-base font-mono">₹{flight.price.toLocaleString()}</span>
                                <button
                                  onClick={() => selectFlight(flight)}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                                >
                                  Select Flight <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Traveler Details Card Form */}
                  {msg.bookingForm && (
                    <TravelerForm onSubmit={submitTravelerDetails} flight={msg.selectedFlight} />
                  )}

                  {/* Payment Details Card Form */}
                  {msg.paymentForm && (
                    <PaymentForm onSubmit={confirmBooking} flight={msg.selectedFlight} bookingDetails={msg.bookingDetails} />
                  )}

                  {/* E-Ticket display block */}
                  {msg.ticket && (
                    <TicketCard booking={msg.ticket} />
                  )}

                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 px-1">
                    {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            )
          })}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Suggestion tags (Only displayed when there's no active search result in feed) */}
        {messages.length === 1 && (
          <div className="pb-3 flex flex-wrap gap-2">
            {[
              { label: '✈ Delhi to Mumbai tomorrow', text: 'I want to fly from Delhi to Mumbai tomorrow' },
              { label: '🏖 Bangalore to Goa next Friday', text: 'flights from Bangalore to Goa next Friday' },
              { label: '💼 Corporate booking rule info', text: 'What are the company travel policies available?' },
              { label: '🔍 Retrieve ticket info', text: 'Show me my bookings list' }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => {
                  setInput(s.text)
                  inputRef.current?.focus()
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-200 hover:text-blue-600 rounded-xl text-xs text-slate-500 shadow-sm transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="py-4 border-t border-slate-200">
          <div className="bg-white border border-slate-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2.5 flex items-end gap-2 shadow-sm transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask me anything: 'Flights from Delhi to Bangalore' or 'Retrieve booking VAI-XXXXXX'..."
              className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 resize-none outline-none min-h-[38px] max-h-32 py-2 px-2"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={!input.trim() || isTyping}
                onClick={() => sendMessage()}
                className={`p-2.5 rounded-xl transition-all ${input.trim() && !isTyping ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            VoyageAI Client Interface v1.0 • Powered by Groq AI engine • Press Enter to send
          </p>
        </div>

      </div>

      {/* ── Right Panel: Corporate policies & tickets ── */}
      <div className="w-80 bg-slate-50 p-5 flex flex-col space-y-6 overflow-y-auto">
        
        {/* Corporate client selector card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Active Corporate Profile
          </h3>
          <div className="space-y-2">
            {Object.keys(CORPORATE_POLICIES).map((key) => {
              const policy = CORPORATE_POLICIES[key]
              const isActive = corporateClient === key
              return (
                <button
                  key={key}
                  onClick={() => {
                    setCorporateClient(key)
                    toast.success(`Active profile switched to: ${policy.name}`)
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between ${isActive ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {key === 'none' ? '👤' : key === 'google' ? '🇬' : key === 'reliance' ? '🇷' : '🇹'}
                    </span>
                    <span>{policy.name}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Corporate compliance constraints summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-2">
            <HelpCircle className="w-4 h-4 text-blue-600" /> Policy Rules
          </h3>
          <div className="space-y-2 text-xs">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Guidelines for {CORPORATE_POLICIES[corporateClient].name}:</p>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              {CORPORATE_POLICIES[corporateClient].rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Session ticket log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col min-h-[220px]">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-blue-600" /> Active Session Tickets
          </h3>
          
          {sessionBookings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <Plane className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-semibold">No bookings created yet</p>
              <p className="text-[10px] text-slate-400 mt-1">Book a flight to see PNR details logged here.</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1">
              {sessionBookings.map((b) => (
                <div
                  key={b.pnr}
                  onClick={() => {
                    setInput(`Retrieve ticket ${b.pnr}`)
                    sendMessage(`Retrieve ticket ${b.pnr}`)
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl cursor-pointer text-left transition-all group"
                  title="Click to retrieve in chat"
                >
                  <div className="flex justify-between items-center font-bold text-[11px] text-slate-700">
                    <span className="font-mono text-blue-600">{b.pnr}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">{b.flight.airline}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    {b.flight.from} → {b.flight.to} · {new Date(b.bookedAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-semibold">
                    <span>{b.traveler.firstName} {b.traveler.lastName}</span>
                    <span className="text-blue-600 font-mono">₹{b.flight.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}