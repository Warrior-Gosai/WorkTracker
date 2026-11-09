# DevWork Tracker — System Architecture

## 1. Architecture Overview

DevWork Tracker uses a frontend-backend separated architecture.

Frontend:
- React JS
- Vite
- React Router
- Axios
- TanStack Query

Backend:
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Flyway
- Apache POI

Database:
- PostgreSQL
- Compatible with Neon and Supabase PostgreSQL.

Communication:
- REST APIs.
- JSON request and response payloads.
- HTTP locally and HTTPS in deployed environments as previously approved for the respective environment.

## 2. Architectural Principles

- Separation of concerns.
- Feature-based organization.
- Thin controllers.
- Business logic in service classes.
- DTO-based API communication.
- Centralized exception handling.
- Transactional business operations.
- Database migrations managed by Flyway.
- No unnecessary architectural layers.
- No direct frontend database access.
- No JPA entity exposure through APIs.

## 3. Frontend Responsibilities

React is responsible for:
- Rendering application screens.
- Handling user input.
- Form validation.
- Displaying server responses.
- Navigation.
- Search, filtering and pagination controls.
- Authentication state.
- Export download initiation.

React must not implement authoritative business rules.

## 4. Frontend Libraries

- React Router: routing.
- Axios: HTTP communication.
- TanStack Query: server-state management.
- React Context: authentication and small global UI state.
- React Hook Form: form management.
- Zod: frontend validation.
- Tailwind CSS: styling.
- Recharts: dashboard charts.
- Lucide React: icons.
- React Toastify: notifications.

Avoid Redux initially.

## 5. Backend Responsibilities

Spring Boot is responsible for:
- Authentication.
- Authorization and account-status checks.
- Request validation.
- Business rules.
- Transaction management.
- Database operations.
- Business code generation.
- Duration calculation.
- Dashboard aggregation.
- Excel generation.
- Consistent error responses.

## 6. Backend Layer Responsibilities

### Controller
- Receive HTTP requests.
- Validate request DTOs.
- Invoke services.
- Return appropriate HTTP responses.

### Service
- Implement business rules.
- Manage transactions.
- Validate relationships and record states.
- Coordinate repository operations.
- Prepare response data.

### Repository
- Provide Spring Data database operations.
- Support filtering, pagination and sorting.
- Use custom queries when necessary.

### Entity
- Map Java objects to database tables.
- Define persistence relationships.

### DTO
- Define API request and response contracts.
- Prevent direct exposure of database entities.

### Mapper
- Convert between entities and DTOs.

DAO layers should only be introduced for justified custom database-access requirements.

## 7. Database Architecture

PostgreSQL is the only database required by the initial application.

The application must remain compatible with standard PostgreSQL features available on Neon and Supabase.

Flyway owns database schema creation and changes.

Hibernate must use:
`spring.jpa.hibernate.ddl-auto=validate`

The database contains nine approved tables as documented in the Database Design Specification.

## 8. Request Lifecycle

1. User interacts with a React screen.
2. Feature API service sends a request using Axios.
3. Spring Security validates authentication.
4. Controller receives the request.
5. Service applies business rules and transactions.
6. Repository communicates with PostgreSQL.
7. Service prepares response data.
8. Controller returns a DTO.
9. React Query updates the frontend.

## 9. Authentication Architecture

- Username/email and password login.
- BCrypt password hashing.
- Short-lived access JWT.
- Opaque refresh token with at least 256 bits of randomness.
- SHA-256 refresh-token hash storage.
- Refresh-token rotation.
- HttpOnly refresh-token cookie.
- Access token kept in frontend memory.
- CSRF protection for cookie-authenticated operations.
- Restricted CORS.
- Immediate account-status enforcement.

See Security Design for detailed rules.

## 10. Excel Architecture

Apache POI generates all three Excel workbooks.

The implementation must:
- Use the original XLSX templates.
- Preserve column order and sheet structure.
- Preserve relevant formatting and formulas.
- Populate derived fields correctly.
- Aggregate multiple file details for Code Change exports.
- Support individual workbook downloads.
- Support combined ZIP downloads.

## 11. Dashboard Architecture

Dashboard data must be calculated from existing business tables.

Use database aggregation and efficient queries.

Do not introduce separate dashboard persistence tables.

## 12. Environment Configuration

Local:
- React: localhost:5173
- Spring Boot: localhost:8080
- PostgreSQL: localhost:5432

UAT and Production:
- Separate frontend and backend deployments.
- PostgreSQL through Neon or Supabase.
- Environment-specific configuration.
- Credentials supplied outside source control.

## 13. Error Handling

- Centralized Spring exception handling.
- Standard API error response.
- Appropriate HTTP status codes.
- No database stack traces exposed to clients.
- No sensitive information in logs.

## 14. Testing Architecture

- JUnit for backend tests.
- Mockito for service unit tests.
- Spring integration tests.
- PostgreSQL integration tests.
- Frontend component and form tests.
- API contract and workflow tests.

## 15. Excluded Architecture

Do not introduce initially:
- Microservices.
- Redis.
- WebSockets.
- Message brokers.
- Multi-user authorization.
- Separate dashboard database.
- Direct browser-to-database communication.
- SVN integration.
- Google Drive integration.

## 16. Source of Truth

The approved Product Requirements, Business Rules, Database Design, Security Design and API Specification documents take precedence over agent assumptions.