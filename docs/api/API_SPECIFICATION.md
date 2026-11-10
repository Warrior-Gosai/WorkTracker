# DevWork Tracker — API Specification

## 1. API Overview

**Base URL (local):**

`http://localhost:8080/api/v1`

**API style:** REST  
**Data format:** JSON  
**Authentication:** JWT Access Token + Refresh Token Cookie  
**API documentation:** Swagger / OpenAPI

All resource endpoints must use consistent naming, response structures and error handling.

## 2. Common API Standards

### 2.1 HTTP Methods

| Method | Purpose |
|---|---|
| GET | Retrieve data |
| POST | Create a resource or perform an operation |
| PUT | Replace/update an existing resource |
| PATCH | Update selected fields or status |
| DELETE | Delete an explicitly permitted child resource |

Main business records must not have hard-delete endpoints.

### 2.2 Success Response

Standard response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2026-11-09T12:00:00Z"
}
```

Rules:
- `success` indicates operation outcome.
- `message` provides a readable result.
- `data` contains the requested resource or result.
- `timestamp` represents the response time.

### 2.3 Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ],
  "timestamp": "2026-11-09T12:00:00Z"
}
```

Validation errors should identify the relevant field when possible.

Never return stack traces, SQL errors or sensitive information.

### 2.4 HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful operation with no response body |
| 400 | Invalid request or validation failure |
| 401 | Authentication required or invalid |
| 403 | Authenticated but operation forbidden |
| 404 | Resource not found |
| 409 | Business rule or duplicate conflict |
| 500 | Unexpected server error |

Use status codes consistently across all modules.

## 3. Authentication APIs

Base path: `/auth`

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| POST | `/register` | Initial account setup | 201 |
| POST | `/login` | Authenticate | 200 |
| POST | `/refresh` | Rotate refresh token | 200 |
| POST | `/logout` | Revoke refresh token | 204 |
| GET | `/me` | Get account details | 200 |

### Register

