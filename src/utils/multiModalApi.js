/**
 * multiModalApi.js — VoyageAI utility helpers
 *
 * Previously called Anthropic. Now routed through Groq via groq.js.
 * This file keeps the same exported function signatures so
 * VisaChecker.jsx, SearchPage.jsx, etc. need zero import changes.
 */

import { askGroqJSON, askGroq } from './groq.js'

// ─── System prompts ───────────────────────────────────────────────────────────

const VISA_SYSTEM = `You are VoyageAI's visa intelligence engine. 
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Use accurate, up-to-date visa policy knowledge for the given passport/destination pair.
All currency values should use Indian Rupees (₹) where appropriate.`

const SEARCH_SYSTEM = `You are VoyageAI's flight search AI.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Generate realistic Indian domestic and international flight options with accurate pricing in INR.`

const HOTEL_SYSTEM = `You are VoyageAI's hotel search AI.
Respond ONLY with a single valid JSON object — no markdown, no extra text.
Generate realistic hotel options with accurate pricing in INR.`

// ─── Visa requirements ────────────────────────────────────────────────────────

/**
 * Fetch AI-generated visa requirements.
 * Returns structured data consumed by VisaResultCard in VisaChecker.jsx
 */
export async function getVisaRequirements(nationality, destination) {
  const prompt = `What are the visa requirements for a ${nationality} passport holder travelling to ${destination}?

Return this exact JSON shape:
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
  "whereToApply": "Explanation of where/how to apply",
  "onlineApplication": true,
  "transitVisa": {
    "required": false,
    "note": "Explanation if transit visa needed",
    "countries": []
  },
  "documentsRequired": ["Passport (min 6 months validity)", "Return ticket", "Hotel booking", "Bank statements"],
  "healthRequirements": ["Any vaccination or health requirements"],
  "warnings": ["Any important warnings or caveats"],
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
  "emergencyContact": "Indian Embassy contact if relevant"
}`

  return askGroqJSON(prompt, VISA_SYSTEM, { maxTokens: 1200, temperature: 0.3 })
}

// ─── Flight search ────────────────────────────────────────────────────────────

/**
 * AI-generated flight search results.
 * Returns array of flight objects consumed by SearchPage.jsx
 */
export async function searchFlights({ from, to, date, passengers = 1, travelClass = 'Economy' }) {
  const prompt = `Generate realistic flight search results for:
From: ${from}
To: ${to}  
Date: ${date}
Passengers: ${passengers}
Class: ${travelClass}

Return this exact JSON:
{
  "flights": [
    {
      "id": "unique_id",
      "airline": "Airline Name",
      "flightNo": "AB 123",
      "logo": "emoji",
      "from": "${from}",
      "to": "${to}",
      "depart": "HH:MM",
      "arrive": "HH:MM",
      "duration": "Xh Ym",
      "stops": 0,
      "stopCity": null,
      "price": 5999,
      "class": "${travelClass}",
      "seatsLeft": 4,
      "amenities": ["Meal", "WiFi"],
      "recommended": false,
      "refundable": true,
      "baggage": "15kg"
    }
  ],
  "cheapestPrice": 3999,
  "fastestDuration": "2h 10m",
  "totalResults": 8
}`

  return askGroqJSON(prompt, SEARCH_SYSTEM, { maxTokens: 1500, temperature: 0.5 })
}

// ─── Hotel search ─────────────────────────────────────────────────────────────

/**
 * AI-generated hotel search results.
 * Returns array of hotel objects consumed by HotelSearch.jsx
 */
export async function searchHotels({ city, checkIn, checkOut, guests = 2, budget }) {
  const prompt = `Generate realistic hotel search results for:
City: ${city}
Check-in: ${checkIn}
Check-out: ${checkOut}
Guests: ${guests}
${budget ? `Max budget per night: ₹${budget}` : ''}

Return this exact JSON:
{
  "hotels": [
    {
      "id": "unique_id",
      "name": "Hotel Name",
      "stars": 4,
      "area": "Neighbourhood, City",
      "pricePerNight": 4500,
      "rating": 4.3,
      "reviews": 1240,
      "amenities": ["WiFi", "Pool", "Breakfast"],
      "image": "descriptive alt text",
      "recommended": false,
      "refundable": true,
      "distanceFromCenter": "1.2 km from city centre",
      "tag": "Best Value"
    }
  ],
  "cheapestPerNight": 2200,
  "totalResults": 12
}`

  return askGroqJSON(prompt, HOTEL_SYSTEM, { maxTokens: 1500, temperature: 0.5 })
}

