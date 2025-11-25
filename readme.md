# ✈️ Quencer Airlines Booking Platform

![UI](./image/airline.jpg)

## ✨ Project Overview

**Quencer Airlines** is a full-stack, production-ready flight booking platform featuring a modern, responsive frontend and a robust backend for seamless flight reservations and automated e-ticket generation.

- **Frontend:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui - deployed on **Vercel**
- **Backend:** Node.js + Express.js + MongoDB + Prisma - deployed on **Render**
- **Features:** AI-powered flight search (Google Generative AI), dynamic PDF e-ticket generation (html-pdf-node), automated email confirmations, and real-time booking management

**Live URLs:**
- Frontend: https://airline-app-gamma.vercel.app
- Backend API: https://airline-app-i8q8.onrender.com

---

## 🚀 Key Features

✅ **Modern Flight Search** - AI-powered flight discovery with dynamic pricing  
✅ **Secure Booking** - Complete validation and error handling  
✅ **PDF E-Tickets** - Lightweight, serverless-friendly html-pdf-node generation  
✅ **Email Confirmations** - Automated booking confirmations with attached tickets  
✅ **Responsive UI** - Mobile-first design with Tailwind CSS  
✅ **Real-time Validation** - React Hook Form + Zod schema validation  
✅ **Global Destination Map** - Interactive 3D globe with flight visualization  
✅ **Production Deployment** - Optimized for Vercel (frontend) & Render (backend)

---

## 🛠️ Tech Stack

### Frontend (`/client`)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Build Tool** | Vite | Lightning-fast HMR & ESM-native bundling |
| **Framework** | React 18 | Component-based UI with hooks |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Accessible, composable components |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **HTTP Client** | Fetch API | Built-in browser API for API calls |
| **State** | React Context API | Flight booking context provider |
| **3D Graphics** | Three.js | Interactive globe visualization |
| **Animation** | Lottie | Smooth loading & interactive animations |
| **Hosting** | Vercel | Auto-deployments from Git |

### Backend (`/server`)
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js | JavaScript server environment |
| **Framework** | Express.js | Lightweight, fast web framework |
| **Language** | JavaScript (ES6+) | Modern async/await patterns |
| **Database** | MongoDB | NoSQL document storage |
| **ORM** | Prisma | Type-safe database queries |
| **PDF Generation** | html-pdf-node | Serverless-friendly PDF creation |
| **Email** | Nodemailer | SMTP email delivery |
| **AI** | Google Generative AI | Dynamic flight data generation |
| **Auth** | Environment-based CORS | Request origin validation |
| **Middleware** | CORS, Body-parser | Request handling & security |
| **Hosting** | Render | Container-based deployment |

---

## 📁 Project Structure

```
airline_app/
├── client/                  # Frontend - React Vite app
│   ├── src/
│   │   ├── components/      # React components (Forms, Globe, Booking, etc.)
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── assets/          # Images, animations, data files
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript config
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── package.json
│
├── server/                  # Backend - Node.js Express app
│   ├── src/ (or root)
│   │   ├── controllers/     # Business logic (flights.controller.js)
│   │   ├── routes/          # API routes (flights.routes.js)
│   │   ├── utils/           # Helper functions
│   │   ├── constants/       # Email templates, configs
│   │   ├── configs/         # Google AI service setup
│   │   └── server.js        # Express server
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── server.env           # Environment variables
│   ├── package.json
│   └── README.md            # Server-specific docs
│
├── image/                   # Shared assets
│   └── airline.jpg
└── README.md               # This file
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v16+ (v18+ recommended)
- **npm** or **Yarn**
- **Git**
- **MongoDB** connection string (MongoDB Atlas or local)
- **Google API Key** for Generative AI
- **Email credentials** (SMTP server details)

### Quick Setup

#### 1. Clone Repository
```bash
git clone https://github.com/jeslor/airline_app.git
cd airline_app
```

#### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

#### 3. Setup Backend
```bash
cd ../server
npm install
cp server.env.example server.env  # Add your credentials
npm start
```
Backend runs at `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (server/.env or server.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DBURL=mongodb+srv://username:password@cluster.mongodb.net/airline_app

# Google Generative AI (for flight search)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key_here

# Email Configuration
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password

# CORS - Frontend origins allowed
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-url.com

# PDF Generation (optional - html-pdf-node defaults)
PDF_MARGIN_TOP=10
PDF_MARGIN_BOTTOM=10
PDF_MARGIN_LEFT=10
PDF_MARGIN_RIGHT=10
```

### Frontend (.env or .env.local in client/)

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Set environment variables:
   - `VITE_API_BASE_URL=https://airline-app-i8q8.onrender.com`
4. Auto-deploy on every push to `main`

**Current:** https://airline-app-gamma.vercel.app

### Backend → Render

1. Create Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Set root directory to `server`
4. Set environment variables (see .env above)
5. Deploy command: `npm install && npm start`

**Current:** https://airline-app-i8q8.onrender.com

---

## 📡 API Endpoints

### Flight Search
**POST** `/api/flights`
```json
{
  "origin": "JFK",
  "destination": "LAX",
  "departDate": "2024-12-25",
  "returnDate": "2025-01-02"
}
```

### Book Flight
**POST** `/api/book`
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
  "outboundFlight": { /* flight object */ },
  "returnFlight": { /* flight object */ },
  "bookingDate": "2024-11-25",
  "bookingTime": "14:30",
  "totalPrice": "$450.00"
}
```

Response:
```json
{
  "message": "Email with Ticket sent successfully!",
  "status": 200,
  "data": {
    "bookingReference": "ABC123XYZ",
    "bookingStatus": "confirmed"
  }
}
```

---

## 📚 Documentation

- **[Server Documentation](./server/README.md)** - Backend setup, API details, PDF generation, deployment
- **[Client Documentation](./client/README.md)** - Frontend setup, component structure, styling

---

## 🔧 Development

### Frontend Development
```bash
cd client
npm run dev        # Start Vite dev server with HMR
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend Development
```bash
cd server
npm start          # Start Express server
```

### Running Both Together
```bash
# Terminal 1 - Frontend
cd client && npm run dev

# Terminal 2 - Backend
cd server && npm start
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS errors** | Verify `ALLOWED_ORIGINS` env var includes frontend URL |
| **PDF not generating** | Check html-pdf-node is installed: `npm list html-pdf-node` |
| **Emails not sending** | Verify EMAIL_* credentials and port 465 is open |
| **MongoDB connection fails** | Test connection string, ensure IP whitelist in Atlas |
| **Vite build fails** | Clear `.vite` cache: `rm -rf .vite && npm run build` |

---

## 📊 Performance

### Frontend Metrics
- Bundle size: ~150KB (gzipped)
- Lighthouse Score: 92+
- First Contentful Paint (FCP): <1.5s

### Backend Metrics
- Response time (flight search): <2s (with AI generation)
- Response time (PDF generation): <1s
- Memory usage: ~50MB at baseline

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📜 License

ISC License - Jeslor Ssozi

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/jeslor/airline_app/issues)
- Check existing documentation in `/server/README.md` and `/client/README.md`

---

**Last Updated:** November 25, 2025
