package com.devworktracker.project.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.dto.CreateProjectRequest;
import com.devworktracker.project.dto.ProjectResponse;
import com.devworktracker.project.dto.UpdateProjectRequest;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.mapper.ProjectMapper;
import com.devworktracker.project.repository.ProjectRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ProjectServiceImpl implements ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectServiceImpl.class);

    private static final int MAX_PAGE_SIZE = 100;

    private static final Map<String, String> SORT_ALLOWLIST = Map.of(
            "createdAt", "createdAt",
            "updatedAt", "updatedAt",
            "projectName", "projectName",
            "projectCode", "projectCode",
            "status", "status",
            "projectId", "projectId"
    );

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public ProjectServiceImpl(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        log.info("Creating new project with name: {}", request.getProjectName());

        Long seqVal = projectRepository.getNextProjectCodeSequence();
        if (seqVal == null) {
            throw new IllegalStateException("Failed to obtain nextval from sequence seq_project_code");
        }
        String projectCode = String.format("PRJ-%06d", seqVal);

        Project project = new Project(
                projectCode,
                request.getProjectName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                (short) 1,
                request.getRemarks() != null ? request.getRemarks().trim() : null
        );

        Project saved = projectRepository.save(project);
        log.info("Project created successfully with code: {} and ID: {}", saved.getProjectCode(), saved.getProjectId());
        return projectMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProjectResponse> getProjects(
            String search,
            Short status,
            int page,
            int size,
            String sortBy,
            String direction) {

        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and " + MAX_PAGE_SIZE);
        }

        String sortField = sortBy != null ? sortBy.trim() : "createdAt";
        if (!SORT_ALLOWLIST.containsKey(sortField)) {
            throw new BadRequestException("Invalid sort field: '" + sortBy + "'. Allowed fields: " + SORT_ALLOWLIST.keySet());
        }

        String sortDir = direction != null ? direction.trim().toLowerCase() : "desc";
        Sort.Direction dir;
        if ("asc".equalsIgnoreCase(sortDir)) {
            dir = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(sortDir)) {
            dir = Sort.Direction.DESC;
        } else {
            throw new BadRequestException("Invalid sort direction: '" + direction + "'. Must be 'asc' or 'desc'");
        }

        if (status != null && status != 0 && status != 1) {
            throw new BadRequestException("Status must be 0 (Inactive) or 1 (Active)");
        }

        Specification<Project> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("projectName")), pattern);
                Predicate codeLike = cb.like(cb.lower(root.get("projectCode")), pattern);
                predicates.add(cb.or(nameLike, codeLike));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, SORT_ALLOWLIST.get(sortField)));
        Page<Project> projectPage = projectRepository.findAll(spec, pageable);

        Page<ProjectResponse> responsePage = projectPage.map(projectMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, UpdateProjectRequest request) {
        log.info("Updating project id: {}", projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        project.setProjectName(request.getProjectName().trim());
        project.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        project.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        Project saved = projectRepository.save(project);
        log.info("Project id: {} updated successfully", projectId);
        return projectMapper.toResponse(saved);
    }
}

