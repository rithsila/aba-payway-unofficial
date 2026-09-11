import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64 } from "../src/hash";

describe("Ecommerce Checkout Endpoints", () => {
  const TEST_CONFIG = {
    merchantId: "ec000002",
    apiKey: "test_api_key",
    baseUrl: "https://checkout-sandbox.payway.com.kh",
  };

  let client: ABAPayWay;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new ABAPayWay(TEST_CONFIG);
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getExchangeRates", () => {
    it("successfully fetches and normalizes exchange rates", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            exchange_rates: {
              aud: { buy: "2600.00", sell: "2700.00" },
              sgd: { buy: "3000.00", sell: "3100.00" },
            },
            thb: { buy: "115.00", sell: "120.00" },
            cny: { buy: "550.00", sell: "570.00" },
          }),
      });

      const response = await client.getExchangeRates();

      expect(response.success).toBe(true);
      expect(response.code).toBe("00");
      expect(response.rates).toBeDefined();
      expect(response.rates?.aud).toEqual({ buy: "2600.00", sell: "2700.00" });
      expect(response.rates?.sgd).toEqual({ buy: "3000.00", sell: "3100.00" });
      expect(response.rates?.thb).toEqual({ buy: "115.00", sell: "120.00" });
      expect(response.rates?.cny).toEqual({ buy: "550.00", sell: "570.00" });

      // Verify request
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/exchange-rate"
      );
      const body = JSON.parse(options.body);
      expect(body.merchant_id).toBe("ec000002");
      expect(body.req_time).toMatch(/^\d{14}$/);

      const expectedHash = await hmacSha512Base64(
        `${body.req_time}${body.merchant_id}`,
        TEST_CONFIG.apiKey
      );
      expect(body.hash).toBe(expectedHash);
    });

    it("handles API error code", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "1", message: "Wrong hash" },
          }),
      });

      const response = await client.getExchangeRates();
      expect(response.success).toBe(false);
      expect(response.code).toBe("1");
      expect(response.error).toBe("Wrong hash");
    });
  });

  describe("getTransactionDetail", () => {
    it("fails when transactionId is missing", async () => {
      const response = await client.getTransactionDetail("");
      expect(response.success).toBe(false);
      expect(response.error).toBe("transactionId is required");
    });

    it("successfully retrieves deep transaction details and history", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            data: {
              transaction_id: "TXN_PAST_100",
              payment_status_code: 0,
              payment_status: "APPROVED",
              original_amount: 50.0,
              original_currency: "USD",
              payment_amount: 50.0,
              payment_currency: "USD",
              total_amount: 50.0,
              refund_amount: 0,
              discount_amount: 0,
              apv: "987654",
              transaction_date: "2026-08-01 10:00:00",
              first_name: "Dara",
              last_name: "Sok",
              email: "dara@example.com",
              phone: "012345678",
              payment_type: "KHQR",
              payer_account: "000***123",
              bank_name: "ABA Bank",
              transaction_operations: [
                {
                  status: "Completed",
                  amount: 50.0,
                  transaction_date: "2026-08-01 10:00:00",
                  bank_ref: "REF12345",
                },
              ],
              status: { code: "00", message: "Success!" },
            },
          }),
      });

      const response = await client.getTransactionDetail("TXN_PAST_100");

      expect(response.success).toBe(true);
      expect(response.transactionId).toBe("TXN_PAST_100");
      expect(response.status).toBe("APPROVED");
      expect(response.originalAmount).toBe(50.0);
      expect(response.bankName).toBe("ABA Bank");
      expect(response.payerAccount).toBe("000***123");
      expect(response.operations).toHaveLength(1);
      expect(response.operations?.[0].status).toBe("Completed");

      // Verify request
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/transaction-detail"
      );
      const body = JSON.parse(options.body);
      expect(body.tran_id).toBe("TXN_PAST_100");

      const expectedHash = await hmacSha512Base64(
        `${body.req_time}${body.merchant_id}${body.tran_id}`,
        TEST_CONFIG.apiKey
      );
      expect(body.hash).toBe(expectedHash);
    });

    it("handles transaction not found error", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "6", message: "Transaction not found" },
          }),
      });

      const response = await client.getTransactionDetail("UNKNOWN_TXN");
      expect(response.success).toBe(false);
      expect(response.code).toBe("6");
      expect(response.error).toBe("Transaction not found");
    });
  });

  describe("listTransactions", () => {
    it("successfully fetches paginated transaction list with filters", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            data: [
              {
                transaction_id: "TXN_001",
                transaction_date: "2026-09-10 14:00:00",
                apv: "111222",
                payment_status: "APPROVED",
                payment_status_code: 0,
                original_amount: 15.0,
                original_currency: "USD",
                total_amount: 15.0,
                payment_type: "KHQR",
              },
              {
                transaction_id: "TXN_002",
                transaction_date: "2026-09-10 15:30:00",
                payment_status: "REFUNDED",
                payment_status_code: 4,
                original_amount: 20.0,
                original_currency: "USD",
                total_amount: 20.0,
                refund_amount: 5.0,
                payment_type: "VISA",
              },
            ],
            page: "1",
            pagination: "40",
            status: { code: "00", message: "Success!" },
          }),
      });

      const response = await client.listTransactions({
        fromDate: "2026-09-10 00:00:00",
        toDate: "2026-09-10 23:59:59",
        status: "APPROVED,REFUNDED",
        page: 1,
        pagination: 40,
      });

      expect(response.success).toBe(true);
      expect(response.transactions).toHaveLength(2);
      expect(response.transactions[0].transactionId).toBe("TXN_001");
      expect(response.transactions[0].paymentStatus).toBe("APPROVED");
      expect(response.transactions[1].transactionId).toBe("TXN_002");
      expect(response.transactions[1].paymentStatus).toBe("REFUNDED");
      expect(response.page).toBe("1");
      expect(response.pagination).toBe("40");

      // Verify request and hash sequence
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/transaction-list-2"
      );
      const body = JSON.parse(options.body);
      expect(body.from_date).toBe("2026-09-10 00:00:00");
      expect(body.to_date).toBe("2026-09-10 23:59:59");
      expect(body.status).toBe("APPROVED,REFUNDED");

      const expectedHash = await hmacSha512Base64(
        `${body.req_time}${body.merchant_id}2026-09-10 00:00:002026-09-10 23:59:59APPROVED,REFUNDED140`,
        TEST_CONFIG.apiKey
      );
      expect(body.hash).toBe(expectedHash);
    });

    it("handles empty filters with default pagination", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            data: [],
            page: "1",
            pagination: "40",
            status: { code: "00", message: "Success!" },
          }),
      });

      const response = await client.listTransactions();
      expect(response.success).toBe(true);
      expect(response.transactions).toHaveLength(0);
    });
  });
});
