# DevWork Tracker — Testing Strategy

## 1. Purpose

This document defines the testing standards and verification process for DevWork Tracker.

Objectives:

- Verify business rules.
- Detect defects early.
- Protect existing functionality when new features are added.
- Verify API contracts.
- Validate database relationships and constraints.
- Verify authentication and security behaviour.
- Ensure Excel exports are accurate.
- Establish clear completion criteria for coding-agent tasks.

Testing must be part of feature development, not a separate activity performed only at the end.

## 2. Testing Approach

Use a layered testing strategy.

| Testing Level | Purpose | Main Technology |
|---|---|---|
| Unit Testing | Test individual methods and components | JUnit, Mockito, frontend testing tools |
| Integration Testing | Test interaction between application layers | Spring Boot Test |
| Repository Testing | Verify database queries and mappings | Spring Data JPA, PostgreSQL |
| API Testing | Verify endpoints, responses and validation | MockMvc / API testing |
| Frontend Testing | Verify UI behaviour and forms | Vitest, React Testing Library |
| End-to-End Testing | Verify complete user workflows | Playwright, when introduced |
| Manual Testing | Verify real application behaviour | Browser and API client |

Do not introduce unnecessary testing infrastructure before it is needed.

## 3. Backend Testing

### 3.1 Unit Testing

Frameworks:
- JUnit 5.
- Mockito.
- Spring Boot testing utilities where appropriate.

Test service-layer business logic independently.

Examples:

**Project**
- Create a project with valid data.
- Reject missing project name.
- Generate unique project codes.
- Reject invalid status values.

**Task Item**
- Create a task under an active project.
- Reject creation under an inactive project.
- Verify status transitions.
- Verify completion timestamp behaviour.
- Verify activation and deactivation.
- Ensure inactive tasks are excluded from normal new Work Log selection.

**Work Log**
- Create a Work Log for an active Task Item.
- Derive the project through the Task Item.
- Reject a missing task requirement.
- Verify mandatory status and default IN_PROGRESS behaviour.
- Verify both time fields are supplied together or both cleared.
- Verify duration calculation.
- Verify overnight duration.
- Verify identical start and end times produce zero duration.
- Verify multiple Work Logs can exist on the same date.
- Verify Work Log status does not automatically change Task Item status.

**Pending Task**
- Create a Pending Task under a valid Project.
- Verify due-date behaviour.
- Verify overdue calculation.
- Verify status transitions and completion timestamps.
- Verify independence from Task Items and Work Logs.

**Code Change**
- Create UNCOMMITTED records.
- Create COMMITTED records with valid SVN Commit IDs.
- Reject COMMITTED records without commit IDs.
- Verify unique commit IDs.
- Convert an existing UNCOMMITTED record to COMMITTED.
- Verify the existing record is updated rather than duplicated.
- Verify associated file records remain available.

**DB Change**
- Create multiple DB Changes for one Work Log.
- Validate required fields.
- Verify environment and object type values.
- Verify project and date are derived correctly.

### 3.2 Repository Testing

Verify:
- Entity mappings.
- Primary and foreign keys.
- Unique constraints.
- Custom query results.
- Pagination.
- Sorting.
- Filtering.
- Relationship loading.
- Database constraint violations.

Use PostgreSQL for database integration tests.

Do not rely exclusively on an in-memory database for PostgreSQL-specific behaviour.

### 3.3 Integration Testing

Use Spring Boot Test and appropriate integration-testing tools.

Verify complete backend flows involving:
- Controller.
- Service.
- Repository.
- PostgreSQL.

Important scenarios:
- Project creation and retrieval.
- Task Item creation and status updates.
- Work Log creation and retrieval.
- Related Code Change and DB Change creation.
- Pending Task management.
- Dashboard summary calculations.
- Excel export data retrieval.
- Authentication and refresh-token rotation.

Use Testcontainers with PostgreSQL when practical to provide isolated, realistic database tests.

## 4. Authentication and Security Testing

Authentication is a critical part of this application.

Test the following cases.

### Registration
- First account can be registered.
- Second account registration is rejected.
- Hidden registration route is not exposed through normal navigation.
- Backend enforces the one-account limit.
- Concurrent registration attempts cannot create multiple accounts.
- Duplicate username or email is rejected case-insensitively.

### Login
- Login using username.
- Login using email.
- Invalid password is rejected.
- Invalid username/email is rejected.
- Inactive account cannot log in.
- Password is never returned in responses.

### Access Token
- Valid access token permits authenticated requests.
- Missing token is rejected.
- Invalid token is rejected.
- Expired token is rejected.
- Inactive account is rejected.

### Refresh Token
- Valid refresh token produces a new access token.
- Refresh token rotation works.
- Previous refresh token cannot be reused.
- Expired refresh token is rejected.
- Revoked refresh token is rejected.
- Reuse detection revokes the token family.
- Concurrent refresh requests are handled safely.
- Logout revokes the active refresh token.

