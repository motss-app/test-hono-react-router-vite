# The "Sync" Game Plan: From Zero to Empire
*The step-by-step execution roadmap for building the default F&B operating system of Southeast Asia.*

**Status:** `DRAFT`
**Owner:** Founder
**Masterplan:** [Read the Vision & Architecture](./qr-ordering-empire-masterplan.md)

```text
                                  THE "SYNC" EMPIRE: ROADMAP TO DOMINANCE
                                  =======================================

YEAR 0: THE BUILD (Tech Foundation)          YEAR 1: THE LAUNCH (Pilot & Sales)       YEAR 2: THE GROWTH (Automation)
[Focus: Coding & Stability]                  [Focus: First Customers & Company]       [Focus: Self-Serve & Moat]
+-----------------------------+              +-----------------------------+          +-----------------------------+
|  Q1: BACKEND CORE           |              |  Q1: THE PILOT              |          |  SELF-SERVE PORTAL          |
|  [ ] Hono API (D1)          |              |  [ ] 1-3 Friendly Venues    |          |  [ ] Menu Editor CMS        |
|  [ ] Auth Middleware        |              |  [ ] Manual Onboarding      |          |  [ ] Analytics Dashboard    |
|  [ ] Database Schema        |              |  [ ] Bug Fixes & Polish     |          |  [ ] Auto-Onboarding        |
+-------------+---------------+              +-------------+---------------+          +-----------------------------+
              |                                            |                                     |
+-------------v---------------+              +-------------v---------------+          +-------------v---------------+
|  Q2: FRONTEND CORE          |              |  Q2: COMPANY SETUP          |          |  CONSUMER NETWORK           |
|  [ ] Menu UI (Optimistic)   |              |  [ ] Register ACRA          |          |  [ ] Cross-Venue Loyalty    |
|  [ ] Cart Logic (Local)     |              |  [ ] Bank Account           |          |  [ ] Social Food Feed       |
|  [ ] Checkout Flow          |              |  [ ] First Paid Customer    |          |  [ ] Discovery Map          |
+-------------+---------------+              +-------------+---------------+          +-----------------------------+
              |                                            |                                     |
+-------------v---------------+              +-------------v---------------+          +-------------v---------------+
|  Q3: MERCHANT OPS (BASIC)   |              |  Q3: SALES MACHINE          |          |  SUPPLY CHAIN               |
|  [ ] "KDS Lite" (Kitchen)   |              |  [ ] Hire Sales Rep         |          |  [ ] Real-time Inventory    |
|  [ ] Printer Integration    |              |  [ ] Standard Pitch Deck    |          |  [ ] Auto-Restocking        |
|  [ ] Basic Admin Tools      |              |  [ ] Goal: 10 Venues        |          |  [ ] Supplier POs           |
+-------------+---------------+              +-------------+---------------+          +-----------------------------+
              |                                            |                                     |
+-------------v---------------+              +-------------v---------------+          +-------------v---------------+
|  Q4: STABILITY & POLISH     |              |  Q4: GROWTH ENGINE          |          |  REGIONAL EXPANSION         |
|  [ ] End-to-End Testing     |              |  [ ] Marketing Automation   |          |  [ ] Pilot in KL/BKK        |
|  [ ] "Dogfooding"           |              |  [ ] Partnerships           |          |  [ ] Goal: 1,000 Venues     |
|  [ ] Documentation          |              |  [ ] Goal: 50 Venues        |          |                             |
+-----------------------------+              +-----------------------------+
```

---

## Year 0: The Build (Tech Foundation)
*Theme: Heads down coding. Build a stable product before selling.*

### Q1: Backend Core (The Foundation)
*Objective: A robust API and Database that can handle orders.*

- [ ] **Repo Setup:** Monorepo (Hono + React Router 7).
- [ ] **Database:** Design and deploy D1 Schema (`venues`, `products`, `orders`).
- [ ] **API:** Build Hono endpoints for Menu (`GET`) and Orders (`POST`).
- [ ] **Auth:** Implement basic JWT/Session auth for admin routes.

### Q2: Frontend Core (The Experience)
*Objective: A fast, app-like ordering experience for customers.*

- [ ] **Menu UI:** Build the digital menu with optimistic updates.
- [ ] **Cart Logic:** Robust local cart management (Add/Remove/Modifiers).
- [ ] **Checkout:** Integrate Payment Gateway (Adyen/Stripe) UI.
- [ ] **State Management:** Ensure cart persists across reloads.

### Q3: Merchant Ops (The "Back of House")
*Objective: Tools for the kitchen to receive orders.*

- [ ] **KDS Lite:** A simple web view for the kitchen to see incoming orders.
- [ ] **Printing:** Integrate Sunmi/Epson printer logic (via Android wrapper or Server).
- [ ] **Admin Tools:** Simple scripts/UI to update menus (Internal use).

### Q4: Stability & Polish (The "Pre-Launch")
*Objective: Ensure the system doesn't crash during dinner service.*

