# Changelog — Ipon Challenge

## [Sprint 8] — 2026-06-03

### Added

#### Feature: Semester Budget Mode

**Backend (Java Spring Boot)**
- `SemesterBudget` entity mapped to `semester_budget` table: semesterName, startDate, endDate, totalBudget, targetSavings, allowanceSchedule
- `SemesterBudgetRepository` with `findByUserOrderByStartDateDesc` and `findByIdAndUser`
- `SemesterBudgetRequest` DTO with Bean Validation (`@NotBlank`, `@NotNull`, `@DecimalMin`, date cross-field validation)
- `SemesterBudgetResponse` DTO with computed fields: totalSpent, remaining, weeklyBudget, totalWeeks, weeksElapsed, weeksRemaining, progressPercentage, status, statusMessage
- `WeeklyBreakdownResponse` DTO per 7-day window: allocatedAmount, spentAmount, remainingAmount, usagePercentage, status (SAFE/WARNING/OVERSPENT/UPCOMING), isCurrent flag
- `SemesterBudgetMapper` — computes week counts, elapsed weeks, weekly allocation, progress %, and status message from dates and spent totals
- `SemesterBudgetService` — full CRUD; reuses `ExpenseRepository.sumByUserAndDateBetweenAndType` to compute semester spending without new DB queries; `getWeeklyBreakdown()` generates per-week windows on the fly
- `SemesterBudgetController` — GET /api/semester-budget, GET /{id}, GET /{id}/weekly-breakdown, POST, PUT /{id}, DELETE /{id}
- `SemesterBudgetServiceTest` — 5 unit tests: progress%, ON_TRACK/WARNING statuses, current-week flagging, UPCOMING weeks

#### Feature: Financial Literacy Module — Student Edition

**Backend (Java Spring Boot)**
- `FinancialLesson` entity mapped to `financial_lessons` table: title, description, content (TEXT/JSON), category, difficulty, orderIndex, icon, estimatedMinutes, hasCalculator
- `UserLessonProgress` entity mapped to `user_lesson_progress` table: user FK, lesson FK, completed, score, completedAt; unique constraint on (user_id, lesson_id)
- `FinancialLessonRepository` — `findAllByOrderByOrderIndexAsc`, `existsByOrderIndex`
- `UserLessonProgressRepository` — `findByUser`, `findByUserAndLesson`, `countByUserAndCompleted`
- `LessonResponse` DTO — lesson fields + user-specific: completed, score, completedAt
- `UserProgressResponse` DTO — totalLessons, completedLessons, completionPercentage, currentStreak, averageScore, level, levelMessage
- `LessonMapper` — combines FinancialLesson + UserLessonProgress into LessonResponse
- `FinancialLiteracyService` — getLessons (with per-user completion map), getLesson, completeLesson (upsert progress), getUserProgress (level + streak calculation)
- `FinancialLiteracyController` — GET /api/financial-lessons, GET /{id}, POST /{id}/complete, GET /progress
- `LessonDataSeeder` (ApplicationRunner) — seeds 10 student-focused lessons on first boot; idempotent (skips if lessons exist)
- 10 seeded lessons with rich JSON content blocks (intro, tips, example, callout, quiz): Make Your Baon Last the Week · Compound Interest · Preparing for Tuition Day · First Credit Card · 50-30-20 Rule · Emergency Fund · Tracking Small Expenses · Group Expenses · Understanding Debt · Financial Goals
- `FinancialLiteracyServiceTest` — 5 unit tests: lesson completion status, completeLesson upsert, progress level (BEGINNER→ADVANCED), streak calculation

#### Frontend (React + TypeScript)

**Semester Budget**
- `src/types/semesterBudget.ts` — SemesterBudget, WeeklyBreakdown, SemesterBudgetPayload interfaces
- `src/services/semesterBudgetService.ts` — typed Axios client for all semester budget endpoints
- `src/store/semesterBudgetStore.ts` — Zustand store: semesters[], fetchSemesters, addSemester, editSemester, removeSemester
- `SemesterBudgetForm` — React Hook Form + Zod; fields: semesterName, startDate, endDate, totalBudget, targetSavings, allowanceSchedule; cross-field end > start validation
- `WeeklyBreakdownChart` — Recharts BarChart with per-week colour coding (green/amber/red/grey); dashed reference line at allocation; custom tooltip
- `SemesterBudgetCard` — progress bar, status chip, 3-stat grid (total/spent/weekly), status message, navigate to detail
- `SemesterBudgetPage` — list view with create/edit inline form; detail view (param `/semester-budget/:id`) with current-week highlight card and full week-by-week table

