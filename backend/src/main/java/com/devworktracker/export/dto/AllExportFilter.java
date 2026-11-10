package com.devworktracker.export.dto;

import java.time.LocalDate;

public class AllExportFilter {

    private String scope = "all";
    private String search;
    private Long projectId;
    private Long taskItemId;
    private Long workLogId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String environment;
    private String workType;
    private String status;
    private String databaseName;
    private String objectType;
    private String changeStatus;
    private String svnCommitId;

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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getTaskItemId() {
        return taskItemId;
    }

    public void setTaskItemId(Long taskItemId) {
        this.taskItemId = taskItemId;
    }

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
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

    public String getChangeStatus() {
        return changeStatus;
    }

    public void setChangeStatus(String changeStatus) {
        this.changeStatus = changeStatus;
    }

    public String getSvnCommitId() {
        return svnCommitId;
    }

    public void setSvnCommitId(String svnCommitId) {
        this.svnCommitId = svnCommitId;
    }

    public WorkLogExportFilter toWorkLogFilter() {
        WorkLogExportFilter filter = new WorkLogExportFilter();
        filter.setScope(scope);
        filter.setSearch(search);
        filter.setProjectId(projectId);
        filter.setTaskItemId(taskItemId);
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);
        filter.setEnvironment(environment);
        filter.setWorkType(workType);
        filter.setStatus(status);
        return filter;
    }

    public DbChangeExportFilter toDbChangeFilter() {
        DbChangeExportFilter filter = new DbChangeExportFilter();
        filter.setScope(scope);
        filter.setSearch(search);
        filter.setWorkLogId(workLogId);
        filter.setTaskItemId(taskItemId);
        filter.setProjectId(projectId);
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);
        filter.setEnvironment(environment);
        filter.setDatabaseName(databaseName);
        filter.setObjectType(objectType);
        return filter;
    }

    public CodeChangeExportFilter toCodeChangeFilter() {
        CodeChangeExportFilter filter = new CodeChangeExportFilter();
        filter.setScope(scope);
        filter.setSearch(search);
        filter.setWorkLogId(workLogId);
        filter.setTaskItemId(taskItemId);
        filter.setProjectId(projectId);
        filter.setChangeStatus(changeStatus);
        filter.setEnvironment(environment);
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);
        filter.setSvnCommitId(svnCommitId);
        return filter;
    }
}
