# Task 7 — Work Log Management Module

## Project Location
`E:\WorkTracker`

## Objective

Implement the complete Work Log Management module in the existing DevWork Tracker application.

Work on the existing `dev` Git branch.

This module replaces the user's existing Daily Work Log Excel workbook.

Before implementation, read:

- `docs/Master_instruction.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/requirements/01_PRODUCT_REQUIREMENTS.md`
- `docs/requirements/02_BUSINESS_RULES.md`
- `docs/requirements/03_SCREEN_FUNCTIONALITY.md`
- `docs/architecture/01_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/02_DATABASE_DESIGN.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/excel/EXCEL_IMPORT_EXPORT_SPECIFICATION.md`
- `docs/development/CODING_STANDARDS.md`
- `docs/development/TESTING_STRATEGY.md`

Inspect the existing Project Management, Task Item Management, Authentication and shared frontend/backend implementations before coding.

Follow existing architectural conventions. Do not redesign previously approved functionality.

---

## 1. Database Restrictions

The user will create the PostgreSQL database and execute the Flyway migration manually through pgAdmin.

- Do not execute SQL scripts.
- Do not create, modify or drop database objects.
- Do not modify `V1__initial_schema.sql`.
- Do not modify the reference SQL file.
- Do not add a migration unless a genuine schema requirement is discovered. If one is required, stop and explain it first.
- Use the existing `work_log` table.
- Use the existing `seq_work_log_code` sequence.
- Use `spring.jpa.hibernate.ddl-auto=validate`.

If the database is unavailable, implement against the approved schema and use mocks or isolated tests. Clearly report that live database integration remains unverified.

## 2. Work Log Database Mapping

Map the existing `work_log` table exactly.

Expected fields:

- `work_log_id`: BIGINT primary key, identity.
- `work_log_code`: VARCHAR(30), unique, required.
- `task_item_id`: BIGINT, required FK to `task_item`.
- `work_date`: DATE, default current date.
- `environment`: VARCHAR(20), required, default LOCAL.
- `work_type`: VARCHAR(40), required.
- `task_requirement`: TEXT, required.
- `work_description`: TEXT, optional.
- `purpose_reason`: TEXT, optional.
- `technology_area`: VARCHAR(200), optional.
- `start_time`: TIME, optional.
- `end_time`: TIME, optional.
- `status`: VARCHAR(30), required, default IN_PROGRESS.
- `problem_blocker`: TEXT, optional.
- `solution_resolution`: TEXT, optional.
- `testing_verification`: TEXT, optional.
- `result_outcome`: TEXT, optional.
- `pending_next_action`: TEXT, optional.
- `notes_remarks`: TEXT, optional.
- `created_at`: TIMESTAMPTZ, required.
- `updated_at`: TIMESTAMPTZ, required.

Do not add:

- project_id
- user_id
- total_hours
- day
- code_change_id
- db_change_id
- unnecessary columns

Project must be derived through Task Item → Project.

Day must be derived from work_date.

Code Change and DB Change identifiers must be derived through their relationships in future modules.

Use appropriate JPA mappings for PostgreSQL DATE, TIME and TIMESTAMPTZ.

Use the existing shared timestamp trigger for updated_at.

## 3. Work Log Code Generation

Generate codes in the backend using:

`seq_work_log_code`

Format:

`WL-000001`

Requirements:

- Use PostgreSQL `nextval`.
- Never use `MAX(work_log_id) + 1`.
- Never generate codes in React.
- Sequence gaps are acceptable.
- Creation must be transactional.

## 4. Task Item Relationship

Relationship:

`Task Item 1 → Many Work Logs`

Requirements:

- Every Work Log belongs to exactly one Task Item.
- A Task Item can have multiple Work Logs.
- Multiple Work Logs can be created on the same date.
- A Work Log must not be associated with multiple Task Items.
- Project is derived automatically from the selected Task Item.
- Do not allow project selection independently in the Work Log form.
- Task Item association is immutable after Work Log creation.

### Task Item Selection Rules

For new Work Log creation:

- Show active Task Items only.
- Do not show inactive Task Items.
- Show useful Task Item identifiers and Project information in the dropdown.
- Validate that the selected Task Item exists and is active on the backend.
- An inactive Task Item must not be accepted for new Work Logs.

For editing existing Work Logs:

