import QRCode from "qrcode";

import TicketDetailsTemplate from "../constants/ticketTemplate.js";
import { AIRLINE_BRAND } from "../constants/branding.js";
import { generatePDF } from "./pdfHelper.js";
import { getResend } from "./resendClient.js";
import {
  generateCabinZone,
  generateRandomTerminal,
} from "./ticketAndBookingGenerator.js";

// Falls back to Resend's shared sandbox sender, which works with zero setup
// but can only deliver to the email address your Resend account was signed
// up with. Verify a domain in Resend and set RESEND_FROM_EMAIL to send to
// real passengers.
const DEFAULT_FROM_EMAIL = "onboarding@resend.dev";

// The PDF is rendered by Puppeteer with `waitUntil: "networkidle0"`, which
// blocks until ALL network activity in the page settles - including any
// remote <img>/font URL. A slow or unreachable external resource can hang
// that for the full navigation timeout and fail ticket delivery entirely.
// Fetching the logo once and embedding it as a data URI removes that
// dependency from the render path. Cached in memory since it never changes;
// if the fetch itself fails, the ticket still generates, just without a
// logo - a missing decorative image should never block a paid customer
// from getting their ticket.
let logoDataUriPromise;
async function getLogoDataUri() {
  if (!logoDataUriPromise) {
    logoDataUriPromise = fetch(AIRLINE_BRAND.logoUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Logo fetch failed: ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get("content-type") || "image/png";
        return `data:${contentType};base64,${buffer.toString("base64")}`;
      })
      .catch((error) => {
        console.error("Could not fetch airline logo for ticket PDF:", error);
        logoDataUriPromise = null; // allow retrying on the next ticket
        return null;
      });
  }
  return logoDataUriPromise;
}

// `booking` is a persisted Prisma Booking record — ticketNumber and the two
// seat numbers must already be set on it (generated once, at confirmation
// time) so the PDF, email, and any later lookup always agree.
async function buildTicketPdf(booking) {
  const totalPrice = booking.amountTotal / 100;
  const [qrCodeDataUri, logoDataUri] = await Promise.all([
    QRCode.toDataURL(booking.bookingReference, { margin: 1, width: 200 }),
    getLogoDataUri(),
  ]);

  const html = TicketDetailsTemplate({
    passenger: booking.passenger,
    outboundFlight: booking.outboundFlight,
    returnFlight: booking.returnFlight,
    totalPrice,
    bookingReference: booking.bookingReference,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    ticketNumber: booking.ticketNumber,
    seatNumberOutbound: booking.seatNumberOutbound,
    seatNumberReturn: booking.seatNumberReturn,
    qrCodeDataUri,
    logoDataUri,
  });

  return generatePDF(html);
}

function flightSummaryHtml(flight, seatNumber) {
  const layovers = Array.isArray(flight.layovers) ? flight.layovers : [];
  const isNonStop = layovers.length === 0;
  const routeCodes = [
    flight.departureAirportCode,
    ...layovers.map((l) => l.airportCode),
    flight.arrivalAirportCode,
  ].filter(Boolean);

  const layoverRows = layovers
    .map((layover) => {
      const times =
        layover.arrivalTime && layover.departureTime
          ? ` — arrive ${layover.arrivalTime}, depart ${layover.departureTime}`
          : "";
      const duration = layover.duration ? ` (${layover.duration} layover)` : "";
      return `
      <tr>
        <td colspan="2" style="padding: 8px 0; color: #9a0507; font-size: 13px;">
          ✈ Change planes in ${layover.city} (${layover.airportCode})${times}${duration}
        </td>
      </tr>`;
    })
    .join("");

  return `
    <div style="margin-bottom: 20px; border-bottom: 3px solid #e4e4e4; border-top: 3px solid #e4e4e4;">
      <h3 style="margin-bottom: 0;">
        ${flight.departureCity.toUpperCase()} - ${flight.arrivalCity.toUpperCase()}
        <span style="float: right; color: #9a0507;">CONFIRMED</span>
      </h3>
      <p style="margin-top: 5px;">
        ${flight.departureDate} – ${flight.arrivalDate}
        &nbsp; • &nbsp; ${flight.flightDuration} &nbsp; • &nbsp;
        ${isNonStop ? "Non Stop" : `${layovers.length} Stop${layovers.length > 1 ? "s" : ""}`}
      </p>
      <p style="margin-top: 5px; color: #555; font-size: 13px;">
        Route: ${routeCodes.join(" → ")}
      </p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">
          <div style="display: flex; align-items: center;">
            <img draggable="false" src="${AIRLINE_BRAND.logoUrl}" alt="${AIRLINE_BRAND.name}" style="width: 26px; padding-right: 5px;"/>
            ${flight.flightNumber}
          </div>
        </td>
        <td style="padding: 10px 0; text-align: right; color: #777;">
          Please verify flight times prior to departure
        </td>
      </tr>
      <tr>
        <td><strong>${flight.departureCity}</strong></td>
        <td style="text-align: right;"><strong>${flight.arrivalCity}</strong></td>
      </tr>
      <tr>
        <td>${flight.departureTime}, ${flight.departureDate}</td>
        <td style="text-align: right;">${flight.arrivalTime}, ${flight.arrivalDate}</td>
      </tr>
      <tr>
        <td>${generateRandomTerminal()}</td>
        <td style="text-align: right;">${generateRandomTerminal()}</td>
      </tr>
      ${layoverRows}
    </table>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
      <tr>
        <td>${generateCabinZone()} &nbsp; </td>
        <td style="text-align: right;">Aircraft: ${flight.aircraftType}</td>
      </tr>
      <tr>
        <td>Meals: Included</td>
      </tr>
    </table>
    <p><strong>Seat:</strong> ${seatNumber}</p>
  `;
}

