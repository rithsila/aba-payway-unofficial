import { describe, it, expect } from "vitest";
import {
  generateTransactionId,
  getABATimestamp,
  formatPhoneForABA,
  getQRExpiration,
} from "../src/utils";

describe("generateTransactionId", () => {
  it("returns a string with EA prefix", () => {
    expect(generateTransactionId().startsWith("EA")).toBe(true);
  });
  it("is at most 20 characters long", () => {
    expect(generateTransactionId().length).toBeLessThanOrEqual(20);
  });
  it("contains only alphanumeric characters", () => {
    expect(generateTransactionId()).toMatch(/^[A-Za-z0-9]+$/);
  });
  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateTransactionId()));
    expect(ids.size).toBe(100);
  });
});

describe("getABATimestamp", () => {
  it("returns a 14-character YYYYMMDDHHmmss string", () => {
    expect(getABATimestamp()).toMatch(/^\d{14}$/);
  });
});

describe("formatPhoneForABA", () => {
  it("converts +855 prefix to 0", () => {
    expect(formatPhoneForABA("+855123456")).toBe("0123456");
  });
  it("converts 855 prefix to 0", () => {
    expect(formatPhoneForABA("855123456")).toBe("0123456");
  });
  it("keeps 0-prefixed numbers unchanged", () => {
    expect(formatPhoneForABA("012345678")).toBe("012345678");
  });
  it("strips spaces and dashes", () => {
    expect(formatPhoneForABA("012 345-678")).toBe("012345678");
  });
  it("returns empty string for empty input", () => {
    expect(formatPhoneForABA("")).toBe("");
  });
});

describe("getQRExpiration", () => {
  it("returns a date 15 minutes in the future", () => {
    const now = Date.now();
    const diff = getQRExpiration().getTime() - now;
    expect(diff).toBeGreaterThan(14 * 60 * 1000);
    expect(diff).toBeLessThan(16 * 60 * 1000);
  });
});
