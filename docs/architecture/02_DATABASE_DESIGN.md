# DevWork Tracker — Database Design Specification

## 1. Database Overview

**Database:** PostgreSQL  
**Target compatibility:** Neon and Supabase  
**ORM:** Spring Data JPA / Hibernate  
**Migration:** Flyway  
**Schema management:** Flyway only; Hibernate `ddl-auto=validate`.

The initial database contains nine tables:

1. app_user
2. refresh_token
3. project
4. task_item
5. work_log
6. code_change
7. code_change_file
8. db_change
9. pending_task

No separate dashboard, report or activity tables are required initially.

## 2. Database Naming Standards

- Table names: lowercase snake_case.
- Column names: lowercase snake_case.
- Primary keys: `<entity>_id`.
- Foreign keys: referenced entity ID.
- Index names: `idx_<table>_<columns>`.
- Unique constraints/indexes: `uq_<table>_<columns>`.
- Boolean-like numeric status fields: SMALLINT with CHECK constraints.
- Timestamps: TIMESTAMPTZ.
- Primary keys: BIGINT GENERATED ALWAYS AS IDENTITY.
- Text descriptions: TEXT.
- Fixed-size business codes: VARCHAR(30).

## 3. Entity Relationship Design

### 3.1 Relationships

| Parent | Child | Relationship |
|---|---|---|
| app_user | refresh_token | 1:M |
| project | task_item | 1:M |
| project | pending_task | 1:M |
| task_item | work_log | 1:M |
| work_log | code_change | 1:M |
| code_change | code_change_file | 1:M |
| work_log | db_change | 1:M |

### 3.2 Relationship Rules

- Each Task Item belongs to one Project.
- Each Pending Task belongs to one Project.
- Each Work Log belongs to one Task Item.
- Each Code Change belongs to one Work Log.
- Each DB Change belongs to one Work Log.
- Each Code Change File belongs to one Code Change.
- Each Refresh Token belongs to one account.

Pending Tasks must not have a relationship with Task Items or Work Logs.

Project ID must not be stored redundantly in Work Log, Code Change or DB Change.

Project and Task Item details are derived through the approved relationships.

## 4. Table Specifications

### 4.1 APP_USER

Purpose: Store the single application account.

| Column | Type | Constraints |
|---|---|---|
| user_id | BIGINT | PK, Identity |
| username | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| status | SMALLINT | NOT NULL, DEFAULT 1 |
| last_login_at | TIMESTAMPTZ | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Constraints:
- Username must not be blank.
- Email must not be blank.
- Status must be 0 or 1.
- Username must be unique case-insensitively.
- Email must be unique case-insensitively.
- Database must enforce a maximum of one account.

Recommended unique indexes:
- Unique index on LOWER(username).
- Unique index on LOWER(email).
- Unique expression index enforcing one account.

The single-account constraint must work under concurrent registration attempts, not just an application-level count check.

### 4.2 PROJECT

Purpose: Store application projects.

| Column | Type | Constraints |
|---|---|---|
| project_id | BIGINT | PK, Identity |
| project_code | VARCHAR(30) | NOT NULL, UNIQUE |
| project_name | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| status | SMALLINT | NOT NULL, DEFAULT 1 |
| remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Constraints:
- Project Code must be unique.
- Project Name must not be blank.
- Status must be 0 or 1.
- Project Name does not need to be unique.
- No start_date or end_date.

### 4.3 REFRESH_TOKEN

Purpose: Store hashed refresh-token information for authentication.

| Column | Type | Constraints |
|---|---|---|
| token_id | BIGINT | PK, Identity |
| user_id | BIGINT | FK, NOT NULL |
| token_hash | CHAR(64) | NOT NULL, UNIQUE |
| token_family_id | UUID | NOT NULL |
| issued_at | TIMESTAMPTZ | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | NULL |
| replaced_by_token_id | BIGINT | Self-FK, NULL |

Constraints:
- user_id references app_user.
- replaced_by_token_id references refresh_token.
- expires_at must be greater than issued_at.
- A token cannot replace itself.
- A replacement reference requires revoked_at to be populated.
- Each replacement token can have at most one predecessor.

