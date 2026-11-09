# DevWork Tracker — Product Requirements Document

## 1. Product Overview

DevWork Tracker is a single-user work-tracking application designed to replace three manually maintained Excel workbooks:

1. Daily Work Log
2. Database Change Log
3. Code File Change Log

The application will centralize daily engineering activities, task tracking, database changes and code changes in one PostgreSQL database.

Users can enter work information through simple forms, review historical records, search and filter information, view dashboard summaries and export data into Excel workbooks.

## 2. Product Objectives

The primary objectives are:

- Reduce manual Excel data entry.
- Make daily work recording faster and simpler.
- Maintain structured project and task history.
- Track code changes and SVN commit information.
- Track database object changes.
- Maintain independent pending tasks.
- Provide useful work summaries and dashboard information.
- Generate Excel files compatible with existing workbooks.
- Maintain historical records for future reference.

## 3. Target User and Application Scope

### 3.1 Target User

Initially, the application is designed for one individual user.

### 3.2 Account Scope

- Only one account can be created.
- Initial registration is available through a hidden setup route.
- Registration is disabled after the first account is created.
- Login is available to the registered account.
- Multi-user support is excluded.

### 3.3 Initial Application Scope

- Local development and usage initially.
- PostgreSQL database.
- React frontend and Spring Boot backend.
- Future deployment compatibility with Neon or Supabase.
- Excel export functionality.

## 4. Application Modules

The application contains the following modules:

1. Authentication
2. Dashboard
3. Project Management
4. Task Item Management
5. Work Log
6. Pending Tasks
7. Code Change Log
8. Database Change Log
9. Reports and Exports
10. Settings

## 5. Functional Requirements

### 5.1 Authentication

The application must provide:

- Initial account registration.
- Login using username or email and password.
- Logout.
- Current account information.
- JWT access-token authentication.
- Refresh-token rotation.
- BCrypt password hashing.
- Secure refresh-token cookie handling.
- Account activation/deactivation enforcement.

Registration must only work when no account exists.

### 5.2 Dashboard

The dashboard must display:

#### Summary cards
- Total Projects
- Active Projects
- Total Task Items
- Open Task Items
- Total Work Logs
- Total Pending Tasks
- Overdue Pending Tasks
- Uncommitted Code Changes

#### Work Activity
- Work-hour summaries.
- Daily, weekly and monthly activity.
- Date-range filtering.
- Project filtering.

#### Project Summary
- Project-wise task counts.
- Completed tasks.
- In-progress tasks.
- Pending tasks.

#### Pending Task Overview
- Pending tasks.
- In-progress tasks.
- On-hold tasks.
- Overdue tasks.
- Upcoming due tasks.

#### Recent Activities
- Recent Work Logs.
- Recent Code Changes.
- Recent DB Changes.
- Recent Pending Tasks.

Dashboard information must be calculated from existing records. No separate dashboard data tables are required.

### 5.3 Project Management

Users must be able to:

- Create projects.
- View all projects.
- Search projects.
- Filter active/inactive projects.
- View project details.
- Update project information.
- View related Task Items.
- View related Pending Tasks.
- View related Work Logs.
- View related Code Changes and DB Changes.

Project code must be generated automatically.

Project start and end dates are not required.

Project deletion is not supported.

Project status:
- 1 = Active
- 0 = Inactive

No project deactivation UI is required initially.

### 5.4 Task Item Management

Task Items represent features, development activities, bugs and other work units belonging to a Project.

Users must be able to:

- Create Task Items.
- View Task Items.
- Search and filter Task Items.
- Update Task Items.
- Change Task Item status.
- Activate/deactivate Task Items.
- View Task Item history.

Task Item types:

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

Task Item codes must be generated automatically.

A completed Task Item can remain active for historical reference.

Inactive Task Items cannot be selected for new Work Logs.

Task Items cannot be hard-deleted.

### 5.5 Work Log

Work Log is the central module for recording daily engineering activities.

Users must be able to:

- Create Work Logs.
- View Work Logs.
- Search and filter Work Logs.
- Update Work Logs.
- View Work Log details.
- View associated Code Changes.
- View associated DB Changes.

Each Work Log belongs to exactly one Task Item.

The Project must be populated automatically from the selected Task Item.

Multiple Work Logs can be created on the same date.

#### Work Type

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

#### Environment

- LOCAL
- UAT
- LIVE

Default: LOCAL.

#### Work Log Status

- COMPLETED
- IN_PROGRESS
- BLOCKED
- ON_HOLD

Status is mandatory.

Default: IN_PROGRESS.

#### Work Log Information

The form must support:

- Work Date
- Task Item
- Environment
- Work Type
- Task / Requirement
- Work Description
- Purpose / Reason
- Technology / Area
- Start Time
- End Time
- Status
- Problem / Blocker
- Solution / Resolution
- Testing / Verification
- Result / Outcome
- Pending / Next Action
- Notes / Remarks

