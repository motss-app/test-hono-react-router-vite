# The "Sync" Empire: Masterplan for Dominating F&B Commerce in SEA

## Executive Summary
**Goal:** Build the default **on-premise ordering + payments + ops + finance-data layer** for restaurants/chains in Singapore first, then Southeast Asia.
**The Wedge:** A "Multiplayer Ordering" engine ("Sync") that solves the social friction of dining out, powered by a superior tech stack (Cloudflare Durable Objects).
**The Empire:** Evolve from a software provider into a **Fintech & Operational Backbone**, owning the transaction flow, data, and lending infrastructure for the F&B industry.

---

## 1. The Core Product: "Sync" (Multiplayer Ordering)

### The Problem: The "In-Venue Gap"
*   **Grab/Foodpanda** focus on logistics (delivery).
*   **Legacy POS (TabSquare)** focus on admin/reporting.
*   **Current QR Systems** are "Single Player" (one phone, one order), which is anti-social and inefficient for groups.

### The Solution: High-Speed Individual Ordering
Instead of a static digital menu, we build a **Fast, App-Like Experience**:
1.  **Start:** Customer A scans the QR code.
2.  **Order:** Customer A adds items to their personal cart.
3.  **Pay:** Customer A pays for their own items immediately (PayNow/Card).
4.  **Kitchen:** Order is sent to the kitchen printer/display.
    *   **Result:** No awkward bill calculation at the end. No "who ordered this?".

### Detailed Workflow: Split First, Then Merge
The simplest, most scalable model for izakaya/casual dining is:
*   **Venue** → has outlets and tables.
*   **Table Session** → one dining session (start/end/status).
*   **Seat** → each phone joins as a seat (Guest A/B/C…).
*   **Orders/Items** → belong to a seat by default.

**Default behavior:**
*   Each diner scans the table QR → joins the session as a seat.
*   Each seat orders independently (privacy + no “pass one phone around”).
*   **Pay-at-table supports:**
    *   **Pay per seat** (independent checkout).
    *   **Merge seats** → one bill (for “one person pays”).
    *   **Partial merge** (some seats merged, some stay separate).

### Izakaya / Bar Must-Haves (High-Value Beachhead)
*   **Rounds Ordering:** Order more anytime (beers, skewers).
*   **Modifiers Done Right:** Allergies, doneness, add-ons.
*   **Call Staff Actions:** Water, bill, assistance.
*   **Long Sessions:** UI must not break or time out during a 3-hour dinner.

---

## 2. Technical Advantage (The Secret Weapon)
**Stack:** React Router 7 + Hono + Cloudflare Workers.

### Why this wins:
1.  **Cloudflare D1 (The Database):**
    *   **Global SQL:** Fast, distributed SQLite database at the edge.
    *   **Low Latency:** Reads are incredibly fast for menu loading.
2.  **React Router 7 (Optimistic UI):**
    *   App feels native (60fps). Taps register instantly before server confirmation.
    *   Critical for high-volume ordering where lag kills conversion.
3.  **Edge Speed:**
    *   Hono serves content from Singapore edge nodes, ensuring fast loads even on congested 4G networks (concerts, busy bars).

---

## 3. Business Model & Payments Strategy

### Merchant of Record (MoR) Strategy
We aim to be the **Merchant of Record**.
*   **Customer pays US** (descriptor: "Sync* Restaurant Name").
*   **We pay the Restaurant** (daily/weekly payouts).
*   **Value:** We handle refunds, disputes, and standardize reporting. This enables us to offer financial products later.
*   **Reality Check:** Starting as MoR requires a regulated route (e.g., sponsor PayFac). Treat this as a key compliance workstream.

### The "Unified Commerce" Strategy (Adyen)
To dominate SG and eventually SEA, we will standardize on **Adyen** for both Online (QR) and Offline (POS) payments.
*   **Why Adyen?**
    *   **Unified Commerce:** One platform for everything. Online orders and physical card terminal payments land in the same dashboard.
    *   **Interchange++ Pricing:** Cheaper than Stripe's flat rate at scale. You see exactly what the bank charges.
    *   **Terminal Fleet Management:** Adyen provides enterprise-grade Android POS terminals (e.g., Saturn S1F2) that can run our "Sync" app directly.
*   **The "Day 1" Reality:** Adyen can be strict with pre-revenue startups.
    *   **Plan A:** Apply for Adyen immediately.
    *   **Plan B (Fallback):** Use **HitPay** (Singapore-focused, easy approval) or **Stripe** for the first 6 months until volume justifies Adyen.

### Alternatives for Future Reference
If Adyen is not viable initially or for specific markets, we keep these alternatives in reserve:
*   **Stripe:** Best developer experience, instant approval. Good for "Day 1" but expensive (3.4% + $0.50).
*   **HitPay:** Excellent for Singapore. Deep integration with PayNow. Low fees for local payments.
*   **AsiaPay:** Strong in Hong Kong / Asia, but legacy tech stack.
*   **Sunmi POS:** If we need to bring our own hardware and just use a payment app. Adyen terminals are often re-branded Sunmi devices anyway.

### Revenue Streams
1.  **SaaS Fee:** Low monthly fee (e.g., $50/outlet) for the software.
2.  **Transaction Fee:** % of GMV (e.g., 1% on top of processing fees).
3.  **Hardware/Terminal Rental:** Markup on Adyen terminals or monthly rental fee.
4.  **Fintech (Future):** Lending, Instant Payout fees.

### Reliability Principle
**Payments outages cannot block dinner service.**
*   Define an emergency operational policy (e.g., “record external settlement” with supervisor approval) to keep service moving if the payment gateway goes down.

---

## 4. Operational Excellence (The Moat)

### Chain-Ready Menu Control (v1 Priority)
Chains need central control *and* the same table/billing flows.
*   **Central Menu Catalog:** Update once, sync to all outlets.
*   **Per-Outlet Overrides:** Availability, pricing differences.
*   **Scheduled Menus:** Lunch/Dinner/Late-night auto-switching.
*   **Instant "86" Toggle:** Mark items out-of-stock instantly.

### Accounting/Tax/Finance Ops (The "Sticky" Moat)
If you want to be big, don’t stop at “orders + payments”. Make back-office painless.
*   **Daily Settlement Report:** Gross sales, fees, net payout per outlet.
*   **Tax-Ready Breakdowns:** Service charge, tips, discounts, voids, refunds.
*   **Chart-of-Accounts Mapping:** Exports for Xero/QuickBooks.
*   **Audit Logs:** For compliance and trust.

---

