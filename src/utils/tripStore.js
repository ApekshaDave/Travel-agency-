import { supabase, hasSupabase } from './supabaseClient'

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
      restaurants: trip.restaurants || null,
      itineraryDays: trip.itineraryDays || []
    },
    status: 'pending', // pending | reviewed | booked | cancelled
    agentNotes: '',
  }

  all.push(entry)
  localStorage.setItem(STORE_KEY, JSON.stringify(all))

  // Sync to Supabase PostgreSQL in background
  if (hasSupabase && supabase) {
    supabase.from('trips').insert({
      id: entry.id,
      saved_at: entry.savedAt,
      customer_id: entry.customer.id,
      customer_name: entry.customer.name,
      customer_email: entry.customer.email,
      trip_data: entry.trip,
      status: entry.status,
      agent_notes: entry.agentNotes
    }).then(({ error }) => {
      if (error) console.error("Supabase insert trip failed:", error)
    })
  }

  return entry
}

/**
 * Submit an existing trip to an agent for review.
 * Marks status as 'submitted' and persists both locally and in Supabase.
 *
 * @param {string} tripId - The ID of the trip to submit
 * @param {object} user   - The current user object (id, name, email)
 * @returns {object|null} The updated trip entry, or null if not found
 */
export function submitTripToAgent(tripId, user) {
  const all = getAllTrips()
  const index = all.findIndex(t => t.id === tripId)

  if (index === -1) {
    console.error(`submitTripToAgent: trip "${tripId}" not found`)
    return null
  }

  const updatedEntry = {
    ...all[index],
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    submittedBy: {
      id: user?.id || 'guest',
      name: user?.name || 'Guest',
      email: user?.email || '',
    },
  }

  all[index] = updatedEntry
  localStorage.setItem(STORE_KEY, JSON.stringify(all))

  // Sync to Supabase in background
  if (hasSupabase && supabase) {
    supabase.from('trips').update({
      status: 'submitted',
      submitted_at: updatedEntry.submittedAt,
      submitted_by_id: updatedEntry.submittedBy.id,
      submitted_by_name: updatedEntry.submittedBy.name,
      submitted_by_email: updatedEntry.submittedBy.email,
    }).eq('id', tripId).then(({ error }) => {
      if (error) console.error("Supabase submitTripToAgent failed:", error)
    })
  }

  return updatedEntry
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

  // Sync to Supabase in background
  if (hasSupabase && supabase) {
    supabase.from('trips').update({
      status,
      agent_notes: agentNotes
    }).eq('id', tripId).then(({ error }) => {
      if (error) console.error("Supabase update status failed:", error)
    })
  }
}

export function deleteTrip(tripId) {
  const all = getAllTrips().filter(t => t.id !== tripId)
  localStorage.setItem(STORE_KEY, JSON.stringify(all))

  // Sync to Supabase in background
  if (hasSupabase && supabase) {
    supabase.from('trips').delete().eq('id', tripId).then(({ error }) => {
      if (error) console.error("Supabase delete failed:", error)
    })
  }
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

export function updateTripItinerary(tripId, updatedTrip, agentName) {
  const all = getAllTrips()
  const updated = all.map(t =>
    t.id === tripId
      ? {
          ...t,
          trip: { ...t.trip, ...updatedTrip },
          status: 'reviewed',
          agentUpdatedAt: new Date().toISOString(),
          agentName: agentName || 'Agent',
          agentSentBack: true,
        }
      : t
  )
  localStorage.setItem(STORE_KEY, JSON.stringify(updated))

  // Sync to Supabase in background
  if (hasSupabase && supabase) {
    supabase.from('trips').update({
      trip_data: updatedTrip,
      status: 'reviewed',
      agent_name: agentName || 'Agent',
      agent_sent_back: true,
      agent_updated_at: new Date().toISOString()
    }).eq('id', tripId).then(({ error }) => {
      if (error) console.error("Supabase update itinerary failed:", error)
    })
  }
}

export function getCustomerTrips(userId) {
  return getAllTrips().filter(t => t.customer.id === userId).reverse()
}

// Syncs local trips state with Supabase PostgreSQL records
export async function syncTripsWithSupabase() {
  if (hasSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
      
      if (error) throw error
      
      if (data) {
        const mapped = data.map(dbTrip => ({
          id: dbTrip.id,
          savedAt: dbTrip.saved_at,
          customer: {
            id: dbTrip.customer_id,
            name: dbTrip.customer_name,
            email: dbTrip.customer_email
          },
          trip: dbTrip.trip_data,
          status: dbTrip.status,
          agentNotes: dbTrip.agent_notes,
          agentName: dbTrip.agent_name,
          agentSentBack: dbTrip.agent_sent_back,
          agentUpdatedAt: dbTrip.agent_updated_at,
          assignedAgentId: dbTrip.assigned_agent_id,
          assignedAgentName: dbTrip.assigned_agent_name,
          assignedAgentEmail: dbTrip.assigned_agent_email,
          assignedAgentPhone: dbTrip.assigned_agent_phone,
          assignedAt: dbTrip.assigned_at
        }))
        localStorage.setItem(STORE_KEY, JSON.stringify(mapped))
        return mapped
      }
    } catch (err) {
      console.error("Failed to sync trips with Supabase:", err.message)
    }
  }
  return getAllTrips()
}