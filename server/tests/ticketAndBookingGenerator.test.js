import { describe, expect, it } from "vitest";
import {
  generateBookingReference,
  generateTicketNumber,
  generateSeatNumbers,
  generateRandomTerminal,
  generateCabinZone,
  generateTaxesAndFees,
} from "../utils/ticketAndBookingGenerator.js";

describe("generateBookingReference", () => {
  it("returns a 6-character alphanumeric reference", () => {
    const reference = generateBookingReference();
    expect(reference).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("is not obviously deterministic across calls", () => {
    const references = new Set(
      Array.from({ length: 20 }, () => generateBookingReference()),
    );
    expect(references.size).toBeGreaterThan(1);
  });
});

describe("generateTicketNumber", () => {
  it("prefixes the airline code and appends 10 digits", () => {
    const ticketNumber = generateTicketNumber("QA");
    expect(ticketNumber).toMatch(/^QA\d{10}$/);
  });
});

describe("generateSeatNumbers", () => {
  it("returns a row (10-40) plus a letter A-F", () => {
    for (let i = 0; i < 20; i++) {
      const seat = generateSeatNumbers();
      const match = seat.match(/^(\d+)([A-F])$/);
      expect(match).not.toBeNull();
      const row = Number(match[1]);
      expect(row).toBeGreaterThanOrEqual(10);
      expect(row).toBeLessThanOrEqual(40);
    }
  });
});

describe("generateRandomTerminal", () => {
  it("returns either a lettered or numbered terminal", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateRandomTerminal()).toMatch(/^(Terminal [A-D]|T[1-4])$/);
    }
  });
});

describe("generateCabinZone", () => {
  it("returns Zone 1 through 5", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateCabinZone()).toMatch(/^Zone [1-5]$/);
    }
  });
});

describe("generateTaxesAndFees", () => {
  it("splits a total price into tax (15%) and a display-only fee remainder", () => {
    const { tax, fees } = generateTaxesAndFees(1000);
    expect(tax).toBeCloseTo(150, 2);
    expect(fees).toBeCloseTo(1000 - 150 - 50, 2);
  });
});
