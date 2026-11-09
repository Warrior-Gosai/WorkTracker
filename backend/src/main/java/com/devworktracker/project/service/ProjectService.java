package com.devworktracker.project.service;

import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.dto.CreateProjectRequest;
import com.devworktracker.project.dto.ProjectResponse;
import com.devworktracker.project.dto.UpdateProjectRequest;

public interface ProjectService {

    ProjectResponse createProject(CreateProjectRequest request);

    PageResponse<ProjectResponse> getProjects(String search, Short status, int page, int size, String sortBy, String direction);

    ProjectResponse getProjectById(Long projectId);

    ProjectResponse updateProject(Long projectId, UpdateProjectRequest request);
}

