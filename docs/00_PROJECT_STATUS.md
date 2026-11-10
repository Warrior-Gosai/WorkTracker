# DevWork Tracker — Project Status

## 1. Project Overview

**Project Name:** DevWork Tracker

**Objective:** Build a single-user work-tracking application to replace three manually maintained Excel workbooks:

1. Daily Work Log
2. Database Change Log
3. Code File Change Log

The application will provide structured data entry, searchable history, dashboard summaries and Excel exports.

## 2. Project Status

- Planning: Substantially completed
- Requirements: Defined
- Database design: Finalized & V1 Flyway migration implemented
- Backend API design: Defined
- Frontend design: Defined
- Security design: Defined
- Development: In progress (Phases 1, 2, 3, 4, 5, 6, 7, 8, 9 & 10 completed)

**Current Phase:** Phase 11 — Dashboard

## 3. Approved Technology Stack

### Frontend
- React JS
- Vite
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- Recharts

### Backend
- Java 25 LTS (proposed baseline)
- Spring Boot 4.x
- Maven
- Spring Data JPA / Hibernate
- Spring Security
- JWT authentication
- BCrypt password hashing
- Apache POI
- Swagger / OpenAPI

### Database
- PostgreSQL 17 baseline
- Flyway migrations
- Neon / Supabase compatibility

### Testing
- JUnit
- Mockito
- Integration and API testing

## 4. Application Modules

1. Authentication
2. Dashboard
3. Project Management
4. Task Item Management
5. Work Log
6. Pending Tasks
7. Code Change Log
8. Database Change Log
9. Reports and Excel Exports

## 5. Core Business Relationships

- One Project has many Task Items.
- One Project has many Pending Tasks.
- One Task Item has many Work Logs.
- One Work Log belongs to exactly one Task Item.
- One Work Log can have multiple Code Changes.
- One Work Log can have multiple DB Changes.
- One Code Change can have multiple optional file details.
- Pending Tasks are independent of Task Items and Work Logs.

## 6. Database Tables

1. app_user
2. project
3. refresh_token
4. task_item
5. work_log
6. code_change
7. code_change_file
8. db_change
9. pending_task

## 7. Important Approved Decisions

- Single-user application; one account only.
- Initial registration is hidden from normal navigation and accessible through a setup route.
- Registration is disabled after the first account is created.
- No multi-user support or role management.
- PostgreSQL is the primary database.
- Use refresh-token rotation.
- No hard deletion of main business records.
- Pending Tasks and Task Items remain separate.
- SVN information is entered manually; no SVN integration.
- No Google Drive integration initially.
- No Redis or WebSockets initially.
- Work Log Status is mandatory.
- Default Work Log Status: IN_PROGRESS.
- Work Log Start Time defaults to 09:00 AM.
- Start and End Times are optional and can be cleared together.
- Total Hours is calculated by the backend, not stored independently.
- Preserve existing Excel workbook columns.
- Use original Excel templates for export formatting.
- Database backup functionality is excluded initially.
- Rate limiting is excluded initially.

## 8. Development Architecture

Repository structure:

- frontend/
- backend/
- database/
- docs/

Use feature-based frontend and backend organization.

Backend business logic belongs in services. Controllers must remain thin. API requests and responses use DTOs.

Use Flyway for all database schema changes.

## 9. Development Sequence

1. Repository and project setup
2. PostgreSQL and Flyway
3. Backend foundation and authentication
4. Frontend foundation and authentication
5. Project Management
6. Task Item Management
7. Work Log
8. Code Change Log
9. DB Change Log
10. Pending Tasks
11. Dashboard
12. Reports and Excel Exports
13. Integration testing and final review

## 10. Development Rules

- Approved documentation is the source of truth.
- Implement one assigned task at a time.
- Do not invent requirements.
- Do not change approved relationships or API contracts without approval.
- Do not introduce unnecessary dependencies.
- Inspect existing code before modifying it.
- Run builds and tests after implementation.
- Report changed files and test results.
- Wait for approval before moving to the next feature.

## 11. Current Pending Work

- Implement Phase 11: Dashboard Module.
- Connect local PostgreSQL instance with live credentials.

## 12. Current Development State

