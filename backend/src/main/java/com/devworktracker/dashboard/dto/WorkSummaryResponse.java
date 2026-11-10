package com.devworktracker.dashboard.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class WorkSummaryResponse {

    private Long totalWorkLogs;
    private BigDecimal totalHours;
    private Long completedWorkLogs;
    private Long inProgressWorkLogs;
    private Long blockedWorkLogs;
    private Long onHoldWorkLogs;
    private List<DailyWorkSummary> dailySummaries = new ArrayList<>();

    public WorkSummaryResponse() {
    }

    public WorkSummaryResponse(Long totalWorkLogs, BigDecimal totalHours, Long completedWorkLogs,
                               Long inProgressWorkLogs, Long blockedWorkLogs, Long onHoldWorkLogs,
                               List<DailyWorkSummary> dailySummaries) {
        this.totalWorkLogs = totalWorkLogs;
        this.totalHours = totalHours;
        this.completedWorkLogs = completedWorkLogs;
        this.inProgressWorkLogs = inProgressWorkLogs;
        this.blockedWorkLogs = blockedWorkLogs;
        this.onHoldWorkLogs = onHoldWorkLogs;
        this.dailySummaries = dailySummaries != null ? dailySummaries : new ArrayList<>();
    }

    public Long getTotalWorkLogs() {
        return totalWorkLogs;
    }

    public void setTotalWorkLogs(Long totalWorkLogs) {
        this.totalWorkLogs = totalWorkLogs;
    }

    public BigDecimal getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(BigDecimal totalHours) {
        this.totalHours = totalHours;
    }

    public Long getCompletedWorkLogs() {
        return completedWorkLogs;
    }

    public void setCompletedWorkLogs(Long completedWorkLogs) {
        this.completedWorkLogs = completedWorkLogs;
    }

    public Long getInProgressWorkLogs() {
        return inProgressWorkLogs;
    }

    public void setInProgressWorkLogs(Long inProgressWorkLogs) {
        this.inProgressWorkLogs = inProgressWorkLogs;
    }

    public Long getBlockedWorkLogs() {
        return blockedWorkLogs;
    }

    public void setBlockedWorkLogs(Long blockedWorkLogs) {
        this.blockedWorkLogs = blockedWorkLogs;
    }

    public Long getOnHoldWorkLogs() {
        return onHoldWorkLogs;
    }

    public void setOnHoldWorkLogs(Long onHoldWorkLogs) {
        this.onHoldWorkLogs = onHoldWorkLogs;
    }

    public List<DailyWorkSummary> getDailySummaries() {
        return dailySummaries;
    }

    public void setDailySummaries(List<DailyWorkSummary> dailySummaries) {
        this.dailySummaries = dailySummaries;
    }
}
