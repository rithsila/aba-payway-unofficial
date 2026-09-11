import { describe, it, expect } from "vitest";
import { generateKeyPairSync, privateDecrypt, constants } from "node:crypto";
import { encryptRsaChunks, formatRsaPublicKey } from "../src/rsa";

describe("RSA Chunk Encryption", () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 1024,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

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

  it("encrypts short data and decrypts to original", () => {
    const payload = JSON.stringify({
      mc_id: "ec000001",
      tran_id: "TXN12345",
      refund_amount: 15.5,
    });

    const encryptedBase64 = encryptRsaChunks(payload, publicKey);
    expect(encryptedBase64).toBeTruthy();
    expect(typeof encryptedBase64).toBe("string");

    const decrypted = decryptRsaChunks(encryptedBase64, privateKey);
    expect(decrypted).toBe(payload);
  });

  it("encrypts multi-chunk data exceeding 117 bytes", () => {
    const longPayload = JSON.stringify({
      mc_id: "ec000001_very_long_merchant_id_string_that_fills_up_space",
      tran_id: "TXN_999999999999999999999999999999999999999999999999999999",
      refund_amount: 1234567.89,
      note: "This is an additional string that ensures the entire payload strictly exceeds 117 bytes so multiple RSA chunks must be processed.",
    });
    expect(Buffer.from(longPayload).length).toBeGreaterThan(117);

    const encryptedBase64 = encryptRsaChunks(longPayload, publicKey);
    const decrypted = decryptRsaChunks(encryptedBase64, privateKey);
    expect(decrypted).toBe(longPayload);
  });

  it("handles raw base64 public key without PEM headers", () => {
    const rawKey = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\r?\n/g, "")
      .trim();

    const formatted = formatRsaPublicKey(rawKey);
    expect(formatted).toContain("-----BEGIN PUBLIC KEY-----");
    expect(formatted).toContain("-----END PUBLIC KEY-----");

    const payload = JSON.stringify({ mc_id: "test", tran_id: "1", refund_amount: 1 });
    const encryptedBase64 = encryptRsaChunks(payload, rawKey);
    const decrypted = decryptRsaChunks(encryptedBase64, privateKey);
    expect(decrypted).toBe(payload);
  });

  it("throws when data or key is empty", () => {
    expect(() => encryptRsaChunks("", publicKey)).toThrow("Data to encrypt cannot be empty");
    expect(() => encryptRsaChunks("test", "")).toThrow("RSA public key is required");
  });
});
