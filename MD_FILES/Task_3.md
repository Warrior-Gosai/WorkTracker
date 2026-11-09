# Task 3 — Backend Foundation & Authentication

## Project Location
`E:\WorkTracker`

## Objective
Implement the backend foundation and complete single-user authentication using Spring Boot, Spring Security, JWT and refresh-token rotation.

Read the existing project documentation before implementation, especially:

- `docs/Master_instruction.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/architecture/01_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/02_DATABASE_DESIGN.md`
- `docs/architecture/03_SECURITY_DESIGN.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/development/CODING_STANDARDS.md`
- `docs/development/TESTING_STRATEGY.md`

Follow approved requirements and existing project conventions.

## 1. Database Restrictions

The PostgreSQL database will be created and configured manually by the user through pgAdmin.

- Do not connect to PostgreSQL during this task.
- Do not execute SQL scripts.
- Do not create, modify, or drop database objects.
- Do not create another migration.
- Do not change `V1__initial_schema.sql`.
- Do not change the reference SQL file.
- Do not use Hibernate schema generation or automatic updates.
- Keep `spring.jpa.hibernate.ddl-auto=validate`.
- Keep Flyway enabled.

The authentication implementation must match the existing `app_user` and `refresh_token` schema exactly.

If the migration schema is insufficient for any required authentication feature, stop and report the issue instead of silently changing the database design.

## 2. Backend Architecture

Establish the approved package structure under:

`backend/src/main/java/com/devworktracker/`

Use these common packages:

- common/config
- common/security
- common/exception
- common/response
- common/validation
- common/util
- common/service

Authentication packages:

- auth/controller
- auth/dto
- auth/service
- auth/dao
- auth/repository
- auth/entity
- auth/mapper

Use Spring Data repositories for standard database operations. Use DAO classes only where custom database operations are justified.

Keep controllers thin. Put business logic in services. Use DTOs instead of exposing JPA entities.

## 3. Dependencies

Review existing dependencies and add only what is needed:

- Spring Security
- Spring OAuth2 Resource Server / JOSE support for JWT
- Spring Data JPA (already added)
- Validation (already added)
- PostgreSQL (already added)
- Flyway (already added)
- Springdoc OpenAPI
- JUnit and Mockito (already available through test dependencies)

Keep all versions compatible with the existing Spring Boot 3.4.3 project.

Do not upgrade Spring Boot or Java during this task.

## 4. Authentication Features

### A. Setup Status

Implement:

`GET /api/v1/auth/setup-status`

- Public endpoint.
- Return only whether initial registration is required.
- Response: `{ "setupRequired": true }` or `{ "setupRequired": false }`.
- Do not expose account information.
- Handle concurrent first-registration attempts safely.

### B. Initial Registration

Implement:

`POST /api/v1/auth/register`

- Only allow registration when no account exists.
- Accept username, email, password and password confirmation.
- Validate required fields.
- Username/email uniqueness must be case-insensitive.
- Enforce maximum one account.
- Hash password with BCrypt.
- Never store or log plaintext passwords.
- Return an appropriate 201 response.
- Reject registration if an account already exists.

### C. Login

Implement:

`POST /api/v1/auth/login`

- Accept username OR email and password.
- Return a short-lived access JWT.
- Set refresh token in an HttpOnly cookie.
- Use generic invalid-credentials responses.
- Reject inactive accounts.

### D. Access JWT

- Default access-token lifetime: 15 minutes.
- Use a strong configurable signing secret.
- Validate signature, expiry and expected claims.
- Include the minimum required user identity claims.
- Never put passwords or refresh tokens in JWT claims.
- Validate account status on every authenticated API request.

### E. Refresh Tokens

- Use cryptographically secure random opaque tokens with at least 256 bits of entropy.
- Store SHA-256 hex digest in `refresh_token.token_hash`, never the raw token.
- Default refresh-token lifetime: 7 days.
- Use the existing token family and replacement fields.
- Rotate refresh tokens on every successful refresh.
- Perform rotation transactionally.
- Lock the old token row during rotation to prevent concurrent reuse.
- Detect reuse of revoked/replaced tokens and revoke the associated token family.
- Reject expired, revoked or invalid tokens.
- Do not create additional database tables.

