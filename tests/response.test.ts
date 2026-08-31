import { describe, it, expect } from "vitest";
import { readAbaStatus } from "../src/response";

describe("readAbaStatus", () => {
  // The v3 sandbox reports success as the string "00" inside a nested object.
  // Reading that as a failure is what made a valid key look broken.
  it("treats the v3 nested \"00\" code as success", () => {
    const status = readAbaStatus({
      description: "success",
      status: { version: "v3", code: "00", message: "Success!" },
    });
    expect(status).toEqual({ code: "00", ok: true, message: "Success!" });
  });

  it("treats the legacy flat numeric 0 as success", () => {
    const status = readAbaStatus({ status: 0, description: "Success" });
    expect(status.ok).toBe(true);
    expect(status.code).toBe("0");
  });

  it("reports a v3 failure with its code and message", () => {
    const status = readAbaStatus({ status: { code: 1, message: "Wrong Hash." } });
    expect(status).toEqual({ code: "1", ok: false, message: "Wrong Hash." });
  });

  it("reports a legacy failure with its description", () => {
    const status = readAbaStatus({ status: 6, description: "tran_id not found" });
    expect(status).toEqual({ code: "6", ok: false, message: "tran_id not found" });
  });

  it("surfaces an expired API key (code 21)", () => {
    const status = readAbaStatus({ status: { code: 21, message: "End of API lifetime" } });
    expect(status.ok).toBe(false);
    expect(status.code).toBe("21");
  });

  // Number("") is 0, so a body with no status must not read as success.
  it("does not treat a missing status as success", () => {
    expect(readAbaStatus({}).ok).toBe(false);
    expect(readAbaStatus({ status: "" }).ok).toBe(false);
    expect(readAbaStatus(null).ok).toBe(false);
    expect(readAbaStatus({ status: {} }).ok).toBe(false);
  });

  it("falls back to a generic message when none is given", () => {
    expect(readAbaStatus({ status: 9 }).message).toBe("Unknown error");
  });
});