Request:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "StrongPassword123",
  "confirmPassword": "StrongPassword123"
}
```

Rules:
- Only one account is permitted.
- Registration works only when no account exists.
- Password must satisfy the approved password rules.
- No public registration link.
- Concurrent first-account requests must be safely handled.

### Login

Request:

```json
{
  "usernameOrEmail": "admin",
  "password": "StrongPassword123"
}
```

Response data:

```json
{
  "accessToken": "<access-token>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Refresh token must be set through an HttpOnly cookie, not included in JSON.

### Refresh

- Reads refresh token from cookie.
- Validates and rotates it.
- Returns a new access token.
- Sets the replacement refresh-token cookie.
- Applies CSRF protection.

### Logout

- Revokes the current refresh token.
- Clears the refresh-token cookie.
- Returns 204.

### Current Account

Response data:

```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "status": 1
}
```

## 4. Project APIs

Base path: `/projects`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/projects` | Create Project |
| GET | `/projects` | List Projects |
| GET | `/projects/{projectId}` | Project Details |
| PUT | `/projects/{projectId}` | Update Project |

List query parameters:

- `search`
- `status`
- `page`
- `size`
- `sortBy`
- `direction`

Example:

`GET /projects?search=FlowTrack&status=1&page=0&size=10&sortBy=projectName&direction=asc`

### Create Project (`POST /projects`)

Request:

```json
{
  "projectName": "FlowTrack",
  "description": "Workflow management module",
  "remarks": "Repository at gitlab.internal/flowtrack"
}
```

Response (HTTP 201 Created):

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "description": "Workflow management module",
    "status": 1,
    "remarks": "Repository at gitlab.internal/flowtrack",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z"
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### List Projects (`GET /projects`)

Query parameters:
- `search`: string (matches against project name or project code)
- `status`: 0 (Inactive), 1 (Active), or omitted (All statuses)
- `page`: zero-based page index (default: 0)
- `size`: page size (default: 10, max: 100)
- `sortBy`: `createdAt` (default), `updatedAt`, `projectName`, `projectCode`, `status`, `projectId`
- `direction`: `desc` (default), `asc`

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "content": [
      {
        "projectId": 1,
        "projectCode": "PRJ-000001",
        "projectName": "FlowTrack",
        "description": "Workflow management module",
        "status": 1,
        "remarks": "Repository at gitlab.internal/flowtrack",
        "createdAt": "2026-11-09T12:00:00Z",
        "updatedAt": "2026-11-09T12:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### Project Details (`GET /projects/{projectId}`)

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "description": "Workflow management module",
    "status": 1,
    "remarks": "Repository at gitlab.internal/flowtrack",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z"
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### Update Project (`PUT /projects/{projectId}`)

Request:

```json
{
  "projectName": "FlowTrack Enterprise",
  "description": "Updated workflow description",
  "remarks": "Updated remarks"
}
```

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack Enterprise",
    "description": "Updated workflow description",
    "status": 1,
    "remarks": "Updated remarks",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:30:00Z"
  },
  "timestamp": "2026-11-09T12:30:00Z"
}
```

Rules:
- Project code is immutable and generated via sequence `seq_project_code`.
- Project status is not editable through the UI and remains unmodified during updates. Inactive projects can be edited.
- Project deletion is not supported.

Project status has no initial UI-based activation/deactivation workflow. It can be changed manually in the database.

## 5. Task Item APIs

Base path: `/task-items`

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| POST | `/task-items` | Create Task Item | 201 |
| GET | `/task-items` | List Active Task Items | 200 |
| GET | `/task-items/{taskItemId}` | Task Item Details | 200 |
| PUT | `/task-items/{taskItemId}` | Update Task Item | 200 |
| PATCH | `/task-items/{taskItemId}/status` | Update Workflow Status | 200 |
| PATCH | `/task-items/{taskItemId}/deactivate` | Deactivate Task Item | 200 |
| GET | `/task-items/{taskItemId}/history` | Retrieve Task Item History | 200 |

### Create Task Item (`POST /task-items`)

Request:

```json
{
  "projectId": 1,
  "taskType": "FEATURE",
  "title": "Implement authentication endpoints",
  "description": "JWT-based login and refresh rotation",
  "priority": "HIGH",
  "remarks": "Priority feature for Phase 3"
}
```

Rules:
- `projectId`: Required. Must reference an existing active (`status == 1`) project. Rejects with `400 Bad Request` if project is inactive.
- `taskType`: Required. Must be one of `FEATURE`, `BUG`, `IMPROVEMENT`, `REFACTORING`, `DOCUMENTATION`, `TESTING`, `DEPLOYMENT`, `RESEARCH`, `MAINTENANCE`.
- `title`: Required (1-200 characters).
- `description`: Optional text.
- `priority`: Optional (defaults to `MEDIUM`). Allowed: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `remarks`: Optional text.
- Task Item code is automatically generated via sequence `seq_task_item_code` (`TASK-%06d`).
- Initial status defaults to `OPEN`.
- Initial `is_active` defaults to `1`.
- `completed_at` is initialized to `null`. Direct assignment by frontend is not permitted.

Response (HTTP 201 Created):

```json
{
  "success": true,
  "message": "Task item created successfully",
  "data": {
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "taskType": "FEATURE",
    "title": "Implement authentication endpoints",
    "description": "JWT-based login and refresh rotation",
    "priority": "HIGH",
    "status": "OPEN",
    "isActive": 1,
    "completedAt": null,
    "remarks": "Priority feature for Phase 3",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z"
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### List Task Items (`GET /task-items`)

Retrieves active (`is_active = 1`) task items with pagination, multi-field search and filters. Inactive items are excluded.

Query parameters:
- `projectId`: Long (filters by project ID)
- `taskType`: String (`FEATURE`, `BUG`, etc.)
- `priority`: String (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `status`: String (`OPEN`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED`)
- `search`: String (matches against title, task item code, or project name)
- `page`: zero-based page index (default: 0)
- `size`: page size (default: 10, max: 100)
- `sortBy`: `createdAt` (default), `updatedAt`, `title`, `taskItemCode`, `priority`, `status`, `taskType`
- `direction`: `desc` (default), `asc`

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Task items retrieved successfully",
  "data": {
    "content": [
      {
        "taskItemId": 1,
        "taskItemCode": "TASK-000001",
        "projectId": 1,
        "projectCode": "PRJ-000001",
        "projectName": "FlowTrack",
        "taskType": "FEATURE",
        "title": "Implement authentication endpoints",
        "description": "JWT-based login and refresh rotation",
        "priority": "HIGH",
        "status": "OPEN",
        "isActive": 1,
        "completedAt": null,
        "remarks": "Priority feature for Phase 3",
        "createdAt": "2026-11-09T12:00:00Z",
        "updatedAt": "2026-11-09T12:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### Task Item Details (`GET /task-items/{taskItemId}`)

Returns details of an active task item. Returns `404 Not Found` if the item is deactivated (`is_active = 0`).

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Task item retrieved successfully",
  "data": {
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "taskType": "FEATURE",
    "title": "Implement authentication endpoints",
    "description": "JWT-based login and refresh rotation",
    "priority": "HIGH",
    "status": "OPEN",
    "isActive": 1,
    "completedAt": null,
    "remarks": "Priority feature for Phase 3",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z"
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### Update Task Item (`PUT /task-items/{taskItemId}`)

Updates mutable metadata of an active task item. Project ID, task code, status, and active flag cannot be changed via this endpoint.

Request:

```json
{
  "title": "Implement authentication endpoints and tests",
  "taskType": "FEATURE",
  "priority": "CRITICAL",
  "description": "Updated JWT-based login with rotation and unit tests",
  "remarks": "Updated remarks"
}
```

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Task item updated successfully",
  "data": {
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "taskType": "FEATURE",
    "title": "Implement authentication endpoints and tests",
    "description": "Updated JWT-based login with rotation and unit tests",
    "priority": "CRITICAL",
    "status": "OPEN",
    "isActive": 1,
    "completedAt": null,
    "remarks": "Updated remarks",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:45:00Z"
  },
  "timestamp": "2026-11-09T12:45:00Z"
}
```

### Update Workflow Status (`PATCH /task-items/{taskItemId}/status`)

Transitions the workflow status of an active task item.

Request:

```json
{
  "status": "COMPLETED"
}
```

Completion Timestamp Rules:
- If `status` transitions to `COMPLETED`: backend automatically sets `completed_at = Instant.now()`.
- If already `COMPLETED` and status remains `COMPLETED`: original `completed_at` is preserved.
- If status transitions away from `COMPLETED` (e.g. to `IN_PROGRESS` or `REOPENED`): backend automatically sets `completed_at = null`.
- These rules satisfy database check constraint `chk_task_item_completed_at`.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Task item status updated successfully",
  "data": {
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "taskType": "FEATURE",
    "title": "Implement authentication endpoints and tests",
    "description": "Updated JWT-based login with rotation and unit tests",
    "priority": "CRITICAL",
    "status": "COMPLETED",
    "isActive": 1,
    "completedAt": "2026-11-09T13:00:00Z",
    "remarks": "Updated remarks",
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T13:00:00Z"
  },
  "timestamp": "2026-11-09T13:00:00Z"
}
```

### Deactivate Task Item (`PATCH /task-items/{taskItemId}/deactivate`)

Deactivates a task item (`is_active = 0`).

Rules:
- Permanent in the UI: No reactivate endpoint or button exists. Reactivation requires direct database intervention.
- Historical data protection: Associated `work_log`, `code_change`, and `db_change` records are completely preserved and never deleted or modified.
- Deactivated items are excluded from future work log selection and active task listings.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Task item deactivated successfully",
  "data": null,
  "timestamp": "2026-11-09T13:15:00Z"
}
```

### Task Item History (`GET /task-items/{taskItemId}/history`)

Retrieves historical records linked to the task item across Work Logs, Code Changes, and DB Changes.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Task item history retrieved successfully",
  "data": {
    "workLogs": [
      {
        "workLogId": 1,
        "workDate": "2026-11-09",
        "description": "Configured Spring Security and JWT filter chain",
        "environment": "DEV",
        "workType": "DEVELOPMENT",
        "status": "COMPLETED",
        "totalHours": 4.5,
        "createdAt": "2026-11-09T10:00:00Z"
      }
    ],
    "codeChanges": [
      {
        "codeChangeId": 1,
        "workLogId": 1,
        "svnRevision": "1042",
        "commitMessage": "feat: add JWT authentication filter",
        "isCommitted": 1,
        "fileCount": 3,
        "createdAt": "2026-11-09T11:00:00Z"
      }
    ],
    "dbChanges": [
      {
        "dbChangeId": 1,
        "workLogId": 1,
        "environment": "DEV",
        "changeType": "TABLE_CREATION",
        "objectName": "app_user",
        "whatChanged": "Initial user table with unique constraint",
        "isExecuted": 1,
        "createdAt": "2026-11-09T11:30:00Z"
      }
    ]
  },
  "timestamp": "2026-11-09T13:20:00Z"
}
```

## 6. Work Log APIs

Base path: `/work-logs`

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| POST | `/work-logs` | Create Work Log | 201 |
| GET | `/work-logs` | List Work Logs | 200 |
| GET | `/work-logs/{workLogId}` | Work Log Details | 200 |
| PUT | `/work-logs/{workLogId}` | Update Work Log | 200 |

### Create Work Log (`POST /work-logs`)

Request:

```json
{
  "taskItemId": 1,
  "workDate": "2026-11-09",
  "environment": "LOCAL",
  "workType": "DEVELOPMENT",
  "taskRequirement": "Implement Work Log API and duration calculations",
  "workDescription": "Configured entities, repositories, service methods, and unit tests",
  "purposeReason": "Replace Daily Work Log Excel workbook",
  "technologyArea": "Spring Boot 3, JPA, PostgreSQL",
  "startTime": "09:00:00",
  "endTime": "18:00:00",
  "status": "COMPLETED",
  "problemBlocker": null,
  "solutionResolution": null,
  "testingVerification": "All 19 backend tests passed",
  "resultOutcome": "Feature complete and operational",
  "pendingNextAction": "Proceed to frontend integration",
  "notesRemarks": "Adheres strictly to 22-column Excel mapping"
}
```

Rules:
- `taskItemId`: Required. Must reference an existing active (`is_active = 1`) Task Item. Rejects with `400 Bad Request` if inactive.
- `project`: Automatically derived through Task Item.
- `workLogCode`: Auto-generated sequence code (`WL-%06d`) using `seq_work_log_code`.
- `workDate`: Optional (defaults to current date).
- `environment`: Optional (defaults to `LOCAL`). Allowed: `LOCAL`, `UAT`, `LIVE`.
- `workType`: Required. Allowed: `DEVELOPMENT`, `BUG_FIXING`, `TESTING`, `DEBUGGING`, `INVESTIGATION`, `ENHANCEMENT`, `DOCUMENTATION`, `DEPLOYMENT`, `MAINTENANCE`, `OTHER`.
- `status`: Optional (defaults to `IN_PROGRESS`). Allowed: `COMPLETED`, `IN_PROGRESS`, `BLOCKED`, `ON_HOLD`.
- Time Pairing Validation: Both `startTime` and `endTime` must either be provided or both be null/empty. Single-field population is rejected with `400 Bad Request`.
- Backend Duration Calculation: `totalHours` is calculated by the backend (not persisted directly in DB). Normal duration, overnight work periods (e.g. 22:00 to 02:00 -> 4.00h), and identical times (0.00h) are handled.
- Day of Week: Derived dynamically from `workDate` (e.g. `Monday`).

Response (HTTP 201 Created):

```json
{
  "success": true,
  "message": "Work log created successfully",
  "data": {
    "workLogId": 1,
    "workLogCode": "WL-000001",
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "taskItemTitle": "Implement Task Module",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "workDate": "2026-11-09",
    "day": "Monday",
    "environment": "LOCAL",
    "workType": "DEVELOPMENT",
    "taskRequirement": "Implement Work Log API and duration calculations",
    "workDescription": "Configured entities, repositories, service methods, and unit tests",
    "purposeReason": "Replace Daily Work Log Excel workbook",
    "technologyArea": "Spring Boot 3, JPA, PostgreSQL",
    "startTime": "09:00:00",
    "endTime": "18:00:00",
    "totalHours": 9.00,
    "status": "COMPLETED",
    "problemBlocker": null,
    "solutionResolution": null,
    "testingVerification": "All 19 backend tests passed",
    "resultOutcome": "Feature complete and operational",
    "pendingNextAction": "Proceed to frontend integration",
    "notesRemarks": "Adheres strictly to 22-column Excel mapping",
    "codeChangeIds": [],
    "dbChangeIds": [],
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z"
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### List Work Logs (`GET /work-logs`)

Query parameters:
- `search`: String (matches Work Log code or Task Requirement)
- `taskItemId`: Long
- `projectId`: Long (filtered through Task Item relationship)
- `workDateFrom`: String (YYYY-MM-DD)
- `workDateTo`: String (YYYY-MM-DD)
- `environment`: String (`LOCAL`, `UAT`, `LIVE`)
- `workType`: String
- `status`: String (`COMPLETED`, `IN_PROGRESS`, `BLOCKED`, `ON_HOLD`)
- `page`: zero-based page index (default: 0)
- `size`: page size (default: 10, max: 100)
- `sortBy`: `workDate` (default), `workLogId`, `workLogCode`, `environment`, `workType`, `status`, `createdAt`, `updatedAt`, `startTime`, `endTime`
- `direction`: `desc` (default), `asc`

Default sorting: `workDate DESC, workLogId DESC`.
Historical Work Logs remain visible regardless of whether their Task Item or Project has become inactive.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Work logs retrieved successfully",
  "data": {
    "content": [
      {
        "workLogId": 1,
        "workLogCode": "WL-000001",
        "taskItemId": 1,
        "taskItemCode": "TASK-000001",
        "taskItemTitle": "Implement Task Module",
        "projectId": 1,
        "projectCode": "PRJ-000001",
        "projectName": "FlowTrack",
        "workDate": "2026-11-09",
        "day": "Monday",
        "environment": "LOCAL",
        "workType": "DEVELOPMENT",
        "taskRequirement": "Implement Work Log API and duration calculations",
        "workDescription": "Configured entities, repositories, service methods, and unit tests",
        "purposeReason": "Replace Daily Work Log Excel workbook",
        "technologyArea": "Spring Boot 3, JPA, PostgreSQL",
        "startTime": "09:00:00",
        "endTime": "18:00:00",
        "totalHours": 9.00,
        "status": "COMPLETED",
        "problemBlocker": null,
        "solutionResolution": null,
        "testingVerification": "All 19 backend tests passed",
        "resultOutcome": "Feature complete and operational",
        "pendingNextAction": "Proceed to frontend integration",
        "notesRemarks": "Adheres strictly to 22-column Excel mapping",
        "codeChangeIds": [],
        "dbChangeIds": [],
        "createdAt": "2026-11-09T12:00:00Z",
        "updatedAt": "2026-11-09T12:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### Work Log Details (`GET /work-logs/{workLogId}`)

Returns full details of the Work Log, including derived Day, Task Item, Project, and backend-calculated Total Hours.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Work log retrieved successfully",
  "data": {
    "workLogId": 1,
    "workLogCode": "WL-000001",
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "taskItemTitle": "Implement Task Module",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "workDate": "2026-11-09",
    "day": "Monday",
    "environment": "LOCAL",
    "workType": "DEVELOPMENT",
    "taskRequirement": "Implement Work Log API and duration calculations",
    "workDescription": "Configured entities, repositories, service methods, and unit tests",
    "purposeReason": "Replace Daily Work Log Excel workbook",
    "technologyArea": "Spring Boot 3, JPA, PostgreSQL",
    "startTime": "09:00:00",
    "endTime": "18:00:00",
    "totalHours": 9.00,
    "status": "COMPLETED",
    "problemBlocker": null,
    "solutionResolution": null,
    "testingVerification": "All 19 backend tests passed",
    "resultOutcome": "Feature complete and operational",
    "pendingNextAction": "Proceed to frontend integration",
    "notesRemarks": "Adheres strictly to 22-column Excel mapping",
    "codeChangeIds": [],
    "dbChangeIds": [],
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T12:00:00Z"
  },
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### Update Work Log (`PUT /work-logs/{workLogId}`)

Updates mutable work log fields. Task Item association and Project remain immutable. Editing remains permitted even if the associated Task Item has become inactive.

Request:

```json
{
  "workDate": "2026-11-09",
  "environment": "UAT",
  "workType": "BUG_FIXING",
  "taskRequirement": "Updated requirement details",
  "workDescription": "Updated technical description",
  "purposeReason": "Updated purpose",
  "technologyArea": "Spring Boot 3",
  "startTime": "10:00:00",
  "endTime": "12:00:00",
  "status": "IN_PROGRESS",
  "problemBlocker": null,
  "solutionResolution": null,
  "testingVerification": null,
  "resultOutcome": null,
  "pendingNextAction": null,
  "notesRemarks": "Updated notes"
}
```

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Work log updated successfully",
  "data": {
    "workLogId": 1,
    "workLogCode": "WL-000001",
    "taskItemId": 1,
    "taskItemCode": "TASK-000001",
    "taskItemTitle": "Implement Task Module",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "workDate": "2026-11-09",
    "day": "Monday",
    "environment": "UAT",
    "workType": "BUG_FIXING",
    "taskRequirement": "Updated requirement details",
    "workDescription": "Updated technical description",
    "purposeReason": "Updated purpose",
    "technologyArea": "Spring Boot 3",
    "startTime": "10:00:00",
    "endTime": "12:00:00",
    "totalHours": 2.00,
    "status": "IN_PROGRESS",
    "problemBlocker": null,
    "solutionResolution": null,
    "testingVerification": null,
    "resultOutcome": null,
    "pendingNextAction": null,
    "notesRemarks": "Updated notes",
    "codeChangeIds": [],
    "dbChangeIds": [],
    "createdAt": "2026-11-09T12:00:00Z",
    "updatedAt": "2026-11-09T13:30:00Z"
  },
  "timestamp": "2026-11-09T13:30:00Z"
}
```

## 7. Pending Task APIs

Base path: `/pending-tasks`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/pending-tasks` | Create Pending Task |
| GET | `/pending-tasks` | List Pending Tasks |
| GET | `/pending-tasks/{pendingTaskId}` | Pending Task Details |
| PUT | `/pending-tasks/{pendingTaskId}` | Update Pending Task |
| PATCH | `/pending-tasks/{pendingTaskId}/status` | Update Status |

List query parameters:

- `projectId` (BIGINT)
- `priority` (LOW, MEDIUM, HIGH, CRITICAL)
- `status` (PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED, ALL; Default: active tasks PENDING, IN_PROGRESS, ON_HOLD)
- `overdue` (BOOLEAN: true = overdue only, false = not overdue)
- `dueDateFrom` / `fromDate` (LocalDate, `yyyy-MM-dd`)
- `dueDateTo` / `toDate` (LocalDate, `yyyy-MM-dd`)
- `search` (Search across code, title, description, remarks, project code/name)
- `page` (Default: 0)
- `size` (Default: 10, Max: 100)
- `sortBy` (Allowlist: `dueDate`, `pendingTaskId`, `pendingTaskCode`, `title`, `priority`, `status`, `completedAt`, `createdAt`, `updatedAt`; Default: `dueDate`)
- `direction` (asc, desc; Default: asc)

### Create Pending Task Request (`POST /api/v1/pending-tasks`)

```json
{
  "projectId": 1,
  "title": "Review database indexes and query execution plans",
  "description": "Analyze slow queries on work_log table using pg_stat_statements",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-11-20",
  "remarks": "Scheduled for review before release"
}
```

### Pending Task Response (`GET /api/v1/pending-tasks/{pendingTaskId}`)

```json
{
  "success": true,
  "message": "Pending task retrieved successfully",
  "data": {
    "pendingTaskId": 1,
    "pendingTaskCode": "PT-000001",
    "projectId": 1,
    "projectCode": "PRJ-000001",
    "projectName": "FlowTrack",
    "title": "Review database indexes and query execution plans",
    "description": "Analyze slow queries on work_log table using pg_stat_statements",
    "priority": "HIGH",
    "status": "PENDING",
    "dueDate": "2026-11-20",
    "completedAt": null,
    "remarks": "Scheduled for review before release",
    "overdue": false,
    "createdAt": "2026-11-10T18:00:00Z",
    "updatedAt": "2026-11-10T18:00:00Z"
  }
}
```

### Update Pending Task Request (`PUT /api/v1/pending-tasks/{pendingTaskId}`)

```json
{
  "title": "Review database indexes and vacuum configurations",
  "description": "Updated query execution review with autovacuum settings",
  "priority": "CRITICAL",
  "status": "IN_PROGRESS",
  "dueDate": "2026-11-25",
  "remarks": "Adjusted due date per team sync"
}
```

### Update Status Request (`PATCH /api/v1/pending-tasks/{pendingTaskId}/status`)

```json
{
  "status": "COMPLETED"
}
```

Rules:
- Project ID is mandatory upon creation and must reference an active Project (`status = 1`).
- Project association is permanent and immutable after creation (`projectId` cannot be updated).
- Pending Tasks are independent of Task Items and Work Logs (no `task_item_id` or `work_log_id`).
- Sequence-based code generation using PostgreSQL `seq_pending_task_code` (`PT-%06d`).
- Priority allowed values: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (Default: `MEDIUM`).
- Status allowed values: `PENDING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED` (Default: `PENDING`).
- Default list behavior: defaults to `PENDING`, `IN_PROGRESS`, `ON_HOLD` when no status filter is provided. Passing `status=ALL` or specific statuses allows accessing completed and cancelled tasks.
- Overdue calculation: A task is overdue when `dueDate < CURRENT_DATE` and status is neither `COMPLETED` nor `CANCELLED`.
  - A task due today is NOT overdue.
  - A task without a due date is NOT overdue.
  - Calculated dynamically by the backend; no overdue column stored in the database.
- Completion timestamp rules:
  - When status changes to `COMPLETED`: backend automatically sets `completed_at = Instant.now()`.
  - When status remains `COMPLETED`: original `completed_at` timestamp is preserved.
  - When status changes away from `COMPLETED`: backend automatically sets `completed_at = null`.
- Historical records remain accessible and editable even if the linked Project becomes inactive.
- Hard deletion is strictly prohibited (no delete endpoint, returns HTTP 405 Method Not Allowed). Cancelled status should be used instead.

## 8. Code Change APIs

Base path: `/code-changes`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/code-changes` | Create Code Change |
| GET | `/code-changes` | List Code Changes |
| GET | `/code-changes/{codeChangeId}` | Code Change Details |
| PUT | `/code-changes/{codeChangeId}` | Update Code Change |
| GET | `/code-changes/commit/{svnCommitId}` | Search by SVN Commit ID |

File-detail endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/code-changes/{codeChangeId}/files` | Add File Detail |
| PUT | `/code-changes/{codeChangeId}/files/{fileId}` | Update File Detail |
| DELETE | `/code-changes/{codeChangeId}/files/{fileId}` | Delete File Detail |

List query parameters:

- `workLogId` (BIGINT)
- `taskItemId` (BIGINT, derived via Work Log)
- `projectId` (BIGINT, derived via Work Log -> Task Item)
- `changeStatus` (COMMITTED, UNCOMMITTED)
- `environment` (LOCAL, UAT, LIVE)
- `svnCommitId` (VARCHAR)
- `dateFrom` (TIMESTAMPTZ / ISO-8601 String)
- `dateTo` (TIMESTAMPTZ / ISO-8601 String)
- `search` (Search by Code Change code or SVN Commit ID)
- `page` (Default: 0)
- `size` (Default: 10, Max: 100)
- `sortBy` (Allowlist: `codeChangeCode`, `changeDatetime`, `changeStatus`, `environment`, `svnCommitId`, `createdAt`; Default: `changeDatetime`)
- `direction` (asc, desc; Default: desc)

### Create Code Change Request (`POST /api/v1/code-changes`)

```json
{
  "workLogId": 1,
  "changeStatus": "COMMITTED",
  "svnCommitId": "r1042",
  "changeDatetime": "2026-11-09T22:30:00Z",
  "environment": "LOCAL",
  "remarks": "Implemented feature files",
  "files": [
    {
      "layer": "BACKEND",
      "technology": "Java",
      "filePath": "src/main/java/com/devworktracker/codechange/service/CodeChangeService.java",
      "whatChanged": "Added service methods",
      "whyChanged": "Task 8 requirement",
      "affectedFiles": "CodeChangeController.java",
      "remarks": "Reviewed"
    }
  ]
}
```

### Code Change Response (`GET /api/v1/code-changes/{codeChangeId}`)

```json
{
  "success": true,
  "message": "Code change retrieved successfully",
  "data": {
    "codeChangeId": 1,
    "codeChangeCode": "CC-000001",
    "workLogId": 1,
    "workLogCode": "WL-000001",
    "workDate": "2026-11-09",
    "taskItemId": 10,
    "taskItemCode": "TASK-000001",
    "taskItemTitle": "Task management implementation",
    "projectId": 2,
    "projectCode": "PRJ-000001",
    "projectName": "Internal System",
    "changeStatus": "COMMITTED",
    "svnCommitId": "r1042",
    "changeDatetime": "2026-11-09T22:30:00Z",
    "environment": "LOCAL",
    "remarks": "Implemented feature files",
    "createdAt": "2026-11-09T22:30:00Z",
    "updatedAt": "2026-11-09T22:30:00Z",
    "files": [
      {
        "codeChangeFileId": 1,
        "codeChangeId": 1,
        "layer": "BACKEND",
        "technology": "Java",
        "filePath": "src/main/java/com/devworktracker/codechange/service/CodeChangeService.java",
        "whatChanged": "Added service methods",
        "whyChanged": "Task 8 requirement",
        "affectedFiles": "CodeChangeController.java",
        "remarks": "Reviewed",
        "createdAt": "2026-11-09T22:30:00Z"
      }
    ]
  }
}
```

### Exact SVN Commit Search Response (`GET /api/v1/code-changes/commit/{svnCommitId}`)

```json
{
  "success": true,
  "message": "Commit search completed successfully",
  "data": {
    "codeChangeId": 1,
    "codeChangeCode": "CC-000001",
    "svnCommitId": "r1042",
    "changeDatetime": "2026-11-09T22:30:00Z",
    "environment": "LOCAL",
    "changeStatus": "COMMITTED",
    "workLogId": 1,
    "workLogCode": "WL-000001",
    "workDate": "2026-11-09",
    "taskItemId": 10,
    "taskItemCode": "TASK-000001",
    "taskItemTitle": "Task management implementation",
    "projectId": 2,
    "projectCode": "PRJ-000001",
    "projectName": "Internal System",
    "dbChanges": []
  }
}
```

Rules:
- One Code Change represents one SVN commit.
- File details are optional. Zero or multiple per Code Change.
- COMMITTED requires a non-blank, unique SVN Commit ID.
- UNCOMMITTED requires a NULL SVN Commit ID.
- When an existing UNCOMMITTED record becomes COMMITTED, update the same record transactionally.
- Do not create a duplicate Code Change during conversion.
- Preserve existing file-detail records during conversion.
- COMMITTED to UNCOMMITTED transition is strictly prohibited.
- Parent Code Change deletion (`DELETE /code-changes/{id}`) is strictly prohibited.
- Individual file entries may be added, updated, or deleted independently.
- Commit date/time must be recorded accurately.

Searching by commit ID returns associated:
- Code Change details.
- Work Log.
- Task Item.
- Project.
- DB Changes belonging to the Work Log (empty collection until Phase 9).

## 9. Database Change APIs

Base path: `/db-changes`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/db-changes` | Create DB Change |
| GET | `/db-changes` | List DB Changes |
| GET | `/db-changes/{dbChangeId}` | DB Change Details |
| PUT | `/db-changes/{dbChangeId}` | Update DB Change |

List query parameters:

- `workLogId` (BIGINT)
- `taskItemId` (BIGINT, derived through Work Log)
- `projectId` (BIGINT, derived through Work Log -> Task Item)
- `dateFrom` (LocalDate, `yyyy-MM-dd`)
- `dateTo` (LocalDate, `yyyy-MM-dd`)
- `environment` (LOCAL, UAT, LIVE)
- `databaseName` (Oracle, PostgreSQL, MySQL, SQL Server, MongoDB, Other)
- `objectType` (Table, Procedure, Function, Trigger, View, Package, Cursor, Sequence, Index, Constraint, Other)
- `search` (Search across code, object name, database, reasons, remarks, work log, task, project)
- `page` (Default: 0)
- `size` (Default: 10, Max: 100)
- `sortBy` (Allowlist: `createdAt`, `updatedAt`, `dbChangeId`, `dbChangeCode`, `environment`, `databaseName`, `objectType`, `objectName`; Default: `createdAt`)
- `direction` (asc, desc; Default: desc)

### Create DB Change Request (`POST /api/v1/db-changes`)

```json
{
  "workLogId": 1,
  "environment": "LOCAL",
  "databaseName": "PostgreSQL",
  "objectType": "Table",
  "objectName": "app_user",
  "whatChanged": "Added unique constraint on username",
  "whyChanged": "Security compliance and single-account restriction",
  "affectedObject": "auth_token",
  "remarks": "Verified via Flyway migration"
}
```

### DB Change Response (`GET /api/v1/db-changes/{dbChangeId}`)

```json
{
  "success": true,
  "message": "Database change retrieved successfully",
  "data": {
    "dbChangeId": 1,
    "dbChangeCode": "DB-000001",
    "workLogId": 1,
    "workLogCode": "WL-000001",
    "workDate": "2026-11-10",
    "taskItemId": 10,
    "taskItemCode": "TASK-000001",
    "taskItemTitle": "Task management implementation",
    "projectId": 2,
    "projectCode": "PRJ-000001",
    "projectName": "Internal System",
    "environment": "LOCAL",
    "databaseName": "PostgreSQL",
    "objectType": "Table",
    "objectName": "app_user",
    "whatChanged": "Added unique constraint on username",
    "whyChanged": "Security compliance and single-account restriction",
    "affectedObject": "auth_token",
    "remarks": "Verified via Flyway migration",
    "createdAt": "2026-11-10T17:45:00Z",
    "updatedAt": "2026-11-10T17:45:00Z"
  }
}
```

Rules:
- Work Log ID is mandatory upon creation and immutable during updates.
- Sequence-based code generation using PostgreSQL `seq_db_change_code` (`DB-%06d`).
- Project and Task Item context are derived through the Work Log relationship.
- Allowed environments: `LOCAL`, `UAT`, `LIVE`.
- Allowed database platforms: `Oracle`, `PostgreSQL`, `MySQL`, `SQL Server`, `MongoDB`, `Other`.
- Allowed object types: `Table`, `Procedure`, `Function`, `Trigger`, `View`, `Package`, `Cursor`, `Sequence`, `Index`, `Constraint`, `Other`.
- Required fields: `workLogId`, `environment`, `databaseName`, `objectType`, `objectName`, `whyChanged`.
- Optional fields: `whatChanged`, `affectedObject`, `remarks`.
- Historical DB changes remain accessible and editable even when the associated Task Item or Project is inactive.
- Delete endpoint (`DELETE /db-changes/{id}`) is strictly omitted and prohibited.

## 10. Dashboard APIs

Base path: `/dashboard`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard/summary` | Overall Dashboard Metric Cards |
| GET | `/dashboard/work-summary` | Work Log Summary, Total Hours & Chart Data |
| GET | `/dashboard/project-summary` | Project Breakdown & Task Completion Progress |
| GET | `/dashboard/pending-summary` | Pending Task Status Breakdown & Overdue Counts |
| GET | `/dashboard/recent-activities` | Chronological Feed of Recent Engineering Activities |

### 10.1 Overall Summary (`GET /api/v1/dashboard/summary`)

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalProjects": 5,
    "activeProjects": 4,
    "totalTaskItems": 80,
    "openTaskItems": 20,
    "totalWorkLogs": 150,
    "totalPendingTasks": 12,
    "overduePendingTasks": 3,
    "uncommittedCodeChanges": 4
  },
  "timestamp": "2026-11-10T18:45:00Z"
}
```

Metric Definitions:
- `totalProjects`: Total count of all projects in the system.
- `activeProjects`: Count of projects where `status = 1`.
- `totalTaskItems`: Total count of active task items (`is_active = 1`).
- `openTaskItems`: Count of active task items in open/active workflow (`is_active = 1 AND status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD')`). Completed and cancelled tasks are strictly excluded.
- `totalWorkLogs`: Total count of all recorded work logs.
- `totalPendingTasks`: Total count of all pending tasks.
- `overduePendingTasks`: Count of pending tasks where `due_date < CURRENT_DATE` and status is neither `COMPLETED` nor `CANCELLED`.
- `uncommittedCodeChanges`: Count of code changes where `change_status = 'UNCOMMITTED'`.

### 10.2 Work Summary (`GET /api/v1/dashboard/work-summary`)

Query Parameters:
- `dateFrom` / `fromDate` (LocalDate, `yyyy-MM-dd`): Filter work logs with `work_date >= dateFrom`.
- `dateTo` / `toDate` (LocalDate, `yyyy-MM-dd`): Filter work logs with `work_date <= dateTo`.
- `projectId` (BIGINT): Filter work logs belonging to task items under this project.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Work summary retrieved successfully",
  "data": {
    "totalWorkLogs": 10,
    "totalHours": 45.50,
    "completedWorkLogs": 6,
    "inProgressWorkLogs": 3,
    "blockedWorkLogs": 1,
    "onHoldWorkLogs": 0,
    "dailySummaries": [
      {
        "date": "2026-11-09",
        "hours": 8.00,
        "workLogsCount": 2
      },
      {
        "date": "2026-11-10",
        "hours": 7.50,
        "workLogsCount": 1
      }
    ]
  },
  "timestamp": "2026-11-10T18:45:00Z"
}
```

Duration & Aggregation Rules:
- `totalHours` is calculated dynamically by summing elapsed durations for all work logs having both non-null `start_time` and `end_time`.
- Overnight work periods (e.g. `22:00` to `02:00`) are accurately calculated across midnight.
- Each duration is rounded to 2 decimal places using `HALF_UP` rounding.
- Work logs without recorded time intervals are counted in `totalWorkLogs` but do not contribute fabricated hours.

### 10.3 Project Summary (`GET /api/v1/dashboard/project-summary`)

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Project summary retrieved successfully",
  "data": [
    {
      "projectId": 1,
      "projectCode": "PRJ-000001",
      "projectName": "FlowTrack Core Platform",
      "projectStatus": 1,
      "totalTaskItems": 20,
      "openTaskItems": 5,
      "completedTaskItems": 12,
      "totalWorkLogs": 45
    }
  ],
  "timestamp": "2026-11-10T18:45:00Z"
}
```

Rules:
- Sorted by active projects first (`status DESC`), then by `projectCode ASC`.
- Task counts query active tasks (`is_active = 1`).
- Avoids join duplication by running targeted repository count aggregations.

### 10.4 Pending Task Summary (`GET /api/v1/dashboard/pending-summary`)

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Pending task summary retrieved successfully",
  "data": {
    "pending": 5,
    "inProgress": 3,
    "onHold": 2,
    "completed": 7,
    "cancelled": 1,
    "overdue": 2,
    "total": 18
  },
  "timestamp": "2026-11-10T18:45:00Z"
}
```

### 10.5 Recent Activities (`GET /api/v1/dashboard/recent-activities`)

Query Parameters:
- `limit` (Integer, Default: 10, Max: 50): Number of recent activity items to return.

Response (HTTP 200 OK):

```json
{
  "success": true,
  "message": "Recent activities retrieved successfully",
  "data": [
    {
      "activityType": "PENDING_TASK",
      "recordId": 6,
      "recordCode": "PT-000001",
      "title": "Review database indexes and vacuum configurations",
      "projectName": "FlowTrack Core Platform",
      "activityDate": "2026-11-10T18:30:00Z",
      "navigationTarget": "/pending-tasks/6"
    },
    {
      "activityType": "DB_CHANGE",
      "recordId": 5,
      "recordCode": "DB-000001",
      "title": "PostgreSQL Table: app_user",
      "projectName": "FlowTrack Core Platform",
      "activityDate": "2026-11-10T18:25:00Z",
      "navigationTarget": "/db-changes/5"
    }
  ],
  "timestamp": "2026-11-10T18:45:00Z"
}
```

Activity Timestamp Choices:
- `PROJECT`: `updatedAt` (or `createdAt` if not updated).
- `TASK_ITEM`: `updatedAt` (or `createdAt`).
- `WORK_LOG`: `updatedAt` (or `createdAt`).
- `CODE_CHANGE`: `changeDatetime` (or `updatedAt` / `createdAt`).
- `DB_CHANGE`: `updatedAt` (or `createdAt`).
- `PENDING_TASK`: `updatedAt` (or `createdAt`).

## 11. Reports and Export APIs

Base path: `/exports`

| Method | Endpoint | Output |
|---|---|---|
| GET | `/exports/work-logs` | Daily Work Log XLSX |
| GET | `/exports/db-changes` | DB Change Log XLSX |
| GET | `/exports/code-changes` | Code File Change Log XLSX |
| GET | `/exports/all` | ZIP containing all three workbooks |

Optional export filters:
- `fromDate`
- `toDate`
- `projectId`

Export rules:
- Use Apache POI.
- Preserve original workbook columns and relevant formatting.
- Include headers even when no records match.
- Preserve original sheet names and required structure.
- Do not modify database data.
- Return correct file content type and download filename.
- Aggregate multiple Code Change File records into one Code Change export row.

## 12. Pagination Standards

All list endpoints should support server-side pagination.

Default:
- page = 0
- size = 10
- Maximum size = 100

Example:

`GET /work-logs?page=0&size=10&sortBy=workDate&direction=desc`

Paginated response data:

```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 150,
  "totalPages": 15,
  "first": true,
  "last": false
}
```

Rules:
- Validate page and size.
- Allowlist sort fields.
- Direction must be ASC or DESC.
- Use database-side pagination.
- Avoid loading all records into application memory.

## 13. Filtering and Searching Standards

- Use query parameters for filters.
- Support multiple filters together.
- Use consistent parameter naming.
- Ignore absent optional filters.
- Validate IDs and enum values.
- Use safe parameterized database queries.
- Debounce frontend search input.
- Preserve filter state when navigating where practical.

Search must be implemented according to the actual fields required by each module. Do not introduce expensive full-text or fuzzy-search infrastructure initially.

## 14. API Validation Standards

Use Jakarta Bean Validation.

Examples:
- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- `@Min`
- `@Max`
- Custom validation where necessary.

The backend must validate:
- Required fields.
- Enum values.
- Foreign-key references.
- Project and Task Item active status.
- Status transitions.
- Completion timestamps.
- Work Log time pairs.
- Committed/uncommitted Code Change rules.
- Pagination and sorting parameters.

Frontend validation improves usability but does not replace backend validation.

## 15. API Security Standards

- Protect all business endpoints.
- Require valid access JWT.
- Verify account status on every authenticated request.
- Apply CSRF protection to cookie-authenticated operations.
- Use restricted CORS.
- Never expose refresh tokens in JSON.
- Never expose passwords or password hashes.
- Return generic authentication errors where appropriate.

## 16. API Documentation

Use Swagger / OpenAPI.

Document:
- Endpoint description.
- HTTP method.
- Authentication requirement.
- Request DTO.
- Response DTO.
- Query parameters.
- Validation rules.
- Success status codes.
- Error status codes.
- Example payloads.

Swagger should be restricted appropriately in deployed environments.

## 17. API Implementation Rules

- Controllers must remain thin.
- Services own business logic.
- Repositories own persistence operations.
- Use request and response DTOs.
- Never expose JPA entities directly.
- Use transactions for multi-step operations.
- Use centralized exception handling.
- Do not duplicate business logic between controllers.
- Do not introduce endpoints outside approved scope without review.

## 18. Source of Truth

This API Specification must remain consistent with:
- Product Requirements.
- Business Rules.
- Database Design.
- System Architecture.
- Security Design.

If an endpoint or behaviour is unclear, request clarification before implementation rather than inventing a new requirement.