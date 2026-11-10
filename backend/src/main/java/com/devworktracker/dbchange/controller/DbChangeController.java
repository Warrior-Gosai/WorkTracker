package com.devworktracker.dbchange.controller;

import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.dbchange.dto.CreateDbChangeRequest;
import com.devworktracker.dbchange.dto.DbChangeResponse;
import com.devworktracker.dbchange.dto.UpdateDbChangeRequest;
import com.devworktracker.dbchange.service.DbChangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/db-changes")
@Tag(name = "Database Change Log Management", description = "Endpoints for managing database changes, schema modifications, and script records")
public class DbChangeController {

    private final DbChangeService dbChangeService;

    public DbChangeController(DbChangeService dbChangeService) {
        this.dbChangeService = dbChangeService;
    }

    @PostMapping
    @Operation(summary = "Create DB change", description = "Creates a new database change record linked to a daily work log")
    public ResponseEntity<ApiResponse<DbChangeResponse>> createDbChange(@Valid @RequestBody CreateDbChangeRequest request) {
        DbChangeResponse response = dbChangeService.createDbChange(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Database change created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List DB changes", description = "Paginated listing of database changes with multi-field search and filters")
    public ResponseEntity<ApiResponse<PageResponse<DbChangeResponse>>> getDbChanges(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long workLogId,
            @RequestParam(required = false) Long taskItemId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String databaseName,
            @RequestParam(required = false) String objectType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PageResponse<DbChangeResponse> response = dbChangeService.getDbChanges(
                search, workLogId, taskItemId, projectId, dateFrom, dateTo,
                environment, databaseName, objectType, page, size, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success("Database changes retrieved successfully", response));
    }

    @GetMapping("/{dbChangeId}")
    @Operation(summary = "Get DB change by ID", description = "Retrieves details of a database change including hierarchy context")
    public ResponseEntity<ApiResponse<DbChangeResponse>> getDbChangeById(@PathVariable Long dbChangeId) {
        DbChangeResponse response = dbChangeService.getDbChangeById(dbChangeId);
        return ResponseEntity.ok(ApiResponse.success("Database change retrieved successfully", response));
    }

    @PutMapping("/{dbChangeId}")
    @Operation(summary = "Update DB change", description = "Updates editable details of an existing database change")
    public ResponseEntity<ApiResponse<DbChangeResponse>> updateDbChange(
            @PathVariable Long dbChangeId,
            @Valid @RequestBody UpdateDbChangeRequest request) {
        DbChangeResponse response = dbChangeService.updateDbChange(dbChangeId, request);
        return ResponseEntity.ok(ApiResponse.success("Database change updated successfully", response));
    }
}
