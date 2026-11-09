package com.devworktracker.taskitem.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class WorkLogHistoryDto {

    private Long workLogId;
    private String workLogCode;
    private LocalDate workDate;
    private String environment;
    private String workType;
    private String status;
    private String taskRequirement;
    private String workDescription;
    private LocalTime startTime;
    private LocalTime endTime;
    private Instant createdAt;
    private List<CodeChangeHistoryDto> codeChanges = new ArrayList<>();
    private List<DbChangeHistoryDto> dbChanges = new ArrayList<>();

    public WorkLogHistoryDto() {
    }

    public WorkLogHistoryDto(Long workLogId, String workLogCode, LocalDate workDate, String environment,
                             String workType, String status, String taskRequirement, String workDescription,
                             LocalTime startTime, LocalTime endTime, Instant createdAt) {
        this.workLogId = workLogId;
        this.workLogCode = workLogCode;
        this.workDate = workDate;
        this.environment = environment;
        this.workType = workType;
        this.status = status;
        this.taskRequirement = taskRequirement;
        this.workDescription = workDescription;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
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

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getWorkType() {
        return workType;
    }

    public void setWorkType(String workType) {
        this.workType = workType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTaskRequirement() {
        return taskRequirement;
    }

    public void setTaskRequirement(String taskRequirement) {
        this.taskRequirement = taskRequirement;
    }

    public String getWorkDescription() {
        return workDescription;
    }

    public void setWorkDescription(String workDescription) {
        this.workDescription = workDescription;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<CodeChangeHistoryDto> getCodeChanges() {
        return codeChanges;
    }

    public void setCodeChanges(List<CodeChangeHistoryDto> codeChanges) {
        this.codeChanges = codeChanges;
    }

    public List<DbChangeHistoryDto> getDbChanges() {
        return dbChanges;
    }

    public void setDbChanges(List<DbChangeHistoryDto> dbChanges) {
        this.dbChanges = dbChanges;
    }
}

