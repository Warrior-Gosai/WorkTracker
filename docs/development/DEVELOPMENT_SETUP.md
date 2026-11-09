# DevWork Tracker — Development Setup

## 1. Purpose

This document defines the local development environment and setup procedure for DevWork Tracker.

The objective is to allow a developer or coding agent to:

1. Prepare the development machine.
2. Create the repository structure.
3. Configure the frontend and backend.
4. Configure PostgreSQL.
5. Run the frontend and backend locally.
6. Verify that the initial applications start successfully.

This setup phase must not implement business features.

## 2. Technology Stack

| Area | Technology |
|---|---|
| Frontend | React JS |
| Frontend Build Tool | Vite |
| Frontend Runtime | Node.js |
| Backend | Java + Spring Boot |
| Backend Build Tool | Maven Wrapper |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Database Migration | Flyway |
| API Style | REST |
| API Documentation | Swagger / OpenAPI |
| Excel Processing | Apache POI |
| Version Control | Git |
| Optional Local Database Setup | Docker |

### 2.1 Proposed Version Baseline

The following versions are proposed starting points, not permanently fixed dependencies:

| Technology | Proposed Version |
|---|---|
| Java | 25 LTS |
| Spring Boot | 4.1.x |
| Maven Wrapper | 3.9.x |
| Node.js | 24 LTS |
| React | Latest compatible stable version |
| Vite | Latest compatible stable version |
| PostgreSQL | 17.x |

Before project initialization, verify the latest stable versions and compatibility between Java, Spring Boot, Maven, Node.js and dependencies.

Record the exact selected versions in the project README and build files.

Do not upgrade major versions automatically during feature development.

## 3. Prerequisites

Install the following tools:

### Required

- Git
- Java JDK
- Node.js and npm
- PostgreSQL
- IDE such as IntelliJ IDEA or VS Code
- API testing tool such as Postman

### Optional

- Docker Desktop
- Database client such as DBeaver or pgAdmin
- Browser developer tools

Verify installations:

```bash
git --version
java -version
node --version
npm --version
```

Verify PostgreSQL using:

```bash
psql --version
```

Maven will be managed through Maven Wrapper. A separate global Maven installation is not required.

## 4. Repository Structure

Use a single Git repository for the entire application.

```text
devwork-tracker/
│
├── frontend/
│
├── backend/
│
├── database/
│   ├── README.md
│   └── reference/
│
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── api/
│   ├── development/
│   └── excel/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Directory Responsibilities

| Directory | Responsibility |
|---|---|
| frontend | React application |
| backend | Spring Boot application |
| database | Database setup instructions and reference materials |
| docs | Project requirements and technical documentation |
| docker-compose.yml | Optional local infrastructure configuration |
| .gitignore | Files excluded from Git |
| README.md | Project overview and setup instructions |

### Backend Migration Location

Flyway migration scripts must be stored inside the backend application:

```text
backend/
└── src/
    └── main/
        └── resources/
            └── db/
                └── migration/
                    └── V1__initial_schema.sql
```

Do not maintain a separate executable database schema that conflicts with Flyway migrations.

The `database/reference/` directory may contain reference SQL or documentation, but the backend Flyway migration history is the authoritative schema deployment mechanism.

## 5. Frontend Setup

### 5.1 Initialize React + Vite

Create the React application inside:

```text
devwork-tracker/frontend/
```

Use JavaScript rather than TypeScript for the initial implementation.

Install the approved frontend dependencies:

- React
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- Recharts
- React Toastify
- Lucide React

Do not install unnecessary libraries without a clear requirement.

### 5.2 Frontend Environment Files

Create:

```text
frontend/
├── .env.example
├── .env.local
└── ...
```

Example `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Rules:
- Only frontend variables intended to be exposed to the browser may use the `VITE_` prefix.
- Never put database passwords, JWT secrets or private credentials in frontend environment variables.
- `.env.local` must be excluded from Git.
- `.env.example` must contain placeholders or safe local defaults only.

### 5.3 Frontend Startup

```bash
cd frontend
npm install
npm run dev
```

Expected local URL:

```text
http://localhost:5173
```

The actual port should be confirmed from Vite's startup output.

## 6. Backend Setup

### 6.1 Initialize Spring Boot

Create the Spring Boot application inside:

```text
devwork-tracker/backend/
```

Use Maven Wrapper.

Include the dependencies approved in the System Architecture document:

- Spring Boot Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- OAuth2 Resource Server / JWT support
- Validation
- Flyway
- Apache POI (`poi-ooxml`)
- Springdoc OpenAPI
- Spring Boot Test

Add additional dependencies only when needed and justified.

### 6.2 Maven Wrapper

The backend must contain:

```text
backend/
├── mvnw
├── mvnw.cmd
└── .mvn/
```

Use the wrapper for all Maven commands.

Windows:

```bash
mvnw.cmd clean
mvnw.cmd test
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw clean
./mvnw test
./mvnw spring-boot:run
```

### 6.3 Backend Configuration

Use Spring profiles:

- `local`
- `uat`
- `live`

Configuration files:

```text
backend/src/main/resources/
├── application.yml
├── application-local.yml
├── application-uat.yml
└── application-live.yml
```

Keep shared non-sensitive configuration in `application.yml`.

Environment-specific configuration belongs in the corresponding profile.

### 6.4 Backend Environment Variables

