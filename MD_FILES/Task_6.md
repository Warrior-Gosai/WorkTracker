# Task 6 — Task Item Management Module

## Project Location
`E:\WorkTracker`

## Objective

Implement the complete Task Item Management module in the existing DevWork Tracker application.

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

Inspect the existing Project Management implementation and follow its architecture, API response format, frontend conventions and testing patterns.

Do not redesign previously approved functionality.

---

## 1. Database Restrictions

The user will create the PostgreSQL database and execute the Flyway migration manually through pgAdmin.

- Do not execute SQL scripts.
- Do not create, modify or drop database objects.
- Do not modify `V1__initial_schema.sql`.
- Do not modify the reference SQL file.
- Do not add a migration unless a genuine schema requirement is discovered. If one is needed, stop and explain it first.
- Use the existing `task_item` table.
- Use the existing `seq_task_item_code` sequence.
- Use `spring.jpa.hibernate.ddl-auto=validate`.

If the database is unavailable, implement against the approved schema and use mocks or isolated tests. Clearly report that live database integration remains unverified.

## 2. Task Item Database Mapping

Map the existing `task_item` table exactly.

Expected fields:

- `task_item_id`: BIGINT primary key, identity.
- `task_item_code`: VARCHAR(30), unique, required.
- `project_id`: BIGINT, required FK to `project`.
- `task_type`: VARCHAR(40), required.
- `title`: VARCHAR(200), required.
- `description`: TEXT, optional.
- `priority`: VARCHAR(20), default MEDIUM.
- `status`: VARCHAR(20), default OPEN.
- `is_active`: SMALLINT, default 1, CHECK 0/1.
- `completed_at`: TIMESTAMPTZ, nullable.
- `remarks`: TEXT, optional.
- `created_at`: TIMESTAMPTZ, required.
- `updated_at`: TIMESTAMPTZ, required.

Do not add:

- user_id
- start_date
- end_date
- unnecessary columns
- hard-delete flags

Use appropriate JPA mapping for PostgreSQL types.

Use the existing shared timestamp trigger for `updated_at`.

## 3. Task Item Code Generation

Generate task item codes in the backend using:

`seq_task_item_code`

Format:

`TASK-000001`

Requirements:

- Use PostgreSQL `nextval`.
- Never use `MAX(task_item_id) + 1`.
- Never generate codes in React.
- Sequence gaps are acceptable.
- Ensure creation is transactional.

## 4. Task Type Values

Use exactly these values:

- FEATURE_DEVELOPMENT
- NEW_DEVELOPMENT
- BUG_FIX
- ISSUE_DEFECT
- ENHANCEMENT
- TECHNICAL_IMPROVEMENT
- MAINTENANCE
- RESEARCH_INVESTIGATION
- OTHER

Display user-friendly labels in the frontend while preserving the exact backend values.

## 5. Priority Values

Use exactly:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Default: `MEDIUM`.

## 6. Workflow Status Values

Use exactly:

- OPEN
- IN_PROGRESS
- ON_HOLD
- COMPLETED
- CANCELLED

Default: `OPEN`.

Task Item status is independent of Work Log status.

A Task Item can have multiple Work Logs with different statuses. Do not automatically change Task Item status when a Work Log is created or updated.

### Completion Timestamp Rules

Implement the following service logic:

- When status changes to COMPLETED, set `completed_at` to the current timestamp.
- When status changes from COMPLETED to another status, clear `completed_at`.
- When status remains COMPLETED, preserve its existing `completed_at`.
- Do not allow the frontend to submit `completed_at` directly.

## 7. Active / Inactive Rules

`is_active`:

- `1` = Active
- `0` = Inactive

This is separate from workflow status.

Examples:

- An OPEN Task Item can be inactive.
- A COMPLETED Task Item can remain active.
- An IN_PROGRESS Task Item can be inactive.

Requirements:

- Newly created Task Items must be active.
- Provide a Deactivate action for active Task Items.
- Do not provide a Reactivate action.
- Reactivation will be performed directly in the database by changing `is_active` from 0 to 1.
- Do not provide hard deletion.
- Inactive Task Items must not appear in normal Task Item listings, search results or new-entry dropdowns.
- Do not expose a normal UI filter or toggle that makes inactive Task Items visible again.

### Historical Data Protection

Deactivating a Task Item must not modify or delete:

- Existing Work Logs.
- Existing Code Changes.
- Existing DB Changes.
- Any historical relationships or records.

Existing Work Logs must retain their Task Item foreign-key reference.