Task / Requirement is mandatory.

Other descriptive fields are optional unless separately specified.

#### Time Tracking

- Start Time defaults to 09:00 AM.
- End Time is initially empty.
- Both fields are optional.
- Both fields can be cleared together.
- Both populated: calculate duration automatically.
- Both empty: allow saving without duration.
- Only one populated: reject validation.
- Overnight duration is supported.
- Total Hours is calculated by the backend.
- Total Hours is not stored independently in the database.

The Work Log should be designed for approximately 3–5 minutes of daily entry.

### 5.6 Pending Tasks

Pending Tasks are independent records associated directly with Projects.

They are not Task Items and are not associated with Work Logs.

Users must be able to:

- Create Pending Tasks.
- View Pending Tasks.
- Search and filter Pending Tasks.
- Update Pending Tasks.
- Change Pending Task status.
- View Pending Task details.

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

Pending Task information:

- Project
- Title
- Description
- Priority
- Status
- Due Date
- Completed Date
- Remarks

Project and Title are mandatory.

Due Date is optional.

A task is overdue when its due date is before the current date and its status is neither COMPLETED nor CANCELLED.

Pending Tasks cannot be hard-deleted.

### 5.7 Code Change Log

Code Changes record SVN-related development changes.

Users must be able to:

- Create Code Change records.
- Create UNCOMMITTED records.
- Create COMMITTED records.
- Update UNCOMMITTED records to COMMITTED.
- Add SVN Commit IDs.
- Record actual commit date/time.
- Add optional file-level details.
- Search by SVN Commit ID.
- View related Work Log, Task Item and Project information.

Change Status:
- COMMITTED
- UNCOMMITTED

Rules:

- COMMITTED requires a unique SVN Commit ID.
- UNCOMMITTED must not contain an SVN Commit ID.
- Environment is mandatory.
- File-level details are optional for both statuses.
- A file path is required if a file detail row is created.
- Updating an UNCOMMITTED record to COMMITTED must update the existing record, not create a duplicate.
- Existing file details must be retained when a record is committed.

One SVN commit represents one Code Change record.

Multiple changed files can belong to one Code Change.

Multiple commits for one feature or day require separate Code Change records.

No direct SVN integration is required.

### 5.8 Database Change Log

Users must be able to:

- Create DB Change records.
- View DB Changes.
- Search and filter DB Changes.
- Update DB Change records.
- View associated Work Log and Project information.

Each record represents one database object change.

Multiple database objects require multiple records.

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

Work Log, Environment, Database, Object Type and Object Name are mandatory.

Other descriptive fields are optional.

### 5.9 Reports and Excel Exports

The application must generate three individual Excel workbooks:

1. Daily Work Log
2. Database Change Log
3. Code File Change Log

It must also provide an option to download all three in a ZIP file.

Users must be able to filter exported records using relevant date, project and module-specific filters.

Excel exports must:

- Preserve existing workbook columns.
- Preserve existing templates, formatting and sheet structure where applicable.
- Include headers even when no records are available.
- Use calculated and derived values where required.
- Avoid modifying database records during export.

The original Excel templates must be inspected during implementation.

### 5.10 Settings

Initial Settings functionality:

- Display account information.
- Provide logout.
- Use Light Theme by default.
- Use Asia/Kolkata timezone by default.

Password recovery, email verification and advanced account management are excluded initially.

## 6. Global Application Rules

- Business codes are system-generated.
- Main business records cannot be hard-deleted.
- Historical records remain accessible.
- Inactive Projects cannot receive new Task Items or Pending Tasks.
- Inactive Task Items cannot receive new Work Logs.
- Project information is derived through the approved relationships.
- Work Log status and Task Item status are independent.
- Work Log environment and Code/DB Change environments are independent.
- All list screens should support appropriate filtering, searching and pagination.
- API validation must be enforced by the backend, not only the frontend.

## 7. Excluded Features

The following are excluded from the initial version:

- Multi-user functionality.
- Roles and permissions.
- SVN integration.
- Google Drive integration.
- Email notifications.
- Mobile application.
- Redis.
- WebSockets.
- AI-generated work summaries.
- Advanced analytics.
- Automatic or manual database backup/restore functionality.
- Login and registration rate limiting.

## 8. Product Success Criteria

The initial product is successful when:

1. A single account can securely access the application.
2. Projects and Task Items can be managed.
3. Daily Work Logs can be recorded efficiently.
4. Pending Tasks can be tracked independently.
5. Code Changes can be recorded and updated with SVN commit details.
6. Database Changes can be recorded.
7. Dashboard summaries accurately reflect stored records.
8. All three Excel workbooks can be exported correctly.
9. Historical records remain accessible.
10. The application works locally with PostgreSQL and uses a schema compatible with Neon and Supabase.