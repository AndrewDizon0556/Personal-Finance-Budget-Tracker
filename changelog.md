# Changelog — Ipon Challenge

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
