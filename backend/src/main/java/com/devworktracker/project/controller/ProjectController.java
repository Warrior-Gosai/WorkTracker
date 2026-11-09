package com.devworktracker.project.controller;

import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.dto.CreateProjectRequest;
import com.devworktracker.project.dto.ProjectResponse;
import com.devworktracker.project.dto.UpdateProjectRequest;
import com.devworktracker.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Project Management", description = "Endpoints for managing client projects, code sequences, and statuses")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @Operation(summary = "Create a new project", description = "Generates project code automatically via sequence and creates active project")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List projects", description = "Paginated, sortable and filterable project list supporting both active and inactive projects")
    public ResponseEntity<ApiResponse<PageResponse<ProjectResponse>>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Short status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PageResponse<ProjectResponse> response = projectService.getProjects(search, status, page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully", response));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project details", description = "Retrieve a single project by its primary key")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long projectId) {
        ProjectResponse response = projectService.getProjectById(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project retrieved successfully", response));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update project", description = "Update project name, description and remarks. Inactive projects remain editable.")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request) {

        ProjectResponse response = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", response));
    }
}

