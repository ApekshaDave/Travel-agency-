import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import {
  Sparkles, Send, Mic, Plane, Users,
  ArrowRight, RefreshCw,
  AlertTriangle, CheckCircle, Clock
} from 'lucide-react'
import { callVoyageAI } from '../utils/multiModalApi'
import toast from 'react-hot-toast'
import FlightCard from '../components/features/FlightCard'

// ── Quick suggestions ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: '✈ Book a flight', prompt: 'I want to book a flight. Help me search.' },
  { label: '🏖 Beach trip ideas', prompt: 'Suggest some beach destinations for a 5-day trip in December within ₹40,000' },
  { label: '🗓 Plan an itinerary', prompt: 'Help me plan a 7-day trip to Japan' },
  { label: '📋 Visa requirements', prompt: 'What visa do I need as an Indian citizen to visit Thailand?' },
  { label: '💼 Corporate booking', prompt: 'I need to book a business trip to Mumbai next Monday, economy class' },
  { label: '🔄 Change my flight', prompt: 'I need to change my existing flight booking' },
]



// ── Warning card ──────────────────────────────────────────────────────────────
function WarningCard({ warning }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-amber-300 text-sm font-semibold mb-1">{warning.title}</div>
        <div className="text-amber-200/70 text-xs leading-relaxed">{warning.body}</div>
      </div>
    </motion.div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center ${
        isUser
          ? 'bg-sky-500/20 border border-sky-500/30'
          : 'bg-gradient-to-br from-gold-500 to-gold-400 shadow-gold-sm'
      }`}>
        {isUser
          ? <Users className="w-4 h-4 text-sky-400" />
          : <Sparkles className="w-4 h-4 text-void" />
        }
      </div>

      <div className={`max-w-[80%] space-y-3 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {msg.content && (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-sky-500/15 border border-sky-500/20 text-white ml-auto'
              : 'glass border border-border text-white/90'
          } ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
            <pre className="font-body whitespace-pre-wrap">{msg.content}</pre>
          </div>
        )}

        {msg.flights && (
          <div className="w-full space-y-3">
            {msg.flights.map((f, i) => (
              <FlightCard key={i} flight={f} onSelect={() => {}} variant="chat" />
            ))}
          </div>
        )}

        {msg.warnings && msg.warnings.map((w, i) => (
          <WarningCard key={i} warning={w} />
        ))}

        <span className="text-muted text-xs px-1">
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold-sm">
        <Sparkles className="w-4 h-4 text-void" />
      </div>
      <div className="glass border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="typing-dot w-2 h-2 bg-gold-400 rounded-full" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ChatPage ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const destParam = searchParams.get('dest')

  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: destParam
        ? `Hello! I'd love to help you plan a trip to ${destParam}! 🌏\n\nTo get started, could you tell me:\n• When are you thinking of going?\n• How many travelers?\n• What's your budget roughly?\n\nFeel free to describe it in any way — I'll take care of the rest.`
        : `Hello! I'm VoyageAI, your intelligent travel companion. ✈️\n\nI can help you:\n• Search and book flights with live prices\n• Plan complete trip itineraries\n• Check visa & travel requirements\n• Manage existing bookings\n\nJust tell me where you'd like to go, or ask me anything about travel!`,
      ts: Date.now(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiHistory, setApiHistory] = useState([])
  const [isListening, setIsListening] = useState(false)
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

      rec.onstart = () => {
        setIsListening(true)
        toast.success('Listening... Speak now.')
      }

      rec.onend = () => {
        setIsListening(false)
      }

      rec.onerror = (e) => {
        console.error('Speech recognition error', e)
        setIsListening(false)
        if (e.error !== 'no-speech') {
          toast.error(`Speech error: ${e.error}`)
        }
      }

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        if (transcript) {
          setInput(prev => (prev ? prev + ' ' + transcript : transcript))
          toast.success('Speech recognized!')
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

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || isTyping) return
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userText, ts: Date.now() }])
    setIsTyping(true)

    const newHistory = [...apiHistory, { role: 'user', content: userText }]
    setApiHistory(newHistory)

    try {
      const reply = await callVoyageAI(newHistory)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
      setApiHistory(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm having trouble connecting right now.\n\nError: ${err.message}\n\nMake sure VITE_GROQ_API_KEY is set in your .env file.`,
        ts: Date.now(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 flex items-center justify-between border-b border-border/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold-sm">
              <Sparkles className="w-5 h-5 text-void" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg">VoyageAI Assistant</h1>
              <div className="flex items-center gap-1.5 text-xs text-sage-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
                Online · Powered by Groq LPU
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([{
                role: 'assistant',
                content: 'New conversation started! Where would you like to go today? ✈️',
                ts: Date.now(),
              }])
              setApiHistory([])
            }}
            className="flex items-center gap-2 px-3 py-2 glass border border-border hover:border-gold-400/30 rounded-xl text-sm text-muted hover:text-white transition-all"
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

        {/* Suggestions (fresh chat only) */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-4 flex flex-wrap gap-2"
          >
            {SUGGESTIONS.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-2 glass border border-border hover:border-gold-400/30 rounded-xl text-sm text-muted hover:text-white transition-all"
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}

        <div className="py-4 border-t border-border/40">
          <div 
            className="glass gradient-border rounded-2xl p-3 flex items-end gap-3 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything — flights, destinations, visas, itineraries..."
              className="flex-1 bg-transparent text-white text-sm placeholder-muted resize-none outline-none min-h-[44px] max-h-32 leading-relaxed py-1 relative z-10"
              rows={1}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 transition-colors rounded-lg ${
                  isListening ? 'text-red-400 bg-red-400/10 animate-pulse' : 'text-muted hover:text-sky-400'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
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
                    ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-void shadow-gold-sm'
                    : 'bg-surface text-muted cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <p className="text-center text-muted/50 text-xs mt-2">
            VoyageAI runs on Groq LPU · Ultra-fast inference · Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}