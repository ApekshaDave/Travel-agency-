/**
 * multiModalApi.js — VoyageAI utility helpers
 * FIXED: Split large trip generation into 2 smaller Groq calls
 * to stay under the 6,000 TPM free-tier limit.
 */

import { askGroqJSON, askGroq } from './groq.js'

// ─── System prompts ───────────────────────────────────────────────────────────

const VISA_SYSTEM = `You are VoyageAI's visa intelligence engine. 
Respond ONLY with a single valid JSON object — no markdown, no extra text.`

const SEARCH_SYSTEM = `You are VoyageAI's flight search AI.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Generate realistic Indian domestic and international flight options with accurate pricing in INR.`

const HOTEL_SYSTEM = `You are VoyageAI's hotel search AI.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Generate realistic hotel options with accurate pricing in INR.`

// ─── Visa requirements ────────────────────────────────────────────────────────

export async function getVisaRequirements(nationality, destination) {
  const prompt = `Visa requirements for ${nationality} passport holder travelling to ${destination}?

Return this JSON:
{
  "nationality": "${nationality}",
  "destination": "${destination}",
  "visaType": "visa free|visa on arrival|e-visa|embassy visa|visa required",
  "duration": "e.g. 30 days",
  "cost": "e.g. Free or ₹4,500",
  "processingTime": "e.g. Instant or 5-7 business days",
  "entries": "Single|Multiple|Unlimited",
  "validity": "e.g. 1 year from issue",
  "lastUpdated": "June 2025",
  "whereToApply": "Where/how to apply",
  "onlineApplication": true,
  "transitVisa": { "required": false, "note": "", "countries": [] },
  "documentsRequired": ["Passport", "Return ticket", "Hotel booking", "Bank statements"],
  "healthRequirements": [],
  "warnings": [],
  "tips": ["Tip 1", "Tip 2"],
  "emergencyContact": "Indian Embassy contact"
}`
  return askGroqJSON(prompt, VISA_SYSTEM, { maxTokens: 1000, temperature: 0.3 })
}

// ─── Flight search ────────────────────────────────────────────────────────────

export async function searchFlights({ from, to, date, passengers = 1, travelClass = 'Economy' }) {
  const prompt = `Flight search: ${from} to ${to}, ${date}, ${passengers} pax, ${travelClass}

Return JSON:
{
  "flights": [
    { "id": "f1", "airline": "Name", "flightNo": "AB 123", "logo": "✈️",
      "from": "${from}", "to": "${to}", "depart": "HH:MM", "arrive": "HH:MM",
      "duration": "Xh Ym", "stops": 0, "stopCity": null, "price": 5999,
      "class": "${travelClass}", "seatsLeft": 4, "amenities": ["Meal"],
      "recommended": false, "refundable": true, "baggage": "15kg" }
  ],
  "cheapestPrice": 3999,
  "fastestDuration": "2h 10m",
  "totalResults": 6
}`
  return askGroqJSON(prompt, SEARCH_SYSTEM, { maxTokens: 1200, temperature: 0.5 })
}

// ─── Hotel search ─────────────────────────────────────────────────────────────

export async function searchHotels({ city, checkIn, checkOut, guests = 2, budget }) {
  const prompt = `Hotels in ${city}, ${checkIn} to ${checkOut}, ${guests} guests${budget ? `, max ₹${budget}/night` : ''}

Return JSON:
{
  "hotels": [
    { "id": "h1", "name": "Hotel Name", "stars": 4, "area": "Area, City",
      "pricePerNight": 4500, "rating": 4.3, "reviews": 1240,
      "amenities": ["WiFi", "Pool"], "image": "description",
      "recommended": false, "refundable": true,
      "distanceFromCenter": "1.2 km", "tag": "Best Value" }
  ],
  "cheapestPerNight": 2200,
  "totalResults": 10
}`
  return askGroqJSON(prompt, HOTEL_SYSTEM, { maxTokens: 1200, temperature: 0.5 })
}

// ─── Multi-modal trip builder ─────────────────────────────────────────────────
// Split into 2 API calls to stay under 6,000 TPM:
//   Call 1 (~2000 output tokens): segments, options, itinerary days
//   Call 2 (~1800 output tokens): places + restaurants
// A 1s delay between calls prevents TPM burst errors.

