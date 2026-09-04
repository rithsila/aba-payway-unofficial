# Testing Guide (See It Work Yourself)

This guide is for anyone with no coding background. You will run a few
commands and look at what appears. Each step tells you exactly what
"it worked" looks like, and what "something is wrong" looks like.

There are 6 steps. Do them in order. Step 0 starts from a completely
empty machine — skip it if the project already runs.

---

## Step 0: Set up from scratch

Everything here happens in a terminal. On a Mac, open **Terminal** from
Applications → Utilities. On Windows, use **PowerShell**.

### 0.1 — Install Node.js

The project needs Node **18 or newer**. Check what you have:

```bash
node --version
```

If that prints `v18.x.x` or higher, you're set. If it says "command not
found" or prints a lower number, install the current LTS from
[nodejs.org](https://nodejs.org/) — take the default options — then close
and reopen the terminal and check again.

### 0.2 — Get the project

If you don't already have the folder:

```bash
git clone https://github.com/rithsila/aba-payway-unofficial.git
cd aba-payway-unofficial
```

If you do have it, just move into it:

```bash
cd path/to/aba-payway-sdk-unofficial
```

Confirm you're in the right place — this should list `package.json`:

```bash
ls
```

### 0.3 — Install the dependencies

```bash
npm install
```

Wait for it to finish. Warnings are fine; errors are not.

### 0.4 — Get sandbox credentials

Register at the [ABA sandbox
portal](https://sandbox.payway.com.kh/register-sandbox/). ABA emails you a
credential sheet with a **Merchant Id** and a **Public Key**.

> The "Public Key" is not public — it is the secret key used to sign every
> request. Never commit it or paste it into a chat.

### 0.5 — Create your `.env`

```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in three values:

```bash
ABA_MERCHANT_ID=the Merchant Id from your credential sheet
ABA_API_KEY=the Public Key from the same sheet
ABA_BASE_URL=https://checkout-sandbox.payway.com.kh
```

Leave everything else in the file blank or commented out. `.env` is
already in `.gitignore`, so it will not be committed.

Now go to Step 1.

---

## Step 1: Check your credentials (takes ~2 seconds)

This step asks ABA's real server "do these credentials work?" — nothing
gets charged, nothing gets saved anywhere.

Run:

```bash
npm run verify:credentials
```

### ✅ It worked if you see:

```
  merchant id  ec460802
  api key      113dda…8d3d (40 chars)
  base url     https://checkout-sandbox.payway.com.kh

  creating a $1.00 test purchase … ok
     tran id     EAxxxxxxxxxxxx
     ...

  checking its status … ok
     status      PENDING ...

Credentials work. Run the full suite with: npm run test:sandbox
```

The important words are **ok** and **Credentials work.**

### ❌ Something is wrong if you see:

```
ABA code 1: Wrong Hash.
```

This means `ABA_MERCHANT_ID` and `ABA_API_KEY` in `.env` don't match
each other. Double check you copied both from the same credential sheet.

```
ABA code 21: End of API lifetime
```

This means your API key has expired. Ask ABA for a new one.

```
Missing in .env: ABA_MERCHANT_ID, ...
```

This means `.env` is missing, or a value is still blank.

If Step 1 fails, stop here and fix `.env` before going further —
the rest of the steps will fail for the same reason.

---

## Step 2: Run the automated checks (takes ~1 second)

This step checks that the code itself works correctly. It does **not**
talk to ABA's server — it's all done locally, so it works even with no
internet.

Run:

```bash
npm test
```

### ✅ It worked if you see:

```
 Test Files  5 passed (5)
      Tests  53 passed (53)
```

Every line above that should have a green checkmark (✓), no red ✗.

### ❌ Something is wrong if you see:

```
 Test Files  1 failed (5)
      Tests  1 failed | 52 passed (53)
```

Any number after "failed" that is not 0 means something broke. Copy
the red error text and ask for help — don't guess and change code.

---

## Step 3: Run the live test against ABA's real sandbox (takes ~2-3 seconds)

This step actually talks to ABA's server over the internet, the same
way your real app will. It creates one $1.00 test purchase and checks
its status. Nothing is charged — it's sandbox money, not real money.

Run:

```bash
npm run test:sandbox
```

### ✅ It worked if you see:

```
 ✓ ABA PayWay sandbox (live) > creates a purchase and returns a KHQR string and image
 ✓ ABA PayWay sandbox (live) > checks status of the new transaction and reports PENDING
 ✓ ABA PayWay sandbox (live) > reports an unknown transaction as code 6 rather than throwing

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

All 3 tests passed, no red text.

### ❌ Something is wrong if you see:

```
[sandbox] Skipping integration tests: set ABA_MERCHANT_ID, ABA_API_KEY, and ABA_BASE_URL in .env
```

This is not a failure — it just means `.env` is missing or empty, so
this step was skipped. Go back to "Before you start."

```
FAIL ... AssertionError
```

Something ABA sent back was different from what was expected. Copy the
full red error text and ask for help.

---

## Step 4: See a real QR code with your own eyes

Steps 1–3 only show you text in the terminal. This step is different —
it saves a picture file you can actually open and look at, exactly
like a real KHQR payment code you'd scan in a shop.

Run:

```bash
npm run see:qr
```

### ✅ It worked if you see:

```
Creating a $1.00 test purchase (tran_id: EAxxxxxxxxxxxx) …

Saved! Open this file to see the real QR code:
  /path/to/this/project/qr-code.png
```

Now open that file. On a Mac, you can run:

```bash
open qr-code.png
```

Or just find `qr-code.png` in this project's folder and double-click it
in Finder.

**You should see a black-and-white square QR code with a dollar sign
badge in the middle.** That image came straight from ABA's server —
it is a real KHQR code, built for the $1.00 test purchase above.

> **Note:** Sandbox QR codes cannot be scanned with the real ABA
> mobile app — sandbox and production are kept separate on purpose.
> This step only proves the SDK can ask ABA for a QR code and get a
> real, valid one back. It does not simulate someone actually paying.

### ❌ Something is wrong if you see:

```
Failed. ABA said (code 1): Wrong Hash.
```

Same fix as Step 1 — check `.env`.

```
ABA did not return a QR image for this request.
```

This would be unexpected — if you see this, something changed on
ABA's side. Ask for help.

---

## Step 5: Actually pay for something (takes ~1 minute)

Steps 1–4 all stop at the same place: a transaction that exists but has
never been paid. It stays `PENDING` forever, because a sandbox QR code
**cannot** be scanned by the real ABA Mobile app — sandbox and production
are separate on purpose.

This step is the one that gets you past that. It opens a real ABA
checkout page in your browser, and you pay it with a **test card**.

Run:

```bash
npm run pay:sandbox
```

Your browser opens on ABA's checkout page. The terminal also prints the
test cards. Type in the **Mastercard success** card:

| Card number         | Exp   | CVV |
| ------------------- | ----- | --- |
| 5156 8399 3770 6777 | 01/30 | 993 |

Use that one first — it is the only card not enrolled in 3D Secure, so it
does not ask for an OTP code. (The other cards are listed in
`docs/ABA Test Cards.md`, including a "declined" pair for testing the
failure path. The 3DS ones email their OTP to the address registered on
your ABA account.)

Finish paying in the browser. Meanwhile the terminal is polling ABA.

### ✅ It worked if you see:

```
  waiting for you to pay (Ctrl+C to stop)
  12s status: APPROVED

  PAID. ABA reports the transaction as APPROVED.
     amount      1 USD
     paid at     2026-09-04 09:15:22
```

**`APPROVED` is the word that matters.** You have now put a real sandbox
transaction all the way through, which is the state your webhook and your
"order paid" code need to handle.

Try it again with a declined card — you should see `DECLINED` instead.

### ❌ Something is wrong if you see:

```
  failed — ABA code 23: Payment option is not enabled
```

Card payment is not switched on for your merchant profile. Ask ABA to
enable **Card Payment** on the sandbox profile — nothing in `.env` will
fix this.

```
  ABA accepted the purchase but returned no checkout URL.
```

ABA replied with a QR code instead of a checkout page. That means
`payment_gate` was ignored — ask for help, don't change code.

```
  Timed out after 5 minutes still PENDING.
```

The page was never paid. The checkout page itself expires after 3
minutes, so if you took longer than that, just run the command again and
pay more promptly.

---

## Step 6: Generate the proof for ABA (takes ~2 minutes)

Steps 1–5 prove things to *you*, one command at a time, and then the
output scrolls away. This step runs the whole battery in one go and
writes a dated report file you can attach when you ask ABA to enable
production.

Run:

```bash
npm run report:sandbox
```

It runs 8 checks. Seven are automatic. When it reaches **T8** it opens a
checkout page and waits for you to pay it with the Mastercard test card,
exactly like Step 5.

### ✅ It worked if you see:

```
  T1  Merchant credentials accepted (HMAC-SHA512 signature) PASS
  T2  Invalid signature is rejected by ABA................ PASS
  T3  KHQR purchase returns a payable EMV payload and image PASS
  T4  ABA Mobile deeplink and app-store fallbacks returned PASS
  T5  Transaction status is queryable and reports PENDING. PASS
  T6  Unknown transaction is handled without crashing..... PASS
  T7  Hosted card checkout page is reachable.............. PASS
  T8  Card payment completes and settles as APPROVED...... PASS

  8 passed · 0 failed · 0 not verified

  READY — a real card payment settled as APPROVED.

  Report written to:
    .../reports/sandbox-report-20260904-091500.md
```

**`READY` is the word that matters.** The report file is what you send.

To also prove the failure path, add `--with-declined` and it runs a
ninth check using a declined test card.

### ⚠️ If it says INCOMPLETE

```
  INCOMPLETE — no real payment was completed. Re-run without --skip-payment.
```

The report deliberately refuses to call itself READY unless a real
payment settled. Re-run and finish paying the checkout page. Do not send
an INCOMPLETE report to ABA — it states plainly on its own first page
that the payment was never completed.

### What the report contains

- Your merchant ID, the sandbox URL, and a UTC timestamp.
- Every check, what it demonstrates, and ABA's actual response.
- **The real transaction IDs**, so ABA can look each one up in their own
  system and confirm independently.
- A **Scope and known gaps** section listing what was *not* tested.

That last section is deliberate. Read it before sending — it is what
keeps the report honest, and ABA's integration team will check the same
things anyway.

---

## What to send ABA when requesting production

1. The generated `reports/sandbox-report-*.md` file.
2. Your sandbox **Merchant ID** (it is already in the report).
3. Your production callback URL, and ask them to **whitelist the domain** —
   ABA rejects a `return_url` on a non-whitelisted domain with code 81.
4. Ask which payment options to enable on the production profile (card,
   KHQR, ABA PAY, Alipay, WeChat).

Before you send it, be aware of the gaps the report lists — in particular
that **pushback/callback verification is not yet implemented** in this
integration. See "Known gaps" below.

---

## Appendix A: ABA error codes you may hit

Codes are **per endpoint** — the same number means different things in
different places.

| Code | On `purchase`              | On `check-transaction-2` | What to do                                    |
| ---- | -------------------------- | ------------------------ | --------------------------------------------- |
| 00   | Success                    | Success                  | Nothing.                                      |
| 1    | Wrong hash                 | Wrong hash               | `ABA_MERCHANT_ID` / `ABA_API_KEY` don't match. |
| 2    | Invalid transaction ID     | —                        | Max 20 chars, must be unique.                 |
| 3    | Invalid amount             | —                        | Must be > 0.                                  |
| 4    | Duplicate transaction ID   | —                        | Generate a new one.                           |
| 6    | Domain not whitelisted     | `tran_id` not found      | See note below.                               |
| 12   | Currency not allowed       | —                        | Ask ABA to enable that currency.              |
| 21   | End of API lifetime        | End of API lifetime      | Key expired — ask ABA for a new one.          |
| 23   | Payment option not enabled | —                        | Ask ABA to enable it on your profile.         |
| 46   | KHR amount has decimals    | —                        | KHR must be a whole number.                   |
| 47   | KHR amount too small       | —                        | KHR must exceed 100.                          |
| 81   | Return URL not whitelisted | —                        | Ask ABA to whitelist your callback domain.    |

> **Code 6 is two different errors.** On a status check it means the
> transaction is unknown — and a *just-created* transaction returns it for
> about a second before it becomes queryable, which is normal. On a
> purchase it means your domain is not whitelisted.

---

## Appendix B: Known gaps

Things this test suite does **not** prove. Read these before telling ABA
you are production ready.

- **Pushback / callback verification is not implemented.** ABA signs
  pushback with an `X-PayWay-HMAC-SHA512` header, computed over the JSON
  body's keys sorted ascending with their values concatenated.
  `verifyWebhook()` currently hashes the raw body string instead, which
  does not match — so it will reject genuine ABA callbacks. No callback
  was received or validated in any test above.
- **Refunds are untested.** `/payments/refund` returns 404 on a default
  sandbox merchant; ABA enables it per merchant.
- **Only USD 1.00 is exercised.** KHR amounts have their own rules
  (whole numbers, above 100) and are not covered.
- **3D Secure is untested.** Step 5 and T8 deliberately use the
  non-enrolled card so no OTP is needed.
- **Alipay, WeChat and Google Pay are untested.**

---

## Quick summary — what each command does

| Command                      | Talks to ABA? | What it proves                             |
| ---------------------------- | ------------- | ------------------------------------------ |
| `npm run verify:credentials` | Yes           | Your `.env` values are correct             |
| `npm test`                   | No            | The code's logic is correct                |
| `npm run test:sandbox`       | Yes           | The code works against ABA's real server   |
| `npm run see:qr`             | Yes           | You get a real QR image you can look at    |
| `npm run pay:sandbox`        | Yes           | A payment can go all the way to `APPROVED` |
| `npm run report:sandbox`     | Yes           | All of the above, as a report file for ABA |

If all 6 steps show ✅, your ABA PayWay setup is working correctly.
