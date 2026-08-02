import { describe, expect, it, beforeAll } from "vitest";
import { signOffer, verifyOffer } from "../utils/offerSigning.js";

const baseOffer = {
  flightNumber: "QF1234",
  departureAirportCode: "JFK",
  arrivalAirportCode: "LAX",
  departureDate: "January 15, 2025",
  departureTime: "08:00 AM",
  price: 450,
};

beforeAll(() => {
  process.env.OFFER_SIGNING_SECRET = "test-secret-do-not-use-in-production";
});

describe("offerSigning", () => {
  it("verifies an offer it just signed", () => {
    const signed = signOffer(baseOffer);
    expect(verifyOffer(signed)).toBe(true);
  });

  it("rejects an offer with a tampered price", () => {
    const signed = signOffer(baseOffer);
    const tampered = { ...signed, price: 1 };
    expect(verifyOffer(tampered)).toBe(false);
  });

  it("rejects an offer with a tampered flight number", () => {
    const signed = signOffer(baseOffer);
    const tampered = { ...signed, flightNumber: "QF9999" };
    expect(verifyOffer(tampered)).toBe(false);
  });

  it("rejects an offer signed with a different secret", () => {
    const signed = signOffer(baseOffer);
    const originalSecret = process.env.OFFER_SIGNING_SECRET;
    process.env.OFFER_SIGNING_SECRET = "a-different-secret";
    try {
      expect(verifyOffer(signed)).toBe(false);
    } finally {
      process.env.OFFER_SIGNING_SECRET = originalSecret;
    }
  });

  it("rejects an expired offer", () => {
    const signed = signOffer(baseOffer);
    const expired = { ...signed, issuedAt: Date.now() - 31 * 60 * 1000 };
    expect(verifyOffer(expired)).toBe(false);
  });

  it("rejects a malformed offer", () => {
    expect(verifyOffer(null)).toBe(false);
    expect(verifyOffer({})).toBe(false);
    expect(verifyOffer({ ...baseOffer })).toBe(false); // never signed
  });
});
