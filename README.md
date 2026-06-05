# Ipon Challenge

**Track your money. Control your spending. Build the saving habit.**

Ipon Challenge is a personal finance and budget tracker for **students and anyone
on a budget**. It helps you manage your allowance or income, log everyday expenses,
set savings goals, and build healthy money habits — wrapped in a modern, gamified
experience that makes budgeting feel less like a chore. It began with student life
in mind, and works just as well for professionals, families, and first-time savers.

> *Ipon* is the Filipino word for "saving up."

🔗 **Live app:** https://personal-finance-budget-tracker-seven.vercel.app

---

## Install the app (PWA)

Ipon Challenge is a Progressive Web App, so you can install it like a native app —
no app store needed. Open the live link above, then:

- **Android (Chrome):** tap the **⋮** menu → **Add to Home screen** → **Install**.
- **iPhone/iPad (Safari):** tap **Share** → **Add to Home Screen**.
- **Desktop (Chrome/Edge):** click the **install icon** (⊕) in the address bar, or
  the **⋮** menu → **Install Ipon Challenge**.

Once installed it opens full-screen, keeps you logged in, and works offline — any
expenses you add without internet are saved locally and synced automatically when
you reconnect.

---

## Overview

Ipon Challenge works for everyone — students living on a weekly *baon*, professionals
managing a salary, or anyone who just wants their money to last. It started with
student life in mind (allowance scheduling, school-friendly categories, and a
"safe-to-spend per day" figure that keeps you on track until your next payout) and
broadened from there. It pairs a clean React dashboard with a secure Spring Boot API
and a PostgreSQL database.

## Features

**Money management**
- **Smart Allowance Runway 2.0** — daily safe-to-spend, risk level (green / yellow / red),
  spending trend, estimated exhaustion date, and a 4-week projection chart
- **Recurring allowance automation** — allowance is auto-credited on your schedule
  (daily / weekly / bi-weekly / monthly)
- Fast expense and income logging with ready-made categories
  (Food, Transportation, Bills, Leisure, Emergency, plus student-friendly ones like Tuition, School Supplies, Projects, Load/Data)
- **Semester Budget Mode** — plan a whole semester and get a weekly spending breakdown
- Savings goals with animated progress rings and milestone tracking
- **Emergency Fund** — dedicated safety-net savings by category (Medical, Transport, School, General)
- Subscription tracker and a quick bill-splitter for group expenses
- **Before You Buy** — a spending-impact check before each expense is saved

**Insight & motivation**
- Analytics with spending-by-category and weekly trend charts
- **Financial Health Score** — a 0–100 score across savings, budget, spending,
  challenges, and emergency-fund habits
- Smart financial insights generated from your real spending
- **No-Spend Challenges** — gamified challenges (No Milk Tea, Save ₱50/day, …) that award XP
- Gamification: XP, levels, no-overspend streaks, and unlockable achievements
- **Financial Literacy** — practical lessons with quizzes and a compound-interest calculator

**Admin**
- **App Growth Dashboard (admin-only)** — aggregated usage and engagement analytics:
  total / new / active users, total app usage, a signup-growth chart, and an activity
  summary. Locked behind role-based access (server-side `ADMIN` check) and hidden from
  regular users; exposes aggregated stats only, never individual user data.

**Planning & reports**
- **School Calendar** — track exams, projects, and tuition deadlines with budget suggestions
- **Reports** — monthly report with charts, exportable as **PDF** (print) or **CSV**

**Experience**
- **Offline-first PWA** — installable on phone/desktop; works without internet and
  auto-syncs when the connection returns
- Light/dark mode with customizable accent colors
- First-time onboarding flow and friendly empty states
- Responsive layout with a mobile bottom nav, "More" menu, and quick-add button

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, React Hook Form + Zod, Axios |
| **Offline / PWA** | vite-plugin-pwa (Workbox service worker), Dexie (IndexedDB) |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA (Hibernate), Bean Validation, JJWT, Spring Scheduling |
| **Database** | PostgreSQL |
| **Hosting** | Vercel (frontend) · Railway (backend + PostgreSQL) |

## Architecture

The project is a clean two-tier application:

- A **React single-page app** that talks to the API over HTTPS and stores its
  session as a JWT bearer token.
- A **stateless Spring Boot REST API** organized into controllers → services →
  repositories, with DTOs and mappers separating the API contract from entities.
  Authentication is JWT-based; every data query is scoped to the authenticated user.

