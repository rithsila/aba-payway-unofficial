import type {
  ABAConfig,
  PurchaseRequest,
  PurchaseResponse,
  StatusResponse,
  CloseTransactionResponse,
  RefundRequest,
  RefundResponse,
  CurrencyRate,
  ExchangeRatesResponse,
  TransactionOperation,
  TransactionDetailResponse,
  TransactionListFilter,
  TransactionListItem,
  TransactionListResponse,
  PaymentStatus,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  GetPaymentLinkDetailsRequest,
  GetPaymentLinkDetailsResponse,
  CompletePreAuthRequest,
  CompletePreAuthResponse,
  CancelPreAuthRequest,
  CancelPreAuthResponse,
  GetTransactionsByRefRequest,
  GetTransactionsByRefResponse,
  LinkAccountRequest,
  LinkAccountResponse,
  LinkCardRequest,
  LinkCardResponse,
  ChargeTokenRequest,
  ChargeTokenResponse,
  PaymentCredential,
  GetTokenDetailsRequest,
  GetTokenDetailsResponse,
  RenewTokenRequest,
  RenewTokenResponse,
  RemoveTokenRequest,
  RemoveTokenResponse,
  AddPayoutBeneficiaryRequest,
  AddPayoutBeneficiaryResponse,
  UpdatePayoutBeneficiaryStatusRequest,
  UpdatePayoutBeneficiaryStatusResponse,
  CreatePayoutRequest,
  CreatePayoutResponse,
} from "./types";
import { generateABAHash, hmacSha512Base64, hmacSha512Hex } from "./hash";
import { readAbaStatus } from "./response";
import { encryptRsaChunks } from "./rsa";
import {
  getABATimestamp,
  formatPhoneForABA,
  encodeItemsForABA,
  encodeReturnDeeplinkForABA,
  generateTransactionId,
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
      ctid: request.ctid ?? "",
      pwt: request.pwt ?? "",
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

    if (request.ctid) body.set("ctid", request.ctid);
    if (request.pwt) body.set("pwt", request.pwt);
    if (request.tokenFlag) body.set("token_flag", request.tokenFlag);

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

  async closeTransaction(transactionId: string): Promise<CloseTransactionResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): CloseTransactionResponse => ({
      success: false,
      transactionId: transactionId ?? "",
      code,
      message: message ?? error,
      error,
    });

    if (!transactionId || !transactionId.trim()) {
      return failure("transactionId is required");
    }

    const reqTime = getABATimestamp();
    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}${transactionId}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: transactionId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/close-transaction`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) return failure(status.message, status.code || undefined, status.message);

      return {
        success: true,
        transactionId: parsed.data?.status?.tran_id ?? transactionId,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): RefundResponse => ({
      success: false,
      transactionId: request?.transactionId ?? "",
      refundAmount: request?.refundAmount ?? 0,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.transactionId || !request.transactionId.trim()) {
      return failure("transactionId is required");
    }

    if (
      typeof request?.refundAmount !== "number" ||
      !Number.isFinite(request.refundAmount) ||
      request.refundAmount <= 0
    ) {
      return failure("refundAmount must be a positive number");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for refund. Provide rsaPublicKey in config or request."
      );
    }

    const reqTime = getABATimestamp();

    let merchantAuth: string;
    try {
      const authPayload = JSON.stringify({
        mc_id: this.config.merchantId,
        tran_id: request.transactionId,
        refund_amount: request.refundAmount,
      });
      merchantAuth = encryptRsaChunks(authPayload, rsaPublicKey);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : "RSA encryption failed"
      );
    }

    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}${merchantAuth}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      merchant_auth: merchantAuth,
      hash,
    });

    const url = `${this.config.baseUrl}/api/merchant-portal/merchant-access/online-transaction/refund`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      return {
        success: true,
        transactionId: request.transactionId,
        refundAmount: request.refundAmount,
        grandTotal: toNumber(parsed.data?.grand_total),
        totalRefunded: toNumber(parsed.data?.total_refunded),
        currency: parsed.data?.currency,
        transactionStatus: parsed.data?.transaction_status,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async getExchangeRates(): Promise<ExchangeRatesResponse> {
    const failure = (error: string, code?: string): ExchangeRatesResponse => ({
      success: false,
      error,
      code,
    });

    const reqTime = getABATimestamp();
    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/exchange-rate`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) return failure(status.message, status.code || undefined);

      const rates: Record<string, CurrencyRate> = {};
      const collectRates = (obj: unknown) => {
        if (!obj || typeof obj !== "object") return;
        for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
          if (
            val &&
            typeof val === "object" &&
            "buy" in val &&
            "sell" in val
          ) {
            rates[key.toLowerCase()] = {
              buy: String((val as any).buy),
              sell: String((val as any).sell),
            };
          }
        }
      };

      collectRates(parsed.data);
      collectRates(parsed.data?.exchange_rates);

      return {
        success: true,
        rates,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async getTransactionDetail(transactionId: string): Promise<TransactionDetailResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): TransactionDetailResponse => ({
      success: false,
      transactionId: transactionId ?? "",
      status: "ERROR",
      code,
      message: message ?? error,
      error,
    });

    if (!transactionId || !transactionId.trim()) {
      return failure("transactionId is required");
    }

    const reqTime = getABATimestamp();
    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}${transactionId}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: transactionId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/transaction-detail`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const detail = parsed.data?.data ?? parsed.data ?? {};
      const status = readAbaStatus(detail?.status ?? parsed.data?.status);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const operations: TransactionOperation[] = Array.isArray(
        detail.transaction_operations
      )
        ? detail.transaction_operations.map((op: any) => ({
            status: String(op.status ?? ""),
            amount: toNumber(op.amount) ?? 0,
            transactionDate: String(op.transaction_date ?? ""),
            bankRef: op.bank_ref ? String(op.bank_ref) : undefined,
          }))
        : [];

      return {
        success: true,
        transactionId: String(detail.transaction_id ?? transactionId),
        status: mapPaymentStatus(detail.payment_status),
        statusCode:
          typeof detail.payment_status_code === "number"
            ? detail.payment_status_code
            : undefined,
        originalAmount: toNumber(detail.original_amount),
        originalCurrency: detail.original_currency ? String(detail.original_currency) : undefined,
        paymentAmount: toNumber(detail.payment_amount),
        paymentCurrency: detail.payment_currency ? String(detail.payment_currency) : undefined,
        totalAmount: toNumber(detail.total_amount),
        refundAmount: toNumber(detail.refund_amount),
        discountAmount: toNumber(detail.discount_amount),
        apv: detail.apv ? String(detail.apv) : undefined,
        transactionDate: detail.transaction_date ? String(detail.transaction_date) : undefined,
        firstName: detail.first_name ? String(detail.first_name) : undefined,
        lastName: detail.last_name ? String(detail.last_name) : undefined,
        email: detail.email ? String(detail.email) : undefined,
        phone: detail.phone ? String(detail.phone) : undefined,
        bankRef: detail.bank_ref ? String(detail.bank_ref) : undefined,
        paymentType: detail.payment_type ? String(detail.payment_type) : undefined,
        payerAccount: detail.payer_account ? String(detail.payer_account) : undefined,
        bankName: detail.bank_name ? String(detail.bank_name) : undefined,
        cardSource: detail.card_source ? String(detail.card_source) : undefined,
        operations: operations.length > 0 ? operations : undefined,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async listTransactions(
    filter: TransactionListFilter = {}
  ): Promise<TransactionListResponse> {
    const failure = (error: string, code?: string): TransactionListResponse => ({
      success: false,
      transactions: [],
      error,
      code,
    });

    const reqTime = getABATimestamp();
    const fromDate = filter.fromDate ?? "";
    const toDate = filter.toDate ?? "";
    const fromAmount = filter.fromAmount !== undefined ? String(filter.fromAmount) : "";
    const toAmount = filter.toAmount !== undefined ? String(filter.toAmount) : "";
    const statusVal = filter.status ?? "";
    const page = filter.page !== undefined ? String(filter.page) : "1";
    const pagination = filter.pagination !== undefined ? String(filter.pagination) : "40";

    const hashSequence = `${reqTime}${this.config.merchantId}${fromDate}${toDate}${fromAmount}${toAmount}${statusVal}${page}${pagination}`;
    const hash = await hmacSha512Base64(hashSequence, this.config.apiKey);

    const body = JSON.stringify({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      from_date: fromDate || null,
      to_date: toDate || null,
      from_amount: fromAmount || null,
      to_amount: toAmount || null,
      status: statusVal || null,
      page,
      pagination,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/transaction-list-2`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) return failure(status.message, status.code || undefined);

      const rawItems = Array.isArray(parsed.data?.data) ? parsed.data.data : [];
      const transactions: TransactionListItem[] = rawItems.map((item: any) => ({
        transactionId: String(item.transaction_id ?? ""),
        transactionDate: String(item.transaction_date ?? ""),
        apv: item.apv ? String(item.apv) : undefined,
        paymentStatus: mapPaymentStatus(item.payment_status),
        paymentStatusCode:
          typeof item.payment_status_code === "number"
            ? item.payment_status_code
            : undefined,
        originalAmount: toNumber(item.original_amount),
        originalCurrency: item.original_currency ? String(item.original_currency) : undefined,
        totalAmount: toNumber(item.total_amount),
        discountAmount: toNumber(item.discount_amount),
        refundAmount: toNumber(item.refund_amount),
        paymentAmount: toNumber(item.payment_amount),
        paymentCurrency: item.payment_currency ? String(item.payment_currency) : undefined,
        firstName: item.first_name ? String(item.first_name) : undefined,
        lastName: item.last_name ? String(item.last_name) : undefined,
        email: item.email ? String(item.email) : undefined,
        phone: item.phone ? String(item.phone) : undefined,
        bankRef: item.bank_ref ? String(item.bank_ref) : undefined,
        payerAccount: item.payer_account ? String(item.payer_account) : undefined,
        bankName: item.bank_name ? String(item.bank_name) : undefined,
        cardSource: item.card_source ? String(item.card_source) : undefined,
        paymentType: item.payment_type ? String(item.payment_type) : undefined,
      }));

      return {
        success: true,
        transactions,
        page: parsed.data?.page ? String(parsed.data.page) : page,
        pagination: parsed.data?.pagination ? String(parsed.data.pagination) : pagination,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  /**
   * Verify an ABA pushback (callback) against its `X-PayWay-HMAC-SHA512`
   * header. Returns false for anything it cannot positively verify — a bad
   * signature, a malformed body, a missing key — so a caller can branch on
   * the result without a try/catch.
   *
   * `payload` may be the raw request body or the already-parsed object.
   * Unlike most gateways, ABA's scheme rebuilds the signature from the parsed
   * values rather than the raw bytes, so re-serialising the body on the way
   * in cannot invalidate it. Frameworks that hand you a parsed body are fine.
   *
   * `secret` defaults to `webhookSecret`, then to `apiKey` — ABA does not
   * issue a separate pushback secret, it signs with the merchant API key.
   */
  async verifyWebhook(
    payload: string | Record<string, unknown>,
    signature: string,
    secret?: string
  ): Promise<boolean> {
    try {
      const key = secret ?? this.config.webhookSecret ?? this.config.apiKey;
      if (!key || !signature) return false;

      const body: unknown = typeof payload === "string" ? JSON.parse(payload) : payload;
      // A JSON array or scalar has no keys to sort; only an object can be a
      // pushback body, and Array.isArray must be checked because arrays are
      // objects too.
      if (body === null || typeof body !== "object" || Array.isArray(body)) return false;

      const expected = await hmacSha512Base64(
        buildPushbackHashBase(body as Record<string, unknown>),
        key
      );

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

  async createPaymentLink(
    request: CreatePaymentLinkRequest
  ): Promise<CreatePaymentLinkResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): CreatePaymentLinkResponse => ({
      success: false,
      title: request?.title,
      amount: request?.amount,
      currency: request?.currency,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.title || !request.title.trim()) {
      return failure("title is required");
    }

    if (
      typeof request?.amount !== "number" ||
      !Number.isFinite(request.amount) ||
      request.amount <= 0
    ) {
      return failure("amount must be a positive number");
    }

    if (!request?.returnUrl || !request.returnUrl.trim()) {
      return failure("returnUrl is required");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for payment link. Provide rsaPublicKey in config or request."
      );
    }

    const reqTime = getABATimestamp();

    let merchantAuth: string;
    try {
      const authPayloadObj: Record<string, unknown> = {
        mc_id: this.config.merchantId,
        title: request.title,
        amount: request.amount,
        currency: request.currency,
        return_url: Buffer.from(request.returnUrl).toString("base64"),
      };
      if (request.description !== undefined) authPayloadObj.description = request.description;
      if (request.paymentLimit !== undefined) authPayloadObj.payment_limit = request.paymentLimit;
      if (request.expiredDate !== undefined) authPayloadObj.expired_date = request.expiredDate;
      if (request.merchantRefNo !== undefined) authPayloadObj.merchant_ref_no = request.merchantRefNo;
      if (request.payout !== undefined) authPayloadObj.payout = request.payout;

      merchantAuth = encryptRsaChunks(JSON.stringify(authPayloadObj), rsaPublicKey);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : "RSA encryption failed"
      );
    }

    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}${merchantAuth}`,
      this.config.apiKey
    );

    const formData = new FormData();
    formData.append("request_time", reqTime);
    formData.append("merchant_id", this.config.merchantId);
    formData.append("merchant_auth", merchantAuth);
    formData.append("hash", hash);

    if (request.image) {
      if (typeof Blob !== "undefined" && request.image instanceof Blob) {
        formData.append("image", request.image, request.imageFilename ?? "image.png");
      } else if (Buffer.isBuffer(request.image) || request.image instanceof Uint8Array) {
        const blob = new Blob([request.image as any]);
        formData.append("image", blob, request.imageFilename ?? "image.png");
      }
    }

    const url = `${this.config.baseUrl}/api/merchant-portal/merchant-access/payment-link/create`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const data = parsed.data?.data ?? parsed.data ?? {};
      return {
        success: true,
        id: data.id,
        title: data.title ?? request.title,
        description: data.description,
        amount: toNumber(data.amount) ?? request.amount,
        currency: data.currency ?? request.currency,
        paymentLimit: toNumber(data.payment_limit),
        expiredDate: data.expired_date,
        returnUrl: request.returnUrl,
        merchantRefNo: data.merchant_ref_no ?? request.merchantRefNo,
        paymentLinkUrl: data.payment_link_url,
        shortLinkUrl: data.short_link_url,
        qrString: data.qr_string ?? data.qrString,
        qrImage: data.qr_image ?? data.qrImage,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async getPaymentLinkDetails(
    request: GetPaymentLinkDetailsRequest
  ): Promise<GetPaymentLinkDetailsResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): GetPaymentLinkDetailsResponse => ({
      success: false,
      id: request?.id,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.id || !request.id.trim()) {
      return failure("id is required");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for payment link details. Provide rsaPublicKey in config or request."
      );
    }

    const reqTime = getABATimestamp();

    let merchantAuth: string;
    try {
      const authPayload = JSON.stringify({
        mc_id: this.config.merchantId,
        id: request.id,
      });
      merchantAuth = encryptRsaChunks(authPayload, rsaPublicKey);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : "RSA encryption failed"
      );
    }

    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}${merchantAuth}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      merchant_auth: merchantAuth,
      hash,
    });

    const url = `${this.config.baseUrl}/api/merchant-portal/merchant-access/payment-link/detail`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const data = parsed.data?.data ?? parsed.data ?? {};
      return {
        success: true,
        id: data.id ?? request.id,
        title: data.title,
        description: data.description,
        amount: toNumber(data.amount),
        currency: data.currency,
        paymentStatus: data.payment_status ?? data.status,
        clicks: toNumber(data.clicks),
        paymentLimit: toNumber(data.payment_limit),
        expiredDate: data.expired_date,
        returnUrl: data.return_url,
        merchantRefNo: data.merchant_ref_no,
        paymentLinkUrl: data.payment_link_url,
        shortLinkUrl: data.short_link_url,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async completePreAuth(
    request: CompletePreAuthRequest
  ): Promise<CompletePreAuthResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): CompletePreAuthResponse => ({
      success: false,
      transactionId: request?.transactionId ?? "",
      completeAmount: request?.amount,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.transactionId || !request.transactionId.trim()) {
      return failure("transactionId is required");
    }

    if (
      typeof request?.amount !== "number" ||
      !Number.isFinite(request.amount) ||
      request.amount <= 0
    ) {
      return failure("amount must be a positive number");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for pre-auth. Provide rsaPublicKey in config or request."
      );
    }

    const reqTime = getABATimestamp();

    let merchantAuth: string;
    try {
      const authPayloadObj: Record<string, unknown> = {
        mc_id: this.config.merchantId,
        tran_id: request.transactionId,
        complete_amount: request.amount,
      };
      if (request.payout !== undefined) {
        authPayloadObj.payout = request.payout;
      }
      merchantAuth = encryptRsaChunks(JSON.stringify(authPayloadObj), rsaPublicKey);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : "RSA encryption failed"
      );
    }

    const hash = await hmacSha512Base64(
      `${merchantAuth}${reqTime}${this.config.merchantId}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      merchant_auth: merchantAuth,
      hash,
    });

    const url = `${this.config.baseUrl}/api/merchant-portal/merchant-access/online-transaction/pre-auth-completion`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const data = parsed.data?.data ?? parsed.data ?? {};
      return {
        success: true,
        transactionId: data.tran_id ?? request.transactionId,
        completeAmount: toNumber(data.complete_amount) ?? request.amount,
        originalAmount: toNumber(data.original_amount),
        currency: data.currency,
        transactionStatus: mapPaymentStatus(data.transaction_status),
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  /**
   * Cancel an authorized pre-purchase transaction, releasing the hold on funds.
   *
   * @param request The transaction ID to cancel and optional RSA public key
   * @returns CancelPreAuthResponse with cancellation status and details
   */
  async cancelPreAuth(
    request: CancelPreAuthRequest
  ): Promise<CancelPreAuthResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): CancelPreAuthResponse => ({
      success: false,
      transactionId: request?.transactionId ?? "",
      code,
      message: message ?? error,
      error,
    });

    if (!request?.transactionId || !request.transactionId.trim()) {
      return failure("transactionId is required");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for pre-auth cancellation. Provide rsaPublicKey in config or request."
      );
    }

    const reqTime = getABATimestamp();

    let merchantAuth: string;
    try {
      const authPayload = JSON.stringify({
        mc_id: this.config.merchantId,
        tran_id: request.transactionId,
      });
      merchantAuth = encryptRsaChunks(authPayload, rsaPublicKey);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : "RSA encryption failed"
      );
    }

    const hash = await hmacSha512Base64(
      `${this.config.merchantId}${merchantAuth}${reqTime}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      merchant_auth: merchantAuth,
      hash,
    });

    const url = `${this.config.baseUrl}/api/merchant-portal/merchant-access/online-transaction/pre-auth-cancellation`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const data = parsed.data?.data ?? parsed.data ?? {};
      return {
        success: true,
        transactionId: data.tran_id ?? request.transactionId,
        transactionStatus: data.transaction_status,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async getTransactionsByRef(
    request: GetTransactionsByRefRequest
  ): Promise<GetTransactionsByRefResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): GetTransactionsByRefResponse => ({
      success: false,
      merchantRef: request?.merchantRef ?? "",
      transactions: [],
      code,
      message: message ?? error,
      error,
    });

    if (!request?.merchantRef || !request.merchantRef.trim()) {
      return failure("merchantRef is required");
    }

    const reqTime = getABATimestamp();
    const hash = await hmacSha512Base64(
      `${reqTime}${this.config.merchantId}${request.merchantRef}`,
      this.config.apiKey
    );

    const body = JSON.stringify({
      req_time: reqTime,
      merchant_id: this.config.merchantId,
      merchant_ref: request.merchantRef,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-gateway/v1/payments/get-transactions-by-mc-ref`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const rawItems = Array.isArray(parsed.data?.data) ? parsed.data.data : [];
      const transactions: TransactionListItem[] = rawItems.map((item: any) => ({
        transactionId: String(item.transaction_id ?? ""),
        transactionDate: String(item.transaction_date ?? ""),
        apv: item.apv ? String(item.apv) : undefined,
        paymentStatus: mapPaymentStatus(item.payment_status),
        paymentStatusCode:
          typeof item.payment_status_code === "number"
            ? item.payment_status_code
            : undefined,
        originalAmount: toNumber(item.original_amount),
        originalCurrency: item.original_currency ? String(item.original_currency) : undefined,
        totalAmount: toNumber(item.total_amount),
        discountAmount: toNumber(item.discount_amount),
        refundAmount: toNumber(item.refund_amount),
        paymentAmount: toNumber(item.payment_amount),
        paymentCurrency: item.payment_currency ? String(item.payment_currency) : undefined,
        firstName: item.first_name ? String(item.first_name) : undefined,
        lastName: item.last_name ? String(item.last_name) : undefined,
        email: item.email ? String(item.email) : undefined,
        phone: item.phone ? String(item.phone) : undefined,
        bankRef: item.bank_ref ? String(item.bank_ref) : undefined,
        payerAccount: item.payer_account ? String(item.payer_account) : undefined,
        bankName: item.bank_name ? String(item.bank_name) : undefined,
        cardSource: item.card_source ? String(item.card_source) : undefined,
        paymentType: item.payment_type ? String(item.payment_type) : undefined,
      }));

      return {
        success: true,
        merchantRef: request.merchantRef,
        transactions,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async linkAccount(
    request: LinkAccountRequest
  ): Promise<LinkAccountResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): LinkAccountResponse => ({
      success: false,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.ctid || !request.ctid.trim()) {
      return failure("ctid is required");
    }

    const reqTime = getABATimestamp();
    const requestId = request.requestId ?? generateTransactionId();
    const tokenFlag = request.tokenFlag ?? "CITI_FLEX";
    const returnDeeplink = request.returnDeeplink
      ? Buffer.from(request.returnDeeplink).toString("base64")
      : "";
    const callbackUrl = request.callbackUrl
      ? Buffer.from(request.callbackUrl).toString("base64")
      : "";

    const b4hash = `${this.config.merchantId}${reqTime}${request.ctid}${returnDeeplink}${callbackUrl}${requestId}${tokenFlag}${request.currency}`;
    const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

    const bodyObj: Record<string, unknown> = {
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      request_id: requestId,
      ctid: request.ctid,
      token_flag: tokenFlag,
      currency: request.currency,
      hash,
    };
    if (returnDeeplink) bodyObj.return_deeplink = returnDeeplink;
    if (callbackUrl) bodyObj.callback_url = callbackUrl;

    const url = `${this.config.baseUrl}/api/payment-credential/v3/aof/link-account`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const data = parsed.data?.data ?? parsed.data ?? {};
      return {
        success: true,
        qrString: data.qr_string ?? data.qrString,
        qrImage: data.qr_image ?? data.qrImage,
        abapayDeeplink: data.abapay_deeplink ?? data.abapayDeeplink,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async linkCard(
    request: LinkCardRequest
  ): Promise<LinkCardResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): LinkCardResponse => ({
      success: false,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.ctid || !request.ctid.trim()) {
      return failure("ctid is required");
    }

    const reqTime = getABATimestamp();
    const requestId = request.requestId ?? generateTransactionId();
    const tokenFlag = request.tokenFlag ?? "CITI_FLEX";
    const callbackUrl = request.callbackUrl
      ? Buffer.from(request.callbackUrl).toString("base64")
      : "";
    const continueSuccessUrl = request.continueSuccessUrl
      ? Buffer.from(request.continueSuccessUrl).toString("base64")
      : "";
    const frequency = request.frequency ?? "";
    const amountStr = request.amount !== undefined ? request.amount.toFixed(2) : "";

    const b4hash = `${this.config.merchantId}${reqTime}${request.ctid}${callbackUrl}${requestId}${tokenFlag}${frequency}${amountStr}${request.currency}${continueSuccessUrl}`;
    const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

    const formData = new FormData();
    formData.append("request_id", requestId);
    formData.append("request_time", reqTime);
    formData.append("merchant_id", this.config.merchantId);
    formData.append("ctid", request.ctid);
    formData.append("token_flag", tokenFlag);
    formData.append("currency", request.currency);
    formData.append("hash", hash);

    if (callbackUrl) formData.append("callback_url", callbackUrl);
    if (continueSuccessUrl) formData.append("continue_success_url", continueSuccessUrl);
    if (frequency) formData.append("frequency", frequency);
    if (amountStr) formData.append("amount", amountStr);

    const url = `${this.config.baseUrl}/api/payment-credential/v3/cof/link-card`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      if (text.trim().startsWith("{")) {
        try {
          const json = JSON.parse(text);
          const status = readAbaStatus(json);
          if (!status.ok) {
            return failure(status.message, status.code || undefined, status.message);
          }
        } catch {}
      }

      return {
        success: response.ok,
        html: text,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async chargeToken(
    request: ChargeTokenRequest
  ): Promise<ChargeTokenResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): ChargeTokenResponse => ({
      success: false,
      transactionId: request?.transactionId ?? "",
      currency: request?.currency,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.transactionId || !request.transactionId.trim()) {
      return failure("transactionId is required");
    }
    if (!request?.pwt || !request.pwt.trim()) {
      return failure("pwt is required");
    }
    if (
      typeof request?.amount !== "number" ||
      !Number.isFinite(request.amount) ||
      request.amount <= 0
    ) {
      return failure("amount must be a positive number");
    }

    const reqTime = getABATimestamp();
    const amount = request.amount.toFixed(2);
    const tokenFlag = request.tokenFlag ?? "CITI_FLEX";
    const purchaseType = request.purchaseType ?? "purchase";
    const phone = request.phone ? formatPhoneForABA(request.phone) : "";
    const items = encodeItemsForABA(request.items);
    const firstName = request.firstName ?? "";
    const lastName = request.lastName ?? "";
    const email = request.email ?? "";
    const callbackUrl = request.callbackUrl ? Buffer.from(request.callbackUrl).toString("base64") : "";
    const customFields = request.customFields ?? "";
    const returnParams = request.returnParams ?? "";
    const payout = request.payout ?? "";
    const shippingFee = request.shippingFee !== undefined ? request.shippingFee.toFixed(2) : "";

    const b4hash = `${reqTime}${this.config.merchantId}${request.transactionId}${amount}${request.currency}${items}${request.ctid}${request.pwt}${firstName}${lastName}${email}${phone}${purchaseType}${callbackUrl}${customFields}${returnParams}${payout}${tokenFlag}${shippingFee}`;
    const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

    const bodyObj: Record<string, unknown> = {
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      tran_id: request.transactionId,
      ctid: request.ctid,
      pwt: request.pwt,
      amount: request.amount,
      currency: request.currency,
      token_flag: tokenFlag,
      purchase_type: purchaseType,
      hash,
    };
    if (firstName) bodyObj.first_name = firstName;
    if (lastName) bodyObj.last_name = lastName;
    if (email) bodyObj.email = email;
    if (phone) bodyObj.phone = phone;
    if (items) bodyObj.items = items;
    if (callbackUrl) bodyObj.callback_url = callbackUrl;
    if (customFields) bodyObj.custom_fields = customFields;
    if (returnParams) bodyObj.return_params = returnParams;
    if (payout) bodyObj.payout = payout;
    if (shippingFee) bodyObj.shipping_fee = request.shippingFee;

    const url = `${this.config.baseUrl}/api/payment-gateway/v3/purchase/payment-credential`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const data = parsed.data?.data ?? parsed.data ?? {};
      return {
        success: true,
        transactionId: data.tran_id ?? request.transactionId,
        totalAmount: toNumber(data.total_amount ?? data.amount) ?? request.amount,
        currency: data.currency ?? request.currency,
        status: mapPaymentStatus(data.payment_status ?? data.status),
        threeDsUrl: data["3ds_url"] ?? data.threeDsUrl,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async getTokenDetails(
    request: GetTokenDetailsRequest
  ): Promise<GetTokenDetailsResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): GetTokenDetailsResponse => ({
      success: false,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.requestId || !request.requestId.trim()) {
      return failure("requestId is required");
    }

    const reqTime = getABATimestamp();
    const b4hash = `${this.config.merchantId}${reqTime}${request.requestId}`;
    const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      request_id: request.requestId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-credential/v3/token-management/get-token-details`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      const cred = parsed.data?.data?.payment_credential ?? parsed.data?.payment_credential;
      const credential: PaymentCredential | undefined = cred
        ? {
            ctid: cred.ctid,
            pwt: cred.pwt,
            tokenFlag: cred.token_flag,
            sourceOfFund: cred.source_of_fund,
            subscribedAmount: toNumber(cred.subscribed_amount),
            currency: cred.currency,
            expiredAt: cred.expired_at,
            type: cred.type,
            status: typeof cred.status === "number" ? cred.status : undefined,
            frequency: cred.frequency,
          }
        : undefined;

      return {
        success: true,
        credential,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async renewToken(
    request: RenewTokenRequest
  ): Promise<RenewTokenResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): RenewTokenResponse => ({
      success: false,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.pwt || !request.pwt.trim()) {
      return failure("pwt is required");
    }

    const reqTime = getABATimestamp();
    const requestId = request.requestId ?? generateTransactionId();
    const b4hash = `${request.ctid}${reqTime}${request.pwt}${this.config.merchantId}${requestId}`;
    const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      ctid: request.ctid,
      pwt: request.pwt,
      request_id: requestId,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-credential/v3/token-management/renew-expired-account-token`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      return {
        success: true,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async removeToken(
    request: RemoveTokenRequest
  ): Promise<RemoveTokenResponse> {
    const failure = (
      error: string,
      code?: string,
      message?: string
    ): RemoveTokenResponse => ({
      success: false,
      code,
      message: message ?? error,
      error,
    });

    if (!request?.pwt || !request.pwt.trim()) {
      return failure("pwt is required");
    }

    const reqTime = getABATimestamp();
    const b4hash = `${this.config.merchantId}${request.ctid}${reqTime}${request.pwt}`;
    const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

    const body = JSON.stringify({
      request_time: reqTime,
      merchant_id: this.config.merchantId,
      ctid: request.ctid,
      pwt: request.pwt,
      hash,
    });

    const url = `${this.config.baseUrl}/api/payment-credential/v3/token-management/remove-token`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) return failure(parsed.error);

      const status = readAbaStatus(parsed.data);
      if (!status.ok) {
        return failure(status.message, status.code || undefined, status.message);
      }

      return {
        success: true,
        code: status.code,
        message: status.message,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  /**
   * Add a beneficiary (MID or ABA Account) to the payout whitelist.
   *
   * Must be called before initiating payouts to this beneficiary.
   *
   * @param request Payee identifier and optional RSA key or timestamp
   * @returns AddPayoutBeneficiaryResponse containing beneficiary details and status
   */
  async addPayoutBeneficiary(
    request: AddPayoutBeneficiaryRequest
  ): Promise<AddPayoutBeneficiaryResponse> {
    const failure = (error: string, code?: string): AddPayoutBeneficiaryResponse => ({
      success: false,
      error,
      code,
    });

    if (!request.payee || !request.payee.trim()) {
      return failure("Payee (MID or account) is required for payout whitelist", "PAYEE_REQUIRED");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for payout whitelist. Provide rsaPublicKey in config or request.",
        "RSA_KEY_REQUIRED"
      );
    }

    try {
      const requestTime = request.requestTime ?? getABATimestamp();
      const authPayloadObj = {
        mc_id: this.config.merchantId,
        payee: request.payee.trim(),
      };

      let merchantAuth: string;
      try {
        merchantAuth = encryptRsaChunks(JSON.stringify(authPayloadObj), rsaPublicKey);
      } catch (err) {
        return failure(
          err instanceof Error ? err.message : "RSA encryption failed",
          "RSA_ENCRYPTION_FAILED"
        );
      }

      const b4hash = requestTime + merchantAuth;
      const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

      const endpoint = `${this.config.baseUrl}/api/merchant-portal/merchant-access/whitelist-account/add-whitelist-payout`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_time: requestTime,
          merchant_id: this.config.merchantId,
          merchant_auth: merchantAuth,
          hash,
        }),
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) {
        return failure(parsed.error);
      }

      const raw = parsed.data ?? {};
      const statusObj = raw.status ?? {};
      const statusCode = statusObj.code !== undefined ? String(statusObj.code) : undefined;
      const statusMessage = statusObj.message;

      const isSuccess = statusCode === "00" || statusCode === "0";
      if (!isSuccess) {
        return failure(
          statusMessage || `Failed to whitelist account (code: ${statusCode})`,
          statusCode
        );
      }

      return {
        success: true,
        status: {
          code: statusCode,
          message: statusMessage,
        },
        data: raw.data,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  /**
   * Update the status of a whitelisted beneficiary (1: active, 0: inactive).
   *
   * @param request Payee, status (0 or 1), and optional RSA key or timestamp
   * @returns UpdatePayoutBeneficiaryStatusResponse
   */
  async updatePayoutBeneficiaryStatus(
    request: UpdatePayoutBeneficiaryStatusRequest
  ): Promise<UpdatePayoutBeneficiaryStatusResponse> {
    const failure = (error: string, code?: string): UpdatePayoutBeneficiaryStatusResponse => ({
      success: false,
      error,
      code,
    });

    if (!request.payee || !request.payee.trim()) {
      return failure("Payee is required for updating beneficiary status", "PAYEE_REQUIRED");
    }

    if (request.status !== 0 && request.status !== 1) {
      return failure("Status must be 0 (inactive) or 1 (active)", "INVALID_STATUS");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for updating beneficiary status. Provide rsaPublicKey in config or request.",
        "RSA_KEY_REQUIRED"
      );
    }

    try {
      const requestTime = request.requestTime ?? getABATimestamp();
      const authPayloadObj = {
        mc_id: this.config.merchantId,
        payee: request.payee.trim(),
        status: request.status,
      };

      let merchantAuth: string;
      try {
        merchantAuth = encryptRsaChunks(JSON.stringify(authPayloadObj), rsaPublicKey);
      } catch (err) {
        return failure(
          err instanceof Error ? err.message : "RSA encryption failed",
          "RSA_ENCRYPTION_FAILED"
        );
      }

      const b4hash = requestTime + merchantAuth;
      const hash = await hmacSha512Base64(b4hash, this.config.apiKey);

      const endpoint = `${this.config.baseUrl}/api/merchant-portal/merchant-access/whitelist-account/update-whitelist-status`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_time: requestTime,
          merchant_id: this.config.merchantId,
          merchant_auth: merchantAuth,
          hash,
        }),
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) {
        return failure(parsed.error);
      }

      const raw = parsed.data ?? {};
      const statusObj = raw.status ?? {};
      const statusCode = statusObj.code !== undefined ? String(statusObj.code) : undefined;
      const statusMessage = statusObj.message;

      const isSuccess = statusCode === "00" || statusCode === "0";
      if (!isSuccess) {
        return failure(
          statusMessage || `Failed to update beneficiary status (code: ${statusCode})`,
          statusCode
        );
      }

      return {
        success: true,
        status: {
          code: statusCode,
          message: statusMessage,
        },
        data: raw.data,
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }

  /**
   * Execute a payout splitting/distribution to whitelisted beneficiaries.
   *
   * @param request Transaction ID, amount, currency, beneficiaries (max 10), and optional custom fields
   * @returns CreatePayoutResponse
   */
  async createPayout(request: CreatePayoutRequest): Promise<CreatePayoutResponse> {
    const failure = (error: string, code?: string): CreatePayoutResponse => ({
      success: false,
      error,
      code,
    });

    if (!request.transactionId || !request.transactionId.trim()) {
      return failure("Transaction ID is required for payout", "TRANSACTION_ID_REQUIRED");
    }

    if (
      typeof request.amount !== "number" ||
      !Number.isFinite(request.amount) ||
      request.amount <= 0
    ) {
      return failure("Amount must be greater than 0 for payout", "INVALID_AMOUNT");
    }

    if (request.currency !== "USD" && request.currency !== "KHR") {
      return failure("Currency must be USD or KHR", "INVALID_CURRENCY");
    }

    if (
      !Array.isArray(request.beneficiaries) ||
      request.beneficiaries.length === 0 ||
      request.beneficiaries.length > 10
    ) {
      return failure("Beneficiaries must be an array of 1 to 10 items", "INVALID_BENEFICIARIES");
    }

    const rsaPublicKey = request.rsaPublicKey ?? this.config.rsaPublicKey;
    if (!rsaPublicKey || !rsaPublicKey.trim()) {
      return failure(
        "RSA public key is required for payout. Provide rsaPublicKey in config or request.",
        "RSA_KEY_REQUIRED"
      );
    }

    try {
      let encryptedBeneficiaries: string;
      try {
        encryptedBeneficiaries = encryptRsaChunks(
          JSON.stringify(request.beneficiaries),
          rsaPublicKey
        );
      } catch (err) {
        return failure(
          err instanceof Error ? err.message : "RSA encryption failed",
          "RSA_ENCRYPTION_FAILED"
        );
      }

      let customFieldsStr: string | undefined;
      if (request.customFields !== undefined && request.customFields !== null) {
        customFieldsStr =
          typeof request.customFields === "string"
            ? request.customFields
            : JSON.stringify(request.customFields);
      }

      const b4Hash =
        this.config.merchantId +
        request.transactionId.trim() +
        encryptedBeneficiaries +
        String(request.amount) +
        (customFieldsStr ?? "") +
        request.currency;

      const hash = await hmacSha512Hex(b4Hash, this.config.apiKey);

      const payload: Record<string, any> = {
        merchant_id: this.config.merchantId,
        tran_id: request.transactionId.trim(),
        beneficiaries: encryptedBeneficiaries,
        amount: request.amount,
        currency: request.currency,
        hash,
      };

      if (customFieldsStr !== undefined) {
        payload.custom_fields = customFieldsStr;
      }

      const endpoint = `${this.config.baseUrl}/api/payment-gateway/v2/direct-payment/merchant/payout`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const parsed = await parseAbaJson(response);
      if (parsed.error) {
        return failure(parsed.error);
      }

      const raw = parsed.data ?? {};
      const statusObj = raw.status ?? {};
      const statusCode = statusObj.code !== undefined ? String(statusObj.code) : undefined;
      const statusMessage = statusObj.message;

      const isSuccess = statusCode === "00" || statusCode === "0";
      if (!isSuccess) {
        return failure(
          statusMessage || `Payout failed (code: ${statusCode})`,
          statusCode
        );
      }

      return {
        success: true,
        transaction_id: raw.transaction_id,
        transaction_date: raw.transaction_date,
        external_reference: raw.external_reference,
        apv: raw.apv,
        transaction_amount: raw.transaction_amount,
        transaction_currency: raw.transaction_currency,
        beneficiaries: raw.beneficiaries,
        status: {
          code: statusCode,
          message: statusMessage,
          tran_id: statusObj.tran_id,
          trace_id: statusObj.trace_id,
        },
      };
    } catch (err) {
      return failure(err instanceof Error ? err.message : "Unknown error");
    }
  }
}

/**
 * ABA signs pushback differently from API requests. A request hash uses a
 * fixed, documented field order (see `hash.ts`); a pushback hash instead
 * sorts the body's keys ascending and concatenates their **values** — no
 * keys, no separator — which is PHP's `ksort()` then `$b4hash .= $value`.
 *
 * Sorting the whole body rather than a fixed list means a field ABA adds
 * later is included automatically, so never narrow this to the known five
 * (`tran_id`, `apv`, `status`, `return_params`, `merchant_ref`).
 */
function buildPushbackHashBase(body: Record<string, unknown>): string {
  // Default sort is by UTF-16 code unit, which matches PHP's byte-wise
  // string comparison for ABA's ASCII field names.
  return Object.keys(body)
    .sort()
    .map((key) => stringifyPushbackValue(body[key]))
    .join("");
}

/**
 * ABA's reference implementation is PHP string concatenation, so values are
 * coerced the way PHP would: a missing value contributes nothing, and only a
 * nested array or object is JSON-encoded first.
 *
 * Every documented pushback field is a string — `return_params` arrives
 * already JSON-encoded as a string — so the object branch is defensive. Note
 * that PHP's `json_encode` escapes `/` as `\/` while `JSON.stringify` does
 * not, so a nested object ABA adds later could disagree here.
 */
function stringifyPushbackValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  // PHP casts true to "1" and false to the empty string.
  if (typeof value === "boolean") return value ? "1" : "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "CANCELLED";
  if (normalized === "PENDING") return "PENDING";
  return "ERROR";
}
