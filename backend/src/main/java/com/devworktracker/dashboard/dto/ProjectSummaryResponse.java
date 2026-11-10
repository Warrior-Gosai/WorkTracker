package com.devworktracker.dashboard.dto;

public class ProjectSummaryResponse {

    private Long projectId;
    private String projectCode;
    private String projectName;
    private Short projectStatus;
    private Long totalTaskItems;
    private Long openTaskItems;
    private Long completedTaskItems;
    private Long totalWorkLogs;

    public ProjectSummaryResponse() {
    }

    public ProjectSummaryResponse(Long projectId, String projectCode, String projectName,
                                  Short projectStatus, Long totalTaskItems, Long openTaskItems,
                                  Long completedTaskItems, Long totalWorkLogs) {
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.projectStatus = projectStatus;
        this.totalTaskItems = totalTaskItems;
        this.openTaskItems = openTaskItems;
        this.completedTaskItems = completedTaskItems;
        this.totalWorkLogs = totalWorkLogs;
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

    public Short getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(Short projectStatus) {
        this.projectStatus = projectStatus;
    }

    public Long getTotalTaskItems() {
        return totalTaskItems;
    }

    public void setTotalTaskItems(Long totalTaskItems) {
        this.totalTaskItems = totalTaskItems;
    }

    public Long getOpenTaskItems() {
        return openTaskItems;
    }

    public void setOpenTaskItems(Long openTaskItems) {
        this.openTaskItems = openTaskItems;
    }

    public Long getCompletedTaskItems() {
        return completedTaskItems;
    }

    public void setCompletedTaskItems(Long completedTaskItems) {
        this.completedTaskItems = completedTaskItems;
    }

    public Long getTotalWorkLogs() {
        return totalWorkLogs;
    }

    public void setTotalWorkLogs(Long totalWorkLogs) {
        this.totalWorkLogs = totalWorkLogs;
    }
}