### F. Refresh

Implement:

`POST /api/v1/auth/refresh`

- Read the refresh token from the HttpOnly cookie.
- Validate and rotate it.
- Return a new access JWT.
- Set the new refresh cookie.
- Do not return raw refresh tokens in JSON.

### G. Logout

Implement:

`POST /api/v1/auth/logout`

- Revoke the current refresh token.
- Clear the refresh cookie.
- Return 204 on success.
- Protect this endpoint using CSRF.

### H. Current User

Implement:

`GET /api/v1/auth/me`

- Require a valid access JWT.
- Return the current account's safe profile details.
- Never return password hashes or token data.

## 5. CSRF and Cookie Security

Use Spring Security's cookie-based CSRF protection suitable for a React SPA.

Implement:

`GET /api/v1/auth/csrf-token`

- Public endpoint.
- Ensure a CSRF token is generated and exposed to the frontend through the configured CSRF mechanism.
- Do not expose sensitive authentication data.

For refresh and logout:

- Require a valid CSRF token.
- Configure the frontend to send the CSRF header.
- Use HttpOnly refresh cookies.
- Use SameSite=Lax or stricter.
- Set Secure appropriately for the environment.
- Configure explicit trusted CORS origins.
- Do not allow wildcard origins with credentials.
- Ensure cookie path and clearing attributes match the original cookie.

Document the React integration requirements.

## 6. Account Status

- `status = 1`: active.
- `status = 0`: inactive.
- Inactive accounts cannot log in or refresh tokens.
- Revoke their active refresh tokens when account deactivation is detected.
- Reject authenticated API requests for inactive accounts.

## 7. Common API Responses

Use the approved response format.

Success:

- success
- message
- data
- timestamp

Error:

- success
- message
- data
- errors
- timestamp

Implement centralized exception handling and appropriate HTTP status codes.

Use validation responses with field-level errors.

## 8. Security Configuration

- Public routes: login, register, setup-status, CSRF-token, Swagger endpoints in local development.
- All other API routes require authentication.
- Stateless access-token authentication.
- No server-side HTTP session for authentication.
- No rate limiting.
- No password recovery.
- No email verification.
- No multi-user roles or permissions.
- No account deletion feature.
- No Redis or additional session tables.

## 9. Testing

Add meaningful tests for:

- Setup status with no account and with an existing account.
- Successful first registration.
- Rejection of second registration.
- Case-insensitive username/email uniqueness.
- BCrypt password hashing.
- Login with username.
- Login with email.
- Invalid credentials.
- Inactive account rejection.
- Access JWT validation and expiry.
- Refresh-token rotation.
- Expired/revoked refresh-token rejection.
- Refresh-token reuse detection and family revocation.
- Logout and cookie clearing.
- CSRF rejection when token is missing or invalid.
- CSRF success with a valid token.
- Protected endpoint access.
- Account status enforcement.

Use mocks or isolated test infrastructure. Do not require a live local PostgreSQL database for ordinary unit tests. If integration tests require PostgreSQL, clearly separate them and document how to run them.

## 10. Documentation

Update project status and relevant documentation with:

- Implemented authentication endpoints.
- Configuration variables.
- Cookie and CSRF behaviour.
- Token lifetimes.
- React integration instructions.
- How to run tests.
- Any limitations or unresolved issues.

Never commit actual credentials or signing secrets.

## 11. Git

Work on the existing `dev` branch.

Do not commit unfinished or failing work.

After implementation and successful tests:

- Review changed files.
- Run backend tests.
- Run formatting/compilation checks.
- Commit with message:

`feat: implement backend foundation and single-user authentication`

Ensure the working tree is clean.

## Restrictions

Do not implement Projects, Task Items, Work Logs, Pending Tasks, Code Changes, DB Changes, Dashboard or Excel features in this task.

Do not modify frontend files.

Do not modify the database migration or schema.

Stop after completing authentication and report the results.