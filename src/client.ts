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
    const amount = request.amount.toFixed(2);
    const phone = request.phone ? formatPhoneForABA(request.phone) : "";

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
      return_url: request.returnUrl ?? "",
      cancel_url: request.cancelUrl ?? "",
      continue_success_url: request.continueSuccessUrl ?? "",
      return_deeplink: request.returnDeeplink ?? "",
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
      return_url: request.returnUrl ?? "",
      cancel_url: request.cancelUrl ?? "",
      continue_success_url: request.continueSuccessUrl ?? "",
      return_deeplink: request.returnDeeplink ?? "",
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

      if (data.status !== 0) {
        return {
          success: false,
          transactionId: request.transactionId,
          amount: request.amount,
          currency: request.currency,
          error: data.description ?? "Unknown error",
          errorCode: String(data.status),
        };
      }

      return {
        success: true,
        transactionId: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        checkoutUrl: data.checkout_url,
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

    const body = new URLSearchParams({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: transactionId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/check-transaction-2`;

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
          transactionId,
          status: "ERROR",
          error: `HTTP ${response.status}: ${text}`,
        };
      }

      const data = await response.json();

      if (data.status !== 0) {
        return {
          success: false,
          transactionId,
          status: "ERROR",
          error: data.description ?? "Unknown error",
        };
      }

      const paymentStatus = mapPaymentStatus(data.payment_status ?? data.description);

      return {
        success: true,
        transactionId,
        status: paymentStatus,
        amount: data.amount != null ? parseFloat(data.amount) : undefined,
        currency: data.currency,
        paymentTime: data.payment_datetime,
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

  async verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
      const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

      // Constant-time comparison to prevent timing attacks
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

function mapPaymentStatus(raw: string | undefined): PaymentStatus {
  const normalized = (raw ?? "").toUpperCase();
  if (normalized === "APPROVED") return "APPROVED";
  if (normalized === "DECLINED") return "DECLINED";
  if (normalized === "REFUNDED") return "REFUNDED";
  if (normalized === "PENDING") return "PENDING";
  return "ERROR";
}