## 5. Go-To-Market Strategy

### Phase 1: Physical Venues (The "Dine-In" Revolution)
*   **Target:** High-volume/low-service venues (Izakayas, Busy Bars, CBD Lunch spots, Hawker clusters).
*   **Pain Point:** Staff shortage. Waiters are busy taking orders instead of serving food. Customers hate waiting for the bill.
*   **Value Proposition:**
    *   **"Sync" Ordering:** Groups order together on their own phones. No waiter needed for ordering.
    *   **Instant Payment:** Table turnover increases by 15-20% because payment is done *before* or *during* the meal.
    *   **Upsell:** "People who bought this also bought..." works better on a screen than a busy waiter trying to remember.
*   **Sales Strategy:** "Upgrade" posture (fast onboarding, import menus) vs "Replacement" posture (deep product features). Start with "Upgrade" to get in the door quickly.

### Phase 2: Online Food Businesses (The "Pre-Order" Scale)
*   **Target:** Home-based businesses (HBBs), bakeries with pickup slots, and "Cloud Kitchens".
*   **Pain Point:** Managing orders via WhatsApp/DM is messy. Existing platforms (Grab/Foodpanda) take 30% commission.
*   **Value Proposition:**
    *   **Commission-Free:** You charge a flat SaaS fee or small transaction fee (e.g. 2%), not 30%.
    *   **"Group Buy" Feature:** A host starts a "Group Order" link for their office. Everyone adds their own bubble tea. One payment or split payment.
    *   **Brand Control:** They get their own branded page, not just a listing in a sea of competitors.

---

## 6. The Execution Game Plan
**[> Click here to view the detailed Year-by-Year Game Plan](./game-plan.md)**

The execution strategy is broken down into a separate document to keep this masterplan focused on Vision and Architecture. The Game Plan covers:
*   **Year 0:** The Build (Tech Foundation & Stability).
*   **Year 1:** The Launch (Pilot, Company Setup, First Sales).
*   **Year 2:** The Scale (Automation & Growth).
*   **Year 3:** The Moat (Retention & Ops).
*   **Year 4+:** Expansion & Fintech.

---

## 7. Moats to Build Intentionally
1.  **Operational Moat:** Trusted by staff during the Friday night rush.
2.  **Payments Moat:** Settlement, disputes, and compliance maturity.
3.  **Chain Moat:** Multi-outlet controls + central governance.
4.  **Data Moat:** Clean financial reporting and attribution for bank promos.
5.  **Switching Cost Moat:** History, loyalty points, and staff muscle memory.

---

## 8. Why This Plan Works
1.  **Starts Small & Sharp:** Focuses on *one* killer feature (Multiplayer Sync) to enter the market, rather than trying to build a full POS from day one.
2.  **Scales Deep:** Moves from "Front of House" (Ordering) to "Back of House" (Ops/Finance), increasing stickiness over time.
3.  **Leverages Data:** Uses transaction data to offer financial products (Lending), which has significantly higher margins than pure SaaS.

---

## 9. Visual Masterplan (Diagrams)

### A. High-Level System Architecture
This diagram shows how the "Sync" engine connects customers, staff, and the kitchen in real-time using Cloudflare's Edge network.

```text
[ Customer A ]      [ Customer B ]      [ Staff Tablet ]      [ Kitchen Display ]
       |                  |                    |                      |
       +--------+---------+--------------------+----------------------+
                |  (HTTP/REST - Individual Orders)
                v
      +-------------------------------------------------------+
      |           Cloudflare Edge (The Brain)                 |
      |                                                       |
      |   [ Hono Worker API ] ------------------------------+ |
      |           |                                         | |
      |           v                                         | |
      |   [ D1 Database ]                                   | |
      |   (Orders/Menus)                                    | |
      +-----------+-------------------------------------------+
                  |
                  v
      +-------------------------------------------------------+
      |           Data & Integrations                         |
      |                                                       |
      |   [ KV Store ]   [ Payment Gateway ]                  |
      |   (Config)       (Adyen/Stripe)                       |
      +-------------------------------------------------------+
```

### B. The 10-Year Roadmap Timeline
A visual timeline of the major phases from MVP to Market Dominance.

```text
YEAR 1: FOUNDATION
[ Feature-Complete Core ] ---> [ Global Rewards ] ---> [ 50 Paying Venues ]
      |
      v
YEAR 2: GROWTH
[ Tourist Payments ] ---> [ Hire Sales Team ] ---> [ Bank Partnerships ]
      |
      v
YEAR 3: MOAT
[ Inventory Sync ] ---> [ Kitchen Display System ] ---> [ < 1% Churn ]
      |
      v
YEAR 4: FINTECH
[ Expand to MY/TH ] ---> [ Instant Daily Payouts ]
      |
      v
YEAR 5-10: DOMINANCE
[ M&A Competitors ] ---> [ Enterprise Chains ] ---> [ Capital Lending ] ---> [ IPO / Exit ]
```

### C. The "Bank Partner" Growth Flywheel
How we leverage data to get free distribution from banks.

```text
                                  (Acquires)
                                      ^
                                      |
[ Great 'Sync' Experience ] ------------------------> [ Table Turnover & GMV ]
           ^                                                  |
           |                                                  | (Generates)
           |                                                  v
    [ SME Clients ] <--------------------------- [ High Volume Payment Data ]
           ^                                                  |
           | (Promotes to)                                    | (Attracts)
           |                                                  v
           +------------------------------------ [ Bank Partnerships (DBS/OCBC) ]
```

---

## 10. Team Composition & Hiring Roadmap
To execute this plan, you need to evolve your team structure as revenue grows.

### Year 1: The "Commando" Unit (Lean & Mean)
*   **Roles Needed:** 2-3
*   **Composition:**
    1.  **Founder (You):** Product, Tech Lead, Sales, Support, Janitor.
    2.  **Contract Full-Stack Dev (Part-time):** Helps with UI polish and integrations so you can focus on the Core Engine.
    3.  **Ops/Admin (Part-time/Freelance):** Handles data entry (menu digitization for clients), basic customer support.

### Year 2: The "Sales" Unit (Revenue Focus)
*   **Roles Needed:** 4-5
*   **Composition:**
    1.  **Founder:** Shifts to Product Strategy & Key Accounts.
    2.  **Lead Engineer:** Takes over day-to-day coding.
    3.  **Sales Representative (Commission-based):** Door-to-door sales, hawker centre sweeps. **(CRITICAL ROLE)**
    4.  **Customer Success Manager:** Onboarding, training staff, menu updates.

