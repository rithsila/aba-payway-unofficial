import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64 } from "../src/hash";

describe("ABAPayWay.getTransactionsByRef", () => {
  const BASE_CONFIG = {
    merchantId: "ec000001",
    apiKey: "test_api_key",
    baseUrl: "https://checkout-sandbox.payway.com.kh",
  };

  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails when merchantRef is missing", async () => {
    const client = new ABAPayWay(BASE_CONFIG);
    const result = await client.getTransactionsByRef({ merchantRef: "" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("merchantRef is required");
  });

  it("successfully fetches transactions by merchant ref and verifies hash", async () => {
    const client = new ABAPayWay(BASE_CONFIG);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: { code: "00", message: "Success" },
          data: [
            {
              transaction_id: "TXN001",
              transaction_date: "2026-09-13 10:00:00",
              apv: "123456",
              payment_status: "APPROVED",
              payment_status_code: 2,
              original_amount: "25.00",
              original_currency: "USD",
              total_amount: "25.00",
              payment_amount: "25.00",
              payment_currency: "USD",
              first_name: "Dara",
              last_name: "Sok",
              email: "dara@example.com",
              phone: "012345678",
              payer_account: "000123456",
              bank_name: "ABA Bank",
              payment_type: "ABA PAY",
            },
          ],
        }),
    });

    const result = await client.getTransactionsByRef({ merchantRef: "REF12345" });
    expect(result.success).toBe(true);
    expect(result.merchantRef).toBe("REF12345");
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].transactionId).toBe("TXN001");
    expect(result.transactions[0].paymentStatus).toBe("APPROVED");
    expect(result.transactions[0].totalAmount).toBe(25);
    expect(result.transactions[0].firstName).toBe("Dara");
    expect(result.transactions[0].bankName).toBe("ABA Bank");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/get-transactions-by-mc-ref"
    );
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.merchant_id).toBe("ec000001");
    expect(body.merchant_ref).toBe("REF12345");
    expect(body.req_time).toMatch(/^\d{14}$/);

    const expectedHash = await hmacSha512Base64(
      `${body.req_time}${body.merchant_id}${body.merchant_ref}`,
      "test_api_key"
    );
    expect(body.hash).toBe(expectedHash);
  });

  it("handles empty transaction array when no matches found", async () => {
    const client = new ABAPayWay(BASE_CONFIG);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: { code: "00", message: "Success" },
          data: [],
        }),
    });

    const result = await client.getTransactionsByRef({ merchantRef: "NON_EXISTENT" });
    expect(result.success).toBe(true);
    expect(result.transactions).toEqual([]);
  });

  it("handles ABA API error response", async () => {
    const client = new ABAPayWay(BASE_CONFIG);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: { code: "11", message: "Invalid Merchant ID" },
        }),
    });

    const result = await client.getTransactionsByRef({ merchantRef: "REF12345" });
    expect(result.success).toBe(false);
    expect(result.code).toBe("11");
    expect(result.message).toBe("Invalid Merchant ID");
  });
});
