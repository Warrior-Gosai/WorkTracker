package com.devworktracker.auth.dto;

public class UserResponse {

    private Long userId;
    private String username;
    private String email;
    private Short status;

    public UserResponse() {
    }

    public UserResponse(Long userId, String username, String email, Short status) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }
}