Token storage:
- Generate cryptographically random opaque tokens with at least 256 bits of entropy.
- Store SHA-256 hexadecimal digest in token_hash.
- Never store the raw refresh token.
- BCrypt is for passwords, not refresh tokens.

Refresh-token lifecycle and rotation must follow the Security Design document.

### 4.4 TASK_ITEM

Purpose: Store project-level development features, bugs and work units.

| Column | Type | Constraints |
|---|---|---|
| task_item_id | BIGINT | PK, Identity |
| task_item_code | VARCHAR(30) | NOT NULL, UNIQUE |
| project_id | BIGINT | FK, NOT NULL |
| task_type | VARCHAR(40) | NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| priority | VARCHAR(20) | NOT NULL, DEFAULT MEDIUM |
| status | VARCHAR(20) | NOT NULL, DEFAULT OPEN |
| is_active | SMALLINT | NOT NULL, DEFAULT 1 |
| completed_at | TIMESTAMPTZ | NULL |
| remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Task Types:
- FEATURE_DEVELOPMENT
- NEW_DEVELOPMENT
- BUG_FIX
- ISSUE_DEFECT
- ENHANCEMENT
- TECHNICAL_IMPROVEMENT
- MAINTENANCE
- RESEARCH_INVESTIGATION
- OTHER

Priority:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Status:
- OPEN
- IN_PROGRESS
- ON_HOLD
- COMPLETED
- CANCELLED

Constraints:
- Project ID must reference an existing Project.
- Title must not be blank.
- is_active must be 0 or 1.
- completed_at must be populated exactly when status is COMPLETED.
- Project Code and Task Item Code must be unique.

Task Item title does not need to be unique within a Project.

### 4.5 WORK_LOG

Purpose: Store daily engineering work records.

| Column | Type | Constraints |
|---|---|---|
| work_log_id | BIGINT | PK, Identity |
| work_log_code | VARCHAR(30) | NOT NULL, UNIQUE |
| task_item_id | BIGINT | FK, NOT NULL |
| work_date | DATE | NOT NULL, DEFAULT CURRENT_DATE |
| environment | VARCHAR(20) | NOT NULL, DEFAULT LOCAL |
| work_type | VARCHAR(40) | NOT NULL |
| task_requirement | TEXT | NOT NULL |
| work_description | TEXT | NULL |
| purpose_reason | TEXT | NULL |
| technology_area | VARCHAR(200) | NULL |
| start_time | TIME | NULL |
| end_time | TIME | NULL |
| status | VARCHAR(30) | NOT NULL, DEFAULT IN_PROGRESS |
| problem_blocker | TEXT | NULL |
| solution_resolution | TEXT | NULL |
| testing_verification | TEXT | NULL |
| result_outcome | TEXT | NULL |
| pending_next_action | TEXT | NULL |
| notes_remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Work Types:
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

Environment:
- LOCAL
- UAT
- LIVE

Status:
- COMPLETED
- IN_PROGRESS
- BLOCKED
- ON_HOLD

Constraints:
- Task Item ID must reference an existing Task Item.
- Task Requirement must not be blank.
- Start Time and End Time must either both be NULL or both be populated.
- Environment, Work Type and Status must contain allowed values.
- Work Log Code must be unique.
- Status must not be NULL.

Important:
- Start Time defaults to 09:00 AM in the frontend.
- End Time is initially empty.
- Both fields can be cleared together.
- Database time columns remain nullable.
- Total Hours is calculated by the backend and is not stored.
- Project is derived through Task Item.
- Day is derived from Work Date.

### 4.6 CODE_CHANGE

Purpose: Store SVN commit and uncommitted code-change records.

| Column | Type | Constraints |
|---|---|---|
| code_change_id | BIGINT | PK, Identity |
| code_change_code | VARCHAR(30) | NOT NULL, UNIQUE |
| work_log_id | BIGINT | FK, NOT NULL |
| change_status | VARCHAR(20) | NOT NULL |
| svn_commit_id | VARCHAR(150) | NULL |
| change_datetime | TIMESTAMPTZ | NOT NULL |
| environment | VARCHAR(20) | NOT NULL |
| remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Change Status:
- COMMITTED
- UNCOMMITTED

