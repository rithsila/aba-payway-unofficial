import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateKeyPairSync, privateDecrypt, constants } from "node:crypto";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64 } from "../src/hash";

describe("ABAPayWay.refund", () => {
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

  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails when transactionId is missing", async () => {
    const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
    const result = await client.refund({ transactionId: "", refundAmount: 5.0 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("transactionId is required");
  });

  it("fails when refundAmount is invalid or non-positive", async () => {
    const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
    const res1 = await client.refund({ transactionId: "TXN1", refundAmount: 0 });
    expect(res1.success).toBe(false);
    expect(res1.error).toContain("refundAmount must be a positive number");

    const res2 = await client.refund({ transactionId: "TXN1", refundAmount: -10 });
    expect(res2.success).toBe(false);

    const res3 = await client.refund({ transactionId: "TXN1", refundAmount: NaN });
    expect(res3.success).toBe(false);
  });

  it("fails when rsaPublicKey is not provided in config or request", async () => {
    const client = new ABAPayWay(BASE_CONFIG);
    const result = await client.refund({ transactionId: "TXN1", refundAmount: 5.0 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("RSA public key is required");
  });

  it("successfully sends refund request with verified body and signature", async () => {
    const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          grand_total: 10.0,
          total_refunded: 2.5,
          currency: "USD",
          transaction_status: "REFUNDED",
          status: {
            code: "00",
            message: "Success!",
          },
        }),
    });

    const result = await client.refund({
      transactionId: "ORDER123",
      refundAmount: 2.5,
    });

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe("ORDER123");
    expect(result.refundAmount).toBe(2.5);
    expect(result.grandTotal).toBe(10.0);
    expect(result.totalRefunded).toBe(2.5);
    expect(result.currency).toBe("USD");
    expect(result.transactionStatus).toBe("REFUNDED");
    expect(result.code).toBe("00");
    expect(result.message).toBe("Success!");

    // Verify fetch call
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/online-transaction/refund"
    );
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.merchant_id).toBe("ec000001");
    expect(body.request_time).toMatch(/^\d{14}$/);

    // Verify RSA decrypted merchant_auth
    const rawCipher = Buffer.from(body.merchant_auth, "base64");
    const decryptedJson = privateDecrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
      rawCipher
    ).toString("utf8");
    const decryptedPayload = JSON.parse(decryptedJson);
    expect(decryptedPayload).toEqual({
      mc_id: "ec000001",
      tran_id: "ORDER123",
      refund_amount: 2.5,
    });

    // Verify HMAC-SHA512 hash
    const expectedHash = await hmacSha512Base64(
      `${body.request_time}${body.merchant_id}${body.merchant_auth}`,
      BASE_CONFIG.apiKey
    );
    expect(body.hash).toBe(expectedHash);
  });

  it("supports passing rsaPublicKey per request", async () => {
    const client = new ABAPayWay(BASE_CONFIG); // no rsaPublicKey in config

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          grand_total: 5.0,
          total_refunded: 5.0,
          currency: "USD",
          transaction_status: "REFUNDED",
          status: {
            code: "00",
            message: "Success!",
          },
        }),
    });

    const result = await client.refund({
      transactionId: "TXN_OVERRIDE",
      refundAmount: 5.0,
      rsaPublicKey: publicKey,
    });

    expect(result.success).toBe(true);
    expect(result.totalRefunded).toBe(5.0);
  });

  it("handles ABA error code response (e.g. PTL37 refund amount exceeded)", async () => {
    const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: {
            code: "PTL37",
            message: "Refund amount cannot exceed the original purchase amount.",
          },
        }),
    });

    const result = await client.refund({
      transactionId: "TXN_OVER_REFUND",
      refundAmount: 999.0,
    });

    expect(result.success).toBe(false);
    expect(result.code).toBe("PTL37");
    expect(result.message).toBe(
      "Refund amount cannot exceed the original purchase amount."
    );
    expect(result.error).toBe(
      "Refund amount cannot exceed the original purchase amount."
    );
  });

  it("handles network failure gracefully", async () => {
    const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

    fetchSpy.mockRejectedValueOnce(new Error("Connection refused"));

    const result = await client.refund({
      transactionId: "TXN_NET_FAIL",
      refundAmount: 1.0,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Connection refused");
  });
});
