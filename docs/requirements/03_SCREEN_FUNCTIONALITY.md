# DevWork Tracker — Screen Functionality Specification

## 1. General UI Standards

### 1.1 Design

- Modern, clean and minimal SaaS dashboard.
- Light theme by default.
- Optional dark theme can be considered later.
- Responsive layout for desktop, tablet and mobile.
- Consistent spacing, typography, buttons, tables and forms.
- Use the approved design colours and Inter font.

### 1.2 Common Screen Behaviour

Every applicable screen must support:
- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Form validation.
- Confirmation before important destructive actions.
- Consistent pagination.
- Responsive layouts.

### 1.3 Navigation Layout

Sidebar:
1. Dashboard
2. Projects
3. Task Items
4. Work Logs
5. Pending Tasks
6. Code Changes
7. DB Changes
8. Reports & Exports
9. Settings

Top bar:
- Page title and breadcrumb.
- Quick New Work Log action.
- Account/profile menu.
- Logout.

## 2. Initial Setup Screen

Route: `/setup`

Purpose: Create the first application account.

Fields:
- Username.
- Email.
- Password.
- Confirm Password.

Actions:
- Register Account.

Rules:
- Do not show a public registration link.
- Route is usable only when no account exists.
- Backend must enforce the single-account restriction.
- After successful registration, redirect to Login.
- If an account already exists, prevent registration and redirect to Login.

## 3. Login Screen

Route: `/login`

Fields:
- Username or Email.
- Password.

Actions:
- Login.
- Show/hide password.

Behaviour:
- Validate required fields.
- Show generic invalid-credentials feedback.
- Successful login redirects to Dashboard.
- Keep access token in memory.
- Refresh token is handled through the HttpOnly cookie.
- Failed authentication must not expose whether username or password was incorrect.

## 4. Dashboard

Route: `/dashboard`

Purpose: Centralized engineering overview, high-level metrics, work hour trends, project performance, pending tasks, and recent activities.

### 4.1 Summary Cards

Eight interactive metric cards linking to corresponding filtered list pages:
1. **Total Projects**: Total count of all projects (`/projects`).
2. **Active Projects**: Count of active projects with status = 1 (`/projects`).
3. **Total Task Items**: Count of active task items (`/task-items`).
4. **Open Task Items**: Count of active task items with open workflow statuses (`OPEN`, `IN_PROGRESS`, `ON_HOLD`) (`/task-items`).
5. **Total Work Logs**: Count of all logged development sessions (`/work-logs`).
6. **Total Pending Tasks**: Count of independent reminders and follow-up items (`/pending-tasks`).
7. **Overdue Pending Tasks**: Count of overdue pending tasks with prominent alert highlight (`/pending-tasks?overdue=true`).
8. **Uncommitted Code Changes**: Count of code changes with uncommitted status (`/code-changes`).

### 4.2 Quick Action Shortcuts

One-click navigation shortcuts to record new development items:
- **Log Work**: Navigates to `/work-logs/new`.
- **New Task Item**: Navigates to `/task-items`.
- **New Pending Task**: Navigates to `/pending-tasks/new`.
- **Log Code Change**: Navigates to `/code-changes/new`.
- **Log DB Change**: Navigates to `/db-changes/new`.
- **New Project**: Navigates to `/projects`.

### 4.3 Work & Hours Summary

Provides comprehensive time and status tracking:
- **Filters**: Project select dropdown, Start Date picker, End Date picker, and clear filters action.
- **Key Metrics**: Total Hours (formatted to 2 decimal places), Total Logs count, Completed count, In Progress count, Blocked count, and On Hold count.
- **Visualizations**:
  - **Daily Logged Hours**: Recharts bar chart displaying daily elapsed hours per date across the filtered interval.
  - **Status Breakdown**: Recharts donut chart illustrating the distribution between Completed, In Progress, Blocked, and On Hold work logs.
- Empty states displayed when no work logs match the chosen date/project filters.

### 4.4 Project Performance & Breakdown

Table summarizing project health and progress:
- Project Code and Project Name (linking to Project Details `/projects/:projectId`).
- Status Badge: Active or Inactive.
- Task Progress: Completed / Total tasks counter, percentage done, and responsive progress bar.
- Open tasks counter.
- Associated Work Logs counter.

### 4.5 Pending Task Reminders

Status overview and deadline monitoring:
- Overdue Alert Banner: Prominently displayed when overdue tasks exist, linking directly to overdue filter.
- Status Grid: Interactive cards for Pending, In Progress, On Hold, Completed, Cancelled, and Total Tasks, linking to the filtered list.

