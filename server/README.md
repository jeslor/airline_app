# 🚀 Server - Airline Booking API

The backend of the Quencer Airlines booking platform, built with **Node.js** and **Express.js**. This server handles flight bookings, e-ticket PDF generation, and email confirmations.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [PDF Generation: Puppeteer vs Playwright vs html-pdf-node](#pdf-generation-comparison)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [PDF Generation Setup](#pdf-generation-setup)
- [Deployment](#deployment)

---

## 🛠️ Tech Stack

### Core

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for API creation
- **Nodemailer** – Email service for booking confirmations
- **Prisma** – ORM for database management (MongoDB)
- **Dotenv** – Environment variable management

### PDF Generation

- **html-pdf-node** – Converts HTML to PDF (recommended)

### Other

- **CORS** – Cross-Origin Resource Sharing middleware
- **Body-parser** – Parse incoming request bodies

---

## 📄 PDF Generation: Why html-pdf-node?

### Comparison: Puppeteer vs Playwright vs html-pdf-node

| Feature                    | Puppeteer                            | Playwright                             | html-pdf-node                 |
| -------------------------- | ------------------------------------ | -------------------------------------- | ----------------------------- |
| **Browser Dependency**     | Requires Chrome/Chromium (~200MB)    | Requires Chromium/Firefox (~1GB total) | Lightweight, Node-native      |
| **Install Size**           | ~150MB with chromium                 | ~400MB+ for all browsers               | ~5MB                          |
| **Memory Usage (Runtime)** | ~50-100MB per instance               | ~50-150MB per instance                 | ~5-10MB per instance          |
| **Startup Time**           | 1-3 seconds                          | 1-3 seconds                            | <500ms                        |
| **PDF Quality**            | Excellent (full browser rendering)   | Excellent (full browser rendering)     | Very Good (wkhtmltopdf-based) |
| **Serverless Friendly**    | Difficult (large binary)             | Difficult (large binary)               | ✅ Perfect for serverless     |
| **Render.com Deployment**  | ⚠️ Requires apt.txt + postinstall    | ⚠️ Requires apt.txt + postinstall      | ✅ Works out-of-box           |
| **Complex Layouts**        | ✅ Full CSS/JS support               | ✅ Full CSS/JS support                 | Good (CSS 2.1)                |
| **Concurrent PDFs**        | Heavy (spins up browser per request) | Heavy (spins up browser per request)   | Lightweight & fast            |
| **Maintenance**            | Frequent updates                     | Frequent updates                       | Stable, minimal updates       |

### Why html-pdf-node for Quencer Airlines?

✅ **Lightweight & Serverless-Ready**: No browser binary bloat. Ideal for Render, Vercel, or AWS Lambda.

✅ **Fast & Resource-Efficient**: ~50MB vs 200-400MB. Reduced deployment size and memory footprint.

✅ **Perfect for Simple Tickets**: HTML e-tickets don't need interactive JavaScript. Simple CSS/HTML renders beautifully.

✅ **Concurrent PDF Generation**: Spin up multiple PDFs without launching separate browser processes.

✅ **Production-Ready for Scale**: Lower infrastructure costs on Render or cloud platforms.

⚠️ **Trade-off**: No JavaScript execution or dynamic rendering. For static tickets, this is not an issue.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or Yarn
- MongoDB (or managed service)
- Email provider (Gmail, SendGrid, etc.)

### Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/jeslor/airline_app.git
cd airline_app/server

# Install dependencies
npm install

# Create a .env file (copy from .env.example or see Environment Variables below)
cp server.env.example server.env

# Install Playwright browsers (for development/testing if you switch later)
npm run postinstall

# Start the server
npm start
```

---

## 🔐 Environment Variables

Create a `server.env` file in the root of the `/server` folder:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DBURL=mongodb+srv://user:password@cluster.mongodb.net/airline_app

# Google Generative AI (for flight search)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://airline-app-gamma.vercel.app

# PDF Generation
PDF_MARGIN_TOP=10
PDF_MARGIN_BOTTOM=10
PDF_MARGIN_LEFT=10
PDF_MARGIN_RIGHT=10
```

---

## 📡 API Endpoints

### POST `/api/flights`

Search for available flights.

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
    "outboundFlights": [...],
    "returnFlights": [...]
  }
}
```

### POST `/api/book`

Book a flight and generate an e-ticket.

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
  "outboundFlight": {
    /* flight details */
  },
  "returnFlight": {
    /* flight details */
  },
  "bookingDate": "2024-11-25",
  "bookingTime": "14:30",
  "totalPrice": "$450.00"
}
```