**Financial Literacy**
- `src/types/lesson.ts` — Lesson, UserProgress, ContentBlock union type (intro/tips/example/callout/calculator/quiz)
- `src/services/financialLiteracyService.ts` — typed Axios client for lessons and progress endpoints
- `ProgressTracker` — lesson completion bar, level chip, 3-stat row (completed/streak/avg score)
- `LearningCard` — lesson card with category chip, difficulty chip, estimated time, calculator badge, completed indicator
- `CompoundCalculator` — interactive compound interest calculator (principal, rate, years → future value, interest earned, multiplier)
- `FinancialLiteracyPage` — lesson grid with category filter chips and ProgressTracker summary
- `LessonPage` — renders all JSON content block types; embedded QuizBlock with answer validation; CompoundCalculator for Module 2; Mark as Complete button (requires quiz answer if lesson has quiz)

**Navigation & Routing**
- Added `/semester-budget` and `/semester-budget/:id` routes (protected)
- Added `/financial-literacy` and `/financial-literacy/:id` routes (protected)
- Added `Semester` (GraduationCap) and `Learn` (BookOpen) to desktop Navbar and mobile account menu

---

## [Sprint 1] — 2026-05-29

### Added

#### Backend (Java Spring Boot)
- Project setup with Spring Boot 3.2.5, Java 17, Maven
- Package structure: `controller`, `service`, `repository`, `entity`, `dto`, `mapper`, `config`, `security`, `exception`
- `User` entity with JPA mapping to `users` table (id, fullName, schoolName, email, password, monthlyAllowance, allowanceSchedule, createdAt)
- `AllowanceSchedule` enum: `WEEKLY`, `BIWEEKLY`, `MONTHLY`
- `UserRepository` with `findByEmail` and `existsByEmail` queries
- `RegisterRequest` and `LoginRequest` DTOs with Bean Validation annotations
- `AuthResponse` and `UserResponse` DTOs (never exposes raw entity)
- `UserMapper` for entity-to-DTO conversion
- `JwtUtils` — token generation, extraction, and validation
- `JwtAuthenticationFilter` — stateless JWT filter extending `OncePerRequestFilter`
- `UserDetailsServiceImpl` — loads user by email for Spring Security
- `SecurityConfig` — stateless session, JWT filter chain, BCrypt encoder, CORS for `localhost:5173`
- `GlobalExceptionHandler` — centralized exception handling for `ApiException`, validation errors, and generic errors
- `BadRequestException` and `UnauthorizedException` extending `ApiException`
- `AuthService` — register, login, getMe business logic with BCrypt password handling
- `AuthController` — thin controller: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `application.properties` — PostgreSQL datasource, JPA config, JWT config

#### Frontend (React + TypeScript + Tailwind)
- Vite project scaffold with React 18, TypeScript strict mode
- Tailwind CSS v3 with PostCSS
- Dependencies: `zustand`, `react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`
- `axiosClient` — Axios instance with JWT Authorization header interceptor
- `authService` — typed API functions for register, login, getMe
- `useAuthStore` (Zustand) — auth state with `setAuth` / `clearAuth`, token persisted in localStorage
- `auth.ts` types — `User`, `AuthResponse`, `AllowanceSchedule`, `RegisterPayload`, `LoginPayload`
- `PublicLayout` and `PrivateLayout` — route wrapper components
- `AppRouter` — public and protected route groups using React Router v6
- `LandingPage` — landing screen with tagline and CTA buttons
- `LoginPage` — form with Zod validation, error handling, redirects to dashboard on success
- `RegisterPage` — form with Zod validation, password confirmation, error handling

---

## [Sprint 2] — 2026-05-29

### Added

#### Backend
- `TransactionType` enum: `EXPENSE`, `INCOME`
- `ExpenseCategory` entity mapped to `expense_categories` table (user-scoped)
- `Expense` entity mapped to `expenses` table with category FK, amount, notes, date, type
- `Budget` entity mapped to `budgets` table with unique constraint on (user, category, month, year)
- `ResourceNotFoundException` — 404 response for missing resources
- `ExpenseCategoryRepository`, `ExpenseRepository` (with JPQL sum query), `BudgetRepository`
- DTOs: `ExpenseCategoryRequest/Response`, `ExpenseRequest/Response`, `BudgetRequest/Response`, `DashboardResponse`
- `ExpenseMapper`, `BudgetMapper`
- `ExpenseCategoryService` — CRUD + seeds 6 default categories (Food, Transportation, School Supplies, Entertainment, Health, Others) on new user registration
- `ExpenseService` — full CRUD with automatic budget `remaining_budget` deduction/restoration on create/update/delete
- `BudgetService` — CRUD with initial `remaining_budget` calculated from existing expenses at budget creation time
- `DashboardService` — computes remaining balance, daily safe spend, days left in month
- `AuthService` — updated to call `createDefaultCategories` after registration
- REST controllers: `ExpenseCategoryController` (`/api/categories`), `ExpenseController` (`/api/expenses`), `BudgetController` (`/api/budgets`), `DashboardController` (`/api/dashboard`)
- `application.properties` — added `spring.jackson.serialization.write-dates-as-timestamps=false`