### Year 3: The "Company" Unit (Scale)
*   **Roles Needed:** 8-10
*   **Composition:**
    1.  **Product Manager:** Owns the roadmap.
    2.  **Engineering Team (3):** Backend, Frontend, Mobile/KDS.
    3.  **Sales Team (2):** 1 Lead, 1 Junior.
    4.  **Account Manager:** Retention.

---

## 11. The "Side Hustle" Protocol (Solo Founder Strategy)
*Can you build this while working a full-time job? Yes, but you must be ruthless.*

### A. The "Nights & Weekends" Rule
1.  **Scope Down:** Do not build the "Merchant Portal" first. Build the **Ordering Interface** (Customer View) and a **JSON Config** for menus. You can manually edit JSON files for your first 5 clients.
2.  **Leverage AI:** Use Copilot/ChatGPT to write 80% of the boilerplate (UI components, CRUD APIs). You focus on the *hard* logic (Durable Objects, Payments).
3.  **No Meetings:** Do not take meetings during the day. Handle support via WhatsApp/Email asynchronously.

### B. How to Promote in Singapore (Zero Budget)
1.  **The "Hawker Uncle" Strategy:** Go to your favorite hawker/cafe during *off-peak* hours (3 PM). Show them the demo on your phone. Say: *"Uncle, I make this for you, free for 6 months. Help you take order faster."*
2.  **Friends & Family:** Do you have a friend who runs a home-based bakery? They are your first user.
3.  **LinkedIn "Build in Public":** Post weekly updates about your tech stack (Cloudflare/Deno). It attracts tech-savvy F&B owners and potential co-founders.

### C. The Most Important Role to "Sell" This
**The "Hustler" Co-founder.**
*   If you are the "Hacker" (Tech), you need a "Hustler" (Sales).
*   **Profile:** Someone who has worked in F&B operations (ex-restaurant manager) or F&B tech sales (ex-Grab/Foodpanda sales).
*   **Why:** They speak the language of the restaurant owner. They know that "Table 5 needs chili" is more important than "Durable Objects".
*   **Where to find:** LinkedIn, F&B networking events, or even a restaurant manager you vibe with.

### D. Startup Starter Pack (Singapore Edition) & Costs
*Essential setup to run a legal business in Singapore.*

1.  **Entity Registration (ACRA):**
    *   **Cost:** ~$315 **(One-time)**.
    *   **What it is:** The government fee to register your Private Limited company. You get a UEN (Business ID).
2.  **Corporate Secretary (Corp Sec):**
    *   **Cost:** ~$300 - $600 **per year** (Recurring).
    *   **What they do:** A mandatory legal officer required by Singapore law. They handle ACRA compliance (Annual Returns, AGM minutes).
    *   **Important:** They **DO NOT** do your Accounting or Tax filing. That is separate.
    *   **Service vs Person:** You are hiring a *firm* (like Osome/Sleek), not a dedicated employee. A team manages your paperwork digitally.
3.  **Accounting & Tax Filing:**
    *   **Cost:** ~$600 - $1,000 **per year** (Recurring).
    *   **What it is:** Bookkeeping and filing Corporate Tax (Form C-S) to IRAS.
    *   **Tip:** Many Corp Sec firms (Osome/Sleek) offer a "All-in-One" bundle (Sec + Accounts + Tax) for ~$1,500/year.
4.  **Business Bank Account:**
    *   **Cost:** ~$10 - $30 **per month** (Recurring).
    *   **Note:** Often waived for the first year. Required to separate business money from personal money.
5.  **Domain Name:**
    *   **Cost:** ~$20 **per year** (Recurring).
    *   **Action:** Buy a `.com` or `.sg` domain.
6.  **Payments (HitPay/Stripe):**
    *   **Cost:** No fixed fee. Pay per transaction (e.g., 0.5% for PayNow, 3.4% for Cards).
7.  **Legal:**
    *   **Strategy:** Use standard templates for "SaaS Service Agreements".
    *   **Why no lawyer yet?** External lawyers charge $300-$500/hour.
    *   **Can I hire In-House?** Yes, but it is **not recommended** for a startup.
        *   **Cost:** A junior Legal Counsel in Singapore commands **$6,000 - $9,000 per month**. A Senior Counsel costs **$12,000+ per month**.
        *   **Verdict:** This burns your runway. Only hire in-house when you are Series B funded or have >50 employees.
    *   **When to hire external:** Only when you sign a big Enterprise client (e.g., BreadTalk Group) who demands a custom contract. Then, engage a firm like *Dentons Rodyk* or *Rajah & Tann* on a project basis.

### E. Legal Checklist for Early Stage Startups (The "How-To" Guide)
*Things you must handle to avoid getting sued or losing your company.*

1.  **Customer Contracts (SaaS vs Enterprise):**
    *   **Standard Users ($50/mo):** Do **NOT** sign a contract with every hawker. It's too slow.
        *   **Solution:** Use a **"Click-wrap" Terms of Service (ToS)**.
        *   **What is it?** The checkbox during signup: *"I agree to the Terms of Service"*. This is legally binding.
        *   **Where to get it?** Use generators like **Termly** or **GetTerms.io**.
        *   **Cost:** **GetTerms.io** has a "Comprehensive" pack for **~$49 USD (One-time)**. **Termly** has a free tier, or **$10/mo (Recurring)** for more policies.
    *   **Enterprise Clients (Chains):** They will demand a signed contract.
        *   **Solution:** Create a simple 1-page **"Service Order Form"** that lists the price and duration, and references your online ToS (e.g., *"Subject to Terms at sync.sg/terms"*).
2.  **PDPA (Personal Data Protection Act):**
    *   **Risk:** You are collecting customer names and phone numbers. Singapore law is strict about this.
    *   **Action:**
        *   **Privacy Policy:** Use the **PDPC** website (Free) or **GetTerms.io** (Included in the $49 pack).
        *   **Appoint a DPO:** Register yourself as the DPO in ACRA's **BizFile+**.
        *   **Cost:** **$0 (Free)**.
        *   **Rule:** **NEVER** sell customer data to third parties.
3.  **Intellectual Property (IP) Assignment:**
    *   **Risk:** If you hire a freelancer or co-founder and they leave, they might claim they own the code.
    *   **Action:** Ensure every employment contract or freelance agreement has an **"IP Assignment Clause"**.
    *   **Where to get it?** Search for **"Kindrik Partners Open Source Legal Docs"**.
    *   **Cost:** **$0 (Free)**. They are a top SG tech law firm that gives away open-source templates.
