-- ============================================================
-- DevWork Tracker - Initial Flyway Schema Migration
-- Version: V1
-- Target: PostgreSQL (Neon / Supabase compatible)
-- ============================================================

-- ============================================================
-- 1. APP_USER
-- ============================================================

CREATE TABLE app_user
(
    user_id       BIGINT GENERATED ALWAYS AS IDENTITY,
    username      VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status        SMALLINT NOT NULL DEFAULT 1,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_app_user PRIMARY KEY (user_id),
    CONSTRAINT chk_app_user_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_app_user_username CHECK (LENGTH(TRIM(username)) > 0),
    CONSTRAINT chk_app_user_email CHECK (LENGTH(TRIM(email)) > 0)
);

CREATE UNIQUE INDEX uk_app_user_username_lower
    ON app_user (LOWER(username));

CREATE UNIQUE INDEX uk_app_user_email_lower
    ON app_user (LOWER(email));

-- Enforce at most one account in the system
CREATE UNIQUE INDEX uk_app_user_single_account
    ON app_user ((true));


-- ============================================================
-- 2. PROJECT
-- ============================================================

CREATE TABLE project
(
    project_id   BIGINT GENERATED ALWAYS AS IDENTITY,
    project_code VARCHAR(30) NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    description  TEXT,
    status       SMALLINT NOT NULL DEFAULT 1,
    remarks      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_project PRIMARY KEY (project_id),
    CONSTRAINT uk_project_code UNIQUE (project_code),
    CONSTRAINT chk_project_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_project_code CHECK (LENGTH(TRIM(project_code)) > 0),
    CONSTRAINT chk_project_name CHECK (LENGTH(TRIM(project_name)) > 0)
);

CREATE INDEX idx_project_status
    ON project (status);

CREATE INDEX idx_project_name
    ON project (project_name);


-- ============================================================
-- 3. REFRESH_TOKEN
-- ============================================================

