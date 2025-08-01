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
