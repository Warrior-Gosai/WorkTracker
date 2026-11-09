# DevWork Tracker — Coding Standards

## 1. Purpose

This document defines coding conventions and quality standards for DevWork Tracker.

Objectives:

- Maintain readable and maintainable code.
- Keep frontend and backend responsibilities separated.
- Avoid unnecessary complexity.
- Ensure consistent naming and project structure.
- Improve testability and debugging.
- Maintain reliable database operations.
- Make future changes easier.

These standards apply to all development tasks.

## 2. General Principles

Follow these principles:

1. Keep code simple and understandable.
2. Follow Single Responsibility Principle.
3. Avoid unnecessary duplication.
4. Prefer reusable components and services when appropriate.
5. Keep business logic out of UI components and controllers.
6. Validate input at application boundaries.
7. Handle errors consistently.
8. Use meaningful names.
9. Avoid hardcoded configuration.
10. Do not introduce dependencies without a clear reason.
11. Do not implement unapproved features.
12. Do not refactor unrelated code during a small feature task.

Prefer maintainable solutions over clever or unnecessarily abstract implementations.

## 3. Backend Coding Standards

### 3.1 Java Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Package | lowercase | `com.devworktracker.worklog` |
| Class | PascalCase | `WorkLogService` |
| Interface | PascalCase | `WorkLogRepository` |
| Method | camelCase | `createWorkLog()` |
| Variable | camelCase | `workLogId` |
| Constant | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Enum | PascalCase | `WorkLogStatus` |
| Enum value | UPPER_SNAKE_CASE | `IN_PROGRESS` |

Use descriptive names.

Avoid unclear abbreviations such as `wl`, `obj`, `temp`, or `data` when a meaningful name is possible.

### 3.2 Package Structure

Follow feature-based organization:

```text
com.devworktracker/
├── common/
│   ├── config/
│   ├── security/
│   ├── exception/
│   ├── response/
│   ├── validation/
│   └── util/
│
├── auth/
├── project/
├── taskitem/
├── worklog/
├── pendingtask/
├── codechange/
├── dbchange/
├── dashboard/
├── report/
└── excel/
```

Each feature should contain only the required layers:

- controller
- dto
- service
- repository
- entity
- mapper

Do not create empty packages or unnecessary classes.

### 3.3 Layer Responsibilities

**Controller**
- Accept HTTP requests.
- Validate request DTOs.
- Call service methods.
- Return appropriate HTTP responses.
- Must not contain business logic.

**Service**
- Implement business rules.
- Coordinate repository operations.
- Manage transactions.
- Handle entity relationships.
- Calculate derived values.

**Repository**
- Handle database access.
- Use Spring Data JPA for standard operations.
- Use custom queries when required.
- Avoid unnecessary database calls.

**Entity**
- Represent database tables.
- Define relationships and persistence mappings.
- Avoid exposing entities directly through APIs.

**DTO**
- Define request and response structures.
- Do not expose internal entity implementation details.

**Mapper**
- Convert entities to DTOs and DTOs to entities where appropriate.
- Avoid putting business decisions inside simple mapping logic.

### 3.4 Controller Standards

- Use `@RestController`.
- Use appropriate HTTP method mappings.
- Use `@Valid` for request validation.
- Keep methods small.
- Return the agreed common API response format.
- Use appropriate HTTP status codes.
- Never return JPA entities directly.

Example method naming:

```java
createProject()
getAllProjects()
getProjectById()
updateProject()
```

### 3.5 Service Standards

- Use constructor injection.
- Prefer `@RequiredArgsConstructor` where Lombok is approved and configured.
- Use `@Transactional` for operations that require transaction boundaries.
- Use `@Transactional(readOnly = true)` for read-only service operations where appropriate.
- Keep business validation in the service layer.
- Avoid large methods.
- Extract meaningful private methods when logic becomes difficult to follow.

Do not use field injection.

### 3.6 Repository Standards

- Extend appropriate Spring Data repository interfaces.
- Use derived query methods for simple queries.
- Use JPQL or native SQL only when justified.
- Use pagination for potentially large result sets.
- Avoid fetching unnecessary related entities.
- Check for N+1 query problems.

### 3.7 DTO Standards

Use descriptive DTO names:

```text
CreateProjectRequest
UpdateProjectRequest
ProjectResponse
ProjectSummaryResponse
```

Rules:
- Request DTOs and response DTOs should be separate where their responsibilities differ.
- Validate user input using Jakarta Bean Validation.
- Never include password hashes or refresh-token hashes in API responses.
- Do not expose internal database implementation details.

### 3.8 Exception Handling

Use centralized exception handling with `@RestControllerAdvice`.

Handle:
- Validation errors.
- Resource not found.
- Duplicate values.
- Business rule violations.
- Authentication failures.
- Authorization failures.
- Unexpected server errors.

