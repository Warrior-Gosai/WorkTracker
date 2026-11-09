package com.devworktracker.common.response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ApiErrorResponse {

    private boolean success;
    private String message;
    private Object data;
    private List<ErrorDetail> errors;
    private Instant timestamp;

    public ApiErrorResponse() {
        this.success = false;
        this.data = null;
        this.errors = new ArrayList<>();
        this.timestamp = Instant.now();
    }

    public ApiErrorResponse(String message) {
        this.success = false;
        this.message = message;
        this.data = null;
        this.errors = new ArrayList<>();
        this.timestamp = Instant.now();
    }

    public ApiErrorResponse(String message, List<ErrorDetail> errors) {
        this.success = false;
        this.message = message;
        this.data = null;
        this.errors = errors != null ? errors : new ArrayList<>();
        this.timestamp = Instant.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public List<ErrorDetail> getErrors() {
        return errors;
    }

    public void setErrors(List<ErrorDetail> errors) {
        this.errors = errors;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}

