export function generateBookingReference() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let reference = "";
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

export function generateTicketNumber(airlineCode = "123") {
  let number = airlineCode;
  for (let i = 0; i < 10; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
}

export function generateSeatNumbers(rows = 40, seatsPerRow = "ABCDEF") {
  const row = Math.floor(Math.random() * (rows - 9)) + 10; // Rows 10 to 40
  const seat = seatsPerRow[Math.floor(Math.random() * seatsPerRow.length)];
  return `${row}${seat}`;
}

export function generateRandomTerminal(count = 4) {
  const isLetterBased = Math.random() < 0.5; // 50% chance for each style

  const index = Math.floor(Math.random() * count);

  if (isLetterBased) {
    const letter = String.fromCharCode(65 + index); // A = 65
    return `Terminal ${letter}`;
  } else {
    return `T${index + 1}`;
  }
}

export function generateCabinZone() {
  const zone = Math.floor(Math.random() * 5) + 1; // Generates 1–5
  return `Zone ${zone}`;
}

export function generateTaxesAndFees(price) {
  const taxRate = 0.15; // 15% tax rate
  const fees = price - price * 0.15 - 50; // Flat fee of $50
  const tax = price * taxRate;
  return {
    tax: parseFloat(tax.toFixed(2)),
    fees: parseFloat(fees.toFixed(2)),
  };
}
