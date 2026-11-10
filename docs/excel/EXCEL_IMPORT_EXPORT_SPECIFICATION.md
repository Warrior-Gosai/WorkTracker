# DevWork Tracker — Excel Import/Export Specification

## 1. Overview

DevWork Tracker replaces three manually maintained Excel workbooks with a centralized application and PostgreSQL database.

The application must support exporting:

1. Daily Work Log.
2. Database Change Log.
3. Code File Change Log.

Export technology: Apache POI.

Initial scope:
- Export individual workbooks.
- Export all workbooks together as a ZIP.
- Preserve the original workbook structure and columns.
- Support optional date-range and project filters.
- Generate workbooks from database records.

Excel import is not included initially.

## 2. Original Workbook Requirements & Template Inspection

The implementation uses the user's original XLSX workbooks stored in `OLD_XLS_FILES/` as reference templates. These templates were copied to `backend/src/main/resources/excel-templates/` and serve as the baseline for generation so all fonts, borders, headers, and instructional sheets are strictly preserved:

1. **`01_Daily_Work_Log.xlsx`** (Template: `Daily_Work_Log.xlsx`):
   - Sheets: `Daily Work Log` (data sheet) and `Instructions` (guidance sheet).
   - Columns: 22 columns (Work ID through Notes/Remarks).
   - Freeze pane: Top header row frozen (`freezePane(0, 1)`).
   - Existing formulas:
     - Day (Col 3 / C): `=IF(B{r}="","",TEXT(B{r},"dddd"))`
     - Total Hours (Col 13 / M): `=IF(OR(K{r}="",L{r}=""),"",MOD(L{r}-K{r},1)*24)`
   - Autofilter: `A1:V1` (dynamically adjusted based on exported row count).
   - Template handling: Pre-existing empty/placeholder rows (1 to 999) are removed before writing actual database records, while preserving cell formatting and formulas.

2. **`02_DB_Change_Log.xlsx`** (Template: `Database_Change_Log.xlsx`):
   - Sheets: `Database Change Log` (data sheet) and `Instructions` (guidance sheet).
   - Columns: 12 columns (DB Change ID through Remarks).
   - Freeze pane: Top header row frozen (`freezePane(0, 1)`).
   - Autofilter: `A1:L1000` (dynamically adjusted to data bounds).
   - Template handling: Template rows 1 to 999 are cleared while preserving cell styles before writing database records.

3. **`03_Code_File_Change_Log.xlsx`** (Template: `Code_File_Change_Log.xlsx`):
   - Sheets: `Code File Change Log` (data sheet) and `Instructions` (guidance sheet).
   - Columns: 13 columns — original 11 columns + approved Col 12 (`SVN Commit ID`) and Col 13 (`Change Status`).
   - Freeze pane: Top header row frozen (`freezePane(0, 1)`).
   - Multi-file handling: Multiple child file changes under a single code change are aggregated into newline-delimited (`\n`) text cells with `wrapText = true`.

## 3. Export API Endpoints

Base path: `/api/v1/exports`