// ─── Multi-modal trip builder ─────────────────────────────────────────────────

/**
 * AI itinerary generator for TripBuilder.jsx
 * Replaces the inline Anthropic call that was in TripBuilder.jsx
 */
export async function generateMultiModalTrip(prompt) {
  const system = `You are VoyageAI's multi-modal trip planner.
Generate practical Indian travel itineraries combining flights, trains, buses and hotels.
Respond ONLY with a single valid JSON object — no markdown, no extra text.`

  const userPrompt = `Generate a multi-modal Indian travel itinerary for: "${prompt}"

Return this exact JSON:
{
  "tripName": "Name of the trip",
  "desc": "Short description",
  "duration": "X days",
  "totalBudget": 45000,
  "segments": [
    {
      "id": "1",
      "type": "flight|train|bus|hotel",
      "from": "City A",
      "to": "City B (empty string for hotel)",
      "date": "20 Mar",
      "detail": "Operator name · time or stay details",
      "price": 4500,
      "icon": "✈️ or 🚂 or 🚌 or 🏨"
    }
  ],
  "highlights": ["Top highlight 1", "Top highlight 2", "Top highlight 3"],
  "tips": ["Practical tip 1", "Practical tip 2"]
}`

  return askGroqJSON(userPrompt, system, { maxTokens: 1200, temperature: 0.6 })
}

// ─── Chat (VoyageAI assistant) ────────────────────────────────────────────────

/**
 * Multi-turn chat for ChatPage.jsx
 * messages = [{role, content}] conversation history
 */
export async function callVoyageAI(messages) {
  const system = `You are VoyageAI, an expert AI travel assistant for a premium travel agency.
You help users discover destinations, search flights, plan itineraries, and manage bookings through natural conversation.

When responding:
- Be warm, concise, and expert
- Always ask clarifying questions if needed (dates, budget, traveler count, class preference)
- Surface visa warnings, transit requirements, or travel advisories proactively
- Format flight options clearly with airline, price, duration, and stops
- Use rupees (₹) as default currency unless user specifies
- Mention if a route needs a transit visa (e.g. Schengen, UK, US transit)
- Keep responses focused and actionable

For flight searches, present options as:
✈ [Airline] · [Departure]–[Arrival] · [Duration] · [Stops] · ₹[Price]

Always end with a clear next step or question.`

  const { callGroq } = await import('./groq.js')
  return callGroq(messages, system, { maxTokens: 1000, temperature: 0.75 })
}

// ─── Contextual AI snippets ───────────────────────────────────────────────────

/**
 * One-shot AI recommendation banner (AddonsPage, FlightStatusPage, etc.)
 * Returns a short 1-2 sentence string.
 */
export async function getAIRecommendation(context) {
  const system = `You are VoyageAI, a concise travel AI. Give a single helpful recommendation in 1-2 short sentences. No markdown.`
  return askGroq(context, system, { maxTokens: 120, temperature: 0.8 })
}

/**
 * Case summary for AgentDashboard escalated cases.
 * chatLog = [{role, msg}]
 * Returns a short summary string.
 */
export async function summariseCase(caseData) {
  const system = `You are a travel support AI summarizing escalated customer cases for human agents. Be factual and concise — 2-3 sentences max. No markdown.`
  const prompt = `Summarize this support case for an agent:
Customer: ${caseData.customer}
Route: ${caseData.route}
Issue type: ${caseData.typeLabel}
Chat log: ${JSON.stringify(caseData.chatLog)}
Suggested action: ${caseData.aiAction}`

  return askGroq(prompt, system, { maxTokens: 180, temperature: 0.3 })
}

/**
 * Refund eligibility check.
 * Returns { eligible: bool, reason: string, refundAmount: number }
 */
export async function checkRefundEligibility(bookingData) {
  const system = `You are VoyageAI's refund policy engine. Respond ONLY with valid JSON.`
  const prompt = `Determine refund eligibility for this booking:
${JSON.stringify(bookingData)}

Return: { "eligible": true|false, "reason": "Explanation", "refundAmount": 0, "processingDays": 5 }`

  return askGroqJSON(prompt, system, { maxTokens: 200, temperature: 0.2 })
}

// Temporary mock exports for legacy pages

export const MOCK_HOTELS = [];

export const MOCK_TRAINS = [];

export const MOCK_BUSES = [];

export const MOCK_FLIGHTS = [];