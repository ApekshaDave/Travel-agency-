/**
 * multiModalApi.js — VoyageAI utility helpers
 * Routed through Groq via groq.js.
 */

import { askGroqJSON, askGroq } from './groq.js'

// ─── System prompts ───────────────────────────────────────────────────────────

const VISA_SYSTEM = `You are VoyageAI's visa intelligence engine.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Use accurate visa policy knowledge for the given passport/destination pair.
All currency values in Indian Rupees (₹).`

const SEARCH_SYSTEM = `You are VoyageAI's flight search AI.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Generate realistic Indian flight options with accurate pricing in INR.`

const HOTEL_SYSTEM = `You are VoyageAI's hotel search AI.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Generate realistic hotel options with accurate pricing in INR.`

// ─── JSON repair helper ───────────────────────────────────────────────────────
// Attempts to recover a truncated / slightly malformed JSON string
function repairJSON(raw) {
  if (!raw || typeof raw !== 'string') return null
  let s = raw.trim()

  // Strip markdown fences
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  // Already valid?
  try { return JSON.parse(s) } catch { /* fall through */ }

  // Try to close unclosed structures by counting brackets
  const opens  = (s.match(/\{/g) || []).length - (s.match(/\}/g) || []).length
  const aopens = (s.match(/\[/g) || []).length - (s.match(/\]/g) || []).length

  // Remove trailing incomplete key-value (last comma or partial token)
  s = s.replace(/,\s*$/, '').replace(/,\s*"[^"]*$/, '')

  // Close arrays first, then objects
  s += ']'.repeat(Math.max(0, aopens)) + '}'.repeat(Math.max(0, opens))

  try { return JSON.parse(s) } catch { return null }
}

// ─── Visa requirements ────────────────────────────────────────────────────────

export async function getVisaRequirements(nationality, destination) {
  const prompt = `Visa requirements for ${nationality} passport holder travelling to ${destination}.
Return ONLY this JSON:
{"nationality":"${nationality}","destination":"${destination}","visaType":"visa free|visa on arrival|e-visa|embassy visa","duration":"e.g. 30 days","cost":"Free or ₹4500","processingTime":"Instant or 5-7 days","entries":"Single|Multiple","validity":"1 year","lastUpdated":"June 2025","whereToApply":"Brief explanation","onlineApplication":true,"transitVisa":{"required":false,"note":"","countries":[]},"documentsRequired":["Passport","Return ticket","Hotel booking","Bank statements"],"healthRequirements":[],"warnings":[],"tips":["Tip 1","Tip 2"],"emergencyContact":"Indian Embassy contact"}`

  return askGroqJSON(prompt, VISA_SYSTEM, { maxTokens: 700, temperature: 0.3 })
}

// ─── Flight search ────────────────────────────────────────────────────────────

export async function searchFlights({ from, to, date, passengers = 1, travelClass = 'Economy' }) {
  const prompt = `Flight search: ${from} to ${to}, ${date}, ${passengers} pax, ${travelClass}.
Return ONLY this JSON:
{"flights":[{"id":"f1","airline":"IndiGo","flightNo":"6E 241","logo":"✈️","from":"${from}","to":"${to}","depart":"06:15","arrive":"08:30","duration":"2h 15m","stops":0,"stopCity":null,"price":4999,"class":"${travelClass}","seatsLeft":6,"amenities":["Meal"],"recommended":true,"refundable":true,"baggage":"15kg"},{"id":"f2","airline":"Air India","flightNo":"AI 402","logo":"✈️","from":"${from}","to":"${to}","depart":"14:00","arrive":"16:10","duration":"2h 10m","stops":0,"stopCity":null,"price":5800,"class":"${travelClass}","seatsLeft":3,"amenities":["Meal","WiFi"],"recommended":false,"refundable":true,"baggage":"15kg"},{"id":"f3","airline":"SpiceJet","flightNo":"SG 101","logo":"✈️","from":"${from}","to":"${to}","depart":"20:00","arrive":"22:15","duration":"2h 15m","stops":0,"stopCity":null,"price":3999,"class":"${travelClass}","seatsLeft":9,"amenities":[],"recommended":false,"refundable":false,"baggage":"15kg"}],"cheapestPrice":3999,"fastestDuration":"2h 10m","totalResults":3}
Replace placeholder values with realistic ones for the actual route.`

  return askGroqJSON(prompt, SEARCH_SYSTEM, { maxTokens: 800, temperature: 0.5 })
}

// ─── Hotel search ─────────────────────────────────────────────────────────────