#### Frontend
- Types: `expense.ts`, `budget.ts`, `dashboard.ts`
- Services: `expenseService.ts`, `budgetService.ts`, `dashboardService.ts`
- Zustand stores: `expenseStore` (expenses + categories + CRUD), `budgetStore` (budgets + CRUD)
- `Navbar` — sticky header with Dashboard / Transactions links and logout
- `BalanceCard` — shows remaining balance with color coding (green/yellow/red), allowance, spent, daily safe spend
- `BudgetSummaryCard` — per-category progress bars with spend percentage color coding
- `RecentTransactionsList` — last 5 transactions with category, date, amount
- `ExpenseModal` — add/edit form with React Hook Form + Zod, category dropdown, date picker, expense/income toggle
- `DashboardPage` — loads dashboard data, shows all cards, quick-add expense
- `TransactionsPage` — full list with month/year filter, inline edit/delete per row
- `PrivateLayout` — updated to include Navbar and rehydrate user from JWT on page refresh
- `AppRouter` — added `/dashboard` and `/transactions` protected routes

---

## [Sprint 3] — 2026-05-29

### Added

#### Backend
- `RunwayStatus` enum: `SAFE`, `WARNING`, `CRITICAL`
- `SavingsGoal` entity mapped to `savings_goals` table (user, goalName, targetAmount, currentAmount, targetDate)
- `SavingsGoalRepository` with `findByUserOrderByCreatedAtDesc` and `findByIdAndUser`
- DTOs: `SavingsGoalRequest/Response`, `RunwayResponse`, `CategoryTotalDto`, `AnalyticsResponse`
- `SavingsGoalMapper` — computes `progressPercentage` (capped at 100%) and `completed` flag
- `SavingsGoalService` — full CRUD; `currentAmount` defaults to 0 on create
- `RunwayService` — calculates avg daily spending over last 14 days, estimated days remaining (`remaining / avg`), days until next allowance (schedule-aware: MONTHLY/BIWEEKLY/WEEKLY), and runway status with a human-readable message
- `AnalyticsService` — category totals with percentages (sorted by amount desc), highest category, weekly spending totals (by day-of-month buckets)
- `DashboardResponse` — updated to include `runwayStatus`, `estimatedDaysRemaining`, `daysUntilNextAllowance`, `runwayMessage`
- `DashboardService` — updated to call `RunwayService` and embed runway data in the dashboard response
- Controllers: `SavingsGoalController` (`/api/goals`), `RunwayController` (`/api/runway`), `AnalyticsController` (`/api/analytics`)

#### Frontend
- Types: `goal.ts`, `analytics.ts`, `runway.ts`; updated `dashboard.ts` with runway fields
- Services: `goalService.ts`, `analyticsService.ts`
- `goalStore` (Zustand) — goals list with full CRUD actions
- `RunwayWidget` — color-coded card (green/yellow/red) showing estimated runway vs days until next allowance
- `GoalCard` — progress bar card with completion badge, edit/delete
- `GoalModal` — create/edit form with goalName, targetAmount, currentAmount, targetDate
- `CategoryPieChart` — Recharts donut pie with tooltip and legend
- `WeeklySpendingChart` — Recharts bar chart; highest-spend week highlighted in blue
- `GoalsPage` — grid of GoalCards with summary strip (total saved / total target)
- `AnalyticsPage` — total spent, top category, pie chart, weekly bar chart, category breakdown list
- `DashboardPage` — updated to render `RunwayWidget` between BalanceCard and BudgetSummaryCard
- `Navbar` — updated with Goals and Analytics links
- `AppRouter` — added `/goals` and `/analytics` protected routes
- `package.json` — added `recharts ^2.12.7`

---

## [Sprint 4] — 2026-05-29

### Added

#### Backend
- `Subscription` entity mapped to `subscriptions` table (name, amount, renewalDate, active)
- `SplitBill` entity mapped to `split_bills` table (title, totalAmount, memberCount, amountPerMember)
- Repositories: `SubscriptionRepository` (with upcoming-renewal query), `SplitBillRepository`
- DTOs: `SubscriptionRequest/Response` (with computed `daysUntilRenewal` and `dueSoon`), `SplitBillRequest/Response` (with computed `shareMessage`), `UpdateProfileRequest`
- Mappers: `SubscriptionMapper`, `SplitBillMapper`
- `SubscriptionService` — full CRUD + `getUpcomingRenewals(daysAhead)` helper used by notification system
- `SplitBillService` — create (calculates `amountPerMember = totalAmount / memberCount`), list, delete
- **Observer pattern** (`observer/` package):
  - `NotificationObserver` interface — `onNotification(NotificationEvent)`
  - `NotificationEvent` — type, title, message, severity
  - `NotificationPublisher` — manages observer list, fans out `publish()` calls
  - `InAppNotificationObserver` — concrete observer, collects events into a list
