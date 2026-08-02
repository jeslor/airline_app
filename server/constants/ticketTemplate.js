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

const flightRow = (flight, seatNumber) => `
  <tr>
    <td>${flight.flightNumber} - CONFIRMED</td>
    <td>${flight.departureDate}</td>
    <td>${flight.departureCity} ${flight.departureTime}</td>
    <td>${flight.arrivalDate}</td>
    <td>${flight.arrivalCity} ${flight.arrivalTime}</td>
    <td>${generateRandomTerminal()}</td>
    <td>${generateCabinZone()}</td>
    <td><strong>${seatNumber}</strong></td>
  </tr>
`;

// ticketNumber and the seat numbers must be generated once (at payment
// confirmation) and persisted on the Booking, then passed in here — never
// regenerated on each render, or the PDF/email/DB would disagree with each
// other on the passenger's actual seat/ticket number.
const TicketDetailsTemplate = ({
  passenger,
  outboundFlight,
  returnFlight,
  totalPrice,
  bookingReference,
  bookingDate,
  bookingTime,
  ticketNumber,
  seatNumberOutbound,
  seatNumberReturn,
  qrCodeDataUri,
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${AIRLINE_BRAND.name} | e-Ticket Receipt</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: "Inter", sans-serif;
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

      .flight-details-table td {
        font-weight: 500;
      }

      .total-price {
        font-size: 18px;
        font-weight: 700;
        color: #000;
        text-align: right;
        padding-right: 10px;
        padding-top: 15px;
      }

      .note {
        font-size: 13px;
        margin-top: 20px;
        padding: 10px 15px;
        background-color: #fffacd;
        border-left: 4px solid #ccaa00;
        color: #665500;
        border-radius: 4px;
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

        .note {
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
        <img
          style="height: 50px; width: auto"
          src="${AIRLINE_BRAND.logoUrl}"
          alt="${AIRLINE_BRAND.name} Logo"
          class="logo"
        />
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
        <table class="flight-details-table">
          <tr>
            <th>Outbound Flight</th>
            <th>Departure Date</th>
            <th>Departure Time</th>
            <th>Arrival Date</th>
            <th>Arrival Time</th>
            <th>Terminal</th>
            <th>Boarding Zone</th>
            <th>Seat</th>
          </tr>
          ${flightRow(outboundFlight, seatNumberOutbound)}
          <tr>
            <th>Return Flight</th>
            <th>Departure Date</th>
            <th>Departure Time</th>
            <th>Arrival Date</th>
            <th>Arrival Time</th>
            <th>Terminal</th>
            <th>Boarding Zone</th>
            <th>Seat</th>
          </tr>
          ${flightRow(returnFlight, seatNumberReturn)}
          <tr>
            <td colspan="8">
              <strong>Fare Basis:</strong> YCUS0 — Economy, Non-Refundable &nbsp;•&nbsp;
              <strong>Baggage Allowance:</strong> 25KG x 2 per passenger &nbsp;•&nbsp;
              <strong>Check-in:</strong> Opens 24h before departure, closes 45 min prior
            </td>
          </tr>
        </table>
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
