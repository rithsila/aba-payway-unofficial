import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateKeyPairSync, privateDecrypt, constants } from "node:crypto";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64 } from "../src/hash";

describe("ABAPayWay.preAuth", () => {
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

  describe("completePreAuth", () => {
    it("fails when transactionId is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const result = await client.completePreAuth({
        transactionId: "",
        amount: 50,
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("transactionId is required");
    });

    it("fails when amount is invalid or non-positive", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const res1 = await client.completePreAuth({
        transactionId: "TXN123",
        amount: 0,
      });
      expect(res1.success).toBe(false);
      expect(res1.error).toContain("amount must be a positive number");

      const res2 = await client.completePreAuth({
        transactionId: "TXN123",
        amount: -5,
      });
      expect(res2.success).toBe(false);
    });

    it("fails when RSA public key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.completePreAuth({
        transactionId: "TXN123",
        amount: 50,
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("RSA public key is required");
    });

    it("successfully completes pre-auth transaction and verifies body & hash", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              tran_id: "TXN123",
              original_amount: "50.00",
              complete_amount: "50.00",
              currency: "USD",
              transaction_status: "APPROVED",
            },
          }),
      });

      const result = await client.completePreAuth({
        transactionId: "TXN123",
        amount: 50,
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe("TXN123");
      expect(result.completeAmount).toBe(50);
      expect(result.originalAmount).toBe(50);
      expect(result.currency).toBe("USD");
      expect(result.transactionStatus).toBe("APPROVED");
      expect(result.code).toBe("00");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/online-transaction/pre-auth-completion"
      );
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(options.body);
      expect(body.merchant_id).toBe("ec000001");
      expect(body.request_time).toMatch(/^\d{14}$/);

      const expectedHash = await hmacSha512Base64(
        `${body.merchant_auth}${body.request_time}${body.merchant_id}`,
        "test_api_key"
      );
      expect(body.hash).toBe(expectedHash);

      const decrypted = decryptRsaChunks(body.merchant_auth, privateKey);
      const authData = JSON.parse(decrypted);
      expect(authData.mc_id).toBe("ec000001");
      expect(authData.tran_id).toBe("TXN123");
      expect(authData.complete_amount).toBe(50);
    });

    it("supports optional payout parameter in completePreAuth", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              tran_id: "TXN123",
              complete_amount: "100.00",
              transaction_status: "APPROVED",
            },
          }),
      });

      const payoutData = JSON.stringify([{ acc: "000111222", amt: 20 }]);
      const result = await client.completePreAuth({
        transactionId: "TXN123",
        amount: 100,
        payout: payoutData,
      });

      expect(result.success).toBe(true);

      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      const decrypted = decryptRsaChunks(body.merchant_auth, privateKey);
      const authData = JSON.parse(decrypted);
      expect(authData.payout).toBe(payoutData);
    });
  });

  describe("cancelPreAuth", () => {
    it("fails when transactionId is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const result = await client.cancelPreAuth({ transactionId: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("transactionId is required");
    });

    it("fails when RSA public key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const result = await client.cancelPreAuth({ transactionId: "TXN123" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("RSA public key is required");
    });

    it("successfully cancels pre-purchase transaction and verifies body & hash", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            status: { code: "00", message: "Success" },
            data: {
              tran_id: "TXN123",
              transaction_status: "CANCELLED",
            },
          }),
      });

      const result = await client.cancelPreAuth({ transactionId: "TXN123" });
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe("TXN123");
      expect(result.transactionStatus).toBe("CANCELLED");
      expect(result.code).toBe("00");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/online-transaction/pre-auth-cancellation"
      );
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(options.body);
      expect(body.merchant_id).toBe("ec000001");
      expect(body.request_time).toMatch(/^\d{14}$/);

      const expectedHash = await hmacSha512Base64(
        `${body.merchant_id}${body.merchant_auth}${body.request_time}`,
        "test_api_key"
      );
      expect(body.hash).toBe(expectedHash);

      const decrypted = decryptRsaChunks(body.merchant_auth, privateKey);
      const authData = JSON.parse(decrypted);
      expect(authData.mc_id).toBe("ec000001");
      expect(authData.tran_id).toBe("TXN123");
    });
  });
});
