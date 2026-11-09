# DevWork Tracker — Security Design Specification

## 1. Security Overview

DevWork Tracker is a single-user application.

The initial security implementation must provide:
- Username/email and password authentication.
- BCrypt password hashing.
- JWT access-token authentication.
- Refresh-token rotation.
- Secure refresh-token storage.
- Single-account registration enforcement.
- Account activation/deactivation checks.
- CSRF protection for cookie-authenticated operations.
- Restricted CORS configuration.
- Input validation and centralized error handling.

Multi-user authorization, roles and permissions are outside the initial scope.

## 2. Authentication Architecture

Technology:
- Spring Security.
- JWT access tokens.
- Opaque refresh tokens.
- BCrypt password hashing.
- PostgreSQL token storage.

Authentication endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/v1/auth/register | Initial account registration |
| POST | /api/v1/auth/login | Authenticate |
| POST | /api/v1/auth/refresh | Rotate refresh token |
| POST | /api/v1/auth/logout | Revoke refresh token |
| GET | /api/v1/auth/me | Get authenticated account |

All endpoints must follow the approved API response specification.

## 3. Single-Account Registration

Registration is available only during initial application setup.

Rules:
- Registration route: `/setup`.
- Do not show a registration link on the login screen.
- Do not include registration in normal application navigation.
- Registration is permitted only when no account exists.
- Only one account may ever be created through the initial setup workflow.
- Once an account exists, registration must be disabled.
- Backend enforcement is mandatory.
- Concurrent registration requests must not create multiple accounts.

The database must also enforce the single-account restriction.

No public account creation, invitation or multi-user registration functionality is required.

## 4. Password Security

Password hashing:
- Use BCrypt.
- Never store plaintext passwords.
- Never log passwords.
- Never return password hashes through APIs.

Password validation:
- Minimum: 8 characters.
- Maximum: 72 UTF-8 bytes.
- No mandatory uppercase, lowercase, number or special-character combinations.
- Confirm password during initial registration.

Password changes and recovery are deferred.

## 5. Access JWT Design

Access tokens are short-lived signed JWTs.

Recommended default expiration:
- 15 minutes.

Configuration must allow the expiration duration to be changed without modifying business logic.

Token contents should be limited to necessary claims, such as:
- Subject: account identifier.
- Issued-at timestamp.
- Expiration timestamp.
- JWT ID.
- Issuer, where configured.

Do not put passwords, refresh tokens or unnecessary personal information in JWT claims.

Signing:
- Use a strong cryptographically generated signing secret for the initial HS256 implementation.
- Never hardcode a real signing secret in source code.
- Keep the signing configuration outside Git.

If asymmetric signing becomes necessary later, evaluate it as a separate architectural change.

## 6. Refresh Token Design

Refresh tokens are opaque random tokens, not JWTs.

Generation:
- At least 256 bits of cryptographic randomness.
- Generate a new token during each successful rotation.
- Never reuse a previous refresh token.

Storage:
- Store SHA-256 hexadecimal digest in `refresh_token.token_hash`.
- Store only the digest, never the raw token.
- The database column is CHAR(64).

Recommended default expiration:
- 7 days.

The duration must be configurable.

### 6.1 Refresh Rotation

When a refresh request arrives:

1. Read the refresh token from the configured cookie.
2. Calculate its SHA-256 digest.
3. Find the matching database record.
4. Lock the record during processing.
5. Validate token existence, expiry and revocation state.
6. Validate account status.
7. Generate a replacement refresh token.
8. Store the replacement token hash.
9. Revoke the old token.
10. Link the old token to its replacement.
11. Return a new access JWT.
12. Set the replacement refresh token cookie.

The operation must execute transactionally.

### 6.2 Refresh Token Reuse Detection

If a previously rotated or revoked token is presented again:
- Treat it as possible token reuse.
- Revoke the associated token family.
- Require the user to authenticate again.

Handle concurrent refresh attempts carefully so that rotation and reuse detection cannot silently leave an invalid token family active.

### 6.3 Logout

Logout must:
- Revoke the current refresh token.
- Clear the refresh-token cookie.
- Return the approved successful logout response.

Access JWTs are short-lived. Without an access-token denylist, an already issued access JWT may remain usable until it expires. This limitation is accepted initially.

Inactive account checks must still block authenticated requests immediately.

## 7. Cookie Security

The refresh token must be stored in an HttpOnly cookie.

