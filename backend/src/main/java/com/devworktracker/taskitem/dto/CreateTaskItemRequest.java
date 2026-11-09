package com.devworktracker.taskitem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTaskItemRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Task type is required")
    private String taskType;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private String priority = "MEDIUM";

    private String status = "OPEN";

    private String remarks;

    public CreateTaskItemRequest() {
    }

    public CreateTaskItemRequest(Long projectId, String taskType, String title, String description, String priority, String status, String remarks) {
        this.projectId = projectId;
        this.taskType = taskType;
        this.title = title;
        this.description = description;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "OPEN";
        this.remarks = remarks;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}

