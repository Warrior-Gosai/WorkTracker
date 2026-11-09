package com.devworktracker.taskitem.dto;

import java.time.Instant;

public class DbChangeHistoryDto {

    private Long dbChangeId;
    private String dbChangeCode;
    private String environment;
    private String databaseName;
    private String objectType;
    private String objectName;
    private String whatChanged;
    private Instant createdAt;

    public DbChangeHistoryDto() {
    }

    public DbChangeHistoryDto(Long dbChangeId, String dbChangeCode, String environment, String databaseName, String objectType, String objectName, String whatChanged, Instant createdAt) {
        this.dbChangeId = dbChangeId;
        this.dbChangeCode = dbChangeCode;
        this.environment = environment;
        this.databaseName = databaseName;
        this.objectType = objectType;
        this.objectName = objectName;
        this.whatChanged = whatChanged;
        this.createdAt = createdAt;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