Rules:
- Return the agreed API error structure.
- Use meaningful, user-safe messages.
- Do not expose stack traces, SQL statements or internal implementation details.
- Log unexpected errors with sufficient diagnostic context.
- Do not silently swallow exceptions.

### 3.9 Validation

Use:
- Bean Validation for request-level validation.
- Service-level validation for business rules.
- Database constraints for data integrity.

Do not rely only on frontend validation.

Examples:
- Required Work Log Task Requirement.
- Valid Work Log Status.
- Both start and end times must be supplied together or both cleared.
- A committed Code Change requires an SVN Commit ID.
- Project and Task Item relationships must be valid.

### 3.10 Transaction Management

- Use transactions for multi-step database modifications.
- Ensure related changes succeed or roll back together.
- Keep transactions as short as practical.
- Do not perform unnecessary external operations inside database transactions.
- Pay special attention to refresh-token rotation and concurrent requests.

## 4. Frontend Coding Standards

### 4.1 React Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component | PascalCase | `WorkLogForm.jsx` |
| Page | PascalCase | `WorkLogListPage.jsx` |
| Hook | camelCase with use | `useWorkLogs.js` |
| Service | camelCase | `workLogService.js` |
| Utility | camelCase | `formatDate.js` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Variable | camelCase | `selectedProject` |

Use `.jsx` for React components and `.js` for regular JavaScript modules.

### 4.2 Feature-Based Structure

Follow:

```text
frontend/src/
├── components/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── projects/
│   ├── task-items/
│   ├── work-logs/
│   ├── pending-tasks/
│   ├── code-changes/
│   ├── db-changes/
│   ├── dashboard/
│   └── reports/
│
├── hooks/
├── context/
├── services/
├── routes/
├── utils/
├── constants/
└── schemas/
```

Keep feature-specific components, hooks, API services and validation schemas inside their feature folders where practical.

### 4.3 Component Standards

- Use functional components.
- Prefer small, reusable components.
- Keep components focused on one responsibility.
- Avoid deeply nested conditional rendering.
- Avoid very large page components.
- Extract reusable UI elements when genuinely useful.
- Use props for component communication.
- Avoid unnecessary global state.

### 4.4 State Management

Use the approved state-management approach:

| State Type | Solution |
|---|---|
| Server data | TanStack Query |
| Authentication state | React Context |
| Form state | React Hook Form |
| Form validation | Zod |
| Small UI state | useState |
| Shared UI state | Context when needed |

Rules:
- Do not introduce Redux initially.
- Do not duplicate server state unnecessarily.
- Invalidate relevant queries after successful mutations.
- Clear authenticated user data and cached protected data on logout.

### 4.5 API Integration

- Keep API calls inside service modules.
- Use a centralized Axios instance.
- Configure the API base URL through environment variables.
- Handle authentication refresh consistently.
- Avoid direct API calls inside reusable UI components.
- Handle loading, error and success states.
- Debounce search inputs where appropriate.
- Use backend pagination and filtering.

### 4.6 Forms

Use React Hook Form and Zod.

Rules:
- Display clear validation messages.
- Disable submission while a request is being processed.
- Prevent accidental duplicate submissions.
- Show meaningful server-side validation errors.
- Preserve user input when a recoverable request fails.
- Use reusable form controls where appropriate.

### 4.7 UI Standards

- Follow the approved design system.
- Maintain consistent spacing, typography and colors.
- Use consistent button and form styles.
- Show loading indicators for asynchronous operations.
- Show empty states when there are no records.
- Confirm destructive or important actions.
- Keep forms easy to complete.
- Maintain responsive behaviour for desktop, tablet and mobile.

## 5. PostgreSQL and SQL Standards

### 5.1 Naming Conventions

Use lowercase snake_case.

Examples:

```sql
project
task_item
work_log
pending_task
code_change
db_change
created_at
updated_at
```

Rules:
- Table names use singular nouns.
- Column names use snake_case.
- Primary keys use `<entity>_id`.
- Foreign keys use the referenced entity's ID name.
- Indexes use `idx_<table>_<columns>`.
- Constraints use meaningful names.

### 5.2 SQL Standards

- Prefer explicit column lists.
- Avoid `SELECT *` in application queries.
- Use parameterized queries.
- Use database pagination.
- Avoid unnecessary subqueries and joins.
- Review query execution plans for expensive queries.
- Use appropriate data types.
- Avoid storing calculated values when they can reliably be derived.
- Do not construct SQL using untrusted input.

### 5.3 Database Integrity

Use database constraints for:
- Primary keys.
- Foreign keys.
- Unique values.
- Required fields.
- Valid status values.
- Valid relationships.
- Other important data-integrity rules.

Application validation and database constraints should complement each other.

### 5.4 Schema Changes

