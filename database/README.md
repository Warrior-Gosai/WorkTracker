# Database Directory

This directory contains database setup instructions and reference SQL scripts for DevWork Tracker.

## Architecture & Migration Ownership
- Flyway migration scripts are located inside the Spring Boot backend at:  
  `backend/src/main/resources/db/migration/`
- The backend Flyway migration history is the authoritative schema deployment mechanism.
- Hibernate uses `spring.jpa.hibernate.ddl-auto=validate`.

## Contents
- `reference/`: Contains reference SQL scripts (e.g. `devwork_tracker_postgresql_v1.sql`) for consolidated review and database design reference.

