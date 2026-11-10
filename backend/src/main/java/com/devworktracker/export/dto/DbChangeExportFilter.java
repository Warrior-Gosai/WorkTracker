package com.devworktracker.export.dto;

import java.time.LocalDate;

public class DbChangeExportFilter {

    private String scope = "all";
    private String search;
    private Long workLogId;
    private Long taskItemId;
    private Long projectId;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String environment;
    private String databaseName;
    private String objectType;

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

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
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

    public LocalDate getDateFrom() {
        return dateFrom != null ? dateFrom : fromDate;
    }

    public void setDateFrom(LocalDate dateFrom) {
        this.dateFrom = dateFrom;
    }

    public LocalDate getDateTo() {
        return dateTo != null ? dateTo : toDate;
    }

    public void setDateTo(LocalDate dateTo) {
        this.dateTo = dateTo;
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
}