- `NotificationService` — creates a fresh `NotificationPublisher` per request, registers an `InAppNotificationObserver`, then checks: budget remaining < 20% → `BUDGET_WARNING`; active subscriptions due ≤ 3 days → `SUBSCRIPTION_REMINDER`; goals at 100% → `GOAL_COMPLETE`
- `AuthService.updateProfile` — partial update: fullName, schoolName, monthlyAllowance, allowanceSchedule
- Controllers: `SubscriptionController` (`/api/subscriptions`), `SplitBillController` (`/api/split-bills`), `NotificationController` (`/api/notifications`), updated `AuthController` with `PUT /api/auth/profile`

#### Frontend
- Types: `subscription.ts`, `splitBill.ts`, `notification.ts`
- Services: `subscriptionService.ts`, `splitBillService.ts`, `notificationService.ts`, `profileService.ts`
- Zustand stores: `subscriptionStore`, `notificationStore`
- `SubscriptionModal` — add/edit form with name, amount, renewalDate, active toggle
- `SubscriptionsPage` — list with color-coded renewal badges (overdue/due-today/3d/7d/upcoming), monthly total
- `SplitBillsPage` — live per-person calculator preview, save to history, copy-to-clipboard share message
- `ProfilePage` — update fullName, schoolName, monthlyAllowance, allowanceSchedule; updates auth store on save
- `NotificationBell` — bell icon in Navbar with count badge; dropdown shows all notifications with severity color coding; auto-fetches on mount; closes on outside click
- `Navbar` — updated with Subscriptions, Split, Analytics, Profile links + NotificationBell
- `AppRouter` — added `/subscriptions`, `/split-bills`, `/profile` protected routes

### Architecture Notes
- Controllers are kept thin — all business logic lives in the service layer
- Entities are never exposed to the frontend directly (always via DTOs)
- JWT is stateless — no server-side sessions
- Password hashing uses BCrypt via Spring Security's `PasswordEncoder`

---

## [Sprint 5] — UI/UX Redesign & Gamification — 2026-05-30

### Added
#### Frontend
- NU-Laguna design system: blue/gold palette, glassmorphism, custom fonts,
  Framer Motion animations, dark/light mode + customizable accent colors
- Redesigned every screen (landing, auth, dashboard, transactions, goals,
  analytics, subscriptions, split bills, profile) + reusable UI primitives
- New app shell: glass top navbar, mobile bottom navigation, floating add button
- First-time onboarding wizard; friendly empty states; loading skeletons
- Customizable "Days left" budgeting horizon (schedule-derived default + manual override)

#### Backend
- Gamification endpoint `GET /api/gamification/me` — XP, levels, streaks,
  achievements computed from real activity
- Smart insights endpoint `GET /api/insights` — rule-based financial insights
- Dashboard "days left" made allowance-cycle aware (via `RunwayService`)

---

## [Sprint 6] — Security Hardening (OWASP-aligned) — 2026-05-30

### Added / Changed
- Strong password policy (12+ chars, complexity) on register + change — client + server
- JWT token-version claim → "log out of all devices" + revoke on password change
- `ChangePasswordRequest`, `PUT /api/auth/password`, `POST /api/auth/logout-all`
- `LoginAttemptService` (account lockout) + `RateLimitFilter` (per-IP throttle)
- Role scaffolding (`Role` STUDENT/ADMIN), `CustomUserDetails`
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- `401` authentication entry point; hardened error responses; request size limits
- Frontend: Zod password policy, axios 401 auto-logout, Settings security section,
  `vercel.json` security headers
- Migration-safe `NOT NULL` columns (DB defaults) for existing rows

---

## [Sprint 7] — Branding, Fixes, Categories & Documentation — 2026-05-30

### Added / Fixed
- Brand logo (coin + graduation cap + peso) as vector assets; favicon, lockups,
  monochrome + dark variants; wired into the app
- **Fix:** wallet remaining balance now includes income
  (`allowance + income − expenses`); added `DashboardServiceTest` (JUnit + Mockito)
- **Fix:** restored `open-in-view` to resolve a 500 on categorized data
- Income/expense **category types** (`CategoryType`): type-aware transaction form
  (filtered dropdown, auto-reset on type switch, ↑/↓ indicators) + backend
  validation preventing mismatched categories; income-category backfill for
  existing accounts
- **Fix:** centered the mobile floating add button (Framer transform conflict)
- Documentation suite: `README.md`, `CHANGELOG.md`, `PRESENTATION.txt`,
  `OOP_DOCUMENTATION.md`, `ARCHITECTURE.md`, `TESTING_REPORT.md`
