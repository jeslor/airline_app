import { PrismaClient } from "./server/generated/prisma/index.js";
import {
  generateBookingReference,
  generateSeatNumbers,
} from "./server/utils/ticketAndBookingGenerator.js";

const prisma = new PrismaClient();

// Real airport data for realistic flights
const airports = [
  { code: "JFK", city: "New York", country: "USA" },
  { code: "LAX", city: "Los Angeles", country: "USA" },
  { code: "LHR", city: "London", country: "UK" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "NRT", city: "Tokyo", country: "Japan" },
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "HKG", city: "Hong Kong", country: "China" },
  { code: "MAD", city: "Madrid", country: "Spain" },
  { code: "FCO", city: "Rome", country: "Italy" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands" },
  { code: "ZUR", city: "Zurich", country: "Switzerland" },
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "GIG", city: "Rio de Janeiro", country: "Brazil" },
  { code: "CAI", city: "Cairo", country: "Egypt" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "ICN", city: "Seoul", country: "South Korea" },
  { code: "CPT", city: "Cape Town", country: "South Africa" },
];

const aircraftTypes = [
  "Boeing 737-800",
  "Boeing 777-300ER",
  "Boeing 787-9",
  "Airbus A320",
  "Airbus A330-300",
  "Airbus A350-900",
  "Airbus A380-800",
  "Boeing 747-8",
  "Embraer E190",
  "Boeing 767-300",
];

const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "David",
  "Elizabeth",
  "William",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Christopher",
  "Karen",
  "Charles",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Helen",
  "Mark",
  "Sandra",
  "Donald",
  "Donna",
  "Steven",
  "Carol",
  "Paul",
  "Ruth",
  "Andrew",
  "Sharon",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Laura",
  "Kevin",
  "Sarah",
  "Brian",
  "Kimberly",
  "George",
  "Deborah",
  "Timothy",
  "Dorothy",
  "Ronald",
  "Amy",
  "Jason",
  "Angela",
  "Edward",
  "Ashley",
  "Jeffrey",
  "Brenda",
  "Ryan",
  "Emma",
  "Jacob",
  "Olivia",
  "Gary",
  "Cynthia",
  "Nicholas",
  "Marie",
  "Eric",
  "Janet",
  "Jonathan",
  "Catherine",
  "Stephen",
  "Frances",
  "Larry",
  "Christine",
  "Justin",
  "Samantha",
  "Scott",
  "Debra",
  "Brandon",
  "Rachel",
  "Benjamin",
  "Carolyn",
  "Samuel",
  "Janet",
  "Gregory",
  "Virginia",
  "Alexander",
  "Maria",
  "Patrick",
  "Heather",
  "Frank",
  "Diane",
  "Raymond",
  "Julie",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
  "Long",
  "Ross",
];

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "South Africa",
  "Egypt",
  "UAE",
  "China",
  "Thailand",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "Vietnam",
  "New Zealand",
  "Sweden",
  "Norway",
  "Denmark",
  "Belgium",
  "Austria",
];

const titles = ["Mr", "Ms", "Mrs", "Dr", "Prof"];

// Utility functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function generatePhoneNumber() {
  return `+${getRandomNumber(1, 99)}-${getRandomNumber(
    100,
    999
  )}-${getRandomNumber(100, 999)}-${getRandomNumber(1000, 9999)}`;
}

