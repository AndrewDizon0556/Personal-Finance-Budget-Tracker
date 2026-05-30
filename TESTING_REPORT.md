# Testing & Verification Report — Ipon Challenge

This report documents the testing performed: automated unit tests, live API
verification, and manual UI testing. All evidence below was produced against
the actual codebase and the live deployment.

---

## 1. Automated Unit Tests (JUnit 5 + Mockito)

**Location:** `src/test/java/com/iponchallenge/service/DashboardServiceTest.java`
**Run:** `mvn test`
**Result:** `Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS`

The suite mocks the repositories, mapper, and `RunwayService` (demonstrating
Dependency Injection / testability) and verifies the wallet balance formula
`remaining = allowance + income − expenses`.

| # | Test | Scenario | Expected | Result |
|---|---|---|---|---|
| 1 | `income_increasesRemainingBalance` | allowance 5000, income 1000 | 6000 | PASS |
| 2 | `expense_decreasesRemainingBalance` | allowance 5000, expense 1000 | 4000 | PASS |
| 3 | `incomeAndExpense_netCorrectly` | 5000 + 2000 − 1500 | 5500 | PASS |
| 4 | `spentFieldReflectsExpensesOnly` | income shouldn't affect "spent" | 1500 | PASS |

---

## 2. Live API Verification (integration evidence)

Verified directly against the deployed API
(`https://personal-finance-budget-tracker-production.up.railway.app`) with HTTP
requests. Representative results:

| Endpoint | Scenario | Expected | Observed |
|---|---|---|---|
| `POST /api/auth/register` | weak password (`weak`) | 400 + policy message | **400** "Password must be at least 12 characters..." |
| `POST /api/auth/register` | strong password | 201 + JWT | **201** token returned |
| `POST /api/auth/login` | wrong password | 401 | **401** "Invalid email or password" |
| `POST /api/auth/login` | 5 failed attempts | lock | **401** "Account temporarily locked..." |
| `GET /api/dashboard` | valid token | 200 | **200** balance/runway returned |
| `GET /api/dashboard` | stale/expired token | 401 | **401** (triggers client logout) |
| `POST /api/auth/logout-all` then reuse token | revoked | 401 | **401** old token rejected |
| `GET /api/categories` | new account | typed list | income + expense categories with `type` |
| `POST /api/expenses` | income txn + income category | 201 | **201** |
| `POST /api/expenses` | expense txn + income category | 400 | **400** "category does not match transaction type" |
| `GET /api/dashboard` | categorized data | 200 | **200** (regression-fixed: open-in-view) |

**CORS / security headers** verified on responses: `Access-Control-Allow-Origin`
scoped to the Vercel origin; `Content-Security-Policy`, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
present.

---

## 3. Manual UI Testing (end-to-end flows)

| Flow | Steps | Result |
|---|---|---|
| Registration + onboarding | register → set allowance/schedule → first goal → dashboard | PASS |
| Add expense | open modal → Food ₱X → save | balance decreases, appears in Recent Activity |
| Add income | toggle Income → category auto-switches to income source → save | balance increases |
| Category filtering | toggle Expense/Income | dropdown shows only matching categories with ↑/↓ |
| Edit / delete transaction | edit amount, delete | balance recalculates immediately |
| Savings goal | create goal, reach target | progress ring + completion celebration |
| Analytics | view category pie + weekly trend | charts render with real data |
| Dark mode / accent | Settings toggles | theme + accent persist |
| Auth lifecycle | logout / expired token | redirected to login |
| Mobile | resize to 320–430px | bottom nav + centered add button, no overflow |

Devices/viewports checked: 320×568, 360×640, 375×667, 390×844, 430×932,
768×1024, and desktop.

---

## 4. Validation & Error-Handling Coverage

- **DTO validation (server):** `@NotBlank`, `@Email`, `@Pattern` (password),
  `@Size`, `@PositiveOrZero`, `@DecimalMax` on request DTOs; surfaced via
  `GlobalExceptionHandler` as `400` with a readable message.
- **Form validation (client):** Zod schemas in React Hook Form mirror the
  server rules (e.g., 12-char password policy).
- **Edge cases handled:** unauthenticated access → 401; missing resource → 404;
  category/type mismatch → 400; duplicate email → 400; expired/revoked token →
  401 with auto-logout.
- **No information leakage:** stack traces, messages, and binding errors are
  suppressed in responses (`server.error.include-*=never`).

---

## 5. How to Reproduce

```bash
# Backend unit tests
mvn test

# Build verification
mvn -q compile
cd frontend && npm install && npm run build   # tsc + vite, must pass clean
```

---

## 6. Testing Self-Audit (Implementation — 40%)

| Item | Status | Evidence |
|---|---|---|
| Feature completion | PASS | all listed features operational on live app |
| Frontend ↔ Backend ↔ DB integration | PASS | CRUD persists to PostgreSQL (§2) |
| System stability & error handling | PASS | global handler + validation + §4 |
| Usability & UX | PASS | onboarding, responsive, dark mode, empty states |
| Testing & verification | PASS | unit tests (§1) + API (§2) + manual (§3) |