### Cookie and Request Security
- Refresh cookie uses the approved attributes.
- CSRF protection applies to cookie-authenticated refresh and logout operations.
- Untrusted CORS origins are rejected.
- Credentials are not accepted from wildcard origins.

Do not log real passwords or raw tokens during testing.

## 5. API Testing

Verify every implemented API endpoint.

For each endpoint, test:

1. Valid request.
2. Invalid request.
3. Missing required fields.
4. Invalid field values.
5. Missing authentication.
6. Invalid authentication.
7. Resource not found.
8. Duplicate or conflicting data.
9. Correct HTTP status.
10. Correct response structure.

### HTTP Status Verification

| Scenario | Expected Status |
|---|---:|
| Successful retrieval | 200 |
| Successful creation | 201 |
| Successful update | 200 |
| Successful deletion without response body | 204 |
| Invalid request | 400 |
| Unauthenticated request | 401 |
| Forbidden operation | 403 |
| Resource not found | 404 |
| Duplicate or conflicting operation | 409 |
| Unexpected server error | 500 |

Follow the API Specification if a particular endpoint defines a more specific response.

### Pagination and Filtering

Test:
- Default page number.
- Default page size.
- Maximum page size.
- Invalid page values.
- Invalid sort fields.
- Ascending and descending sorting.
- Multiple filters together.
- Empty results.
- Date-range boundaries.
- Project-based filtering.

Verify that pagination occurs in the database rather than loading every record into memory.

## 6. Frontend Testing

Frameworks:
- Vitest.
- React Testing Library.

### Component Testing

Test important reusable components:
- Buttons.
- Inputs.
- Select controls.
- Modals.
- Tables.
- Pagination.
- Loading indicators.
- Empty states.
- Error messages.
- Toast notifications.

### Form Testing

Verify:
- Required-field validation.
- Invalid field values.
- Correct default values.
- Server-side validation messages.
- Submission loading state.
- Duplicate submission prevention.
- Successful save behaviour.
- Failed save behaviour.

### Feature Testing

**Authentication**
- Login form validation.
- Login success and failure.
- Logout behaviour.
- Protected-route navigation.
- Expired access-token refresh behaviour.

**Projects**
- Project list.
- Search and filtering.
- Project creation and update.
- Project detail navigation.

**Task Items**
- Task creation.
- Project selection.
- Status updates.
- Activation and deactivation.
- Task history.

**Work Logs**
- Task selection.
- Automatic Project display.
- Default date.
- Default LOCAL environment.
- Default 09:00 AM start time.
- Optional end time.
- Both time fields cleared together.
- Mandatory Work Log status.
- Default IN_PROGRESS status.
- Related Code Change and DB Change display.

**Pending Tasks**
- Project association.
- Status updates.
- Due-date display.
- Overdue indicators.

**Code Changes**
- COMMITTED and UNCOMMITTED forms.
- Conditional SVN Commit ID validation.
- Optional file details.
- Conversion from UNCOMMITTED to COMMITTED.

**DB Changes**
- Database dropdown.
- Environment dropdown.
- Object type dropdown.
- Required-field validation.

**Reports**
- Individual exports.
- ZIP export.
- Export filters.
- Download failure handling.

## 7. Excel Export Testing

Excel exports must be tested independently from ordinary API responses.

### 7.1 Daily Work Log

Verify:
- Exactly 22 columns.
- Correct column order.
- Correct headers.
- Correct Work ID.
- Derived Project and Module / Feature.
- Correct Date and Day.
- Correct duration.
- Multiple Code Change IDs in one cell.
- Multiple DB Change IDs in one cell.
- Blank optional values.

### 7.2 DB Change Log

Verify:
- Exactly 12 columns.
- Correct column order.
- Correct headers.
- Correct Work ID.
- Derived Project and Date.
- Correct environment and database values.
- One row per DB Change.

### 7.3 Code File Change Log

Verify:
- Exactly 13 columns.
- Original 11 columns preserved.
- SVN Commit ID and Change Status included.
- One row per Code Change.
- Multiple file records aggregated using newline-separated values.
- Empty file details produce blank file columns.
- COMMITTED records contain commit IDs.
- UNCOMMITTED records have blank commit IDs.
- Conversion does not duplicate rows.

### 7.4 Workbook Structure and Formatting

Compare generated files against the original workbooks.

Verify:
- Worksheet names.
- Column names and order.
- Header styles.
- Column widths.
- Date and time formats.
- Number formats.
- Text wrapping.
- Filters.
- Freeze panes.
- Existing formulas and dropdown validations where applicable.

The exact formatting baseline must be established by inspecting the original XLSX files during implementation.

### 7.5 ZIP Export

Verify:
- ZIP opens successfully.
- All three XLSX files exist.
- Each workbook opens successfully.
- Filters apply consistently.
- Empty result sets still produce valid workbooks.
- No unrelated files are included.

