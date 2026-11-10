package com.devworktracker.dashboard.controller;

import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.dashboard.dto.*;
import com.devworktracker.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Central overview, summary metrics, charts, and activity feeds")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Dashboard overall summary", description = "Retrieves high-level counts and metrics across all modules")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse response = dashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", response));
    }

    @GetMapping("/work-summary")
    @Operation(summary = "Work log summary & chart data", description = "Aggregates work log counts, calculated hours, and status breakdown")
    public ResponseEntity<ApiResponse<WorkSummaryResponse>> getWorkSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long projectId) {

        LocalDate effectiveFrom = dateFrom != null ? dateFrom : fromDate;
        LocalDate effectiveTo = dateTo != null ? dateTo : toDate;

        WorkSummaryResponse response = dashboardService.getWorkSummary(effectiveFrom, effectiveTo, projectId);
        return ResponseEntity.ok(ApiResponse.success("Work summary retrieved successfully", response));
    }

    @GetMapping("/project-summary")
    @Operation(summary = "Project breakdown", description = "Retrieves project-wise active/completed task counts and work logs count")
    public ResponseEntity<ApiResponse<List<ProjectSummaryResponse>>> getProjectSummary() {
        List<ProjectSummaryResponse> response = dashboardService.getProjectSummary();
        return ResponseEntity.ok(ApiResponse.success("Project summary retrieved successfully", response));
    }

    @GetMapping("/pending-summary")
    @Operation(summary = "Pending task status breakdown", description = "Counts pending tasks across workflow statuses and overdue items")
    public ResponseEntity<ApiResponse<PendingTaskSummaryResponse>> getPendingSummary() {
        PendingTaskSummaryResponse response = dashboardService.getPendingSummary();
        return ResponseEntity.ok(ApiResponse.success("Pending task summary retrieved successfully", response));
    }

    @GetMapping("/recent-activities")
    @Operation(summary = "Recent activities feed", description = "Aggregates recent items across all six modules with navigation targets")
    public ResponseEntity<ApiResponse<List<RecentActivityResponse>>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        List<RecentActivityResponse> response = dashboardService.getRecentActivities(limit);
        return ResponseEntity.ok(ApiResponse.success("Recent activities retrieved successfully", response));
    }
}