Do not block historical records or exports because their Task Item is inactive.

Do not delete or modify historical data during deactivation.

## 8. Project Relationship

Relationship:

`Project 1 → Many Task Items`

Requirements:

- Every Task Item must belong to exactly one Project.
- Project must be selected when creating a Task Item.
- Use the existing Project API to retrieve active Projects only.
- The existing Project listing supports `status=1`; use it for the active Project dropdown.
- Do not add a duplicate Project API unless genuinely necessary.
- Validate on the backend that a selected Project exists and is active when creating a Task Item.
- An inactive Project cannot be selected for new Task Items.
- Existing Task Items must remain untouched if their Project later becomes inactive.
- Project association is immutable after Task Item creation. Do not allow changing `project_id` during updates.

## 9. Backend Architecture

Implement under:

`com.devworktracker.taskitem`

Follow the existing package structure:

- entity
- repository
- dto
- mapper
- service
- controller

Responsibilities:

- Controller: HTTP handling only.
- Service: business rules and transactions.
- Repository: database queries.
- DTO: request and response contracts.
- Mapper: entity-to-response mapping.

Do not expose JPA entities directly.

Use Bean Validation and centralized exception handling.

## 10. Backend APIs

Implement the following endpoints.

### A. Create Task Item

`POST /api/v1/task-items`

Request fields:

- projectId (required)
- taskType (required)
- title (required)
- description (optional)
- priority (optional; default MEDIUM)
- status (optional; default OPEN)
- remarks (optional)

Behaviour:

- Validate the Project exists and is active.
- Generate Task Item code using the database sequence.
- Set `is_active = 1`.
- Set `completed_at` according to the initial status.
- Generate timestamps.
- Return HTTP 201.

### B. List Task Items

`GET /api/v1/task-items`

Support:

- search by Task Item title or code
- projectId
- taskType
- priority
- workflow status
- page
- size
- sortBy
- direction

Requirements:

- Return active Task Items only.
- Never include inactive Task Items in normal listings.
- Use database pagination.
- Default page = 0.
- Default size = 10.
- Maximum size = 100.
- Default sorting = createdAt descending.
- Validate sorting against an allowlist.
- Support filtering by multiple criteria.

### C. Task Item Details

`GET /api/v1/task-items/{taskItemId}`

Return Task Item details for an active Task Item.

Return 404 when the Task Item does not exist or is inactive.

### D. Update Task Item

`PUT /api/v1/task-items/{taskItemId}`

Allow editing:

- taskType
- title
- description
- priority
- remarks

Do not allow editing:

- taskItemId
- taskItemCode
- projectId
- is_active
- completed_at
- created_at
- updated_at

Inactive Task Items must not be editable through the normal UI/API.

### E. Update Workflow Status

`PATCH /api/v1/task-items/{taskItemId}/status`

Allow updating only the workflow status.

Apply the completion timestamp rules defined above.

Return the updated Task Item response.

### F. Deactivate Task Item

`PATCH /api/v1/task-items/{taskItemId}/deactivate`

Behaviour:

- Set `is_active = 0`.
- Do not delete the Task Item.
- Do not modify related Work Logs, Code Changes or DB Changes.
- Return a successful response.
- Prevent repeated or invalid deactivation from producing inconsistent data.

Do not implement a Reactivate endpoint.

### G. Task Item History

`GET /api/v1/task-items/{taskItemId}/history`

Return historical information associated with the Task Item.

Include:

- Work Logs associated with this Task Item.
- Code Changes associated through those Work Logs.
- DB Changes associated through those Work Logs.

Use the existing relationships:

`Task Item → Work Logs → Code Changes`

`Task Item → Work Logs → DB Changes`

Requirements:

- Do not create duplicate history records.
- Do not add direct foreign keys between Task Item and Code Change or DB Change.
- Provide useful identifiers, dates, status and summaries.
- Keep history read-only in this task.
- Do not implement editing or deletion of historical records here.
- Ensure historical relationships remain accessible even if the Task Item is inactive, through the appropriate historical Work Log views and APIs.

If a separate history response requires a large dataset, use pagination rather than loading unlimited records.

## 11. Frontend Implementation

Implement under:

`frontend/src/features/task-items/`

Use the existing:

- React
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- Lucide React
- React Toastify

### A. Task Item Listing

Route:

`/task-items`

Display:

- Task Item Code
- Title
- Project
- Task Type
- Priority
- Workflow Status
- Created At
- Actions

Features:

