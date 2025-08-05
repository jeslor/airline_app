import {
  generateTaxesAndFees,
  generateTicketNumber,
} from "../utils/ticketAndBookingGenerator.js";

const TicketDetailsTemplate = (
  passenger,
  outboundFlight,
  returnFlight,
  currentPrice,
  bookingReference,
  bookingDate,
  bookingTime
) => `
 <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Quencer Airlines | e-Ticket Receipt</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: "Inter", sans-serif;
        font-size: 14px;
        margin: 0;
        padding: 20px; /* Reduced padding for print efficiency */
        color: #333;
        background-color: #ffffff; /* White background for print */
        line-height: 1.5;
      }

      .container {
        max-width: 750px; /* Slightly narrower for print */
        margin: 0 auto;
        border: 1px solid #ccc; /* Simple border for defining the ticket area */
        box-shadow: none; /* No shadow for print */
        border-radius: 0; /* No rounded corners for print */
        overflow: hidden;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        background-color: #f0f0f0; /* Light grey header for print, saves ink */
        color: #333;
        border-bottom: 1px solid #ccc;
      }

      .header .logo {
        width: 150px; /* Slightly smaller logo */
        filter: none; /* Original color for print */
      }

      .header h1 {
        font-size: 24px;
        margin: 0;
        font-weight: 700;
        letter-spacing: 0.2px;
        color: #000; /* Black for print */
      }

      .ticket-info {
        padding: 15px 30px;
        background-color: #f8f8f8; /* Very light background for this section */
        text-align: right;
        border-bottom: 1px dashed #ddd; /* Dashed line for visual separation */
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
        border: 1px solid #999; /* Solid border for print clarity */
        border-radius: 4px;
        color: #000;
        display: inline-block;
        letter-spacing: 1px;
      }

      .section {
        padding: 20px 30px;
        border-bottom: 1px solid #eee;
      }

      .section:last-of-type {
        border-bottom: none; /* No border on the last section */
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
        background-color: #666; /* Darker line for print */
        border-radius: 1px;
      }

      table {
        width: 100%;
        border-collapse: collapse; /* Collapsed borders for tighter print layout */
        margin-top: 10px;
        background: #ffffff;
      }

      th,
      td {
        padding: 10px 0; /* Reduced padding */
        text-align: left;
        border-bottom: 1px solid #f0f0f0; /* Very light border */
      }

      th {
        background-color: #f8f8f8; /* Lightest grey for headers */
        color: #444;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        padding-left: 10px; /* Small indent for header text */
      }

      td {
        padding-left: 10px;
      }

      td strong {
        color: #000; /* Black for print clarity */
        font-weight: 600;
      }

      tr:last-child td {
        border-bottom: none;
      }

      .flight-details-table td {
        font-weight: 500; /* Slightly bolder for flight details */
      }

      .total-price {
        font-size: 18px;
        font-weight: 700;
        color: #000; /* Black for print */
        text-align: right;
        padding-right: 10px;
        padding-top: 15px;
      }

      .note {
        font-size: 13px;
        margin-top: 20px;
        padding: 10px 15px;
        background-color: #fffacd; /* Lighter warning yellow */
        border-left: 4px solid #ccaa00; /* Darker orange accent */
        color: #665500;
        border-radius: 4px;
      }

      .inspirational-quote {
        margin-top: 25px;
        padding: 15px 20px;
        background-color: #f5fafd; /* Very light blue */
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
        color: #000; /* Black for print */
        text-decoration: underline; /* Underline for print links */
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

      /* --- Print Specific Styles --- */
      @media print {
        body {
          margin: 0;
          padding: 0;
          font-size: 12px; /* Smaller font for print */
          color: #000; /* Ensure all text is black for clarity */
          -webkit-print-color-adjust: exact; /* For background colors on some elements */
          print-color-adjust: exact;
        }

        .container {
          border: none; /* No border in print */
          box-shadow: none;
          margin: 0;
          max-width: 100%;
        }

        .header,
        .ticket-info,
        .section,
        .contact-info,
        .footer {
          padding: 15px 20px; /* Reduced padding for print */
        }

        .header {
          background-color: #e0e0e0 !important; /* Force light grey background for header */
          color: #000 !important;
          border-bottom: 1px solid #bbb;
        }

        .header .logo {
          filter: none; /* Ensure logo prints in its original colors */
        }

        .ticket-info {
          background-color: #f5f5f5 !important; /* Lighter background for ticket info */
        }

        .barcode-number {
          border: 1px solid #777 !important;
        }

        .section-title::after {
          background-color: #444 !important;
        }

        th {
          background-color: #f0f0f0 !important; /* Lighter header background */
        }

        .note {
          background-color: #fff8e1 !important; /* Lighter yellow for notes */
          border-left-color: #d4a700 !important;
          color: #5a4b00 !important;
        }

        .inspirational-quote {
          background-color: #edf5ff !important; /* Lighter blue for quote */
          border-left-color: #a0a0a0 !important; /* Darker border for contrast */
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
          src="https://jeslor-child-sponsor-platform-app.s3.us-east-1.amazonaws.com/quencer_logo.png"
          alt="Quencer Airlines Logo"
          class="logo"
        />
        <h1>e-Ticket Receipt</h1>
      </div>

      <div class="ticket-info">
        <p class="barcode-text">
          Scan this code or use the ticket number below for quick check-in.
        </p>
        <div class="barcode-number">QA-${generateTicketNumber()}</div>
      </div>

      <div class="section">
        <div class="section-title">Passenger Information</div>
        <table>
          <tr>
            <td>
              <strong>Name:</strong>
              <br />
              ${passenger.firstName} ${passenger.lastName}
            </td>
            <td>
              <strong>Email:</strong>
              <br />
              ${passenger.email}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Phone:</strong>
              <br />
              ${passenger.phoneNumber}
            </td>
            <td>
              <strong>Country:</strong>
              <br />
              ${passenger.country}
            </td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Flight Details</div>
        <table class="flight-details-table">
          <tr>
            <th>Outbound Flight</th>
            <th>Departure Date</th>
            <th>Departure Time</th>
            <th>Arrival Date</th>
            <th>Arrival Time</th>
          </tr>
          <tr>
            <td>${outboundFlight.flightNumber} - CONFIRMED</td>
            <td>${outboundFlight.departureDate}</td>
            <td>${outboundFlight.departureCity} ${
  outboundFlight.departureTime
}</td>
            <td>${outboundFlight.arrivalDate}</td>
            <td>${outboundFlight.arrivalCity} ${outboundFlight.arrivalTime}</td>
          </tr>
          <tr>
            <th>Return Flight</th>
            <th>Departure Date</th>
            <th>Departure Time</th>
            <th>Arrival Date</th>
            <th>Arrival Time</th>
          </tr>
          <tr>
            <td>${returnFlight.flightNumber} - CONFIRMED</td>
            <td>${returnFlight.departureDate}</td>
            <td>${returnFlight.departureCity}  ${
  returnFlight.departureTime
}</td>
            <td>${returnFlight.arrivalDate}</td>
            <td>${returnFlight.arrivalCity} ${returnFlight.arrivalTime}</td>
          </tr>
          <tr>
            <td colspan="5">
              <strong>Baggage Allowance:</strong>
              ${"25KG x 2 per passenger"}
            </td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Fare Summary</div>
        <table>
          <tr>
            <td>
              <strong>Base Fare:</strong>
              <br />
              $${currentPrice - currentPrice * 0.15 - 50}
            </td>
            <td>
              <strong>Taxes & Fees:</strong>
              <br />
              $${currentPrice * 0.15} (15% tax) + $50 (flat fee)
            </td>
          </tr>
          <tr>
            <td colspan="2" class="total-price">
              <strong>Total Price:</strong>
              $${currentPrice.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>Payment Method:</strong>
              ${"Credit Card"}
            </td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="inspirational-quote">
          "The sky is not the limit — it's where your story begins. We look
          forward to welcoming you aboard."
        </div>
      </div>

      <div class="contact-info">
        <p>Need assistance or have questions?</p>
        <div>
          <a href="mailto:support@quencerairlines.com">
            <span class="icon">📧</span>
            support@quencerairlines.com
          </a>
          <a href="https://www.quencerairlines.com">
            <span class="icon">🌐</span>
            www.quencerairlines.com
          </a>
        </div>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} Quencer Airlines. All rights reserved.
        Thank you for choosing Quencer Airlines.
      </div>
    </div>
  </body>   
</html>

`;

export default TicketDetailsTemplate;
