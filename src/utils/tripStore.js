// Shared trip registry — all customer-built trips land here
// Agent dashboard reads from this

const STORE_KEY = 'voyageai_all_trips'

export function saveTrip(trip, user) {
  const all = getAllTrips()
  const entry = {
    id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    savedAt: new Date().toISOString(),
    customer: {
      id: user?.id || 'guest',
      name: user?.name || 'Guest',
      email: user?.email || 'unknown@guest.com',
      role: user?.role || 'user',
    },
    trip: {
      name: trip.tripName || trip.name || 'Untitled Trip',
      desc: trip.desc || '',
      duration: trip.duration || '',
      isAI: trip.isAI || false,
      totalCost: calculateTotal(trip),
      passengers: trip.passengers || 1,
      segments: trip.segments || [],
      highlights: trip.highlights || [],
      placesToVisit: trip.placesToVisit || [],
      costComparison: trip.costComparison || null,
    },
    status: 'pending', // pending | reviewed | booked | cancelled
    agentNotes: '',
  }

  all.push(entry)
  localStorage.setItem(STORE_KEY, JSON.stringify(all))
  return entry
}

export function getAllTrips() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]')
  } catch {
    return []
  }
}

export function updateTripStatus(tripId, status, agentNotes = '') {
  const all = getAllTrips()
  const updated = all.map(t =>
    t.id === tripId ? { ...t, status, agentNotes } : t
  )
  localStorage.setItem(STORE_KEY, JSON.stringify(updated))
}

export function deleteTrip(tripId) {
  const all = getAllTrips().filter(t => t.id !== tripId)
  localStorage.setItem(STORE_KEY, JSON.stringify(all))
}

function calculateTotal(trip) {
  const transport = (trip.segments || [])
    .filter(s => ['flight','train','bus','roadways'].includes(s.type))
    .reduce((sum, s) => sum + (s.price || 0), 0)
  const stays = (trip.segments || [])
    .filter(s => s.type === 'hotel')
    .reduce((sum, s) => sum + (s.price || 0), 0)
  const sights = (trip.placesToVisit || [])
    .reduce((sum, p) => sum + (Number(p.price) || 0), 0)
  const days = parseInt(trip.duration) || 5
  return transport + stays + sights + (days * 1200)
}

export function getTripById(tripId) {
  return getAllTrips().find(t => t.id === tripId) || null
}