import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Sparkles, Send, Mic, Plane, Users,
  ArrowRight, RefreshCw,
  AlertTriangle, UserCheck, PhoneCall
} from 'lucide-react'
import { callVoyageAI, detectTripIntent, generateMultiModalTrip, updateTripWithPreferences } from '../utils/multiModalApi'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import toast from 'react-hot-toast'
import FlightCard from '../components/features/FlightCard'

const SUGGESTIONS = [
  { label: '✈ Book a flight', prompt: 'I want to book a flight. Help me search.' },
  { label: '🏖 Beach trip ideas', prompt: 'Suggest some beach destinations for a 5-day trip in December within ₹40,000' },
  { label: '🗓 Plan an itinerary', prompt: 'Help me plan a 7-day trip to Japan' },
  { label: '💼 Corporate booking', prompt: 'I need to book a business trip to Mumbai next Monday, economy class' },
  { label: '🔄 Change my flight', prompt: 'I need to change my existing flight booking' },
]

function WarningCard({ warning }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
    >
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-amber-700 text-sm font-semibold mb-1">{warning.title}</div>
        <div className="text-amber-600/80 text-xs leading-relaxed">{warning.body}</div>
      </div>
    </motion.div>
  )
}

// Agent connecting card — shown during cancellation handoff
function AgentConnectingCard({ agentName, tripName }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-blue-100 rounded-2xl p-4 max-w-sm shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Connecting to Agent</p>
          <p className="text-xs text-slate-500">{agentName || 'Your assigned travel agent'}</p>
        </div>
        <div className="ml-auto flex gap-1">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Your cancellation request for <span className="font-semibold text-slate-700">{tripName}</span> has been forwarded. 
        The agent will review your refund eligibility and process it shortly.
      </p>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <PhoneCall className="w-3.5 h-3.5" />
        Typical response: 2–4 hours
      </div>
    </motion.div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center ${
          isUser ? 'bg-slate-100 border border-slate-200' : 'text-white shadow-md'
        }`}
        style={!isUser ? { background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' } : {}}
      >
        {isUser
          ? <Users className="w-4 h-4 text-slate-500" />
          : <Sparkles className="w-4 h-4 text-white" />
        }
      </div>

      <div className={`max-w-[80%] space-y-3 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {msg.content && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser
                ? 'text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm'
            }`}
            style={isUser ? { background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' } : {}}
          >
            {/* Plain text — no font-mono, no pre */}
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          </div>
        )}

        {msg.agentConnect && (
          <AgentConnectingCard agentName={msg.agentConnect.agentName} tripName={msg.agentConnect.tripName} />
        )}

        {msg.flights && (
          <div className="w-full space-y-3">
            {msg.flights.map((f, i) => (
              <FlightCard key={i} flight={f} onSelect={() => {}} variant="chat" />
            ))}
          </div>
        )}

        {msg.finalizedTrip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white border border-blue-100 rounded-2xl p-4 space-y-3 max-w-md shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-blue-50 text-blue-600 rounded border border-blue-100 uppercase tracking-wider">
                  Trip Workspace Synced
                </span>
                <h3 className="font-display font-bold text-slate-900 text-base mt-1.5 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-blue-600" />
                  {msg.finalizedTrip.name}
                </h3>
                <p className="text-slate-400 text-xs mt-1">Duration: {msg.finalizedTrip.duration}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                <span className="text-blue-600 font-bold text-sm font-mono">
                  {typeof msg.finalizedTrip.budget === 'number'
                    ? `₹${msg.finalizedTrip.budget.toLocaleString()}`
                    : msg.finalizedTrip.budget}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              All transport options, hotel stays, top sights, and food choices are loaded.
            </p>
            <Link
              to="/trip-builder"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
            >
              Open in Trip Builder
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {msg.warnings && msg.warnings.map((w, i) => (
          <WarningCard key={i} warning={w} />
        ))}

        <span className="text-slate-400 text-xs px-1">
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div
        className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center text-white shadow-md"
        style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="typing-dot w-2 h-2 bg-blue-400 rounded-full" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const destParam   = searchParams.get('dest')
  const cancelTrip  = searchParams.get('cancel')      // trip name from cancel flow
  const cancelDest  = searchParams.get('cancelDest')  // destination name
  const agentName   = searchParams.get('agentName')   // assigned agent

  const { user } = useAuth()

  // Build initial message based on context
  const buildInitialMessage = () => {
    if (cancelTrip) {
      return {
        role: 'assistant',
        content: `Are you sure you want to cancel your trip to ${cancelDest || cancelTrip}?\n\nThis will initiate a cancellation request with your assigned agent. Depending on your booking terms, a partial or full refund may be issued.\n\nPlease confirm by typing "Yes, cancel my trip" or type "No" to go back.`,
        ts: Date.now(),
        isCancelFlow: true,
      }
    }
    if (destParam) {
      return {
        role: 'assistant',
        content: `Hello! I'd love to help you plan a trip to ${destParam}!\n\nTo get started, could you tell me:\n• When are you thinking of going?\n• How many travelers?\n• What's your budget roughly?\n\nFeel free to describe it in any way — I'll take care of the rest.`,
        ts: Date.now(),
      }
    }
    return {
      role: 'assistant',
      content: `Hello! I'm VoyageAI, your intelligent travel companion.\n\nI can help you:\n• Search and book flights with live prices\n• Plan complete trip itineraries\n• Check visa & travel requirements\n• Manage existing bookings\n\nJust tell me where you'd like to go, or ask me anything about travel!`,
      ts: Date.now(),
    }
  }

  const [messages, setMessages] = useState([buildInitialMessage()])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiHistory, setApiHistory] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [cancelConfirmed, setCancelConfirmed] = useState(false)
  const recognitionRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'
      rec.onstart  = () => { setIsListening(true); toast.success('Listening... Speak now.') }
      rec.onend    = () => setIsListening(false)
      rec.onerror  = (e) => { setIsListening(false); if (e.error !== 'no-speech') toast.error(`Speech error: ${e.error}`) }
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        if (transcript) { setInput(prev => (prev ? prev + ' ' + transcript : transcript)); toast.success('Speech recognized!') }
      }
      recognitionRef.current = rec
    }
  }, [])

  const toggleListening = (e) => {
    e.stopPropagation()
    if (!recognitionRef.current) { toast.error('Speech recognition not supported.'); return }
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start()
  }

  // Handle cancellation confirmation flow
  const handleCancelFlow = async (userText) => {
    const confirmed = /yes|confirm|cancel|proceed/i.test(userText)
    const declined  = /no|back|stop|don't|dont/i.test(userText)

    if (confirmed && !cancelConfirmed) {
      setCancelConfirmed(true)
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 1200))
      setIsTyping(false)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Got it. Let me connect you to the agent who is managing your trip to ${cancelDest || cancelTrip}.`,
        ts: Date.now(),
      }])

      await new Promise(r => setTimeout(r, 900))
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 1500))
      setIsTyping(false)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Your cancellation request has been sent. The agent will review your refund eligibility and process it as soon as possible.`,
        agentConnect: { agentName: agentName || 'Your assigned agent', tripName: cancelDest || cancelTrip },
        ts: Date.now(),
      }])

      // Write cancellation request to supabase
      try {
        await supabase.from('cancellation_requests').insert([{
          user_id: user?.id,
          trip_name: cancelTrip,
          destination: cancelDest,
          status: 'pending',
          requested_at: new Date(),
        }])
      } catch (err) {
        console.error('Failed to log cancellation', err)
      }
      return true
    }

    if (declined) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `No problem! Your trip to ${cancelDest || cancelTrip} has not been cancelled. Is there anything else I can help you with?`,
        ts: Date.now(),
      }])
      return true
    }

    return false // fall through to normal chat
  }

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || isTyping) return
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userText, ts: Date.now() }])
    setIsTyping(true)

    // Cancel flow intercept
    if (cancelTrip && !cancelConfirmed) {
      const handled = await handleCancelFlow(userText)
      if (handled) return
    }

    const newHistory = [...apiHistory, { role: 'user', content: userText }]
    setApiHistory(newHistory)

    try {
      const { data: draft } = await supabase
        .from('trips')
        .select('itinerary_data')
        .eq('user_id', user?.id)
        .eq('status', 'draft')
        .single()

      const activeTrip = draft?.itinerary_data
      const intent = await detectTripIntent(userText, activeTrip)

      if (intent.detected && intent.action !== 'none') {
        let tripData = null
        if (intent.action === 'new') {
          const draftMsg = `Classifying request... I'm drafting a new trip plan to ${intent.destination} (${intent.duration}) in the background. Generating all options...`
          setMessages(prev => [...prev, { role: 'assistant', content: draftMsg, ts: Date.now() }])
          tripData = await generateMultiModalTrip(`${intent.destination} for ${intent.duration} ${intent.preferences ? `, preferences: ${intent.preferences}` : ''}`)
        } else if (intent.action === 'update' && activeTrip) {
          const updateMsg = `Analyzing active trip... Applying change: "${intent.preferences || userText}" and regenerating pricing comparisons...`
          setMessages(prev => [...prev, { role: 'assistant', content: updateMsg, ts: Date.now() }])
          tripData = await updateTripWithPreferences(activeTrip, userText)
        }

        if (tripData) {
          await supabase.from('trips').upsert({
            user_id: user?.id,
            name: tripData.tripName || tripData.name,
            itinerary_data: tripData,
            status: 'draft',
            updated_at: new Date()
          })

          const confirmReply = `I've successfully updated your trip workspace!\n\nDestination: ${tripData.tripName || tripData.name || intent.destination}\nDuration: ${tripData.duration || intent.duration}\nEstimated budget: ₹${(tripData.totalBudget || 35000).toLocaleString()}\n\nI have synced these changes to your active Trip Builder workspace. Open it below to review flights, hotels, trains, buses, roadways, sights, and restaurants.`

          setMessages(prev => [
            ...prev.filter(m => !m.content?.startsWith('Classifying') && !m.content?.startsWith('Analyzing')),
            {
              role: 'assistant',
              content: confirmReply,
              finalizedTrip: {
                name: tripData.tripName || tripData.name || intent.destination,
                duration: tripData.duration || intent.duration,
                budget: tripData.totalBudget || 35000,
                dest: intent.destination
              },
              ts: Date.now()
            }
          ])

          setApiHistory(prev => [...prev, { role: 'assistant', content: confirmReply }])
        } else {
          const reply = await callVoyageAI(newHistory)
          setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
          setApiHistory(prev => [...prev, { role: 'assistant', content: reply }])
        }
      } else {
        const reply = await callVoyageAI(newHistory)
        setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
        setApiHistory(prev => [...prev, { role: 'assistant', content: reply }])
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [
        ...prev.filter(m => !m.content?.startsWith('Classifying') && !m.content?.startsWith('Analyzing')),
        {
          role: 'assistant',
          content: `I'm having trouble connecting right now.\n\nError: ${err.message}\n\nMake sure VITE_GROQ_API_KEY is set in your .env file.`,
          ts: Date.now(),
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col bg-slate-50">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-80px)]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 flex items-center justify-between border-b border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-900 text-lg">
                {cancelTrip ? `Cancel Trip · ${cancelDest || cancelTrip}` : 'VoyageAI Travel Guide'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {cancelTrip ? 'Cancellation & Refund Flow' : 'Online · Powered by Groq LPU'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([{ role: 'assistant', content: 'New conversation started! Where would you like to go today?', ts: Date.now() }])
              setApiHistory([])
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-xl text-sm text-slate-500 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            New chat
          </button>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-2">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggestions (fresh non-cancel chat only) */}
        {messages.length === 1 && !cancelTrip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-4 flex flex-wrap gap-2"
          >
            {SUGGESTIONS.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-xl text-sm text-slate-500 transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md"
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Cancel quick-confirm buttons */}
        {cancelTrip && !cancelConfirmed && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-4 flex gap-3"
          >
            <button
              onClick={() => sendMessage('Yes, cancel my trip')}
              className="flex-1 py-2.5 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-100 transition-colors"
            >
              Yes, cancel my trip
            </button>
            <button
              onClick={() => sendMessage('No, keep my trip')}
              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              No, keep my trip
            </button>
          </motion.div>
        )}

        {/* Input bar */}
        <div className="py-4 border-t border-slate-200">
          <div
            className="bg-white border border-slate-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(26,110,189,0.08)] rounded-2xl p-3 flex items-end gap-3 cursor-text transition-all shadow-sm"
            onClick={() => inputRef.current?.focus()}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={cancelTrip ? 'Type "Yes, cancel my trip" to confirm or "No" to go back...' : 'Ask me anything — flights, destinations, visas, itineraries...'}
              className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 resize-none outline-none min-h-[44px] max-h-32 leading-relaxed py-1"
              rows={1}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 transition-colors rounded-lg ${
                  isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className={`p-2.5 rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? 'text-white shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                style={input.trim() && !isTyping ? { background: 'linear-gradient(135deg, #1A6EBD 0%, #1558A0 100%)' } : {}}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs mt-2">
            VoyageAI runs on Groq LPU · Ultra-fast inference · Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}