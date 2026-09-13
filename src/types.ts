export interface ABAConfig {
  readonly merchantId: string;
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly webhookSecret?: string;
  readonly rsaPublicKey?: string;
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
  /**
   * Routes the request to the hosted Checkout service instead of the QR
   * Payment API. Send `0` when your merchant profile has the QR Payment API
   * service enabled — otherwise ABA answers every purchase with KHQR JSON and
   * silently ignores `paymentOption`, so `"cards"` never reaches a card form.
   *
   * With it, ABA replies `302` to the hosted payment page and the SDK returns
   * that address as `checkoutUrl`. This is the only sandbox flow a human can
   * actually pay, using ABA's test cards — sandbox KHQR cannot be scanned by
   * the real ABA Mobile app, so those transactions stay PENDING forever.
   *
   * Not part of the hash: ABA reads it from the body only.
   */
  readonly paymentGate?: 0 | 1;
  /**
   * How ABA renders the hosted checkout: `hosted_view` opens it as a full
   * page, `popup` as a modal on desktop and a bottom sheet on mobile web.
   * Only meaningful alongside `paymentGate: 0`. Not part of the hash.
   */
  readonly viewType?: "hosted_view" | "popup" | (string & {});
  readonly customFields?: string;
  readonly returnParams?: string;
  readonly ctid?: string;
  readonly pwt?: string;
  readonly tokenFlag?: string;
}