Required attributes:
- HttpOnly: true.
- Secure: enabled for deployed HTTPS environments.
- SameSite: Lax or stricter, according to the deployment requirements.
- Path: restricted to the authentication endpoints where practical.
- Max-Age / Expires: consistent with refresh-token expiry.

The raw refresh token must not be stored in:
- Local Storage.
- Session Storage.
- Frontend application state.
- Logs.
- API response JSON.

The access token should be kept in frontend memory.

Cookie settings must be configurable for local and deployed environments.

## 8. CSRF Protection

Cookie-authenticated operations require CSRF protection.

At minimum, protect:
- Refresh token endpoint.
- Logout endpoint.

Use Spring Security CSRF support with a token mechanism suitable for the frontend/backend deployment arrangement.

The frontend must send the CSRF token in the expected request header.

SameSite cookie settings are an additional defence, not a replacement for CSRF protection.

Validate allowed origins for cookie-authenticated operations.

## 9. CORS Configuration

CORS must use explicitly configured trusted frontend origins.

Rules:
- Do not use wildcard origins with credentials.
- Allow only the required HTTP methods.
- Allow only required request headers.
- Enable credentials only for trusted origins.
- Configure origins separately for local, UAT and production.
- Do not accept arbitrary origins.

Local development frontend:
`http://localhost:5173`

Backend:
`http://localhost:8080`

The local origin is for development only.

## 10. Account Status Enforcement

The account status field uses:
- 1 = Active.
- 0 = Inactive.

When an account becomes inactive:
- Login must be rejected.
- Refresh must be rejected.
- Active refresh tokens must be revoked.
- Every authenticated API request must check account status.
- The user must not continue using the application through an already issued access token.

Account deactivation is a database-level operation initially; no account-management UI is required.

## 11. Authorization

The initial application has one account.

Therefore:
- No roles.
- No permissions.
- No organization membership.
- No team access.
- No resource ownership model.
- No user_id column in business tables.

All authenticated application endpoints require a valid active account.

Public endpoints are limited to the initial setup and authentication flows as appropriate.

## 12. Input Validation

Validate input at both frontend and backend levels.

Backend validation is authoritative.

Requirements:
- Use Jakarta Bean Validation.
- Reject invalid enum values.
- Reject blank required fields.
- Validate IDs and relationships.
- Validate pagination limits.
- Allowlist sorting fields.
- Validate date and time combinations.
- Prevent invalid state transitions.
- Do not trust frontend-only validation.

Use parameterized queries and safe JPA query construction.

## 13. Error and Logging Security

- Never expose stack traces to API clients.
- Never log passwords.
- Never log raw access or refresh tokens.
- Never log cookie contents.
- Avoid logging signing secrets or database credentials.
- Return generic authentication errors where detailed messages could reveal sensitive information.
- Keep application logs useful for debugging without exposing secrets.

## 14. Secret and Configuration Handling

- Do not commit actual database credentials.
- Do not commit actual JWT signing secrets.
- Use environment variables or external configuration for real credentials.
- Keep `.env` files out of Git.
- Provide placeholder values only in `.env.example`.
- Keep local development settings separate from UAT and production.

## 15. Security Testing

The implementation must test:

### Registration
- Registration succeeds when no account exists.
- Registration fails after account creation.
- Concurrent requests cannot create multiple accounts.

### Login
- Correct credentials succeed.
- Incorrect credentials fail.
- Username and email login both work.
- Inactive account login fails.

### Access JWT
- Valid token succeeds.
- Expired token fails.
- Invalid signature fails.
- Inactive account is rejected even with an otherwise valid token.

### Refresh Token
- Valid refresh succeeds.
- Rotation invalidates the old token.
- Expired token fails.
- Revoked token fails.
- Reuse triggers token-family revocation.
- Inactive account cannot refresh.

### Logout
- Refresh token is revoked.
- Cookie is cleared.
- Reuse of the revoked token fails.

### CSRF and CORS
- Missing or invalid CSRF token is rejected on protected cookie-authenticated operations.
- Untrusted origins are rejected.
- Trusted frontend origins can make credentialed requests.

## 16. Excluded Security Features

Not included initially:
- Multi-factor authentication.
- Password recovery.
- Email verification.
- Login-history tables.
- Device-management UI.
- Role-based access control.
- Rate limiting.
- Access-token denylist.
- Multiple account support.

These features require separate approval before implementation.