function generateEmail(firstName, lastName) {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
  ];
  const domain = getRandomElement(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function generateFlightNumber() {
  return `QF${getRandomNumber(1000, 9999)}`;
}

function generatePrice(distance) {
  const basePrice = 200;
  const pricePerMile = 0.15;
  const variation = Math.random() * 0.4 + 0.8; // 80-120% variation
  return Math.round((basePrice + distance * pricePerMile) * variation);
}

// Seed data generation
async function generateSeedData() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.ticket.deleteMany();
    await prisma.passenger.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.airline.deleteMany();

    // Create Quencer Airlines
    console.log("✈️ Creating Quencer Airlines...");
    const airline = await prisma.airline.create({
      data: {
        name: "Quencer Airlines",
        code: "QF",
        description:
          "Premium international airline service with exceptional comfort and reliability",
        logoUrl:
          "https://jeslor-child-sponsor-platform-app.s3.us-east-1.amazonaws.com/airline.png",
      },
    });

    // Generate 300 flights
    console.log("🛫 Generating 300 flights...");
    const flights = [];
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-12-31");

    for (let i = 0; i < 300; i++) {
      const origin = getRandomElement(airports);
      let destination = getRandomElement(airports);

      // Ensure origin and destination are different
      while (destination.code === origin.code) {
        destination = getRandomElement(airports);
      }

      const departureDateTime = getRandomDate(startDate, endDate);
      const flightDuration = getRandomNumber(2, 16); // 2-16 hours
      const arrivalDateTime = addHours(departureDateTime, flightDuration);

      const flight = await prisma.flight.create({
        data: {
          flightNumber: generateFlightNumber(),
          departure: departureDateTime,
          arrival: arrivalDateTime,
          origin: `${origin.city} (${origin.code})`,
          destination: `${destination.city} (${destination.code})`,
          airlineId: airline.id,
        },
      });

      flights.push({
        ...flight,
        originCode: origin.code,
        destinationCode: destination.code,
        originCity: origin.city,
        destinationCity: destination.city,
        aircraftType: getRandomElement(aircraftTypes),
        duration: flightDuration,
      });

      if ((i + 1) % 50 === 0) {
        console.log(`   📊 Generated ${i + 1}/300 flights...`);
      }
    }

    // Generate 100 users/passengers with tickets
    console.log("👥 Generating 100 passengers with bookings...");
    const passengers = [];

    for (let i = 0; i < 100; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const title = getRandomElement(titles);
      const email = generateEmail(firstName, lastName);
      const country = getRandomElement(countries);
      const phoneNumber = generatePhoneNumber();

      // Assign 2-4 random flights per passenger
      const passengerFlights = [];
      const flightCount = getRandomNumber(2, 4);

      for (let j = 0; j < flightCount; j++) {
        let randomFlight;
        let attempts = 0;

        // Avoid duplicate flights for the same passenger
        do {
          randomFlight = getRandomElement(flights);
          attempts++;
        } while (passengerFlights.includes(randomFlight.id) && attempts < 10);

        if (!passengerFlights.includes(randomFlight.id)) {
          const passenger = await prisma.passenger.create({
            data: {
              firstName,
              lastName,
              email: `${email.split("@")[0]}+${j}@${email.split("@")[1]}`, // Make email unique per booking
              phoneNumber,
              flightId: randomFlight.id,
            },
          });

          // Calculate distance-based pricing (simplified)
          const distance = getRandomNumber(500, 8000); // miles
          const ticketPrice = generatePrice(distance);

          await prisma.ticket.create({
            data: {
              passengerId: passenger.id,
              flightId: randomFlight.id,
              seatNumber: generateSeatNumbers(),
              price: ticketPrice,
            },
          });

          passengerFlights.push(randomFlight.id);
          passengers.push({
            ...passenger,
            title,
            country,
            flight: randomFlight,
            ticketPrice,
            bookingReference: generateBookingReference(),
          });
        }
      }

      if ((i + 1) % 20 === 0) {
        console.log(`   📊 Generated ${i + 1}/100 passengers...`);
      }
    }

    // Generate statistics
    const totalFlights = await prisma.flight.count();
    const totalPassengers = await prisma.passenger.count();
    const totalTickets = await prisma.ticket.count();
    const totalRevenue = await prisma.ticket.aggregate({
      _sum: {
        price: true,
      },
    });

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Seeding Summary:");
    console.log(`   ✈️  Airlines: 1 (Quencer Airlines)`);
    console.log(`   🛫 Flights: ${totalFlights}`);
    console.log(`   👥 Passengers: ${totalPassengers}`);
    console.log(`   🎫 Tickets: ${totalTickets}`);
    console.log(
      `   💰 Total Revenue: $${totalRevenue._sum.price?.toLocaleString() || 0}`
    );
    console.log(
      `   🌍 Routes: ${airports.length} cities across ${countries.length} countries`
    );
    console.log(
      `   ✈️  Aircraft Types: ${aircraftTypes.length} different models`
    );

    console.log("\n📋 Sample Data Preview:");
    console.log("\n🛫 Sample Flights:");
    const sampleFlights = flights.slice(0, 3);
    sampleFlights.forEach((flight, index) => {
      console.log(
        `   ${index + 1}. ${flight.flightNumber}: ${flight.originCity} → ${
          flight.destinationCity
        }`
      );
      console.log(`      Departure: ${flight.departure.toLocaleString()}`);
      console.log(`      Arrival: ${flight.arrival.toLocaleString()}`);
      console.log(`      Aircraft: ${flight.aircraftType}`);
    });

    console.log("\n👥 Sample Passengers:");
    const samplePassengers = passengers.slice(0, 3);
    samplePassengers.forEach((passenger, index) => {
      console.log(
        `   ${index + 1}. ${passenger.title} ${passenger.firstName} ${
          passenger.lastName
        }`
      );
      console.log(`      Email: ${passenger.email}`);
      console.log(`      Country: ${passenger.country}`);
      console.log(
        `      Flight: ${passenger.flight.flightNumber} (${passenger.flight.originCity} → ${passenger.flight.destinationCity})`
      );
      console.log(`      Ticket Price: $${passenger.ticketPrice}`);
      console.log(`      Booking Ref: ${passenger.bookingReference}`);
    });

    console.log(
      "\n✅ Your database is now ready with comprehensive flight booking data!"
    );
    console.log(
      "🚀 You can start testing your airline app with this realistic dataset."
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
export {
  generateSeedData,
  airports,
  aircraftTypes,
  firstNames,
  lastNames,
  countries,
  titles,
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSeedData()
    .then(() => {
      console.log("\n🌟 Seeding process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
