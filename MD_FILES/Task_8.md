# Task 8 — Code Change Log Management Module

## Project Location
`E:\WorkTracker`

## Objective

Implement the complete Code Change Log Management module in DevWork Tracker.

This module replaces the existing `Code_File_Change_Log.xlsx` workbook.

Work on the existing `dev` Git branch.

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

Inspect existing Work Log, Task Item, Project and Authentication implementations. Follow existing backend and frontend conventions.

Do not redesign approved functionality.

---

## 1. Database Restrictions

The user will create the PostgreSQL database and execute the Flyway migration manually through pgAdmin.

- Do not execute SQL scripts.
- Do not create, modify or drop database objects.
- Do not modify `V1__initial_schema.sql`.
- Do not modify the reference SQL file.
- Do not add a migration unless a genuine schema requirement is discovered. If required, stop and explain it first.
- Use existing `code_change` and `code_change_file` tables.
- Use existing `seq_code_change_code` sequence.
- Use `spring.jpa.hibernate.ddl-auto=validate`.

If PostgreSQL is unavailable, implement against the approved schema and use mocks or isolated tests. Report live database integration as pending.

## 2. Database Mapping

### A. CODE_CHANGE

Map the existing `code_change` table exactly.

Expected fields:

- `code_change_id`: BIGINT primary key, identity.
- `code_change_code`: VARCHAR(30), unique, required.
- `work_log_id`: BIGINT, required FK to work_log.
- `change_status`: VARCHAR(20), required.
- `svn_commit_id`: VARCHAR(150), nullable depending on status.
- `change_datetime`: TIMESTAMPTZ, required.
- `environment`: VARCHAR(20), required.
- `remarks`: TEXT, optional.
- `created_at`: TIMESTAMPTZ, required.
- `updated_at`: TIMESTAMPTZ, required.

Status values:

- COMMITTED
- UNCOMMITTED

Environment values:

- LOCAL
- UAT
- LIVE

Constraints:

- COMMITTED requires a nonblank SVN commit ID.
- UNCOMMITTED requires SVN commit ID to be NULL.
- Do not store blank commit IDs as substitutes for NULL.
- `change_datetime` is mandatory for both statuses.
- Use the existing timestamp trigger for `updated_at`.

### B. CODE_CHANGE_FILE

Map the existing `code_change_file` table exactly.

Expected fields:

- `code_change_file_id`: BIGINT primary key, identity.
- `code_change_id`: BIGINT, required FK to code_change.
- `layer`: VARCHAR(50), optional.
- `technology`: VARCHAR(100), optional.
- `file_path`: TEXT, required when a file record exists.
- `what_changed`: TEXT, optional.
- `why_changed`: TEXT, optional.
- `affected_files`: TEXT, optional.
- `remarks`: TEXT, optional.
- `created_at`: TIMESTAMPTZ, required.

Important:

- File details are optional.
- A Code Change may have zero or multiple file records.
- Do not require file details for COMMITTED records.
- Do not require file details for UNCOMMITTED records.
- A file row must have a nonblank file path.
- Use the existing parent-child relationship.

Do not add columns or relationships.

## 3. Code Generation

Generate Code Change codes in the backend using:

`seq_code_change_code`

Format:

`CC-000001`

Requirements:

- Use PostgreSQL `nextval`.
- Never use `MAX(code_change_id) + 1`.
- Never generate codes in React.
- Sequence gaps are acceptable.
- Creation must be transactional.

## 4. Work Log Relationship

Relationship:

`Work Log 1 → Many Code Changes`

Requirements:

- Each Code Change belongs to exactly one Work Log.
- One Work Log can have multiple Code Changes.
- Work Log association is immutable after Code Change creation.
- Do not add direct foreign keys to Task Item or Project.
- Derive Task Item and Project through Work Log.

For new Code Change creation:

- Work Log must exist.
- Work Log can be associated with an inactive Task Item; do not reject historical Work Logs because their Task Item or Project is inactive.
- Do not create a new Work Log automatically.
- Select an existing Work Log.

Display useful Work Log, Task Item and Project information in the selection dropdown.

## 5. Critical Committed / Uncommitted Workflow

This is the most important business rule in this module.

### A. UNCOMMITTED Code Change

When the user records a change that has not been committed:

- `change_status = UNCOMMITTED`
- `svn_commit_id = NULL`
- `change_datetime` required
- `environment` required
- `remarks` optional
- File details optional.

Users may add file information or skip it.

### B. COMMITTED Code Change

When the code is committed:

- `change_status = COMMITTED`
- `svn_commit_id` required.
- `change_datetime` must represent the actual commit date/time.
- `environment` required.
- File details are optional.

Do not require users to describe changed files when recording a committed change.

### C. UNCOMMITTED → COMMITTED

When an existing UNCOMMITTED Code Change is committed:

- Update the existing Code Change record.
- Change status to COMMITTED.
- Add the SVN Commit ID.
- Update `change_datetime` to the actual commit date/time.
- Preserve the existing environment unless the user explicitly changes it.
- Preserve existing file records.
- Preserve remarks unless explicitly edited.
- Do not create a duplicate Code Change record.
- Do not change the parent Code Change ID or code.

The transition must be transactional.

### D. Status Transitions

Supported:

- UNCOMMITTED → COMMITTED.
- Editing an existing UNCOMMITTED record while it remains UNCOMMITTED.
- Editing an existing COMMITTED record while maintaining COMMITTED consistency.

Do not silently allow COMMITTED → UNCOMMITTED through normal editing.

Do not allow users to remove the commit ID while status remains COMMITTED.

## 6. Multiple Commits and Multiple Files

One Code Change represents one SVN commit.

Examples:

- One Work Log may have three Code Changes if three separate commits were made.
- One Code Change can contain multiple changed files.
- An UNCOMMITTED record may contain several file entries.
- When later committed, update that same parent record and retain its file entries.

Never create one Code Change per file.

Never duplicate the parent record when multiple files are added.

## 7. Backend Architecture

Implement under:

`com.devworktracker.codechange`

Follow the existing structure:

- entity
- repository
- dto
- mapper
- service
- controller

Use:

- CodeChange entity.
- CodeChangeFile entity.
- CodeChange repository.
- CodeChangeFile repository.
- DTOs for create, update and file operations.
- Service layer with transactions.
- Controller layer.
- Mapper.

Do not expose JPA entities directly.

Keep business logic in services.

Use Bean Validation and centralized exception handling.

## 8. Backend APIs

Implement the following endpoints.

### A. Create Code Change

`POST /api/v1/code-changes`

Request:

- workLogId (required)
- changeStatus (required)
- svnCommitId (required only for COMMITTED)
- changeDatetime (required)
- environment (required)
- remarks (optional)
- files (optional array)

Each file can contain:

- layer
- technology
- filePath
- whatChanged
- whyChanged
- affectedFiles
- remarks

Behaviour:

- Validate Work Log.
- Validate status and commit ID consistency.
- Validate environment.
- Generate Code Change code.
- Save parent and optional file entries transactionally.
- Return HTTP 201.

### B. List Code Changes

`GET /api/v1/code-changes`

Support:

- search by Code Change code or SVN Commit ID
- workLogId
- taskItemId (through Work Log relationship)
- projectId (through Work Log → Task Item)
- changeStatus
- environment
- dateFrom
- dateTo
- page
- size
- sortBy
- direction

Requirements:

- Database pagination.
- Default page = 0.
- Default size = 10.
- Maximum size = 100.
- Default sort = changeDatetime descending.
- Use an allowlist for sorting.
- Avoid N+1 queries.
- Include useful Work Log, Task Item and Project summaries.

### C. Code Change Details

`GET /api/v1/code-changes/{codeChangeId}`

Return:

- Code Change details.
- Work Log summary.
- Task Item summary.
- Project summary.
- Associated file records.

### D. Update Code Change

`PUT /api/v1/code-changes/{codeChangeId}`

Allow editing:

- changeStatus, subject to approved transition rules.
- svnCommitId, subject to status rules.
- changeDatetime.
- environment.
- remarks.

Do not allow changing:

- codeChangeId.
- codeChangeCode.
- workLogId.
- createdAt.
- updatedAt.

When converting UNCOMMITTED to COMMITTED, update the existing record.

Do not create a duplicate parent record.

### E. Commit Search

`GET /api/v1/code-changes/commit/{svnCommitId}`

Search using the exact SVN Commit ID.

Return:

- Code Change details.
- SVN Commit ID.
- Commit date/time.
- Environment.
- Work Log code and date.
- Task Item code and title.
- Project code and name.
- Related DB Change information where available.

