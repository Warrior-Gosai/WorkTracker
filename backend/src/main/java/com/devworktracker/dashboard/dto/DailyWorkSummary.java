package com.devworktracker.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyWorkSummary {

    private LocalDate date;
    private BigDecimal hours;
    private Long workLogsCount;

    public DailyWorkSummary() {
    }

    public DailyWorkSummary(LocalDate date, BigDecimal hours, Long workLogsCount) {
        this.date = date;
        this.hours = hours;
        this.workLogsCount = workLogsCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getHours() {
        return hours;
    }

    public void setHours(BigDecimal hours) {
        this.hours = hours;
    }

    public Long getWorkLogsCount() {
        return workLogsCount;
    }

    public void setWorkLogsCount(Long workLogsCount) {
        this.workLogsCount = workLogsCount;
    }
}