4.  **Founder Agreement:**
    *   **Risk:** You and your co-founder fight.
    *   **Action:** Sign a **Shareholders' Agreement** with **Vesting**.
    *   **Where to get it?** Use **Kindrik Partners** templates.
    *   **Cost:** **$0 (Free)**.
    *   **Standard Terms:** 4-year vesting with a 1-year cliff. If they leave in 6 months, they get 0 equity.

---

## 12. Financials & Funding Strategy
*Goal: Sustainable, profitable growth. Not "growth at all costs".*

### A. 10-Year Financial Projection Summary (Detailed Cost Breakdown)
*All figures in SGD. Estimates based on lean startup methodology.*

| Year | Phase | Tech Infrastructure (Cloudflare, Domain, SaaS) | Corp, Legal & Admin (ACRA, Bank, Office) | Team & Salaries (Founders, Sales, Devs) | **Total Monthly Burn** | **Est. Monthly Revenue** | **Net Profit** |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Year 0** | **Build** | ~$50 / mo (Workers, Domain) | $0 (Deferred) | $0 (Sweat Equity) | **~$50 / mo** | $0 | -$50 |
| **Year 1** | **Launch** | ~$100 / mo (Workers, Adyen Terminals) | ~$1,000 (ACRA One-time) + ~$80/mo | ~$500 / mo (Transport, Coffee) | **~$700 / mo** | ~$2,500 | +$1,800 |
| **Year 2** | **Growth** | ~$300 / mo (Paid Plans, More Terminals) | ~$400 / mo (Insurance, Accounting) | ~$3,000 / mo (1 Sales Rep + Comm) | **~$4,000 / mo** | ~$15,000 | +$11,000 |
| **Year 3** | **Scale** | ~$1,000 / mo (Enterprise) | ~$1,500 / mo (Co-working Desk, Tools) | ~$23,000 / mo (2 Devs, 1 PM, Sales Team) | **~$26,000 / mo** | ~$60,000 | +$34,000 |
| **Year 4** | **Fintech** | ~$5,000 / mo (Scale) | ~$10,000 / mo (Compliance, Office) | ~$135,000 / mo (Country Mgrs, Big Team) | **~$150,000 / mo** | ~$450,000 | +$300,000 |
| **Year 5+** | **Empire** | ~$50k+ / mo | ~$100k+ / mo | ~$1M+ / mo | **~$1M+ / mo** | ~$5M+ | Millions |

### B. Break-Even Analysis (The "Survival Number")
*How many venues do we need to survive?*

**1. Fixed Monthly Costs (Burn Rate): ~$700 (Year 1)**
*   Cloudflare/Tech: ~$50
*   Admin/Bank/Misc: ~$150
*   Sales Transport/Coffee: ~$500

**2. Revenue Per Venue (Unit Economics):**
*   **SaaS Fee:** $50/month
*   **Transaction Fees (Net):** Est. $30/month (Assuming $3k GMV x 1% Net Take Rate)
*   **Total Revenue per Venue:** **~$80/month**

**3. The Break-Even Point:**
*   $700 (Burn) / $80 (Rev/Venue) = **~9 Venues**
*   **Milestone:** Once we sign **9 paying venues** in Year 1, the company is "Default Alive".

### C. Year-by-Year Financial Projections (Detailed Breakdown)
*Note: "Net" assumes you (Founder) take minimal salary in Year 1.*

#### Year 0: The "Build" Phase (Coding)
*   **Traffic:** 0 (Development only).
*   **Monthly Costs (Burn):** ~$50
    *   **Tech:** Cloudflare Workers ($5), Domain ($2), GitHub Copilot ($10).
*   **Monthly Revenue:** $0.
*   **Net Profit:** -$50/mo.

#### Year 1: The "Launch" Phase (Pilot & Sales)
*   **Traffic:** 50 Venues x 50 Orders/Day = **2,500 Daily Orders**. Peak: 200 Concurrent Users.
*   **Monthly Costs (Burn):** ~$700
    *   **Tech:** Cloudflare Workers ($5), D1/KV ($10).
    *   **Hardware:** Adyen Terminal Rental/Depreciation (~$80 for demo units).
    *   **Corp:** ACRA/Sec/Bank amortized ($60).
    *   **Misc:** Transport/Coffee for sales ($500).
*   **Monthly Revenue:** ~$2,500
    *   50 Venues @ $50/mo (SaaS).
*   **Net Profit:** +$1,800/mo (Keep this in the bank).

#### Year 2: The "Growth" Phase (First Hires)
*   **Traffic:** 300 Venues x 60 Orders/Day = **18,000 Daily Orders**. Peak: 1,500 Concurrent Users.
*   **Monthly Costs (Burn):** ~$4,000
    *   **Tech:** Cloudflare Paid Plan + Usage ($100).
    *   **Hardware:** Terminal fleet maintenance ($200).
    *   **Salaries:** 1 Sales Rep (Base $2.5k + Comm).
    *   **Corp/Ops:** Insurance, Accounting ($400).
*   **Monthly Revenue:** ~$15,000
    *   300 Venues @ $50/mo.
*   **Net Profit:** +$11,000/mo (Sustainable).

#### Year 3: The "Scale" Phase (Team Expansion)
*   **Traffic:** 1,000 Venues x 80 Orders/Day = **80,000 Daily Orders**. Peak: 5,000 Concurrent Users.
*   **Monthly Costs (Burn):** ~$26,000
    *   **Tech:** Enterprise Scale ($500).
    *   **Salaries:** 2 Engineers ($5k ea), 1 PM ($5k), Sales Team ($8k).
    *   **Office:** Co-working space ($1.5k).
*   **Monthly Revenue:** ~$60,000
    *   1,000 Venues @ $60/mo (Price increase/Upsell).
*   **Net Profit:** +$34,000/mo.

#### Year 4: The "Fintech" Phase (Big Money)
*   **Traffic:** 3,000 Venues. High Volume.
*   **Monthly Costs (Burn):** ~$150,000 (Country Managers, Big Team).
*   **Monthly Revenue:** ~$450,000
    *   **SaaS:** $150k (3,000 venues).
    *   **Fintech:** $300k (1% of $30M GMV).
*   **Net Profit:** +$300,000/mo.

### D. Funding Sources (Singapore Context)
1.  **Customer-Funded (Bootstrapping):**
    *   The best money. Charge upfront for "Setup Fees" ($500) to cover your time.
    *   Offer "Lifetime Deals" to early adopters (e.g., $1,000 for life) to get cash injection.

