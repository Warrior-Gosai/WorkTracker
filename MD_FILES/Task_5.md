# Task 5 — Project Management Module

## Project Location
`E:\WorkTracker`

## Objective
Implement the complete Project Management module in the existing DevWork Tracker application.

Work on the existing `dev` Git branch.

Before coding, read:

- `docs/Master_instruction.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/requirements/01_PRODUCT_REQUIREMENTS.md`
- `docs/requirements/02_BUSINESS_RULES.md`
- `docs/requirements/03_SCREEN_FUNCTIONALITY.md`
- `docs/architecture/01_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/02_DATABASE_DESIGN.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/development/CODING_STANDARDS.md`
- `docs/development/TESTING_STRATEGY.md`

Inspect the existing backend, frontend and authentication implementation before making changes.

Follow the approved database schema and business rules.

## 1. Database Restrictions

The user will create the PostgreSQL database and execute the Flyway migration manually through pgAdmin.

- Do not execute SQL scripts.
- Do not create, modify or drop database objects.
- Do not modify `V1__initial_schema.sql`.
- Do not modify the reference SQL file.
- Do not add a migration unless a genuine schema requirement is discovered. If one is needed, stop and explain it first.
- Use the existing `project` table.
- Use the existing `seq_project_code` sequence.
- Use `spring.jpa.hibernate.ddl-auto=validate`.

If the database is unavailable, implement against the approved schema and use mocks or isolated tests. Clearly report that live database integration remains unverified.

## 2. Project Database Mapping

Map the existing `project` table exactly.

Expected fields:

- `project_id`: BIGINT primary key, identity.
- `project_code`: VARCHAR(30), unique, required.
- `project_name`: VARCHAR(150), required.
- `description`: TEXT, optional.
- `status`: SMALLINT, default 1, CHECK 0/1.
- `remarks`: TEXT, optional.
- `created_at`: TIMESTAMPTZ, required.
- `updated_at`: TIMESTAMPTZ, required.

Do not add:

- start date
- end date
- user_id
- deletion flags
- unnecessary columns

Use the existing shared timestamp trigger for `updated_at`. Do not implement competing timestamp logic in the database.

Use appropriate JPA mapping for PostgreSQL types.

## 3. Project Code Generation

Generate project codes in the backend using:

`seq_project_code`

Format:

`PRJ-000001`

Requirements:

- Use PostgreSQL `nextval`.
- Never use `MAX(project_id) + 1`.
- Never generate the project code in React.
- Sequence gaps are acceptable.
- Ensure project creation is transactional.

## 4. Backend Architecture

Implement under the existing package structure:

`com.devworktracker.project`

Use:

- controller
- dto
- service
- repository
- entity
- mapper

Responsibilities:

- Controller: HTTP requests and responses.
- Service: business logic and transactions.
- Repository: database operations.
- DTO: request and response contracts.
- Mapper: entity-to-response mapping.

Do not expose JPA entities directly.

## 5. APIs

Implement these endpoints:

### Create Project

`POST /api/v1/projects`

Request:

- projectName (required)
- description (optional)
- remarks (optional)

Behaviour:

- Generate project code automatically.
- Set status to 1 (Active).
- Generate timestamps.
- Return HTTP 201.

### List Projects

`GET /api/v1/projects`

Support:

- search by project name or project code
- status filter (optional)
- page
- size
- sortBy
- direction

Defaults:

- page = 0
- size = 10
- maximum size = 100
- default sort = createdAt descending

Requirements:

- Use database pagination.
- Allowlist sortable fields.
- Support active and inactive projects.
- Do not silently exclude inactive projects from the general Project Management listing.

### Project Details

`GET /api/v1/projects/{projectId}`

Return the project details.

Return 404 if not found.

### Update Project

`PUT /api/v1/projects/{projectId}`

Allow editing:

- projectName
- description
- remarks

Do not allow updating:

- projectCode
- projectId
- status through this endpoint
- createdAt
- updatedAt

Inactive projects must remain editable.

No delete endpoint.

No activate/deactivate endpoint.

## 6. Response Format

Use the existing common API response format.

Success:

- success
- message
- data
- timestamp

Error:

- success
- message
- errors
- timestamp

Use appropriate HTTP codes:

- 200
- 201
- 400
- 401
- 403
- 404
- 409
- 500

Use centralized exception handling.

## 7. Frontend Project Management

Implement under:

`frontend/src/features/projects/`

Use the existing React, React Router, Axios, React Hook Form, Zod, TanStack Query, Tailwind and Lucide setup.

### A. Project Listing Page

Route:

`/projects`

Display:

- Project Code
- Project Name
- Status
- Created At
- Last Updated At
- Actions

Features:

- Search by project name or project code.
- Active/Inactive status filter.
- Pagination.
- Page-size selection.
- Sorting.
- Create Project action.
- Edit Project action.
- View Project details.

Both active and inactive projects must be accessible on this screen.

### B. Create Project

Provide a form with:

- Project Name (required)
- Description (optional)
- Remarks (optional)

Do not ask for project code or status.

### C. Edit Project

Allow editing:

- Project Name
- Description
- Remarks

Display project code and status as read-only information.

Inactive projects must be editable.

Do not provide status toggles.

### D. Project Details

Route:

`/projects/:projectId`

Display:

- Project code
- Project name
- Description
- Status
- Remarks
- Created At
- Last Updated At

Include an Edit action.

Do not implement unrelated project history or task summaries in this task.

## 8. UI Requirements

Follow the approved design system:

- Primary: #2563EB
- Background: #F8FAFC
- White cards
- Main text: #0F172A
- Secondary text: #64748B
- Border: #E2E8F0
- Inter font

Use consistent loading, empty, error and success states.

Use confirmation only where an actual destructive action exists. Since project deletion and status toggles are not supported, do not add such confirmations or controls.

Keep the UI responsive.

## 9. Query and State Management

Use TanStack Query for server state.

- Create a project service.
- Use query hooks for listing and details.
- Use mutation hooks for create and update.
- Invalidate relevant project queries after successful changes.
- Debounce search input.
- Keep filters and pagination predictable.
- Do not duplicate server state in Context.

## 10. Testing

### Backend

Test:

- Project creation.
- Automatic project-code formatting.
- Project name validation.
- Project listing.
- Search by name and code.
- Status filtering.
- Pagination.
- Sorting allowlist.
- Project details.
- 404 for missing project.
- Project update.
- Editing inactive projects.
- No status modification through update.
- No deletion operation.

### Frontend

Test:

- Listing and rendering.
- Search and filters.
- Pagination.
- Create form validation.
- Successful creation.
- Edit form population.
- Successful update.
- Inactive project display.
- Loading, empty and error states.

Run existing authentication tests as regression checks.

## 11. Documentation

Update:

- Project status.
- API documentation.
- Relevant screen functionality documentation.
- Development notes if needed.

Document actual implementation, not planned functionality.

## 12. Git

Run backend tests and frontend tests/build.

Review all changed files.

Commit only after successful checks.

Commit message:

`feat: implement project management module`

Ensure the working tree is clean.

## Restrictions

- Do not implement Task Items.
- Do not implement Work Logs.
- Do not implement Pending Tasks.
- Do not implement Code Changes or DB Changes.
- Do not implement Dashboard data APIs.
- Do not implement Excel exports.
- Do not modify authentication behaviour.
- Do not add project deletion or status-toggle functionality.
- Do not modify database schema.

Stop after completing Project Management and provide a detailed completion report.