function confirmationEmailHtml(booking) {
  const { passenger, outboundFlight, returnFlight, bookingReference } =
    booking;
  const totalPrice = (booking.amountTotal / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
  <div style="margin: auto; background-color: #fff; border-radius: 8px; padding-top: 20px; padding-bottom: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

    <h2 style="color: #2c3e50;">Dear ${passenger.firstName} ${passenger.lastName},</h2>

    <p>Thank you for booking with <strong>${AIRLINE_BRAND.name}</strong>! Your payment has been received and your booking is confirmed.</p>

    <p><strong>Booking Reference / PNR:</strong> ${bookingReference}</p>
    <p><strong>Booking Date:</strong> ${booking.bookingDate} at ${booking.bookingTime}</p>

    <hr style="margin: 30px 0;" />

    <div style="font-size: 14px; border: 1px solid #ddd; border-radius: 6px; padding: 20px; background: #fff; width:fit-content; margin: auto;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f8dddd;">
          <td style="padding: 10px; font-weight: bold;">Reservation code</td>
          <td style="padding: 10px; text-align: right;">${bookingReference}</td>
        </tr>
      </table>

      ${flightSummaryHtml(outboundFlight, booking.seatNumberOutbound)}
      ${flightSummaryHtml(returnFlight, booking.seatNumberReturn)}
    </div>

    <hr style="margin: 30px 0;" />

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #e0e0e0;">
      <h3 style="margin: 0; color: #2c3e50;">Total Paid</h3>
      <p style="font-size: 20px; font-weight: bold; color: #27ae60; margin-top: 5px;">
        $${totalPrice}
      </p>
    </div>

    <div style="background-color: #fefefe; padding: 20px; border-radius: 6px; border: 1px solid #e0e0e0; margin-bottom: 30px;">
      <h3 style="margin-top: 0; color: #2c3e50;">Passenger Information</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
        <tr>
          <td style="padding: 8px 0;"><strong>Name:</strong></td>
          <td style="padding: 8px 0;">${passenger.firstName} ${passenger.lastName}</td>
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
      </table>
    </div>

    <p style="font-size: 15px; line-height: 1.6;">
      Please arrive at the airport at least <strong>2 hours</strong> before your scheduled departure time. Your e-ticket is attached to this email as a PDF.
    </p>

    <p style="font-size: 15px; line-height: 1.6;">
      For changes or questions regarding your reservation, feel free to contact our support team at any time.
    </p>

    <p style="margin-top: 30px; font-size: 15px;">
      Wishing you a smooth and enjoyable journey,<br/>
      <strong>The ${AIRLINE_BRAND.name} Team</strong>
    </p>

    <blockquote style="margin: 30px 0; padding: 15px 20px; background-color: #f1f1f1; border-left: 5px solid #cccccc; font-style: italic;">
      "The sky is not the limit — it's where your story begins."
    </blockquote>

    <p style="font-size: 14px; color: #555;">
      📧 <a href="mailto:${AIRLINE_BRAND.supportEmail}" style="color: #1a73e8;">${AIRLINE_BRAND.supportEmail}</a><br/>
      🌐 <a href="${AIRLINE_BRAND.website}" style="color: #1a73e8;">${AIRLINE_BRAND.website.replace("https://", "")}</a>
    </p>

  </div>
</div>`;
}

// Builds the PDF ticket and emails it. Call this once, after the booking's
// payment has been confirmed and ticketNumber/seat numbers have been
// persisted onto it.
export async function deliverTicket(booking) {
  const pdfBuffer = await buildTicketPdf(booking);
  const resend = getResend();
  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  const { error } = await resend.emails.send({
    from: `${AIRLINE_BRAND.name} <${fromEmail}>`,
    to: booking.passenger.email,
    subject: `Your e-ticket is confirmed - ${booking.bookingReference} to ${booking.outboundFlight.arrivalCity}`,
    html: confirmationEmailHtml(booking),
    attachments: [
      {
        filename: `ticket-${booking.bookingReference}.pdf`,
        // Resend's API requires attachment content as a base64 string, not
        // a raw Buffer - passing the Buffer directly fails with
        // "Attachment content must be a base64-encoded string."
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}