| Method | Endpoint | Query Parameters | Output File | MIME Type |
|---|---|---|---|---|
| GET | `/work-logs` | `scope`, `fromDate`, `toDate`, `projectId`, `taskItemId`, `workType`, `status`, `technologyArea` | `01_Daily_Work_Log.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| GET | `/db-changes` | `scope`, `fromDate`, `toDate`, `projectId`, `environment`, `databaseName`, `objectType` | `02_DB_Change_Log.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| GET | `/code-changes` | `scope`, `fromDate`, `toDate`, `projectId`, `changeStatus`, `layer`, `technology` | `03_Code_File_Change_Log.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| GET | `/all` | `scope`, `fromDate`, `toDate`, `projectId` | `DevWork_Tracker_Reports.zip` | `application/zip` |

### Scope Parameter
- `scope=all`: Complete historical export, ignoring date range and module filters.
- `scope=filtered` (default): Applies query filters to match all corresponding records without pagination limits.
- Any invalid scope value returns HTTP 400 with a descriptive error message.

## 4. Daily Work Log Export

Output filename:

`01_Daily_Work_Log.xlsx`

Preserve all 22 original columns in their original order.

### 4.1 Column Mapping

| No. | Excel Column | Database Source |
|---:|---|---|
| 1 | Work ID | work_log.work_log_code |
| 2 | Date | work_log.work_date |
| 3 | Day | Derived from work_date |
| 4 | Project / Application | project.project_name through task_item |
| 5 | Module / Feature | task_item.title |
| 6 | Task / Requirement | work_log.task_requirement |
| 7 | Work Type | work_log.work_type |
| 8 | Work Description | work_log.work_description |
| 9 | Purpose / Reason | work_log.purpose_reason |
| 10 | Technology / Area | work_log.technology_area |
| 11 | Start Time | work_log.start_time |
| 12 | End Time | work_log.end_time |
| 13 | Total Hours | Calculated by backend |
| 14 | Status | work_log.status |
| 15 | Problem / Blocker | work_log.problem_blocker |
| 16 | Solution / Resolution | work_log.solution_resolution |
| 17 | Testing / Verification | work_log.testing_verification |
| 18 | Result / Outcome | work_log.result_outcome |
| 19 | Pending / Next Action | work_log.pending_next_action |
| 20 | Code Change ID(s) | Related code_change records |
| 21 | DB Change ID(s) | Related db_change records |
| 22 | Notes / Remarks | work_log.notes_remarks |

### 4.2 Mapping Rules

- Work ID uses the generated Work Log Code.
- Date comes from Work Date.
- Day is derived from Date.
- Project is derived through Task Item.
- Module / Feature uses Task Item Title.
- Total Hours is calculated by the backend.
- Code Change ID(s) contains associated Code Change Codes.
- DB Change ID(s) contains associated DB Change Codes.

When multiple Code Changes or DB Changes exist, join their codes into one cell using a consistent separator, such as comma and space.

When no related records exist, leave the corresponding cell blank.

### 4.3 Duration Export

- Both times NULL: leave Total Hours blank.
- Both times populated: export calculated duration.
- Overnight duration must be calculated correctly.
- Identical times represent zero duration.
- Do not calculate duration independently in Excel using a different rule.

## 5. Database Change Log Export

Output filename:

`02_DB_Change_Log.xlsx`

Preserve all 12 original columns in their original order.

### 5.1 Column Mapping

| No. | Excel Column | Database Source |
|---:|---|---|
| 1 | DB Change ID | db_change.db_change_code |
| 2 | Work ID | Related work_log.work_log_code |
| 3 | Date | Related work_log.work_date |
| 4 | Project | Project derived through Work Log → Task Item |
| 5 | Environment | db_change.environment |
| 6 | Database | db_change.database_name |
| 7 | Object Type | db_change.object_type |
| 8 | Object Name | db_change.object_name |
| 9 | What Changed | db_change.what_changed |
| 10 | Why Changed | db_change.why_changed |
| 11 | Affected Object | db_change.affected_object |
| 12 | Remarks | db_change.remarks |

### 5.2 Mapping Rules

- One database object change produces one Excel row.
- Work ID uses the related Work Log Code.
- Date comes from the related Work Log.
- Project is derived through the approved relationships.
- Environment belongs to the DB Change record.
- Preserve the original 12-column order.

Do not create duplicate rows because multiple changes belong to the same Work Log.

## 6. Code File Change Log Export

Output filename:

`03_Code_File_Change_Log.xlsx`

Preserve the original 11 columns and add two approved columns:

12. SVN Commit ID.
13. Change Status.

Total: 13 columns.

### 6.1 Column Mapping

| No. | Excel Column | Database Source |
|---:|---|---|
| 1 | Code Change ID | code_change.code_change_code |
| 2 | Work ID | Related work_log.work_log_code |
| 3 | Date | code_change.change_datetime |
| 4 | Project / Application | Project derived through Work Log → Task Item |
| 5 | Layer | Related code_change_file.layer |
| 6 | Technology | Related code_change_file.technology |
| 7 | File Path | Related code_change_file.file_path |
| 8 | What Changed | Related code_change_file.what_changed |
| 9 | Why Changed | Related code_change_file.why_changed |
| 10 | Affected File(s) | Related code_change_file.affected_files |
| 11 | Remarks | Code Change remarks and relevant file remarks |
| 12 | SVN Commit ID | code_change.svn_commit_id |
| 13 | Change Status | code_change.change_status |

### 6.2 Multiple File Handling

One Code Change may contain multiple file-detail records.

The export must produce exactly one Excel row per Code Change.

For multiple file records:
- Aggregate Layer values into one cell.
- Aggregate Technology values into one cell.
- Aggregate File Path values into one cell.
- Aggregate What Changed values into one cell.
- Aggregate Why Changed values into one cell.
- Aggregate Affected File(s) values into one cell.
- Aggregate relevant file Remarks into one cell.

Use newline-separated values within the corresponding cells.

Do not create one Excel row per file.

### 6.3 No File Details

When a Code Change has no file-detail records:
- Keep the Code Change row.
- Leave file-specific columns blank.
- Preserve its Work ID, Date, Project, Remarks, SVN Commit ID and Change Status.

### 6.4 Commit Status

COMMITTED:
- SVN Commit ID must be populated.
- Change Status must show COMMITTED.

UNCOMMITTED:
- SVN Commit ID remains blank.
- Change Status must show UNCOMMITTED.

Updating an existing UNCOMMITTED record to COMMITTED must update the same database record and must not duplicate its Excel row.

## 7. ZIP Export

Endpoint:

`GET /api/v1/exports/all`

Filename:

`DevWork_Tracker_Reports.zip`

ZIP contents:

```text
DevWork_Tracker_Reports.zip
├── 01_Daily_Work_Log.xlsx
├── 02_DB_Change_Log.xlsx
└── 03_Code_File_Change_Log.xlsx
```

Rules:
- Generate all three workbooks using the same approved export logic.
- Apply the same supplied date and project filters to each workbook.
- Include all three files even when one workbook has no matching records.
- Do not modify database data.
- Return a valid ZIP file with the correct content type (`application/zip`).

## 8. Filtering Rules

Optional filters:

### Date Range
- `fromDate`: inclusive start date.
- `toDate`: inclusive end date.
- Both dates may be supplied together.
- Validate that fromDate is not after toDate.

Date source for filtering:
- Daily Work Log: work_log.work_date.
- DB Change Log: related work_log.work_date.
- Code File Change Log: code_change.change_datetime.

### Project
Filter using the Project relationship.

- Daily Work Log: Work Log → Task Item → Project.
- DB Change Log: DB Change → Work Log → Task Item → Project.
- Code Change Log: Code Change → Work Log → Task Item → Project.

Do not store duplicate Project IDs in child records just for exporting.

## 9. Formatting and Workbook Preservation

Use Apache POI.

Preserve the original workbook structure as far as practical:

- Worksheet names.
- Column order.
- Header text.
- Header styles.
- Font and cell formatting.
- Column widths.
- Date formats.
- Time formats.
- Number formats.
- Freeze panes.
- Filters.
- Existing relevant formulas.
- Dropdown validations where they are part of the original workbook design.

Do not unnecessarily redesign the original workbook.

When the original workbook contains formulas, verify whether they should remain formulas or be replaced with backend-calculated values. Backend calculations are authoritative for application-derived data.

Use appropriate cell types:
- Date cells for dates.
- Numeric cells for numeric duration values where appropriate.
- Text cells for codes and identifiers.
- Time formatting for time values.

Prevent long descriptions from becoming unreadable by preserving suitable wrapping and column formatting.

## 10. Empty Export Behaviour

When no records match the supplied filters:

- Generate a valid workbook.
- Keep the original worksheet structure.
- Preserve column headers.
- Do not return an error solely because there are no records.
- Include all three workbooks in ZIP export.

## 11. Export Performance and Reliability

- Use database-side filtering.
- Avoid loading unnecessary related entities.
- Fetch related records efficiently.
- Avoid N+1 query problems.
- Handle large exports without unnecessary memory duplication.
- Close workbook and stream resources correctly.
- Use safe temporary resource handling if required.
- Return meaningful errors when generation fails.

Do not add asynchronous export infrastructure initially.

## 12. Export Security

- All export endpoints require authentication.
- Only the active account may access them.
- Validate all supplied filters.
- Do not expose local file paths or internal server information.
- Do not log sensitive workbook contents.

## 13. Testing Requirements

### Daily Work Log
- Verify all 22 columns.
- Verify derived Project and Task Item values.
- Verify calculated duration.
- Verify multiple Code Change IDs.
- Verify multiple DB Change IDs.
- Verify blank optional fields.

### DB Change Log
- Verify all 12 columns.
- Verify derived Work ID, Date and Project.
- Verify multiple DB Changes under one Work Log.

### Code File Change Log
- Verify all 13 columns.
- Verify one row per Code Change.
- Verify multiple file aggregation.
- Verify blank file fields when no file details exist.
- Verify COMMITTED and UNCOMMITTED export behaviour.
- Verify that commit conversion does not create duplicates.

### ZIP
- Verify all three workbooks exist.
- Verify valid XLSX files inside ZIP.
- Verify common filters.
- Verify empty-result behaviour.

### Formatting
- Compare generated workbooks against original templates.
- Check sheet names, headers, widths, styles and date/time formats.

## 14. Excluded Features

Not included initially:
- Excel import.
- Automatic synchronization with Excel.
- Google Drive integration.
- Automatic SVN integration.
- Scheduled exports.
- Emailing exported workbooks.
- Background export jobs.

## 15. Source of Truth

This document defines Excel export behaviour.

The original XLSX files remain the authoritative reference for exact workbook formatting and structure.

The Database Design, Business Rules and API Specification define the underlying application data and export relationships.