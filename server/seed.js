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

function buildFlight({ origin, destination, originCode, destCode, date, price }) {
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
    layovers: [],
  });
}

const sampleRoutes = [
  { origin: "New York", destination: "Los Angeles", originCode: "JFK", destCode: "LAX" },
  { origin: "London", destination: "Dubai", originCode: "LHR", destCode: "DXB" },
  { origin: "Paris", destination: "Tokyo", originCode: "CDG", destCode: "NRT" },
  { origin: "Sydney", destination: "Singapore", originCode: "SYD", destCode: "SIN" },
  { origin: "Toronto", destination: "Madrid", originCode: "YYZ", destCode: "MAD" },
];

const statuses = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING_PAYMENT", "FAILED"];

async function generateSeedData() {
  console.log("🌱 Seeding demo bookings...");

  await prisma.booking.deleteMany();

  for (let i = 0; i < sampleRoutes.length; i++) {
    const route = sampleRoutes[i];
    const status = statuses[i];
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const price = 200 + Math.floor(Math.random() * 800);
    const returnPrice = 200 + Math.floor(Math.random() * 800);

    const outboundFlight = buildFlight({
      origin: route.origin,
      destination: route.destination,
      originCode: route.originCode,
      destCode: route.destCode,
      date: "January 15, 2026",
      price,
    });
    const returnFlight = buildFlight({
      origin: route.destination,
      destination: route.origin,
      originCode: route.destCode,
      destCode: route.originCode,
      date: "January 22, 2026",
      price: returnPrice,
    });

    const isConfirmed = status === "CONFIRMED";

    await prisma.booking.create({
      data: {
        bookingReference: generateBookingReference(),
        status,
        passenger: {
          title: getRandomElement(titles),
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          country: getRandomElement(countries),
          phoneNumber: "+1-555-0100",
        },
        outboundFlight,
        returnFlight,
        currency: "usd",
        amountTotal: Math.round((price + returnPrice) * 100),
        stripePaymentIntentId: `pi_seed_${generateBookingReference().toLowerCase()}`,
        ticketNumber: isConfirmed ? generateTicketNumber("QA") : null,
        seatNumberOutbound: isConfirmed ? generateSeatNumbers() : null,
        seatNumberReturn: isConfirmed ? generateSeatNumbers() : null,
        bookingDate: "2026-01-02",
        bookingTime: "14:30",
      },
    });
  }

  const totalBookings = await prisma.booking.count();
  console.log(`✅ Seeded ${totalBookings} demo bookings.`);
}

generateSeedData()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("💥 Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
