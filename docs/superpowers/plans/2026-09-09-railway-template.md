# Railway Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn this repository into a 1-click deployable HTTP Payment Gateway API on Railway so developers can use it and you earn up to 25% Railway kickback.

**Architecture:** Build a fast, zero-dependency Node.js HTTP server (`src/server.ts`) using the existing `ABAPayWay` client. Provide REST endpoints (`/api/purchase`, `/api/status/:id`, `/api/webhook`, `/health`) and a live web checkout demo. Add `railway.json` configuration and documentation for publishing to the Railway marketplace.

**Tech Stack:** TypeScript, Node.js (`node:http`), tsup, Vitest, Railway Template Config.

---

### Task 1: Create the HTTP API Server (`src/server.ts`)

**Files:**
- Create: `src/server.ts`
- Test: `tests/server.test.ts`

**Endpoints:**
- `GET /health` -> `{ status: "ok", time: string }`
- `POST /api/purchase` -> `{ status: "success", data: PurchaseResponse }`
- `GET /api/status/:tran_id` -> `{ status: "success", data: StatusResponse }`
- `POST /api/webhook` -> Validates HMAC signature, returns `{ status: "verified" }`
- `GET /` -> HTML checkout test page with KHQR display

- [ ] **Step 1: Write the failing server test** in `tests/server.test.ts`
- [ ] **Step 2: Run test to confirm it fails** (`npm test`)
- [ ] **Step 3: Implement `src/server.ts`** using `node:http` and `ABAPayWay`
- [ ] **Step 4: Run test to confirm it passes** (`npm test`)
- [ ] **Step 5: Commit changes**

---

### Task 2: Build & Scripts Configuration

**Files:**
- Modify: `tsup.config.ts`
- Modify: `package.json`

**Changes:**
- Add `src/server.ts` to `tsup.config.ts` entry points.
- Add `"start": "node dist/server.js"` to `package.json`.
- Keep library exports intact so npm package publishing still works.

- [ ] **Step 1: Update `tsup.config.ts` and `package.json`**
- [ ] **Step 2: Run `npm run build`** and verify `dist/server.js` exists
- [ ] **Step 3: Test starting server locally** for 2 seconds with `PORT=3000 npm start`
- [ ] **Step 4: Commit changes**

---

### Task 3: Add Railway Template Configuration

**Files:**
- Create: `railway.json`
- Modify: `.env.example`

**Config:**
- Add build and start commands.
- Define required environment variables (`ABA_MERCHANT_ID`, `ABA_API_KEY`, `ABA_BASE_URL`).
- Define optional variables (`PORT`, `API_SECRET_TOKEN`, `WEBHOOK_FORWARD_URL`).

- [ ] **Step 1: Create `railway.json`**
- [ ] **Step 2: Update `.env.example`** with server variables
- [ ] **Step 3: Validate JSON syntax**
- [ ] **Step 4: Commit changes**

---

### Task 4: Railway Marketplace Publishing Guide & Readme Badge

**Files:**
- Modify: `README.md`
- Create: `docs/railway-publishing-guide.md`

**Content:**
- Add "Deploy on Railway" 1-click button to `README.md`.
- Document steps to publish template on Railway Marketplace.
- Document how to set up Stripe Connect for 25% kickback payouts.

- [ ] **Step 1: Create `docs/railway-publishing-guide.md`**
- [ ] **Step 2: Add Railway Deploy button to `README.md`**
- [ ] **Step 3: Review and verify links**
- [ ] **Step 4: Commit changes**