2.  **Government Grants (Free Money):**
    *   **Startup SG Founder:** Provides ~$50k grant. Requires you to join an incubator (AMP) and have a co-founder.
    *   **PSG (Productivity Solutions Grant):** *Long term goal.* Get your solution pre-approved. The Govt pays 50% of the cost for restaurants to buy your software. This is how most SG tech agencies make money.

3.  **Community Crowdfunding (The "Nothing" Model):**
    *   *Concept:* Let your users (restaurant owners and loyal foodies) invest in the company.
    *   *Platform:* Equity Crowdfunding platforms like **Fundnel** or **PitchIn**.
    *   *Requirement:* You need a "Cult Brand". People must love "Sync" not just as a tool, but as a movement (e.g., "Saving the Hawker Culture").
    *   *Timing:* Do this in Year 3-4 when you have 500+ venues and a visible brand.

### C. The "Sustainable Growth" Path
1.  **Rule:** Do not hire until revenue covers the salary.
2.  **Focus:** Profitability over Valuation.
3.  **Metric:** Watch **Cash Flow**, not just Revenue. Daily payouts to restaurants mean you need a float. Be careful.

---

## 13. The "Zero-Friction" Sales & Deployment Playbook
*How to get customers without a sales team or heavy integration.*

### A. The "Trojan Horse" Deployment (Zero Integration)
*   **Problem:** Owners hate changing their POS (Micros, Eats365) because it's expensive, slow, and painful.
*   **Solution:** Don't integrate. Run *parallel*.
    1.  **Hardware:** Do not sell them hardware. Ask them to use a spare iPad or even a Manager's phone.
    2.  **Kitchen Notification (The "Telegram" Hack):**
        *   Instead of setting up a thermal printer (which requires LAN/WiFi config), send orders to a **Telegram Group**.
        *   *Flow:* Customer Orders -> Cloudflare Worker -> Telegram Bot API -> "Kitchen Group" Chat.
        *   *Benefit:* Setup takes 30 seconds. Everyone knows how to use Telegram.
    3.  **Payment:** Use a standalone PayNow QR (HitPay) or just "Cash at Counter" initially.
*   **Result:** You can launch a venue in **15 minutes**. No cables, no router config.

### B. The "Uncle-Friendly" Pitch Script
*   **Scenario:** Visit at 3 PM (Off-peak). Owner is resting.
*   **You:** "Uncle, I see your staff very busy during lunch. Customers wait very long to order."
*   **Uncle:** "Ya lor, hard to hire people. Young people don't want to work F&B."
*   **You:** "I have this system. Customer scan QR, order themselves. Order send directly to your phone. No need waiter to take order."
*   **Uncle:** "Expensive not? My POS very troublesome to change."
*   **You:** "**Free to try 1 month.** I don't touch your POS. I just put sticker on table. If you don't like, I tear off sticker. You lose nothing."
*   **The Hook:** Low risk. Reversible. No "Integration".

### C. The "Sticky" Conversion (Free -> Paid)
*   **Day 30 Meeting:** Bring a simple report.
*   **You:** "Uncle, last month, **500 orders** came from QR. That is 500 times your waiter didn't have to walk to the table. That saved you ~40 hours of work."
*   **The Ask:** "To keep using, it's just **$50/month**. Cancel anytime. Or you can hire another waiter for $2,500."
*   **Logic:** $50 vs $2,500 is a no-brainer.

### D. How to Get "Regulars" (The Takeaway Loop)
*   **Strategy:** Put a QR code on the **takeaway packaging** (sticker) or staple a card to the bag.
*   **Call to Action:** "Scan to Order Ahead & Skip the Queue next time."
*   **Result:** Office workers scan from their desk -> Order -> Walk down to pick up. You become their personal "Starbucks App". This builds a habit and locks them into your platform.

---

## 14. MVP Technical Architecture & Implementation Guide (Year 0/1)
*Deep dive into the "Sync" Engine implementation.*

### A. High-Level MVP Architecture (The "Sync" Engine)
This architecture prioritizes **simplicity** and **reliability**.

```text
[ Customer Phone ]       [ Staff Tablet ]
       |                        |
       | (POST /order)          | (GET /orders)
       v                        v
+-------------------------------------------------------+
|             Cloudflare Worker (Hono API)              |
|-------------------------------------------------------|
|  1. Auth Middleware (Session Token)                   |
|  2. Router ( /api/order, /api/menu )                  |
+-------------------------------------------------------+
           |
           v
+-------------------------------------------------------+
|               D1 Database (SQLite)                    |
|-------------------------------------------------------|
|  Tables:                                              |
|  - Venues (id, name, settings)                        |
|  - Menus (id, venue_id, json_data)                    |
|  - Orders (id, session_id, total, status)             |
|  - OrderItems (id, order_id, name, price)             |
+-------------------------------------------------------+
```
+-------------------------------------------------------+
|               D1 Database (SQLite)                    |
|-------------------------------------------------------|
|  Tables:                                              |
|  - Venues (id, name, settings)                        |
|  - Menus (id, venue_id, json_data)                    |
|  - Orders (id, session_id, total, status)             |
|  - OrderItems (id, order_id, name, price)             |
+-------------------------------------------------------+
```

### B. Core Data Schema (Year 10 Ready - Normalized)
*We split data into normalized tables to allow for deep analytics (e.g., "Which item sells best?") and inventory tracking without breaking the schema later.*

```sql
-- 1. Venues (The Tenant)
CREATE TABLE venues (
  id TEXT PRIMARY KEY, -- UUID
  slug TEXT UNIQUE, -- e.g. 'yakun-orchard'
  name TEXT NOT NULL,
  settings_json TEXT, -- Config: { "tax": 0.09, "service_charge": 0.10 }
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products (The Menu Items)
-- Split from Menus so we can track inventory and sales per item later.
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  cost_price_cents INTEGER, -- NEW: For Margin Analysis (Profit = Price - Cost)
  is_available BOOLEAN DEFAULT TRUE, -- For '86' (Sold Out) feature
  category TEXT, -- 'Drinks', 'Mains'
  attributes_json TEXT -- { "spicy": true, "vegan": false }
);

-- 3. Users (The Customer)
-- Essential for "Global Rewards" and "Order History".
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE, -- Primary identifier in SEA
  email TEXT,
  name TEXT,
  points_balance INTEGER DEFAULT 0
);

