package com.devworktracker.pendingtask.dto;

import java.time.Instant;
import java.time.LocalDate;

public class PendingTaskResponse {

    private Long pendingTaskId;
    private String pendingTaskCode;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDate dueDate;
    private Instant completedAt;
    private String remarks;
    private Boolean overdue;
    private Instant createdAt;
    private Instant updatedAt;

    public PendingTaskResponse() {
    }

    public Long getPendingTaskId() {
        return pendingTaskId;
    }

    public void setPendingTaskId(Long pendingTaskId) {
        this.pendingTaskId = pendingTaskId;
    }

    public String getPendingTaskCode() {
        return pendingTaskCode;
    }

    public void setPendingTaskCode(String pendingTaskCode) {
        this.pendingTaskCode = pendingTaskCode;
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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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

    public Boolean getOverdue() {
        return overdue;
    }

    public void setOverdue(Boolean overdue) {
        this.overdue = overdue;
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