- Preserve the original Task Item association.
- Do not require the associated Task Item to still be active.
- Existing Work Logs must remain accessible and editable even if their Task Item was subsequently deactivated.
- Do not change historical relationships.

Reuse existing Task Item APIs where possible. Do not duplicate their functionality.

## 5. Work Type Values

Use exactly:

- DEVELOPMENT
- BUG_FIXING
- TESTING
- DEBUGGING
- INVESTIGATION
- ENHANCEMENT
- DOCUMENTATION
- DEPLOYMENT
- MAINTENANCE
- OTHER

Display friendly labels in React while sending exact enum values to the backend.

## 6. Environment Values

Use exactly:

- LOCAL
- UAT
- LIVE

Default:

`LOCAL`

A Work Log has exactly one primary environment.

Do not add multiple environments to a single Work Log.

Code Changes and DB Changes will have their own environment fields in their respective future modules.

## 7. Work Log Status

Use exactly:

- COMPLETED
- IN_PROGRESS
- BLOCKED
- ON_HOLD

Default:

`IN_PROGRESS`

Status is mandatory and cannot be NULL.

Important:

- Work Log status is independent of Task Item workflow status.
- Creating a COMPLETED Work Log must not automatically complete its Task Item.
- Updating a Work Log status must not automatically update its Task Item.
- Do not automatically infer status from start/end times.

## 8. Date and Time Rules

### Work Date

- Default to the current date.
- User can select another date.
- Support historical and future dates unless existing validation rules specify otherwise.
- Display dates consistently using the application's Asia/Kolkata timezone conventions.

### Start Time

Frontend default:

`09:00 AM`

### End Time

Frontend initial value:

Empty.

Both fields are optional at the database level.

Validation:

- Both times NULL is valid.
- Both times populated is valid.
- Only start time populated is invalid.
- Only end time populated is invalid.
- Users must be able to clear both fields together.
- Do not silently save only one populated time.

### Duration Calculation

Calculate total hours in the backend.

Rules:

1. Both times NULL → totalHours is null.
2. Both times populated → calculate duration.
3. End time later than start time → normal duration.
4. End time earlier than start time → treat as an overnight work period.
5. Start and end times identical → zero hours.

Example:

- Start: 09:00
- End: 18:00
- Total: 9.00 hours.

Overnight example:

- Start: 22:00
- End: 02:00
- Total: 4.00 hours.

Return totalHours as a numeric value rounded to two decimal places.

Do not store total_hours in the database.

Do not calculate the authoritative duration in React.

The frontend may display the returned value but the backend remains the source of truth.

## 9. Backend Architecture

Implement under:

`com.devworktracker.worklog`

Follow the existing project structure:

- entity
- repository
- dto
- mapper
- service
- controller

Responsibilities:

- Controller: HTTP handling only.
- Service: business rules, validation and transactions.
- Repository: database access.
- DTO: request and response contracts.
- Mapper: entity-to-response mapping.

Do not expose JPA entities directly.

Use Bean Validation and centralized exception handling.

## 10. Backend APIs

Implement:

### A. Create Work Log

`POST /api/v1/work-logs`

Request fields:

- taskItemId (required)
- workDate (optional; defaults to current date)
- environment (optional; defaults LOCAL)
- workType (required)
- taskRequirement (required)
- workDescription (optional)
- purposeReason (optional)
- technologyArea (optional)
- startTime (optional)
- endTime (optional)
- status (optional; defaults IN_PROGRESS)
- problemBlocker (optional)
- solutionResolution (optional)
- testingVerification (optional)
- resultOutcome (optional)
- pendingNextAction (optional)
- notesRemarks (optional)

Behaviour:

- Validate active Task Item.
- Derive Project through Task Item.
- Generate Work Log code.
- Apply defaults.
- Validate start/end time pairing.
- Calculate totalHours for the response.
- Return HTTP 201.

### B. List Work Logs

`GET /api/v1/work-logs`

Support filters:

- search by Work Log code or task requirement
- taskItemId
- projectId (filter through Task Item relationship)
- workDateFrom
- workDateTo
- environment
- workType
- status
- page
- size
- sortBy
- direction

Requirements:

- Use database pagination.
- Default page = 0.
- Default size = 10.
- Maximum size = 100.
- Default sorting = workDate descending, then workLogId descending.
- Validate sort fields using an allowlist.
- Allow multiple Work Logs on the same date.
- Do not filter out historical Work Logs merely because their Task Item or Project is inactive.
- Return the associated Task Item and Project summary needed by the frontend without creating unnecessary N+1 queries.

