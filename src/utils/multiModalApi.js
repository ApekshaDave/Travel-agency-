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
  const system = `You are VoyageAI's multi-modal trip planner for India.
Generate practical, destination-specific travel itineraries combining flights, trains, buses, roadways (cars/cabs), stays, dining, and sightseeing.
CRITICAL RULES:
1. Respond ONLY with a single valid raw JSON object — no markdown fences, no extra text before or after.
2. All restaurant and attraction names MUST be real, well-known places in the specified destination city.
3. Keep ALL string values extremely short (1 sentence max) to stay within token limits.
4. "placesToVisit" MUST have exactly 10 items — all real attractions in the destination.
5. "restaurants.veg" MUST have exactly 10 real vegetarian restaurants in the destination.
6. "restaurants.nonVeg" MUST have exactly 10 real non-vegetarian restaurants in the destination.
7. "itineraryDays" must have one entry per day of the trip (e.g., 5 days = 5 entries).`

  const userPrompt = `Generate a multi-modal Indian travel itinerary for: "${prompt}"

Return this exact JSON shape (all fields required, keep descriptions very short):
{
  "tripName": "Name of the trip",
  "desc": "Short route description",
  "duration": "X days",
  "totalBudget": 35000,
  
  "costComparison": {
    "flightCost": "₹5,500",
    "trainCost": "₹1,400",
    "busCost": "₹850",
    "roadwaysCost": "₹2,500",
    "analysis": "One sentence comparing transport modes for this route.",
    "aiSuggestion": "One sentence best recommendation for this user."
  },

  "segments": [
    {
      "id": "seg-1",
      "type": "flight|train|bus|roadways|hotel",
      "from": "City A",
      "to": "City B or empty string",
      "date": "20 Mar",
      "detail": "Operator or stay details",
      "price": 4500,
      "icon": "✈️|🚂|🚌|🚗|🏨"
    }
  ],

  "flightOptions": [
    { "id": "f-1", "airline": "IndiGo", "flightNo": "6E-241", "price": 4999, "depart": "06:15", "arrive": "08:30", "duration": "2h 15m", "stops": 0, "logo": "✈️" },
    { "id": "f-2", "airline": "Air India", "flightNo": "AI-402", "price": 5800, "depart": "14:00", "arrive": "16:10", "duration": "2h 10m", "stops": 0, "logo": "✈️" }
  ],

  "hotelOptions": [
    { "id": "h-1", "name": "Real Hotel Name", "pricePerNight": 3500, "rating": 4.5, "stars": 4, "area": "Area in destination city", "image": "Short description" },
    { "id": "h-2", "name": "Another Real Hotel", "pricePerNight": 2200, "rating": 4.1, "stars": 3, "area": "Near Station", "image": "Budget option near sights" }
  ],

  "trainOptions": [
    { "id": "t-1", "name": "Train Name", "trainNo": "12002", "price": 1200, "depart": "06:00", "arrive": "14:20", "duration": "8h 20m" },
    { "id": "t-2", "name": "Express Train", "trainNo": "12909", "price": 850, "depart": "16:30", "arrive": "02:15", "duration": "9h 45m" }
  ],

  "busOptions": [
    { "id": "b-1", "operator": "VRL Travels", "type": "AC Sleeper (2+1)", "price": 950, "depart": "21:00", "arrive": "08:30", "duration": "11h 30m" },
    { "id": "b-2", "operator": "SRS Travels", "type": "Volvo Semi-Sleeper", "price": 750, "depart": "22:00", "arrive": "09:45", "duration": "11h 45m" }
  ],

  "roadwaysOptions": [
    { "id": "r-1", "vehicle": "Dzire Sedan (AC)", "provider": "Ola Outstation", "price": 2800, "detail": "Private cab with toll and driver allowance" },
    { "id": "r-2", "vehicle": "Ertiga SUV (AC)", "provider": "MakeMyTrip Cabs", "price": 4200, "detail": "Spacious family car with driver" }
  ],

  "placesToVisit": [
    { "name": "Real Attraction 1 in Destination", "description": "One sentence what to enjoy here.", "funFact": "One interesting local fact.", "recommendedTime": "Morning", "visitDuration": "2 hours", "category": "History", "price": 50 },
    { "name": "Real Attraction 2", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Sunset", "visitDuration": "1 hour", "category": "Nature", "price": 0 },
    { "name": "Real Attraction 3", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Afternoon", "visitDuration": "2 hours", "category": "Adventure", "price": 200 },
    { "name": "Real Attraction 4", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Morning", "visitDuration": "1.5 hours", "category": "Shopping", "price": 0 },
    { "name": "Real Attraction 5", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Evening", "visitDuration": "1 hour", "category": "Food", "price": 0 },
    { "name": "Real Attraction 6", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Morning", "visitDuration": "2 hours", "category": "History", "price": 30 },
    { "name": "Real Attraction 7", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Afternoon", "visitDuration": "1 hour", "category": "Nature", "price": 100 },
    { "name": "Real Attraction 8", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Morning", "visitDuration": "3 hours", "category": "Adventure", "price": 350 },
    { "name": "Real Attraction 9", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Late Afternoon", "visitDuration": "2 hours", "category": "History", "price": 80 },
    { "name": "Real Attraction 10", "description": "Short description.", "funFact": "Fact.", "recommendedTime": "Night", "visitDuration": "1.5 hours", "category": "Food", "price": 0 }
  ],

  "restaurants": {
    "veg": [
      { "name": "Real Veg Restaurant 1", "cuisine": "Cuisine Type", "specialty": "Signature Dish", "costForTwo": "₹400", "description": "One sentence description." },
      { "name": "Real Veg Restaurant 2", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹500", "description": "Short description." },
      { "name": "Real Veg Restaurant 3", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹600", "description": "Short description." },
      { "name": "Real Veg Restaurant 4", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹350", "description": "Short description." },
      { "name": "Real Veg Restaurant 5", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹450", "description": "Short description." },
      { "name": "Real Veg Restaurant 6", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹700", "description": "Short description." },
      { "name": "Real Veg Restaurant 7", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹550", "description": "Short description." },
      { "name": "Real Veg Restaurant 8", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹400", "description": "Short description." },
      { "name": "Real Veg Restaurant 9", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹800", "description": "Short description." },
      { "name": "Real Veg Restaurant 10", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹300", "description": "Short description." }
    ],
    "nonVeg": [
      { "name": "Real NonVeg Restaurant 1", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹800", "description": "One sentence description." },
      { "name": "Real NonVeg Restaurant 2", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹1000", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 3", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹900", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 4", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹700", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 5", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹1200", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 6", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹850", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 7", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹950", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 8", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹600", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 9", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹1100", "description": "Short description." },
      { "name": "Real NonVeg Restaurant 10", "cuisine": "Cuisine", "specialty": "Dish", "costForTwo": "₹750", "description": "Short description." }
    ]
  },

  "itineraryDays": [
    {
      "day": 1,
      "title": "Arrival & Leisure",
      "theme": "Exploration",
      "morning": { "activity": "Arrive & Check-in", "description": "Settle in at hotel.", "duration": "2h", "cost": "Free", "tip": "Keep ID cards handy." },
      "afternoon": { "activity": "Local Walk", "description": "Explore streets.", "duration": "2h", "cost": "Free", "tip": "Wear comfortable shoes." },
      "evening": { "activity": "Sunset Viewpoint", "description": "Catch sunset views.", "duration": "1h", "cost": "₹50", "tip": "Carry a camera." },
      "meals": { "breakfast": "Hotel breakfast", "lunch": "Local cafe", "dinner": "Traditional dinner" },
      "transport": "Cab / Auto Rickshaw",
      "estimatedDayBudget": "₹1500"
    }
  ],

  "highlights": ["Top highlight 1", "Top highlight 2", "Top highlight 3"],
  "tips": ["Practical tip 1", "Practical tip 2"]
}

IMPORTANT: Output ONLY the raw JSON above. No markdown. No explanation. Replace all placeholder names with REAL places from the destination. Fill all 10 placesToVisit, all 10 veg restaurants, all 10 nonVeg restaurants. Add one itineraryDays entry per day of the trip.`

  return askGroqJSON(userPrompt, system, { maxTokens: 4500, temperature: 0.55 })
}

