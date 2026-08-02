import {
  generateTaxesAndFees,
  generateRandomTerminal,
  generateCabinZone,
} from "../utils/ticketAndBookingGenerator.js";
import { AIRLINE_BRAND } from "./branding.js";

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Turns a flight (with 0+ layovers) into an ordered list of point-to-point
// legs, each operated by its own flight number, so the ticket can show the
// full routing instead of just the overall origin/destination.
function buildSegments(flight) {
  const layovers = Array.isArray(flight.layovers) ? flight.layovers : [];

  const points = [
    {
      code: flight.departureAirportCode,
      city: flight.departureCity,
      date: flight.departureDate,
      time: flight.departureTime,
    },
    ...layovers.flatMap((layover) => [
      { code: layover.airportCode, city: layover.city, date: flight.departureDate, time: layover.arrivalTime },
      { code: layover.airportCode, city: layover.city, date: flight.departureDate, time: layover.departureTime },
    ]),
    {
      code: flight.arrivalAirportCode,
      city: flight.arrivalCity,
      date: flight.arrivalDate,
      time: flight.arrivalTime,
    },
  ];

  const flightNumbers = [flight.flightNumber, ...layovers.map((l) => l.flightNumber)];

  return flightNumbers.map((flightNumber, i) => ({
    flightNumber: flightNumber || flight.flightNumber,
    from: points[i * 2],
    to: points[i * 2 + 1],
  }));
}

function renderItinerary(flight, seatNumber, label) {
  const layovers = Array.isArray(flight.layovers) ? flight.layovers : [];
  const segments = buildSegments(flight);
  const stopsLabel =
    layovers.length === 0
      ? "Non-stop"
      : `${layovers.length} Stop${layovers.length > 1 ? "s" : ""}`;

  const routeCodes = [
    flight.departureAirportCode,
    ...layovers.map((l) => l.airportCode),
    flight.arrivalAirportCode,
  ].filter(Boolean);

  const segmentsHtml = segments
    .map((segment, i) => {
      const segmentHtml = `
        <div class="segment">
          <div class="segment-flight-no">${segment.flightNumber} &nbsp;·&nbsp; ${flight.aircraftType || "N/A"}</div>
          <div class="segment-timeline">
            <div class="segment-point">
              <div class="segment-time">${segment.from?.time || "-"}</div>
              <div class="segment-code">${segment.from?.code || "-"}</div>
              <div class="segment-city">${segment.from?.city || ""}</div>
              <div class="segment-date">${segment.from?.date || ""}</div>
            </div>
            <div class="segment-line"><span></span></div>
            <div class="segment-point segment-point-end">
              <div class="segment-time">${segment.to?.time || "-"}</div>
              <div class="segment-code">${segment.to?.code || "-"}</div>
              <div class="segment-city">${segment.to?.city || ""}</div>
              <div class="segment-date">${segment.to?.date || ""}</div>
            </div>
          </div>
        </div>
      `;

      const layover = layovers[i];
      const layoverDetail = layover?.duration ? ` — ${layover.duration} layover` : "";
      const layoverHtml = layover
        ? `<div class="layover-note">✈ Change planes in ${layover.city} (${layover.airportCode})${layoverDetail}</div>`
        : "";

      return segmentHtml + layoverHtml;
    })
    .join("");

  return `
    <div class="itinerary">
      <div class="itinerary-header">
        <div>
          <span class="itinerary-label">${label}</span>
          <span class="confirmed-badge">CONFIRMED</span>
        </div>
        <div class="stops-badge">${stopsLabel}</div>
      </div>
      <div class="route-summary">${routeCodes.join(" &nbsp;✈&nbsp; ")} &nbsp;•&nbsp; Total travel time: ${flight.flightDuration || "N/A"}</div>
      ${segmentsHtml}
      <div class="itinerary-footer">
        <div><strong>Aircraft:</strong> ${flight.aircraftType || "N/A"}</div>
        <div><strong>Terminal:</strong> ${generateRandomTerminal()}</div>
        <div><strong>Cabin:</strong> ${generateCabinZone()}</div>
        <div><strong>Seat:</strong> ${seatNumber}</div>
      </div>
    </div>
  `;
}

