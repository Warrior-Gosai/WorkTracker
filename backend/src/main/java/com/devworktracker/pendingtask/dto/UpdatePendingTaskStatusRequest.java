package com.devworktracker.pendingtask.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdatePendingTaskStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    public UpdatePendingTaskStatusRequest() {
    }

    public UpdatePendingTaskStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

