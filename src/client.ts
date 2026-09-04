import type {
  ABAConfig,
  PurchaseRequest,
  PurchaseResponse,
  StatusResponse,
  PaymentStatus,
} from "./types";
import { generateABAHash } from "./hash";
import { readAbaStatus } from "./response";
import {
  getABATimestamp,
  formatPhoneForABA,
  encodeItemsForABA,
  encodeReturnDeeplinkForABA,
} from "./utils";

/**
 * ABA does not always answer with JSON. Bad credentials get an HTML error page,
 * and a gateway hiccup gets plain text. Parsing blindly turns those into
 * "Unexpected token '<'", which tells the operator nothing about the real
 * problem, so read the body as text and report what actually came back.
 */
async function parseAbaJson(response: Response): Promise<{ data?: any; error?: string }> {
  const text = await response.text();
  try {
    return { data: JSON.parse(text) };
  } catch {
    const snippet = text.trim().slice(0, 200);
    // A wrong merchant_id makes ABA render the checkout page instead of
    // answering the API, so HTML here almost always means bad credentials.
    if (response.ok) {
      return {
        error:
          `ABA PayWay returned a non-JSON response (HTTP ${response.status}). ` +
          `This usually means the merchant ID or API key is wrong. Response starts: ${snippet}`,
      };
    }
    return { error: `HTTP ${response.status}: ${snippet}` };
  }
}

/**
 * ABA hands merchants the full purchase URL ("API Url" on the credential
 * sheet), but the SDK builds endpoint paths itself. Accept either and keep
 * only the origin so pasting the sheet value verbatim works.
 */
function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  const marker = "/api/payment-gateway";
  const at = trimmed.indexOf(marker);
  return at === -1 ? trimmed : trimmed.slice(0, at);
}

export class ABAPayWay {
  readonly config: Readonly<ABAConfig>;

  constructor(config: ABAConfig) {
    if (!config.merchantId) throw new Error("merchantId is required");
    if (!config.apiKey) throw new Error("apiKey is required");
    if (!config.baseUrl) throw new Error("baseUrl is required");
    this.config = Object.freeze({ ...config, baseUrl: normalizeBaseUrl(config.baseUrl) });
  }

  async createPurchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    const reqTime = getABATimestamp();
    const amount = request.amount.toFixed(2);
    const phone = request.phone ? formatPhoneForABA(request.phone) : "";
    // Encode once. The hash and the body must carry the identical string or
    // ABA rebuilds a different signature and rejects the request.
    const items = encodeItemsForABA(request.items);
    // Same rule as `items`: encode once, then reuse for both the hash and the
    // body. Encoding twice risks two different strings and a "Wrong Hash."
    const returnDeeplink = encodeReturnDeeplinkForABA(request.returnDeeplink);

    const hashParams = {
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: request.transactionId,
      amount,
      items,
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
      items,
      firstname: request.firstName ?? "",
      lastname: request.lastName ?? "",
      email: request.email ?? "",
      phone,
      payment_option: request.paymentOption ?? "",
      return_url: request.returnUrl ?? "",
      cancel_url: request.cancelUrl ?? "",
      continue_success_url: request.continueSuccessUrl ?? "",
      return_deeplink: returnDeeplink,
      currency: request.currency,
      custom_fields: request.customFields ?? "",
      return_params: request.returnParams ?? "",
      hash,
    });

    // Body-only fields. ABA does not hash `payment_gate` or `view_type`, so
    // they are appended after `hash` is built — adding them to hashParams
    // would produce a signature ABA cannot rebuild. Both are omitted entirely
    // when unset, matching the rule that ABA rejects fields it did not expect
    // (an empty `shipping` is what makes it answer "Wrong shipping price").
    if (request.paymentGate !== undefined) {
      body.set("payment_gate", String(request.paymentGate));
    }
    if (request.viewType) body.set("view_type", request.viewType);

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/purchase`;

    const failure = (error: string, errorCode?: string): PurchaseResponse => ({
      success: false,
      transactionId: request.transactionId,
      amount: request.amount,
      currency: request.currency,
      error,
      errorCode,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        // The Checkout service answers 302 to the hosted payment page. Let it
        // be followed and the body is that page's HTML, which parses as
        // neither JSON nor an error worth reporting — so stop at the redirect
        // and read the address out of it instead.
        redirect: "manual",
      });

      // A 302 is success for the Checkout service flow: the payer finishes on
      // the page ABA points at. There is no JSON body to read, so hand back
      // the URL and let the caller poll checkStatus for the outcome.
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          return failure(
            `ABA PayWay redirected (HTTP ${response.status}) without a Location header.`,
          );
        }
        return {
          success: true,
          transactionId: request.transactionId,
          amount: request.amount,
          currency: request.currency,
          checkoutUrl: new URL(location, this.config.baseUrl).toString(),
        };
      }

      // A rejected request comes back as HTTP 403 with the reason in a JSON
      // status envelope ("Wrong Hash.", "End of API lifetime"). Parse it
      // rather than dumping the raw body, so callers get a real error code.
      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) return failure(status.message, status.code || undefined);

      const data = parsed.data;

      return {
        success: true,
        transactionId: request.transactionId,
        amount: request.amount,
        currency: request.currency,
        checkoutUrl: data.checkout_url,
        abapayDeeplink: data.abapay_deeplink,
        appStoreUrl: data.app_store,
        playStoreUrl: data.play_store,
        // v3 answers in camelCase; the older API used snake_case.
        qrString: data.qrString ?? data.qr_string,
        qrImage: data.qrImage ?? data.qr_image,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
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

    const failure = (error: string, errorCode?: string): StatusResponse => ({
      success: false,
      transactionId,
      status: "ERROR",
      error,
      errorCode,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) return failure(status.message, status.code || undefined);

      // v3 nests the transaction detail under `data`; the legacy shape put
      // these fields at the top level.
      const detail = parsed.data.data ?? parsed.data;

      const amount = toNumber(detail.total_amount ?? detail.amount);
      // `payment_currency` is an empty string until the payment settles.
      const currency = firstNonEmpty(detail.payment_currency, detail.currency);

      return {
        success: true,
        transactionId,
        status: mapPaymentStatus(detail.payment_status ?? detail.description),
        amount,
        currency,
        paymentTime: firstNonEmpty(detail.transaction_date, detail.payment_datetime),
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
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

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function firstNonEmpty(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value !== "") return value;
  }
  return undefined;
}

function mapPaymentStatus(raw: string | undefined): PaymentStatus {
  const normalized = (raw ?? "").toUpperCase();
  if (normalized === "APPROVED") return "APPROVED";
  if (normalized === "DECLINED") return "DECLINED";
  if (normalized === "REFUNDED") return "REFUNDED";
  if (normalized === "PENDING") return "PENDING";
  return "ERROR";
}
