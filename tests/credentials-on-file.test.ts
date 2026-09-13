import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64 } from "../src/hash";

describe("ABAPayWay.credentialsOnFile", () => {
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

  describe("linkAccount", () => {
    it("fails when ctid is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.linkAccount({
        ctid: "",
        currency: "USD",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("ctid is required");
    });

    it("successfully creates link account request with verified signature", async () => {
      const client = new ABAPayWay(BASE_CONFIG);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              qr_string: "aba_qr_link_data",
              qr_image: "data:image/png;base64,mockqr",
              abapay_deeplink: "abamobile://link?id=123",
            },
          }),
      });

      const result = await client.linkAccount({
        ctid: "CUST_001",
        requestId: "REQ_12345",
        currency: "USD",
        tokenFlag: "CITI_FLEX",
        returnDeeplink: "myapp://callback",
      });

      expect(result.success).toBe(true);
      expect(result.qrString).toBe("aba_qr_link_data");
      expect(result.abapayDeeplink).toBe("abamobile://link?id=123");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-credential/v3/aof/link-account"
      );
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(options.body);
      expect(body.merchant_id).toBe("ec000001");
      expect(body.ctid).toBe("CUST_001");
      expect(body.request_id).toBe("REQ_12345");
      expect(body.token_flag).toBe("CITI_FLEX");
      expect(body.currency).toBe("USD");

      const returnDeeplinkB64 = Buffer.from("myapp://callback").toString("base64");
      const expectedB4Hash = `${body.merchant_id}${body.request_time}${body.ctid}${returnDeeplinkB64}${""}${body.request_id}${body.token_flag}${body.currency}`;
      const expectedHash = await hmacSha512Base64(expectedB4Hash, "test_api_key");
      expect(body.hash).toBe(expectedHash);
    });
  });

  describe("linkCard", () => {
    it("fails when ctid is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.linkCard({
        ctid: "",
        currency: "USD",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("ctid is required");
    });

    it("successfully creates link card multipart request returning hosted HTML", async () => {
      const client = new ABAPayWay(BASE_CONFIG);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "<html><body>Hosted Card Form</body></html>",
      });

      const result = await client.linkCard({
        ctid: "CUST_001",
        requestId: "REQ_99999",
        currency: "USD",
        tokenFlag: "CITI_FLEX",
        continueSuccessUrl: "https://myshop.com/success",
      });

      expect(result.success).toBe(true);
      expect(result.html).toContain("Hosted Card Form");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-credential/v3/cof/link-card"
      );
      expect(options.method).toBe("POST");
      expect(options.body).toBeInstanceOf(FormData);
    });
  });

  describe("chargeToken", () => {
    it("fails when transactionId is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.chargeToken({
        transactionId: "",
        ctid: "CUST_001",
        pwt: "PWT_123",
        amount: 10,
        currency: "USD",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("transactionId is required");
    });

    it("fails when pwt is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.chargeToken({
        transactionId: "TXN123",
        ctid: "CUST_001",
        pwt: "",
        amount: 10,
        currency: "USD",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("pwt is required");
    });

    it("successfully charges token and verifies signature", async () => {
      const client = new ABAPayWay(BASE_CONFIG);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              tran_id: "TXN123",
              total_amount: 10.0,
              currency: "USD",
              payment_status: "APPROVED",
            },
          }),
      });

      const result = await client.chargeToken({
        transactionId: "TXN123",
        ctid: "CUST_001",
        pwt: "PWT_TOKEN_ABC",
        amount: 10.0,
        currency: "USD",
        tokenFlag: "CITI_FLEX",
        firstName: "Dara",
        lastName: "Sok",
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe("TXN123");
      expect(result.totalAmount).toBe(10);
      expect(result.status).toBe("APPROVED");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v3/purchase/payment-credential"
      );
      expect(options.method).toBe("POST");

      const body = JSON.parse(options.body);
      expect(body.tran_id).toBe("TXN123");
      expect(body.ctid).toBe("CUST_001");
      expect(body.pwt).toBe("PWT_TOKEN_ABC");
    });
  });

  describe("getTokenDetails", () => {
    it("fails when requestId is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.getTokenDetails({ requestId: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("requestId is required");
    });

    it("successfully retrieves token details and verifies signature", async () => {
      const client = new ABAPayWay(BASE_CONFIG);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              payment_credential: {
                ctid: "CUST_001",
                pwt: "PWT_ACTIVE_123",
                token_flag: "CITI_FLEX",
                source_of_fund: "*****1481",
                currency: "USD",
                type: "ABA ACCOUNT",
                status: 1,
              },
            },
          }),
      });

      const result = await client.getTokenDetails({ requestId: "REQ_12345" });
      expect(result.success).toBe(true);
      expect(result.credential?.ctid).toBe("CUST_001");
      expect(result.credential?.pwt).toBe("PWT_ACTIVE_123");
      expect(result.credential?.type).toBe("ABA ACCOUNT");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-credential/v3/token-management/get-token-details"
      );

      const body = JSON.parse(options.body);
      expect(body.request_id).toBe("REQ_12345");
      const expectedHash = await hmacSha512Base64(
        `${body.merchant_id}${body.request_time}${body.request_id}`,
        "test_api_key"
      );
      expect(body.hash).toBe(expectedHash);
    });
  });

  describe("renewToken", () => {
    it("fails when pwt is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.renewToken({
        ctid: "CUST_001",
        pwt: "",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("pwt is required");
    });

    it("successfully requests token renewal and verifies hash", async () => {
      const client = new ABAPayWay(BASE_CONFIG);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
          }),
      });

      const result = await client.renewToken({
        ctid: "CUST_001",
        pwt: "PWT_EXPIRED",
        requestId: "REQ_RENEW_1",
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe("00");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-credential/v3/token-management/renew-expired-account-token"
      );

      const body = JSON.parse(options.body);
      expect(body.ctid).toBe("CUST_001");
      expect(body.pwt).toBe("PWT_EXPIRED");

      const expectedHash = await hmacSha512Base64(
        `${body.ctid}${body.request_time}${body.pwt}${body.merchant_id}${body.request_id}`,
        "test_api_key"
      );
      expect(body.hash).toBe(expectedHash);
    });
  });

  describe("removeToken", () => {
    it("fails when pwt is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.removeToken({
        ctid: "CUST_001",
        pwt: "",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("pwt is required");
    });

    it("successfully removes token and verifies hash", async () => {
      const client = new ABAPayWay(BASE_CONFIG);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
          }),
      });

      const result = await client.removeToken({
        ctid: "CUST_001",
        pwt: "PWT_TO_REMOVE",
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe("00");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-credential/v3/token-management/remove-token"
      );

      const body = JSON.parse(options.body);
      expect(body.ctid).toBe("CUST_001");
      expect(body.pwt).toBe("PWT_TO_REMOVE");

      const expectedHash = await hmacSha512Base64(
        `${body.merchant_id}${body.ctid}${body.request_time}${body.pwt}`,
        "test_api_key"
      );
      expect(body.hash).toBe(expectedHash);
    });
  });
});
