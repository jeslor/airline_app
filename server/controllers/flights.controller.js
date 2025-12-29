import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";
import nodemailer from "nodemailer";
import {
  generateBookingReference,
  generateCabinZone,
  generateRandomTerminal,
  generateSeatNumbers,
} from "../utils/ticketAndBookingGenerator.js";
import TicketDetailsTemplate from "../constants/ticketTemplate.js";
import { generatePDF } from "../utils/pdfHelper.js";

const getFlights = asyncWrapper(async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const prompt = `
You are a flight data generator. Generate realistic flight data from ${body.origin} to ${body.destination} on ${body.departDate} and return on ${body.returnDate}.

Return ONLY valid JSON with NO text before or after. Use this EXACT structure:
{
  "outboundFlights": [
    {
      "airline": "Quencer Airlines",
      "flightNumber": "QF1234",
      "departureCity": "New York",
      "arrivalCity": "Los Angeles",
      "departureAirportCode": "JFK",
      "arrivalAirportCode": "LAX",
      "departureDate": "January 15, 2025",
      "arrivalDate": "January 15, 2025",
      "departureTime": "08:00 AM",
      "arrivalTime": "11:30 AM",
      "flightDuration": "5h 30m",
      "aircraftType": "Boeing 737-800",
      "price": 450,
      "layovers": [
        {
          "city": "Chicago",
          "airportCode": "ORD",
          "flightNumber": "QF5678",
          "duration": "1h 30m"
        }
      ]
    }
  ],
  "returnFlights": [
    {
      "airline": "Quencer Airlines",
      "flightNumber": "QF4321",
      "departureCity": "Los Angeles",
      "arrivalCity": "New York",
      "departureAirportCode": "LAX",
      "arrivalAirportCode": "JFK",
      "departureDate": "January 20, 2025",
      "arrivalDate": "January 20, 2025",
      "departureTime": "02:00 PM",
      "arrivalTime": "10:30 PM",
      "flightDuration": "5h 30m",
      "aircraftType": "Airbus A320",
      "price": 480,
      "layovers": []
    }
  ]
}

IMPORTANT RULES:
- Generate at least 5 flight options for BOTH outboundFlights AND returnFlights
- All airlines must be "Quencer Airlines"
- Flight numbers format: QF#### (4 digits)
- Dates in human-readable format: "Month Day, Year" (e.g., "January 15, 2025")
- Times in 12-hour format with AM/PM
- price must be a NUMBER (not string), between 200-2000
- layovers is an array (empty [] if non-stop, or contains layover objects)
- Include variety: some non-stop, some with 1-2 layovers
- Use realistic aircraft types: Boeing 737, Boeing 777, Airbus A320, Airbus A350, etc.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let flights = [];

    try {
      flights = cleanAIJsonResponse(text);
      flights = JSON.parse(flights); // 🔥 Convert string to array
    } catch (e) {
      console.error("❌ Failed to parse JSON from Gemini:", e);
      return res.status(500).json({
        message: "Failed to parse flight data. Please try again.",
        raw: text,
      });
    }

    res.status(200).json({ flights });
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const bookFlight = asyncWrapper(async (req, res) => {
  // if (req.method !== "POST") {
  //   res.json({
  //     message: "Method not allowed",
  //     status: 405,
  //     data: "something went wrong",
  //   });
  // }
  try {
    const bookingData = req.body;
    const {
      passenger,
      outboundFlight,
      returnFlight,

      bookingDate,
      bookingTime,
      totalPrice,
    } = bookingData;

    const bookingReference = generateBookingReference();
    const cleanedPrice = totalPrice.replace(/,/g, "");
    const currentPrice = Math.floor(parseFloat(cleanedPrice));

    //1. build the ticket pdf file
    let ticketPdfBuffer;
    try {
      ticketPdfBuffer = await createPDF(
        passenger,
        outboundFlight,
        returnFlight,
        currentPrice,
        bookingReference,
        bookingDate,
        bookingTime
      );
    } catch (error) {
      console.error("Error creating PDF:", error);
      return res.status(500).json({
        message: "Error creating ticket PDF",
        status: 500,
        error: error.message,
      });
    }

    //2. create email transporter
    let transporter;

    try {
      transporter = await createEmailTransporter();
    } catch (error) {
      console.error("Error creating email transporter:", error);
      return res.status(500).json({
        message: "Error setting up email service",
        status: 500,
        error: error.message,
      });
    }

    // 3. Send the email with the PDF attachment
    try {
      await transporter.sendMail({
        from: `"Quencer Airlines" <${process.env.EMAIL_USER}>`,
        to: `${bookingData.passenger.email}`,
        subject: `Your electronic ticket receipt is ready to ${outboundFlight.arrivalCity} on ${outboundFlight.departureDate} for ${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
        html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
  <div style="margin: auto; background-color: #fff; border-radius: 8px; padding-top: 20px; padding-bottom: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

    <h2 style="color: #2c3e50;">Dear ${passenger.firstName} ${
          passenger.lastName
        },</h2>

    <p>Thank you for booking with <strong>Quencer Airlines</strong>! Your reservation has been successfully received, and we’re excited to have you on board.</p>

    <p><strong>Booking Reference:</strong> ${
      bookingReference || "To be assigned"
    }</p>
    <p><strong>Booking Date:</strong> ${bookingDate} at ${bookingTime}</p>

    <hr style="margin: 30px 0;" />

    <!-- ✅ Updated Flight Details Section (Styled like airline itinerary) -->
    <div style="font-size: 14px; border: 1px solid #ddd; border-radius: 6px; padding: 20px; background: #fff; width:fit-content; margin: auto;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f8dddd;">
          <td style="padding: 10px; font-weight: bold;">Reservation code</td>
          <td style="padding: 10px; text-align: right;">${bookingReference}</td>
        </tr>
      </table>

      <!-- Outbound -->
     <div style="margin-bottom: 20px; border-bottom: 3px solid #e4e4e4;  border-top: 3px solid #e4e4e4;">
      <h3 style="margin-bottom: 0;">
        ${outboundFlight.departureCity.toUpperCase()} - ${outboundFlight.arrivalCity.toUpperCase()}
        <span style="float: right; color: #9a0507;">CONFIRMED</span>
      </h3>
      <p style="margin-top: 5px;">
        ${outboundFlight.departureDate} – ${outboundFlight.arrivalDate}
        &nbsp; • &nbsp; ${outboundFlight.flightDuration} &nbsp; • &nbsp;
        ${
          outboundFlight.isNonStop || outboundFlight.layovers.length === 0
            ? "Non Stop"
            : "With Stops"
        }
        &nbsp; • &nbsp; ${
          (outboundFlight.layovers.length > 0 &&
            outboundFlight.layovers
              .map((layover) => `${layover.city} (${layover.duration})`)
              .join(", ")) ||
          "N/A"
        }
      </p>
     </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold;">
             <div style="display: flex; align-items: center;">
              <img draggable="false" src="https://jeslor-child-sponsor-platform-app.s3.us-east-1.amazonaws.com/airline.png" alt="Quencer Airlines" style="width: 26px; padding-right: 5px;"/>
              ${outboundFlight.flightNumber}
            </div>
          </td>
         
          <td style="padding: 10px 0; text-align: right; color: #777;">
            Please verify flight times prior to departure
          </td>
        </tr>
        <tr>
          <td><strong>${outboundFlight.departureCity}</strong></td>
        
          <td style="text-align: right;"><strong>${
            outboundFlight.arrivalCity
          }</strong></td>
        </tr>
        <tr>
          <td>${outboundFlight.departureTime}, ${
          outboundFlight.departureDate
        }</td>
          <td style="text-align: right;">${outboundFlight.arrivalTime}, ${
          outboundFlight.arrivalDate
        }</td>
        </tr>
        <tr>
          <td>${generateRandomTerminal()}</td>
          <td style="text-align: right;">${generateRandomTerminal()}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td>${generateCabinZone()} &nbsp; </td>
          <td style="text-align: right;">Aircraft: ${
            outboundFlight.aircraftType
          }</td>
        </tr>
        <tr>
          <td>Meals: Included</td>
        </tr>
      </table>

      <p><strong>${passenger.firstName} ${passenger.lastName}</strong><br/>
        Seat(s): ${generateSeatNumbers()}<br/>
        Frequent Flyer: ${passenger.frequentFlyerNumber || "N/A"}</p>

      <!-- Return -->
      <div style="margin-bottom: 20px; border-bottom: 3px solid #e4e4e4;  border-top: 3px solid #e4e4e4;">
      <h3 style="margin-bottom: 0;">
        ${returnFlight.departureCity.toUpperCase()} - ${returnFlight.arrivalCity.toUpperCase()}
        <span style="float: right; color: #9a0507;">CONFIRMED</span>
      </h3>
      <p style="margin-top: 5px;">
        ${returnFlight.departureDate}
        &nbsp; • &nbsp; ${returnFlight.flightDuration}
        &nbsp; • &nbsp; ${
          returnFlight.isNonStop || returnFlight.layovers.length === 0
            ? "Non Stop"
            : "With Stops"
        }
         &nbsp; • &nbsp; ${
           (returnFlight.layovers.length > 0 &&
             returnFlight.layovers
               .map((layover) => `${layover.city} (${layover.duration})`)
               .join(", ")) ||
           "N/A"
         }
      </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold;">
            <div style="display: flex; align-items: center;">
              <img draggable="false" src="https://jeslor-child-sponsor-platform-app.s3.us-east-1.amazonaws.com/airline.png" alt="Quencer Airlines" style="width: 26px; padding-right: 5px;"/>
              ${returnFlight.flightNumber}
            </div>
          </td>
          <td style="padding: 10px 0; text-align: right; color: #777;">
            Please verify flight times prior to departure
          </td>
        </tr>
        <tr>
          <td><strong>${returnFlight.departureCity}</strong></td>
          <td style="text-align: right;"><strong>${
            returnFlight.arrivalCity
          }</strong></td>
        </tr>
        <tr>
          <td>${returnFlight.departureTime}, ${returnFlight.departureDate}</td>
          <td style="text-align: right;">${returnFlight.arrivalTime}, ${
          returnFlight.arrivalDate
        }</td>
        </tr>
        <tr>
          <td>${generateRandomTerminal()}</td>
          <td style="text-align: right;">${generateRandomTerminal()}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td>${generateCabinZone()} &nbsp; </td>
          <td style="text-align: right;">Aircraft: ${
            returnFlight.aircraftType
          }</td>
        </tr>
        <tr>
          <td>Meals: Included</td>
        </tr>
      </table>

      <p><strong>${passenger.firstName} ${passenger.lastName}</strong><br/>
        Seat(s): ${generateSeatNumbers()}<br/>
        Frequent Flyer: ${passenger.frequentFlyerNumber || "N/A"}</p>
    </div>

    <hr style="margin: 30px 0;" />

    <!-- 💰 Total Price -->
<div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
  <h3 style="margin: 0; color: #2c3e50;">Total Price</h3>
  <p style="font-size: 20px; font-weight: bold; color: #27ae60; margin-top: 5px;">
    $${totalPrice}
  </p>
</div>

<!-- 👤 Passenger Details -->
<div style="background-color: #fefefe; padding: 20px; border-radius: 6px; border: 1px solid #e0e0e0; margin-bottom: 30px;">
  <h3 style="margin-top: 0; color: #2c3e50;">Passenger Information</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
    <tr>
      <td style="padding: 8px 0;"><strong>Name:</strong></td>
      <td style="padding: 8px 0;">${passenger.firstName} ${
          passenger.lastName
        }</td>
    </tr>
    <tr>
      <td style="padding: 8px 0;"><strong>Email:</strong></td>
      <td style="padding: 8px 0;">${passenger.email}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0;"><strong>Phone:</strong></td>
      <td style="padding: 8px 0;">${passenger.phoneNumber}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0;"><strong>Country:</strong></td>
      <td style="padding: 8px 0;">${passenger.country}</td>
    </tr>
    ${
      passenger.frequentFlyerNumber
        ? `<tr><td style="padding: 8px 0;"><strong>Frequent Flyer:</strong></td><td style="padding: 8px 0;">${passenger.frequentFlyerNumber}</td></tr>`
        : ""
    }
  </table>
</div>

<!-- 📣 Advisory -->
<p style="font-size: 15px; line-height: 1.6;">
  Please arrive at the airport at least <strong>2 hours</strong> before your scheduled departure time. Your digital boarding pass and final updates will be sent via email closer to your flight date.
</p>

<p style="font-size: 15px; line-height: 1.6;">
  For changes or questions regarding your reservation, feel free to contact our support team at any time.
</p>

<!-- 👋 Closing -->
<p style="margin-top: 30px; font-size: 15px;">
  Wishing you a smooth and enjoyable journey,<br/>
  <strong>The Quencer Airlines Team</strong>
</p>

<!-- 💬 Quote -->
<blockquote style="margin: 30px 0; padding: 15px 20px; background-color: #f1f1f1; border-left: 5px solid #cccccc; font-style: italic;">
  "The sky is not the limit — it's where your story begins."
</blockquote>

<!-- 📞 Contact -->
<p style="font-size: 14px; color: #555;">
  📧 <a href="mailto:support@quencerairlines.com" style="color: #1a73e8;">support@quencerairlines.com</a><br/>
  🌐 <a href="https://www.quencerairlines.com" style="color: #1a73e8;">www.quencerairlines.com</a>
</p>

  </div>
</div>


      `,
        attachments: [
          {
            filename: `ticket-${bookingReference}.pdf`,
            content: ticketPdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({
        message: "Error sending email",
        status: 500,
        error: error.message,
      });
    }

    res.json({
      message: "Email with Ticket sent successfully!",
      status: 200,
      data: {
        message: "Booking successful",
        bookingStatus: "confirmed",
        bookingReference: bookingReference || "To be assigned",
        passenger: {
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          email: passenger.email,
          phoneNumber: passenger.phoneNumber,
          country: passenger.country,
        },
        bookingDate: bookingDate || new Date().toISOString(),
        bookingTime: bookingTime || new Date().toISOString(),
      },
    });

    if (!bookingData) {
      return res.status(400).json({ message: "Booking data is required" });
    }
  } catch (error) {
    console.error("Error in booking flight:", error);
    res.status(500).json({ message: "Internal server error", data: error });
  }
});

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
    const htmlContent = TicketDetailsTemplate(
      passenger,
      outboundFlight,
      returnFlight,
      currentPrice,
      bookingReference,
      bookingDate,
      bookingTime
    );

    // Generate PDF buffer
    const pdfBuffer = await generatePDF(htmlContent);

    // Send as response
    return pdfBuffer; // Return PDF buffer directly
  } catch (err) {
    console.error("Error creating PDF:", err);
    throw new Error("PDF generation failed: " + err.message);
  }
};

const createEmailTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587, // default to 587 if not set
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for others
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000, // 30 seconds
      tls: {
        rejectUnauthorized: false, // avoid cert issues in cloud environments
      },
    });

    // Optional: verify connection before using
    await transporter.verify();

    console.log("✅ Email transporter ready");
    return transporter;
  } catch (error) {
    console.error("❌ Error setting up email transporter:", error);
    throw new Error("Error setting up email transporter: " + error.message);
  }
};

export { getFlights, bookFlight };
