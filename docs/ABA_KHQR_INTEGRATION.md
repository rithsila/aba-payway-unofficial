# ABA KHQR Integration Guide

**Last Updated:** 2026-01-20  
**Status:** Implemented (Sandbox)

## Overview

This document describes the ABA PayWay KHQR integration for local Cambodian payments. KHQR (Khmer QR) is Cambodia's national QR payment standard supported by all major banks.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Frontend        │────▶│ create-khqr          │────▶│ ABA PayWay API  │
│ (Next.js)       │     │ (Edge Function)      │     │ (Sandbox)       │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
        │                         │
        │                         ▼
        │               ┌──────────────────────┐
        │               │ Supabase Database    │
        │               │ (orders table)       │
        │               └──────────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐     ┌──────────────────────┐
│ check-khqr-     │────▶│ webhook-aba          │
│ status (polling)│     │ (payment callback)   │
└─────────────────┘     └──────────────────────┘
```

## API Endpoints

### 1. Create KHQR Payment

**Endpoint:** `POST /functions/v1/create-khqr`

**Request:**
```json
{
  "plan_type": "MONTHLY",
  "currency": "USD",
  "customer_email": "customer@example.com",
  "customer_phone": "012345678",
  "customer_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_id": "EAXXXXXXXXXX",
  "checkout_url": "https://checkout-sandbox.payway.com.kh/checkout/...",
  "abapay_deeplink": "abapay://...",
  "qr_code": "data:image/svg+xml;base64,...",
  "amount": 15.00,
  "currency": "USD",
  "plan_type": "MONTHLY",
  "expires_at": "2026-01-20T12:15:00.000Z",
  "uses_fallback": false
}
```

**Plan Types:**
| Plan | USD | KHR |
|------|-----|-----|
| MONTHLY | $15 | ៛61,500 |
| YEARLY | $99 | ៛405,900 |
| LIFETIME | $299 | ៛1,225,900 |
| MULTI_MONTHLY | $35 | ៛143,500 |
| MULTI_YEARLY | $199 | ៛815,900 |
| MULTI_LIFETIME | $499 | ៛2,045,900 |

### 2. Check Payment Status

**Endpoint:** `POST /functions/v1/check-khqr-status`

**Request:**
```json
{
  "transaction_id": "EAXXXXXXXXXX"
}
```

**Response (Pending):**
```json
{
  "success": true,
  "transaction_id": "EAXXXXXXXXXX",
  "status": "PENDING",
  "message": "Waiting for payment confirmation..."
}
```

**Response (Paid):**
```json
{
  "success": true,
  "transaction_id": "EAXXXXXXXXXX",
  "status": "PAID",
  "license_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "plan_type": "MONTHLY",
  "expires_at": "2026-02-20T00:00:00.000Z",
  "message": "Payment completed successfully!"
}
```

**Status Values:**
- `PENDING` - Waiting for payment
- `PAID` - Payment successful, license created
- `EXPIRED` - QR code expired (15 minutes)
- `FAILED` - Payment declined
- `NOT_FOUND` - Transaction not found

### 3. Webhook Handler

**Endpoint:** `POST /functions/v1/webhook-aba`

ABA PayWay sends payment notifications to this endpoint. The webhook:
1. Verifies the signature using HMAC-SHA512
2. Finds the pending order
3. Creates a license on payment success
4. Updates order status

## Environment Variables

Required secrets in Supabase:

```bash
# Set via: supabase secrets set KEY=VALUE

ABA_PAYWAY_MERCHANT_ID=YOUR_ABA_PAYWAY_MERCHANT_ID
ABA_PAYWAY_API_KEY=YOUR_ABA_PAYWAY_API_KEY
ABA_PAYWAY_WEBHOOK_SECRET=YOUR_ABA_PAYWAY_WEBHOOK_SECRET
ABA_PAYWAY_BASE_URL=https://checkout-sandbox.payway.com.kh
NEXT_PUBLIC_SITE_URL=https://easafetyscore.com
```

## Frontend Integration

### Payment Flow

```typescript
// 1. Create KHQR payment
const response = await fetch('/api/create-khqr', {
  method: 'POST',
  body: JSON.stringify({
    plan_type: 'MONTHLY',
    currency: 'USD',
    customer_email: user.email,
  }),
});
const { transaction_id, qr_code, checkout_url, expires_at } = await response.json();

// 2. Show QR code or redirect to checkout
if (checkout_url) {
  // Redirect to ABA checkout page
  window.location.href = checkout_url;
} else {
  // Show QR code for scanning
  showQRCode(qr_code, expires_at);
  startPolling(transaction_id);
}

