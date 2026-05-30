# OOP, SOLID, GRASP & Design Patterns — Ipon Challenge

This document maps the project's object-oriented design to **actual classes** in
the codebase so every claim is verifiable in the source.

Backend root package: `com.iponchallenge` (under `src/main/java/`).

---

## 1. The Four OOP Pillars

### Encapsulation
State is private and accessed through controlled methods; the API never exposes
raw entities.

- **Entities** — `entity/User.java`, `Expense.java`, `ExpenseCategory.java`,
  `SavingsGoal.java`, `Budget.java`, `Subscription.java`, `SplitBill.java`.
  Fields are private with Lombok-generated getters/setters; persistence details
  (`@Column`, relationships) are hidden behind the accessors.
- **DTOs hide internals** — `dto/UserResponse.java`, `AuthResponse.java`,
  `ExpenseResponse.java`. The `User` entity has a `password` field, but
  `UserResponse` **omits it entirely**, so a password hash can never be
  serialized to a client.
- **Why:** protects domain invariants and decouples the public API from the
  database schema.

### Abstraction
Callers depend on *what* a component does, not *how*.

- **Repository interfaces** — `repository/UserRepository`,
  `ExpenseRepository`, `BudgetRepository`, etc. extend `JpaRepository`. Callers
  invoke `findByEmail(...)` without knowing the SQL.
- **Service layer** — `service/AuthService`, `DashboardService`,
  `RunwayService`, `AnalyticsService` express business operations and hide their
  implementation from controllers.
- **`security/UserDetailsService` + `observer/NotificationObserver`** are
  interfaces that abstract "load a user" and "deliver a notification."
- **Why:** lower coupling, easier testing and change.

### Inheritance
Shared behavior and contracts are reused through a base type.

- **Framework inheritance** — `security/JwtAuthenticationFilter` and
  `security/RateLimitFilter` **extend** `OncePerRequestFilter`.
- **Exception hierarchy** — `exception/ApiException` (extends `RuntimeException`)
  is the base for `BadRequestException`, `UnauthorizedException`, and
  `ResourceNotFoundException`. Each subclass just supplies a message + HTTP
  status.
- **Interface implementation** — `security/CustomUserDetails implements
  UserDetails`; `observer/InAppNotificationObserver implements
  NotificationObserver`.
- **Why:** reuse framework hooks and share one exception contract instead of
  duplicating code.

### Polymorphism
One reference, many run-time behaviors.

- **Exception handling** — `exception/GlobalExceptionHandler` declares a single
  `@ExceptionHandler(ApiException.class)`; at runtime it handles a
  `BadRequestException`, `UnauthorizedException`, or `ResourceNotFoundException`
  uniformly by reading `getStatus()` polymorphically.
- **Observer** — `NotificationPublisher.publish()` calls `onNotification(event)`
  on every registered `NotificationObserver`, regardless of concrete type.
- **Enum-driven behavior** — `TransactionType`, `CategoryType`, `RunwayStatus`,
  and `AllowanceSchedule` select behavior by type (e.g., runway calculation).
- **Why:** add new error types or notification channels without changing callers.

---

## 2. SOLID Principles

| Principle | Where in the code | How |
|---|---|---|
| **S**ingle Responsibility | `controller/`, `service/`, `repository/`, `mapper/` | Controllers handle HTTP only, services hold logic, repositories persist, mappers convert. Each has one reason to change. |
| **O**pen/Closed | `observer/NotificationObserver`, `exception/ApiException` | New observers or exception subtypes can be **added** without modifying existing classes. |
| **L**iskov Substitution | `ApiException` subtypes, `CustomUserDetails` | Any subtype is usable wherever the base type is expected (e.g., the single exception handler; Spring Security uses `CustomUserDetails` as a `UserDetails`). |
| **I**nterface Segregation | repository interfaces, `NotificationObserver` | Interfaces are small and focused (`NotificationObserver` has one method); no client depends on methods it doesn't use. |
| **D**ependency Inversion | every `@Service` | Services depend on repository **interfaces** (abstractions); Spring injects implementations via constructor injection (`@RequiredArgsConstructor`). |

---

## 3. GRASP Principles

