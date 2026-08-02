# 🎨 Frontend - Quencer Airlines Client

Modern, responsive flight booking UI built with Vite, React, TypeScript, Tailwind CSS, and Stripe Elements for payment.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Styling Guide](#styling-guide)
- [Building & Deployment](#building--deployment)
- [Common Issues](#common-issues)

---

## 🛠️ Tech Stack

| Tool                       | Purpose                                      |
| --------------------------- | --------------------------------------------- |
| **Vite**                   | Build tool & dev server (HMR)                |
| **React 19**                | UI framework with hooks                      |
| **TypeScript**              | Type-safe JavaScript                         |
| **Tailwind CSS v4**         | Utility-first CSS framework                  |
| **shadcn/ui**               | Accessible React components                  |
| **React Hook Form + Zod**   | Form state management & schema validation    |
| **@stripe/react-stripe-js** | Embedded Stripe Payment Element for checkout |
| **Three.js / @react-three** | 3D globe visualization                       |
| **Framer Motion**            | Animation                                    |
| **Lottie**                  | Loading animations                           |
| **ESLint**                  | Code quality & style linting                 |

See `package.json` for exact installed versions.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or Yarn
- A running instance of the [backend](../server/README.md) (local or deployed) and its API URL
- A Stripe publishable key (test mode) - see the backend README for how to get one

### Installation

```bash
cd client
npm install
cp .env.example .env   # fill in your Stripe publishable key + backend API URL
npm run dev
```

Server runs at `http://localhost:5173` with hot module replacement (HMR).

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

### Linting

```bash
npm run lint      # Check for style/quality issues
```

---

## 📦 Environment Variables

Copy `.env.example` to `.env`:

```env
# Backend API base URL used during local development (npm run dev)
VITE_API_URL_LOCAL=http://localhost:3000/api

# Backend API base URL used in production builds
VITE_API_URL=https://your-backend-url.com/api

# Stripe (test mode) publishable key - safe to expose client-side
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Which of `VITE_API_URL`/`VITE_API_URL_LOCAL` is used is decided by `import.meta.env.DEV` (Vite's own dev-vs-build flag - see `src/lib/api.ts`), not `NODE_ENV`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── booking/
│   │   ├── BookingBubble.tsx      # Sticky "selected flights" summary bar
│   │   ├── FinalizeBooking.tsx    # Review + passenger details step
│   │   └── PaymentStep.tsx        # Stripe Elements payment step
│   ├── BookingFlights/            # Flight search results & selection
│   │   ├── availableFlights.tsx
│   │   └── flights.tsx
│   ├── Destinations/
│   │   └── Destinations.tsx
│   ├── forms/
│   │   ├── PersonalDetailsForm.tsx  # Passenger form -> creates booking -> payment step
│   │   └── SearchFlights.tsx
│   ├── Globe/                     # 3D globe & visualization (Three.js)
│   │   ├── Globe.tsx
│   │   ├── GlobeWrapper.tsx
│   │   └── SpaceCanvas.tsx
│   ├── Loading/
│   │   └── SearchingForFlights.tsx
│   ├── providers/
│   │   └── FlightProvider.tsx     # Flight/booking state (React Context + localStorage)
│   └── ui/                        # shadcn/ui components
├── schemas/                       # Zod validation schemas
│   ├── FlightBookingSchema.ts
│   └── PersonalDetailsSchema.ts
├── lib/
│   ├── api.ts                     # getApiBaseUrl() - resolves dev vs. prod API URL
│   ├── stripe.ts                  # loadStripe() singleton
│   └── utils.ts                   # cn() for Tailwind class merging
├── assets/                        # Images, animations, data
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts

public/
├── favicon.ico
└── images/

Configuration Files: vite.config.ts, tsconfig*.json, components.json, eslint.config.js
```

---

## 🎯 Key Components

### `FlightProvider.tsx`

Global state (React Context, mirrored to `localStorage`) for the booking flow: selected flights, passenger info, and booking/payment status (`bookingReference`, `clientSecret`, `paymentStatus`).

### `SearchFlights.tsx`

Search form (trip type, origin/destination, dates, passengers, cabin class) using React Hook Form + Zod, posting to `POST /api/flights`.

### `availableFlights.tsx` / `flights.tsx`

Display AI-generated search results and let the passenger pick outbound/return flights. Each flight object includes an HMAC signature (`offerId`/`issuedAt`/`signature`) from the backend, which is passed through unmodified when booking.

### `Globe.tsx` / `SpaceCanvas.tsx`

Interactive 3D globe (Three.js) shown behind the search form.

### `PersonalDetailsForm.tsx`

Collects passenger details, then calls `POST /api/bookings` to create the booking and get a Stripe `clientSecret` - it does **not** call a payment/email endpoint directly.

### `PaymentStep.tsx`

Mounts Stripe's `<Elements>`/`<PaymentElement>` with the `clientSecret` from `PersonalDetailsForm`, confirms the payment, then polls `GET /api/bookings/:reference` until the backend webhook has confirmed the booking (payment success ≠ booking confirmed - the webhook is the source of truth).

### `FinalizeBooking.tsx`

Renders the flight review + `PersonalDetailsForm` (which internally switches to `PaymentStep`, then a success modal, as the booking progresses).

---

## 🔌 API Integration

### Base URL

Resolved by `src/lib/api.ts#getApiBaseUrl()`: `VITE_API_URL_LOCAL` during `npm run dev`, `VITE_API_URL` in a production build.

### Endpoints Used

**Search flights:**

```javascript
POST /api/flights
{
  tripType: "roundTrip" | "oneWay" | "multiCity",
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string,
  passengers: number,
  cabinClass: "economy" | "premiumEconomy" | "business" | "first"
}
// -> { flights: { outboundFlights: [...], returnFlights: [...] } }
// each flight is HMAC-signed by the backend
```

**Create a booking (starts payment):**

```javascript
POST /api/bookings
{
  passenger: { title, firstName, lastName, email, country, phoneNumber },
  outboundFlight: { /* signed flight offer, unmodified from /api/flights */ },
  returnFlight: { /* signed flight offer, unmodified from /api/flights */ },
  bookingDate: string,
  bookingTime: string,
}
// -> { data: { bookingReference, clientSecret, amountTotal, currency } }
```

**Poll booking status (after Stripe payment confirms):**

```javascript
GET /api/bookings/:reference
// -> { data: { status: "PENDING_PAYMENT" | "CONFIRMED" | "FAILED", ticketNumber, seatNumberOutbound, seatNumberReturn, ... } }
```

See [server/README.md](../server/README.md) for full request/response shapes and the Stripe webhook that actually confirms bookings.

---

## 🎨 Styling Guide

### Tailwind CSS v4

Utility-first styling; Vite plugin config lives in `vite.config.ts` (via `@tailwindcss/vite`), theme tokens in `src/index.css`.

### shadcn/ui Components

Pre-built, accessible components (buttons, cards, forms, date pickers, selects) configured via `components.json`.

```bash
# Install a new shadcn/ui component
npx shadcn@latest add [component-name]
```

---

## 🚀 Build & Deployment

### Local Build

```bash
npm run build
npm run preview
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repo at [vercel.com](https://vercel.com), root directory `client`
3. Build command: `npm run build`, output directory: `dist`
4. Environment variables: `VITE_API_URL` (your deployed backend + `/api`), `VITE_STRIPE_PUBLISHABLE_KEY`
5. Deploy - automatic deployments trigger on every push to `main`

**Current:** https://airline-app-gamma.vercel.app

---

## 🐛 Common Issues

| Issue                              | Solution                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| **CORS error**                     | Backend's `ALLOWED_ORIGINS` must include this app's exact origin  |
| **API not responding**             | Check `VITE_API_URL`/`VITE_API_URL_LOCAL` matches the backend URL (must include `/api`) |
| **Payment step never appears**     | Booking creation (`POST /api/bookings`) likely failed - check the error text under the passenger form, and the backend logs |
| **Stripe Payment Element errors**  | Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set and matches the same Stripe account/mode as the backend's `STRIPE_SECRET_KEY` |
| **Tailwind classes not applying**  | Clear cache: `rm -rf .vite && npm run dev`                        |
| **TypeScript errors**              | Run `npx tsc -b` to see all type errors                            |
| **Three.js globe not rendering**   | Check `public/images/textures/earth.jpg` exists                    |

---

## 📚 Resources

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev/)
- [Stripe.js / React Stripe Docs](https://stripe.com/docs/stripe-js/react)
- [Three.js Documentation](https://threejs.org/docs/)

---

**Questions or Issues?** Open an issue on GitHub or check the main [README.md](../README.md)
