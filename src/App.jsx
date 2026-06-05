import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/Navbar'

// Phase 1
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import BookingPage from './pages/BookingPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import CorporatePage from './pages/CorporatePage'
import ItineraryPage from './pages/ItineraryPage'

// Phase 2
import PostBookingHub from './pages/PostBookingHub'
import CheckInPage from './pages/CheckInPage'
import AddonsPage from './pages/AddonsPage'
import ChangeFlight from './pages/ChangeFlight'
import AgentDashboard from './pages/AgentDashboard'
import FlightStatusPage from './pages/FlightStatusPage'

// Phase 3
import FinanceDashboard from './pages/FinanceDashboard'
import InvoiceManager from './pages/InvoiceManager'
import BillingManager from './pages/BillingManager'
import RefundProcessing from './pages/RefundProcessing'
import CorporateStatements from './pages/CorporateStatements'
import AdminNotifications from './pages/AdminNotifications'

// Phase 4
import HotelSearch from './pages/HotelSearch'
import TrainSearch from './pages/TrainSearch'
import BusSearch from './pages/BusSearch'
import VisaChecker from './pages/VisaChecker'
import TripBuilder from './pages/TripBuilder'

export default function App() {
  return (
    <Router>
      <div className="grain min-h-screen bg-void font-body">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Phase 1 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/flights" element={<SearchPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/corporate" element={<CorporatePage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />

            {/* Phase 2 */}
            <Route path="/post-booking" element={<PostBookingHub />} />
            <Route path="/post-booking/checkin" element={<CheckInPage />} />
            <Route path="/post-booking/addons" element={<AddonsPage />} />
            <Route path="/post-booking/change" element={<ChangeFlight />} />
            <Route path="/post-booking/status" element={<FlightStatusPage />} />
            <Route path="/agent" element={<AgentDashboard />} />

            {/* Phase 3 */}
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/finance/invoices" element={<InvoiceManager />} />
            <Route path="/finance/billing" element={<BillingManager />} />
            <Route path="/finance/refunds" element={<RefundProcessing />} />
            <Route path="/finance/corporate" element={<CorporateStatements />} />
            <Route path="/finance/notifications" element={<AdminNotifications />} />

            {/* Phase 4 */}
            <Route path="/hotels" element={<HotelSearch />} />
            <Route path="/trains" element={<TrainSearch />} />
            <Route path="/buses" element={<BusSearch />} />
            <Route path="/visa" element={<VisaChecker />} />
            <Route path="/trip-builder" element={<TripBuilder />} />
          </Routes>
        </AnimatePresence>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161F2E',
              color: '#E8EDF5',
              border: '1px solid #1E2D42',
              fontFamily: 'DM Sans',
            },
          }}
        />
      </div>
    </Router>
  )
}
