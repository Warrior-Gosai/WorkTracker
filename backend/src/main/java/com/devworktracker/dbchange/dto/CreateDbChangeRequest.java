package com.devworktracker.dbchange.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class CreateDbChangeRequest {

    @NotNull(message = "Work log ID is required")
    @Positive(message = "Work log ID must be positive")
    private Long workLogId;

    @NotBlank(message = "Environment is required")
    private String environment = "LOCAL";

    @NotBlank(message = "Database name is required")
    private String databaseName;

    @NotBlank(message = "Object type is required")
    private String objectType;

    @NotBlank(message = "Object name is required")
    @Size(max = 200, message = "Object name cannot exceed 200 characters")
    private String objectName;

    private String whatChanged;

    @NotBlank(message = "Why changed is required")
    private String whyChanged;

    private String affectedObject;

    private String remarks;

    public CreateDbChangeRequest() {
    }

    public CreateDbChangeRequest(Long workLogId, String environment, String databaseName,
                                 String objectType, String objectName, String whatChanged,
                                 String whyChanged, String affectedObject, String remarks) {
        this.workLogId = workLogId;
        this.environment = environment != null ? environment : "LOCAL";
        this.databaseName = databaseName;
        this.objectType = objectType;
        this.objectName = objectName;
        this.whatChanged = whatChanged;
        this.whyChanged = whyChanged;
        this.affectedObject = affectedObject;
        this.remarks = remarks;
    }

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
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
}
