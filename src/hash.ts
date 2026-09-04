import type { HashParams } from "./types";

/**
 * Base64 of an HMAC-SHA512 digest — the one primitive ABA uses everywhere,
 * both for request signatures and for pushback verification. Kept in one
 * place so the two callers cannot drift apart.
 */
export async function hmacSha512Base64(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function generateABAHash(
  params: HashParams,
  publicKey: string
): Promise<string> {
  // ABA requires parameters concatenated in this EXACT order
  const hashString = [
    params.req_time,
    params.merchant_id,
    params.tran_id,
    params.amount ?? "",
    params.items ?? "",
    params.shipping ?? "",
    params.ctid ?? "",
    params.pwt ?? "",
    params.firstname ?? "",
    params.lastname ?? "",
    params.email ?? "",
    params.phone ?? "",
    params.type ?? "",
    params.payment_option ?? "",
    params.return_url ?? "",
    params.cancel_url ?? "",
    params.continue_success_url ?? "",
    params.return_deeplink ?? "",
    params.currency ?? "",
    params.custom_fields ?? "",
    params.return_params ?? "",
  ].join("");

  return hmacSha512Base64(hashString, publicKey);
}
