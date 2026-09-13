import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateKeyPairSync, privateDecrypt, constants } from "node:crypto";
import { ABAPayWay } from "../src/client";
import { hmacSha512Base64, hmacSha512Hex } from "../src/hash";

describe("ABAPayWay.payout", () => {
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

  describe("addPayoutBeneficiary", () => {
    it("fails when payee is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const res = await client.addPayoutBeneficiary({ payee: "" });
      expect(res.success).toBe(false);
      expect(res.error).toContain("Payee");
      expect(res.code).toBe("PAYEE_REQUIRED");
    });

    it("fails when RSA public key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const res = await client.addPayoutBeneficiary({ payee: "012345678" });
      expect(res.success).toBe(false);
      expect(res.error).toContain("RSA public key is required");
      expect(res.code).toBe("RSA_KEY_REQUIRED");
    });

    it("sends correct payload and handles successful response", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: { code: "00", message: "Success" },
          data: {
            name: "John Doe",
            payee: "012345678",
            currency: "USD",
            type: "ABA Account",
            status: 1,
            created_at: "2026-09-13 18:00:00",
          },
        }),
      });

      const res = await client.addPayoutBeneficiary({
        payee: "012345678",
        requestTime: "20260913180000",
      });

      expect(res.success).toBe(true);
      expect(res.data?.name).toBe("John Doe");
      expect(res.data?.status).toBe(1);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/whitelist-account/add-whitelist-payout"
      );
      expect(options.method).toBe("POST");

      const body = JSON.parse(options.body);
      expect(body.request_time).toBe("20260913180000");
      expect(body.merchant_id).toBe("ec000001");

      // Verify RSA chunk decryption
      const decrypted = JSON.parse(decryptRsaChunks(body.merchant_auth, privateKey));
      expect(decrypted).toEqual({
        mc_id: "ec000001",
        payee: "012345678",
      });

      // Verify HMAC-SHA512 hash
      const expectedHash = await hmacSha512Base64(
        body.request_time + body.merchant_auth,
        BASE_CONFIG.apiKey
      );
      expect(body.hash).toBe(expectedHash);
    });

    it("handles API error code", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: { code: "PTL148", message: "Payee already exist" },
        }),
      });

      const res = await client.addPayoutBeneficiary({ payee: "012345678" });
      expect(res.success).toBe(false);
      expect(res.code).toBe("PTL148");
      expect(res.error).toBe("Payee already exist");
    });
  });

  describe("updatePayoutBeneficiaryStatus", () => {
    it("fails when payee is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const res = await client.updatePayoutBeneficiaryStatus({ payee: "", status: 0 });
      expect(res.success).toBe(false);
      expect(res.error).toContain("Payee");
      expect(res.code).toBe("PAYEE_REQUIRED");
    });

    it("fails when status is invalid", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      // @ts-expect-error test invalid status
      const res = await client.updatePayoutBeneficiaryStatus({ payee: "012345678", status: 2 });
      expect(res.success).toBe(false);
      expect(res.error).toContain("Status must be 0 (inactive) or 1 (active)");
      expect(res.code).toBe("INVALID_STATUS");
    });

    it("fails when RSA key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const res = await client.updatePayoutBeneficiaryStatus({ payee: "012345678", status: 1 });
      expect(res.success).toBe(false);
      expect(res.code).toBe("RSA_KEY_REQUIRED");
    });

    it("sends correct payload and handles successful status update", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: { code: "00", message: "Success" },
          data: {
            name: "John Doe",
            payee: "012345678",
            currency: "USD",
            type: "ABA Account",
            status: 0,
            created_at: "2026-09-13 18:00:00",
          },
        }),
      });

      const res = await client.updatePayoutBeneficiaryStatus({
        payee: "012345678",
        status: 0,
        requestTime: "20260913180500",
      });

      expect(res.success).toBe(true);
      expect(res.data?.status).toBe(0);

      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/whitelist-account/update-whitelist-status"
      );
      const body = JSON.parse(options.body);
      expect(body.request_time).toBe("20260913180500");
      expect(body.merchant_id).toBe("ec000001");

      const decrypted = JSON.parse(decryptRsaChunks(body.merchant_auth, privateKey));
      expect(decrypted).toEqual({
        mc_id: "ec000001",
        payee: "012345678",
        status: 0,
      });

      const expectedHash = await hmacSha512Base64(
        body.request_time + body.merchant_auth,
        BASE_CONFIG.apiKey
      );
      expect(body.hash).toBe(expectedHash);
    });

    it("handles API error code", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: { code: "PTL149", message: "Invalid whitelist account" },
        }),
      });

      const res = await client.updatePayoutBeneficiaryStatus({ payee: "012345678", status: 1 });
      expect(res.success).toBe(false);
      expect(res.code).toBe("PTL149");
    });
  });

  describe("createPayout", () => {
    it("fails when transactionId is missing", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const res = await client.createPayout({
        transactionId: "",
        amount: 10,
        currency: "USD",
        beneficiaries: [{ account: "012345678", amount: 10 }],
      });
      expect(res.success).toBe(false);
      expect(res.code).toBe("TRANSACTION_ID_REQUIRED");
    });

    it("fails when amount is invalid or zero", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const res = await client.createPayout({
        transactionId: "TXN123",
        amount: 0,
        currency: "USD",
        beneficiaries: [{ account: "012345678", amount: 10 }],
      });
      expect(res.success).toBe(false);
      expect(res.code).toBe("INVALID_AMOUNT");
    });

    it("fails when currency is invalid", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      // @ts-expect-error test invalid currency
      const res = await client.createPayout({
        transactionId: "TXN123",
        amount: 10,
        currency: "EUR",
        beneficiaries: [{ account: "012345678", amount: 10 }],
      });
      expect(res.success).toBe(false);
      expect(res.code).toBe("INVALID_CURRENCY");
    });

    it("fails when beneficiaries is empty or exceeds 10 items", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });
      const resEmpty = await client.createPayout({
        transactionId: "TXN123",
        amount: 10,
        currency: "USD",
        beneficiaries: [],
      });
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.code).toBe("INVALID_BENEFICIARIES");

      const resTooMany = await client.createPayout({
        transactionId: "TXN123",
        amount: 110,
        currency: "USD",
        beneficiaries: Array.from({ length: 11 }, (_, i) => ({
          account: `00000000${i}`,
          amount: 10,
        })),
      });
      expect(resTooMany.success).toBe(false);
      expect(resTooMany.code).toBe("INVALID_BENEFICIARIES");
    });

    it("fails when RSA key is missing", async () => {
      const client = new ABAPayWay(BASE_CONFIG);
      const res = await client.createPayout({
        transactionId: "TXN123",
        amount: 10,
        currency: "USD",
        beneficiaries: [{ account: "012345678", amount: 10 }],
      });
      expect(res.success).toBe(false);
      expect(res.code).toBe("RSA_KEY_REQUIRED");
    });

    it("sends correct payload and handles successful payout", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: { code: "0", message: "Success", tran_id: "TXN123", trace_id: "TRC999" },
          transaction_id: "TXN123",
          transaction_date: "2026-09-13 18:10:00",
          external_reference: "REF123456",
          apv: "123456",
          transaction_amount: 300,
          transaction_currency: "USD",
          beneficiaries: [
            {
              payout_id: "PO1",
              name: "Alice",
              mid_acccount: "200030000",
              amount: 100,
              currency: "USD",
            },
            {
              payout_id: "PO2",
              name: "Bob",
              mid_acccount: "012538302",
              amount: 200,
              currency: "USD",
            },
          ],
        }),
      });

      const res = await client.createPayout({
        transactionId: "TXN123",
        amount: 300,
        currency: "USD",
        beneficiaries: [
          { account: "200030000", amount: 100 },
          { account: "012538302", amount: 200 },
        ],
        customFields: { Invoice_ID: "INV-1234", Province: "Phnom Penh" },
      });

      expect(res.success).toBe(true);
      expect(res.transaction_id).toBe("TXN123");
      expect(res.external_reference).toBe("REF123456");
      expect(res.beneficiaries).toHaveLength(2);

      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v2/direct-payment/merchant/payout"
      );
      const body = JSON.parse(options.body);
      expect(body.merchant_id).toBe("ec000001");
      expect(body.tran_id).toBe("TXN123");
      expect(body.amount).toBe(300);
      expect(body.currency).toBe("USD");
      expect(body.custom_fields).toBe(
        JSON.stringify({ Invoice_ID: "INV-1234", Province: "Phnom Penh" })
      );

      // Decrypt beneficiaries chunk
      const decrypted = JSON.parse(decryptRsaChunks(body.beneficiaries, privateKey));
      expect(decrypted).toEqual([
        { account: "200030000", amount: 100 },
        { account: "012538302", amount: 200 },
      ]);

      // Verify HMAC-SHA512 lowercase hex hash
      const expectedB4Hash =
        "ec000001" +
        "TXN123" +
        body.beneficiaries +
        "300" +
        body.custom_fields +
        "USD";
      const expectedHash = await hmacSha512Hex(expectedB4Hash, BASE_CONFIG.apiKey);
      expect(body.hash).toBe(expectedHash);
    });

    it("handles API error response", async () => {
      const client = new ABAPayWay({ ...BASE_CONFIG, rsaPublicKey: publicKey });

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          status: {
            code: "37",
            message: "Payout accounts are not in whitelist",
            tran_id: "TXN123",
          },
        }),
      });

      const res = await client.createPayout({
        transactionId: "TXN123",
        amount: 50,
        currency: "USD",
        beneficiaries: [{ account: "012345678", amount: 50 }],
      });

      expect(res.success).toBe(false);
      expect(res.code).toBe("37");
      expect(res.error).toBe("Payout accounts are not in whitelist");
    });
  });
});