export async function searchHotels({ city, checkIn, checkOut, guests = 2, budget }) {
  const prompt = `Hotel search: ${city}, ${checkIn} to ${checkOut}, ${guests} guests${budget ? `, max ₹${budget}/night` : ''}.
Return ONLY this JSON with 4 real hotels in ${city}:
{"hotels":[{"id":"h1","name":"Real Hotel Name","stars":4,"area":"Area, ${city}","pricePerNight":4500,"rating":4.3,"reviews":1240,"amenities":["WiFi","Pool","Breakfast"],"image":"Modern hotel near city centre","recommended":true,"refundable":true,"distanceFromCenter":"1.2 km","tag":"Best Value"},{"id":"h2","name":"Real Hotel 2","stars":3,"area":"Near Station","pricePerNight":2200,"rating":4.0,"reviews":890,"amenities":["WiFi","Breakfast"],"image":"Budget hotel near station","recommended":false,"refundable":true,"distanceFromCenter":"2.5 km","tag":"Budget Pick"},{"id":"h3","name":"Real Hotel 3","stars":5,"area":"Central ${city}","pricePerNight":8500,"rating":4.7,"reviews":2100,"amenities":["WiFi","Pool","Spa","Gym"],"image":"Luxury property","recommended":false,"refundable":true,"distanceFromCenter":"0.5 km","tag":"Luxury"},{"id":"h4","name":"Real Hotel 4","stars":3,"area":"Old City","pricePerNight":1800,"rating":3.8,"reviews":450,"amenities":["WiFi"],"image":"Heritage area hotel","recommended":false,"refundable":false,"distanceFromCenter":"3 km","tag":""}],"cheapestPerNight":1800,"totalResults":4}
Replace all placeholder names with real hotels in ${city}.`

  return askGroqJSON(prompt, HOTEL_SYSTEM, { maxTokens: 800, temperature: 0.5 })
}

// ─── Multi-modal trip builder ─────────────────────────────────────────────────

export async function generateMultiModalTrip(userPrompt) {
  const system = `You are VoyageAI's multi-modal trip planner for India.
Generate practical travel itineraries combining flights, trains, buses, roadways, stays, and sightseeing.
STRICT RULES:
1. Respond ONLY with a single valid raw JSON object — no markdown, no backticks, no explanation.
2. All restaurant and attraction names MUST be real, well-known places at the destination.
3. Keep ALL string values to 1 sentence maximum — brevity is critical.
4. "placesToVisit" must have EXACTLY 6 items.
5. "restaurants.veg" must have EXACTLY 5 items.
6. "restaurants.nonVeg" must have EXACTLY 5 items.
7. "itineraryDays" must have one entry per day of the trip.
8. Do NOT include any text before or after the JSON object.`

  // Compact schema — avoid sending a large filled-in example that eats tokens
  const schema = `{"tripName":"","desc":"","duration":"X days","totalBudget":0,"costComparison":{"flightCost":"","trainCost":"","busCost":"","roadwaysCost":"","analysis":"","aiSuggestion":""},"segments":[{"id":"","type":"flight|train|bus|roadways|hotel","from":"","to":"","date":"","detail":"","price":0,"icon":""}],"flightOptions":[{"id":"","airline":"","flightNo":"","price":0,"depart":"","arrive":"","duration":"","stops":0,"logo":"✈️"}],"hotelOptions":[{"id":"","name":"","pricePerNight":0,"rating":0,"stars":0,"area":"","image":""}],"trainOptions":[{"id":"","name":"","trainNo":"","price":0,"depart":"","arrive":"","duration":""}],"busOptions":[{"id":"","operator":"","type":"","price":0,"depart":"","arrive":"","duration":""}],"roadwaysOptions":[{"id":"","vehicle":"","provider":"","price":0,"detail":""}],"placesToVisit":[{"name":"","description":"","funFact":"","recommendedTime":"","visitDuration":"","category":"","price":0}],"restaurants":{"veg":[{"name":"","cuisine":"","specialty":"","costForTwo":"","description":""}],"nonVeg":[{"name":"","cuisine":"","specialty":"","costForTwo":"","description":""}]},"itineraryDays":[{"day":1,"title":"","theme":"","morning":{"activity":"","description":"","duration":"","cost":"","tip":""},"afternoon":{"activity":"","description":"","duration":"","cost":"","tip":""},"evening":{"activity":"","description":"","duration":"","cost":"","tip":""},"meals":{"breakfast":"","lunch":"","dinner":""},"transport":"","estimatedDayBudget":""}],"highlights":["",""],"tips":["",""]}`

  const fullPrompt = `Generate a complete multi-modal Indian travel itinerary for: "${userPrompt}"

Fill in this JSON schema with REAL, destination-specific data. Output ONLY the completed JSON, nothing else:
${schema}`

  // Use higher token limit and add repair fallback
  const raw = await generateRawTrip(fullPrompt, system)

  const parsed = repairJSON(raw)
  if (!parsed) {
    throw new Error(`AI returned invalid JSON: Could not parse Groq response as JSON. Raw: ${raw?.slice(0, 200)}`)
  }
  return parsed
}

