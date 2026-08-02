# 🚀 Server - Airline Booking API

The backend of the Quencer Airlines booking platform, built with **Node.js** and **Express.js**. This server handles AI-simulated flight search, Stripe-backed bookings, e-ticket PDF generation, and email confirmations.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [PDF Generation](#pdf-generation)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Testing PDF Generation](#testing-pdf-generation)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Tech Stack

### Core

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for API creation
- **Resend** – HTTPS email API for booking confirmations (no SMTP port - reliable on Render's free tier / serverless)
- **Prisma** – ORM for database management (MongoDB)
- **Stripe** – Payments (test mode); the webhook, not the client, confirms a booking
- **Dotenv** – Environment variable management

### PDF Generation

- **Puppeteer** – full-Chromium HTML-to-PDF rendering, with a QR code embedded via `qrcode`

### Security

- **Helmet** – security response headers
- **express-rate-limit** – rate limiting on `/api/flights` and `/api/bookings`
- **Zod** – server-side request validation (mirrors the client's schemas)
- **CORS** – origin allowlist driven by `ALLOWED_ORIGINS`
- **HMAC offer signing** – AI-generated flight prices are signed on the way out and re-verified on booking, so a client can't tamper with the amount charged

### Other

- **Body-parser** – Parse incoming request bodies

---

## 📄 PDF Generation

Render (our deployment target) is a **persistent container**, not a serverless function — `apt.txt` already installs the Chromium system libraries Puppeteer needs there. So the server standardizes on full `puppeteer` everywhere (local dev and deployed), rather than juggling a serverless-specific Chromium package with environment-specific branching.

`server/utils/pdfHelper.js` launches a single headless Chromium instance **once** and reuses it for every request (`browser.newPage()` per PDF, closing only the page afterwards) instead of paying a multi-second browser-launch cost on every ticket. The browser is closed gracefully on `SIGTERM`/`SIGINT` (see `server.js`).

The ticket template (`server/constants/ticketTemplate.js`) renders a QR code, PNR, persisted seat numbers/ticket number, terminal/boarding zone, fare basis, and terms — the ticket number and seat numbers are generated **once**, at Stripe webhook confirmation time, and persisted on the `Booking` record so the PDF, the confirmation email, and any later `GET /api/bookings/:reference` lookup always agree.

Each flight is rendered as its own multi-segment itinerary rather than a flat origin→destination row: every leg (including layovers) gets its own timeline entry with departure/arrival times and airports, with a distinct callout between legs (e.g. *"Change planes in Chicago (ORD) — 1h 30m layover"*). This depends on the AI flight-search prompt (`flights.controller.js`) generating `arrivalTime`/`departureTime` per layover, not just a duration.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or Yarn
- MongoDB (Atlas or self-hosted) — the connection string must include a database name, e.g. `.../airline_app?retryWrites=true`
- A [Resend](https://resend.com) account (free tier is fine)
- A [Stripe](https://dashboard.stripe.com/register) account (test mode is fine)

### Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/jeslor/airline_app.git
cd airline_app/server

# Install dependencies - this also runs `prisma generate` automatically
# (postinstall hook) and downloads Puppeteer's bundled Chromium
npm install

# Copy the env template and fill in real values (see Environment Variables below)
cp server.env.example server.env

# Push the Prisma schema to your database
npx prisma db push

# (optional) seed a handful of demo bookings
npm run seed

# Start the server
npm start
```

---

## 🔐 Environment Variables

Copy `server.env.example` to `server.env` in the root of the `/server` folder and fill in real values:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (must include a database name in the path)
DBURL=mongodb+srv://user:password@cluster.mongodb.net/airline_app?retryWrites=true&w=majority

# Google Generative AI (for flight search)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Email (Resend - https://resend.com, HTTPS API, no SMTP port required)
RESEND_API_KEY=re_your_resend_api_key
# Must be on a domain verified in Resend (dashboard.resend.com/domains).
# Omit to use Resend's sandbox sender, which only delivers to the email
# your Resend account was signed up with.
RESEND_FROM_EMAIL=tickets@yourdomain.com

# CORS - comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:5173,https://airline-app-gamma.vercel.app

# HMAC secret used to sign AI-generated flight offers so prices can't be
# tampered with client-side before payment - any long random string
OFFER_SIGNING_SECRET=replace_with_a_long_random_string

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📡 API Endpoints

### POST `/api/flights`

Search for available flights (AI-generated). Every returned flight is HMAC-signed (`offerId`/`issuedAt`/`signature`) - this is what `/api/bookings` re-verifies before charging anything.

**Request Body:**

```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departDate": "2024-12-25",
  "returnDate": "2024-01-02"
}
```

**Response:**

```json
{
  "flights": {
    "outboundFlights": [{ "...": "signed flight offer" }],
    "returnFlights": [{ "...": "signed flight offer" }]
  }
}
```

### POST `/api/bookings`

Creates a `Booking` (`PENDING_PAYMENT`) and a Stripe PaymentIntent, sized from the *signed* offer prices — never from client-submitted totals.

**Request Body:**

```json
{
  "passenger": {
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "country": "USA"
  },
  "outboundFlight": { "...": "signed offer from /api/flights" },
  "returnFlight": { "...": "signed offer from /api/flights" },
  "bookingDate": "2024-11-25",
  "bookingTime": "14:30"
}
```

**Response:**

```json
{
  "message": "Booking created, awaiting payment",
  "data": {
    "bookingReference": "ABC123",
    "clientSecret": "pi_..._secret_...",
    "amountTotal": 93000,
    "currency": "usd"
  }
}
```

The client confirms payment client-side with Stripe Elements using `clientSecret`. Ticket issuance itself happens server-side, from the webhook below.

### GET `/api/bookings/:reference`

Look up a booking's current status - the frontend polls this right after `stripe.confirmPayment()` resolves, since the webhook (not the client) is what actually confirms the booking.

```json
{
  "data": {
    "bookingReference": "ABC123",
    "status": "CONFIRMED",
    "ticketNumber": "QA1234567890",
    "seatNumberOutbound": "14C",
    "seatNumberReturn": "22A"
  }
}
```

### POST `/api/webhooks/stripe`

Stripe webhook endpoint (raw body, signature-verified via `STRIPE_WEBHOOK_SECRET`). On `payment_intent.succeeded` it idempotently generates the ticket number/seat numbers, builds the PDF, emails it, and flips the booking to `CONFIRMED`. On `payment_intent.payment_failed` it flips the booking to `FAILED`. This is a Stripe→server callback, not something the frontend calls directly.

---

## 🌐 Deployment

### Render.com

1. Go to [Render.com](https://render.com) → New Web Service → connect this repo
2. **Root Directory**: `server`
3. **Build Command**: `npm install && npx puppeteer browsers install chrome` - `npm install` alone runs `prisma generate` automatically via its `postinstall` hook, but npm can skip re-running a dependency's own postinstall script (Puppeteer's Chrome download) if it decides the dependency tree hasn't changed - e.g. across Render's cached builds. The explicit `npx puppeteer browsers install chrome` step guarantees Chrome is actually present every build, using the cache path configured in `.puppeteerrc.cjs`.
4. **Start Command**: `npm start`
5. Environment variables (Render dashboard → Environment): all of the vars listed above, plus `NODE_ENV=production`
6. Register a webhook endpoint in the Stripe dashboard pointing at `https://<your-render-url>/api/webhooks/stripe`, and set its signing secret as `STRIPE_WEBHOOK_SECRET`
7. Push to `main` → Render auto-deploys

### Local Development

```bash
npm install
npx prisma db push
npm start           # http://localhost:3000

# in a second terminal, forward Stripe webhook events locally:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🧪 Testing PDF Generation

`npm run seed` creates a few demo `Booking` records (including `CONFIRMED` ones with seat/ticket numbers already set) so you can exercise `GET /api/bookings/:reference` and inspect the ticket data without running a full checkout. To see an actual PDF, run the full flow: search → select flights → submit passenger details → pay with a Stripe test card (`4242 4242 4242 4242`, any future expiry/CVC) → check the inbox for the passenger email (if using Resend's sandbox sender, that must be the email address your Resend account signed up with).

Unit tests for the pieces that don't need a live database or Stripe (`offerSigning`, `ticketAndBookingGenerator`) run via:

```bash
npm test
```

---

## 🐛 Troubleshooting

| Issue                        | Solution                                                   |
| ----------------------------- | ------------------------------------------------------------ |
| **CORS errors**              | Verify `ALLOWED_ORIGINS` includes the calling frontend's exact origin |
| **PDF not generating**       | Ensure Puppeteer's Chromium is installed (`npm install`); on Render, confirm `apt.txt` system deps applied |
| **Emails not sending**       | Verify `RESEND_API_KEY` is set; if you haven't verified a domain in Resend, the sandbox sender only delivers to your own Resend account email - set `RESEND_FROM_EMAIL` once a domain is verified |
| **MongoDB connection fails** | Confirm `DBURL` includes a database name and the IP is allowed in Atlas |
| **Stripe webhook 400s**      | Confirm `STRIPE_WEBHOOK_SECRET` matches the endpoint you registered (or your local `stripe listen` session) |
| **Booking stuck on PENDING_PAYMENT** | The webhook hasn't fired yet - check `stripe listen`/Stripe dashboard event logs for delivery errors |

---

## 📚 Resources

- [Stripe Docs](https://stripe.com/docs/payments/payment-intents)
- [Puppeteer Docs](https://pptr.dev/)
- [Prisma + MongoDB Docs](https://www.prisma.io/docs/orm/overview/databases/mongodb)
- [Express.js Docs](https://expressjs.com/)
- [Resend Docs](https://resend.com/docs)
- [Render.com Docs](https://render.com/docs)

---

## 📝 License

ISC License - Jeslor Ssozi

---

**Questions or Issues?** Open an issue on GitHub or check the main [README.md](../README.md)
