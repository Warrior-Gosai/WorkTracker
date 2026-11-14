package com.devworktracker.export.dto;

import java.time.LocalDate;

public class WorkLogExportFilter {

    private String scope = "all";
    private String search;
    private Long taskItemId;
    private Long projectId;
    private LocalDate workDateFrom;
    private LocalDate workDateTo;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String environment;
    private String workType;
    private String status;

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public Long getTaskItemId() {
        return taskItemId;
    }

    public void setTaskItemId(Long taskItemId) {
        this.taskItemId = taskItemId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public LocalDate getWorkDateFrom() {
        return workDateFrom != null ? workDateFrom : fromDate;
    }

    public void setWorkDateFrom(LocalDate workDateFrom) {
        this.workDateFrom = workDateFrom;
    }

    public LocalDate getWorkDateTo() {
        return workDateTo != null ? workDateTo : toDate;
    }

    public void setWorkDateTo(LocalDate workDateTo) {
        this.workDateTo = workDateTo;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
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
}