// Internal: calls Groq and returns raw string so we can repair before parsing
async function generateRawTrip(prompt, system) {
  const { callGroq } = await import('./groq.js')

  // callGroq returns the assistant message string
  const result = await callGroq(
    [{ role: 'user', content: prompt }],
    system,
    { maxTokens: 6000, temperature: 0.5 }
  )

  // result may be a string or an object with a content field
  if (typeof result === 'string') return result
  if (result?.content) return result.content
  if (Array.isArray(result?.content)) {
    return result.content.map(b => b.text || '').join('')
  }
  return JSON.stringify(result)
}

// ─── Chat (VoyageAI assistant) ────────────────────────────────────────────────

export async function detectTripIntent(userText, currentTrip = null) {
  const system = `You are a trip intent classifier. Analyze the user message.
Current trip: ${currentTrip ? `${currentTrip.tripName || currentTrip.name}, ${currentTrip.duration}` : 'None'}
Return ONLY valid JSON:
{"detected":true,"action":"new|update|none","destination":"City Name","duration":"5 days","preferences":"any preferences"}`

  try {
    return await askGroqJSON(
      `Analyze: "${userText}"`,
      system,
      { maxTokens: 150, temperature: 0.1 }
    )
  } catch {
    return { detected: false, action: 'none', destination: '', duration: '5 days', preferences: '' }
  }
}

export async function updateTripWithPreferences(currentTrip, userText) {
  const system = `You are an expert trip editor. Apply the user's update request to the trip JSON and return the updated JSON. Keep the exact same schema. Return ONLY raw JSON.`

  const trimmedTrip = {
    tripName: currentTrip.tripName,
    duration: currentTrip.duration,
    totalBudget: currentTrip.totalBudget,
    segments: currentTrip.segments,
    itineraryDays: currentTrip.itineraryDays,
    highlights: currentTrip.highlights,
    tips: currentTrip.tips,
  }

  return askGroqJSON(
    `Trip: ${JSON.stringify(trimmedTrip)}\nUser request: "${userText}"`,
    system,
    { maxTokens: 2500, temperature: 0.3 }
  )
}

/**
 * Multi-turn chat — trims history to last 6 messages to stay under TPM limit
 */
export async function callVoyageAI(messages) {
  const system = `You are VoyageAI, an expert travel assistant for a premium travel agency.
Help users with flights, hotels, visa info, itineraries, and bookings.
- Be warm, concise, and expert
- Use ₹ as default currency
- Format flights as: ✈ Airline · Dep–Arr · Duration · Stops · ₹Price
- Mention transit visa requirements proactively
- End with a clear next step or question`

  const trimmed = messages.slice(-6)

  const { callGroq } = await import('./groq.js')
  return callGroq(trimmed, system, { maxTokens: 600, temperature: 0.75 })
}

// ─── Contextual AI snippets ───────────────────────────────────────────────────

export async function getAIRecommendation(context) {
  const system = `You are VoyageAI. Give ONE helpful tip in 1-2 short sentences. No markdown.`
  return askGroq(context, system, { maxTokens: 80, temperature: 0.8 })
}

export async function summariseCase(caseData) {
  const system = `Summarize this support case for a travel agent in 2 sentences max. No markdown.`
  const prompt = `Customer: ${caseData.customer}, Route: ${caseData.route}, Issue: ${caseData.typeLabel}, Action: ${caseData.aiAction}`
  return askGroq(prompt, system, { maxTokens: 120, temperature: 0.3 })
}

export async function checkRefundEligibility(bookingData) {
  const system = `You are VoyageAI's refund policy engine. Respond ONLY with valid JSON.`
  const prompt = `Refund eligibility for: ${JSON.stringify(bookingData)}
Return: {"eligible":true,"reason":"Explanation","refundAmount":0,"processingDays":5}`
  return askGroqJSON(prompt, system, { maxTokens: 150, temperature: 0.2 })
}

// Legacy mock exports
export const MOCK_HOTELS = []
export const MOCK_TRAINS = []
export const MOCK_BUSES = []
export const MOCK_FLIGHTS = []