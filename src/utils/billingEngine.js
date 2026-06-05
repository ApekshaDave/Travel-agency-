/**
 * VoyageAI Billing Engine — Phase 3
 * Handles: invoice generation, payment ledger, refund processing,
 * GST calculation, billing triggers from booking events.
 */

// ── GST Rules (India) ─────────────────────────────────────────────────────────
export const GST_RATES = {
  ECONOMY_DOMESTIC: { cgst: 0.025, sgst: 0.025, total: 0.05, label: '5% GST' },
  BUSINESS_DOMESTIC: { cgst: 0.06, sgst: 0.06, total: 0.12, label: '12% GST' },
  INTERNATIONAL: { cgst: 0, sgst: 0, total: 0, label: 'Zero-rated (Export)' },
  SERVICES: { cgst: 0.09, sgst: 0.09, total: 0.18, label: '18% GST' },
  INSURANCE: { cgst: 0.09, sgst: 0.09, total: 0.18, label: '18% GST' },
}

// ── Invoice ID generator ──────────────────────────────────────────────────────
let invoiceCounter = 1001
export function generateInvoiceId() {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `INV-${yy}${mm}-${invoiceCounter++}`
}

// ── Format currency ───────────────────────────────────────────────────────────
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Calculate fare breakdown ──────────────────────────────────────────────────
export function calculateFareBreakdown(booking) {
  const {
    baseFare = 0,
    taxes = 0,
    serviceFee = 299,
    addons = [],
    isInternational = false,
    cabinClass = 'ECONOMY',
  } = booking

  const gstKey = isInternational
    ? 'INTERNATIONAL'
    : cabinClass === 'BUSINESS' || cabinClass === 'FIRST'
    ? 'BUSINESS_DOMESTIC'
    : 'ECONOMY_DOMESTIC'

  const gstRate = GST_RATES[gstKey]
  const addonTotal = addons.reduce((s, a) => s + (a.price || 0), 0)
  const addonGst = addonTotal * GST_RATES.SERVICES.total
  const serviceGst = serviceFee * GST_RATES.SERVICES.total

  const subtotal = baseFare + taxes + serviceFee + addonTotal
  const gstOnFare = baseFare * gstRate.total
  const totalGst = gstOnFare + addonGst + serviceGst
  const grandTotal = subtotal + totalGst

  return {
    baseFare,
    taxes,
    serviceFee,
    addonTotal,
    subtotal,
    gstRate,
    gstOnFare: Math.round(gstOnFare),
    addonGst: Math.round(addonGst),
    serviceGst: Math.round(serviceGst),
    totalGst: Math.round(totalGst),
    grandTotal: Math.round(grandTotal),
    addons,
  }
}

// ── Generate invoice object ───────────────────────────────────────────────────
export function generateInvoice(booking, customer, agency) {
  const breakdown = calculateFareBreakdown(booking)
  const invoiceId = generateInvoiceId()
  const now = new Date()

  return {
    id: invoiceId,
    bookingRef: booking.id || 'VAI-XXXXX',
    pnr: booking.pnr || 'N/A',
    status: 'issued',
    type: booking.isCorporate ? 'corporate' : 'retail',
    issuedAt: now.toISOString(),
    dueDate: now.toISOString(), // paid at time of booking
    customer: {
      name: customer.name || 'Traveler',
      email: customer.email || '',
      phone: customer.phone || '',
      gstin: customer.gstin || null,
      pan: customer.pan || null,
    },
    agency: {
      name: agency?.name || 'VoyageAI Travel Pvt. Ltd.',
      gstin: agency?.gstin || '27AABCV1234A1Z5',
      address: agency?.address || 'Mumbai, Maharashtra — 400001',
      pan: agency?.pan || 'AABCV1234A',
    },
    flight: {
      airline: booking.airline || '',
      flightNo: booking.flightNo || '',
      from: booking.from || '',
      to: booking.to || '',
      date: booking.date || '',
      depart: booking.depart || '',
      arrive: booking.arrive || '',
      class: booking.cabinClass || 'ECONOMY',
      pax: booking.pax || 1,
    },
    breakdown,
    paymentMethod: booking.paymentMethod || 'Credit Card',
    paymentRef: booking.paymentRef || `PAY-${Date.now()}`,
    notes: booking.notes || '',
  }
}

// ── Billing event triggers ────────────────────────────────────────────────────
export const BILLING_TRIGGERS = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  ADDON_PURCHASED: 'addon_purchased',
  FLIGHT_CHANGED: 'flight_changed',
  BOOKING_CANCELLED: 'booking_cancelled',
  REFUND_PROCESSED: 'refund_processed',
  CORPORATE_MONTHLY: 'corporate_monthly_statement',
}

export function createBillingEvent(trigger, bookingId, amount, meta = {}) {
  return {
    id: `EVT-${Date.now()}`,
    trigger,
    bookingId,
    amount,
    timestamp: new Date().toISOString(),
    status: 'processed',
    ...meta,
  }
}