### 4.6 Recent Engineering Activity Feed

Chronological activity stream aggregating items across all six modules:
- Distinct iconography and color badges for Project, Task Item, Work Log, Code Change, DB Change, and Pending Task.
- Record Code, Title, Associated Project, and relative timestamp (e.g., "5m ago", "2h ago").
- Direct navigation links to record detail views (`/projects/:id`, `/task-items/:id`, `/work-logs/:id`, `/code-changes/:id`, `/db-changes/:id`, `/pending-tasks/:id`).

## 5. Projects Screen

Route: `/projects`

### 5.1 Project List

Display columns:
- Project Code.
- Project Name.
- Status.
- Description.
- Created Date.
- Actions.

Features:
- Search by project name or code.
- Filter by status.
- Pagination.
- Open Project Details.

### 5.2 Create / Edit Project Form

Fields:
- Project Name (required).
- Description (optional).
- Remarks (optional).

Project Code is generated by backend.

Project status is not editable through the initial UI.

### 5.3 Project Details

Route: `/projects/:projectId`

Display:
- Project information.
- Related Task Items.
- Related Work Logs.
- Related Pending Tasks.
- Related Code Changes.
- Related DB Changes.

Use tabs or clear sections.

Provide navigation to related records.

## 6. Task Items Screen

Route: `/task-items`

### 6.1 Task Item List

Columns:
- Task Item Code.
- Title & Project (with Project Code badge).
- Task Type (color-coded badge).
- Priority (color-coded badge).
- Workflow Status (color-coded badge).
- Created Date.
- Actions (Quick Status Change, View Details, Edit, Deactivate).

