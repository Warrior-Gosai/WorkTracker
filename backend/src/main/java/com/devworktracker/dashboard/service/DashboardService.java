package com.devworktracker.dashboard.service;

import com.devworktracker.dashboard.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {

    DashboardSummaryResponse getSummary();

    WorkSummaryResponse getWorkSummary(LocalDate dateFrom, LocalDate dateTo, Long projectId);

    List<ProjectSummaryResponse> getProjectSummary();

    PendingTaskSummaryResponse getPendingSummary();

    List<RecentActivityResponse> getRecentActivities(int limit);
}