// ── Refund calculator ─────────────────────────────────────────────────────────
export function calculateRefund(booking) {
  const { price, departDate, cancelledAt, addons = [] } = booking
  const now = cancelledAt ? new Date(cancelledAt) : new Date()
  const depart = new Date(departDate)
  const hoursUntilDepart = (depart - now) / (1000 * 60 * 60)

  let refundPercent = 0
  let penaltyRule = ''

  if (hoursUntilDepart >= 720) {
    refundPercent = 100
    penaltyRule = 'Full refund (>30 days before departure)'
  } else if (hoursUntilDepart >= 168) {
    refundPercent = 75
    penaltyRule = '75% refund (7–30 days before departure)'
  } else if (hoursUntilDepart >= 48) {
    refundPercent = 50
    penaltyRule = '50% refund (2–7 days before departure)'
  } else if (hoursUntilDepart >= 24) {
    refundPercent = 25
    penaltyRule = '25% refund (24–48 hours before)'
  } else {
    refundPercent = 0
    penaltyRule = 'No refund (less than 24 hours before departure)'
  }

  // Non-refundable addons
  const nonRefundableAddons = addons.filter(a => !a.refundable).reduce((s, a) => s + a.price, 0)
  const refundableAddons = addons.filter(a => a.refundable).reduce((s, a) => s + a.price, 0)

  const baseRefund = Math.round(price * refundPercent / 100)
  const processingFee = 500
  const totalRefund = Math.max(0, baseRefund + refundableAddons - processingFee)

  return {
    originalAmount: price,
    refundPercent,
    baseRefund,
    addonRefund: refundableAddons,
    processingFee,
    nonRefundableLoss: price - baseRefund + nonRefundableAddons,
    totalRefund,
    penaltyRule,
    estimatedDays: '5–7 business days',
  }
}

// ── Mock billing ledger entries ───────────────────────────────────────────────
export const MOCK_LEDGER = [
  {
    id: 'TXN-001', date: '2025-03-10', type: 'credit', category: 'booking',
    description: 'AI 619 DEL→BOM — Rajesh Kumar', amount: 5800, status: 'settled',
    bookingRef: 'VAI-A7X2K1', invoiceId: 'INV-2503-1001',
  },
  {
    id: 'TXN-002', date: '2025-03-10', type: 'credit', category: 'addon',
    description: 'Travel Insurance — Rajesh Kumar', amount: 499, status: 'settled',
    bookingRef: 'VAI-A7X2K1', invoiceId: 'INV-2503-1001',
  },
  {
    id: 'TXN-003', date: '2025-03-11', type: 'credit', category: 'booking',
    description: '6E 5317 BOM→BLR — Priya Mehta', amount: 3299, status: 'settled',
    bookingRef: 'VAI-B3M9P4', invoiceId: 'INV-2503-1002',
  },
  {
    id: 'TXN-004', date: '2025-03-12', type: 'debit', category: 'refund',
    description: 'Refund — Cancelled UK 955 DEL→CCU', amount: -4800, status: 'processing',
    bookingRef: 'VAI-C1D8F7', invoiceId: 'INV-2503-1003',
  },
  {
    id: 'TXN-005', date: '2025-03-13', type: 'credit', category: 'corporate',
    description: 'TechCorp India — Monthly Settlement Mar 2025', amount: 48200, status: 'settled',
    bookingRef: 'CORP-TECHCORP-MAR25', invoiceId: 'INV-2503-1004',
  },
  {
    id: 'TXN-006', date: '2025-03-14', type: 'credit', category: 'booking',
    description: 'EK 512 BOM→DXB — Arjun Kapoor', amount: 22400, status: 'pending',
    bookingRef: 'VAI-D2K5F8', invoiceId: 'INV-2503-1005',
  },
  {
    id: 'TXN-007', date: '2025-03-14', type: 'credit', category: 'addon',
    description: 'Business Class Upgrade — Arjun Kapoor', amount: 8500, status: 'pending',
    bookingRef: 'VAI-D2K5F8', invoiceId: 'INV-2503-1005',
  },
  {
    id: 'TXN-008', date: '2025-03-15', type: 'debit', category: 'commission',
    description: 'GDS Commission — Amadeus Q1 2025', amount: -3200, status: 'settled',
    bookingRef: 'GDS-Q1-2025', invoiceId: null,
  },
]

export function getLedgerSummary(ledger = MOCK_LEDGER) {
  const credits = ledger.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const debits = ledger.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0)
  const pending = ledger.filter(t => t.status === 'pending').reduce((s, t) => s + Math.abs(t.amount), 0)
  const settled = ledger.filter(t => t.status === 'settled').reduce((s, t) => s + (t.type === 'credit' ? t.amount : -Math.abs(t.amount)), 0)

  return { credits, debits, net: credits - debits, pending, settled }
}