export interface PurchaseResponse {
  readonly success: boolean;
  readonly transactionId: string;
  /**
   * The hosted payment page to send the payer to. Returned for the Checkout
   * service flow (`paymentGate: 0`), which answers `302` rather than JSON.
   * The v3 QR API does not return one.
   */
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
  | "CANCELLED"
  | "ERROR";

export interface CloseTransactionResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface RefundRequest {
  readonly transactionId: string;
  readonly refundAmount: number;
  /**
   * RSA public key in PEM format.
   * If not provided here, ABAPayWay uses config.rsaPublicKey.
   */
  readonly rsaPublicKey?: string;
}

export interface RefundResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly refundAmount: number;
  readonly grandTotal?: number;
  readonly totalRefunded?: number;
  readonly currency?: string;
  readonly transactionStatus?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

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

export interface CurrencyRate {
  readonly buy: string;
  readonly sell: string;
}

export interface ExchangeRatesResponse {
  readonly success: boolean;
  readonly rates?: Record<string, CurrencyRate>;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface TransactionOperation {
  readonly status: string;
  readonly amount: number;
  readonly transactionDate: string;
  readonly bankRef?: string;
}

export interface TransactionDetailResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly status: PaymentStatus;
  readonly statusCode?: number;
  readonly originalAmount?: number;
  readonly originalCurrency?: string;
  readonly paymentAmount?: number;
  readonly paymentCurrency?: string;
  readonly totalAmount?: number;
  readonly refundAmount?: number;
  readonly discountAmount?: number;
  readonly apv?: string;
  readonly transactionDate?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly bankRef?: string;
  readonly paymentType?: string;
  readonly payerAccount?: string;
  readonly bankName?: string;
  readonly cardSource?: string;
  readonly operations?: readonly TransactionOperation[];
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface TransactionListFilter {
  /** Format: YYYY-MM-DD HH:mm:ss. Defaults to today at 00:00:00 */
  readonly fromDate?: string;
  /** Format: YYYY-MM-DD HH:mm:ss. Max 3 days from fromDate */
  readonly toDate?: string;
  readonly fromAmount?: number;
  readonly toAmount?: number;
  /** e.g. "APPROVED", "REFUNDED", "PENDING", or comma-separated */
  readonly status?: string;
  /** Page index (default: "1") */
  readonly page?: number | string;
  /** Records per page (default: "40", max: 1000) */
  readonly pagination?: number | string;
}

export interface TransactionListItem {
  readonly transactionId: string;
  readonly transactionDate: string;
  readonly apv?: string;
  readonly paymentStatus: PaymentStatus;
  readonly paymentStatusCode?: number;
  readonly originalAmount?: number;
  readonly originalCurrency?: string;
  readonly totalAmount?: number;
  readonly discountAmount?: number;
  readonly refundAmount?: number;
  readonly paymentAmount?: number;
  readonly paymentCurrency?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly bankRef?: string;
  readonly payerAccount?: string;
  readonly bankName?: string;
  readonly cardSource?: string;
  readonly paymentType?: string;
}

export interface TransactionListResponse {
  readonly success: boolean;
  readonly transactions: readonly TransactionListItem[];
  readonly page?: string;
  readonly pagination?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
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

export interface CreatePaymentLinkRequest {
  readonly title: string;
  readonly amount: number;
  readonly currency: "USD" | "KHR";
  readonly returnUrl: string;
  readonly description?: string;
  readonly paymentLimit?: number;
  readonly expiredDate?: number | string;
  readonly merchantRefNo?: string;
  readonly payout?: string;
  readonly image?: Blob | Buffer | Uint8Array;
  readonly imageFilename?: string;
  readonly rsaPublicKey?: string;
}

export interface CreatePaymentLinkResponse {
  readonly success: boolean;
  readonly id?: string;
  readonly title?: string;
  readonly description?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly paymentLimit?: number;
  readonly expiredDate?: string;
  readonly returnUrl?: string;
  readonly merchantRefNo?: string;
  readonly paymentLinkUrl?: string;
  readonly shortLinkUrl?: string;
  readonly qrString?: string;
  readonly qrImage?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface GetPaymentLinkDetailsRequest {
  readonly id: string;
  readonly rsaPublicKey?: string;
}

export interface GetPaymentLinkDetailsResponse {
  readonly success: boolean;
  readonly id?: string;
  readonly title?: string;
  readonly description?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly paymentStatus?: string;
  readonly clicks?: number;
  readonly paymentLimit?: number;
  readonly expiredDate?: string;
  readonly returnUrl?: string;
  readonly merchantRefNo?: string;
  readonly paymentLinkUrl?: string;
  readonly shortLinkUrl?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface CompletePreAuthRequest {
  readonly transactionId: string;
  readonly amount: number;
  readonly payout?: string;
  readonly rsaPublicKey?: string;
}

export interface CompletePreAuthResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly completeAmount?: number;
  readonly originalAmount?: number;
  readonly currency?: string;
  readonly transactionStatus?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface CancelPreAuthRequest {
  readonly transactionId: string;
  readonly rsaPublicKey?: string;
}

export interface CancelPreAuthResponse {
  readonly success: boolean;
  readonly transactionId?: string;
  readonly transactionStatus?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface GetTransactionsByRefRequest {
  readonly merchantRef: string;
}

export interface GetTransactionsByRefResponse {
  readonly success: boolean;
  readonly merchantRef: string;
  readonly transactions: readonly TransactionListItem[];
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface LinkAccountRequest {
  readonly ctid: string;
  readonly currency: "USD" | "KHR";
  readonly requestId?: string;
  readonly tokenFlag?: string;
  readonly returnDeeplink?: string;
  readonly callbackUrl?: string;
}

export interface LinkAccountResponse {
  readonly success: boolean;
  readonly qrString?: string;
  readonly qrImage?: string;
  readonly abapayDeeplink?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface LinkCardRequest {
  readonly ctid: string;
  readonly currency: "USD" | "KHR";
  readonly requestId?: string;
  readonly tokenFlag?: string;
  readonly callbackUrl?: string;
  readonly continueSuccessUrl?: string;
  readonly amount?: number;
  readonly frequency?: string;
}

export interface LinkCardResponse {
  readonly success: boolean;
  readonly html?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface ChargeTokenRequest {
  readonly transactionId: string;
  readonly ctid: string;
  readonly pwt: string;
  readonly amount: number;
  readonly currency: "USD" | "KHR";
  readonly tokenFlag?: string;
  readonly purchaseType?: "purchase" | "pre-auth";
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly callbackUrl?: string;
  readonly items?: readonly PurchaseItem[] | string;
  readonly customFields?: string;
  readonly returnParams?: string;
  readonly payout?: string;
  readonly shippingFee?: number;
}

export interface ChargeTokenResponse {
  readonly success: boolean;
  readonly transactionId: string;
  readonly totalAmount?: number;
  readonly currency?: string;
  readonly status?: PaymentStatus;
  readonly threeDsUrl?: string;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface PaymentCredential {
  readonly ctid: string;
  readonly pwt: string;
  readonly tokenFlag?: string;
  readonly sourceOfFund?: string;
  readonly subscribedAmount?: number;
  readonly currency?: string;
  readonly expiredAt?: string;
  readonly type?: string;
  readonly status?: number;
  readonly frequency?: string;
}

export interface GetTokenDetailsRequest {
  readonly requestId: string;
}

export interface GetTokenDetailsResponse {
  readonly success: boolean;
  readonly credential?: PaymentCredential;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface RenewTokenRequest {
  readonly ctid: string;
  readonly pwt: string;
  readonly requestId?: string;
}

export interface RenewTokenResponse {
  readonly success: boolean;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

export interface RemoveTokenRequest {
  readonly ctid: string;
  readonly pwt: string;
}

export interface RemoveTokenResponse {
  readonly success: boolean;
  readonly code?: string;
  readonly message?: string;
  readonly error?: string;
}

// ============================================================================
// Payout (Funds Route & Splitting) Types
// ============================================================================

export interface PayoutBeneficiaryData {
  readonly name?: string;
  readonly payee?: string;
  readonly currency?: string;
  readonly type?: string;
  readonly status?: number;
  readonly created_at?: string;
}

export interface AddPayoutBeneficiaryRequest {
  /**
   * Beneficiary identifier: MID or ABA account number.
   */
  readonly payee: string;
  /**
   * Request timestamp in UTC (YYYYMMDDHHmmss).
   * If omitted, SDK generates current UTC time.
   */
  readonly requestTime?: string;
  /**
   * RSA public key in PEM format.
   * If not provided here, ABAPayWay uses config.rsaPublicKey.
   */
  readonly rsaPublicKey?: string;
}

export interface AddPayoutBeneficiaryResponse {
  readonly success: boolean;
  readonly status?: {
    readonly code?: string;
    readonly message?: string;
  };
  readonly data?: PayoutBeneficiaryData;
  readonly error?: string;
  readonly code?: string;
}

export interface UpdatePayoutBeneficiaryStatusRequest {
  /**
   * Beneficiary identifier: MID or ABA account number.
   */
  readonly payee: string;
  /**
   * Status: 1 to activate, 0 to disable.
   */
  readonly status: 0 | 1;
  /**
   * Request timestamp in UTC (YYYYMMDDHHmmss).
   * If omitted, SDK generates current UTC time.
   */
  readonly requestTime?: string;
  /**
   * RSA public key in PEM format.
   * If not provided here, ABAPayWay uses config.rsaPublicKey.
   */
  readonly rsaPublicKey?: string;
}

export interface UpdatePayoutBeneficiaryStatusResponse {
  readonly success: boolean;
  readonly status?: {
    readonly code?: string;
    readonly message?: string;
  };
  readonly data?: PayoutBeneficiaryData;
  readonly error?: string;
  readonly code?: string;
}

export interface PayoutBeneficiaryItem {
  /**
   * Account number or MID of the beneficiary.
   */
  readonly account: string;
  /**
   * Payout amount for this beneficiary.
   */
  readonly amount: number;
}

export interface PayoutResultBeneficiary {
  readonly payout_id?: string;
  readonly name?: string;
  readonly mid_acccount?: string;
  readonly amount?: number;
  readonly currency?: string;
}

export interface CreatePayoutRequest {
  /**
   * Unique transaction id.
   */
  readonly transactionId: string;
  /**
   * Total payout amount (sum of all beneficiary amounts).
   */
  readonly amount: number;
  /**
   * Transaction currency: "USD" or "KHR".
   */
  readonly currency: "USD" | "KHR";
  /**
   * Array of beneficiaries with account and amount (max 10).
   */
  readonly beneficiaries: PayoutBeneficiaryItem[];
  /**
   * Optional custom fields object or JSON string.
   */
  readonly customFields?: Record<string, any> | string;
  /**
   * RSA public key in PEM format.
   * If not provided here, ABAPayWay uses config.rsaPublicKey.
   */
  readonly rsaPublicKey?: string;
}

export interface CreatePayoutResponse {
  readonly success: boolean;
  readonly transaction_id?: string;
  readonly transaction_date?: string;
  readonly external_reference?: string;
  readonly apv?: string;
  readonly transaction_amount?: number;
  readonly transaction_currency?: string;
  readonly beneficiaries?: PayoutResultBeneficiary[];
  readonly status?: {
    readonly code?: string;
    readonly message?: string;
    readonly tran_id?: string;
    readonly trace_id?: string;
  };
  readonly error?: string;
  readonly code?: string;
}
