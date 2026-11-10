package com.devworktracker.pendingtask.controller;

import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.pendingtask.dto.CreatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.PendingTaskResponse;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskStatusRequest;
import com.devworktracker.pendingtask.service.PendingTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/pending-tasks")
@Tag(name = "Pending Task Management", description = "Endpoints for managing independent reminders, follow-ups, and project pending tasks")
public class PendingTaskController {

    private final PendingTaskService pendingTaskService;

    public PendingTaskController(PendingTaskService pendingTaskService) {
        this.pendingTaskService = pendingTaskService;
    }

    @PostMapping
    @Operation(summary = "Create pending task", description = "Creates a new pending task under an active project")
    public ResponseEntity<ApiResponse<PendingTaskResponse>> createPendingTask(
            @Valid @RequestBody CreatePendingTaskRequest request) {
        PendingTaskResponse response = pendingTaskService.createPendingTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pending task created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List pending tasks", description = "Paginated list of pending tasks with search, status, project, and overdue filters")
    public ResponseEntity<ApiResponse<PageResponse<PendingTaskResponse>>> getPendingTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        LocalDate effectiveFrom = dueDateFrom != null ? dueDateFrom : fromDate;
        LocalDate effectiveTo = dueDateTo != null ? dueDateTo : toDate;

        PageResponse<PendingTaskResponse> response = pendingTaskService.getPendingTasks(
                search, projectId, priority, status, effectiveFrom, effectiveTo, overdue,
                page, size, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success("Pending tasks retrieved successfully", response));
    }

    @GetMapping("/{pendingTaskId}")
    @Operation(summary = "Get pending task by ID", description = "Retrieves pending task details including project context and overdue status")
    public ResponseEntity<ApiResponse<PendingTaskResponse>> getPendingTaskById(
            @PathVariable Long pendingTaskId) {
        PendingTaskResponse response = pendingTaskService.getPendingTaskById(pendingTaskId);
        return ResponseEntity.ok(ApiResponse.success("Pending task retrieved successfully", response));
    }

    @PutMapping("/{pendingTaskId}")
    @Operation(summary = "Update pending task", description = "Updates editable details of a pending task")
    public ResponseEntity<ApiResponse<PendingTaskResponse>> updatePendingTask(
            @PathVariable Long pendingTaskId,
            @Valid @RequestBody UpdatePendingTaskRequest request) {
        PendingTaskResponse response = pendingTaskService.updatePendingTask(pendingTaskId, request);
        return ResponseEntity.ok(ApiResponse.success("Pending task updated successfully", response));
    }

    @PatchMapping("/{pendingTaskId}/status")
    @Operation(summary = "Update pending task status", description = "Transitions status and manages completion timestamp automatically")
    public ResponseEntity<ApiResponse<PendingTaskResponse>> updatePendingTaskStatus(
            @PathVariable Long pendingTaskId,
            @Valid @RequestBody UpdatePendingTaskStatusRequest request) {
        PendingTaskResponse response = pendingTaskService.updatePendingTaskStatus(pendingTaskId, request);
        return ResponseEntity.ok(ApiResponse.success("Pending task status updated successfully", response));
    }
}

