# 🎨 Frontend - Quencer Airlines Client

Modern, responsive flight booking UI built with Vite, React, TypeScript, and Tailwind CSS.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [Performance](#performance)

---

## 🛠️ Tech Stack

| Tool                | Purpose                                      | Version |
| ------------------- | -------------------------------------------- | ------- |
| **Vite**            | Build tool & dev server (lightning-fast HMR) | ^5.0    |
| **React**           | UI framework with hooks                      | ^18     |
| **TypeScript**      | Type-safe JavaScript                         | ^5.0    |
| **Tailwind CSS**    | Utility-first CSS framework                  | ^3.0    |
| **shadcn/ui**       | Accessible React components                  | Latest  |
| **React Hook Form** | Lightweight form state management            | ^7.0    |
| **Zod**             | TypeScript-first schema validation           | ^3.0    |
| **Three.js**        | 3D globe visualization                       | ^r128+  |
| **Lottie**          | Animation library                            | ^2.0    |
| **ESLint**          | Code quality & style linting                 | ^8.0    |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+ (v18+ recommended)
- npm or Yarn

### Installation

```bash
cd client
npm install
```

### Development Server

```bash
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

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── booking/            # Booking flow components
│   │   ├── BookingBubble.tsx
│   │   └── FinalizeBooking.tsx
│   ├── BookingFlights/     # Flight selection
│   │   ├── availableFlights.tsx
│   │   └── flights.tsx
│   ├── Destinations/       # Destination explorer
│   │   └── Destinations.tsx
│   ├── forms/              # Form components
│   │   ├── PersonalDetailsForm.tsx
│   │   └── SearchFlights.tsx
│   ├── Globe/              # 3D globe & visualization
│   │   ├── Globe.tsx
│   │   ├── GlobeWrapper.tsx
│   │   └── SpaceCanvas.tsx
│   ├── Loading/            # Loading states
│   │   └── SearchingForFlights.tsx
│   ├── providers/          # Context providers
│   │   └── FlightProvider.tsx
│   └── ui/                 # Reusable UI components (shadcn/ui)
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       └── select.tsx
├── schemas/                # Zod validation schemas
│   ├── FlightBookingSchema.ts
│   └── PersonalDetailsSchema.ts
├── assets/                 # Images, animations, data
│   ├── quencer_logo.png
│   ├── react.svg
│   ├── wmap.json           # World map GeoJSON
│   └── wmap.lottie         # Lottie animations
├── lib/
│   └── utils.ts            # Utility functions (cn() for Tailwind merging)
├── App.tsx                 # Main app component
├── main.tsx                # React DOM render entry
├── index.css               # Global styles
└── vite-env.d.ts          # Vite environment types

public/
├── favicon.ico
└── images/
    ├── quencer_logo.webp
    └── textures/
        └── earth.jpg       # Earth texture for 3D globe

Configuration Files:
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # TypeScript app config
├── tsconfig.node.json      # TypeScript Node config
├── tailwind.config.js      # Tailwind CSS configuration
├── components.json         # shadcn/ui configuration
├── eslint.config.js        # ESLint rules
└── package.json            # Dependencies & scripts
```

---

## 🎯 Key Components

### `FlightProvider.tsx`

Global state management using React Context for flight booking data. Manages:

- Selected flights (outbound/return)
- Passenger information
- Booking status

### `SearchFlights.tsx`

Search form with date range picker and airport selection. Uses:

- React Hook Form for state management
- Zod schema for validation
- shadcn/ui form components

### `availableFlights.tsx / flights.tsx`

Display search results with flight details, pricing, and selection UI.

### `Globe.tsx / SpaceCanvas.tsx`

Interactive 3D globe using Three.js:

- Renders Earth with textures
- Shows flight routes
- Responds to mouse interaction

### `PersonalDetailsForm.tsx`

Collects passenger information with validation:

- Title, first/last name
- Email, phone number
- Country selection

### `FinalizeBooking.tsx`

Final booking review and confirmation, triggers PDF generation and email on backend.

---

## 🔌 API Integration

### Base URL

Frontend connects to backend at `VITE_API_BASE_URL` (from `.env`).

### Endpoints Used

**Search Flights:**

```javascript
POST /api/flights
{
  origin: string,
  destination: string,
  departDate: string,    // YYYY-MM-DD
  returnDate: string
}
```

**Book Flight:**

```javascript
POST /api/book
{
  passenger: { /* details */ },
  outboundFlight: { /* flight object */ },
  returnFlight: { /* flight object */ },
  bookingDate: string,
  bookingTime: string,
  totalPrice: string
}
```

---

## 📦 Environment Variables

Create `.env.local` in the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production (Vercel):

```env
VITE_API_BASE_URL=https://airline-app-i8q8.onrender.com
```

---

## 🎨 Styling Guide

### Tailwind CSS

All styling uses utility classes. Custom configurations in `tailwind.config.js`:

- Custom color palette
- Extended spacing
- Custom animations

### shadcn/ui Components

Pre-built, accessible components with Tailwind styling:

- Buttons, cards, forms
- Date pickers, select menus
- Dialogs, modals

### Adding New Components

```bash
# Install new shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

---

## 🔧 Development Workflow

### Adding a New Feature

1. **Create Component**

```bash
touch src/components/MyComponent.tsx
```

2. **Define Schema** (if form)

```bash
touch src/schemas/MySchema.ts
# Add Zod schema validation
```

3. **Add to App Flow**
   Import and use in `App.tsx` or context provider.

4. **Style with Tailwind**
   Use utility classes and shadcn/ui components.

5. **Test Locally**

```bash
npm run dev
```

### TypeScript Best Practices

- Define component prop types explicitly
- Use `interface` for React component props
- Import types from `./types` if shared

---

## 🚀 Build & Deployment

### Local Build

```bash
npm run build
npm run preview
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://airline-app-i8q8.onrender.com`
6. Deploy!

**Automatic deployments** trigger on every push to `main`.

---

## 📊 Performance Tips

### Code Splitting

- Lazy load components with `React.lazy()` for routes
- Dynamic imports for large libraries

### Bundle Analysis

```bash
npm run build -- --analyze
```

### Lighthouse Checks

Run locally in Chrome DevTools or via:

```bash
npm run build && npm run preview
```

---

## 🐛 Common Issues

| Issue                             | Solution                                            |
| --------------------------------- | --------------------------------------------------- |
| **CORS error**                    | Backend `ALLOWED_ORIGINS` must include frontend URL |
| **API not responding**            | Check `VITE_API_BASE_URL` matches backend           |
| **Tailwind classes not applying** | Clear cache: `rm -rf .vite && npm run dev`          |
| **TypeScript errors**             | Run `npm run build` to catch all issues             |
| **Three.js not rendering**        | Check `public/images/textures/earth.jpg` exists     |

---

## 📚 Resources

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev/)
- [Three.js Documentation](https://threejs.org/docs/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-component`
2. Commit: `git commit -am 'Add new component'`
3. Push: `git push origin feature/new-component`
4. Open Pull Request

---

**Last Updated:** November 25, 2025
