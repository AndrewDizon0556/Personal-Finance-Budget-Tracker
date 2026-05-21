# Changelog

## 2026-05-21

1. Project initialization
   - Added `pom.xml` for Spring Boot, JPA, Security, validation, and PostgreSQL.
   - Added `application.properties` with PostgreSQL datasource settings and JWT configuration.
   - Created Spring Boot startup class `BudgetTrackerApplication`.

2. Domain model and enums
   - Added `User` entity with `UUID id`, `fullName`, `school`, `email`, `passwordHash`, `monthlyAllowance`, `AllowanceSchedule schedule`, and `createdAt`.
   - Added `Expense` entity extending `Transaction` with `amount`, `category`, `notes`, `date`, and `userId`.
   - Added `Subscription` entity with `name`, `cost`, `renewalDate`, and `userId`.
   - Added `AllowanceSchedule` and `ExpenseCategory` enums.
   - Added base `Transaction` mapped superclass for transaction identity.

3. Authentication module
   - Implemented `/api/auth/register` and `/api/auth/login` controllers.
   - Added `RegisterRequest`, `AuthRequest`, and `AuthResponse` DTOs.
   - Added `AuthService` for registration, BCrypt hashing, and JWT generation.
   - Added `JwtUtils` and `JwtAuthenticationFilter` to validate tokens and attach user context.
   - Added `SecurityConfig` to secure endpoints and allow auth routes.
   - Enforced unique email constraint, password length, email validation, and allowance schedule enum validation.

4. Allowance engine
   - Added core `AllowanceService`.
   - Implemented `calculateRemainingBalance(User user)` against current allowance window and expense history.
   - Implemented `calculateDailySafeSpend(User user)` using remaining balance and remaining days.
   - Implemented `getNextAllowanceDate(User user)` with weekly, biweekly, and monthly reset rules.
   - Added schedule-based allowance conversion logic for weekly and biweekly.

5. Expense module
   - Added `/api/expenses` endpoint structure and expense request/response DTOs.
   - Added `ExpenseService` with validation for amount, category, future date, and remaining balance.
   - Implemented expense creation, category update logic, and notification hooks for expense events.
   - Added paginated expense history support via `ExpenseRepository`.

6. Dashboard and analytics
   - Added `/api/dashboard` support via `DashboardService`.
   - Implemented runway calculation, messaging, and average daily expense logic.
   - Added `/api/analytics/categories` support via `AnalyticsService`.
   - Implemented category total aggregation from expenses.

7. Split bill and subscriptions
   - Added split bill API support with `SplitBillRequest` and `SplitBillResponse`.
   - Implemented divide-by-members logic with 2-decimal rounding.
   - Added subscription reminder endpoint support and upcoming renewal lookup.

8. Infrastructure and utilities
   - Added exception classes and global error handling for validation and API errors.
   - Added singleton-like `DBConnection` placeholder, `SessionManager`, and `NotificationService`.
   - Added budget strategy interfaces and implementations for `NormalBudgetStrategy` and `SurvivalBudgetStrategy`.
   - Added PostgreSQL datasource settings in `application.properties` and Postgres JDBC dependency in `pom.xml`.
   - Added local run helper scripts `run-backend.ps1` and `run-backend.bat` for starting the Spring Boot backend.
   - Added `install-maven.ps1` to bootstrap a local Apache Maven installation if Maven is not on PATH.
   - Added H2 runtime support and H2/Postgres profiles so the app can run locally without an external database.

9. Notes
   - Backend skeleton now supports registration/login, allowances, expenses, dashboard data, analytics categories, split bill, and subscription reminders.
   - UI integration and additional MVP+ enhancements remain to be implemented after backend verification.
