import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateKeyPairSync, privateDecrypt, constants } from "node:crypto";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64 } from "../src/hash";

describe("ABAPayWay.paymentLinks", () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 1024,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const BASE_CONFIG = {
    merchantId: "ec000001",
    apiKey: "test_api_key",
    baseUrl: "https://checkout-sandbox.payway.com.kh",
  };

  function decryptRsaChunks(base64Cipher: string, privKey: string): string {
    const rawBuf = Buffer.from(base64Cipher, "base64");
    const keySizeBytes = 128; // 1024 / 8
    let result = "";
    for (let i = 0; i < rawBuf.length; i += keySizeBytes) {
      const chunk = rawBuf.subarray(i, i + keySizeBytes);
      const decrypted = privateDecrypt(
        { key: privKey, padding: constants.RSA_PKCS1_PADDING },
        chunk
      );
      result += decrypted.toString("utf8");
    }
    return result;
  }

  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPaymentLink", () => {
    it("fails when title is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const result = await client.createPaymentLink({
        title: "",
        amount: 10,
        currency: "USD",
        returnUrl: "https://example.com/return",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("title is required");
    });

    it("fails when amount is invalid or non-positive", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const result = await client.createPaymentLink({
        title: "Test Order",
        amount: 0,
        currency: "USD",
        returnUrl: "https://example.com/return",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("amount must be a positive number");
    });

    it("fails when returnUrl is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const result = await client.createPaymentLink({
        title: "Test Order",
        amount: 10,
        currency: "USD",
        returnUrl: "",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("returnUrl is required");
    });

    it("fails when RSA public key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.createPaymentLink({
        title: "Test Order",
        amount: 10,
        currency: "USD",
        returnUrl: "https://example.com/return",
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("RSA public key is required");
    });

    it("successfully creates payment link and verifies multipart payload & hash", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              id: "pl_123456",
              title: "Test Order",
              description: "Test description",
              amount: "10.00",
              currency: "USD",
              payment_link_url: "https://checkout.payway.com.kh/pl/123456",
              short_link_url: "https://aba.to/pl123",
              qr_string: "khqr_string_data",
              qr_image: "data:image/png;base64,mockqr",
            },
          }),
      });

      const result = await client.createPaymentLink({
        title: "Test Order",
        amount: 10,
        currency: "USD",
        returnUrl: "https://example.com/return",
        description: "Test description",
        merchantRefNo: "ref-001",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("pl_123456");
      expect(result.title).toBe("Test Order");
      expect(result.amount).toBe(10);
      expect(result.currency).toBe("USD");
      expect(result.paymentLinkUrl).toBe("https://checkout.payway.com.kh/pl/123456");
      expect(result.shortLinkUrl).toBe("https://aba.to/pl123");
      expect(result.qrString).toBe("khqr_string_data");

      // Verify fetch call
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/payment-link/create"
      );
      expect(options.method).toBe("POST");
      expect(options.body).toBeInstanceOf(FormData);

      const formData: FormData = options.body;
      const reqTime = formData.get("request_time") as string;
      const merchantId = formData.get("merchant_id") as string;
      const merchantAuth = formData.get("merchant_auth") as string;
      const hash = formData.get("hash") as string;

      expect(merchantId).toBe("ec000001");
      expect(reqTime).toMatch(/^\d{14}$/);

      // Verify HMAC hash: request_time + merchant_id + merchant_auth
      const expectedHash = await hmacSha512Base64(
        `${reqTime}${merchantId}${merchantAuth}`,
        "test_api_key"
      );
      expect(hash).toBe(expectedHash);

      // Verify decrypt merchant_auth
      const decrypted = decryptRsaChunks(merchantAuth, privateKey);

      const authData = JSON.parse(decrypted);
      expect(authData.mc_id).toBe("ec000001");
      expect(authData.title).toBe("Test Order");
      expect(authData.amount).toBe(10);
      expect(authData.currency).toBe("USD");
      expect(authData.description).toBe("Test description");
      expect(authData.merchant_ref_no).toBe("ref-001");
      expect(authData.return_url).toBe(Buffer.from("https://example.com/return").toString("base64"));
    });
  });

  describe("getPaymentLinkDetails", () => {
    it("fails when id is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const result = await client.getPaymentLinkDetails({ id: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("id is required");
    });

    it("fails when RSA public key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.getPaymentLinkDetails({ id: "pl_123456" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("RSA public key is required");
    });

    it("successfully fetches payment link details with RSA merchant_auth and hash", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              id: "pl_123456",
              title: "Test Order",
              amount: "10.00",
              currency: "USD",
              payment_link_url: "https://checkout.payway.com.kh/pl/123456",
              payment_status: "PAID",
              clicks: 3,
            },
          }),
      });

      const result = await client.getPaymentLinkDetails({ id: "pl_123456" });
      expect(result.success).toBe(true);
      expect(result.id).toBe("pl_123456");
      expect(result.title).toBe("Test Order");
      expect(result.amount).toBe(10);
      expect(result.currency).toBe("USD");
      expect(result.paymentStatus).toBe("PAID");

      // Verify fetch call
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/payment-link/detail"
      );
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(options.body);
      expect(body.merchant_id).toBe("ec000001");
      expect(body.request_time).toMatch(/^\d{14}$/);

      const expectedHash = await hmacSha512Base64(
        `${body.request_time}${body.merchant_id}${body.merchant_auth}`,
        "test_api_key"
      );
      expect(body.hash).toBe(expectedHash);

      // Verify RSA decrypt
      const decrypted = decryptRsaChunks(body.merchant_auth, privateKey);

      const authData = JSON.parse(decrypted);
      expect(authData.mc_id).toBe("ec000001");
      expect(authData.id).toBe("pl_123456");
    });
  });
});
