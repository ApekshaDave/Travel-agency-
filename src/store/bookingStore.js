import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingStore = create(
  persist(
    (set) => ({
      // Selected flight from search
      selectedFlight: null,
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),

      // Search parameters (so BookingPage can show context)
      searchParams: { from: '', to: '', date: '', travelers: 1, cabinClass: 'Economy' },
      setSearchParams: (params) => set((s) => ({ searchParams: { ...s.searchParams, ...params } })),

      // Traveler details from BookingPage step 0
      travelerDetails: {
        firstName: '', lastName: '', email: '',
        phone: '', dob: '', passport: '', nationality: '',
      },
      setTravelerDetails: (details) => set((s) => ({ travelerDetails: { ...s.travelerDetails, ...details } })),

      // Add-ons from step 1
      addons: { meal: false, baggage: false, insurance: false, lounge: false },
      setAddons: (addons) => set((s) => ({ addons: { ...s.addons, ...addons } })),

      // Booking confirmation
      bookingRef: null,
      setBookingRef: (ref) => set({ bookingRef: ref }),

      // Reset entire flow
      reset: () => set({
        selectedFlight: null,
        travelerDetails: { firstName: '', lastName: '', email: '', phone: '', dob: '', passport: '', nationality: '' },
        addons: { meal: false, baggage: false, insurance: false, lounge: false },
        bookingRef: null,
      }),
    }),
    {
      name: 'voyageai-booking',
      partialize: (state) => ({
        selectedFlight: state.selectedFlight,
        searchParams: state.searchParams,
        travelerDetails: state.travelerDetails,
        addons: state.addons,
      }),
    }
  )
)
