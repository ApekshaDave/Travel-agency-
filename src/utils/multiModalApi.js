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

export async function generateMultiModalTrip(prompt) {
  const system = `You are VoyageAI's multi-modal trip planner for India.
Generate practical travel itineraries combining flights, trains, buses, roadways, stays, and sightseeing.
RULES:
1. Respond ONLY with a single valid raw JSON object — no markdown, no extra text.
2. All restaurant and attraction names MUST be real, well-known places in the destination.
3. Keep ALL string values short (1 sentence max).
4. "placesToVisit" must have exactly 6 items.
5. "restaurants.veg" must have exactly 5 real vegetarian restaurants.
6. "restaurants.nonVeg" must have exactly 5 real non-vegetarian restaurants.
7. "itineraryDays" must have one entry per day.`

  const userPrompt = `Generate a multi-modal Indian travel itinerary for: "${prompt}"

Return ONLY this JSON (replace ALL placeholders with real destination-specific data):
{
  "tripName": "Trip name",
  "desc": "Short route description",
  "duration": "X days",
  "totalBudget": 35000,
  "costComparison": {
    "flightCost": "₹5,500",
    "trainCost": "₹1,400",
    "busCost": "₹850",
    "roadwaysCost": "₹2,500",
    "analysis": "One sentence comparing modes.",
    "aiSuggestion": "One sentence best recommendation."
  },
  "segments": [
    {"id":"seg-1","type":"flight","from":"City A","to":"City B","date":"20 Mar","detail":"IndiGo 6E-241","price":4500,"icon":"✈️"},
    {"id":"seg-2","type":"hotel","from":"City B","to":"","date":"20-22 Mar","detail":"Hotel name, 2 nights","price":7000,"icon":"🏨"}
  ],
  "flightOptions": [
    {"id":"f-1","airline":"IndiGo","flightNo":"6E-241","price":4999,"depart":"06:15","arrive":"08:30","duration":"2h 15m","stops":0,"logo":"✈️"},
    {"id":"f-2","airline":"Air India","flightNo":"AI-402","price":5800,"depart":"14:00","arrive":"16:10","duration":"2h 10m","stops":0,"logo":"✈️"}
  ],
  "hotelOptions": [
    {"id":"h-1","name":"Real Hotel Name","pricePerNight":3500,"rating":4.5,"stars":4,"area":"Area in destination","image":"Hotel description"},
    {"id":"h-2","name":"Another Real Hotel","pricePerNight":2200,"rating":4.1,"stars":3,"area":"Near Station","image":"Budget option"}
  ],
  "trainOptions": [
    {"id":"t-1","name":"Train Name","trainNo":"12002","price":1200,"depart":"06:00","arrive":"14:20","duration":"8h 20m"},
    {"id":"t-2","name":"Express Train","trainNo":"12909","price":850,"depart":"16:30","arrive":"02:15","duration":"9h 45m"}
  ],
  "busOptions": [
    {"id":"b-1","operator":"VRL Travels","type":"AC Sleeper (2+1)","price":950,"depart":"21:00","arrive":"08:30","duration":"11h 30m"},
    {"id":"b-2","operator":"SRS Travels","type":"Volvo Semi-Sleeper","price":750,"depart":"22:00","arrive":"09:45","duration":"11h 45m"}
  ],
  "roadwaysOptions": [
    {"id":"r-1","vehicle":"Dzire Sedan (AC)","provider":"Ola Outstation","price":2800,"detail":"Private cab with toll"},
    {"id":"r-2","vehicle":"Ertiga SUV (AC)","provider":"MakeMyTrip Cabs","price":4200,"detail":"Spacious family car"}
  ],
  "placesToVisit": [
    {"name":"Real Attraction 1","description":"One sentence.","funFact":"One fact.","recommendedTime":"Morning","visitDuration":"2 hours","category":"History","price":50},
    {"name":"Real Attraction 2","description":"One sentence.","funFact":"One fact.","recommendedTime":"Sunset","visitDuration":"1 hour","category":"Nature","price":0},
    {"name":"Real Attraction 3","description":"One sentence.","funFact":"One fact.","recommendedTime":"Afternoon","visitDuration":"2 hours","category":"Adventure","price":200},
    {"name":"Real Attraction 4","description":"One sentence.","funFact":"One fact.","recommendedTime":"Morning","visitDuration":"1.5 hours","category":"Shopping","price":0},
    {"name":"Real Attraction 5","description":"One sentence.","funFact":"One fact.","recommendedTime":"Evening","visitDuration":"1 hour","category":"Food","price":0},
    {"name":"Real Attraction 6","description":"One sentence.","funFact":"One fact.","recommendedTime":"Morning","visitDuration":"2 hours","category":"History","price":30}
  ],
  "restaurants": {
    "veg": [
      {"name":"Real Veg Restaurant 1","cuisine":"South Indian","specialty":"Dosa","costForTwo":"₹400","description":"One sentence."},
      {"name":"Real Veg Restaurant 2","cuisine":"North Indian","specialty":"Paneer Dish","costForTwo":"₹500","description":"One sentence."},
      {"name":"Real Veg Restaurant 3","cuisine":"Gujarati","specialty":"Thali","costForTwo":"₹350","description":"One sentence."},
      {"name":"Real Veg Restaurant 4","cuisine":"Chinese","specialty":"Noodles","costForTwo":"₹450","description":"One sentence."},
      {"name":"Real Veg Restaurant 5","cuisine":"Street Food","specialty":"Chaat","costForTwo":"₹200","description":"One sentence."}
    ],
    "nonVeg": [
      {"name":"Real NonVeg Restaurant 1","cuisine":"Mughlai","specialty":"Biryani","costForTwo":"₹800","description":"One sentence."},
      {"name":"Real NonVeg Restaurant 2","cuisine":"Coastal","specialty":"Fish Curry","costForTwo":"₹700","description":"One sentence."},
      {"name":"Real NonVeg Restaurant 3","cuisine":"BBQ","specialty":"Tandoori","costForTwo":"₹900","description":"One sentence."},
      {"name":"Real NonVeg Restaurant 4","cuisine":"Chinese","specialty":"Chicken dishes","costForTwo":"₹600","description":"One sentence."},
      {"name":"Real NonVeg Restaurant 5","cuisine":"Continental","specialty":"Grilled items","costForTwo":"₹1000","description":"One sentence."}
    ]
  },
  "itineraryDays": [
    {
      "day": 1,
      "title": "Arrival & Exploration",
      "theme": "Exploration",
      "morning": {"activity":"Arrive & Check-in","description":"Settle in.","duration":"2h","cost":"Free","tip":"Keep ID handy."},
      "afternoon": {"activity":"Local Walk","description":"Explore streets.","duration":"2h","cost":"Free","tip":"Comfortable shoes."},
      "evening": {"activity":"Sunset Viewpoint","description":"Catch sunset.","duration":"1h","cost":"₹50","tip":"Carry camera."},
      "meals": {"breakfast":"Hotel breakfast","lunch":"Local cafe","dinner":"Traditional dinner"},
      "transport":"Cab / Auto Rickshaw",
      "estimatedDayBudget":"₹1500"
    }
  ],
  "highlights": ["Highlight 1","Highlight 2","Highlight 3"],
  "tips": ["Tip 1","Tip 2"]
}

CRITICAL: Replace ALL placeholder text with real places, real restaurants, and real attractions specific to the destination. Output ONLY raw JSON.`

  return askGroqJSON(userPrompt, system, { maxTokens: 3500, temperature: 0.55 })
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

  // Send a trimmed version of the trip to avoid token overflow
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

  // Keep system message + last 6 turns to stay under the 6000 TPM limit
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