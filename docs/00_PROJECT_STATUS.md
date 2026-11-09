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
- Development: In progress (Phase 1, Phase 2, Phase 3 & Phase 4 completed)

**Current Phase:** Phase 5 — Project Management

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

- Implement Phase 5: Project Management (Client Projects, Project Codes, Active/Inactive Statuses).
- Connect local PostgreSQL instance with live credentials.

## 12. Current Development State

- Phase 1 (Repository and Project Initialization) completed.
- Phase 2 (PostgreSQL and Flyway configuration with V1 migration) completed.
- Phase 3 (Backend Foundation & Single-User Authentication with JWT and Refresh Token Rotation) completed and tested.
- Phase 4 (Frontend Foundation & Single-User Authentication with React, Tailwind, and Axios Token Rotation) completed and tested.
- Backend foundation with Spring Boot 3.4.3 on Java 23.0.1 verified (25/25 automated tests pass).
- Frontend foundation with React + Vite on Node 22.17.1 verified (12/12 unit tests pass, production build clean).