# DevWork Tracker — Master Development Instructions

## 1. Project Overview
Build DevWork Tracker, a single-user work-tracking application that replaces three Excel workbooks:
- Daily Work Log
- Database Change Log
- Code File Change Log

## 2. Approved Technology Stack
- Frontend: React JS + Vite
- Backend: Java 25 + Spring Boot 4
- Build tool: Maven
- Database: PostgreSQL
- ORM: Spring Data JPA / Hibernate
- Database migrations: Flyway
- Authentication: Spring Security + JWT
- Excel generation: Apache POI
- API documentation: Swagger / OpenAPI

## 3. Architecture Rules
- Maintain separate frontend and backend applications.
- Follow feature-based package and folder organization.
- Keep controllers thin.
- Put business logic in service classes.
- Use repositories for standard database operations.
- Use DTOs for API requests and responses.
- Never expose JPA entities directly.
- Use centralized exception handling.
- Use database migrations through Flyway.
- Do not use Hibernate schema auto-update.

## 4. Business Rules
- The application supports one account only.
- Projects contain Task Items.
- Projects independently contain Pending Tasks.
- Each Work Log belongs to exactly one Task Item.
- Code Changes and DB Changes belong to a Work Log.
- Pending Tasks are independent of Task Items and Work Logs.
- Preserve historical records.
- Do not hard-delete main business records.
- Generate business codes through PostgreSQL sequences.

## 5. Development Rules
- Read the approved project documentation before implementation.
- Implement only the currently assigned feature.
- Inspect existing code before modifying files.
- Never rewrite working modules unnecessarily.
- Do not invent requirements.
- Do not introduce unapproved dependencies.
- Do not change approved database relationships or API contracts without approval.
- Follow existing naming conventions.
- Write meaningful tests.
- Run builds and tests after implementation.

## 6. Security Rules
- Use BCrypt for passwords.
- Use short-lived access JWTs and rotating refresh tokens.
- Store refresh tokens securely.
- Never expose secrets, tokens or passwords in logs.
- Enforce single-account registration restrictions on the backend.
- Validate account status on authenticated requests.
- Apply approved CSRF and CORS rules.

## 7. Frontend Rules
- Use React Query for server state.
- Use React Context for authentication.
- Use React Hook Form and Zod for forms.
- Keep API calls in service modules.
- Use reusable components.
- Maintain the approved design system.
- Handle loading, empty, error and success states.

## 8. Completion Requirements
For every assigned task:
1. Explain the implementation briefly.
2. List created and modified files.
3. Report database changes.
4. Report tests executed and their results.
5. Report unresolved issues.
6. Do not start another feature without approval.

## 9. Most Important Rule
The approved DevWork Tracker requirements and architecture documents are the source of truth.

If a requirement is unclear or contradictory, stop and ask before making assumptions.