-- 4. Orders (The Transaction Header)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  user_id TEXT REFERENCES users(id), -- Nullable (Guest checkout)
  table_number TEXT,
  status TEXT NOT NULL, -- 'OPEN', 'PAID', 'FULFILLED', 'CANCELLED'
  total_amount_cents INTEGER NOT NULL,
  payment_method TEXT, -- 'PAYNOW', 'CARD', 'CASH'
  session_duration_seconds INTEGER, -- NEW: For Table Turnover Analysis (DO calculates this)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. OrderItems (The Transaction Details)
-- Split from Orders to allow item-level analytics and kitchen routing.
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL, -- Store name at time of purchase!
  price_at_purchase_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  modifiers_json TEXT -- { "sugar": "less", "ice": "more" }
);

-- Indexes for Performance
CREATE INDEX idx_orders_venue_date ON orders(venue_id, created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### C. Performance & Scaling Strategy (Handling Joins)
*   **Separation of Concerns:**
    *   **Hot Path (Ordering):** Uses **D1** (SQL). This ensures reliability.
    *   **Cold Path (History/Analytics):** Uses **D1** (SQL).
*   **Performance Implications:**
    *   **Joins:** `JOIN` operations in SQLite (D1) are extremely fast locally. The bottleneck is usually network payload size.
    *   **Mitigation:** We only fetch "Active Orders" for the kitchen. We do *not* fetch "All History" on the main dashboard.
    *   **Sharding (Year 5+):** Since every query filters by `venue_id`, we can easily split D1 databases by region (e.g., `d1_singapore`, `d1_malaysia`) without changing the code.

### D. The "Individual" Logic (D1 Only)
*   **Why D1 (Global DB)?**
    *   **Role:** The "Master Record" (Cold/Permanent State).
    *   **Why not Durable Objects?** For the MVP, we don't need complex state management. A simple API that writes to the DB is easier to build and debug.

### D. Order Lifecycle Data Flow (The "Happy Path")
*Visualizing how data moves from the customer's thumb to the kitchen's Telegram.*

```text
1. [Scan QR]  --> (Browser) --> GET /venue/yakun/table/5
                                     |
2. [Add Item] --> (Local)   --> LocalStorage (Cart)
                                     |
3. [Checkout] --> (HTTP)    --> POST /api/order
                                     |
4. [Notify]   --> (Queue)   --> Cloudflare Worker ------------------------+
                                     |
                                     +--> Telegram API --> "New Order: Table 5"
```
                                     +--> Broadcast "Cart Updated" --> (All Connected Users)
                                     |
4. [Checkout] --> (HTTP)    --> DO (Lock Session)
                                     |
                                     +--> INSERT into D1 (Orders Table) --+
                                                                          |
5. [Notify]   --> (Queue)   --> Cloudflare Worker ------------------------+
                                     |
                                     +--> Telegram API --> "New Order: Table 5"
```

### E. MVP Development Sprints (4-Week "Code-to-Launch" Plan)
*Goal: A working, deployable app in 1 month.*

#### Week 1: The Foundation (Backend & DB)
*   **Goal:** A Hono API that can talk to D1 and a basic Durable Object.
*   **Tasks:**
    1.  **Repo Setup:** Monorepo with Hono (API) and React Router (Frontend).
    2.  **D1 Schema:** Create `venues`, `menus`, `orders` tables. Seed with dummy data.
    3.  **DO Skeleton:** Create `OrderSession` class with `fetch()` handler.
    4.  **Deploy:** Get "Hello World" running on `sync.dev` (Cloudflare Workers).

#### Week 2: The "Transaction" Engine (Durable Objects)
*   **Goal:** Handle "Shared Drafts", "Pay-First Logic", and "Non-Blocking Checkout".
*   **Tasks:**
    1.  **Shared Draft Logic:** Implement `addToDraft`, `getDraft` in the DO.
    2.  **Order Snapshotting:** When "Checkout" starts, move items from `draft_pool` to `pending_order_{id}`.
    3.  **Concurrent Ordering:** Allow `addToDraft` to continue adding to `draft_pool` even while a payment is processing.
    4.  **Abandonment:** Implement `cancelCheckout` to return items to the pool if payment fails.

#### Week 3: The Frontend Experience (React Router 7)
*   **Goal:** A mobile-responsive UI that feels like an app.
*   **Tasks:**
    1.  **Menu UI:** Fetch menu JSON from D1 and render the list.
    2.  **Cart Drawer:** A sliding drawer showing current items (Local State).
    3.  **Order Status:** Poll DO for "Table Status" (Ordering vs Paying).
    4.  **Optimistic UI:** Show the item in the cart *immediately* while waiting for the server to confirm.

#### Week 4: The "Close" Loop (Checkout & Print)
*   **Goal:** Actually taking money and printing the ticket.
*   **Tasks:**
    1.  **Checkout API:** `POST /checkout` triggers the DO to "Lock" the draft items.
    2.  **D1 Sync:** DO writes the final order to the `orders` table in D1 *only after payment success*.
    3.  **Sunmi Integration:** Create a simple Android WebView wrapper (or local server) to listen for print jobs.
    4.  **Notification:** Worker sends the print command to the Sunmi device.

### F. Technology Stack Justification (The "Why")
*Every technology choice is optimized for **Cost** (Year 0) and **Scale** (Year 10).*

| Component | Choice | Why we chose it (Business & Tech Reason) |
| :--- | :--- | :--- |
| **Compute** | **Cloudflare Workers** | **$0/mo start.** No servers to manage. Runs code within 10ms of the customer (Edge). Cheaper than AWS Lambda. |
| **Backend** | **Hono** | **Ultra-lightweight.** Built specifically for Edge. 10x faster startup than Express.js. Typesafe. |
| **Frontend** | **React Router v7** | **Optimistic UI.** The "Mutations" feature makes the app feel instant even on bad 4G. Better than Next.js for pure SPAs. |
| **Real-time** | **Durable Objects** | **The "Traffic Cop".** Replaces Redis + Locks. It gives us "Atomic Consistency" (prevents race conditions during payment) for cheap. |
| **Database** | **Cloudflare D1** | **Serverless SQL.** It's SQLite at the Edge. No managing connection pools. Backups are automatic. Costs pennies compared to RDS. |
| **Payments** | **HitPay / Stripe** | **Developer Experience.** Best APIs. HitPay dominates PayNow (SG). Stripe dominates Cards (Global). |

### G. MVP Architecture Decision Records (ADR)
*Why we built it this way (Trade-offs & Rationale).*

1.  **Decision: Durable Objects for Table State (Instead of Redis/Postgres)**
    *   **Context:** We need to handle complex "Split Bill" and "Concurrent Ordering" scenarios without race conditions.
    *   **Choice:** Use Cloudflare Durable Objects.
    *   **Justification:**
        *   **State Machine:** The DO acts as a strict state machine. It tracks which items are `DRAFT`, `PENDING_PAYMENT`, or `PAID`.
        *   **Concurrency:** It allows User A to pay for "Burger + Coke" (locking those specific items) while User B adds a "Beer" (creating a new draft) simultaneously.
        *   **Consistency:** Ensures an item is never paid for twice.

2.  **Decision: Sunmi V2 for Kitchen Display (Instead of Telegram)**
    *   **Context:** We need a reliable way to tell the kitchen what to cook *after* payment.
    *   **Choice:** Use Sunmi V2 Handheld POS.
    *   **Justification:**
        *   **Professionalism:** Looks like a real POS system, not a hacky chat bot.
        *   **Reliability:** Prints a physical ticket. Chefs prefer paper.
        *   **All-in-One:** Handles receiving orders and printing in one device.

3.  **Decision: JSON Config for Menus (Instead of an Admin Portal)**
    *   **Context:** Building a drag-and-drop Menu Editor is hard.
    *   **Choice:** Store menus as a JSON blob in D1, edited manually by the Founder.
    *   **Justification:**
        *   **Focus:** In Year 0, you are the "Concierge". You do the work for the client.
        *   **Effort:** Saves 3 weeks of dev time. We only build the Admin Portal in Year 1 Q3 when we have too many clients to manage manually.

4.  **Decision: D1 as "Cold Storage" (Instead of keeping everything in DO)**
    *   **Context:** DOs have storage limits and are hard to query (siloed).
    *   **Choice:** Flush finished orders to D1 (SQLite).
    *   **Justification:**
        *   **Analytics:** We need to run SQL queries like `SELECT SUM(total) FROM orders WHERE date = 'today'`. You can't do this efficiently across 1,000 DOs.
        *   **Safety:** D1 is persistent and backed up. DO storage is persistent but better suited for "active" state.

### H. Database Schema Justification (The "Multi-Table" Strategy)
*Why we split data into 5 tables instead of one giant JSON blob.*

1.  **Venues & Products (The "Catalog" Split)**
    *   **Decision:** Separate `venues` and `products`.
    *   **Why:** If we stored products inside a JSON blob in `venues`, we couldn't easily query "Which venue sells 'Latte'?".
    *   **Benefit:** Allows for **Global Search** later (e.g., User searches for "Crab" -> finds all venues serving Crab).

2.  **Orders & OrderItems (The "Transaction" Split)**
    *   **Decision:** Separate the "Header" (`orders`) from the "Lines" (`order_items`).
    *   **Why:**
        *   **Analytics:** We can run `SELECT SUM(quantity) FROM order_items WHERE product_name = 'Coke'` to see exactly how many Cokes were sold.
        *   **Kitchen Routing:** In the future, 'Drinks' go to the Bar printer, 'Food' goes to the Kitchen printer. We need item-level granularity to route these separately.
    *   **Trade-off:** Requires a `JOIN` to see the full receipt.
    *   **Mitigation:** SQLite `JOIN`s are incredibly fast.

3.  **Users (The "Identity" Split)**
    *   **Decision:** A standalone `users` table linked by `user_id`.
    *   **Why:** Enables **Global Rewards**.
    *   **Scenario:** User visits Venue A and Venue B. Both orders link to the same `user_id`. We can calculate "Total Lifetime Value" of this user across the entire platform.

4.  **Managing Relationships (Foreign Keys)**
    *   **Strategy:** We use `TEXT` (UUIDs) for IDs and enforce relationships via code (and SQL constraints where supported).
    *   **Performance:** We add **Indexes** on foreign keys (`venue_id`, `order_id`) to make lookups instant.
    *   **Scale:** This structure is "Sharding-Ready". If we grow to 1 million venues, we can move Venue A's data to a different D1 database easily because all its related data (Products, Orders) shares the same `venue_id`.

### I. Hardware Strategy (The "Paper" Bridge)
*Traditional kitchens need paper. We use the Sunmi V2 as our "Trojan Horse".*

1.  **The "Foodpanda" Clone (Standard Issue)**
    *   **Device:** **Sunmi V2** (Handheld Android POS).
    *   **Cost:** ~$100 - $150 SGD (Lazada/AliExpress).
    *   **What is it?** It looks like a thick smartphone with a built-in thermal printer. It runs Android.
    *   **Why:**
        *   **All-in-One:** No pairing Bluetooth, no cables, no WiFi setup (uses 4G SIM).
        *   **Familiarity:** Every hawker already knows how to use this (because of Grab/Panda).
        *   **Implementation:** We build a tiny Android App (WebView) that listens to the WebSocket and auto-prints when a new order arrives.
    *   **Strategy:** Buy 5 units for your first 5 pilot customers. It makes you look like a "Real Company".

2.  **The "iPad POS" (Future State)**
    *   **Device:** iPad + **Star Micronics mC-Print3**.
    *   **Cost:** ~$500 (iPad) + ~$400 (Printer) = ~$900.
    *   **Why:** This is for "Year 2" when we replace their entire POS system.
    *   **Benefit:** High speed, reliable LAN connection, supports cash drawers.

3.  **The "Budget" Option**
    *   **Device:** Any Android Phone + **58mm Bluetooth Printer**.
    *   **Cost:** $0 (Phone) + $30 (Printer).
    *   **Why:** Good for "Pop-up" events or very small stalls.
    *   **Downside:** Bluetooth pairing can be flaky. Sunmi V2 is much more reliable.

### J. Analytics & Insights Strategy (The "Value Add")
*We don't just sell "Ordering"; we sell "Business Intelligence".*

1.  **The 4 Pillars of F&B Metrics (What we measure)**
    *   **Sales Health:**
        *   **Gross Merchandise Value (GMV):** Total sales today/week/month.
        *   **Average Order Value (AOV):** "Are people spending more?" (Critical for proving upsells work).
    *   **Menu Performance (ABC Analysis):**
        *   **Stars:** High Volume, High Margin.
        *   **Dogs:** Low Volume, Low Margin (Suggest removing from menu).
        *   **Modifier Attach Rate:** "30% of users add Egg". (Suggest making it a default set).
    *   **Operational Efficiency:**
        *   **Peak Hour Heatmap:** "Friday 7-9 PM is your busiest time." (Staff up).
        *   **Table Turnover:** "Table 5 sits for 90 mins but only spends $20." (Problem).
    *   **Customer Loyalty (CRM):**
        *   **Retention Rate:** "20% of customers returned within 7 days."
        *   **Whales:** List of top 10 spenders (for VIP treatment).

2.  **The Merchant Portal (Admin Dashboard)**
    *   **Timeline:** Year 1 Q3 (After the core ordering engine is stable).
    *   **Tech:** React Router v7 (SPA) + Recharts (Visualization).
    *   **Data Source:** Queries D1 directly (e.g., `SELECT sum(total) FROM orders...`).
    *   **Value Prop:** "Uncle, look. I showed you that 'Salted Egg Chicken' sells 2x more when we put it at the top. I made you $500 extra this month."

3.  **Database Impact**
    *   **Good News:** Our normalized schema (`orders`, `order_items`, `users`) *already* supports all these queries.
    *   **Future Optimization:** In Year 2, we will create **"Daily Summary Tables"** (e.g., `daily_sales_2025_01_01`) so we don't have to sum up millions of rows every time the dashboard loads.

### K. Analytics Query Map (How to Measure Success)
*Mapping business questions to SQL queries.*

| Metric | Business Question | SQL Logic (High-Level) | Tables Used |
| :--- | :--- | :--- | :--- |
| **GMV** | "How much money did I make today?" | `SELECT SUM(total_amount_cents) FROM orders WHERE created_at >= 'today'` | `orders` |
| **AOV** | "Are customers spending enough?" | `SELECT AVG(total_amount_cents) FROM orders WHERE created_at >= 'today'` | `orders` |
| **Menu Stars** | "What is my high-profit bestseller?" | `SELECT name, SUM(quantity) as vol, SUM(quantity * (price - cost)) as profit FROM order_items JOIN products ON ... GROUP BY product_id ORDER BY profit DESC` | `order_items`, `products` |
| **Turnover** | "How fast are tables clearing?" | `SELECT AVG(session_duration_seconds) / 60 as mins FROM orders` | `orders` |
| **Peak Hours** | "When do I need more staff?" | `SELECT strftime('%H', created_at) as hour, COUNT(*) FROM orders GROUP BY hour` | `orders` |
| **Retention** | "Do customers come back?" | `SELECT COUNT(DISTINCT user_id) FROM orders WHERE user_id IN (SELECT user_id FROM orders WHERE created_at < 'today')` | `orders`, `users` |

### L. Measuring Session Duration (The "Stopwatch" Logic)
*How the Durable Object calculates `session_duration_seconds`.*

1.  **Start Timer:**
    *   When the **first** user scans the QR and connects via WebSocket.
    *   DO State: `this.startTime = Date.now()`
2.  **End Timer:**
    *   When the payment is confirmed (Status -> 'PAID').
    *   Calculation: `duration = (Date.now() - this.startTime) / 1000`
3.  **Save:**
    *   The DO writes this integer to the `orders` table in D1 during the final sync.
    *   *Insight:* This captures the *actual* time the table was occupied, not just the time since the order was placed.

### M. End-to-End Operation Flow (The "Big Picture")
*Visualizing the lifecycle of a single table session.*

```text
+----------------------+       +-----------------------+       +-----------------------+       +-----------------------+       +-----------------------+
|   Customer (Phone)   |       |   Edge (Worker/DO)    |       |     Database (D1)     |       |     Kitchen (Ops)     |       |    Analytics (Biz)    |
+----------------------+       +-----------------------+       +-----------------------+       +-----------------------+       +-----------------------+
           |                               |                               |                               |                               |
           | 1. Scan QR (Table 5)          |                               |                               |                               |
           |------------------------------>|                               |                               |                               |
           |                               | 1a. Fetch Menu & Venue Info   |                               |                               |
           |                               |<----------------------------->|                               |                               |
           |                               |                               |                               |                               |
           | 2. Render Menu (UI)           |                               |                               |                               |
           |<------------------------------|                               |                               |                               |
           |                               |                               |                               |                               |
           | 3. Add "Burger" (Local)       |                               |                               |                               |
           | (Stored in Phone Memory)      |                               |                               |                               |
           |                               |                               |                               |                               |
           | 4. Click "Place Order"        |                               |                               |                               |
           |------------------------------>| 4a. DO: Append to "Draft"     |                               |                               |
           |                               |     (State: DRAFT_POOL)       |                               |                               |
           |                               |                               |                               |                               |
           | 5. Click "Pay for Table"      |                               |                               |                               |
           |------------------------------>| 5a. DO: Snapshot Items        |                               |                               |
           |                               |     (DRAFT -> PENDING_PAYMENT)|                               |                               |
           |                               |     (New items go to DRAFT)   |                               |                               |
           |                               |                               |                               |                               |
           | 6. Payment (PayNow/Card)      |                               |                               |                               |
           |------------------------------>|                               |                               |                               |
           |                               | 6a. Webhook: Payment Success  |                               |                               |
           |                               |------------------------------>|                               |                               |
           |                               |                               |                               |                               |
           |                               | 6b. INSERT into `orders`      |                               |                               |
           |                               |     (Status: PAID)            |                               |                               |
           |                               |------------------------------>|                               |                               |
           |                               |                               |                               |                               |
           |                               | 6c. Send Print Job            |                               |                               |
           |                               |-------------------------------------------------------------->|                               |
           |                               |                               |                               | 7. Sunmi V2 Prints Ticket     |
           |                               |                               |                               |    "Table 5: 1x Burger"       |
           |                               |                               |                               |                               |
           |                               |                               |                               | 8. Cook & Serve               |
           |                               |                               |                               |                               |
           |                               |                               |                               |                               |
           |                               |                               |                               | 9. Owner Checks Dashboard     |
           |                               |                               |                               |------------------------------>|
           |                               |                               | 9a. SELECT SUM(total)...      |                               |
           |                               |                               |<------------------------------|                               |
           |                               |                               |                               |                               |
           |                               |                               |                               | 10. View "Today's Profit"     |
           |                               |                               |                               | (Charts & Graphs)             |
           |                               |                               |                               |                               |
```

### N. Future Integrations (Post-MVP)
*Features to build after we have 50 paying customers.*

1.  **WhatsApp Notifications:**
    *   **Goal:** Send receipts and "Order Ready" alerts to customers via WhatsApp.
    *   **Why:** Higher open rate than email.
    *   **Provider:** Twilio or Meta Business API.

2.  **Inventory Management:**
    *   **Goal:** Auto-deduct stock when an order is placed.
    *   **Why:** Prevent selling items that are out of stock.

3.  **Loyalty Program:**
    *   **Goal:** "Buy 10 coffees, get 1 free".
    *   **Why:** Increases retention (LTV).