export async function generateMultiModalTrip(userPrompt) {

  const CORE_SYSTEM = `You are VoyageAI's multi-modal trip planner for India.
Respond ONLY with a single valid raw JSON object — no markdown fences, no extra text.
Keep ALL string values to 1 short sentence.`

  const EXTRAS_SYSTEM = `You are VoyageAI's destination content engine.
Respond ONLY with a single valid raw JSON object — no markdown fences, no extra text.
All names MUST be real, well-known places in the specified city.
Keep all descriptions to 1 short sentence.`

  // ── Call 1: Core trip structure ───────────────────────────────────────────
  const corePrompt = `Plan a multi-modal Indian trip for: "${userPrompt}"

Return ONLY this JSON (add one itineraryDays entry per day of the trip):
{
  "tripName": "Name",
  "desc": "Short route description",
  "duration": "X days",
  "totalBudget": 35000,
  "costComparison": {
    "flightCost": "₹5,500",
    "trainCost": "₹1,400",
    "busCost": "₹850",
    "roadwaysCost": "₹2,500",
    "analysis": "One sentence comparing modes.",
    "aiSuggestion": "One sentence recommendation."
  },
  "segments": [
    { "id": "seg-1", "type": "flight", "from": "Delhi", "to": "Mumbai", "date": "20 Mar", "detail": "IndiGo 6E-241", "price": 4999, "icon": "✈️" }
  ],
  "flightOptions": [
    { "id": "f-1", "airline": "IndiGo", "flightNo": "6E-241", "price": 4999, "depart": "06:15", "arrive": "08:30", "duration": "2h 15m", "stops": 0, "logo": "✈️" },
    { "id": "f-2", "airline": "Air India", "flightNo": "AI-402", "price": 5800, "depart": "14:00", "arrive": "16:10", "duration": "2h 10m", "stops": 0, "logo": "✈️" }
  ],
  "hotelOptions": [
    { "id": "h-1", "name": "Real Hotel Name", "pricePerNight": 3500, "rating": 4.5, "stars": 4, "area": "City area", "image": "Short description" },
    { "id": "h-2", "name": "Another Real Hotel", "pricePerNight": 2200, "rating": 4.1, "stars": 3, "area": "Near Station", "image": "Budget option" }
  ],
  "trainOptions": [
    { "id": "t-1", "name": "Train Name", "trainNo": "12002", "price": 1200, "depart": "06:00", "arrive": "14:20", "duration": "8h 20m" }
  ],
  "busOptions": [
    { "id": "b-1", "operator": "VRL Travels", "type": "AC Sleeper", "price": 950, "depart": "21:00", "arrive": "08:30", "duration": "11h 30m" }
  ],
  "roadwaysOptions": [
    { "id": "r-1", "vehicle": "Dzire Sedan", "provider": "Ola Outstation", "price": 2800, "detail": "Private cab with toll." }
  ],
  "itineraryDays": [
    {
      "day": 1, "title": "Arrival & Leisure", "theme": "Exploration",
      "morning": { "activity": "Check-in", "description": "Settle in.", "duration": "2h", "cost": "Free", "tip": "Keep ID handy." },
      "afternoon": { "activity": "Local Walk", "description": "Explore.", "duration": "2h", "cost": "Free", "tip": "Wear comfy shoes." },
      "evening": { "activity": "Sunset", "description": "Enjoy views.", "duration": "1h", "cost": "₹50", "tip": "Bring camera." },
      "meals": { "breakfast": "Hotel", "lunch": "Local cafe", "dinner": "Traditional" },
      "transport": "Cab / Auto",
      "estimatedDayBudget": "₹1500"
    }
  ],
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "tips": ["Tip 1", "Tip 2"]
}

Output ONLY raw JSON. No markdown.`

  // ── Call 2: Places + restaurants ──────────────────────────────────────────
  // Extract likely destination from the last few words of the prompt
  const destHint = userPrompt.split(' ').slice(-4).join(' ')

  const extrasPrompt = `For a trip related to: "${destHint}"

Return ONLY this JSON with REAL place/restaurant names from the destination city:
{
  "placesToVisit": [
    { "name": "Real Place 1", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Morning", "visitDuration": "2 hours", "category": "History", "price": 50 },
    { "name": "Real Place 2", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Sunset", "visitDuration": "1 hour", "category": "Nature", "price": 0 },
    { "name": "Real Place 3", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Afternoon", "visitDuration": "2 hours", "category": "Adventure", "price": 200 },
    { "name": "Real Place 4", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Morning", "visitDuration": "1.5 hours", "category": "Shopping", "price": 0 },
    { "name": "Real Place 5", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Evening", "visitDuration": "1 hour", "category": "Food", "price": 0 },
    { "name": "Real Place 6", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Morning", "visitDuration": "2 hours", "category": "History", "price": 30 },
    { "name": "Real Place 7", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Afternoon", "visitDuration": "1 hour", "category": "Nature", "price": 100 },
    { "name": "Real Place 8", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Morning", "visitDuration": "3 hours", "category": "Adventure", "price": 350 },
    { "name": "Real Place 9", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Late Afternoon", "visitDuration": "2 hours", "category": "History", "price": 80 },
    { "name": "Real Place 10", "description": "One sentence.", "funFact": "One fact.", "recommendedTime": "Night", "visitDuration": "1.5 hours", "category": "Food", "price": 0 }
  ],
  "restaurants": {
    "veg": [
      { "name": "Real Veg 1", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹400", "description": "One sentence." },
      { "name": "Real Veg 2", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹500", "description": "One sentence." },
      { "name": "Real Veg 3", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹600", "description": "One sentence." },
      { "name": "Real Veg 4", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹350", "description": "One sentence." },
      { "name": "Real Veg 5", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹450", "description": "One sentence." },
      { "name": "Real Veg 6", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹700", "description": "One sentence." },
      { "name": "Real Veg 7", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹550", "description": "One sentence." },
      { "name": "Real Veg 8", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹400", "description": "One sentence." },
      { "name": "Real Veg 9", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹800", "description": "One sentence." },
      { "name": "Real Veg 10", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹300", "description": "One sentence." }
    ],
    "nonVeg": [
      { "name": "Real NonVeg 1", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹800", "description": "One sentence." },
      { "name": "Real NonVeg 2", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹1000", "description": "One sentence." },
      { "name": "Real NonVeg 3", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹900", "description": "One sentence." },
      { "name": "Real NonVeg 4", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹700", "description": "One sentence." },
      { "name": "Real NonVeg 5", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹1200", "description": "One sentence." },
      { "name": "Real NonVeg 6", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹850", "description": "One sentence." },
      { "name": "Real NonVeg 7", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹950", "description": "One sentence." },
      { "name": "Real NonVeg 8", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹600", "description": "One sentence." },
      { "name": "Real NonVeg 9", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹1100", "description": "One sentence." },
      { "name": "Real NonVeg 10", "cuisine": "Type", "specialty": "Dish", "costForTwo": "₹750", "description": "One sentence." }
    ]
  }
}

Replace ALL placeholder names with REAL places/restaurants. Output ONLY raw JSON.`

  // Run calls sequentially with a 1s gap to avoid TPM burst
  const coreTrip = await askGroqJSON(corePrompt, CORE_SYSTEM, {
    maxTokens: 2500,
    temperature: 0.55,
  })

  await new Promise(resolve => setTimeout(resolve, 1100))

  const extras = await askGroqJSON(extrasPrompt, EXTRAS_SYSTEM, {
    maxTokens: 2000,
    temperature: 0.5,
  })

  return {
    ...coreTrip,
    placesToVisit: extras.placesToVisit || [],
    restaurants: extras.restaurants || { veg: [], nonVeg: [] },
  }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function detectTripIntent(userText, currentTrip = null) {
  const system = `You are a trip intent classifier.
Active trip: ${currentTrip ? JSON.stringify({ name: currentTrip.tripName || currentTrip.name, duration: currentTrip.duration }) : 'None'}
Return ONLY JSON: { "detected": true, "action": "new|update|none", "destination": "City", "duration": "5 days", "preferences": "any preferences" }`

  try {
    return await askGroqJSON(`Analyze: "${userText}"`, system, { maxTokens: 150, temperature: 0.1 })
  } catch {
    return { detected: false, action: 'none', destination: '', duration: '5 days', preferences: '' }
  }
}

export async function updateTripWithPreferences(currentTrip, userText) {
  const system = `You are a trip editor. Apply the user's request to the trip JSON. Return ONLY the updated raw JSON, same schema.`
  const prompt = `Trip: ${JSON.stringify(currentTrip)}\nRequest: "${userText}"`
  return askGroqJSON(prompt, system, { maxTokens: 3000, temperature: 0.3 })
}

export async function callVoyageAI(messages) {
  const system = `You are VoyageAI, an expert travel assistant.
Help with flights, hotels, visas, itineraries. Use ₹ by default.
Keep responses under 250 words. End with a clear next step.
Flights format: ✈ [Airline] · [Dep]–[Arr] · [Duration] · ₹[Price]`

  // Trim to last 4 turns + first message to stay under TPM
  const trimmed = messages.length > 5
    ? [messages[0], ...messages.slice(-4)]
    : messages

  const { callGroq } = await import('./groq.js')
  return callGroq(trimmed, system, { maxTokens: 450, temperature: 0.75 })
}

// ─── Utility snippets ─────────────────────────────────────────────────────────

export async function getAIRecommendation(context) {
  const system = `You are VoyageAI. Give a single helpful tip in 1-2 short sentences. No markdown.`
  return askGroq(context, system, { maxTokens: 90, temperature: 0.8 })
}

export async function summariseCase(caseData) {
  const system = `Summarize this support case for an agent in 2 sentences. No markdown.`
  const prompt = `Customer: ${caseData.customer}, Route: ${caseData.route}, Issue: ${caseData.typeLabel}, Action: ${caseData.aiAction}`
  return askGroq(prompt, system, { maxTokens: 120, temperature: 0.3 })
}

export async function checkRefundEligibility(bookingData) {
  const system = `You are VoyageAI's refund engine. Respond ONLY with valid JSON.`
  const prompt = `Refund eligibility for: ${JSON.stringify(bookingData)}
Return: { "eligible": true, "reason": "explanation", "refundAmount": 0, "processingDays": 5 }`
  return askGroqJSON(prompt, system, { maxTokens: 180, temperature: 0.2 })
}

export const MOCK_HOTELS = []
export const MOCK_TRAINS = []
export const MOCK_BUSES = []
export const MOCK_FLIGHTS = []