- [ ] **Testing:** Write E2E tests for the critical "Order -> Pay -> Print" flow.
- [ ] **Dogfooding:** Simulate a full dinner service with friends.
- [ ] **Docs:** Write "How to restart printer" guides for future staff.
- [ ] **Freeze:** Code freeze for major features. Only bug fixes.

---

## Year 1: The Launch (Pilot & Sales)
*Theme: Get out of the building. Turn code into a business.*

### Q1: The Pilot (Real World Test)
*Objective: 3 Live Venues (Friends/Family).*
- [ ] **Deploy:** Launch to Production.
- [ ] **Onboard:** Manually setup 1-3 friendly venues.
- [ ] **Support:** Be on-call during dinner service.

### Q2: Company Setup (The Business)
*Objective: Make it legal.*
- [ ] **Register:** Incorporate Company (ACRA).
- [ ] **Bank:** Open Business Bank Account.
- [ ] **First Sale:** Convert a Pilot venue to a Paying Customer.

### Q3: Sales Machine (Growth)
*Objective: 10 Paying Venues.*
- [ ] **Sales:** Start cold-calling/visiting venues.
- [ ] **Marketing:** Basic landing page and case studies.

### Q4: Growth Engine (Scale)
*Objective: 50 Paying Venues.*
- [ ] **Partnerships:** Explore bank/telco deals.
- [ ] **Optimization:** Refine the onboarding process.

---

## Year 2: The Growth (Automation & Moat)
*Theme: Automate operations and build defensive moats.*

### Q1: Self-Serve Portal (Remove the Bottleneck)
*Objective: Merchants onboard and manage themselves.*
- [ ] **CMS:** Build the full Menu Editor for merchants.
- [ ] **Dashboard:** Analytics and Reporting UI.
- [ ] **Onboarding:** Automated KYC and account creation.

### Q2: Consumer Network (The Moat)
*Objective: Lock in customers across venues.*
- [ ] **Loyalty:** Cross-venue points system (Eat at A, redeem at B).
- [ ] **Social:** "Food Feed" - See what friends are ordering.
- [ ] **Discovery:** "Venues near me" map.

### Q3: Supply Chain Integration
*Objective: Become indispensable to operations.*
- [ ] **Inventory:** Real-time stock deduction.
- [ ] **Suppliers:** Auto-generate POs for suppliers when stock is low.

### Q4: Regional Expansion
*Objective: Prove the model outside Singapore.*
- [ ] **New Markets:** Launch pilot in Kuala Lumpur or Bangkok.
- [ ] **Goal:** **1,000 Venues**.

---

## Year 3: The Scale (Enterprise)
*Theme: Moving upmarket and solidifying the team.*

### Focus: Enterprise Features
- [ ] **Multi-Outlet:** HQ Dashboard for franchise owners.
- [ ] **Integrations:** SAP, Oracle, Microsoft Dynamics connectors.
- [ ] **SLA:** 99.99% Uptime guarantees and dedicated support.

### Focus: Team Expansion
- [ ] **Sales:** Hire VP of Sales and regional teams.
- [ ] **Tech:** Hire DevOps, QA, and Mobile teams.
- [ ] **Goal:** **5,000 Venues**.

---

## Year 4: The Fintech Pivot (Bank of F&B)
*Theme: Monetizing the GMV, not just the SaaS.*

### Focus: "Sync Capital"
- [ ] **Lending:** Instant loans for inventory/renovation based on real-time sales data.
- [ ] **Factoring:** Pay suppliers directly on behalf of restaurants (Buy Now Pay Later for B2B).
- [ ] **Issuing:** Corporate cards for restaurant staff expenses.

### Focus: Data Monetization
- [ ] **Insights:** Sell aggregated trend reports to FMCG giants (Coke, Unilever).
- [ ] **Goal:** **$100M GMV Processed Annually**.

---

## Year 5: The Platform (Ecosystem)
*Theme: The Operating System for F&B.*

### Focus: The App Store
- [ ] **API:** Open API for 3rd party developers.
- [ ] **Marketplace:** Allow plugins for HR, Reservations, Accounting (Xero/Quickbooks).
- [ ] **Hardware:** Launch custom "Sync" Kiosks and POS terminals.

### Focus: Regional Dominance
- [ ] **Expansion:** Full operations in Vietnam, Indonesia, Philippines.
- [ ] **Goal:** **20,000 Venues**.

---

## Years 6-10: The Empire (Monopoly)
*Theme: Too big to fail.*

### The Endgame
- **M&A:** Acquire competitors in smaller markets to consolidate share.
- **Vertical Integration:** Launch "Sync Supplies" (F&B distribution) or "Sync Delivery" (Logistics).
- **Exit Strategy:**
    - **Option A:** IPO on SGX or NASDAQ.
    - **Option B:** Acquisition by Grab, Gojek, or Toast.
- **Goal:** **100,000 Venues**. The default way people order food in Southeast Asia.