- Phase 1 (Repository and Project Initialization) completed.
- Phase 2 (PostgreSQL and Flyway configuration with V1 migration) completed.
- Phase 3 (Backend Foundation & Single-User Authentication with JWT and Refresh Token Rotation) completed and tested.
- Phase 4 (Frontend Foundation & Single-User Authentication with React, Tailwind, and Axios Token Rotation) completed and tested.
- Phase 5 (Project Management Module) completed and tested:
  - Backend `Project` entity mapped to `project` table with sequence-driven code generation (`PRJ-000001` via `seq_project_code`).
  - REST endpoints for Create (`POST /api/v1/projects`), List with search/filter/pagination/sorting (`GET /api/v1/projects`), Details (`GET /api/v1/projects/{id}`), and Update (`PUT /api/v1/projects/{id}`).
  - Centralized `PageResponse<T>` and strict sort allowlist.
  - Inactive projects remain visible, filterable, and editable without UI status changes.
  - Frontend Project listing (`/projects`), Details view (`/projects/:projectId`), and responsive Create/Edit modal with TanStack Query and Zod validation.
  - 47/47 backend automated tests passing (25 auth + 22 project service/controller tests).
  - 21/21 frontend unit tests passing, production build verified clean.
- Phase 6 (Task Item Management Module) completed and tested:
  - Backend `TaskItem` entity mapped to `task_item` table with sequence-driven code generation (`TASK-000001` via `seq_task_item_code`).
  - REST endpoints for Create (`POST /api/v1/task-items`), List active tasks with multi-field search and filters (`GET /api/v1/task-items`), Details (`GET /api/v1/task-items/{id}`), Update (`PUT /api/v1/task-items/{id}`), Workflow Status Update (`PATCH /api/v1/task-items/{id}/status`), Deactivate (`PATCH /api/v1/task-items/{id}/deactivate`), and History Aggregation (`GET /api/v1/task-items/{id}/history`).
  - Strict database constraint `chk_task_item_completed_at` compliance: backend automatically sets `completed_at` when status transitions to `COMPLETED`, clears it on transition away, and rejects frontend direct manipulation.
  - Inactive project validation on creation: reject task creation if associated project is inactive (`status == 0`).
  - Active-only listing: `GET /api/v1/task-items` returns only `is_active = 1` items; deactivation sets `is_active = 0` permanently from UI; historical work logs, code changes, and db changes are fully preserved.
  - History retrieval via `TaskItemHistoryDaoImpl` native JDBC aggregation across `work_log`, `code_change`, and `db_change`.
  - Frontend Task Item listing (`/task-items`), Details view (`/task-items/:taskItemId`), Create/Edit modal with active-only project dropdown, Quick Status change modal with completion timestamp warning, Deactivation confirmation modal, and multi-tabbed History section.
  - 69/69 backend automated tests passing (25 auth + 22 project + 22 task item service/controller tests).
  - 38/38 frontend unit tests passing (12 foundation + 9 project + 17 task item tests), production build verified clean.
- Phase 7 (Work Log Management Module) completed and tested:
  - Backend `WorkLog` entity mapped to `work_log` table with sequence-driven code generation (`WL-000001` via `seq_work_log_code`).
  - REST endpoints for Create (`POST /api/v1/work-logs`), List with multi-field search, filters, pagination and sorting (`GET /api/v1/work-logs`), Details (`GET /api/v1/work-logs/{id}`), and Update (`PUT /api/v1/work-logs/{id}`).
  - Business rules: Active Task Item validation during creation; project derived through Task Item; immutable Task Item association; historical work logs remain viewable and editable even when their task item is inactive.
  - Time tracking: Start time default `09:00 AM`, time pair validation (both null or both populated), overnight duration calculation, backend-calculated duration (`totalHours`), derived day of week.
  - Frontend Work Log listing (`/work-logs`), Create page (`/work-logs/new`) with active-only task selection and auto-populated project, Edit page (`/work-logs/:workLogId/edit`) with read-only task/project banners, and Details page (`/work-logs/:workLogId`) with 4-section layout.
  - 88/88 backend automated tests passing (25 auth + 22 project + 22 task item + 19 work log tests).
  - 53/53 frontend unit tests passing (12 foundation + 9 project + 17 task item + 15 work log tests), production build verified clean.