// ─── Chat (VoyageAI assistant) ────────────────────────────────────────────────

/**
 * Detects if the user wants to plan a new trip or update their current active trip.
 */
export async function detectTripIntent(userText, currentTrip = null) {
  const system = `You are a trip intent classifier. Your job is to analyze the user's message and check if they want to plan a new trip or update their current trip.
Current active trip: ${currentTrip ? JSON.stringify({ name: currentTrip.tripName || currentTrip.name, duration: currentTrip.duration }) : 'None'}

Return ONLY a single valid JSON object (no markdown, no extra text) with the following fields:
{
  "detected": true, // or false if it is just a normal question/conversation
  "action": "new", // "new", "update", or "none"
  "destination": "City Name (e.g. Hyderabad)",
  "duration": "Duration in days, e.g., 5 days (default to 5 days if unspecified)",
  "preferences": "Any specific preferences mentioned (e.g., veg food, add Taj Mahal, budget-friendly)"
}`

  try {
    const response = await askGroqJSON(`Analyze the user's request: "${userText}"`, system, { maxTokens: 250, temperature: 0.1 })
    return response
  } catch (e) {
    console.error("detectTripIntent failed:", e)
    return { detected: false, action: "none", destination: "", duration: "5 days", preferences: "" }
  }
}

/**
 * Takes an existing trip object and applies updates described in userText using LLM.
 */
export async function updateTripWithPreferences(currentTrip, userText) {
  const system = `You are an expert trip editor. You will receive an existing trip JSON and a user's update request.
Your job is to apply the request to the trip JSON and return the updated JSON.
Keep the exact same JSON schema. Apply changes like changing duration, adding/removing/updating segments, itinerary days, restaurants, or attractions based on the user's request.
Return ONLY the raw updated JSON object. No markdown.`

  const prompt = `Current Trip:
${JSON.stringify(currentTrip)}

User Request: "${userText}"`

  return askGroqJSON(prompt, system, { maxTokens: 4500, temperature: 0.3 })
}

/**
 * Multi-turn chat for ChatPage.jsx
 * messages = [{role, content}] conversation history
 */
export async function callVoyageAI(messages) {
  const system = `You are VoyageAI, an expert travel assistant for a premium travel agency.
You help users with flights, hotels, transit visa concerns, itineraries, and booking next steps.

When responding:
- Be warm, concise, and expert
- Always ask clarifying questions if needed (dates, budget, traveler count, class preference)
- Help users draft itineraries, suggestions for sightseeing and dining, and let them know that their trip can be finalized and synchronized with the Trip Builder.
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