// 3. Poll for payment status
async function pollStatus(transactionId: string) {
  const interval = setInterval(async () => {
    const res = await fetch('/api/check-khqr-status', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId }),
    });
    const status = await res.json();
    
    if (status.status === 'PAID') {
      clearInterval(interval);
      showSuccess(status.license_key);
    } else if (status.status === 'EXPIRED' || status.status === 'FAILED') {
      clearInterval(interval);
      showError(status.error);
    }
  }, 5000); // Poll every 5 seconds
}
```

### QR Code Display Component

```tsx
function KHQRPayment({ transactionId, qrCode, expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiresAt));
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    // Update countdown
    const timer = setInterval(() => {
      const left = calculateTimeLeft(expiresAt);
      setTimeLeft(left);
      if (left <= 0) setStatus('EXPIRED');
    }, 1000);

    // Poll for payment status
    const poller = setInterval(async () => {
      const res = await checkStatus(transactionId);
      if (res.status !== 'PENDING') {
        setStatus(res.status);
        clearInterval(poller);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, [transactionId, expiresAt]);

  return (
    <div className="khqr-payment">
      <img src={qrCode} alt="KHQR Code" />
      <p>Scan with ABA Mobile or any KHQR-supported app</p>
      <p>Time remaining: {formatTime(timeLeft)}</p>
      {status === 'PAID' && <SuccessMessage />}
      {status === 'EXPIRED' && <ExpiredMessage onRetry={regenerate} />}
    </div>
  );
}
```

## Testing

### Sandbox Testing

1. Use the sandbox URL: `https://checkout-sandbox.payway.com.kh`
2. Test credentials are pre-configured
3. No real payments are processed

### Test Commands

```bash
# Create KHQR payment
curl -X POST "https://oaijcqvwehvbdvzzmeie.supabase.co/functions/v1/create-khqr" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_type": "MONTHLY",
    "currency": "USD",
    "customer_email": "test@example.com"
  }'

# Check payment status
curl -X POST "https://oaijcqvwehvbdvzzmeie.supabase.co/functions/v1/check-khqr-status" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "EAXXXXXXXXXX"}'
```

## Technical Details

### Hash Generation Logic
The ABA PayWay API requires an HMAC-SHA512 hash generated from a concatenation of **all parameters** in a specific order, signed with the Public Key (API Key).

**Format:**
```
Hash = Base64( HMAC_SHA512( API_KEY, StringToSign ) )
```

**StringToSign Order:**
1. `req_time`
2. `merchant_id`
3. `tran_id`
4. `amount`
5. `items` (Base64 encoded JSON string)
6. `shipping`
7. `ctid`
8. `pwt`
9. `firstname`
10. `lastname`
11. `email`
12. `phone`
13. `type`
14. `payment_option`
15. `return_url`
16. `cancel_url`
17. `continue_success_url`
18. `return_deeplink`
19. `currency`
20. `custom_fields`
21. `return_params`

**Important Notes:**
- All parameters must be included. If a parameter is empty/optional, use an empty string `""`.
- `items` must be a Base64 encoded JSON string of the items array.
- Current Timestamp (`req_time`) must be `YYYYMMDDHHmmss`.

### Status Codes
The API returns status codes that indicate the result of the request:
- **`0`**: Success
- **`"00"`**: Success (returned by some endpoints like `Purchase`)
- **Non-zero**: Error (e.g., `1` = Wrong Hash, `11` = Invalid Merchant)

### Production Checklist

- [ ] Obtain production credentials from ABA Bank
- [ ] Update `ABA_PAYWAY_BASE_URL` to `https://checkout.payway.com.kh`
- [ ] Update `ABA_PAYWAY_MERCHANT_ID` with production merchant ID
- [ ] Update `ABA_PAYWAY_API_KEY` with production API key
- [ ] Configure webhook URL in ABA merchant dashboard
- [ ] Test with real payments (small amounts)
- [ ] Set up monitoring for failed payments

## Troubleshooting

### Common Issues

1. **"uses_fallback": true in response**
   - **Cause:** The ABA API call failed (e.g., Wrong Hash, Connection Error).
   - **Resolution:** Check Supabase logs. The API is designed to return a valid Deep Link and QR string.
   - **Debugging:** Ensure `items` are Base64 encoded and the Hash string includes ALL parameters including empty ones.

2. **Error: "Wrong Hash" (Code 1)**
   - **Cause:** The generated hash does not match what ABA expects.
   - **Resolution:** Verify the `StringToSign` order matches the list above EXACTLY. Ensure the API Key is correct.

3. **Status always "PENDING"**
   - **Cause:** Webhook not firing or Polling logic incorrect.
   - **Resolution:** Use the `check-khqr-status` endpoint manually to verify.

## Security Notes

1. **API Key**: The public key is used for HMAC hash generation.
2. **Webhook Verification**: All webhooks are verified using HMAC-SHA512 with the Webhook Secret.
3. **Transaction IDs**: Generated server-side with timestamp + random to ensure uniqueness.
4. **HTTPS Only**: All API calls use TLS 1.2+.
