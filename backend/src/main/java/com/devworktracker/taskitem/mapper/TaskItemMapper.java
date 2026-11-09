package com.devworktracker.taskitem.mapper;

import com.devworktracker.taskitem.dto.TaskItemResponse;
import com.devworktracker.taskitem.entity.TaskItem;
import org.springframework.stereotype.Component;

@Component
public class TaskItemMapper {

    public TaskItemResponse toResponse(TaskItem entity) {
        if (entity == null) {
            return null;
        }

        String projectCode = entity.getProject() != null ? entity.getProject().getProjectCode() : null;
        String projectName = entity.getProject() != null ? entity.getProject().getProjectName() : null;

        return new TaskItemResponse(
                entity.getTaskItemId(),
                entity.getTaskItemCode(),
                entity.getProjectId(),
                projectCode,
                projectName,
                entity.getTaskType(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPriority(),
                entity.getStatus(),
                entity.getIsActive(),
                entity.getCompletedAt(),
                entity.getRemarks(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

