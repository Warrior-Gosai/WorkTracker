package com.devworktracker.project.mapper;

import com.devworktracker.project.dto.ProjectResponse;
import com.devworktracker.project.entity.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project entity) {
        if (entity == null) {
            return null;
        }
        return new ProjectResponse(
                entity.getProjectId(),
                entity.getProjectCode(),
                entity.getProjectName(),
                entity.getDescription(),
                entity.getStatus(),
                entity.getRemarks(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

