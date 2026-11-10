package com.devworktracker.dbchange.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;
import java.time.LocalDate;

public class DbChangeResponse {

    private Long dbChangeId;
    private String dbChangeCode;

    private Long workLogId;
    private String workLogCode;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate workDate;

    private Long taskItemId;
    private String taskItemCode;
    private String taskItemTitle;

    private Long projectId;
    private String projectCode;
    private String projectName;

    private String environment;
    private String databaseName;
    private String objectType;
    private String objectName;

    private String whatChanged;
    private String whyChanged;
    private String affectedObject;
    private String remarks;

    private Instant createdAt;
    private Instant updatedAt;

    public DbChangeResponse() {
    }

    public DbChangeResponse(Long dbChangeId, String dbChangeCode, Long workLogId,
                            String workLogCode, LocalDate workDate, Long taskItemId,
                            String taskItemCode, String taskItemTitle, Long projectId,
                            String projectCode, String projectName, String environment,
                            String databaseName, String objectType, String objectName,
                            String whatChanged, String whyChanged, String affectedObject,
                            String remarks, Instant createdAt, Instant updatedAt) {
        this.dbChangeId = dbChangeId;
        this.dbChangeCode = dbChangeCode;
        this.workLogId = workLogId;
        this.workLogCode = workLogCode;
        this.workDate = workDate;
        this.taskItemId = taskItemId;
        this.taskItemCode = taskItemCode;
        this.taskItemTitle = taskItemTitle;
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.environment = environment;
        this.databaseName = databaseName;
        this.objectType = objectType;
        this.objectName = objectName;
        this.whatChanged = whatChanged;
        this.whyChanged = whyChanged;
        this.affectedObject = affectedObject;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getWorkLogCode() {
        return workLogCode;
    }

    public void setWorkLogCode(String workLogCode) {
        this.workLogCode = workLogCode;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public Long getTaskItemId() {
        return taskItemId;
    }

    public void setTaskItemId(Long taskItemId) {
        this.taskItemId = taskItemId;
    }

    public String getTaskItemCode() {
        return taskItemCode;
    }

    public void setTaskItemCode(String taskItemCode) {
        this.taskItemCode = taskItemCode;
    }

    public String getTaskItemTitle() {
        return taskItemTitle;
    }

    public void setTaskItemTitle(String taskItemTitle) {
        this.taskItemTitle = taskItemTitle;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
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