## 8. Database Migration Testing

Verify Flyway migrations against a clean PostgreSQL database.

Test:
- Initial migration succeeds.
- All nine tables are created.
- Primary keys are correct.
- Foreign keys are correct.
- Unique constraints work.
- CHECK constraints work.
- Indexes are created.
- Sequences generate codes correctly.
- Timestamp triggers update records correctly.
- Hibernate schema validation succeeds.

Also verify:
- Migration can be applied to a clean database.
- Migration history is recorded.
- Already-applied migrations are not silently modified.
- Subsequent schema changes use new migration versions.

Do not test schema deployment only against a database containing old manual changes.

## 9. Dashboard and Reporting Testing

Verify:
- Total Projects.
- Active Projects.
- Total Task Items.
- Open Task Items.
- Total Work Logs.
- Total Pending Tasks.
- Overdue Pending Tasks.
- Uncommitted Code Changes.

Also verify:
- Date filters.
- Project filters.
- Work summary calculations.
- Project summary.
- Pending Task summary.
- Recent activities.

Ensure dashboard totals match the underlying database records.

Avoid counting the same parent record multiple times due to joins with child records.

## 10. End-to-End Testing

Introduce Playwright when the core application workflows are ready.

Important end-to-end scenarios:

### Scenario 1: Initial Setup
1. Open hidden setup route.
2. Register the first account.
3. Verify normal registration is unavailable afterward.
4. Log in.

### Scenario 2: Project and Task
1. Create a Project.
2. Create a Task Item under that Project.
3. Verify both appear in their respective lists.

### Scenario 3: Work Log
1. Open New Work Log.
2. Select a Task Item.
3. Verify Project auto-populates.
4. Enter work details.
5. Save the Work Log.
6. Verify it appears in history.

### Scenario 4: Pending Task
1. Create a Pending Task.
2. Associate it with a Project.
3. Update its status.
4. Verify overdue behaviour.

### Scenario 5: Code and DB Changes
1. Add an UNCOMMITTED Code Change.
2. Add optional file details.
3. Convert it to COMMITTED.
4. Add a DB Change.
5. Verify both are associated with the correct Work Log.

### Scenario 6: Exports
1. Export Daily Work Log.
2. Export DB Change Log.
3. Export Code File Change Log.
4. Export all three as ZIP.
5. Open the generated workbooks and verify their contents.

## 11. Test Data Management

- Use dedicated test databases or isolated containers.
- Avoid using actual production data.
- Create predictable test data.
- Clean up test data between independent test cases.
- Do not rely on execution order.
- Use realistic dates and relationships.
- Include boundary cases and invalid values.

Tests must not accidentally modify local development data.

## 12. Test Execution Commands

### Backend

Windows:

```bash
cd backend
mvnw.cmd test
mvnw.cmd clean verify
```

Linux/macOS:

```bash
cd backend
./mvnw test
./mvnw clean verify
```

### Frontend

```bash
cd frontend
npm run test
npm run build
```

Exact test scripts must be configured in the frontend `package.json`.

End-to-end tests will have their own execution command when Playwright is introduced.

## 13. Testing During Development

Follow this process for each feature:

1. Understand the requirement.
2. Identify business rules and edge cases.
3. Implement the feature.
4. Write or update unit tests.
5. Write integration tests where needed.
6. Test relevant API behaviour.
7. Test frontend behaviour.
8. Run relevant regression tests.
9. Run the required build.
10. Report the results.

Do not wait until the entire application is completed to start testing.

## 14. Coding Agent Completion Requirements

A coding agent cannot mark a task complete merely because the code was written.

The completion report must include:

- Task implemented.
- Files created.
- Files modified.
- Important implementation decisions.
- Tests added.
- Tests executed.
- Test results.
- Build results.
- Known limitations.
- Any unresolved issues.

If tests cannot be executed because of an environment limitation, the agent must report that honestly.

Do not claim tests passed when they were not run.

Do not skip tests silently.

## 15. Minimum Acceptance Criteria

A task is acceptable when:

- [ ] Approved requirements are implemented.
- [ ] Relevant business rules are satisfied.
- [ ] Input validation is implemented.
- [ ] Error handling is correct.
- [ ] Security requirements are respected.
- [ ] Relevant tests are added or updated.
- [ ] Relevant tests pass.
- [ ] Application builds successfully.
- [ ] No unrelated functionality is broken.
- [ ] Completion report is provided.
- [ ] Any unresolved issue is documented.

## 16. Source of Truth

Use this document together with:

- Product Requirements.
- Business Rules.
- Database Design.
- System Architecture.
- Security Design.
- API Specification.
- Screen Functionality.
- Excel Import/Export Specification.
- Development Setup.
- Coding Standards.

If a test reveals a conflict between implementation and approved requirements, stop and resolve the requirement before changing expected behaviour.