# Ipon Challenge

**Track your allowance. Control your spending. Survive the semester.**

Ipon Challenge is a student-focused personal finance and budget tracker built for
National University Laguna students. It helps students manage their allowance,
log everyday expenses, set savings goals, and build healthy money habits — wrapped
in a modern, gamified experience that makes budgeting feel less like a chore.

> *Ipon* is the Filipino word for "saving up."

🔗 **Live app:** https://personal-finance-budget-tracker-seven.vercel.app

---

## Overview

Most budgeting apps are built for working professionals. Ipon Challenge is built for
student life: weekly or monthly *baon*, school-specific spending categories, and a
"safe-to-spend per day" figure that keeps you on track until your next allowance.
It pairs a clean React dashboard with a secure Spring Boot API and a PostgreSQL
database.

## Features

**Money management**
- Allowance tracking with daily safe-to-spend guidance and an allowance "runway"
  predictor (weekly / bi-weekly / monthly cycles)
- Fast expense and income logging with student-specific categories
  (Tuition, Food, Transportation, School Supplies, Projects, Load/Data, Leisure, Emergency)
- Savings goals with animated progress rings and milestone tracking
- Subscription tracker and a quick bill-splitter for group expenses

**Insight & motivation**
- Analytics with spending-by-category and weekly trend charts
- Smart financial insights generated from your real spending
- Gamification: XP, levels, no-overspend streaks, and unlockable achievements

**Experience**
- Light/dark mode with customizable accent colors
- First-time onboarding flow and friendly empty states
- Responsive layout with a mobile bottom nav and quick-add button

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, React Hook Form + Zod, Axios |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA (Hibernate), Bean Validation, JJWT |
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
│   ├── service/                       # Business logic
│   ├── repository/                    # Spring Data JPA repositories
│   ├── entity/  dto/  mapper/         # Domain, API contracts, mapping
│   ├── security/  config/             # JWT filter, rate limiting, Spring Security
│   └── exception/                     # Centralized error handling
├── src/main/resources/                # application.properties
└── frontend/                          # React + TypeScript app
    └── src/
        ├── pages/  components/        # Screens and UI building blocks
        ├── store/                     # Zustand state (auth, theme, prefs)
        ├── services/  api/            # API clients
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
| `JWT_SECRET` | Signing key for JWTs (set a strong value) | dev fallback |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173` |

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
  register); all data access is scoped to the current user; role scaffolding
  (`STUDENT` / `ADMIN`) is in place.
- **Hardening** — security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy,
  Permissions-Policy), strict input validation, request-size limits, and generic
  error responses that never leak stack traces or internals.

## Deployment

- **Frontend** is deployed on **Vercel** from the `frontend/` directory.
- **Backend** and **PostgreSQL** run on **Railway**; the API auto-deploys on
  pushes to `main`.

## Roadmap

- Refresh-token rotation with HTTP-only cookies (single-domain hosting)
- Budget management UI and recurring-allowance automation
- Exportable reports and richer analytics

## Acknowledgements

Built as a full-stack portfolio project by a student of **National University
Laguna**. Branding and theming are inspired by NU Laguna and are used for an
educational, non-commercial project.
