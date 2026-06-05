/**
 * Amadeus Flight Search API Service
 * Docs: https://developers.amadeus.com/self-service/category/flights
 *
 * Setup:
 *  1. Register free at https://developers.amadeus.com
 *  2. Create an app → get Client ID + Client Secret
 *  3. Add to your .env file
 */

const AMADEUS_BASE = 'https://test.api.amadeus.com'

// Cache the token so we don't re-fetch on every search
let _token = null
let _tokenExpiry = 0

async function getAmadeusToken() {
  if (_token && Date.now() < _tokenExpiry) return _token

  const clientId = import.meta.env.VITE_AMADEUS_CLIENT_ID
  const clientSecret = import.meta.env.VITE_AMADEUS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured. See .env.example')
  }

  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error('Failed to authenticate with Amadeus API')
  const data = await res.json()
  _token = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _token
}

/**
 * Search one-way flights
 * @param {Object} params
 * @param {string} params.origin       - IATA code e.g. "DEL"
 * @param {string} params.destination  - IATA code e.g. "BOM"
 * @param {string} params.date         - "YYYY-MM-DD"
 * @param {number} params.adults       - number of adult passengers (default 1)
 * @param {string} params.cabinClass   - ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST
 * @param {number} params.maxResults   - max results to return (default 10)
 */
export async function searchFlights({
  origin,
  destination,
  date,
  adults = 1,
  cabinClass = 'ECONOMY',
  maxResults = 10,
}) {
  const token = await getAmadeusToken()

  const params = new URLSearchParams({
    originLocationCode: origin.toUpperCase(),
    destinationLocationCode: destination.toUpperCase(),
    departureDate: date,
    adults: adults.toString(),
    travelClass: cabinClass.toUpperCase(),
    max: maxResults.toString(),
    currencyCode: 'INR',
  })

  const res = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.errors?.[0]?.detail || 'Flight search failed')
  }

  const data = await res.json()
  return transformAmadeusResults(data)
}

/**
 * Search round-trip flights
 */
export async function searchRoundTrip({
  origin,
  destination,
  departDate,
  returnDate,
  adults = 1,
  cabinClass = 'ECONOMY',
  maxResults = 10,
}) {
  const token = await getAmadeusToken()

  const params = new URLSearchParams({
    originLocationCode: origin.toUpperCase(),
    destinationLocationCode: destination.toUpperCase(),
    departureDate: departDate,
    returnDate: returnDate,
    adults: adults.toString(),
    travelClass: cabinClass.toUpperCase(),
    max: maxResults.toString(),
    currencyCode: 'INR',
  })

  const res = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('Round-trip search failed')
  const data = await res.json()
  return transformAmadeusResults(data)
}

/**
 * Get cheapest dates for a route (calendar view)
 */
export async function getCheapestDates({ origin, destination }) {
  const token = await getAmadeusToken()

  const params = new URLSearchParams({
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    oneWay: 'true',
    duration: '1',
    nonStop: 'false',
    viewBy: 'DATE',
    currencyCode: 'INR',
  })

  const res = await fetch(`${AMADEUS_BASE}/v1/shopping/flight-dates?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('Failed to fetch cheapest dates')
  const data = await res.json()
  return data.data || []
}

/**
 * Get airport IATA code by city name
 */
export async function searchAirports(keyword) {
  const token = await getAmadeusToken()

  const params = new URLSearchParams({
    keyword,
    subType: 'AIRPORT,CITY',
    'page[limit]': '6',
  })

  const res = await fetch(`${AMADEUS_BASE}/v1/reference-data/locations?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return []
  const data = await res.json()
  return (data.data || []).map(loc => ({
    iata: loc.iataCode,
    name: loc.name,
    city: loc.address?.cityName,
    country: loc.address?.countryName,
    label: `${loc.address?.cityName} (${loc.iataCode}) — ${loc.name}`,
  }))
}

// ── Transform Amadeus raw data to our app format ───────────────────────────────
function transformAmadeusResults(data) {
  const offers = data?.data || []
  const dictionaries = data?.dictionaries || {}

  return offers.map((offer, index) => {
    const itinerary = offer.itineraries?.[0]
    const firstSeg = itinerary?.segments?.[0]
    const lastSeg = itinerary?.segments?.[itinerary.segments.length - 1]
    const price = offer.price?.grandTotal
    const stops = itinerary?.segments?.length - 1

    const airlineCode = firstSeg?.carrierCode
    const airlineName = dictionaries?.carriers?.[airlineCode] || airlineCode

    const depTime = firstSeg?.departure?.at?.slice(11, 16)
    const arrTime = lastSeg?.arrival?.at?.slice(11, 16)
    const duration = formatDuration(itinerary?.duration)

    return {
      id: offer.id || index,
      airline: airlineName,
      code: `${airlineCode} ${firstSeg?.number}`,
      logo: getAirlineEmoji(airlineCode),
      from: firstSeg?.departure?.iataCode,
      fromCity: firstSeg?.departure?.iataCode,
      to: lastSeg?.arrival?.iataCode,
      toCity: lastSeg?.arrival?.iataCode,
      depart: depTime,
      arrive: arrTime,
      duration,
      stops,
      price: Math.round(parseFloat(price)),
      class: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      seats: offer.numberOfBookableSeats,
      recommended: index === 0,
      amenities: extractAmenities(offer),
      rawOffer: offer, // Keep raw data for booking
    }
  })
}

function formatDuration(iso) {
  if (!iso) return '—'
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  const h = match?.[1] || '0'
  const m = match?.[2] || '0'
  return `${h}h ${m}m`
}

function getAirlineEmoji(code) {
  const map = {
    AI: '🔴', '6E': '🔵', UK: '🟣', SG: '🟠',
    EK: '🟥', SQ: '🟡', BA: '🔷', LH: '🟦',
    QR: '🟤', EY: '⬜', IX: '🟢',
  }
  return map[code] || '✈️'
}

function extractAmenities(offer) {
  const amenities = []
  const services = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.additionalServices
  if (services?.chargeableSeatNumber) amenities.push('Seat selection')
  const bags = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags
  if (bags?.weight) amenities.push(`${bags.weight}kg baggage`)
  return amenities.length ? amenities : ['Standard fare']
}