The DB Change module is not yet implemented. Do not invent DB Change records. Return an empty collection or neutral representation until that module is available.

### F. Add File Entry

`POST /api/v1/code-changes/{codeChangeId}/files`

Allow adding an optional file entry to an existing Code Change.

Validate `filePath` when a file record is created.

### G. Update File Entry

`PUT /api/v1/code-changes/{codeChangeId}/files/{fileId}`

Allow editing:

- layer
- technology
- filePath
- whatChanged
- whyChanged
- affectedFiles
- remarks

Ensure the file belongs to the specified parent Code Change.

### H. Delete File Entry

`DELETE /api/v1/code-changes/{codeChangeId}/files/{fileId}`

Allow deletion of an individual child file record.

Requirements:

- Verify the file belongs to the specified parent.
- Do not delete the parent Code Change.
- Do not delete associated Work Logs.
- Return HTTP 204 on success.

### I. No Parent Delete Endpoint

Do not implement:

`DELETE /api/v1/code-changes/{codeChangeId}`

Code Change parent records cannot be permanently deleted.

Incorrect records can be corrected using update operations.

## 9. SVN Commit ID Search

The exact commit search must support retrieving the context of a commit.

Return enough information to navigate to:

- Code Change details.
- Work Log details.
- Task Item details.
- Project details.

When the DB Change module becomes available, include associated DB Change summaries.

Ensure SVN Commit ID lookup is efficient and uses the existing unique partial index.

Do not add redundant indexes without a real need.

## 10. Frontend Implementation

Implement under:

`frontend/src/features/code-changes/`

Use the existing React, React Router, Axios, TanStack Query, React Hook Form, Zod, Tailwind and Lucide setup.

### A. Code Change Listing

Route:

`/code-changes`

Display:

- Code Change ID/code.
- Work Log.
- Project.
- Task Item.
- Change Status.
- SVN Commit ID.
- Change Date/Time.
- Environment.
- Actions.

Features:

- Search by Code Change code or SVN Commit ID.
- Work Log filter.
- Project filter.
- Task Item filter.
- Status filter.
- Environment filter.
- Date range filter.
- Pagination.
- Sorting.
- View details.
- Edit.
- Create Code Change.

### B. Create Code Change

Provide a form with:

**Basic Information**

- Work Log (required).
- Change Status (required).
- Environment (required).
- Change Date/Time (required).
- SVN Commit ID (conditionally required).
- Remarks (optional).

**File Details**

Allow users to add zero or more file entries.

Each entry:

- Layer.
- Technology.
- File Path.
- What Changed.
- Why Changed.
- Affected File(s).
- Remarks.

Requirements:

- File details must be optional.
- Users can add and remove file entries before saving.
- Do not force users to add file entries for committed changes.
- When status is UNCOMMITTED, SVN Commit ID must be empty.
- When status is COMMITTED, SVN Commit ID is required.
- Show clear conditional validation.

### C. Update Code Change

Support editing the parent record.

For UNCOMMITTED → COMMITTED:

- Show SVN Commit ID input.
- Require actual commit date/time.
- Preserve existing file entries.
- Update the same Code Change record.
- Do not create another record.

For COMMITTED records:

- Keep status COMMITTED.
- Do not allow removing the commit ID.
- Allow correcting permitted metadata while preserving consistency.

### D. Code Change Details

Route:

`/code-changes/:codeChangeId`

Display:

- Code Change code.
- Change status.
- SVN Commit ID when present.
- Change date/time.
- Environment.
- Work Log reference.
- Task Item reference.
- Project reference.
- Remarks.
- File details.

Provide an Edit action.

### E. Commit Search

Provide a convenient way to search using an exact SVN Commit ID.

Display the associated Code Change, Work Log, Task Item and Project information.

Do not make a fake external SVN integration.

### F. File Management

Within Code Change details:

- Display all associated file entries.
- Add a file entry.
- Edit a file entry.
- Delete an individual file entry with confirmation.

Do not provide parent Code Change deletion.

## 11. Existing History Integration

Integrate Code Changes into existing:

- Task Item history.
- Work Log details.

Use the approved relationship:

`Task Item → Work Logs → Code Changes → Code Change Files`

Requirements:

- Do not create direct Task Item or Project foreign keys.
- Do not duplicate Work Logs or Code Changes in history.
- Preserve existing Task Item history response structure.
- Update the previously neutral Code Change collection in Work Log details.
- Historical records must remain available when Task Items or Projects are inactive.

## 12. Excel Compatibility

Preserve the existing Code File Change Log workbook's 11 original columns and the two approved additions.

Final export structure: 13 columns.

Original columns:

1. Code Change ID
2. Work ID
3. Date
4. Project / Application
5. Layer
6. Technology
7. File Path
8. What Changed
9. Why Changed
10. Affected File(s)
11. Remarks

Add:

12. SVN Commit ID
13. Change Status

Mapping:

- Code Change ID → codeChangeCode.
- Work ID → Work Log code.
- Date → changeDatetime.
- Project / Application → derived through Work Log → Task Item → Project.
- Layer → aggregated from file entries.
- Technology → aggregated from file entries.
- File Path → aggregated from file entries.
- What Changed → aggregated from file entries.
- Why Changed → aggregated from file entries.
- Affected File(s) → aggregated from file entries.
- Remarks → parent remarks, with file remarks included according to the export specification.
- SVN Commit ID → svnCommitId.
- Change Status → changeStatus.

Multiple file values must be aggregated into newline-separated cells.

Export must have exactly one row per Code Change, not one row per file.

When there are no file records, corresponding file columns remain blank.

Do not implement Excel export in this task. It belongs to Reports & Exports.

Do not change the existing workbook template or column definitions.

## 13. Testing

### Backend Tests

Cover:

- Code Change creation.
- Sequence code generation and formatting.
- Work Log validation.
- Multiple Code Changes per Work Log.
- COMMITTED validation.
- UNCOMMITTED validation.
- Required commit ID for COMMITTED.
- NULL commit ID for UNCOMMITTED.
- Required change date/time.
- Environment validation.
- Optional file entries.
- Multiple file entries for one parent.
- Parent and child transaction handling.
- Listing and filters.
- Search by commit ID.
- Pagination and sorting.
- Detail retrieval and related summaries.
- Update of UNCOMMITTED records.
- UNCOMMITTED → COMMITTED conversion.
- Existing parent ID and code preserved during conversion.
- File records preserved during conversion.
- COMMITTED → UNCOMMITTED rejection.
- Duplicate SVN Commit ID conflict handling.
- Work Log association immutability.
- File update.
- File deletion without parent deletion.
- Parent deletion endpoint absent.
- Task Item history integration.
- Work Log detail integration.

### Frontend Tests

Cover:

- Listing and filters.
- Pagination.
- Search by Code Change code.
- Exact SVN Commit ID search.
- Work Log dropdown.
- Project and Task Item summaries.
- Conditional commit ID field.
- COMMITTED validation.
- UNCOMMITTED validation.
- Optional file entries.
- Add/remove file entries.
- Successful creation.
- Editing existing UNCOMMITTED record.
- Conversion to COMMITTED without duplicate creation.
- Preservation of file details.
- COMMITTED record consistency.
- Details page.
- File add/edit/delete.
- Confirmation before file deletion.
- No parent deletion control.
- Loading, empty, error and success states.

Run existing Authentication, Project, Task Item and Work Log tests as regression checks.

## 14. Documentation

Update:

- `docs/00_PROJECT_STATUS.md`
- `docs/api/API_SPECIFICATION.md`
- `docs/requirements/03_SCREEN_FUNCTIONALITY.md`
- Relevant business rules if documentation requires synchronization.

Document actual implementation.

Preserve existing phase/task naming conventions.

## 15. Git and Completion

- Work on `dev`.
- Run backend tests.
- Run frontend tests.
- Run frontend production build.
- Review all changed files.
- Verify existing modules still pass regression tests.
- Commit only after successful checks.

Commit message:

`feat: implement code change log module`

Ensure the working tree is clean.

## Restrictions

Do not implement:

- DB Change module.
- Pending Task module.
- Dashboard data APIs.
- Excel exports.
- SVN integration.
- Parent Code Change deletion.
- Duplicate Code Change creation during commit conversion.
- Direct Task Item or Project foreign keys.
- Database schema modifications.

Stop after completing Code Change Log Management and provide a detailed completion report with test results, Git commit and outstanding integration limitations.