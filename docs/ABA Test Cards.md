You cannot use real card information in the ABA PayWay sandbox environment. Instead, use any of the following test card numbers and respective Expiry and CV2/CVV to test a payment transaction.

| **Card Status** | **Card Type** | **Card Number**     | **Exp** | **CVV** | **3DS Enrolled** |
| :-------------- | :------------ | :------------------ | :------ | :------ | :--------------- |
| **Success**     | Master Card   | 5156 8399 3770 6777 | 01/30   | 993     | No               |
| **Success**     | Visa Card     | 4286 0900 0000 0206 | 04/30   | 777     | Yes              |
| **Declined**    | Master Card   | 5156 8302 7256 1029 | 04/30   | 777     | Yes              |
| **Declined**    | Visa Card     | 4156 8399 3770 6777 | 01/30   | 993     | No               |

A Note on 3D Secured Test Card numbers OTP pin for verifying 3D secure will be sent to your registered email address. Please reach out to your point of contact to assist you in testing with ABA PAY.

---

## How to reach a card form in the sandbox

Notes added while wiring these cards into this SDK — the table above is
useless until you can get ABA to render a card form at all.

`payment_option: "cards"` **is not enough.** A merchant profile with the QR
Payment API service enabled (this one) answers every purchase with KHQR JSON
and ignores `payment_option` entirely. Send **`payment_gate: 0`** to route the
request to the Checkout service instead; ABA then replies `302` to a hosted
payment page that accepts the cards above.

```bash
npm run pay:sandbox          # creates a $1 card purchase, opens it, polls to APPROVED
```

Why this matters: a sandbox KHQR code cannot be scanned by the real ABA Mobile
app, so `abapay_khqr` transactions stay `PENDING` forever. The hosted card
checkout is the only sandbox flow a human can actually complete, which makes
it the only way to exercise `APPROVED`, `DECLINED`, and the pushback callback.

Start with the **Mastercard success** card — it is the only one not enrolled in
3DS, so it needs no OTP. The 3DS cards mail their OTP to the email registered
on the ABA account that owns the sandbox profile.

The hosted page's token expires 180 seconds after creation (`expire_in_sec` in
the URL payload), so create the purchase and pay promptly. The transaction
itself stays open far longer — re-run the script for a fresh page.
