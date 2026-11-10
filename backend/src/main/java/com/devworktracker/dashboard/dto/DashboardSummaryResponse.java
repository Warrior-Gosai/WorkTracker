package com.devworktracker.dashboard.dto;

public class DashboardSummaryResponse {

    private Long totalProjects;
    private Long activeProjects;
    private Long totalTaskItems;
    private Long openTaskItems;
    private Long totalWorkLogs;
    private Long totalPendingTasks;
    private Long overduePendingTasks;
    private Long uncommittedCodeChanges;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(Long totalProjects, Long activeProjects, Long totalTaskItems,
                                  Long openTaskItems, Long totalWorkLogs, Long totalPendingTasks,
                                  Long overduePendingTasks, Long uncommittedCodeChanges) {
        this.totalProjects = totalProjects;
        this.activeProjects = activeProjects;
        this.totalTaskItems = totalTaskItems;
        this.openTaskItems = openTaskItems;
        this.totalWorkLogs = totalWorkLogs;
        this.totalPendingTasks = totalPendingTasks;
        this.overduePendingTasks = overduePendingTasks;
        this.uncommittedCodeChanges = uncommittedCodeChanges;
    }

    public Long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(Long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public Long getActiveProjects() {
        return activeProjects;
    }

    public void setActiveProjects(Long activeProjects) {
        this.activeProjects = activeProjects;
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

    public Long getTotalWorkLogs() {
        return totalWorkLogs;
    }

    public void setTotalWorkLogs(Long totalWorkLogs) {
        this.totalWorkLogs = totalWorkLogs;
    }

    public Long getTotalPendingTasks() {
        return totalPendingTasks;
    }

    public void setTotalPendingTasks(Long totalPendingTasks) {
        this.totalPendingTasks = totalPendingTasks;
    }

    public Long getOverduePendingTasks() {
        return overduePendingTasks;
    }

    public void setOverduePendingTasks(Long overduePendingTasks) {
        this.overduePendingTasks = overduePendingTasks;
    }

    public Long getUncommittedCodeChanges() {
        return uncommittedCodeChanges;
    }

    public void setUncommittedCodeChanges(Long uncommittedCodeChanges) {
        this.uncommittedCodeChanges = uncommittedCodeChanges;
    }
}
