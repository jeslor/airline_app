import crypto from "crypto";

// Flights are generated fresh per search (not stable DB inventory), so a
// client could otherwise submit any price it wants when booking. Every
// flight offer returned by /api/flights is signed with this HMAC so that
// /api/bookings can verify the offer (and its price) actually came from us
// and hasn't been tampered with or replayed after it expires.
const OFFER_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSecret() {
  const secret = process.env.OFFER_SIGNING_SECRET;
  if (!secret) {
    throw new Error("OFFER_SIGNING_SECRET is not configured");
  }
  return secret;
}

function canonicalPayload(offer, offerId, issuedAt) {
  return JSON.stringify({
    offerId,
    issuedAt,
    flightNumber: offer.flightNumber,
    departureAirportCode: offer.departureAirportCode,
    arrivalAirportCode: offer.arrivalAirportCode,
    departureDate: offer.departureDate,
    departureTime: offer.departureTime,
    price: offer.price,
  });
}

export function signOffer(offer) {
  const offerId = crypto.randomUUID();
  const issuedAt = Date.now();
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(canonicalPayload(offer, offerId, issuedAt))
    .digest("hex");

  return { ...offer, offerId, issuedAt, signature };
}

export function verifyOffer(offer) {
  if (!offer || typeof offer !== "object") return false;

  const { offerId, issuedAt, signature } = offer;
  if (!offerId || !issuedAt || !signature) return false;
  if (Date.now() - issuedAt > OFFER_TTL_MS) return false;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(canonicalPayload(offer, offerId, issuedAt))
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