Filters:
- Search (matches title, task code, or project name with debouncing).
- Project (dropdown populated from active projects).
- Task Type (`FEATURE`, `BUG`, `IMPROVEMENT`, `REFACTORING`, `DOCUMENTATION`, `TESTING`, `DEPLOYMENT`, `RESEARCH`, `MAINTENANCE`).
- Priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- Workflow Status (`OPEN`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED`).

Note: List exclusively displays active task items (`is_active = 1`). Deactivated tasks are excluded from the main table.

### 6.2 Create / Edit Form

Modal fields:
- Project (required, dropdown lists only active projects `status = 1`).
- Task Type (required, select dropdown).
- Title (required, 1-200 characters).
- Priority (required, select dropdown, default `MEDIUM`).
- Description (optional, textarea).
- Remarks (optional, textarea).

Rules:
- Task Item Code is auto-generated by the backend sequence (`TASK-%06d`).
- On Edit, Project cannot be changed, and Status/Active flags are managed via specialized workflows.

### 6.3 Task Item Actions

- Create: Opens Create Task Item modal with active projects.
- Edit: Opens Edit modal for existing active task item.
- Quick Status Change: Opens workflow modal to transition status between `OPEN`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED`. Informs the user when `completed_at` timestamp will be automatically set or cleared.
- Deactivate: Opens confirmation modal requiring explicit confirmation. Explains that deactivation is permanent in the UI (reactivation requires direct database intervention) and confirms that all historical work logs, code changes, and db changes are fully preserved.
- View Details: Navigates to `/task-items/:taskItemId`.

Do not provide hard deletion or UI-based reactivation.

### 6.4 Task Item Details

Route: `/task-items/:taskItemId`

Display:
- Header with Task Code, Title, Project Name, and quick status badges.
- Core attributes: Task Type, Priority, Status, Created Date, Updated Date, and Completed Date (if status is `COMPLETED`).
- Description and Remarks.
- Action buttons: Quick Status Change, Edit Task, and Deactivate Task.

History Section:
- Integrated history view with tabs:
  - Work Logs: Shows related work log entries (date, description, environment, work type, status, total hours).
  - Code Changes: Shows related SVN revisions, commit messages, committed status, and affected file counts.
  - DB Changes: Shows related database alterations (environment, change type, object name, change details, execution status).
- Pending Tasks must not appear as Task Item history.
- Historical data is preserved regardless of whether the task item was modified or deactivated.

## 7. Work Logs Screen

Route: `/work-logs`

### 7.1 Work Log List

Columns:
- Work Log Code.
- Date.
- Project.
- Task Item.
- Work Type.
- Environment.
- Status.
- Total Hours.
- Actions.

Filters:
- Project.
- Task Item.
- Date range.
- Environment.
- Work Type.
- Status.
- Search.

Default sorting:
- Work Date descending.
- Work Log ID descending.

### 7.2 Create Work Log

Route: `/work-logs/new`

The form must be quick to complete, ideally within 3–5 minutes.

#### Section A — Basic Information

Fields:
- Task Item (required).
- Project (automatically populated from Task Item).
- Work Date (default today).
- Environment (default LOCAL).
- Work Type (required).

Only active Task Items should be selectable.

#### Section B — Work Details

Fields:
- Task / Requirement (required).
- Work Description (optional).
- Purpose / Reason (optional).
- Technology / Area (optional).

#### Section C — Time Tracking

Fields:
- Start Time (default 09:00 AM).
- End Time (initially empty).
- Total Hours (calculated, read-only).

Rules:
- Both time fields are optional.
- Both can be cleared together.
- If only one is populated, validation must fail.
- Calculate duration when both are populated.
- Support overnight work.
- Equal start and end times mean zero duration.

#### Section D — Outcome

Fields:
- Status (required, default IN_PROGRESS).
- Problem / Blocker.
- Solution / Resolution.
- Testing / Verification.
- Result / Outcome.
- Pending / Next Action.
- Notes / Remarks.

### 7.3 Edit Work Log

Route: `/work-logs/:workLogId/edit`

Allows editing mutable work log fields:
- Task Item and Project are displayed in read-only banners (immutable association).
- Editing remains permitted even if the associated Task Item has become inactive.
- Supports clearing start/end times together.
- Validates time pairing and required fields.

### 7.4 Form Actions

- Save / Update Work Log.
- Cancel.

After successful creation/update:
- Show toast feedback with generated or updated Work Log Code.
- Navigate to Work Log list or details.

### 7.5 Work Log Details

Route: `/work-logs/:workLogId`

Displays full saved information divided into clean cards:
- Header with Work Log code, work date, day, status, environment, and Edit action.
- Linked Task Item and Project summaries (with links).
- Work Details: Task Requirement, Technical Description, Purpose/Reason, Technology/Area.
- Time Tracking: Start Time, End Time, and backend-calculated Total Hours.
- Verification & Outcomes: Problem/Blocker, Solution/Resolution, Testing/Verification, Result/Outcome, Pending/Next Action, Notes/Remarks.
- Audit timestamps (created and updated).

## 8. Pending Tasks Screen

Routes:
- `/pending-tasks` (List)
- `/pending-tasks/new` (Create)
- `/pending-tasks/:pendingTaskId` (Details)
- `/pending-tasks/:pendingTaskId/edit` (Edit)

Purpose: Track follow-up work, reminders, and action items independently of Work Logs and Task Items.

### 8.1 List Page (`/pending-tasks`)

Columns:
- Pending Task Code (links to details).
- Project (Code and Name).
- Title & Description snippet (links to details).
- Priority badge (Low, Medium, High, Critical).
- Status badge (Pending, In Progress, On Hold, Completed, Cancelled) with click-to-change action.
- Due Date (or "No due date").
- Overdue Indicator (prominent badge when overdue).
- Actions: Quick Status Change, View Details, Edit.

Filters:
- Search (across code, title, description, remarks, project name/code).
- Project dropdown (all projects).
- Priority dropdown (All, Low, Medium, High, Critical).
- Status dropdown (Default: Active Tasks [Pending, In Progress, On Hold]; All Statuses; individual statuses).
- Overdue dropdown (All Due Dates, Overdue Only, Not Overdue).
- Due Date Range (from date and to date).
- Reset filters button.

Pagination & Sorting:
- Server-side pagination with selectable page size (10, 25, 50).
- Sortable columns: Code, Title, Priority, Status, Due Date (default sort: `dueDate` ASC with nulls last, `pendingTaskId` DESC secondary).

### 8.2 Create Page (`/pending-tasks/new`)

Fields:
- Project (Required; dropdown fetches active projects `status = 1` only).
- Title (Required, max 200 characters).
- Description (Optional).
- Priority (Default: MEDIUM; Low, Medium, High, Critical).
- Status (Default: PENDING; Pending, In Progress, On Hold, Completed, Cancelled).
- Due Date (Optional date picker).
- Remarks (Optional).

Rules:
- Inactive projects are excluded from project selection.
- Does not contain Task Item or Work Log selection fields.
- Submitting with `COMPLETED` records the completion timestamp automatically via backend logic.

### 8.3 Details Page (`/pending-tasks/:pendingTaskId`)

Sections:
- Header: Task Code, Title, Priority badge, Status badge, Overdue indicator, and audit timestamps.
- Action Buttons: Change Status (opens modal), Edit Task (navigates to `/edit`), and Back to List.
- Task Description and Remarks cards with formatted whitespace.
- Associated Project card linking to `/projects/:projectId` (noting permanent association).
- Status Summary card with overdue calculation.

### 8.4 Edit Page (`/pending-tasks/:pendingTaskId/edit`)

Fields:
- Project Context: Displayed as a read-only banner with permanent association notice.
- Title (Required).
- Description (Optional).
- Priority (Low, Medium, High, Critical).
- Status (Pending, In Progress, On Hold, Completed, Cancelled).
- Due Date (Optional).
- Remarks (Optional).

Rules:
- Historical pending tasks belonging to inactive projects remain accessible and editable.
- Project cannot be modified (`projectId` is immutable).
- Moving status to `COMPLETED` sets `completed_at` automatically.
- Moving status away from `COMPLETED` clears `completed_at` automatically.
- Keeping status `COMPLETED` preserves the original `completed_at` timestamp.

### 8.5 Overdue Behaviour

A Pending Task is overdue when:
- Due Date is earlier than today's date (`dueDate < CURRENT_DATE`).
- Status is not `COMPLETED`.
- Status is not `CANCELLED`.
- A task due today is NOT overdue.
- A task without a due date is NOT overdue.
- Overdue status is calculated dynamically by the backend.

### 8.6 Deletion Restrictions

- Hard deletion is strictly prohibited (no delete button or endpoint).
- If a task is no longer needed, change its status to `CANCELLED`.

## 9. Code Changes Screen

Route: `/code-changes`

### 9.1 List

Columns:
- Code Change Code.
- Work Log Code.
- Project.
- Change Date/Time.
- Environment.
- Change Status.
- SVN Commit ID.
- Actions.

Filters:
- Project.
- Work Log.
- Change Status.
- Environment.
- Date range.
- SVN Commit ID.
- Search.

### 9.2 Create / Edit Form

Fields:
- Work Log (required).
- Change Status (required).
- SVN Commit ID (required only for COMMITTED).
- Change Date/Time (required).
- Environment (required).
- Remarks (optional).

### 9.3 File Details

Allow zero or multiple file-detail records.

Fields per file:
- Layer.
- Technology.
- File Path.
- What Changed.
- Why Changed.
- Affected File(s).
- Remarks.

File details are optional for both COMMITTED and UNCOMMITTED records.

### 9.4 Status Conversion

When an UNCOMMITTED Code Change becomes COMMITTED:
- Update the existing record.
- Add the SVN Commit ID.
- Set the actual commit date/time.
- Preserve existing file details.
- Do not create a duplicate record.

### 9.5 Details Screen

Route: `/code-changes/:codeChangeId`

Display:
- Code Change information (Code, Status badge, SVN Commit ID, Date & Time, Environment badge, timestamps, Remarks).
- Hierarchy Context (Work Log with date & link, Task Item with title & link, Project with code & link).
- File details table with layer badge, technology, file path, what/why changed, affected files, remarks, and file-level actions.
- SVN Commit ID where available.
- Actions:
  - Edit Code Change (`/code-changes/:codeChangeId/edit`).
  - Add File Entry (opens `FileFormModal`).
  - Edit File Entry (opens `FileFormModal` with initial data).
  - Delete File Entry (opens `DeleteFileModal` confirmation).
  - Parent Code Change deletion is strictly prohibited and intentionally excluded from the UI and backend.

### 9.6 Exact SVN Commit Search

Modal: `CommitSearchModal` (available from the Code Changes list header)
- Allows searching by exact SVN Commit ID (e.g., `r1042`).
- Returns full context including Code Change code, commit date/time, environment, Work Log, Task Item, and Project.
- Provides a one-click action to view the full Code Change details.

## 10. DB Changes Screen

Route: `/db-changes`

### 10.1 List

Columns:
- DB Change Code (link to `/db-changes/:id`).
- Date (derived workDate).
- Work Log & Task (Work Log Code and Task Item Code/Title).
- Environment (LOCAL, UAT, LIVE badge).
- Database (Database platform).
- Object Type (Table, Procedure, etc. badge).
- Object Name (font-mono).
- Actions (View details, Edit). No delete actions.

Filters:
- Search (multi-field search across codes, names, reasons, remarks).
- Project dropdown.
- Task Item dropdown (optionally filtered by project).
- Environment dropdown.
- Database Platform dropdown.
- Object Type dropdown.
- Date range (`dateFrom` to `dateTo`).
- Clear / Reset filters.

### 10.2 Create Form

Route: `/db-changes/new`

Fields:
- Work Log (required, dropdown displaying code, date, task item, and project; preselection supported via query param).
- Derived context banner showing selected Work Log date, requirement, Task Item, and Project.
- Environment (required: LOCAL, UAT, LIVE).
- Database Platform (required: PostgreSQL, Oracle, MySQL, SQL Server, MongoDB, Other).
- Object Type (required: Table, Procedure, Function, Trigger, View, Package, Cursor, Sequence, Index, Constraint, Other).
- Object Name (required, max 200).
- Why Changed / Business Reason (required).
- What Changed (optional technical details).
- Affected Object(s) (optional).
- Remarks (optional).

### 10.3 Edit Form

Route: `/db-changes/:dbChangeId/edit`

- Read-only context banner showing DB Change Code, Work Log Code/Date, Task Item, and Project (Work Log association and DB Change Code are immutable).
- Editable fields: Environment, Database Platform, Object Type, Object Name, Why Changed, What Changed, Affected Object, Remarks.
- Historical DB changes remain editable even when their associated Task Item or Project has become inactive.
- No delete button or UI controls.

### 10.4 Details Screen

Route: `/db-changes/:dbChangeId`

Display:
- Header with DB Change Code, Environment badge, Object Type badge, Database badge.
- Edit DB Change action button.
- Main Database Object Details Card (Database Platform, Object Type, Object Name, Environment, Created At, Last Updated).
- Reason & Modification Details Card (Why Changed, What Changed, Affected Object, Remarks).
- Hierarchy Context Card (Project with link, Task Item with link, Work Log with link, immutability notice).
- Deletion is strictly prohibited and excluded from the interface.

### 10.5 Work Log Detail Integration

Route: `/work-logs/:workLogId`

- Displays dedicated "Related Database Changes" section with count, tabular listing (DB Change code with link, Environment badge, Database name, Object Type badge, Object Name, Why Changed, View action).
- Includes "+ Log DB Change" action button linking directly to `/db-changes/new?workLogId=:workLogId` with preselected Work Log context.
- Preserves existing Related Code Changes section and behavior.

## 11. Reports & Exports Screen

Route: `/reports`

Purpose: Download the three original workbooks.

### 11.1 Export Options

1. Daily Work Log.
2. Database Change Log.
3. Code File Change Log.
4. Download All as ZIP.

### 11.2 Optional Filters

- From Date.
- To Date.
- Project.

### 11.3 Export Behaviour

- Download the correct XLSX or ZIP file.
- Use the original workbook structure.
- Preserve approved columns.
- Show loading feedback.
- Show an error if export fails.
- Do not modify existing database records.

## 12. Settings Screen

Route: `/settings`

Initial scope:
- Display account username.
- Display account email.
- Display account status.
- Logout.

Do not introduce account-management features outside the approved scope.

## 13. Navigation and Access Rules

Unauthenticated:
- Login.
- Initial Setup, only when no account exists.

Authenticated:
- Dashboard.
- All approved business modules.
- Reports.
- Settings.

Rules:
- Protect authenticated routes.
- Redirect unauthenticated users to Login.
- Redirect authenticated users away from Login to Dashboard.
- Handle expired access tokens through refresh.
- If refresh fails, clear authentication state and redirect to Login.
- Clear user-specific cached data on logout.

## 14. Shared UI Components

Reusable components should include:
- Application Layout.
- Sidebar.
- Top Bar.
- Page Header.
- Data Table.
- Pagination.
- Search Input.
- Filter Controls.
- Form Field.
- Select Field.
- Date Picker.
- Time Picker.
- Confirmation Dialog.
- Loading Indicator.
- Empty State.
- Error State.
- Toast Notification.
- Status Badge.

Avoid duplicating the same UI logic across features.

## 15. Form and Table Standards

- Required fields must be clearly identified.
- Optional fields must remain optional.
- Show field-specific validation errors.
- Disable submission while saving.
- Prevent accidental duplicate submissions.
- Confirm important status or activation changes.
- Keep table columns readable on smaller screens.
- Use pagination instead of loading every record.
- Provide useful empty states.
- Keep filters usable and consistent.

## 16. Frontend Implementation Rules

- Use React Hook Form for forms.
- Use Zod for client-side validation.
- Use Axios for API communication.
- Use TanStack Query for server state.
- Keep feature-specific logic inside feature folders.
- Keep reusable components inside shared components.
- Do not put business rules only in the frontend.
- Do not expose database details in UI code.
- Follow the API Specification for all requests and responses.

## 17. Source of Truth

This document defines screen behaviour and UI functionality.

Use it together with:
- Product Requirements.
- Business Rules.
- Database Design.
- System Architecture.
- Security Design.
- API Specification.

Do not add unapproved screens, fields or actions.