Environment:
- LOCAL
- UAT
- LIVE

Constraints:
- Work Log ID must reference an existing Work Log.
- COMMITTED requires a nonblank SVN Commit ID.
- UNCOMMITTED requires SVN Commit ID to be NULL.
- SVN Commit ID must be unique when populated.
- Change Status and Environment must contain allowed values.
- Code Change Code must be unique.

Use a unique partial index on SVN Commit ID where it is not NULL.

One Code Change represents one SVN commit.

### 4.7 CODE_CHANGE_FILE

Purpose: Store optional file-level details for a Code Change.

| Column | Type | Constraints |
|---|---|---|
| code_change_file_id | BIGINT | PK, Identity |
| code_change_id | BIGINT | FK, NOT NULL |
| layer | VARCHAR(50) | NULL |
| technology | VARCHAR(100) | NULL |
| file_path | TEXT | NOT NULL |
| what_changed | TEXT | NULL |
| why_changed | TEXT | NULL |
| affected_files | TEXT | NULL |
| remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

Rules:
- A Code Change can have zero or multiple file records.
- File Path must not be blank.
- File details are optional for COMMITTED and UNCOMMITTED records.
- File records may be deleted without deleting the parent Code Change.
- No updated_at column is required initially.

### 4.8 DB_CHANGE

Purpose: Store database object change history.

| Column | Type | Constraints |
|---|---|---|
| db_change_id | BIGINT | PK, Identity |
| db_change_code | VARCHAR(30) | NOT NULL, UNIQUE |
| work_log_id | BIGINT | FK, NOT NULL |
| environment | VARCHAR(20) | NOT NULL |
| database_name | VARCHAR(50) | NOT NULL |
| object_type | VARCHAR(40) | NOT NULL |
| object_name | VARCHAR(200) | NOT NULL |
| what_changed | TEXT | NULL |
| why_changed | TEXT | NULL |
| affected_object | TEXT | NULL |
| remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Environment:
- LOCAL
- UAT
- LIVE

Database:
- Oracle
- PostgreSQL
- MySQL
- SQL Server
- MongoDB
- Other

Object Type:
- Table
- Procedure
- Function
- Trigger
- View
- Package
- Cursor
- Sequence
- Index
- Constraint
- Other

Constraints:
- Work Log ID must reference an existing Work Log.
- Environment, Database and Object Type must contain allowed values.
- Object Name must not be blank.
- DB Change Code must be unique.

One DB Change record represents one database object change.

### 4.9 PENDING_TASK

Purpose: Store independent project-level follow-up tasks.

| Column | Type | Constraints |
|---|---|---|
| pending_task_id | BIGINT | PK, Identity |
| pending_task_code | VARCHAR(30) | NOT NULL, UNIQUE |
| project_id | BIGINT | FK, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| priority | VARCHAR(20) | NOT NULL, DEFAULT MEDIUM |
| status | VARCHAR(20) | NOT NULL, DEFAULT PENDING |
| due_date | DATE | NULL |
| completed_at | TIMESTAMPTZ | NULL |
| remarks | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Priority:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Status:
- PENDING
- IN_PROGRESS
- ON_HOLD
- COMPLETED
- CANCELLED

Constraints:
- Project ID must reference an existing Project.
- Title must not be blank.
- completed_at must be populated exactly when status is COMPLETED.
- Pending Task Code must be unique.

## 5. Foreign Key and Deletion Rules

Business relationships must protect historical records.

| Relationship | Delete behaviour |
|---|---|
| project → task_item | RESTRICT |
| project → pending_task | RESTRICT |
| task_item → work_log | RESTRICT |
| work_log → code_change | RESTRICT |
| work_log → db_change | RESTRICT |
| code_change → code_change_file | RESTRICT or explicit child deletion workflow |
| app_user → refresh_token | CASCADE |
| refresh_token → replacement token | RESTRICT |

No hard-delete APIs are required for main business records.

Optional Code Change File deletion must be handled explicitly by the application.

## 6. Index Strategy

Create indexes for common joins, filtering and sorting.

### APP_USER
- Unique LOWER(username).
- Unique LOWER(email).
- Unique single-account expression index.