- Use Flyway versioned migrations.
- Never modify an already-applied migration in a shared environment.
- Create a new migration for subsequent schema changes.
- Review migration scripts before execution.
- Test migrations against a clean database.
- Avoid Hibernate automatic schema updates.

## 6. API Standards

Follow the API Specification.

Rules:
- Use `/api/v1/` versioned endpoints.
- Use plural resource names.
- Use appropriate HTTP methods.
- Return consistent success and error structures.
- Use correct HTTP status codes.
- Validate pagination and sorting parameters.
- Allowlist sortable fields.
- Do not expose entity structures.
- Keep request and response naming consistent.

Do not introduce new response formats for individual features without approval.

## 7. Security Standards

- Hash passwords using BCrypt.
- Store refresh-token digests, not raw refresh tokens.
- Never log passwords, JWTs or refresh tokens.
- Never return password hashes.
- Validate authentication and account status.
- Enforce the single-account registration rule on the backend.
- Protect refresh and logout cookie operations against CSRF.
- Use explicit CORS origins.
- Keep secrets outside Git.
- Validate all incoming user input.
- Do not rely on frontend route protection as backend authorization.

Follow the Security Design document for complete authentication behaviour.

## 8. Logging Standards

Use the standard Spring Boot logging system.

Log:
- Important application events.
- Unexpected exceptions.
- Relevant operational failures.
- Useful diagnostic information.

Do not log:
- Passwords.
- Raw access tokens.
- Raw refresh tokens.
- JWT secrets.
- Sensitive authentication cookies.
- Entire request bodies without a justified need.

Use appropriate log levels:
- ERROR: unexpected failures.
- WARN: recoverable or suspicious situations.
- INFO: important application events.
- DEBUG: development diagnostics.

Avoid excessive logging inside frequently executed methods.

## 9. Testing Standards

### Backend

Use:
- JUnit.
- Mockito.
- Spring Boot Test.
- Integration tests where appropriate.

Test:
- Service business rules.
- Controller validation and HTTP responses.
- Repository queries.
- Database relationships.
- Authentication and refresh-token lifecycle.
- Error handling.
- Excel export behaviour.

### Frontend

Test:
- Important component behaviour.
- Form validation.
- User interactions.
- Loading and error states.
- API integration behaviour.
- Authentication navigation.

### General Rules

- Write tests for new business functionality.
- Fix relevant existing test failures.
- Do not remove or weaken tests just to make a build pass.
- Test both successful and failure scenarios.
- Avoid tests that depend on execution order.
- Use realistic test data.

## 10. Code Quality and Formatting

- Keep indentation consistent.
- Remove unused imports and variables.
- Avoid dead code.
- Avoid commented-out old implementations.
- Add comments when they explain non-obvious decisions.
- Do not comment every obvious line.
- Use meaningful constants instead of repeated magic values.
- Keep methods and classes reasonably focused.
- Prefer readable code over compressed code.

## 11. Dependency Management

- Use stable, compatible library versions.
- Avoid duplicate dependencies.
- Do not add a library for functionality already available in the current stack.
- Keep frontend and backend dependencies documented.
- Review security and compatibility before adding or upgrading dependencies.
- Avoid major-version upgrades during unrelated feature work.

## 12. Coding Agent Rules

The coding agent must:

1. Read the relevant project documentation before implementation.
2. Follow the existing repository structure.
3. Implement only the assigned task.
4. Avoid unrelated refactoring.
5. Reuse existing utilities and components where appropriate.
6. Follow all approved business rules.
7. Add or update tests.
8. Run relevant tests and builds.
9. Fix issues introduced by its changes.
10. Report changed files and important implementation decisions.
11. Report tests executed and their results.
12. Mention unresolved issues honestly.

If a requirement is ambiguous or conflicts with an approved document, stop and ask for clarification instead of silently choosing a behaviour.

Do not invent additional product features.

## 13. Code Review Checklist

Before accepting a task, review:

- [ ] Does the implementation match the approved requirement?
- [ ] Is the correct architecture followed?
- [ ] Are naming conventions consistent?
- [ ] Is business logic in the correct layer?
- [ ] Is input validation implemented?
- [ ] Are database constraints respected?
- [ ] Are errors handled consistently?
- [ ] Are security requirements respected?
- [ ] Are unnecessary dependencies avoided?
- [ ] Are tests included and passing?
- [ ] Are unrelated files unchanged?
- [ ] Is the implementation understandable and maintainable?
- [ ] Is the agent's completion report accurate?

## 14. Source of Truth

Follow these documents together:

- Product Requirements.
- Business Rules.
- Database Design.
- System Architecture.
- Security Design.
- API Specification.
- Screen Functionality.
- Excel Import/Export Specification.
- Development Setup.

If documents conflict, do not guess. Report the conflict and obtain approval before implementation.