- Phase 8 (Code Change Log Management Module) completed and tested:
  - Backend `CodeChange` and `CodeChangeFile` entities mapped to `code_change` and `code_change_file` tables with sequence-driven code generation (`CC-000001` via `seq_code_change_code`).
  - REST endpoints for Create (`POST /api/v1/code-changes`), List with multi-field search, status/environment/date filters, pagination and sorting (`GET /api/v1/code-changes`), Details (`GET /api/v1/code-changes/{id}`), Update (`PUT /api/v1/code-changes/{id}`), Exact SVN Commit ID Search (`GET /api/v1/code-changes/commit/{svnCommitId}`), Add Child File (`POST /api/v1/code-changes/{id}/files`), Update Child File (`PUT /api/v1/code-changes/{id}/files/{fileId}`), and Delete Child File (`DELETE /api/v1/code-changes/{id}/files/{fileId}`).
  - Strictly prohibited parent deletion endpoint (`DELETE /code-changes/{id}`) omitted by design.
  - Critical commit workflow: `COMMITTED` requires non-blank unique SVN commit ID; `UNCOMMITTED` requires null commit ID; `UNCOMMITTED` to `COMMITTED` transition updates existing record transactionally and preserves child file records; `COMMITTED` to `UNCOMMITTED` transition is rejected.
  - Integration: `WorkLogResponse.codeChangeIds` populated with associated code change IDs; Work Log association is immutable.
  - Frontend Code Change listing (`/code-changes`), Details view (`/code-changes/:codeChangeId`), Create page (`/code-changes/new`), Edit page (`/code-changes/:codeChangeId/edit`), Exact SVN search modal (`CommitSearchModal`), Add/Edit file modal (`FileFormModal`), and Delete file confirmation modal (`DeleteFileModal`).
  - 107/107 backend automated tests passing (25 auth + 22 project + 22 task item + 19 work log + 19 code change tests).
  - 74/74 frontend unit tests passing (12 foundation + 9 project + 17 task item + 15 work log + 21 code change tests), production build verified clean.
- Phase 9 (Database Change Log Management Module) completed and tested:
  - Backend `DbChange` entity mapped to `db_change` table with sequence-driven code generation (`DB-000001` via `seq_db_change_code`).
  - REST endpoints for Create (`POST /api/v1/db-changes`), List with search, filters (workLogId, taskItemId, projectId, dateFrom, dateTo, environment, databaseName, objectType), pagination and sorting (`GET /api/v1/db-changes`), Details (`GET /api/v1/db-changes/{id}`), and Update (`PUT /api/v1/db-changes/{id}`).
  - Deletion endpoint strictly omitted (prohibited).
  - Business rules: Immutable work log association; derived Task Item and Project context; required fields validated on backend and frontend; allowed databases and object types normalized to exact PostgreSQL check constraint casing; historical records remain editable even if Task Item or Project becomes inactive.
  - History & Work Log integration: `WorkLogResponse.dbChangeIds` populated; Work Log detail page displays Related Database Changes table with view links; Task Item history displays DB changes.
  - Frontend DB Change listing (`/db-changes`), Create page (`/db-changes/new`), Edit page (`/db-changes/:dbChangeId/edit`), and Details page (`/db-changes/:dbChangeId`).
  - 127/127 backend automated tests passing (25 auth + 22 project + 22 task item + 19 work log + 19 code change + 20 db change tests).
  - 88/88 frontend unit tests passing (12 foundation + 9 project + 17 task item + 15 work log + 21 code change + 14 db change tests), production build verified clean.
- Phase 10 (Pending Task Management Module) completed and tested:
  - Backend `PendingTask` entity mapped to `pending_task` table with sequence-driven code generation (`PT-000001` via `seq_pending_task_code`).
  - REST endpoints for Create (`POST /api/v1/pending-tasks`), List with multi-field search and filters (`GET /api/v1/pending-tasks`), Details (`GET /api/v1/pending-tasks/{id}`), Update (`PUT /api/v1/pending-tasks/{id}`), and Workflow Status Update (`PATCH /api/v1/pending-tasks/{id}/status`).
  - Strict database constraint `chk_pending_task_completed_at` compliance: backend automatically records `completed_at` when status transitions to `COMPLETED`, preserves timestamp when remaining `COMPLETED`, and clears it when transitioning away from `COMPLETED`.
  - Independent lifecycle: directly linked to Project, independent of Task Items and Work Logs.
  - Project validation & historical editing: creation requires an active project (`status = 1`); existing pending tasks remain accessible and editable even when the project becomes inactive.
  - Dynamic overdue calculation: tasks with `due_date < today` and status not `COMPLETED` or `CANCELLED` flagged as overdue; due today is not overdue; tasks without due dates are not overdue.
  - Default list behavior: defaults to `PENDING`, `IN_PROGRESS`, and `ON_HOLD` when no status filter is provided; explicit status and overdue filters supported.
  - Deletion strictly prohibited (no delete endpoint, returns HTTP 405 Method Not Allowed).
  - Frontend Pending Tasks listing (`/pending-tasks`), Details view (`/pending-tasks/:pendingTaskId`), Create page (`/pending-tasks/new`) with active-only project dropdown, Edit page (`/pending-tasks/:pendingTaskId/edit`) with read-only project context banner, and Quick Status Modal. Sidebar updated.
  - 145/145 backend automated tests passing (25 auth + 22 project + 22 task item + 19 work log + 19 code change + 20 db change + 18 pending task tests).
  - 104/104 frontend unit tests passing across 14 test files, production build verified clean.