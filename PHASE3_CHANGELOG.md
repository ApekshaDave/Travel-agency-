# VoyageAI — Phase 3 Changelog

## ✅ Phase 3: Back-Office Workflow Integration

---

### New Utility

| File | Purpose |
|------|---------|
| `src/utils/billingEngine.js` | GST calculation, invoice generation, refund policy, ledger helpers, billing event triggers |

---

### New Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/finance` | FinanceDashboard | Revenue KPIs, area/bar charts, transaction ledger |
| `/finance/invoices` | InvoiceManager | Generate, preview, send, download invoices |
| `/finance/billing` | BillingManager | Automation rules, workflow runs, notification channels |
| `/finance/refunds` | RefundProcessing | AI-assessed refunds with policy-based calculations |
| `/finance/corporate` | CorporateStatements | Per-account statements, spend charts, policy compliance |
| `/finance/notifications` | AdminNotifications | All billing events, alerts, and workflow routing config |

---

### Feature Details

#### 💰 Finance Dashboard (`/finance`)
- KPI cards: Revenue, Debits, Net Position, Pending Settlement
- Revenue chart (area/bar toggle) with 6-month history — Corporate, Bookings, Add-ons
- Pie chart by revenue category
- Full transaction ledger with search, filter by category/status, export
- Quick action cards linking to all finance sub-pages

#### 🧾 Invoice Manager (`/finance/invoices`)
- List view with status filter (paid / pending / refunded)
- Full invoice preview panel with proper GST line items (CGST + SGST)
- Invoice generator modal with live GST calculation preview
- Send via email, download PDF buttons
- Supports retail and corporate invoice types

#### ⚙️ Billing Manager (`/finance/billing`)
- 7 pre-configured automation rules (toggle on/off)
- Per-rule: view actions, run manually, see execution count
- Recent workflow run log with retry-on-failure
- 4 notification channels: email, Slack, webhook (toggle to activate)
- Event subscription per channel

#### ↩️ Refund Processing (`/finance/refunds`)
- Policy-based automatic refund calculation:
  - >30 days: 100% | 7–30 days: 75% | 2–7 days: 50% | 24–48h: 25% | <24h: 0%
- AI assessment on each refund request
- Approve / reject / process bank transfer flow
- Completed refunds history tab

#### 🏢 Corporate Statements (`/finance/corporate`)
- Per-account cards with credit utilization bar, compliance score, growth %
- Account detail panel with 6-month spend bar chart
- Recent bookings per account with policy-flag status
- AI insight summary per account
- Generate & email statement one-click

#### 🔔 Admin Notifications (`/finance/notifications`)
- Full notification inbox with unread badges
- Filter by type (billing / refund / corporate / alert / booking)
- Dismiss, mark-read, mark-all-read
- 6 workflow routing rules with toggle (active/paused)
- Real-time stats: unread count, priority alerts, total today

---

### New Dependency Added
```
recharts: ^2.12.2
```
Run `npm install` after pulling Phase 3 to install recharts.

---

### Navigation Update
Navbar now uses **grouped dropdown menus**:
- **Travel** dropdown: Search, AI Assistant, Manage Trip, My Trips, Corporate
- **Back Office** dropdown: Agent Desk, Finance, Admin Alerts

---

### Phase Roadmap Status

- ✅ **Phase 1** — AI chat, flight search, booking, corporate portal
- ✅ **Phase 2** — Post-booking: check-in, add-ons, changes, status, agent desk
- ✅ **Phase 3** — Back-office: billing, invoices, refunds, corporate statements, admin alerts
- 🔜 **Phase 4** — Hotels, buses, trains, visa workflows, multi-modal booking
- 🔜 **Phase 5** — Multi-agency white-label platform