### REFRESH_TOKEN
- user_id.
- token_family_id.
- expires_at.
- Unique partial index on replaced_by_token_id where NOT NULL.

Do not create an additional redundant normal index on replaced_by_token_id.

### PROJECT
- status.
- project_name where useful for supported search/sort operations.

### TASK_ITEM
- Composite `(project_id, is_active)`.
- Composite `(project_id, status)`.

### WORK_LOG
- task_item_id.
- Composite `(work_date DESC, work_log_id DESC)`.

### CODE_CHANGE
- work_log_id.
- svn_commit_id unique partial index.
- Composite or individual index for change_datetime sorting/filtering.

### CODE_CHANGE_FILE
- code_change_id.

### DB_CHANGE
- work_log_id.
- Composite `(database_name, object_type, object_name)`.

### PENDING_TASK
- Composite `(project_id, status)`.
- due_date.

Avoid unnecessary indexes on long TEXT columns.

Add additional indexes only when supported by actual query patterns or query-plan evidence.

## 7. Business Code Sequences

Use PostgreSQL sequences.

| Entity | Sequence | Format |
|---|---|---|
| Project | seq_project_code | PRJ-000001 |
| Task Item | seq_task_item_code | TASK-000001 |
| Work Log | seq_work_log_code | WL-000001 |
| Code Change | seq_code_change_code | CC-000001 |
| DB Change | seq_db_change_code | DB-000001 |
| Pending Task | seq_pending_task_code | PT-000001 |

Rules:
- Backend obtains sequence values using nextval.
- Backend formats the business code.
- Never use MAX(id) + 1.
- Sequence gaps are acceptable.
- Business codes are immutable.
- Use a fixed mapping of entity types to sequence names.

## 8. Timestamp Management

All created_at and updated_at columns use TIMESTAMPTZ.

A reusable PostgreSQL trigger function may manage updated_at.

Apply update triggers to:
- app_user
- project
- task_item
- work_log
- code_change
- db_change
- pending_task

CODE_CHANGE_FILE has created_at only.

Completion timestamps:
- Managed by backend service logic.
- Set when status becomes COMPLETED.
- Cleared when status moves away from COMPLETED.
- Preserved when status remains COMPLETED.

The database should enforce consistency between COMPLETED status and completed_at.

## 9. Work Log Duration Calculation

Total Hours must not be stored as a database column.

Backend calculation:
- Both times NULL: duration is NULL.
- Both times populated: calculate duration.
- End Time earlier than Start Time: treat as overnight.
- Identical times: zero duration.
- Only one time populated: validation error.

Frontend Start Time default is 09:00 AM. The database does not need to force this default.

Use a consistent time interpretation with Asia/Kolkata for application input and display.

## 10. Database Migration Strategy

Use Flyway.

Initial migration:
`V1__initial_schema.sql`

The initial migration must create:
1. Tables.
2. Constraints.
3. Foreign keys.
4. Indexes.
5. Business code sequences.
6. Timestamp function and triggers.

Future schema modifications must be new versioned migrations.

Do not modify an already-applied migration in an existing environment. Create a new migration instead.

Hibernate configuration:
`spring.jpa.hibernate.ddl-auto=validate`

Flyway owns schema creation and modification.

## 11. Database Portability

Use standard PostgreSQL features compatible with Neon and Supabase.

Avoid provider-specific SQL or extensions unless explicitly approved.

Do not introduce a dependency on:
- Supabase-specific database functions.
- Neon-specific database functions.
- Vendor-specific authentication.
- Vendor-specific schema features.

Application authentication remains managed by Spring Boot.

## 12. Validation Requirements

Before approving the initial schema:

1. Execute the migration against a clean PostgreSQL database.
2. Verify all nine tables.
3. Verify all foreign keys.
4. Verify all CHECK constraints.
5. Verify unique indexes.
6. Verify sequences and generated business codes.
7. Verify timestamp triggers.
8. Verify the single-account constraint under concurrent registration.
9. Verify Work Log status defaults to IN_PROGRESS.
10. Verify optional Start/End Time behaviour.
11. Verify completion timestamp consistency.
12. Verify Flyway migration succeeds on application startup.

This document defines the approved logical database design. Exact SQL must be reviewed and tested before it is treated as the final migration.