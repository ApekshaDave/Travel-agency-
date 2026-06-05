# ✈️ VoyageAI — Premium AI-First Travel Platform

VoyageAI is a premium React, Vite, and Tailwind CSS travel management system that redefines travel booking, support ticketing, and financial operations through AI integration.

---

## 🚀 Key Features

*   **AI-First Personalized Planning**: Converse with VoyageAI in natural language to discover destinations, check live flight options, draft itineraries, and query visa policies.
*   **Sequenced Multi-Modal Bookings**: Intuitive multi-step search-to-book flows for flights, hotels, trains, and buses with real-time fare breakdown calculation.
*   **State Management (Zustand)**: Persisted client-side data store for traveler details, flight selection, addons, and booking state.
*   **Escalated Support Desk (Agent Dashboard)**: Human-in-the-loop agent workspace with AI case summarizations, priority routing, and resolution tools.
*   **Financial Office (Finance Dashboard)**: Recharts-powered revenue dashboards, invoice generation engines, transaction ledgers, and automated refund eligibility calculators.

---

## 🛠️ Technology Stack

*   **Frontend Library**: React 19 (Hooks, Context, Lazy Suspense)
*   **Build Tool**: Vite 8 (Hot Module Replacement)
*   **Styling**: Tailwind CSS v3 (Curated dark mode palette & dynamic animations)
*   **State Management**: Zustand v5 (Persisted middleware)
*   **Routing**: React Router DOM v7
*   **Charts & Visualization**: Recharts v3
*   **Animations**: Framer Motion v12
*   **AI Integration**: Groq SDK (LPU ultra-fast inference)

---

## 📁 Directory Structure

```text
travel/
├── public/                # Static assets
├── src/
│   ├── assets/            # CSS styles and theme assets
│   ├── components/
│   │   ├── common/        # Shared components (ErrorBoundary, ProtectedRoute, StepProgress)
│   │   ├── features/      # Feature components (FlightCard)
│   │   └── layout/        # Navbar and Footer layouts
│   ├── context/           # React context providers (AuthContext)
│   ├── data/              # Static mocks and schemas
│   ├── pages/             # 25 core view pages (HomePage, SearchPage, FinanceDashboard, etc.)
│   ├── store/             # Zustand persistent store (bookingStore)
│   ├── utils/             # API client bindings and business engines (groq, amadeus, billingEngine)
│   ├── App.jsx            # Routing and wrapper configurations
│   ├── index.css          # Design system CSS variables and tailwind configs
│   └── main.jsx           # Entrypoint mounts
├── vite.config.js         # Vite configuration
├── package.json           # Declarative dependencies
└── tailwind.config.js     # Custom Tailwind theme extensions
```

---

## ⚙️ Setup & Installation

### Prerequisites

*   Node.js (v18.x or later)
*   npm (v9.x or later)

### Installation Steps

1.  Navigate into the `travel` directory:
    ```bash
    cd travel
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables (see below).
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Build the production bundle:
    ```bash
    npm run build
    ```

---

## 🔒 Environment Variables

Create a `.env` file in the root of the `travel` directory (duplicate `.env.example` if available) and add:

```env
# Groq API Key for AI chat & flight searches
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# Amadeus Flight Search Credentials (optional, falls back to AI model search)
VITE_AMADEUS_CLIENT_ID=your_amadeus_client_id
VITE_AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
```

---

## 🧑‍💻 Development Roles (Mock Login)

To test role-based route protection (`ProtectedRoute`), log in with the following email patterns (password can be any string of at least 6 characters):

| Role / View | Login Email Pattern | Allowed Protected Routes |
|---|---|---|
| **Traveler (User)** | `user@email.com` | `/dashboard`, `/post-booking/*` |
| **Agent Staff** | `agent@email.com` | `/agent`, `/dashboard`, `/post-booking/*` |
| **Finance Officer** | `finance@email.com` | `/finance/*`, `/dashboard`, `/post-booking/*` |