// A 2-leg booking whose second leg is exactly the reverse of the first is a
// round trip - label it Outbound/Return. Anything else (a single leg, or 3+
// legs) is a one-way or multi-city itinerary - label each leg by number.
function getLegLabel(flights, index) {
  const isRoundTrip =
    flights.length === 2 &&
    flights[1].departureAirportCode === flights[0].arrivalAirportCode &&
    flights[1].arrivalAirportCode === flights[0].departureAirportCode;

  if (isRoundTrip) {
    return index === 0 ? "Outbound Flight" : "Return Flight";
  }
  return `Flight ${index + 1}: ${flights[index].departureAirportCode} → ${flights[index].arrivalAirportCode}`;
}

// ticketNumber and the seat numbers must be generated once (at payment
// confirmation) and persisted on the Booking, then passed in here — never
// regenerated on each render, or the PDF/email/DB would disagree with each
// other on the passenger's actual seat/ticket number.
const TicketDetailsTemplate = ({
  passenger,
  flights,
  totalPrice,
  bookingReference,
  bookingDate,
  bookingTime,
  ticketNumber,
  seatNumbers,
  qrCodeDataUri,
  logoDataUri,
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${AIRLINE_BRAND.name} | e-Ticket Receipt</title>
    <style>
      body {
        /* No external font - this HTML is rendered by Puppeteer with
           waitUntil: "networkidle0", which would hang (and can time out)
           waiting on any remote font/image request. A system font stack
           keeps PDF generation fully self-contained. */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 14px;
        margin: 0;
        padding: 20px;
        color: #333;
        background-color: #ffffff;
        line-height: 1.5;
      }

      .container {
        max-width: 750px;
        margin: 0 auto;
        border: 1px solid #ccc;
        box-shadow: none;
        border-radius: 0;
        overflow: hidden;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        background-color: #f0f0f0;
        color: #333;
        border-bottom: 1px solid #ccc;
      }

      .header .logo {
        width: 150px;
        filter: none;
      }

      .header h1 {
        font-size: 24px;
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.2px;
        color: #000;
      }

      .ticket-info {
        padding: 15px 30px;
        background-color: #f8f8f8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed #ddd;
      }

      .ticket-info .qr-code img {
        width: 90px;
        height: 90px;
      }

      .ticket-info .ticket-numbers {
        text-align: right;
      }

      .ticket-info .barcode-text {
        font-size: 12px;
        color: #555;
        margin-bottom: 3px;
      }

      .ticket-info .barcode-number {
        font-family: "Inter", monospace;
        font-weight: 700;
        font-size: 16px;
        background: #ffffff;
        padding: 6px 12px;
        border: 1px solid #999;
        border-radius: 4px;
        color: #000;
        display: inline-block;
        letter-spacing: 1px;
        margin-bottom: 6px;
      }

      .ticket-info .pnr-number {
        font-family: "Inter", monospace;
        font-weight: 700;
        font-size: 14px;
        color: #9a0507;
      }

      .section {
        padding: 20px 30px;
        border-bottom: 1px solid #eee;
      }

      .section:last-of-type {
        border-bottom: none;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #000;
        margin-bottom: 15px;
        position: relative;
        padding-bottom: 5px;
      }

      .section-title::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 40px;
        height: 2px;
        background-color: #666;
        border-radius: 1px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        background: #ffffff;
      }

      th,
      td {
        padding: 10px 0;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
        font-size: 12.5px;
      }

      th {
        background-color: #f8f8f8;
        color: #444;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        padding-left: 10px;
      }

      td {
        padding-left: 10px;
      }

      td strong {
        color: #000;
        font-weight: 600;
      }

      tr:last-child td {
        border-bottom: none;
      }

      /* Itinerary (route/segments/layovers) */
      .itinerary {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 16px;
        background: #fff;
      }

      .itinerary:last-child {
        margin-bottom: 0;
      }

      .itinerary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .itinerary-label {
        font-size: 15px;
        font-weight: 700;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .confirmed-badge {
        margin-left: 10px;
        font-size: 11px;
        font-weight: 700;
        color: #9a0507;
        letter-spacing: 0.5px;
      }

      .stops-badge {
        font-size: 11px;
        font-weight: 600;
        color: #555;
        background: #f0f0f0;
        padding: 3px 10px;
        border-radius: 12px;
        white-space: nowrap;
      }

      .route-summary {
        font-size: 12.5px;
        color: #666;
        margin-bottom: 16px;
        font-weight: 500;
        letter-spacing: 0.2px;
      }

      .segment {
        margin-bottom: 4px;
      }

      .segment-flight-no {
        font-size: 11px;
        color: #888;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .segment-timeline {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .segment-point {
        flex: 0 0 auto;
        min-width: 100px;
      }

      .segment-point-end {
        text-align: right;
      }

      .segment-time {
        font-size: 16px;
        font-weight: 700;
        color: #000;
      }

      .segment-code {
        font-size: 13px;
        font-weight: 700;
        color: #9a0507;
      }

      .segment-city,
      .segment-date {
        font-size: 11px;
        color: #777;
      }

      .segment-line {
        flex: 1;
        height: 1px;
        background-image: repeating-linear-gradient(
          to right,
          #bbb 0,
          #bbb 4px,
          transparent 4px,
          transparent 9px
        );
        position: relative;
      }

      .segment-line span {
        position: absolute;
        right: -1px;
        top: -4px;
        width: 7px;
        height: 7px;
        border-top: 2px solid #9a0507;
        border-right: 2px solid #9a0507;
        transform: rotate(45deg);
      }

      .layover-note {
        font-size: 12px;
        color: #665500;
        background-color: #fffacd;
        border-left: 4px solid #ccaa00;
        padding: 8px 12px;
        border-radius: 4px;
        margin: 12px 0;
      }

      .itinerary-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed #eee;
        font-size: 12px;
        color: #444;
      }

      .fare-notes {
        font-size: 12px;
        color: #555;
        margin-top: 10px;
      }

      .total-price {
        font-size: 18px;
        font-weight: 700;
        color: #000;
        text-align: right;
        padding-right: 10px;
        padding-top: 15px;
      }

      .terms {
        font-size: 11px;
        color: #777;
        margin-top: 15px;
        line-height: 1.5;
      }

      .inspirational-quote {
        margin-top: 25px;
        padding: 15px 20px;
        background-color: #f5fafd;
        border-left: 3px solid #999;
        font-style: italic;
        color: #666;
        font-size: 14px;
        text-align: center;
        border-radius: 6px;
      }

      .contact-info {
        padding: 20px 30px;
        text-align: center;
        border-top: 1px dashed #eee;
        background-color: #fdfdfd;
        font-size: 13px;
      }

      .contact-info a {
        color: #000;
        text-decoration: underline;
        font-weight: 500;
        margin: 0 10px;
      }

      .contact-info a:hover {
        color: #000;
      }

      .contact-info .icon {
        margin-right: 5px;
        vertical-align: middle;
        font-size: 16px;
      }

      .footer {
        font-size: 11px;
        text-align: center;
        padding: 15px 30px;
        color: #888;
        background-color: #f8f8f8;
        border-top: 1px solid #eee;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
          font-size: 12px;
          color: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .container {
          border: none;
          box-shadow: none;
          margin: 0;
          max-width: 100%;
        }

        .header,
        .ticket-info,
        .section,
        .contact-info,
        .footer {
          padding: 15px 20px;
        }

        .header {
          background-color: #e0e0e0 !important;
          color: #000 !important;
          border-bottom: 1px solid #bbb;
        }

        .header .logo {
          filter: none;
        }

        .ticket-info {
          background-color: #f5f5f5 !important;
        }

        .barcode-number {
          border: 1px solid #777 !important;
        }

        .section-title::after {
          background-color: #444 !important;
        }

        th {
          background-color: #f0f0f0 !important;
        }

        .layover-note {
          background-color: #fff8e1 !important;
          border-left-color: #d4a700 !important;
          color: #5a4b00 !important;
        }

        .inspirational-quote {
          background-color: #edf5ff !important;
          border-left-color: #a0a0a0 !important;
        }

        .contact-info a {
          color: #000 !important;
          text-decoration: underline !important;
        }

        .footer {
          background-color: #f0f0f0 !important;
          color: #666 !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${
          logoDataUri
            ? `<img style="height: 50px; width: auto" src="${logoDataUri}" alt="${AIRLINE_BRAND.name} Logo" class="logo" />`
            : `<strong style="font-size: 20px;">${AIRLINE_BRAND.name}</strong>`
        }
        <h1>e-Ticket Receipt</h1>
      </div>

      <div class="ticket-info">
        ${
          qrCodeDataUri
            ? `<div class="qr-code"><img src="${qrCodeDataUri}" alt="Booking QR code" /></div>`
            : ""
        }
        <div class="ticket-numbers">
          <p class="barcode-text">Ticket Number</p>
          <div class="barcode-number">${AIRLINE_BRAND.code}-${ticketNumber}</div>
          <p class="barcode-text">Booking Reference / PNR</p>
          <div class="pnr-number">${bookingReference}</div>
        </div>
      </div>

      <!-- Passenger Information -->
      <div class="section">
        <div class="section-title">Passenger Information</div>
        <table>
          <tr>
            <td><strong>Name:</strong><br />${passenger.title} ${
  passenger.firstName
} ${passenger.lastName}</td>
            <td><strong>Email:</strong><br />${passenger.email}</td>
          </tr>
          <tr>
            <td><strong>Phone:</strong><br />${passenger.phoneNumber}</td>
            <td><strong>Country:</strong><br />${passenger.country}</td>
          </tr>
        </table>
      </div>

      <!-- Booking Information -->
      <div class="section">
        <div class="section-title">Booking Information</div>
        <table>
          <tr>
            <td><strong>Booking Reference / PNR:</strong><br />${bookingReference}</td>
            <td><strong>Booking Date:</strong><br />${bookingDate}</td>
            <td><strong>Booking Time:</strong><br />${bookingTime}</td>
            <td><strong>Status:</strong><br />CONFIRMED</td>
          </tr>
        </table>
      </div>

      <!-- Flight Details -->
      <div class="section">
        <div class="section-title">Flight Details</div>
        ${flights
          .map((flight, i) =>
            renderItinerary(flight, seatNumbers?.[i] || "N/A", getLegLabel(flights, i))
          )
          .join("")}
        <p class="fare-notes">
          <strong>Fare Basis:</strong> YCUS0 — Economy, Non-Refundable &nbsp;•&nbsp;
          <strong>Baggage Allowance:</strong> 25KG x 2 per passenger &nbsp;•&nbsp;
          <strong>Check-in:</strong> Opens 24h before departure, closes 45 min prior
        </p>
      </div>

      <!-- Fare Summary -->
      <div class="section">
        <div class="section-title">Fare Summary</div>
        <table>
          <tr>
            <td>
              <strong>Base Fare:</strong><br />$${formatCurrency(
                generateTaxesAndFees(totalPrice).fees
              )}
            </td>
            <td>
              <strong>Taxes & Fees:</strong><br />$${formatCurrency(
                generateTaxesAndFees(totalPrice).tax
              )} (15% tax) + $50 (flat fee)
            </td>
          </tr>
          <tr>
            <td colspan="2" class="total-price">
              <strong>Total Paid:</strong> $${formatCurrency(totalPrice)}
            </td>
          </tr>
          <tr>
            <td colspan="2"><strong>Payment Method:</strong> Card (via Stripe)</td>
          </tr>
        </table>
        <p class="terms">
          This e-ticket is issued subject to ${AIRLINE_BRAND.name}'s conditions of carriage.
          Fares are non-refundable; date changes may incur a fee. Please arrive at the
          airport at least 2 hours before scheduled departure. This document, together
          with a valid photo ID, must be presented at check-in.
        </p>
      </div>

      <div class="section">
        <div class="inspirational-quote">
          "The sky is not the limit — it's where your story begins. We look forward to welcoming you aboard."
        </div>
      </div>

      <div class="contact-info">
        <p>Need assistance or have questions?</p>
        <div>
          <a href="mailto:${AIRLINE_BRAND.supportEmail}"><span class="icon">📧</span>${AIRLINE_BRAND.supportEmail}</a>
          <a href="${AIRLINE_BRAND.website}"><span class="icon">🌐</span>${AIRLINE_BRAND.website.replace("https://", "")}</a>
        </div>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} ${AIRLINE_BRAND.name}. All rights reserved. Thank you for choosing ${AIRLINE_BRAND.name}.
      </div>
    </div>
  </body>
</html>
`;

export default TicketDetailsTemplate;