| Pattern | Where | Why |
|---|---|---|
| **Controller** | `controller/AuthController`, `ExpenseController`, ... | First object beyond the UI to receive and coordinate a system event (an HTTP request). |
| **Creator** | `AuthService` (creates `User`), `ExpenseCategoryService` (creates default categories) | The creator holds/aggregates the created object's data. |
| **Information Expert** | `RunwayService`, `AnalyticsService`, `DashboardService` | Logic lives with the class that has the data needed to fulfil it (e.g., runway from expense history). |
| **Low Coupling / High Cohesion** | layered packages | Each package is focused; layers communicate through interfaces and DTOs. |
| **Indirection** | service layer + `mapper/` | Mediators decouple controllers from the persistence model. |
| **Protected Variations** | DTOs + repository interfaces | A stable interface shields the API and the database from each other's changes. |
| **Pure Fabrication** | `mapper/*Mapper`, `*Service` | Non-domain classes invented to keep cohesion high and coupling low. |
| **Polymorphism** | exception handler, observer | Type-based behavior instead of conditionals. |

---

## 4. Design Patterns

### Observer (GoF) — `observer/` package
- `NotificationObserver` (interface) → `InAppNotificationObserver` (concrete).
- `NotificationPublisher` keeps a `List<NotificationObserver>` and `publish()`
  fans an event out to all observers.
- `NotificationService` wires it up and raises events (budget warnings,
  subscription reminders, completed goals).
- **Benefit:** add email/SMS channels by writing a new observer — no change to
  the publisher (Open/Closed + Dependency Inversion).

### Repository — `repository/` package
- Spring Data JPA interfaces abstract all persistence. **Benefit:** no
  hand-written SQL, query-by-method-name, easy to mock in tests.

### Service Layer (Facade-like) — `service/` package
- Each service presents a simple API over one or more repositories
  (`DashboardService` composes expenses + budgets + runway). **Benefit:**
  controllers stay thin; logic is centralized and testable.

### DTO + Mapper — `dto/` + `mapper/`
- `UserMapper`, `ExpenseMapper`, `BudgetMapper`, etc. translate entities ↔ DTOs.
  **Benefit:** the API contract is decoupled from the schema; sensitive fields
  are never exposed.

### Builder — Lombok `@Builder`
- `User.builder()...build()`, `AuthResponse.builder()...`. **Benefit:** readable,
  safe construction of objects with many fields.

### Dependency Injection / IoC — Spring + `@RequiredArgsConstructor`
- Constructor injection everywhere. **Benefit:** low coupling, easy testing
  (see `DashboardServiceTest` injecting mocks).

### Strategy (via enum) — `RunwayService` + `AllowanceSchedule`
- Days-until-next-allowance is computed differently per schedule
  (WEEKLY / BIWEEKLY / MONTHLY). **Benefit:** swappable behavior by type.

---

## 5. Best Practices

- **DRY** — conversion centralized in mappers; shared frontend helpers in
  `frontend/src/lib/` (`formatPeso`, `categoryStyle`, motion variants).
- **KISS** — thin controllers; one clear responsibility per class.
- **YAGNI** — a layered monolith instead of premature microservices.
- **Clean Code & Naming** — intention-revealing names
  (`calculateDailySafeSpend`, `daysUntilNextAllowance`, `resolveCategory`).
- **Error Handling** — centralized `GlobalExceptionHandler`; no stack-trace leaks.
- **Validation** — Bean Validation on DTOs + Zod schemas on the frontend.

---

## 6. Rubric Self-Audit (Design & OOP — 40%)

| Item | Status | Evidence |
|---|---|---|
| Encapsulation | PASS | private entity state; `UserResponse` omits password |
| Abstraction | PASS | repository interfaces; service layer; `NotificationObserver` |
| Inheritance | PASS | `ApiException` hierarchy; filters extend `OncePerRequestFilter` |
| Polymorphism | PASS | one exception handler for all subtypes; observer fan-out |
| SOLID | PASS | table in §2, each principle mapped to code |
| GRASP | PASS | table in §3, each pattern mapped to code |
| Architecture & layering | PASS | controller/service/repository/dto/mapper separation |
| Clean code / DRY / KISS / YAGNI | PASS | mappers, thin controllers, monolith |