### C. Work Log Details

`GET /api/v1/work-logs/{workLogId}`

Return:

- Work Log details.
- Task Item summary.
- Project summary.
- Calculated totalHours.
- Derived day name.
- Associated Code Change and DB Change identifiers where available in the schema/application.

At this stage, Code Change and DB Change modules are not yet implemented. Return empty collections or the appropriate neutral representation for these associations. Do not fabricate records.

### D. Update Work Log

`PUT /api/v1/work-logs/{workLogId}`

Allow updating:

- workDate
- environment
- workType
- taskRequirement
- workDescription
- purposeReason
- technologyArea
- startTime
- endTime
- status
- problemBlocker
- solutionResolution
- testingVerification
- resultOutcome
- pendingNextAction
- notesRemarks

Do not allow updating:

- workLogId
- workLogCode
- taskItemId
- projectId
- totalHours
- day
- createdAt
- updatedAt

The existing Task Item association must remain unchanged.

Editing must remain possible when the original Task Item has become inactive.

Apply the same date/time validation and backend duration calculation used during creation.

### E. Work Log History for Task Items

Integrate with the existing Task Item history endpoint where appropriate.

Ensure Work Logs appear in their associated Task Item history.

Do not break the existing Code Change and DB Change history response structure.

Do not duplicate history records.

## 11. API Response

Use the existing common response wrapper.

Work Log responses should include useful associated identifiers and calculated fields.

Example response data:

- workLogId
- workLogCode
- taskItemId
- taskItemCode
- taskItemTitle
- projectId
- projectCode
- projectName
- workDate
- day
- environment
- workType
- taskRequirement
- workDescription
- purposeReason
- technologyArea
- startTime
- endTime
- totalHours
- status
- problemBlocker
- solutionResolution
- testingVerification
- resultOutcome
- pendingNextAction
- notesRemarks
- createdAt
- updatedAt

Use the existing pagination response format.

Use appropriate HTTP status codes:

- 200
- 201
- 400
- 401
- 403
- 404
- 409
- 500

## 12. Frontend Implementation

Implement under:

`frontend/src/features/work-logs/`

Use existing React, React Router, Axios, TanStack Query, React Hook Form, Zod, Tailwind and Lucide setup.

### A. Work Log Listing Page

Route:

`/work-logs`

Display:

- Work Log ID/code
- Work Date
- Project
- Task Item
- Work Type
- Environment
- Status
- Total Hours
- Actions

Features:

- Search by Work Log code or Task Requirement.
- Project filter.
- Task Item filter.
- Date range filter.
- Environment filter.
- Work Type filter.
- Status filter.
- Pagination.
- Page-size selection.
- Sorting.
- View details.
- Edit.
- Create Work Log action.

Historical Work Logs must remain visible even when their associated Task Item or Project becomes inactive.

### B. Create Work Log

Route:

`/work-logs/new`

Create a practical form divided into sections.

#### Section 1 — Basic Information

- Work Date (default today).
- Task Item (required dropdown; active Task Items only).
- Project (automatically populated from Task Item; read-only).
- Environment (default LOCAL).
- Work Type (required).

#### Section 2 — Work Details

- Task / Requirement (required).
- Work Description.
- Purpose / Reason.
- Technology / Area.

#### Section 3 — Time Tracking

- Start Time (default 09:00 AM).
- End Time (initially empty).
- Total Hours (calculated value returned by backend).

Allow users to clear both time fields together.

If only one field is populated, display a clear validation message.

#### Section 4 — Outcome

- Status (default IN_PROGRESS).
- Problem / Blocker.
- Solution / Resolution.
- Testing / Verification.
- Result / Outcome.
- Pending / Next Action.
- Notes / Remarks.

The form should be practical and quick to complete. Avoid unnecessary required fields.

### C. Edit Work Log

Route:

`/work-logs/:workLogId`

Allow editing the approved editable fields.

Task Item and Project must be displayed as read-only.

Do not require the Task Item to be active when editing a historical Work Log.

### D. Work Log Details

Display all saved information in a readable format:

- Basic information.
- Work details.
- Time tracking and calculated duration.
- Status and outcome.
- Task Item and Project references.
- Created and updated timestamps.

Provide an Edit action.

Do not implement Code Change or DB Change creation in this task.

