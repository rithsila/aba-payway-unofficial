import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ABAPayWay } from "../src/client";
import { generateABAHash } from "../src/hash";

const TEST_CONFIG = {
  merchantId: "TEST_MERCHANT",
  apiKey: "TEST_API_KEY",
  baseUrl: "https://checkout-sandbox.payway.com.kh",
} as const;

describe("ABAPayWay", () => {
  let aba: ABAPayWay;
  beforeEach(() => { aba = new ABAPayWay(TEST_CONFIG); });

  describe("constructor", () => {
    it("stores config immutably", () => {
      expect(aba.config.merchantId).toBe("TEST_MERCHANT");
    });
    it("throws if merchantId is missing", () => {
      expect(() => new ABAPayWay({ merchantId: "", apiKey: "key", baseUrl: "https://example.com" })).toThrow("merchantId is required");
    });
    it("throws if apiKey is missing", () => {
      expect(() => new ABAPayWay({ merchantId: "id", apiKey: "", baseUrl: "https://example.com" })).toThrow("apiKey is required");
    });
    it("throws if baseUrl is missing", () => {
      expect(() => new ABAPayWay({ merchantId: "id", apiKey: "key", baseUrl: "" })).toThrow("baseUrl is required");
    });
    // ABA's credential sheet lists the full purchase URL under "API Url",
    // so accept that verbatim and keep only the origin.
    it("reduces a full API URL to its origin", () => {
      const client = new ABAPayWay({
        merchantId: "id", apiKey: "key",
        baseUrl: "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase",
      });
      expect(client.config.baseUrl).toBe("https://checkout-sandbox.payway.com.kh");
    });
    it("strips a trailing slash from a base URL", () => {
      const client = new ABAPayWay({
        merchantId: "id", apiKey: "key", baseUrl: "https://checkout-sandbox.payway.com.kh/",
      });
      expect(client.config.baseUrl).toBe("https://checkout-sandbox.payway.com.kh");
    });
  });

  describe("createPurchase", () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      // Mirrors the live v3 sandbox reply: nested status envelope with the
      // string code "00", and a camelCase qrString/qrImage.
      const payload = {
        qrString: "00020101021229370016KHQR-MOCK-DATA",
        qrImage: "data:image/png;base64,iVBORw0KGgo=",
        abapay_deeplink: "abamobilebank://plugin?data=abc123",
        app_store: "https://itunes.apple.com/al/app/aba-mobile-bank/id968860649?mt=8",
        play_store: "https://play.google.com/store/apps/details?id=com.paygo24.ibank",
        checkout_url: "https://checkout-sandbox.payway.com.kh/checkout/abc123",
        description: "success",
        status: { version: "v3", code: "00", message: "Success!", tran_id: "EA001" },
      };
      fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(payload)),
        json: () => Promise.resolve(payload),
      });
      vi.stubGlobal("fetch", fetchSpy);
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it("calls the purchase endpoint", async () => {
      const result = await aba.createPurchase({
        transactionId: "EA001", amount: 15.0, currency: "USD",
        items: "Monthly Plan", firstName: "John", lastName: "Doe",
        email: "john@test.com", phone: "012345678",
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0][0]).toContain("/api/payment-gateway/v1/payments/purchase");
      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toContain("checkout");
    });

    // v3 renames qr_string to qrString and adds a ready-to-render PNG.
    it("reads the v3 qrString and qrImage fields", async () => {
      const result = await aba.createPurchase({
        transactionId: "EA001", amount: 15.0, currency: "USD", paymentOption: "abapay_khqr",
      });
      expect(result.qrString).toBe("00020101021229370016KHQR-MOCK-DATA");
      expect(result.qrImage).toBe("data:image/png;base64,iVBORw0KGgo=");
    });

    it("still reads the legacy qr_string field", async () => {
      const legacy = { status: 0, description: "Success", qr_string: "LEGACY-QR" };
      fetchSpy.mockResolvedValueOnce({
        ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(legacy)),
      });
      const result = await aba.createPurchase({ transactionId: "EA009", amount: 1.0, currency: "USD" });
      expect(result.success).toBe(true);
      expect(result.qrString).toBe("LEGACY-QR");
    });

    // A wrong hash is HTTP 403 with the reason in a JSON envelope. Dumping the
    // raw body lost the code, so callers could not tell "Wrong Hash." from an
    // expired key.
    it("reports the ABA code and message from a 403 rejection", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false, status: 403,
        text: () => Promise.resolve(JSON.stringify({ status: { code: 1, message: "Wrong Hash." } })),
      });
      const result = await aba.createPurchase({ transactionId: "EA005", amount: 1.0, currency: "USD" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Wrong Hash.");
      expect(result.errorCode).toBe("1");
    });

    it("reports an expired API key as code 21", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false, status: 403,
        text: () => Promise.resolve(JSON.stringify({ status: { code: 21, message: "End of API lifetime" } })),
      });
      const result = await aba.createPurchase({ transactionId: "EA006", amount: 1.0, currency: "USD" });
      expect(result.errorCode).toBe("21");
    });

    // ABA only returns qr_string / abapay_deeplink when payment_option asks
    // for KHQR, and it expects items as base64 JSON.
    it("sends payment_option and base64-encoded items", async () => {
      const items = [{ name: "Milk Tea", quantity: 2, price: 2.5 }];
      await aba.createPurchase({
        transactionId: "EA003", amount: 5.0, currency: "USD",
        items, paymentOption: "abapay_khqr",
      });
      const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
      expect(body.get("payment_option")).toBe("abapay_khqr");
      expect(JSON.parse(atob(body.get("items")!))).toEqual(items);
    });

    // A merchant profile with the QR Payment API service enabled answers every
    // purchase with KHQR JSON and ignores payment_option, so "cards" never
    // reaches a card form. payment_gate=0 routes to the Checkout service,
    // which answers 302 to the hosted page instead.
    describe("hosted checkout (payment_gate)", () => {
      const redirect = (location: string | null, status = 302) => ({
        ok: false,
        status,
        headers: { get: (name: string) => (name.toLowerCase() === "location" ? location : null) },
        text: () => Promise.resolve(""),
      });

      it("sends payment_gate and view_type in the body", async () => {
        await aba.createPurchase({
          transactionId: "EA010", amount: 1.0, currency: "USD",
          paymentOption: "cards", paymentGate: 0, viewType: "hosted_view",
        });
        const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
        expect(body.get("payment_gate")).toBe("0");
        expect(body.get("view_type")).toBe("hosted_view");
      });

      // ABA hashes neither field. Including one would change the signature it
      // rebuilds and every request would come back "Wrong Hash."
      it("leaves payment_gate and view_type out of the hash", async () => {
        await aba.createPurchase({
          transactionId: "EA011", amount: 1.0, currency: "USD",
          paymentOption: "cards", paymentGate: 0, viewType: "hosted_view",
        });
        const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
        const expected = await generateABAHash(
          {
            req_time: body.get("req_time")!,
            merchant_id: "TEST_MERCHANT",
            tran_id: "EA011",
            amount: "1.00",
            payment_option: "cards",
            currency: "USD",
          },
          "TEST_API_KEY",
        );
        expect(body.get("hash")).toBe(expected);
      });

      // Omitted rather than sent empty: ABA rejects fields it did not expect.
      it("omits both fields when they are not set", async () => {
        await aba.createPurchase({ transactionId: "EA012", amount: 1.0, currency: "USD" });
        const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
        expect(body.has("payment_gate")).toBe(false);
        expect(body.has("view_type")).toBe(false);
      });

      it("returns the redirect target as checkoutUrl", async () => {
        const page = "https://checkout-sandbox.payway.com.kh/checkout/eyJ0b2tlbiI6IngifQ%3D%3D";
        fetchSpy.mockResolvedValueOnce(redirect(page));
        const result = await aba.createPurchase({
          transactionId: "EA013", amount: 1.0, currency: "USD",
          paymentOption: "cards", paymentGate: 0,
        });
        expect(result.success).toBe(true);
        expect(result.checkoutUrl).toBe(page);
      });

      it("resolves a relative Location against the base URL", async () => {
        fetchSpy.mockResolvedValueOnce(redirect("/checkout/abc123"));
        const result = await aba.createPurchase({
          transactionId: "EA014", amount: 1.0, currency: "USD", paymentGate: 0,
        });
        expect(result.checkoutUrl).toBe("https://checkout-sandbox.payway.com.kh/checkout/abc123");
      });

      // Stopping at the redirect means the body is empty, so a missing
      // Location leaves nothing to act on — say so rather than report success.
      it("fails when a redirect carries no Location header", async () => {
        fetchSpy.mockResolvedValueOnce(redirect(null));
        const result = await aba.createPurchase({
          transactionId: "EA015", amount: 1.0, currency: "USD", paymentGate: 0,
        });
        expect(result.success).toBe(false);
        expect(result.error).toContain("without a Location header");
      });

      it("does not follow the redirect itself", async () => {
        fetchSpy.mockResolvedValueOnce(redirect("/checkout/abc123"));
        await aba.createPurchase({
          transactionId: "EA016", amount: 1.0, currency: "USD", paymentGate: 0,
        });
        expect(fetchSpy.mock.calls[0][1].redirect).toBe("manual");
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
    });

    // The deeplink flow is what a mobile/mini-app checkout uses: ABA answers
    // with a link that opens ABA Mobile straight on this payment, plus store
    // links to fall back to when the app is not installed.
    it("reads abapayDeeplink and the store links from the deeplink flow", async () => {
      const result = await aba.createPurchase({
        transactionId: "EA010", amount: 4.5, currency: "USD",
        paymentOption: "abapay_khqr_deeplink",
      });
      expect(result.abapayDeeplink).toBe("abamobilebank://plugin?data=abc123");
      expect(result.appStoreUrl).toContain("itunes.apple.com");
      expect(result.playStoreUrl).toContain("play.google.com");
      const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
      expect(body.get("payment_option")).toBe("abapay_khqr_deeplink");
    });

    // ABA wants return_deeplink as base64 JSON. Sending the raw object (or a
    // caller's hand-rolled string) breaks the return trip out of ABA Mobile.
    it("base64-encodes an object returnDeeplink", async () => {
      const schemes = { ios_scheme: "myapp://paid", android_scheme: "myapp://paid" };
      await aba.createPurchase({
        transactionId: "EA011", amount: 4.5, currency: "USD",
        paymentOption: "abapay_khqr_deeplink", returnDeeplink: schemes,
      });
      const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
      expect(JSON.parse(atob(body.get("return_deeplink")!))).toEqual(schemes);
    });

    // The hash is built from the same encoded string the body carries. If the
    // two ever diverge ABA answers "Wrong Hash." and the purchase dies.
    it("hashes the same encoded return_deeplink it sends", async () => {
      const encoded = { ios_scheme: "myapp://paid" };
      await aba.createPurchase({
        transactionId: "EA012", amount: 1.0, currency: "USD", returnDeeplink: encoded,
      });
      const body = new URLSearchParams(fetchSpy.mock.calls[0][1].body as string);
      const sent = body.get("return_deeplink")!;

      // Rebuild the signature from the body's own value; it must match.
      const expected = await generateABAHash(
        {
          req_time: body.get("req_time")!,
          merchant_id: TEST_CONFIG.merchantId,
          tran_id: "EA012",
          amount: "1.00",
          items: "", shipping: "", ctid: "", pwt: "",
          firstname: "", lastname: "", email: "", phone: "", type: "",
          payment_option: "", return_url: "", cancel_url: "",
          continue_success_url: "",
          return_deeplink: sent,
          currency: "USD", custom_fields: "", return_params: "",
        },
        TEST_CONFIG.apiKey,
      );
      expect(body.get("hash")).toBe(expected);
    });

    // Bad credentials get an HTML error page back, not JSON. Parsing that
    // blindly produced "Unexpected token '<'", which hides the real cause.
    it("explains a non-JSON reply instead of leaking a parse error", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true, status: 200,
        text: () => Promise.resolve("<!DOCTYPE html><html><body>Forbidden</body></html>"),
      });
      const result = await aba.createPurchase({ transactionId: "EA004", amount: 1.0, currency: "USD" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("non-JSON");
      expect(result.error).toContain("merchant ID or API key");
    });

    it("returns error when API fails", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false, status: 500, text: () => Promise.resolve("Server error"),
      });
      const result = await aba.createPurchase({ transactionId: "EA002", amount: 15.0, currency: "USD" });
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("checkStatus", () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    beforeEach(() => {
      const payload = {
        data: {
          payment_status_code: 0,
          total_amount: 15.0,
          payment_currency: "USD",
          payment_status: "APPROVED",
          transaction_date: "2026-08-31 14:25:57",
        },
        status: { code: "00", message: "Success!", tran_id: "EA001" },
      };
      fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(payload)),
        json: () => Promise.resolve(payload),
      });
      vi.stubGlobal("fetch", fetchSpy);
    });
    afterEach(() => { vi.restoreAllMocks(); });

    it("calls check-transaction endpoint", async () => {
      const result = await aba.checkStatus("EA001");
      expect(fetchSpy.mock.calls[0][0]).toContain("/api/payment-gateway/v1/payments/check-transaction-2");
      expect(result.success).toBe(true);
      expect(result.status).toBe("APPROVED");
    });

    // v3 nests the detail under `data` and renames the money fields.
    it("reads amount, currency and time from the nested v3 detail", async () => {
      const result = await aba.checkStatus("EA001");
      expect(result.amount).toBe(15.0);
      expect(result.currency).toBe("USD");
      expect(result.paymentTime).toBe("2026-08-31 14:25:57");
    });

    it("reports PENDING for an unpaid transaction", async () => {
      const payload = {
        data: { payment_status: "PENDING", total_amount: 1.0, payment_currency: "" },
        status: { code: "00", message: "Success!" },
      };
      fetchSpy.mockResolvedValueOnce({
        ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(payload)),
      });
      const result = await aba.checkStatus("EA007");
      expect(result.status).toBe("PENDING");
      // payment_currency stays empty until the payment settles.
      expect(result.currency).toBeUndefined();
    });

    // An unknown tran_id comes back HTTP 200 with code 6, not an HTTP error.
    it("reports an unknown transaction as code 6", async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true, status: 200,
        text: () => Promise.resolve(JSON.stringify({ status: { code: 6, message: "tran_id not found" } })),
      });
      const result = await aba.checkStatus("NOPE");
      expect(result.success).toBe(false);
      expect(result.status).toBe("ERROR");
      expect(result.errorCode).toBe("6");
      expect(result.error).toBe("tran_id not found");
    });

    it("still reads the legacy flat status shape", async () => {
      const legacy = { status: 0, description: "APPROVED", payment_status: "APPROVED", amount: "15.00" };
      fetchSpy.mockResolvedValueOnce({
        ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(legacy)),
      });
      const result = await aba.checkStatus("EA008");
      expect(result.success).toBe(true);
      expect(result.status).toBe("APPROVED");
      expect(result.amount).toBe(15.0);
    });
  });

  // ABA signs pushback by sorting the JSON body's keys ascending and
  // concatenating their VALUES (no keys, no separator), then base64 of an
  // HMAC-SHA512 over that. It is NOT a hash of the raw body — signing the
  // raw string rejects every genuine callback.
  describe("verifyWebhook", () => {
    const SECRET = "test_secret";

    // ABA's documented pushback shape.
    const PUSHBACK = {
      tran_id: "EA001",
      apv: "123456",
      status: "0",
      return_params: '{"order_id":"42"}',
      merchant_ref: "",
    } as const;

    /**
     * Independent implementation of ABA's scheme via node:crypto, so the test
     * checks the SDK against the spec rather than against its own helper.
     * (The SDK itself must never import node:crypto — it targets edge
     * runtimes — but a test running only on Node may.)
     */
    async function abaSign(body: Record<string, unknown>, secret: string): Promise<string> {
      const { createHmac } = await import("node:crypto");
      const base = Object.keys(body)
        .sort()
        .map((k) => String(body[k] ?? ""))
        .join("");
      return createHmac("sha512", secret).update(base).digest("base64");
    }

    it("accepts a genuine ABA pushback signature", async () => {
      const signature = await abaSign(PUSHBACK, SECRET);
      expect(await aba.verifyWebhook(JSON.stringify(PUSHBACK), signature, SECRET)).toBe(true);
    });

    // The signature is rebuilt from parsed values, not raw bytes, so a body
    // that arrives already parsed (Express, Hono, Next) verifies identically.
    it("accepts an already-parsed body object", async () => {
      const signature = await abaSign(PUSHBACK, SECRET);
      expect(await aba.verifyWebhook({ ...PUSHBACK }, signature, SECRET)).toBe(true);
    });

    // Same reason: key order in the transmitted JSON is irrelevant because
    // the keys get sorted before hashing.
    it("ignores the key order of the incoming JSON", async () => {
      const signature = await abaSign(PUSHBACK, SECRET);
      const reordered = JSON.stringify({
        status: PUSHBACK.status,
        tran_id: PUSHBACK.tran_id,
        merchant_ref: PUSHBACK.merchant_ref,
        apv: PUSHBACK.apv,
        return_params: PUSHBACK.return_params,
      });
      expect(await aba.verifyWebhook(reordered, signature, SECRET)).toBe(true);
    });

    // The bug this replaced: hashing the raw payload string.
    it("rejects a signature computed over the raw body string", async () => {
      const raw = JSON.stringify(PUSHBACK);
      const { createHmac } = await import("node:crypto");
      const rawSig = createHmac("sha512", SECRET).update(raw).digest("base64");
      expect(await aba.verifyWebhook(raw, rawSig, SECRET)).toBe(false);
    });

    it("rejects a tampered amount", async () => {
      const signature = await abaSign(PUSHBACK, SECRET);
      const tampered = { ...PUSHBACK, return_params: '{"order_id":"99"}' };
      expect(await aba.verifyWebhook(JSON.stringify(tampered), signature, SECRET)).toBe(false);
    });

    it("rejects a signature made with a different secret", async () => {
      const signature = await abaSign(PUSHBACK, "other_secret");
      expect(await aba.verifyWebhook(JSON.stringify(PUSHBACK), signature, SECRET)).toBe(false);
    });

    // A new field must change the signature, since the whole body is sorted
    // and hashed rather than a fixed field list.
    it("includes fields ABA adds beyond the documented five", async () => {
      const extended = { ...PUSHBACK, new_field_from_aba: "x" };
      const signature = await abaSign(extended, SECRET);
      expect(await aba.verifyWebhook(JSON.stringify(extended), signature, SECRET)).toBe(true);
      // ...and the same signature must not verify without that field.
      expect(await aba.verifyWebhook(JSON.stringify(PUSHBACK), signature, SECRET)).toBe(false);
    });

    // ABA signs with the merchant API key; there is no separate secret.
    it("falls back to the configured apiKey when no secret is passed", async () => {
      const signature = await abaSign(PUSHBACK, TEST_CONFIG.apiKey);
      expect(await aba.verifyWebhook(JSON.stringify(PUSHBACK), signature)).toBe(true);
    });

    it("prefers a configured webhookSecret over the apiKey", async () => {
      const client = new ABAPayWay({ ...TEST_CONFIG, webhookSecret: "hook_secret" });
      const signature = await abaSign(PUSHBACK, "hook_secret");
      expect(await client.verifyWebhook(JSON.stringify(PUSHBACK), signature)).toBe(true);
    });

    it("returns false rather than throwing on a malformed body", async () => {
      expect(await aba.verifyWebhook("not json at all", "sig", SECRET)).toBe(false);
      expect(await aba.verifyWebhook("[1,2,3]", "sig", SECRET)).toBe(false);
      expect(await aba.verifyWebhook("null", "sig", SECRET)).toBe(false);
    });

    it("returns false for an empty signature", async () => {
      expect(await aba.verifyWebhook(JSON.stringify(PUSHBACK), "", SECRET)).toBe(false);
    });

    it("returns false for an invalid signature", async () => {
      expect(await aba.verifyWebhook('{"event":"test"}', "invalid", "secret")).toBe(false);
    });
  });
});
