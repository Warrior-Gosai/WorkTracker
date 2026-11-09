package com.devworktracker.taskitem.dto;

import java.time.Instant;

public class TaskItemResponse {

    private Long taskItemId;
    private String taskItemCode;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String taskType;
    private String title;
    private String description;
    private String priority;
    private String status;
    private Short isActive;
    private Instant completedAt;
    private String remarks;
    private Instant createdAt;
    private Instant updatedAt;

    public TaskItemResponse() {
    }

    public TaskItemResponse(Long taskItemId, String taskItemCode, Long projectId, String projectCode,
                            String projectName, String taskType, String title, String description,
                            String priority, String status, Short isActive, Instant completedAt,
                            String remarks, Instant createdAt, Instant updatedAt) {
        this.taskItemId = taskItemId;
        this.taskItemCode = taskItemCode;
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.taskType = taskType;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.isActive = isActive;
        this.completedAt = completedAt;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Short getIsActive() {
        return isActive;
    }

    public void setIsActive(Short isActive) {
        this.isActive = isActive;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
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