### E. Quick Creation

Provide a convenient New Work Log action in the existing authenticated application layout.

Do not introduce duplicate navigation entries.

## 13. Frontend State and API Integration

Create:

- Work Log API service.
- Work Log query hooks.
- Create mutation.
- Update mutation.
- Details query.
- List query with filters and pagination.
- Appropriate query invalidation.

Requirements:

- Use the existing Axios API client.
- Use TanStack Query for server state.
- Use React Hook Form and Zod.
- Debounce search.
- Preserve filters and pagination predictably.
- Show loading, empty, error and success states.
- Do not put API calls directly in UI components.
- Avoid unnecessary global state.

## 14. Excel Compatibility

The Work Log module must preserve the original Daily Work Log workbook's 22-column structure.

Use the existing export specification as the source of truth.

The fields must map as follows:

1. Work ID → workLogCode
2. Date → workDate
3. Day → derived from workDate
4. Project / Application → derived through Task Item
5. Module / Feature → Task Item title
6. Task / Requirement → taskRequirement
7. Work Type → workType
8. Work Description → workDescription
9. Purpose / Reason → purposeReason
10. Technology / Area → technologyArea
11. Start Time → startTime
12. End Time → endTime
13. Total Hours → backend-calculated totalHours
14. Status → status
15. Problem / Blocker → problemBlocker
16. Solution / Resolution → solutionResolution
17. Testing / Verification → testingVerification
18. Result / Outcome → resultOutcome
19. Pending / Next Action → pendingNextAction
20. Code Change ID(s) → derived association
21. DB Change ID(s) → derived association
22. Notes / Remarks → notesRemarks

Do not implement Excel export in this task. That belongs to the Reports & Exports module.

Do not change the existing workbook template or column definitions.

## 15. Testing

### Backend Tests

Cover:

- Work Log creation.
- Sequence-based Work Log code generation.
- Correct code formatting.
- Required field validation.
- Work Type validation.
- Environment validation.
- Work Log status validation.
- Default date, environment and status.
- Active Task Item validation during creation.
- Rejection of inactive Task Item during creation.
- Project derivation.
- Multiple Work Logs for one Task Item.
- Multiple Work Logs on the same date.
- Listing and search.
- Filtering by Task Item, Project, date range, environment, type and status.
- Pagination and sorting.
- Historical Work Logs for inactive Task Items.
- Work Log details.
- Work Log update.
- Task Item association immutability.
- Editing Work Logs linked to inactive Task Items.
- Both time fields NULL.
- Both time fields populated.
- Only start time rejection.
- Only end time rejection.
- Normal duration calculation.
- Overnight duration calculation.
- Identical start/end time calculation.
- Total hours not persisted.
- Day derived from workDate.

### Frontend Tests

Cover:

- Listing and rendering.
- Search and filters.
- Pagination.
- Task Item dropdown active-only filtering.
- Project auto-population.
- Default work date.
- Default LOCAL environment.
- Default IN_PROGRESS status.
- Work Type options.
- Required Task Requirement validation.
- Start/end time pairing.
- Clearing both time fields.
- Successful creation.
- Edit form population.
- Read-only Task Item and Project.
- Historical Work Log edit with inactive Task Item.
- Detail rendering.
- Duration display.
- Loading, empty and error states.

Run existing Authentication, Project Management and Task Item tests as regression checks.

## 16. Documentation

Update:

- `docs/00_PROJECT_STATUS.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/requirements/03_SCREEN_FUNCTIONALITY.md`
- Relevant Work Log rules in `docs/requirements/02_BUSINESS_RULES.md` only if documentation needs synchronization.

Document actual implementation.

Preserve existing phase/task naming conventions.

## 17. Git and Completion

- Work on `dev`.
- Run backend tests.
- Run frontend tests.
- Run frontend production build.
- Review all changed files.
- Verify that Authentication, Project Management and Task Item Management still work.
- Commit only after successful checks.

Commit message:

`feat: implement work log management module`

Ensure the working tree is clean.

## Restrictions

Do not implement:

- Pending Task module.
- Code Change module.
- DB Change module.
- Dashboard data APIs.
- Excel exports.
- Hard deletion.
- Task Item reassignment.
- Project selection independent of Task Item.
- Database schema modifications.

Stop after completing Work Log Management and provide a detailed completion report with test results, Git commit and outstanding integration limitations.