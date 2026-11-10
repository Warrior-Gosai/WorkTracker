package com.devworktracker.dbchange.entity;

import com.devworktracker.worklog.entity.WorkLog;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "db_change")
public class DbChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "db_change_id", nullable = false, updatable = false)
    private Long dbChangeId;

    @Column(name = "db_change_code", nullable = false, unique = true, length = 30, updatable = false)
    private String dbChangeCode;

    @Column(name = "work_log_id", nullable = false, updatable = false)
    private Long workLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_log_id", insertable = false, updatable = false)
    private WorkLog workLog;

    @Column(name = "environment", nullable = false, length = 20)
    private String environment = "LOCAL";

    @Column(name = "database_name", nullable = false, length = 50)
    private String databaseName;

    @Column(name = "object_type", nullable = false, length = 40)
    private String objectType;

    @Column(name = "object_name", nullable = false, length = 200)
    private String objectName;

    @Column(name = "what_changed", columnDefinition = "TEXT")
    private String whatChanged;

    @Column(name = "why_changed", columnDefinition = "TEXT")
    private String whyChanged;

    @Column(name = "affected_object", columnDefinition = "TEXT")
    private String affectedObject;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public DbChange() {
    }

    public DbChange(String dbChangeCode, Long workLogId, String environment,
                    String databaseName, String objectType, String objectName,
                    String whatChanged, String whyChanged, String affectedObject,
                    String remarks) {
        this.dbChangeCode = dbChangeCode;
        this.workLogId = workLogId;
        this.environment = environment != null ? environment : "LOCAL";
        this.databaseName = databaseName;
        this.objectType = objectType;
        this.objectName = objectName;
        this.whatChanged = whatChanged;
        this.whyChanged = whyChanged;
        this.affectedObject = affectedObject;
        this.remarks = remarks;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
        if (this.environment == null) {
            this.environment = "LOCAL";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getDbChangeId() {
        return dbChangeId;
    }

    public void setDbChangeId(Long dbChangeId) {
        this.dbChangeId = dbChangeId;
    }

    public String getDbChangeCode() {
        return dbChangeCode;
    }

    public void setDbChangeCode(String dbChangeCode) {
        this.dbChangeCode = dbChangeCode;
    }

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
    }

    public WorkLog getWorkLog() {
        return workLog;
    }

    public void setWorkLog(WorkLog workLog) {
        this.workLog = workLog;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getObjectType() {
        return objectType;
    }

    public void setObjectType(String objectType) {
        this.objectType = objectType;
    }

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public String getWhatChanged() {
        return whatChanged;
    }

    public void setWhatChanged(String whatChanged) {
        this.whatChanged = whatChanged;
    }

    public String getWhyChanged() {
        return whyChanged;
    }

    public void setWhyChanged(String whyChanged) {
        this.whyChanged = whyChanged;
    }

    public String getAffectedObject() {
        return affectedObject;
    }

    public void setAffectedObject(String affectedObject) {
        this.affectedObject = affectedObject;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
