export interface ABAConfig {
  readonly merchantId: string;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly webhookSecret?: string;
}

export interface PurchaseItem {
  readonly name: string;
  readonly quantity: number;
  readonly price: number;
}

/**
 * Schemes ABA Mobile uses to hand the payer back to your app once they have
 * paid. ABA reads them from `return_deeplink`; see `encodeReturnDeeplinkForABA`.
 */
export interface ReturnDeeplink {
  readonly ios_scheme?: string;
  readonly android_scheme?: string;
}

/**
 * Payment methods ABA accepts in `payment_option`. Omit it and ABA shows every
 * method the merchant profile has enabled. `abapay_khqr_deeplink` is the one
 * that answers with `abapayDeeplink` for opening ABA Mobile directly.
 *
 * Typed as a union for autocomplete, but any string is still accepted so a
 * method ABA adds later needs no SDK release.
 */
export type PaymentOption =
  | "cards"
  | "abapay_khqr"
  | "abapay_khqr_deeplink"
  | "alipay"
  | "wechat"
  | "google_pay";

export interface PurchaseRequest {
  readonly transactionId: string;
  readonly amount: number;
  readonly currency: "USD" | "KHR";
  /**
   * ABA expects `items` as a base64-encoded JSON array. Pass an array and the
   * SDK encodes it for you; pass a string and it is sent through untouched
   * (assumed already encoded, or a plain label).
   */
  readonly items?: string | readonly PurchaseItem[];
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly returnUrl?: string;
  readonly cancelUrl?: string;
  readonly continueSuccessUrl?: string;
  /**
   * Where ABA Mobile sends the payer back to after payment. Pass an object and
   * the SDK base64-encodes it; pass a string and it is sent through untouched
   * (assumed already encoded).
   */
  readonly returnDeeplink?: string | ReturnDeeplink;
  readonly paymentOption?: PaymentOption | (string & {});
  readonly customFields?: string;
  readonly returnParams?: string;
}

export interface PurchaseResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly checkoutUrl?: string;
  /**
   * `abamobilebank://` link that opens ABA Mobile straight to this payment.
   * Returned for every KHQR/deeplink payment option. Useless on desktop and on
   * a device without ABA Mobile — fall back to `qrImage` (scan it) or the
   * store links there.
   */
  readonly abapayDeeplink?: string;
  /**
   * Store links ABA returns alongside the deeplink, for a payer whose device
   * has no ABA Mobile installed. Verified present on the live sandbox for
   * every KHQR/deeplink payment option.
   */
  readonly appStoreUrl?: string;
  readonly playStoreUrl?: string;
  readonly qrString?: string;
  /**
   * QR code as a PNG data URI, rendered by ABA. Present on the v3 API, so
   * KHQR display needs no extra call — `generateKHQR` remains for callers
   * who want the styled card instead.
   */
  readonly qrImage?: string;
  readonly amount: number;
  readonly currency: string;
  readonly expiresAt?: string;
  readonly error?: string;
  readonly errorCode?: string;
}

export type PaymentStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "REFUNDED"
  | "ERROR";

export interface StatusResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly status: PaymentStatus;
  readonly amount?: number;
  readonly currency?: string;
  readonly paymentTime?: string;
  readonly error?: string;
  /** ABA status code when the call failed, e.g. "6" (unknown tran_id), "21" (expired key). */
  readonly errorCode?: string;
}

export interface KHQROptions {
  readonly emvData: string;
  readonly amount: number;
  readonly currency: "USD" | "KHR";
  readonly merchantName: string;
  readonly logoUrl?: string;
  readonly headerColor?: string;
}

export interface HashParams {
  readonly req_time: string;
  readonly merchant_id: string;
  readonly tran_id: string;
  readonly amount?: string;
  readonly items?: string;
  readonly shipping?: string;
  readonly ctid?: string;
  readonly pwt?: string;
  readonly firstname?: string;
  readonly lastname?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly type?: string;
  readonly payment_option?: string;
  readonly return_url?: string;
  readonly cancel_url?: string;
  readonly continue_success_url?: string;
  readonly return_deeplink?: string;
  readonly currency?: string;
  readonly custom_fields?: string;
  readonly return_params?: string;
}
