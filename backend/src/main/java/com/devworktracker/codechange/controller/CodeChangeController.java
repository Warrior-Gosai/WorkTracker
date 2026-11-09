package com.devworktracker.codechange.controller;

import com.devworktracker.codechange.dto.CodeChangeFileDto;
import com.devworktracker.codechange.dto.CodeChangeResponse;
import com.devworktracker.codechange.dto.CommitSearchResponse;
import com.devworktracker.codechange.dto.CreateCodeChangeRequest;
import com.devworktracker.codechange.dto.UpdateCodeChangeRequest;
import com.devworktracker.codechange.service.CodeChangeService;
import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/code-changes")
@Tag(name = "Code Change Log Management", description = "Endpoints for managing SVN code changes, commits, and affected file entries")
public class CodeChangeController {

    private final CodeChangeService codeChangeService;

    public CodeChangeController(CodeChangeService codeChangeService) {
        this.codeChangeService = codeChangeService;
    }

    @PostMapping
    @Operation(summary = "Create code change", description = "Creates a new code change (committed or uncommitted) with optional file details")
    public ResponseEntity<ApiResponse<CodeChangeResponse>> createCodeChange(@Valid @RequestBody CreateCodeChangeRequest request) {
        CodeChangeResponse response = codeChangeService.createCodeChange(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Code change created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List code changes", description = "Paginated listing of code changes with multi-field search and filters")
    public ResponseEntity<ApiResponse<PageResponse<CodeChangeResponse>>> getCodeChanges(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long workLogId,
            @RequestParam(required = false) Long taskItemId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String changeStatus,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "changeDatetime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PageResponse<CodeChangeResponse> response = codeChangeService.getCodeChanges(
                search, workLogId, taskItemId, projectId, changeStatus,
                environment, dateFrom, dateTo, page, size, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success("Code changes retrieved successfully", response));
    }

    @GetMapping("/{codeChangeId}")
    @Operation(summary = "Get code change details", description = "Retrieve full details for a code change including associated file records and work log context")
    public ResponseEntity<ApiResponse<CodeChangeResponse>> getCodeChangeById(@PathVariable Long codeChangeId) {
        CodeChangeResponse response = codeChangeService.getCodeChangeById(codeChangeId);
        return ResponseEntity.ok(ApiResponse.success("Code change retrieved successfully", response));
    }

    @PutMapping("/{codeChangeId}")
    @Operation(summary = "Update code change", description = "Updates status, commit ID, environment and remarks. Supports UNCOMMITTED to COMMITTED transition.")
    public ResponseEntity<ApiResponse<CodeChangeResponse>> updateCodeChange(
            @PathVariable Long codeChangeId,
            @Valid @RequestBody UpdateCodeChangeRequest request) {

        CodeChangeResponse response = codeChangeService.updateCodeChange(codeChangeId, request);
        return ResponseEntity.ok(ApiResponse.success("Code change updated successfully", response));
    }

    @GetMapping("/commit/{svnCommitId}")
    @Operation(summary = "Exact SVN Commit ID search", description = "Finds code change context and related work log, task item, and project for an SVN commit ID")
    public ResponseEntity<ApiResponse<CommitSearchResponse>> searchBySvnCommitId(@PathVariable String svnCommitId) {
        CommitSearchResponse response = codeChangeService.searchBySvnCommitId(svnCommitId);
        return ResponseEntity.ok(ApiResponse.success("Commit details retrieved successfully", response));
    }

    @PostMapping("/{codeChangeId}/files")
    @Operation(summary = "Add file entry", description = "Adds a child file entry to an existing code change")
    public ResponseEntity<ApiResponse<CodeChangeFileDto>> addFile(
            @PathVariable Long codeChangeId,
            @Valid @RequestBody CodeChangeFileDto fileDto) {

        CodeChangeFileDto response = codeChangeService.addFile(codeChangeId, fileDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File entry added successfully", response));
    }

    @PutMapping("/{codeChangeId}/files/{fileId}")
    @Operation(summary = "Update file entry", description = "Updates details of an existing child file entry")
    public ResponseEntity<ApiResponse<CodeChangeFileDto>> updateFile(
            @PathVariable Long codeChangeId,
            @PathVariable Long fileId,
            @Valid @RequestBody CodeChangeFileDto fileDto) {

        CodeChangeFileDto response = codeChangeService.updateFile(codeChangeId, fileId, fileDto);
        return ResponseEntity.ok(ApiResponse.success("File entry updated successfully", response));
    }

    @DeleteMapping("/{codeChangeId}/files/{fileId}")
    @Operation(summary = "Delete file entry", description = "Deletes an individual file entry without affecting the parent code change")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long codeChangeId,
            @PathVariable Long fileId) {

        codeChangeService.deleteFile(codeChangeId, fileId);
        return ResponseEntity.noContent().build();
    }
}
