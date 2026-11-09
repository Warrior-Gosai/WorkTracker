package com.devworktracker.taskitem.controller;

import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.taskitem.dto.*;
import com.devworktracker.taskitem.service.TaskItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/task-items")
@Tag(name = "Task Item Management", description = "Endpoints for managing task items, workflow statuses, deactivation and task history")
public class TaskItemController {

    private final TaskItemService taskItemService;

    public TaskItemController(TaskItemService taskItemService) {
        this.taskItemService = taskItemService;
    }

    @PostMapping
    @Operation(summary = "Create task item", description = "Creates a new active task item with auto-generated code and completion timestamp rules")
    public ResponseEntity<ApiResponse<TaskItemResponse>> createTaskItem(@Valid @RequestBody CreateTaskItemRequest request) {
        TaskItemResponse response = taskItemService.createTaskItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task item created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List task items", description = "Paginated listing of active task items with search and filters. Inactive items are excluded.")
    public ResponseEntity<ApiResponse<PageResponse<TaskItemResponse>>> getTaskItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String taskType,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PageResponse<TaskItemResponse> response = taskItemService.getTaskItems(
                search, projectId, taskType, priority, status, page, size, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success("Task items retrieved successfully", response));
    }

    @GetMapping("/{taskItemId}")
    @Operation(summary = "Get task item details", description = "Retrieve details for an active task item. Returns 404 if missing or inactive.")
    public ResponseEntity<ApiResponse<TaskItemResponse>> getTaskItemById(@PathVariable Long taskItemId) {
        TaskItemResponse response = taskItemService.getTaskItemById(taskItemId);
        return ResponseEntity.ok(ApiResponse.success("Task item retrieved successfully", response));
    }

    @PutMapping("/{taskItemId}")
    @Operation(summary = "Update task item", description = "Update task type, title, description, priority and remarks. Project and active state are immutable.")
    public ResponseEntity<ApiResponse<TaskItemResponse>> updateTaskItem(
            @PathVariable Long taskItemId,
            @Valid @RequestBody UpdateTaskItemRequest request) {

        TaskItemResponse response = taskItemService.updateTaskItem(taskItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Task item updated successfully", response));
    }

    @PatchMapping("/{taskItemId}/status")
    @Operation(summary = "Update task workflow status", description = "Updates workflow status and recalculates completed_at timestamp.")
    public ResponseEntity<ApiResponse<TaskItemResponse>> updateTaskStatus(
            @PathVariable Long taskItemId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {

        TaskItemResponse response = taskItemService.updateTaskStatus(taskItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Task item status updated successfully", response));
    }

    @PatchMapping("/{taskItemId}/deactivate")
    @Operation(summary = "Deactivate task item", description = "Deactivates task item without affecting historical work logs, code changes or db changes.")
    public ResponseEntity<ApiResponse<TaskItemResponse>> deactivateTaskItem(@PathVariable Long taskItemId) {
        TaskItemResponse response = taskItemService.deactivateTaskItem(taskItemId);
        return ResponseEntity.ok(ApiResponse.success("Task item deactivated successfully", response));
    }

    @GetMapping("/{taskItemId}/history")
    @Operation(summary = "Get task item history", description = "Retrieves associated work logs, code changes, and database changes for this task item.")
    public ResponseEntity<ApiResponse<TaskItemHistoryResponse>> getTaskItemHistory(@PathVariable Long taskItemId) {
        TaskItemHistoryResponse response = taskItemService.getTaskItemHistory(taskItemId);
        return ResponseEntity.ok(ApiResponse.success("Task item history retrieved successfully", response));
    }
}
