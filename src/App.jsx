import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/layout/navbar.jsx'

// Auth & Errors
import { AuthProvider } from './context/AuthContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Phase 1
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import BookingPage from './pages/BookingPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import CorporatePage from './pages/CorporatePage'
import ItineraryPage from './pages/ItineraryPage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import CompleteProfile from './pages/CompleteProfile'
import ReviewTripPage from './pages/ReviewTripPage'

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
import StaffPage from './pages/StaffPage'
import StaffLoginPage from './pages/StaffLoginPage'

// Phase 4
import HotelSearch from './pages/HotelSearch'
import TrainSearch from './pages/TrainSearch'
import BusSearch from './pages/BusSearch'
import TripBuilder from './pages/TripBuilder'
import PassengerDetailsPage from './pages/PassengerDetailsPage'
import AgentTripsPage from './pages/AgentTripsPage'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="grain min-h-screen bg-surface-light font-body">
          <Navbar />
          <AnimatePresence mode="wait">
            <ErrorBoundary showDetail={true}>
              <Routes>
                {/* Phase 1 */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/flights" element={<SearchPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/corporate" element={<CorporatePage />} />
                <Route path="/itinerary" element={<ItineraryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/staff-login" element={<StaffLoginPage />} />

                {/* Phase 2 */}
                <Route
                  path="/post-booking"
                  element={
                    <ProtectedRoute>
                      <PostBookingHub />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-booking/checkin"
                  element={
                    <ProtectedRoute>
                      <CheckInPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-booking/addons"
                  element={
                    <ProtectedRoute>
                      <AddonsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-booking/change"
                  element={
                    <ProtectedRoute>
                      <ChangeFlight />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-booking/status"
                  element={
                    <ProtectedRoute>
                      <FlightStatusPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/trips"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <AgentTripsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Phase 3 */}
                <Route
                  path="/finance"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <FinanceDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/invoices"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <InvoiceManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/billing"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <BillingManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/refunds"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <RefundProcessing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/corporate"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <CorporateStatements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance/notifications"
                  element={
                    <ProtectedRoute requiredRole="agent" loginPath="/login?tab=agency">
                      <AdminNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* Phase 4 */}
                <Route path="/hotels" element={<HotelSearch />} />
                <Route path="/trains" element={<TrainSearch />} />
                <Route path="/buses" element={<BusSearch />} />
                <Route path="/trip-builder" element={<ProtectedRoute><TripBuilder /></ProtectedRoute>} />
                <Route path="/passenger-details" element={<PassengerDetailsPage />} />
                <Route path="/review-trip" element={<ReviewTripPage />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
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
    </AuthProvider>
  )
}