Use environment variables for database credentials and security secrets.

Expected variables include:

```env
DB_URL=jdbc:postgresql://localhost:5432/devwork_tracker
DB_USERNAME=your_local_username
DB_PASSWORD=your_local_password

JWT_SECRET=your_local_development_secret
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

FRONTEND_ORIGIN=http://localhost:5173
```

These are configuration examples, not actual credentials.

Rules:
- Never commit real credentials or JWT secrets.
- Do not expose backend secrets to React.
- `.env.example` may contain placeholders.
- Spring Boot must receive variables through the operating system, IDE run configuration or another explicitly configured environment-variable loader.
- Do not assume Spring Boot automatically loads `.env` files.
- Use `local` as the active profile for local development.

### 6.5 Backend Startup

Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
cd backend
./mvnw spring-boot:run
```

Expected local backend URL:

```text
http://localhost:8080
```

## 7. PostgreSQL Setup

### 7.1 Create Local Database

Create a PostgreSQL database named:

```sql
CREATE DATABASE devwork_tracker;
```

Configure the backend connection using the database environment variables.

### 7.2 Database Migration

Flyway is responsible for creating and updating the application schema.

Initial migration location:

```text
backend/src/main/resources/db/migration/V1__initial_schema.sql
```

Rules:
- Use versioned Flyway migrations.
- Do not manually maintain production schema changes outside migrations.
- Do not use Hibernate `ddl-auto=update`.
- Configure Hibernate with `ddl-auto=validate`.
- Verify migration success before testing application features.

The initial schema migration must be reviewed and tested against a clean PostgreSQL database before feature implementation.

### 7.3 Optional Docker Setup

Docker Compose may be used to run local PostgreSQL.

It must:
- Start PostgreSQL with a persistent local volume.
- Expose the configured local database port.
- Use configurable credentials.
- Avoid committing actual production credentials.
- Not be required when PostgreSQL is already installed locally.

Docker is optional, not a mandatory application dependency.

## 8. CORS and Local Connectivity

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8080
```

Configure backend CORS to allow the explicitly configured frontend origin.

Rules:
- Do not use wildcard origins with credentials.
- Enable credentials only for trusted configured origins.
- Allow only the required HTTP methods and headers.
- Keep local, UAT and live origins separate.
- Verify browser requests and cookie behaviour during authentication implementation.

## 9. Git Setup

Initialize one Git repository at:

```text
devwork-tracker/
```

Recommended initial branch:

```text
main
```

Create feature branches for development tasks when needed.

The repository must include:
- Frontend source code.
- Backend source code.
- Database migration scripts.
- Approved project documentation.
- README and setup instructions.

Exclude:
- `node_modules/`
- `dist/`
- `target/`
- `.env`
- `.env.local`
- IDE-specific temporary files.
- Logs.
- Generated temporary exports.
- Local database files and volumes.
- Actual credentials and secrets.

Commit `.env.example`, never actual local environment files.

## 10. Initial Startup Verification

After setup, verify the following:

### Frontend
- React + Vite application starts.
- Browser can open the frontend.
- No startup or compilation errors.
- Frontend environment configuration is loaded.

### Backend
- Spring Boot application starts.
- Maven Wrapper works.
- Spring profiles load correctly.
- PostgreSQL connection succeeds.
- Flyway runs successfully.
- Hibernate schema validation succeeds.
- Swagger/OpenAPI is available in local development.

### Connectivity
- Frontend can make a basic request to the backend.
- CORS configuration permits the configured local origin.
- No database or JWT secrets are exposed in frontend files.

### Git
- Repository is initialized.
- `.gitignore` works.
- Environment files are not staged.
- Initial project structure is committed.

## 11. Initial Setup Task Boundaries

The first development task is limited to:

1. Create the repository structure.
2. Initialize Git.
3. Initialize React + Vite.
4. Initialize Spring Boot.
5. Configure Maven Wrapper.
6. Configure basic environment files.
7. Configure PostgreSQL connectivity.
8. Configure Flyway migration infrastructure.
9. Add project README.
10. Verify frontend and backend startup.

Do not implement:
- Authentication screens or business authentication logic.
- Project management.
- Task Items.
- Work Logs.
- Pending Tasks.
- Code Change Logs.
- Database Change Logs.
- Dashboard.
- Excel export.
- Business APIs.

Those features will be implemented in separate approved development tasks.

## 12. Completion Criteria

The setup task is complete only when:

- [ ] Repository structure matches the approved design.
- [ ] Git repository is initialized.
- [ ] React + Vite starts successfully.
- [ ] Spring Boot starts successfully.
- [ ] Maven Wrapper works.
- [ ] PostgreSQL connection succeeds.
- [ ] Flyway migration infrastructure is configured.
- [ ] Hibernate schema validation is configured.
- [ ] Environment configuration is separated.
- [ ] No actual secrets are committed.
- [ ] Frontend-to-backend connectivity is verified.
- [ ] README contains setup and startup instructions.
- [ ] No business functionality has been implemented.

## 13. Source of Truth

This document defines local development setup.

For implementation:
- System Architecture defines component responsibilities.
- Database Design defines the database schema.
- Security Design defines authentication and security behaviour.
- API Specification defines endpoint contracts.
- Product Requirements and Business Rules define application behaviour.
- Excel Import/Export Specification defines workbook generation.