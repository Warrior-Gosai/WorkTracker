package com.devworktracker.taskitem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateTaskItemRequest {

    @NotBlank(message = "Task type is required")
    private String taskType;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    private String remarks;

    public UpdateTaskItemRequest() {
    }

    public UpdateTaskItemRequest(String taskType, String title, String description, String priority, String remarks) {
        this.taskType = taskType;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.remarks = remarks;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}

