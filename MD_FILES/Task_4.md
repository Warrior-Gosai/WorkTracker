# Task 4 — Frontend Foundation & Authentication

## Project Location
`E:\WorkTracker`

## Objective
Build the frontend foundation for DevWork Tracker using React JS + Vite and implement the complete authentication experience.

Before implementation, read:

- `docs/Master_instruction.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/requirements/01_PRODUCT_REQUIREMENTS.md`
- `docs/requirements/03_SCREEN_FUNCTIONALITY.md`
- `docs/architecture/01_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/03_SECURITY_DESIGN.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/development/CODING_STANDARDS.md`

Also inspect the actual backend authentication implementation and endpoint DTOs. Do not assume that the API payloads match the documentation if the code differs.

## 1. Technology Stack

Use the approved frontend stack:

- React JS
- Vite
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- React Toastify
- Lucide React

Use compatible package versions. Do not upgrade the existing Node.js or Vite version unnecessarily.

## 2. Frontend Architecture

Organize the existing `frontend/src` directory using the approved structure:

```text
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   └── feedback/
├── features/
│   └── auth/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── hooks/
│       └── schemas/
├── context/
├── hooks/
├── services/
│   ├── api/
│   └── query/
├── routes/
├── utils/
├── constants/
├── App.jsx
└── main.jsx
```

Keep the structure practical. Do not create unnecessary empty files or abstraction layers.

## 3. Axios API Client

Create a centralized Axios instance.

Requirements:

- Base URL from environment variable `VITE_API_BASE_URL`.
- Default local API URL: `http://localhost:8080/api/v1`.
- `withCredentials: true` for refresh-token cookies.
- Configure JSON headers.
- Add access JWT to protected API requests using the Authorization Bearer header.
- Keep the access JWT in memory, not localStorage or sessionStorage.
- Handle API error responses consistently.
- Do not hardcode production URLs.

## 4. Authentication Context

Implement a central authentication context/provider.

It should manage:

- Current user profile.
- In-memory access JWT.
- Authentication loading state.
- Authenticated/unauthenticated state.
- Login.
- Logout.
- Initial session restoration.
- Access-token refresh.
- Current-user retrieval.

Do not store access JWT or refresh token in browser localStorage/sessionStorage.

The refresh token must remain in the backend-managed HttpOnly cookie.

## 5. Authentication API Integration

Connect to the actual backend endpoints:

- `GET /auth/setup-status`
- `GET /auth/csrf-token`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Match exact request/response formats from backend DTOs.

### Initial application startup

1. Check setup status.
2. If registration is required, redirect to `/setup`.
3. Otherwise, initialize CSRF protection.
4. Attempt refresh using the existing HttpOnly cookie.
5. If refresh succeeds, retrieve the current user.
6. If refresh fails, display the login page.
7. Never expose refresh-token values to JavaScript.

Handle concurrent API requests safely so multiple expired-token responses do not trigger multiple simultaneous refresh operations.

If refresh fails, clear the in-memory access token and user state and redirect to login.

## 6. CSRF Integration

Inspect the actual backend `SecurityConfig.java` and `CsrfCookieFilter.java`.

Implement the correct CSRF flow for Spring Security's configured token repository and request handler.

- Obtain the CSRF token from the backend.
- Send the expected token header on refresh and logout.
- Preserve cookie credentials.
- Ensure login and registration follow the backend's actual CSRF rules.
- Do not bypass CSRF checks.
- Reacquire the CSRF token when required after authentication state changes.

Do not assume that simply reading `XSRF-TOKEN` always returns the plain token; account for Spring Security's configured token representation.

## 7. Login Page

Route:

`/login`

Features:

- Username or email field.
- Password field.
- Show/hide password.
- Submit button.
- Client-side validation.
- Loading state.
- Generic authentication error message.
- Responsive design.

Do not add forgot-password functionality.

## 8. Initial Registration Page

Route:

`/setup`

This route must not appear in the normal navigation or login-page links.

Features:

- Username.
- Email.
- Password.
- Confirm password.
- Show/hide password.
- Validation.
- Registration submission.
- Loading and error states.

After successful registration, redirect to login unless the actual backend explicitly establishes an authenticated session.

The backend must remain responsible for enforcing the single-account restriction.

## 9. Protected Routes

Implement route guards.

- `/login` is for unauthenticated users.
- `/setup` is available only when initial registration is required.
- All application routes require authentication.
- Authenticated users visiting `/login` should be redirected to `/dashboard`.
- While authentication state is loading, display a loading screen instead of flashing the login page.
- Unauthenticated users accessing protected pages should be redirected to `/login`.

## 10. Authenticated Application Layout

Create the initial reusable layout:

- Sidebar.
- Top navigation bar.
- Main content area.
- Current username/profile display.
- Logout action.

For this task, add only a placeholder dashboard page.

The sidebar can display the approved future module names, but only the dashboard route needs to work.

Do not implement business module screens yet.

## 11. Visual Design

Follow the approved DevWork Tracker design:

- Clean, modern SaaS interface.
- Light theme by default.
- Primary: `#2563EB`.
- Background: `#F8FAFC`.
- Cards: white.
- Main text: `#0F172A`.
- Secondary text: `#64748B`.
- Borders: `#E2E8F0`.
- Success: `#16A34A`.
- Warning: `#D97706`.
- Danger: `#DC2626`.
- Font: Inter.

Ensure responsive layout for desktop, tablet and mobile.

Avoid unnecessary animations and visual clutter.

## 12. Environment Configuration

Create:

- `frontend/.env.example`

Include:

`VITE_API_BASE_URL=http://localhost:8080/api/v1`

Ensure real environment files are ignored by Git.

## 13. Testing & Verification

Verify:

1. Frontend production build succeeds.
2. Login form validation works.
3. Setup form validation works.
4. Setup-status routing works.
5. Authenticated and unauthenticated route guards work.
6. Access token stays in memory.
7. Refresh cookie is never accessed by JavaScript.
8. Axios sends credentials.
9. CSRF header is sent correctly.
10. Concurrent refresh requests are coordinated.
11. Logout clears frontend authentication state.
12. Expired refresh tokens redirect to login.
13. Backend and frontend API paths match.

Use unit tests where practical. Do not claim live end-to-end authentication has succeeded unless the PostgreSQL database is available and the actual backend can be tested against it.

## 14. Documentation & Git

Update relevant setup and project-status documentation.

Work on the existing `dev` branch.

After implementation:

- Run frontend tests, if configured.
- Run `npm run build`.
- Review changed files.
- Commit only after successful checks.

Commit message:

`feat: implement frontend foundation and authentication`

Ensure the working tree is clean.

## Restrictions

- Do not implement Projects, Task Items, Work Logs, Pending Tasks, Code Changes, DB Changes, Dashboard data APIs or Excel exports.
- Do not modify backend authentication logic unless a frontend integration blocker is discovered. If a backend change is necessary, explain it and report the exact change.
- Do not modify PostgreSQL migrations or schema.
- Do not introduce Redux, Redis or unnecessary dependencies.

Stop after completing this task and provide a detailed completion report.