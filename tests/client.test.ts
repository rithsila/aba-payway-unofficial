import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ABAPayWay } from "../src/client";

const TEST_CONFIG = {
  merchantId: "TEST_MERCHANT",
  apiKey: "TEST_API_KEY",
  baseUrl: "https://checkout-sandbox.payway.com.kh",
} as const;

// Parse the body of the first fetch call (each test makes one call).
function firstBody(fetchSpy: ReturnType<typeof vi.fn>): string {
  return fetchSpy.mock.calls[0][1].body as string;
}

// Reproduce ABA's official callback signature: sort fields by key
// ascending, concatenate values (JSON-encode nested objects), then
// HMAC-SHA512 with the secret and Base64-encode.
async function abaCallbackSignature(
  obj: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const b4hash = Object.keys(obj)
    .sort()
    .map((k) => {
      const v = obj[k];
      return v !== null && typeof v === "object" ? JSON.stringify(v) : String(v);
    })
    .join("");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(b4hash));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

describe("ABAPayWay", () => {
  let aba: ABAPayWay;
  beforeEach(() => {
    aba = new ABAPayWay(TEST_CONFIG);
  });

  describe("constructor", () => {
    it("stores config immutably", () => {
      expect(aba.config.merchantId).toBe("TEST_MERCHANT");
    });
    it("throws if merchantId is missing", () => {
      expect(
        () =>
          new ABAPayWay({ merchantId: "", apiKey: "key", baseUrl: "https://example.com" }),
      ).toThrow("merchantId is required");
    });
    it("throws if apiKey is missing", () => {
      expect(
        () =>
          new ABAPayWay({ merchantId: "id", apiKey: "", baseUrl: "https://example.com" }),
      ).toThrow("apiKey is required");
    });
  });

  describe("createPurchase", () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 0,
            description: "Success",
            checkout_qr_url: "https://checkout-sandbox.payway.com.kh/checkout/abc123",
            abapay_deeplink: "abapay://pay?token=abc123",
            qr_string: "00020101021229370016KHQR-MOCK-DATA",
          }),
      });
      vi.stubGlobal("fetch", fetchSpy);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("calls the purchase endpoint and reads checkout_qr_url", async () => {
      const result = await aba.createPurchase({
        transactionId: "EA001",
        amount: 15.0,
        currency: "USD",
        items: "Monthly Plan",
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        phone: "012345678",
      });
      expect(fetchSpy.mock.calls[0][0]).toContain(
        "/api/payment-gateway/v1/payments/purchase",
      );
      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toContain("checkout");
      expect(result.qrString).toBeTruthy();
    });

    it("formats a USD amount with two decimals", async () => {
      await aba.createPurchase({ transactionId: "EA1", amount: 15, currency: "USD" });
      const body = new URLSearchParams(firstBody(fetchSpy));
      expect(body.get("amount")).toBe("15.00");
    });

    it("formats a KHR amount as a whole number (no decimals)", async () => {
      await aba.createPurchase({ transactionId: "EA2", amount: 10000, currency: "KHR" });
      const body = new URLSearchParams(firstBody(fetchSpy));
      expect(body.get("amount")).toBe("10000");
    });

    it("Base64-encodes the return and cancel URLs", async () => {
      await aba.createPurchase({
        transactionId: "EA3",
        amount: 1,
        currency: "USD",
        returnUrl: "https://shop.com/success",
        cancelUrl: "https://shop.com/cancel",
      });
      const body = new URLSearchParams(firstBody(fetchSpy));
      expect(body.get("return_url")).toBe(btoa("https://shop.com/success"));
      expect(body.get("cancel_url")).toBe(btoa("https://shop.com/cancel"));
    });

    it("succeeds when the response wraps status as an object", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { code: "00", message: "Success." },
            qr_string: "00020101-OBJECT-ENVELOPE",
          }),
      });
      const result = await aba.createPurchase({
        transactionId: "EA4",
        amount: 1,
        currency: "USD",
      });
      expect(result.success).toBe(true);
      expect(result.qrString).toBeTruthy();
    });

    it("returns error when API fails", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      });
      const result = await aba.createPurchase({
        transactionId: "EA002",
        amount: 15.0,
        currency: "USD",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("checkStatus", () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { code: "00", message: "Success." },
            data: {
              payment_status: "APPROVED",
              payment_status_code: 0,
              payment_amount: 15.0,
              payment_currency: "USD",
              apv: "123456",
            },
          }),
      });
      vi.stubGlobal("fetch", fetchSpy);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("calls check-transaction-2 with a JSON body", async () => {
      const result = await aba.checkStatus("EA001");
      expect(fetchSpy.mock.calls[0][0]).toContain(
        "/api/payment-gateway/v1/payments/check-transaction-2",
      );
      const headers = fetchSpy.mock.calls[0][1].headers;
      expect(headers["Content-Type"]).toBe("application/json");
      const body = JSON.parse(firstBody(fetchSpy));
      expect(body.tran_id).toBe("EA001");
      expect(body.hash).toBeTruthy();
    });

    it("parses the nested data envelope into an APPROVED status", async () => {
      const result = await aba.checkStatus("EA001");
      expect(result.success).toBe(true);
      expect(result.status).toBe("APPROVED");
      expect(result.amount).toBe(15.0);
      expect(result.currency).toBe("USD");
    });

    it("maps PENDING from payment_status", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { code: "00" },
            data: { payment_status: "PENDING" },
          }),
      });
      const result = await aba.checkStatus("EA001");
      expect(result.status).toBe("PENDING");
    });

    it("maps CANCELLED from payment_status", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { code: "00" },
            data: { payment_status: "CANCELLED" },
          }),
      });
      const result = await aba.checkStatus("EA001");
      expect(result.status).toBe("CANCELLED");
    });

    it("returns an error when the outer status code is not 00", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: { code: "6", message: "Transaction not found" },
          }),
      });
      const result = await aba.checkStatus("MISSING");
      expect(result.success).toBe(false);
      expect(result.status).toBe("ERROR");
      expect(result.error).toContain("Transaction not found");
    });
  });

  describe("verifyWebhook", () => {
    it("returns true for a signature built the way ABA builds it", async () => {
      const secret = "test_secret";
      const callback = {
        tran_id: "17425401324",
        apv: "619195",
        status: "0",
        return_params: "xxxxxxxxxx",
      };
      const payload = JSON.stringify(callback);
      const signature = await abaCallbackSignature(callback, secret);
      expect(await aba.verifyWebhook(payload, signature, secret)).toBe(true);
    });

    it("is independent of JSON key order in the raw body", async () => {
      const secret = "test_secret";
      const callback = { tran_id: "1", apv: "2", status: "0" };
      // Signature computed from the object (sorted), but the raw body
      // lists keys in a different order.
      const signature = await abaCallbackSignature(callback, secret);
      const reorderedBody = '{"status":"0","tran_id":"1","apv":"2"}';
      expect(await aba.verifyWebhook(reorderedBody, signature, secret)).toBe(true);
    });

    it("handles numeric callback fields (e.g. apv as a number)", async () => {
      const secret = "test_secret";
      const callback = { tran_id: "123456789", apv: 123456, status: "0" };
      const payload = JSON.stringify(callback);
      const signature = await abaCallbackSignature(callback, secret);
      expect(await aba.verifyWebhook(payload, signature, secret)).toBe(true);
    });

    it("returns false for an invalid signature", async () => {
      expect(
        await aba.verifyWebhook('{"tran_id":"1","status":"0"}', "invalid", "secret"),
      ).toBe(false);
    });

    it("returns false for a non-JSON payload", async () => {
      expect(await aba.verifyWebhook("not json", "sig", "secret")).toBe(false);
    });
  });
});
