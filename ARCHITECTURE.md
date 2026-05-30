# Architecture — Ipon Challenge

A full-stack, cleanly layered application: a React + TypeScript single-page app,
a stateless Spring Boot REST API, and a PostgreSQL database.

---

## 1. High-Level Diagram

```
┌──────────────────────────────────────────────┐
│  React + TypeScript SPA  (Vercel)              │
│  pages · components · Zustand stores           │
│  services (axios) · lib helpers                │
└───────────────┬────────────────────────────────┘
                │  HTTPS · JWT Bearer token
                ▼
┌──────────────────────────────────────────────┐
│  Spring Boot REST API  (Railway)               │
│                                                │
│  Controller ─▶ Service ─▶ Repository ─▶ Entity │
│        (DTO + Mapper)        (Spring Data JPA)  │
│                                                │
│  cross-cutting:                                │
│   security/  (JWT filter, rate limit, lockout) │
│   exception/ (global handler)                  │
│   observer/  (notifications)                   │
│   config/    (Spring Security, CORS, headers)  │
└───────────────┬────────────────────────────────┘
                │  JDBC (Hibernate)
                ▼
┌──────────────────────────────────────────────┐
│  PostgreSQL  (Railway)                          │
└──────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle (example: add an expense)

1. React `ExpenseModal` submits → `expenseService.createExpense()` (axios) with
   the JWT in the `Authorization` header.
2. `RateLimitFilter` (per-IP) and `JwtAuthenticationFilter` run; the filter
   validates the token + token-version and sets the security context.
3. `ExpenseController` (`POST /api/expenses`) receives a validated
   `ExpenseRequest` DTO (`@Valid`).
4. `ExpenseService.createExpense()` resolves + validates the category type,
   builds the `Expense` entity, saves via `ExpenseRepository`, and adjusts any
   matching `Budget`.
5. `ExpenseMapper` converts the saved entity to an `ExpenseResponse` DTO.
6. JSON returns to the client; the dashboard refetches and the wallet
   recalculates `allowance + income − expenses`.

Errors anywhere bubble to `GlobalExceptionHandler`, which returns a clean JSON
error with the correct status (no stack traces).

---

## 3. Backend Package Structure (`com.iponchallenge`)

| Package | Responsibility |
|---|---|
| `controller/` | REST endpoints; HTTP concerns only (thin). |
| `service/` | Business logic (Auth, Dashboard, Runway, Analytics, Expense, Budget, SavingsGoal, Subscription, SplitBill, Notification, Gamification, Insights, ExpenseCategory). |
| `repository/` | Spring Data JPA interfaces (persistence abstraction). |
| `entity/` | JPA entities + enums (`TransactionType`, `CategoryType`, `RunwayStatus`, `AllowanceSchedule`, `Role`). |
| `dto/` | Request/response models — the API contract. |
| `mapper/` | Entity ↔ DTO conversion. |
| `config/` | `SecurityConfig`, `JwtUtils` (cross-cutting configuration). |
| `security/` | `JwtAuthenticationFilter`, `RateLimitFilter`, `LoginAttemptService`, `CustomUserDetails`, `UserDetailsServiceImpl`. |
| `exception/` | `ApiException` hierarchy + `GlobalExceptionHandler`. |
| `observer/` | Observer pattern for notifications. |

---

## 4. Frontend Structure (`frontend/src`)

| Folder | Responsibility |
|---|---|
| `pages/` | Route screens (Dashboard, Transactions, Goals, Analytics, Subscriptions, SplitBills, Profile, Settings, Onboarding, Landing, Login, Register). |
| `components/` | Reusable UI (ui/, dashboard/, transactions/, goals/, analytics/, gamification/, layout/, brand/, public/). |
| `store/` | Zustand state: `authStore`, `themeStore`, `prefsStore`, `uiStore`, `expenseStore`, `goalStore`, `gamificationStore`, etc. |
| `services/` | Typed API clients (auth, expense, dashboard, goal, analytics, subscription, insights, gamification, profile). |
| `api/` | `axiosClient` with auth header + 401 auto-logout interceptor. |
| `lib/` | Helpers: `utils` (formatPeso, dates), `categories` (icon/colour map), `motion` (animation variants). |
| `layouts/` `routes/` | `PublicLayout`/`PrivateLayout`, `AppRouter`. |

---

## 5. Data Model (core entities)

- **User** — id, fullName, schoolName, email, password (BCrypt), monthlyAllowance,
  allowanceSchedule, role, tokenVersion, createdAt.
- **ExpenseCategory** — id, user, name, **type** (EXPENSE | INCOME).
- **Expense** — id, user, category, amount, notes, expenseDate, transactionType.
- **Budget** — id, user, category, budgetAmount, remainingBudget, month, year
  (unique per user+category+month+year).
- **SavingsGoal** — id, user, goalName, targetAmount, currentAmount, targetDate.
- **Subscription** — id, user, name, amount, renewalDate, active.
- **SplitBill** — id, user, title, totalAmount, memberCount, amountPerMember.

All financial amounts use `BigDecimal` for precision.

---

## 6. Key Cross-Cutting Concerns

- **AuthN/AuthZ** — stateless JWT; `JwtAuthenticationFilter` authenticates,
  `SecurityConfig` authorizes (only `/api/auth/login` + `/register` public,
  `/api/admin/**` requires `ADMIN`, everything else authenticated).
- **Session revocation** — `tokenVersion` claim; logout-all / password change
  bump it so old tokens are rejected.
- **Abuse protection** — `LoginAttemptService` (lockout) + `RateLimitFilter`
  (per-IP throttle on `/api/auth/**`).
- **Error handling** — one `GlobalExceptionHandler`; generic messages only.
- **Persistence integrity** — JPA parameterized queries; `BigDecimal` money;
  per-user query scoping.

---

## 7. Deployment Topology

- **Frontend:** Vercel, built from `frontend/`, env var `VITE_API_URL` points to
  the API. Security headers via `vercel.json` (CSP, HSTS, X-Frame-Options, ...).
- **Backend + DB:** Railway. Backend reads config from environment variables
  (`JWT_SECRET`, `PG*`, `ALLOWED_ORIGINS`). Auto-deploys on push to `main`.
- **CI/CD:** push to `main` → Vercel + Railway rebuild and redeploy.

---

## 8. Technology Decisions (rationale)

| Choice | Why |
|---|---|
| Spring Boot 3.2 / Java 17 | Mature DI, Security, Data JPA, validation; clean layering. |
| PostgreSQL | ACID guarantees for financial data; first-class JPA support. |
| React 18 + TypeScript | Component model + compile-time type safety. |
| Zustand | Minimal, typed global state without boilerplate. |
| Tailwind + Framer Motion | Fast, consistent styling + polished animation. |
| Monolith (not microservices) | YAGNI; clean layering allows future extraction. |
