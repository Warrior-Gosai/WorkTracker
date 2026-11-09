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

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/task-items` | Create Task Item |
| GET | `/task-items` | List Task Items |
| GET | `/task-items/{taskItemId}` | Task Item Details |
| PUT | `/task-items/{taskItemId}` | Update Task Item |
| PATCH | `/task-items/{taskItemId}/status` | Update Workflow Status |
| PATCH | `/task-items/{taskItemId}/activation` | Activate/Deactivate |
| GET | `/task-items/{taskItemId}/history` | Retrieve Task History |

List query parameters:

- `projectId`
- `taskType`
- `priority`
- `status`
- `isActive`
- `search`
- `page`
- `size`
- `sortBy`
- `direction`

Task status request:

```json
{
  "status": "COMPLETED"
}
```

Activation request:

```json
{
  "isActive": 0
}
```

Task history includes:
- Related Work Logs.
- Related Code Changes.
- Related DB Changes.

Pending Tasks are not included because they are independent records.

## 6. Work Log APIs

Base path: `/work-logs`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/work-logs` | Create Work Log |
| GET | `/work-logs` | List Work Logs |
| GET | `/work-logs/{workLogId}` | Work Log Details |
| PUT | `/work-logs/{workLogId}` | Update Work Log |

List query parameters:

- `taskItemId`
- `projectId`
- `workDate`
- `fromDate`
- `toDate`
- `environment`
- `workType`
- `status`
- `search`
- `page`
- `size`
- `sortBy`
- `direction`

Create request:

```json
{
  "taskItemId": 1,
  "workDate": "2026-11-09",
  "environment": "LOCAL",
  "workType": "DEVELOPMENT",
  "taskRequirement": "Implement project filtering",
  "workDescription": "Added project filtering functionality",
  "purposeReason": "Allow faster project discovery",
  "technologyArea": "React, Spring Boot",
  "startTime": "09:00:00",
  "endTime": null,
  "status": "IN_PROGRESS",
  "problemBlocker": null,
  "solutionResolution": null,
  "testingVerification": null,
  "resultOutcome": null,
  "pendingNextAction": "Complete integration testing",
  "notesRemarks": null
}
```

Rules:
- Task Item ID is required.
- Project is derived from the Task Item.
- Only active Task Items are available for new Work Logs.
- Work Log status is mandatory.
- Default status is IN_PROGRESS.
- Start Time defaults to 09:00 AM in the frontend.
- End Time is initially empty.
- Both time fields can be cleared together.
- Only one populated time field is invalid.
- Total Hours is calculated by the backend.
- Work Log association cannot be changed after creation.

Response data should include:
- Work Log ID and Code.
- Task Item details.
- Derived Project details.
- Work Date and Day.
- Work details and status.
- Start Time and End Time.
- Calculated Total Hours.
- Associated Code Change IDs.
- Associated DB Change IDs.

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

- `projectId`
- `priority`
- `status`
- `overdue`
- `dueDate`
- `fromDate`
- `toDate`
- `search`
- `page`
- `size`
- `sortBy`
- `direction`

Rules:
- Project ID is mandatory.
- Project association cannot be changed after creation.
- Pending Tasks are independent of Task Items and Work Logs.
- Overdue is calculated by the backend.
- A task is overdue when due_date is before today and status is neither COMPLETED nor CANCELLED.
- Due today is not overdue.

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

- `workLogId`
- `projectId`
- `changeStatus`
- `environment`
- `svnCommitId`
- `fromDate`
- `toDate`
- `search`
- `page`
- `size`
- `sortBy`
- `direction`

Rules:
- One Code Change represents one SVN commit.
- File details are optional.
- COMMITTED requires an SVN Commit ID.
- UNCOMMITTED requires a NULL SVN Commit ID.
- When an existing UNCOMMITTED record becomes COMMITTED, update the same record.
- Do not create a duplicate Code Change during conversion.
- Preserve existing file-detail records.
- Commit date/time must be recorded accurately.

Searching by commit ID must return associated:
- Code Change details.
- Work Log.
- Task Item.
- Project.
- DB Changes belonging to the Work Log.

## 9. Database Change APIs

Base path: `/db-changes`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/db-changes` | Create DB Change |
| GET | `/db-changes` | List DB Changes |
| GET | `/db-changes/{dbChangeId}` | DB Change Details |
| PUT | `/db-changes/{dbChangeId}` | Update DB Change |

List query parameters:

- `workLogId`
- `projectId`
- `environment`
- `databaseName`
- `objectType`
- `objectName`
- `fromDate`
- `toDate`
- `search`
- `page`
- `size`
- `sortBy`
- `direction`

Rules:
- Work Log ID is mandatory.
- Project and Date are derived through the Work Log relationship.
- One record represents one database object change.
- Environment belongs to each DB Change independently of the Work Log environment.

## 10. Dashboard APIs

Base path: `/dashboard`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard/summary` | Dashboard Cards |
| GET | `/dashboard/work-summary` | Work Summary |
| GET | `/dashboard/project-summary` | Project Summary |
| GET | `/dashboard/pending-summary` | Pending Task Summary |
| GET | `/dashboard/recent-activities` | Recent Activities |

### Summary response

```json
{
  "totalProjects": 5,
  "activeProjects": 4,
  "totalTaskItems": 80,
  "openTaskItems": 20,
  "totalWorkLogs": 150,
  "totalPendingTasks": 12,
  "overduePendingTasks": 3,
  "uncommittedCodeChanges": 4
}
```

Work Summary query parameters:
- `fromDate`
- `toDate`
- `projectId`

Work Summary should provide:
- Total Work Logs.
- Total calculated hours.
- Completed Work Logs.
- In-progress Work Logs.
- Blocked Work Logs.

Dashboard values must be calculated from existing business data. Do not create dashboard persistence tables.

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