- Search by title or Task Item code.
- Project filter using active Projects.
- Task Type filter.
- Priority filter.
- Workflow Status filter.
- Pagination.
- Page-size selection.
- Sorting.
- Create Task Item action.
- View details.
- Edit.
- Update status.
- Deactivate.

Only active Task Items should appear.

Do not add an inactive Task Item filter.

### B. Create Task Item

Provide a form with:

- Project (required dropdown containing active Projects only)
- Task Type (required dropdown)
- Title (required)
- Description (optional)
- Priority (default MEDIUM)
- Workflow Status (default OPEN)
- Remarks (optional)

Do not expose:

- Task Item code input.
- Active/inactive input.
- Completion timestamp input.
- Project status modification.

### C. Edit Task Item

Allow editing:

- Task Type
- Title
- Description
- Priority
- Remarks

Project must be displayed as read-only.

Do not allow editing inactive Task Items.

### D. Task Item Details

Route:

`/task-items/:taskItemId`

Display:

- Task Item code
- Title
- Project
- Task Type
- Priority
- Workflow Status
- Description
- Remarks
- Created At
- Updated At
- Completed At, when applicable

Include actions for editing, changing workflow status and deactivating.

### E. Task Item History

Within the Task Item details page, provide a history section or tab showing:

- Related Work Logs
- Related Code Changes
- Related DB Changes

Display available dates, identifiers and useful summaries.

For now, history is read-only. Do not implement Work Log creation or editing from this history section.

## 12. UI and UX Rules

Follow the existing application design system.

- Primary: #2563EB
- Background: #F8FAFC
- White cards
- Main text: #0F172A
- Secondary text: #64748B
- Border: #E2E8F0
- Inter font

Use consistent:

- Loading states.
- Empty states.
- Error states.
- Success notifications.
- Form validation.
- Confirmation before deactivation.

Use readable status and priority badges.

Keep the interface responsive.

Do not add unnecessary charts or dashboard widgets.

## 13. State Management and API Integration

Use TanStack Query for server state.

Create:

- Task Item API service.
- Task Item query hooks.
- Create/update/status/deactivation mutation hooks.
- History query hook.

Requirements:

- Invalidate relevant queries after successful mutations.
- Debounce search.
- Keep pagination and filters predictable.
- Use the existing Axios API client and authentication handling.
- Use the existing common API response format.
- Do not duplicate API logic inside components.

## 14. Testing

### Backend Tests

Cover:

- Task Item creation.
- Sequence-based code generation.
- Correct code format.
- Required field validation.
- Task Type validation.
- Priority validation.
- Workflow Status validation.
- Default priority and status.
- Active Project validation.
- Rejection of inactive Project during creation.
- Listing and search.
- Filtering by Project, Type, Priority and Status.
- Pagination and sorting.
- Inactive Task Items excluded from listing.
- Task Item details.
- Inactive Task Item detail rejection.
- Task Item updates.
- Project association immutability.
- Workflow status changes.
- Completion timestamp set/preserve/clear rules.
- Deactivation.
- Historical data preservation.
- History retrieval and relationship correctness.

### Frontend Tests

Cover:

- Listing and rendering.
- Search and filters.
- Pagination.
- Create form validation.
- Active Project dropdown.
- Task Type, Priority and Status options.
- Successful creation.
- Edit form population.
- Project read-only behaviour.
- Workflow status updates.
- Deactivation confirmation.
- Inactive Task Item exclusion.
- History rendering.
- Loading, empty and error states.

Run existing Project Management and Authentication tests as regression checks.

## 15. Documentation

Update:

- `docs/00_PROJECT_STATUS.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/requirements/03_SCREEN_FUNCTIONALITY.md` where necessary

Document actual implementation.

Keep phase/task naming consistent with the existing project status document. Do not introduce a conflicting phase numbering system.

## 16. Git and Completion

- Work on `dev`.
- Run backend tests.
- Run frontend tests.
- Run frontend production build.
- Review all changed files.
- Check for accidental changes to authentication or Project Management.
- Commit only after successful checks.

Commit message:

`feat: implement task item management module`

Ensure the working tree is clean.

## Restrictions

Do not implement:

- Work Log module.
- Pending Task module.
- Code Change module.
- DB Change module.
- Dashboard data APIs.
- Excel exports.
- Reactivation UI or API.
- Hard deletion.
- Project reassignment for existing Task Items.
- Unapproved database schema changes.

Stop after Task Item Management is implemented and provide a detailed completion report, including test results, Git commit, and any outstanding integration limitations.