/**
 * VoyageAI Itinerary Planner
 * Uses Claude AI to create structured travel itineraries
 * Can be combined with real flight data from Amadeus
 */

/**
 * Generate a full trip itinerary using Claude AI
 * @param {Object} params
 * @param {string} params.destination - e.g. "Bangkok, Thailand"
 * @param {number} params.days        - number of days
 * @param {string} params.budget      - "budget" | "moderate" | "luxury"
 * @param {string[]} params.interests - ["culture", "food", "beaches", "history"]
 * @param {Object} params.flights     - optional: confirmed flight details
 */
export async function generateItinerary({
  destination,
  days,
  budget = 'moderate',
  interests = [],
  flights = null,
}) {
  const flightContext = flights
    ? `The traveler has booked: ${flights.airline} from ${flights.fromCity} to ${flights.toCity}, departing ${flights.depart} on day 1, returning after day ${days}.`
    : ''

  const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for ${destination}.

Budget level: ${budget}
Interests: ${interests.join(', ') || 'general sightseeing, food, culture'}
${flightContext}

Respond ONLY with a JSON object in this exact structure (no markdown, no preamble):
{
  "destination": "${destination}",
  "totalDays": ${days},
  "budgetLevel": "${budget}",
  "summary": "2-3 sentence trip overview",
  "highlights": ["top thing 1", "top thing 2", "top thing 3"],
  "days": [
    {
      "day": 1,
      "title": "Day theme/title",
      "theme": "one word theme e.g. Arrival & Explore",
      "morning": {
        "activity": "Activity name",
        "description": "What to do and why",
        "duration": "2 hours",
        "cost": "₹500",
        "tip": "insider tip"
      },
      "afternoon": {
        "activity": "Activity name",
        "description": "What to do and why",
        "duration": "3 hours",
        "cost": "₹800",
        "tip": "insider tip"
      },
      "evening": {
        "activity": "Activity name",
        "description": "What to do and why",
        "duration": "2 hours",
        "cost": "₹1200",
        "tip": "insider tip"
      },
      "meals": {
        "breakfast": "Restaurant or meal suggestion",
        "lunch": "Restaurant or meal suggestion",
        "dinner": "Restaurant or meal suggestion"
      },
      "transport": "How to get around today",
      "estimatedDayBudget": "₹3500"
    }
  ],
  "practicalInfo": {
    "bestTimeToVisit": "...",
    "currency": "...",
    "language": "...",
    "visaInfo": "...",
    "emergencyNumbers": "...",
    "transportTips": "...",
    "packingTips": ["tip1", "tip2", "tip3"]
  },
  "estimatedTotalBudget": {
    "flights": "₹XX,XXX",
    "accommodation": "₹XX,XXX",
    "food": "₹XX,XXX",
    "activities": "₹XX,XXX",
    "transport": "₹XX,XXX",
    "total": "₹XX,XXX"
  },
  "warnings": ["any visa warnings", "health advisories", "safety notes"]
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) throw new Error('Failed to generate itinerary')
  const data = await response.json()
  const text = data.content?.map(b => b.text || '').join('') || ''

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

/**
 * Get visa requirements for a route
 * @param {string} nationality - e.g. "Indian"
 * @param {string} destination - e.g. "Thailand"
 */
export async function getVisaInfo(nationality, destination) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `As a travel visa expert, provide visa requirements for ${nationality} passport holders visiting ${destination}.

Respond ONLY with JSON:
{
  "required": true/false,
  "type": "visa on arrival / e-visa / visa required / visa free",
  "duration": "30 days / 90 days etc",
  "cost": "free / USD XX",
  "processingTime": "instant / 3-5 days etc",
  "documentsNeeded": ["passport", "photo", "return ticket", ...],
  "transitVisa": true/false,
  "transitVisaNote": "explanation if transit visa needed",
  "warnings": ["any important warnings"],
  "applyAt": "URL or embassy name",
  "notes": "additional important info"
}`,
      }],
    }),
  })

  const data = await response.json()
  const text = data.content?.map(b => b.text || '').join('') || '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

/**
 * Parse natural language travel intent into structured search params
 * e.g. "Delhi to Bangkok next Friday under 20000" → { origin, destination, date, budget, ... }
 */
export async function parseFlightIntent(userMessage) {
  const today = new Date().toISOString().split('T')[0]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Parse this travel request into structured data.

User said: "${userMessage}"

Respond ONLY with JSON (no markdown):
{
  "type": "flight_search | itinerary | visa_query | booking_help | other",
  "origin": "city name or null",
  "originIATA": "IATA code or null",
  "destination": "city name or null", 
  "destinationIATA": "IATA code or null",
  "departDate": "YYYY-MM-DD or null",
  "returnDate": "YYYY-MM-DD or null",
  "adults": 1,
  "cabinClass": "ECONOMY | BUSINESS | FIRST | null",
  "budget": number or null,
  "tripDays": number or null,
  "interests": [],
  "isRoundTrip": false,
  "confidence": 0.0-1.0,
  "missingInfo": ["what info is still needed"]
}`,
      }],
    }),
  })

  const data = await response.json()
  const text = data.content?.map(b => b.text || '').join('') || '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { type: 'other', confidence: 0, missingInfo: ['Could not parse request'] }
  }
}
