import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import {
  generateBookingReference,
  generateRandomTerminal,
  generateSeatNumbers,
} from "../utils/ticketAndBookingGenerator.js";

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

    // const { default: chromium } = await import("@sparticuz/chromium");

    // const browser = await puppeteer.launch({
    //   args: chromium.args,
    //   executablePath: await chromium.executablePath(),
    //   headless: chromium.headless,
    // });

    // /* STEP 1: Generate Child PDF */
    // const ticketPage = await browser.newPage();
    // const ticketHtml = TicketDetailsTemplate(bookingData);

    // await ticketPage.setContent(ticketHtml, {
    //   waitUntil: "networkidle2",
    //   timeout: 120000,
    // });

    // const ticketPdfBuffer = await ticketPage.pdf({
    //   format: "A4",
    //   printBackground: true,
    //   margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    // });

    // await ticketPage.close(); // Close this page after use

    // await browser.close();

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
      subject: `Your electronic ticket receipt is ready to ${outboundFlight.arrivalCity} on ${outboundFlight.departureDate} for ${passenger.firstName} ${passenger.lastName}`,
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
  <div style="margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

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
    <div style="font-size: 15px; border: 1px solid #ddd; border-radius: 6px; padding: 20px; background: #fff;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #e6f2e6;">
          <td style="padding: 10px; font-weight: bold;">Reservation code</td>
          <td style="padding: 10px; text-align: right;">${bookingReference}</td>
        </tr>
      </table>

      <!-- Outbound -->
      <h3 style="margin-bottom: 0;">
        ${outboundFlight.departureCity.toUpperCase()} - ${outboundFlight.arrivalCity.toUpperCase()}
        <span style="float: right; color: green;">CONFIRMED</span>
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

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold;">
            ${outboundFlight.airlineName}, ${outboundFlight.flightNumber}
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
          <td>Cabin: ${outboundFlight.cabinClass} &nbsp; • &nbsp; Class: ${
        outboundFlight.classCode
      }</td>
          <td style="text-align: right;">Aircraft: ${
            outboundFlight.aircraftType
          }</td>
        </tr>
        <tr>
          <td>Meals: Included</td>
        </tr>
      </table>

      <p><strong>${passenger.fullName}</strong><br/>
        Seat(s): ${generateSeatNumbers()}<br/>
        Frequent Flyer: ${passenger.frequentFlyerNumber || "N/A"}</p>

      <!-- Return -->
      <h3 style="margin-bottom: 0;">
        ${returnFlight.departureCity.toUpperCase()} - ${returnFlight.arrivalCity.toUpperCase()}
        <span style="float: right; color: green;">CONFIRMED</span>
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

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold;">
            <img src="data:image/png;base64,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JkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECx/+9ezdhIECAAAECBLIEBICsfquWAAECBAg8CggABoEAAQIECAQKCACBTVcyAQIECBAQAMwAAQIECBAIFBAAApuuZAIECBAgIACYAQIECBAgECggAAQ2XckECBAgQEAAMAMECBAgQCBQQAAIbLqSCRAgQICAAGAGCBAgQIBAoIAAENh0JRMgQIAAAQHADBAgQIAAgUABASCw6UoRJ8StAAADmElEQVQmQIAAAQICgBkgQIAAAQKBAgJAYNOVTIAAAQIEBAAzQIAAAQIEAgUEgMCmK5kAAQIECAgAZoAAAQIECAQKCACBTVcyAQIECBAQAMwAAQIECBAIFBAAApuuZAIECBAgIACYAQIECBAgECggAAQ2XckECBAgQEAAMAMECBAgQCBQQAAIbLqSCRAgQICAAGAGCBAgQIBAoIAAENh0JRMgQIAAAQHADBAgQIAAgUABASCw6UomQIAAAQICgBkgQIAAAQKBAgJAYNOVTIAAAQIEjggIECBAgACBPAEBIK/nKiZAgAABAgcBwBAQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAgABgBggQIECAQKCAABDYdCUTIECAAAEBwAwQIECAAIFAAQEgsOlKJkCAAAECAoAZIECAAAECgQICQGDTlUyAAAECBAQAM0CAAAECBAIFBIDApiuZAAECBAgIAGaAAAECBAgECggAgU1XMgECBAgQEADMAAECBAgQCBQQAAKbrmQCBAgQICAAmAECBAgQIBAoIAAENl3JBAgQIEBAADADBAgQIEAgUEAACGy6kgkQIECAwP8DznUj2a3bw+4AAAAASUVORK5CYII="
             alt="${returnFlight.airlineName}" /> ${returnFlight.flightNumber}
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
          <td>Cabin: ${returnFlight.cabinClass} &nbsp; • &nbsp; Class: ${
        returnFlight.classCode
      }</td>
          <td style="text-align: right;">Aircraft: ${
            returnFlight.aircraftType
          }</td>
        </tr>
        <tr>
          <td>Meals: Included</td>
        </tr>
      </table>

      <p><strong>${passenger.fullName} ${passenger.lastName}</strong><br/>
        Seat(s): ${generateSeatNumbers()}<br/>
        Frequent Flyer: ${passenger.frequentFlyerNumber || "N/A"}</p>
    </div>

    <hr style="margin: 30px 0;" />

    <p><strong>Total Price:</strong> $${totalPrice}</p>

    <h3 style="color: #2c3e50;"> Passenger Details</h3>
    <ul style="padding-left: 20px;">
      <li><strong>Name:</strong> ${passenger.firstName} ${
        passenger.lastName
      }</li>
      <li><strong>Email:</strong> ${passenger.email}</li>
      <li><strong>Phone:</strong> ${passenger.phoneNumber}</li>
      <li><strong>Country:</strong> ${passenger.country}</li>
    </ul>

    <p>Please ensure to arrive at the airport at least <strong>2 hours</strong> before your flight time. You’ll receive a digital boarding pass and any additional updates via email closer to your departure date.</p>

    <p>Should you need to make changes or have any inquiries, don’t hesitate to reach out to our support team.</p>

    <p style="margin-top: 30px;">Safe travels,<br/>
      <strong>The Quencer Airlines Team</strong>
    </p>

    <blockquote style="margin: 30px 0; padding: 15px; background-color: #f1f1f1; border-left: 5px solid #cccccc;">
      <em>"The sky is not the limit — it's where your story begins."</em>
    </blockquote>

    <p>
      📧 <a href="mailto:support@quencerairlines.com" style="color: #1a73e8;">support@quencerairlines.com</a><br/>
      🌐 <a href="https://www.quencerairlines.com" style="color: #1a73e8;">www.quencerairlines.com</a>
    </p>

  </div>
</div>


      `,
      // attachments: [
      //   {
      //     filename: "flight ticket.pdf",
      //     content: ticketPdfBuffer,
      //     contentType: "application/pdf",
      //   },
      // ],
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