CREATE TABLE refresh_token
(
    token_id              BIGINT GENERATED ALWAYS AS IDENTITY,
    user_id               BIGINT NOT NULL,
    token_hash            CHAR(64) NOT NULL,
    token_family_id       UUID NOT NULL,
    issued_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at            TIMESTAMPTZ NOT NULL,
    revoked_at            TIMESTAMPTZ,
    replaced_by_token_id  BIGINT,

    CONSTRAINT pk_refresh_token PRIMARY KEY (token_id),
    CONSTRAINT uk_refresh_token_hash UNIQUE (token_hash),

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_token_replacement
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_token (token_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_refresh_token_expiry
        CHECK (expires_at > issued_at),

    CONSTRAINT chk_refresh_token_not_self_replaced
        CHECK (replaced_by_token_id IS NULL OR replaced_by_token_id <> token_id),

    CONSTRAINT chk_refresh_token_replacement_revoked
        CHECK (replaced_by_token_id IS NULL OR revoked_at IS NOT NULL)
);

CREATE INDEX idx_refresh_token_user
    ON refresh_token (user_id);

CREATE INDEX idx_refresh_token_family
    ON refresh_token (token_family_id);

CREATE INDEX idx_refresh_token_expiry
    ON refresh_token (expires_at);

CREATE UNIQUE INDEX uk_refresh_token_replaced_by
    ON refresh_token (replaced_by_token_id)
    WHERE replaced_by_token_id IS NOT NULL;


-- ============================================================
-- 4. TASK_ITEM
-- ============================================================

CREATE TABLE task_item
(
    task_item_id   BIGINT GENERATED ALWAYS AS IDENTITY,
    task_item_code VARCHAR(30) NOT NULL,
    project_id     BIGINT NOT NULL,
    task_type      VARCHAR(40) NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    priority       VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    is_active      SMALLINT NOT NULL DEFAULT 1,
    completed_at   TIMESTAMPTZ,
    remarks        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_task_item PRIMARY KEY (task_item_id),
    CONSTRAINT uk_task_item_code UNIQUE (task_item_code),

    CONSTRAINT fk_task_item_project
        FOREIGN KEY (project_id)
        REFERENCES project (project_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_task_item_type
        CHECK (task_type IN
        (
            'FEATURE_DEVELOPMENT',
            'NEW_DEVELOPMENT',
            'BUG_FIX',
            'ISSUE_DEFECT',
            'ENHANCEMENT',
            'TECHNICAL_IMPROVEMENT',
            'MAINTENANCE',
            'RESEARCH_INVESTIGATION',
            'OTHER'
        )),

    CONSTRAINT chk_task_item_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    CONSTRAINT chk_task_item_status
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),

    CONSTRAINT chk_task_item_active
        CHECK (is_active IN (0, 1)),

    CONSTRAINT chk_task_item_completed_at
        CHECK
        (
            (status = 'COMPLETED' AND completed_at IS NOT NULL)
            OR
            (status <> 'COMPLETED' AND completed_at IS NULL)
        ),

    CONSTRAINT chk_task_item_title
        CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE INDEX idx_task_item_project_active
    ON task_item (project_id, is_active);

CREATE INDEX idx_task_item_project_status
    ON task_item (project_id, status);


-- ============================================================
-- 5. WORK_LOG
-- ============================================================

CREATE TABLE work_log
(
    work_log_id          BIGINT GENERATED ALWAYS AS IDENTITY,
    work_log_code        VARCHAR(30) NOT NULL,
    task_item_id         BIGINT NOT NULL,
    work_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    environment          VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    work_type            VARCHAR(40) NOT NULL,
    task_requirement     TEXT NOT NULL,
    work_description     TEXT,
    purpose_reason       TEXT,
    technology_area      VARCHAR(200),
    start_time           TIME,
    end_time             TIME,
    status               VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    problem_blocker      TEXT,
    solution_resolution  TEXT,
    testing_verification TEXT,
    result_outcome       TEXT,
    pending_next_action  TEXT,
    notes_remarks        TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_work_log PRIMARY KEY (work_log_id),
    CONSTRAINT uk_work_log_code UNIQUE (work_log_code),

    CONSTRAINT fk_work_log_task_item
        FOREIGN KEY (task_item_id)
        REFERENCES task_item (task_item_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_work_log_environment
        CHECK (environment IN ('LOCAL', 'UAT', 'LIVE')),

    CONSTRAINT chk_work_log_type
        CHECK (work_type IN
        (
            'DEVELOPMENT',
            'BUG_FIXING',
            'TESTING',
            'DEBUGGING',
            'INVESTIGATION',
            'ENHANCEMENT',
            'DOCUMENTATION',
            'DEPLOYMENT',
            'MAINTENANCE',
            'OTHER'
        )),

    CONSTRAINT chk_work_log_status
        CHECK (status IN ('COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'ON_HOLD')),

    CONSTRAINT chk_work_log_time_pair
        CHECK
        (
            (start_time IS NULL AND end_time IS NULL)
            OR
            (start_time IS NOT NULL AND end_time IS NOT NULL)
        ),

    CONSTRAINT chk_work_log_requirement
        CHECK (LENGTH(TRIM(task_requirement)) > 0)
);

CREATE INDEX idx_work_log_task_item
    ON work_log (task_item_id);

CREATE INDEX idx_work_log_date
    ON work_log (work_date DESC, work_log_id DESC);


-- ============================================================
-- 6. CODE_CHANGE
-- ============================================================

CREATE TABLE code_change
(
    code_change_id   BIGINT GENERATED ALWAYS AS IDENTITY,
    code_change_code VARCHAR(30) NOT NULL,
    work_log_id      BIGINT NOT NULL,
    change_status    VARCHAR(20) NOT NULL DEFAULT 'UNCOMMITTED',
    svn_commit_id    VARCHAR(150),
    change_datetime  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    environment      VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    remarks          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_code_change PRIMARY KEY (code_change_id),
    CONSTRAINT uk_code_change_code UNIQUE (code_change_code),

    CONSTRAINT fk_code_change_work_log
        FOREIGN KEY (work_log_id)
        REFERENCES work_log (work_log_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_code_change_status
        CHECK (change_status IN ('COMMITTED', 'UNCOMMITTED')),

    CONSTRAINT chk_code_change_commit_id
        CHECK
        (
            (
                change_status = 'COMMITTED'
                AND svn_commit_id IS NOT NULL
                AND LENGTH(TRIM(svn_commit_id)) > 0
            )
            OR
            (
                change_status = 'UNCOMMITTED'
                AND svn_commit_id IS NULL
            )
        ),

    CONSTRAINT chk_code_change_environment
        CHECK (environment IN ('LOCAL', 'UAT', 'LIVE'))
);

CREATE INDEX idx_code_change_work_log
    ON code_change (work_log_id);

CREATE INDEX idx_code_change_datetime
    ON code_change (change_datetime DESC);

CREATE UNIQUE INDEX uk_code_change_svn_commit_id
    ON code_change (svn_commit_id)
    WHERE svn_commit_id IS NOT NULL;


-- ============================================================
-- 7. CODE_CHANGE_FILE
-- ============================================================

CREATE TABLE code_change_file
(
    code_change_file_id BIGINT GENERATED ALWAYS AS IDENTITY,
    code_change_id      BIGINT NOT NULL,
    layer               VARCHAR(50),
    technology          VARCHAR(100),
    file_path           TEXT NOT NULL,
    what_changed        TEXT,
    why_changed         TEXT,
    affected_files      TEXT,
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_code_change_file PRIMARY KEY (code_change_file_id),

    CONSTRAINT fk_code_change_file_code_change
        FOREIGN KEY (code_change_id)
        REFERENCES code_change (code_change_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_code_change_file_path
        CHECK (LENGTH(TRIM(file_path)) > 0)
);

CREATE INDEX idx_code_change_file_code_change
    ON code_change_file (code_change_id);


-- ============================================================
-- 8. DB_CHANGE
-- ============================================================

CREATE TABLE db_change
(
    db_change_id   BIGINT GENERATED ALWAYS AS IDENTITY,
    db_change_code VARCHAR(30) NOT NULL,
    work_log_id    BIGINT NOT NULL,
    environment    VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    database_name  VARCHAR(50) NOT NULL,
    object_type    VARCHAR(40) NOT NULL,
    object_name    VARCHAR(200) NOT NULL,
    what_changed   TEXT,
    why_changed    TEXT,
    affected_object TEXT,
    remarks        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_db_change PRIMARY KEY (db_change_id),
    CONSTRAINT uk_db_change_code UNIQUE (db_change_code),

    CONSTRAINT fk_db_change_work_log
        FOREIGN KEY (work_log_id)
        REFERENCES work_log (work_log_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_db_change_environment
        CHECK (environment IN ('LOCAL', 'UAT', 'LIVE')),

    CONSTRAINT chk_db_change_database
        CHECK (database_name IN ('Oracle', 'PostgreSQL', 'MySQL', 'SQL Server', 'MongoDB', 'Other')),

    CONSTRAINT chk_db_change_object_type
        CHECK (object_type IN
        (
            'Table',
            'Procedure',
            'Function',
            'Trigger',
            'View',
            'Package',
            'Cursor',
            'Sequence',
            'Index',
            'Constraint',
            'Other'
        )),

    CONSTRAINT chk_db_change_object_name
        CHECK (LENGTH(TRIM(object_name)) > 0)
);

CREATE INDEX idx_db_change_work_log
    ON db_change (work_log_id);

CREATE INDEX idx_db_change_database_object
    ON db_change (database_name, object_type, object_name);


-- ============================================================
-- 9. PENDING_TASK
-- ============================================================

CREATE TABLE pending_task
(
    pending_task_id   BIGINT GENERATED ALWAYS AS IDENTITY,
    pending_task_code VARCHAR(30) NOT NULL,
    project_id        BIGINT NOT NULL,
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    priority          VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    due_date          DATE,
    completed_at      TIMESTAMPTZ,
    remarks           TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_pending_task PRIMARY KEY (pending_task_id),
    CONSTRAINT uk_pending_task_code UNIQUE (pending_task_code),

    CONSTRAINT fk_pending_task_project
        FOREIGN KEY (project_id)
        REFERENCES project (project_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_pending_task_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    CONSTRAINT chk_pending_task_status
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')),

    CONSTRAINT chk_pending_task_completed_at
        CHECK
        (
            (status = 'COMPLETED' AND completed_at IS NOT NULL)
            OR
            (status <> 'COMPLETED' AND completed_at IS NULL)
        ),

    CONSTRAINT chk_pending_task_title
        CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE INDEX idx_pending_task_project_status
    ON pending_task (project_id, status);

CREATE INDEX idx_pending_task_due_date
    ON pending_task (due_date);


-- ============================================================
-- 10. BUSINESS CODE SEQUENCES
-- Backend calls nextval() and formats the returned number.
-- Example: 'TASK-' || LPAD(nextval('seq_task_item_code')::TEXT, 6, '0')
-- ============================================================

CREATE SEQUENCE seq_project_code
    START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE SEQUENCE seq_task_item_code
    START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE SEQUENCE seq_work_log_code
    START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE SEQUENCE seq_code_change_code
    START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE SEQUENCE seq_db_change_code
    START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE SEQUENCE seq_pending_task_code
    START WITH 1 INCREMENT BY 1 NO CYCLE;


-- ============================================================
-- 11. SHARED UPDATED_AT FUNCTION AND TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_project_updated_at
BEFORE UPDATE ON project
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_task_item_updated_at
BEFORE UPDATE ON task_item
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_work_log_updated_at
BEFORE UPDATE ON work_log
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_code_change_updated_at
BEFORE UPDATE ON code_change
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_db_change_updated_at
BEFORE UPDATE ON db_change
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_pending_task_updated_at
BEFORE UPDATE ON pending_task
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
