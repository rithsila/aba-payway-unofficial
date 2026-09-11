import { publicEncrypt, constants } from "node:crypto";

/**
 * Ensures the RSA public key is in standard PEM format.
 * ABA credential sheets sometimes provide just the raw Base64 string.
 */
export function formatRsaPublicKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.includes("-----BEGIN")) {
    return trimmed;
  }
  return `-----BEGIN PUBLIC KEY-----\n${trimmed}\n-----END PUBLIC KEY-----`;
}

/**
 * Encrypts a string in chunks using an RSA public key with PKCS#1 v1.5 padding,
 * matching ABA PayWay's reference PHP implementation:
 *
 *   while ($data_object !== '') {
 *       $chunk = substr($data_object, 0, $maxlength); // 117 bytes
 *       openssl_public_encrypt($chunk, $encrypted_chunk, $rsa_public_key);
 *       $encrypted_output .= $encrypted_chunk;
 *   }
 *   return base64_encode($encrypted_output);
 */
export function encryptRsaChunks(
  data: string,
  rsaPublicKey: string,
  chunkSize: number = 117
): string {
  if (!data) {
    throw new Error("Data to encrypt cannot be empty");
  }
  if (!rsaPublicKey || !rsaPublicKey.trim()) {
    throw new Error("RSA public key is required for encryption");
  }

  const pemKey = formatRsaPublicKey(rsaPublicKey);
  const dataBuffer = Buffer.from(data, "utf8");
  const encryptedChunks: Buffer[] = [];

  for (let offset = 0; offset < dataBuffer.length; offset += chunkSize) {
    const chunk = dataBuffer.subarray(offset, Math.min(offset + chunkSize, dataBuffer.length));
    const encrypted = publicEncrypt(
      {
        key: pemKey,
        padding: constants.RSA_PKCS1_PADDING,
      },
      chunk
    );
    encryptedChunks.push(encrypted);
  }

  return Buffer.concat(encryptedChunks).toString("base64");
}
