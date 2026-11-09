package com.devworktracker.worklog.controller;

import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.worklog.dto.CreateWorkLogRequest;
import com.devworktracker.worklog.dto.UpdateWorkLogRequest;
import com.devworktracker.worklog.dto.WorkLogResponse;
import com.devworktracker.worklog.service.WorkLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/work-logs")
@Tag(name = "Work Log Management", description = "Endpoints for managing work logs, time tracking, and daily activity logs")
public class WorkLogController {

    private final WorkLogService workLogService;

    public WorkLogController(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }

    @PostMapping
    @Operation(summary = "Create work log", description = "Creates a new work log for an active task item with auto-generated code and calculated total hours")
    public ResponseEntity<ApiResponse<WorkLogResponse>> createWorkLog(@Valid @RequestBody CreateWorkLogRequest request) {
        WorkLogResponse response = workLogService.createWorkLog(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work log created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List work logs", description = "Paginated listing of work logs with multi-field search, filters, and duration calculations")
    public ResponseEntity<ApiResponse<PageResponse<WorkLogResponse>>> getWorkLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long taskItemId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDateTo,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String workType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "workDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PageResponse<WorkLogResponse> response = workLogService.getWorkLogs(
                search, taskItemId, projectId, workDateFrom, workDateTo,
                environment, workType, status, page, size, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success("Work logs retrieved successfully", response));
    }

    @GetMapping("/{workLogId}")
    @Operation(summary = "Get work log details", description = "Retrieve full details for a work log including task item and project summaries")
    public ResponseEntity<ApiResponse<WorkLogResponse>> getWorkLogById(@PathVariable Long workLogId) {
        WorkLogResponse response = workLogService.getWorkLogById(workLogId);
        return ResponseEntity.ok(ApiResponse.success("Work log retrieved successfully", response));
    }

    @PutMapping("/{workLogId}")
    @Operation(summary = "Update work log", description = "Update work log fields. Task item association remains immutable.")
    public ResponseEntity<ApiResponse<WorkLogResponse>> updateWorkLog(
            @PathVariable Long workLogId,
            @Valid @RequestBody UpdateWorkLogRequest request) {

        WorkLogResponse response = workLogService.updateWorkLog(workLogId, request);
        return ResponseEntity.ok(ApiResponse.success("Work log updated successfully", response));
    }
}
