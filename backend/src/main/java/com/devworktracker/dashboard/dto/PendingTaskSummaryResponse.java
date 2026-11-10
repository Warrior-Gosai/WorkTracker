package com.devworktracker.dashboard.dto;

public class PendingTaskSummaryResponse {

    private Long pending;
    private Long inProgress;
    private Long onHold;
    private Long completed;
    private Long cancelled;
    private Long overdue;
    private Long total;

    public PendingTaskSummaryResponse() {
    }

    public PendingTaskSummaryResponse(Long pending, Long inProgress, Long onHold,
                                      Long completed, Long cancelled, Long overdue, Long total) {
        this.pending = pending;
        this.inProgress = inProgress;
        this.onHold = onHold;
        this.completed = completed;
        this.cancelled = cancelled;
        this.overdue = overdue;
        this.total = total;
    }

    public Long getPending() {
        return pending;
    }

    public void setPending(Long pending) {
        this.pending = pending;
    }

    public Long getInProgress() {
        return inProgress;
    }

    public void setInProgress(Long inProgress) {
        this.inProgress = inProgress;
    }

    public Long getOnHold() {
        return onHold;
    }

    public void setOnHold(Long onHold) {
        this.onHold = onHold;
    }

    public Long getCompleted() {
        return completed;
    }

    public void setCompleted(Long completed) {
        this.completed = completed;
    }

    public Long getCancelled() {
        return cancelled;
    }

    public void setCancelled(Long cancelled) {
        this.cancelled = cancelled;
    }

    public Long getOverdue() {
        return overdue;
    }

    public void setOverdue(Long overdue) {
        this.overdue = overdue;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
