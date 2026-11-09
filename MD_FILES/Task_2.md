# Task 2 — DevWork Tracker: PostgreSQL 18 and Flyway Setup

## Project Location
`E:\WorkTracker`

## Objective
Review and correct the existing PostgreSQL schema draft, configure Spring Boot database connectivity, and implement the initial Flyway migration.

## 1. Read Existing Documentation

Before making changes, inspect:

- `docs/Master_instruction.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/architecture/02_DATABASE_DESIGN.md`
- `docs/requirements/02_BUSINESS_RULES.md`
- `docs/development/DEVELOPMENT_SETUP.md`
- `database/reference/devwork_tracker_postgresql_v1.sql`

Use the approved documentation and decisions as the source of truth.

## 2. Correct the SQL Draft

Review all nine tables and their relationships.

Apply these confirmed corrections:

1. `work_log.status`:
   - NOT NULL
   - DEFAULT 'IN_PROGRESS'
   - CHECK values: COMPLETED, IN_PROGRESS, BLOCKED, ON_HOLD
   - Do not allow NULL.

2. `db_change.what_changed`:
   - Make it optional (`TEXT NULL`).
   - Remove any constraint that forces a non-empty value.

3. Single-account restriction:
   - Add a database-level unique expression index on `app_user` that permits at most one account.
   - Preserve existing username/email uniqueness constraints.

4. Refresh token indexes:
   - Remove the redundant normal index on `replaced_by_token_id` if the unique partial index already covers it.

5. Project status:
   - 0 = Inactive.
   - 1 = Active.

6. Task Item activation:
   - 0 = Inactive.
   - 1 = Active.

7. Verify all previously approved foreign keys, CHECK constraints, sequences, timestamp functions, triggers and indexes.

Do not introduce new business rules without approval.

## 3. Flyway Migration

Create:

`backend/src/main/resources/db/migration/V1__initial_schema.sql`

The migration must contain the corrected initial schema, including:

- Nine tables
- Foreign keys
- Constraints
- Indexes
- Sequences
- Timestamp function
- Timestamp triggers

Do not split the initial schema into multiple migrations.

## 4. Backend Dependencies

Update `backend/pom.xml` with compatible dependencies:

- Spring Data JPA
- PostgreSQL JDBC Driver
- Flyway Core
- Flyway PostgreSQL support

Retain existing dependencies.

Do not add unrelated libraries.

Keep the existing Spring Boot version unless a verified compatibility issue requires a change. Explain any proposed version change before applying it.

Configure:

`spring.jpa.hibernate.ddl-auto=validate`

Flyway must own schema creation. Hibernate must not automatically create or update tables.

## 5. Database Configuration

Configure local PostgreSQL connectivity using environment variables.

Expected configuration:

- DB_URL
- DB_USERNAME
- DB_PASSWORD

Use a local profile for development.

Do not hardcode real credentials or commit secrets.

## 6. Database Safety

IMPORTANT:

- Inspect existing PostgreSQL databases before proceeding.
- Never drop or overwrite an existing database.
- Create a separate database named `devwork_tracker_dev` if it does not already exist.
- Do not execute the migration against any existing business database.
- Do not use destructive cleanup commands.
- If permissions prevent database creation, stop and report what permission is needed.

## 7. Validation

After migration:

1. Confirm Flyway reports V1 successfully applied.
2. Verify all nine tables exist.
3. Verify foreign keys and CHECK constraints.
4. Verify indexes and sequences.
5. Verify timestamp triggers.
6. Test the `work_log.status` default and invalid-value rejection.
7. Test that `db_change.what_changed` accepts NULL.
8. Test that a second `app_user` record is rejected.
9. Run backend tests.
10. Verify Spring Boot starts successfully and Hibernate validation passes.

Use a rollback-safe test approach and avoid leaving test records in the database.

## 8. Documentation

Update relevant documentation to reflect the actual implemented migration and configuration.

Keep the original reference SQL file. Update it with approved corrections rather than deleting it.

## Restrictions

- No authentication implementation.
- No business APIs.
- No entities or repositories for business modules.
- No frontend changes.
- No business feature implementation.
- Do not modify the approved business relationships.

## Completion Report

Report:

1. SQL corrections applied.
2. Files created and modified.
3. Database name used.
4. Flyway migration result.
5. Nine-table verification.
6. Constraint/index/sequence/trigger verification.
7. Hibernate validation result.
8. Backend test results.
9. Any unresolved issues.

Stop after completing this task. Wait for approval before implementing authentication.