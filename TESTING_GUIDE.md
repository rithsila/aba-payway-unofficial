# Testing Guide (See It Work Yourself)

This guide is for anyone with no coding background. You will run a few
commands and look at what appears. Each step tells you exactly what
"it worked" looks like, and what "something is wrong" looks like.

There are 5 steps. Do them in order.

---

## Before you start

You need one file: `.env`, with your ABA sandbox credentials in it.

1. Copy `.env.example` to a new file named `.env`.
2. Open `.env` and fill in:
   - `ABA_MERCHANT_ID` — the **Merchant Id** on your ABA credential sheet.
   - `ABA_API_KEY` — the **Public Key** on your ABA credential sheet.
   - `ABA_BASE_URL` — already filled in for you (sandbox).
3. Leave everything else in `.env` blank.

Then open a terminal in this project folder and run this once:

```bash
npm install
```

Wait for it to finish. No errors should appear.

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

## Quick summary — what each command does

| Command                      | Talks to ABA? | What it proves                             |
| ---------------------------- | ------------- | ------------------------------------------ |
| `npm run verify:credentials` | Yes           | Your `.env` values are correct             |
| `npm test`                   | No            | The code's logic is correct                |
| `npm run test:sandbox`       | Yes           | The code works against ABA's real server   |
| `npm run see:qr`             | Yes           | You get a real QR image you can look at    |
| `npm run pay:sandbox`        | Yes           | A payment can go all the way to `APPROVED` |

If all 5 steps show ✅, your ABA PayWay setup is working correctly.