```
Personal-Finance-Budget-Tracker/
├── src/main/java/com/iponchallenge/   # Spring Boot API
│   ├── controller/                    # REST endpoints
│   ├── service/                       # Business logic (incl. allowance scheduler)
│   ├── repository/                    # Spring Data JPA repositories
│   ├── entity/  dto/  mapper/         # Domain, API contracts, mapping
│   ├── security/  config/             # JWT filter, rate limiting, seeders
│   ├── ai/                            # AI Coach scaffold (controller/service/dto/config)
│   └── exception/                     # Centralized error handling
├── src/main/resources/                # application.properties
└── frontend/                          # React + TypeScript PWA
    └── src/
        ├── pages/  components/        # Screens and UI building blocks
        ├── store/                     # Zustand state (auth, theme, offline, …)
        ├── services/  api/            # API clients
        ├── repositories/              # Online/offline data layer
        ├── db/  sync/                 # Dexie (IndexedDB) + SyncManager
        └── lib/                       # Helpers, motion variants, theme
```

## Getting Started

### Prerequisites
- Java 17+ and Maven
- Node.js 18+ and npm
- PostgreSQL 14+

### 1. Backend

Create a database, then provide configuration via environment variables
(sensible local defaults are built in):

| Variable | Description | Local default |
| --- | --- | --- |
| `PGHOST` / `PGPORT` / `PGDATABASE` | Postgres connection | `localhost` / `5432` / `ipon_challenge` |
| `PGUSER` / `PGPASSWORD` | Postgres credentials | `postgres` / `postgres` |
| `JWT_SECRET` | Signing key for JWTs — **required** (the app won't start without it) | _none — must be set_ |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173` |
| `AI_API_KEY` | Google Gemini API key — enables the AI Coach (free key from [aistudio.google.com](https://aistudio.google.com/app/apikey); never hardcode) | unset (AI Coach off) |
| `AI_MODEL` | Gemini model id | `gemini-2.0-flash` |
| `AI_BASE_URL` | Gemini API base URL | Gemini v1beta endpoint |

Run the API (defaults to `http://localhost:8080`):

```bash
mvn spring-boot:run
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. To point it at a non-default API, set
`VITE_API_URL` in a `frontend/.env` file:

```
VITE_API_URL=http://localhost:8080
```

## Security

Security is treated as a core feature, not an afterthought:

- **Authentication** — JWT bearer tokens with BCrypt password hashing and a
  token-versioning scheme that supports "log out of all devices" and full
  revocation on password change.
- **Password policy** — minimum 12 characters with upper, lower, number, and
  symbol, enforced on both client and server.
- **Brute-force protection** — account lockout after repeated failures plus
  per-IP rate limiting on auth endpoints.
- **Authorization** — every endpoint requires authentication (except login and
  register); all data access is scoped to the current user. **Role-based access
  control** (`STUDENT` / `ADMIN`) is enforced server-side — admin-only endpoints
  (`/api/admin/**`) reject non-admins with `403`, and admin UI is hidden from
  regular users.
- **Hardening** — security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy,
  Permissions-Policy), strict input validation, request-size limits, and generic
  error responses that never leak stack traces or internals.

## Deployment

- **Frontend** is deployed on **Vercel** from the `frontend/` directory.
- **Backend** and **PostgreSQL** run on **Railway**; the API auto-deploys on
  pushes to `main`.

## Roadmap

- **AI Coach (live)** — a chat assistant (Google Gemini) that gives budget advice
  from your real spending data, answers finance questions, and can categorize
  expenses; surfaced as a customizable-avatar floating button, with per-user daily
  caps to stay within the free tier. Set `AI_API_KEY` to switch it on.
- Refresh-token rotation with HTTP-only cookies (single-domain hosting)
- Push notifications for budget alerts and upcoming school events
- Richer analytics and multi-month report comparisons

## License

Released under the **MIT License** — see [LICENSE](LICENSE) for details.
NU Laguna branding elements are used for an educational, non-commercial project
and remain the property of National University Laguna. See also the in-app
[Terms of Service](https://personal-finance-budget-tracker-seven.vercel.app/terms)
and [Privacy Policy](https://personal-finance-budget-tracker-seven.vercel.app/privacy).

## Acknowledgements

Built as a full-stack portfolio project for **National University
Laguna** by Vic Andrew A. Dizon. Branding and theming are inspired by NU Laguna and are used for an
educational, non-commercial project.
