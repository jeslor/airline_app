import dotenv from "dotenv";
dotenv.config({ path: "./server.env" });

import { PrismaClient } from "./generated/prisma/index.js";
import {
  generateBookingReference,
  generateSeatNumbers,
  generateTicketNumber,
} from "./utils/ticketAndBookingGenerator.js";
import { signOffer } from "./utils/offerSigning.js";

const prisma = new PrismaClient();

const firstNames = ["James", "Mary", "Robert", "Patricia", "Michael"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Garcia"];
const countries = ["United States", "United Kingdom", "Canada", "Germany", "Kenya"];
const titles = ["Mr", "Ms", "Mrs", "Dr"];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function buildFlight({ origin, destination, originCode, destCode, date, price, layovers = [] }) {
  return signOffer({
    airline: "Quencer Airlines",
    flightNumber: `QF${Math.floor(1000 + Math.random() * 9000)}`,
    departureCity: origin,
    arrivalCity: destination,
    departureAirportCode: originCode,
    arrivalAirportCode: destCode,
    departureDate: date,
    arrivalDate: date,
    departureTime: "08:00 AM",
    arrivalTime: "11:30 AM",
    flightDuration: "5h 30m",
    aircraftType: "Boeing 737-800",
    price,
    layovers,
  });
}

// One leg keeps a layover so `npm run seed` demonstrates the multi-segment
// itinerary/route rendering on the ticket without needing a live AI search.
const oneStopLayover = [
  {
    city: "Chicago",
    airportCode: "ORD",
    flightNumber: "QF5678",
    arrivalTime: "10:15 AM",
    departureTime: "11:45 AM",
    duration: "1h 30m",
  },
];

function randomPrice() {
  return 200 + Math.floor(Math.random() * 800);
}

// Each entry's `legs` is an ordered list of point-to-point hops - 1 leg
// demonstrates one-way, 2 legs (reversing origin/destination) demonstrates
// round trip, 3+ legs demonstrates multi-city, matching the three trip
// types the booking flow actually supports.
const sampleBookings = [
  {
    status: "CONFIRMED",
    legs: [
      { origin: "New York", destination: "Los Angeles", originCode: "JFK", destCode: "LAX", layovers: oneStopLayover },
      { origin: "Los Angeles", destination: "New York", originCode: "LAX", destCode: "JFK" },
    ],
  },
  {
    status: "CONFIRMED",
    legs: [{ origin: "London", destination: "Dubai", originCode: "LHR", destCode: "DXB" }],
  },
  {
    status: "CONFIRMED",
    legs: [
      { origin: "Paris", destination: "Tokyo", originCode: "CDG", destCode: "NRT" },
      { origin: "Tokyo", destination: "Sydney", originCode: "NRT", destCode: "SYD" },
      { origin: "Sydney", destination: "Singapore", originCode: "SYD", destCode: "SIN" },
    ],
  },
  {
    status: "PENDING_PAYMENT",
    legs: [
      { origin: "Toronto", destination: "Madrid", originCode: "YYZ", destCode: "MAD" },
      { origin: "Madrid", destination: "Toronto", originCode: "MAD", destCode: "YYZ" },
    ],
  },
  {
    status: "FAILED",
    legs: [{ origin: "Cape Town", destination: "Nairobi", originCode: "CPT", destCode: "NBO" }],
  },
];

async function generateSeedData() {
  console.log("🌱 Seeding demo bookings...");

  await prisma.booking.deleteMany();

  const dates = ["January 15, 2026", "January 18, 2026", "January 22, 2026", "January 25, 2026"];

  for (const sample of sampleBookings) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const isConfirmed = sample.status === "CONFIRMED";

    const flights = sample.legs.map((leg, i) =>
      buildFlight({
        origin: leg.origin,
        destination: leg.destination,
        originCode: leg.originCode,
        destCode: leg.destCode,
        date: dates[i] || dates[dates.length - 1],
        price: randomPrice(),
        layovers: leg.layovers || [],
      })
    );

    await prisma.booking.create({
      data: {
        bookingReference: generateBookingReference(),
        status: sample.status,
        passenger: {
          title: getRandomElement(titles),
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          country: getRandomElement(countries),
          phoneNumber: "+1-555-0100",
        },
        flights,
        currency: "usd",
        amountTotal: Math.round(
          flights.reduce((sum, flight) => sum + flight.price, 0) * 100
        ),
        stripePaymentIntentId: `pi_seed_${generateBookingReference().toLowerCase()}`,
        ticketNumber: isConfirmed ? generateTicketNumber("QA") : null,
        seatNumbers: isConfirmed ? flights.map(() => generateSeatNumbers()) : null,
        bookingDate: "2026-01-02",
        bookingTime: "14:30",
      },
    });
  }

  const totalBookings = await prisma.booking.count();
  console.log(`✅ Seeded ${totalBookings} demo bookings (one-way, round trip, and multi-city examples).`);
}

generateSeedData()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("💥 Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
