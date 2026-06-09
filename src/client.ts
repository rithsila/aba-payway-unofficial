import type {
  ABAConfig,
  PurchaseRequest,
  PurchaseResponse,
  StatusResponse,
  PaymentStatus,
} from "./types";
import { generateABAHash } from "./hash";
import { getABATimestamp, formatPhoneForABA } from "./utils";

export class ABAPayWay {
  readonly config: Readonly<ABAConfig>;

  constructor(config: ABAConfig) {
    if (!config.merchantId) throw new Error("merchantId is required");
    if (!config.apiKey) throw new Error("apiKey is required");
    this.config = Object.freeze({ ...config });
  }

  async createPurchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    const reqTime = getABATimestamp();
    // ABA requires KHR amounts as whole numbers (no decimals); USD uses 2.
    const amount =
      request.currency === "KHR"
        ? Math.round(request.amount).toString()
        : request.amount.toFixed(2);
    const phone = request.phone ? formatPhoneForABA(request.phone) : "";

    // ABA expects these URL fields Base64-encoded. The same encoded
    // value must be used in both the hash input and the request body.
    const returnUrl = request.returnUrl ? base64(request.returnUrl) : "";
    const cancelUrl = request.cancelUrl ? base64(request.cancelUrl) : "";
    const continueSuccessUrl = request.continueSuccessUrl
      ? base64(request.continueSuccessUrl)
      : "";
    const returnDeeplink = request.returnDeeplink
      ? base64(request.returnDeeplink)
      : "";

    const hashParams = {
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: request.transactionId,
      amount,
      items: request.items ?? "",
      shipping: "",
      ctid: "",
      pwt: "",
      firstname: request.firstName ?? "",
      lastname: request.lastName ?? "",
      email: request.email ?? "",
      phone,
      type: "",
      payment_option: request.paymentOption ?? "",
      return_url: returnUrl,
      cancel_url: cancelUrl,
      continue_success_url: continueSuccessUrl,
      return_deeplink: returnDeeplink,
      currency: request.currency,
      custom_fields: request.customFields ?? "",
      return_params: request.returnParams ?? "",
    };

    const hash = await generateABAHash(hashParams, this.config.apiKey);

    const body = new URLSearchParams({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: request.transactionId,
      amount,
      items: request.items ?? "",
      firstname: request.firstName ?? "",
      lastname: request.lastName ?? "",
      email: request.email ?? "",
      phone,
      payment_option: request.paymentOption ?? "",
      return_url: returnUrl,
      cancel_url: cancelUrl,
      continue_success_url: continueSuccessUrl,
      return_deeplink: returnDeeplink,
      currency: request.currency,
      custom_fields: request.customFields ?? "",
      return_params: request.returnParams ?? "",
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/purchase`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          success: false,
          transactionId: request.transactionId,
          amount: request.amount,
          currency: request.currency,
          error: `HTTP ${response.status}: ${text}`,
        };
      }

      const data = await response.json();

      if (!isABASuccess(data.status)) {
        return {
          success: false,
          transactionId: request.transactionId,
          amount: request.amount,
          currency: request.currency,
          error: abaErrorMessage(data),
          errorCode: abaStatusCode(data.status),
        };
      }

      return {
        success: true,
        transactionId: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        checkoutUrl: data.checkout_qr_url ?? data.checkout_url,
        abapayDeeplink: data.abapay_deeplink,
        qrString: data.qr_string,
      };
    } catch (err) {
      return {
        success: false,
        transactionId: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async checkStatus(transactionId: string): Promise<StatusResponse> {
    const reqTime = getABATimestamp();

    const hashParams = {
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: transactionId,
    };

    const hash = await generateABAHash(hashParams, this.config.apiKey);

    // check-transaction-2 expects a JSON body.
    const body = JSON.stringify({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: transactionId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/check-transaction-2`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          success: false,
          transactionId,
          status: "ERROR",
          error: `HTTP ${response.status}: ${text}`,
        };
      }

      const data = await response.json();

      // Success envelope: { status: { code: "00" }, data: { ... } }.
      if (!isABASuccess(data.status)) {
        return {
          success: false,
          transactionId,
          status: "ERROR",
          error: abaErrorMessage(data),
        };
      }

      const tran = data.data ?? data;
      const paymentStatus = mapPaymentStatus(tran.payment_status);
      const rawAmount = tran.payment_amount ?? tran.amount;
      const amount = rawAmount != null ? parseFloat(String(rawAmount)) : undefined;

      return {
        success: true,
        transactionId,
        status: paymentStatus,
        amount: amount != null && Number.isFinite(amount) ? amount : undefined,
        currency: tran.payment_currency ?? tran.currency,
        paymentTime: tran.payment_datetime ?? tran.payment_time,
      };
    } catch (err) {
      return {
        success: false,
        transactionId,
        status: "ERROR",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  /**
   * Verify an ABA PayWay callback (pushback) signature.
   *
   * ABA does NOT sign the raw body. It sorts the callback fields by key
   * (ascending), concatenates their values (JSON-encoding any nested
   * object/array), then HMAC-SHA512 with the secret and Base64-encodes
   * the result. The signature arrives in the `X-PAYWAY-HMAC-SHA512`
   * request header.
   *
   * @param payload   Raw JSON callback body.
   * @param signature Value of the `X-PAYWAY-HMAC-SHA512` header.
   * @param secret    Merchant key used to sign callbacks.
   */
  async verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      const b4hash = Object.keys(parsed)
        .sort()
        .map((k) => {
          const v = parsed[k];
          return v !== null && typeof v === "object" ? JSON.stringify(v) : String(v);
        })
        .join("");

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(b4hash));
      const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

      // Length pre-check (Base64 HMAC length is not secret), then a
      // bitwise compare that does not short-circuit on content.
      if (expected.length !== signature.length) return false;

      let mismatch = 0;
      for (let i = 0; i < expected.length; i++) {
        mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
      }
      return mismatch === 0;
    } catch {
      return false;
    }
  }
}

// Base64-encode a string (UTF-8 safe) for ABA's URL/encoded fields.
// Build the binary string with a loop (not a spread) so long inputs
// don't overflow the call-stack argument limit.
function base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// ABA reports status either as a number (0) or an object ({ code: "00" }).
function isABASuccess(status: unknown): boolean {
  if (status === 0 || status === "0") return true;
  if (status !== null && typeof status === "object") {
    const code = (status as { code?: unknown }).code;
    return code === "0" || code === "00";
  }
  return false;
}

function abaStatusCode(status: unknown): string {
  if (status !== null && typeof status === "object") {
    return String((status as { code?: unknown }).code ?? "");
  }
  return String(status);
}

function abaErrorMessage(data: {
  status?: unknown;
  description?: unknown;
}): string {
  if (data.status !== null && typeof data.status === "object") {
    const message = (data.status as { message?: unknown }).message;
    if (message) return String(message);
  }
  if (data.description) return String(data.description);
  return "Unknown error";
}

function mapPaymentStatus(raw: string | undefined): PaymentStatus {
  const normalized = (raw ?? "").toUpperCase();
  if (normalized === "APPROVED") return "APPROVED";
  if (normalized === "PRE-AUTH") return "PRE-AUTH";
  if (normalized === "DECLINED") return "DECLINED";
  if (normalized === "REFUNDED") return "REFUNDED";
  if (normalized === "PENDING") return "PENDING";
  if (normalized === "CANCELLED") return "CANCELLED";
  return "ERROR";
}
