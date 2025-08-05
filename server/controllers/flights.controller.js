import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import {
  generateBookingReference,
  generateCabinZone,
  generateRandomTerminal,
  generateSeatNumbers,
} from "../utils/ticketAndBookingGenerator.js";
import TicketDetailsTemplate from "../constants/ticketTemplate.js";

const getFlights = asyncWrapper(async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const prompt = `
 You are a special travel agent, search the web for the best flights available  from ${body.origin} to ${body.destination} on ${body.departDate}  and ${body.returnDate}.
    - make sure the data you return is an object with the following properties and with no text before or after the JSON response:
    - make sure you find both outboundFlights and returnFlights: {outboundFlights: [], returnFlights: []}
    - make sure each flight is complete from the starting city to the final destination city, let the connections be in the layover, each layover should have the airport code, flight number, city, and duration.
    - make sure you include the aircraft type, flight number, departure and arrival times, departure and arrival dates, airport codes, departure and arrival cities, flight duration, and the airline each as an independent property of the object.
    - Include the price for each flight option.
    - Make sure you return at least 7 options.
    - flight numbers (formatted as QF####), departure/arrival times and dates (human-readable), airport codes, cities, duration, and the airline (all renamed to "Quencer Airlines").
    - make sure you arrange the information for example Departure , arrival and any layovers in individual properties.
    -This information is going to be used to generate a demo flight ticket so include the dates and times in a human-readable format, plus other relevant details.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
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

    const { default: chromium } = await import("@sparticuz/chromium");

    const browser = await puppeteer.launch({
      headless: "new",
    });

    /* STEP 1: Generate Child PDF */
    const cleanedPrice = totalPrice.replace(/,/g, "");
    const currentPrice = Math.floor(parseFloat(cleanedPrice));

    const ticketPage = await browser.newPage();
    const ticketHtml = TicketDetailsTemplate(
      passenger,
      outboundFlight,
      returnFlight,
      currentPrice,
      bookingReference,
      bookingDate,
      bookingTime
    );

    await ticketPage.setContent(ticketHtml, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    const ticketPdfBuffer = await ticketPage.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await ticketPage.close(); // Close this page after use

    await browser.close();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_USER.toString(),
        pass: process.env.EMAIL_PASS.toString(),
      },
    });

    // 3. Send the email with the PDF attachment
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
        ${outboundFlight.isNonStop ? "Non Stop" : "With Stops"}
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
        &nbsp; • &nbsp; ${returnFlight.isNonStop ? "Non Stop" : "With Stops"}
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

    res.json({
      message: "Email with Ticket sent successfully!",
      status: 200,
      data: {
        message: "Booking successful",
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
    res.status(500).json({ message: "Internal server error" });
  }
});

export { getFlights, bookFlight };