**Response:**

```json
{
  "message": "Email with Ticket sent successfully!",
  "status": 200,
  "data": {
    "bookingReference": "ABC123XYZ",
    "bookingStatus": "confirmed",
    "passenger": {
      /* passenger details */
    }
  }
}
```

---

## 📄 PDF Generation Setup

### Using html-pdf-node (Recommended)

#### 1. Install html-pdf-node

```bash
npm install html-pdf-node
```

#### 2. Update `server/controllers/flights.controller.js`

Replace the Playwright/Puppeteer logic with html-pdf-node:

```javascript
import htmlPdf from "html-pdf-node";

const createPDF = async (
  passenger,
  outboundFlight,
  returnFlight,
  currentPrice,
  bookingReference,
  bookingDate,
  bookingTime
) => {
  try {
    // Generate HTML from template
    const ticketHtml = TicketDetailsTemplate(
      passenger,
      outboundFlight,
      returnFlight,
      currentPrice,
      bookingReference,
      bookingDate,
      bookingTime
    );

    // Define PDF options
    const options = {
      format: "A4",
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
      printBackground: true,
      preferCSSPageSize: true,
    };

    // Generate PDF buffer
    const ticketPdfBuffer = await htmlPdf.generatePdf(
      { content: ticketHtml },
      options
    );

    return ticketPdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Error generating flight ticket PDF: " + error.message);
  }
};
```

#### 3. Remove Old Dependencies

If switching from Playwright/Puppeteer:

```bash
npm uninstall playwright puppeteer @sparticuz/chromium
```

#### 4. Update `package.json`

Remove or update the postinstall script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

---

## 🌐 Deployment

### Render.com (Recommended for html-pdf-node)

#### 1. Connect your repository

- Go to [Render.com](https://render.com)
- Create a new Web Service
- Connect your GitHub repository

#### 2. Configure Service Settings

- **Name**: `airline-api`
- **Root Directory**: `server` (if using monorepo)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 3. Add Environment Variables

In Render dashboard → Environment:

```
PORT=3000
NODE_ENV=production
DBURL=<your_mongodb_connection_string>
GOOGLE_GENERATIVE_AI_API_KEY=<your_key>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<your_email>
EMAIL_PASS=<your_app_password>
ALLOWED_ORIGINS=https://airline-app-gamma.vercel.app
```

#### 4. Deploy

- Push to main branch
- Render automatically builds and deploys

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Server will run on http://localhost:3000
```

---

## 🧪 Testing PDF Generation

### Test Endpoint (Optional)

Add this endpoint to `server/server.js` for testing:

```javascript
app.get(
  "/api/test-pdf",
  asyncWrapper(async (req, res) => {
    const testHtml = `
    <h1>Test PDF</h1>
    <p>If you see this, PDF generation is working!</p>
    <p>Generated at: ${new Date().toISOString()}</p>
  `;

    try {
      const pdfBuffer = await createPDF(testHtml);
      res.contentType("application/pdf");
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);
```

Test with:

```bash
curl http://localhost:3000/api/test-pdf -o test.pdf
```

---

## 📊 Performance Comparison

### Deployment Size

- **Puppeteer**: ~200MB (+ chromium)
- **Playwright**: ~400MB (+ browsers)
- **html-pdf-node**: ~5MB ✅

### Startup Time

- **Puppeteer**: 1-3 seconds
- **Playwright**: 1-3 seconds
- **html-pdf-node**: <500ms ✅

### Memory Per PDF

- **Puppeteer**: 50-100MB
- **Playwright**: 50-150MB
- **html-pdf-node**: 5-10MB ✅

---

## 🐛 Troubleshooting

### HTML to PDF Not Generating?

Ensure your HTML template is simple and CSS-compatible:

- Use inline styles or `<style>` tags
- Avoid JavaScript execution
- Test with basic HTML first

### Email Not Sending?

- Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- Use Gmail App Password (not account password)
- Check firewall/port 587 is open

### Render Deployment Fails?

- Check build logs in Render dashboard
- Ensure `server/package.json` exists
- Verify environment variables are set

---

## 📚 Resources

- [html-pdf-node Docs](https://www.npmjs.com/package/html-pdf-node)
- [Express.js Docs](https://expressjs.com/)
- [Nodemailer Docs](https://nodemailer.com/)
- [Render.com Docs](https://render.com/docs)

---

## 📝 License

ISC License - Jeslor Ssozi

---

**Questions or Issues?** Open an issue on GitHub or check the main [README.md](../README.md)
