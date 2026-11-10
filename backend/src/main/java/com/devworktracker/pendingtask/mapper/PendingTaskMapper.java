package com.devworktracker.pendingtask.mapper;

import com.devworktracker.pendingtask.dto.PendingTaskResponse;
import com.devworktracker.pendingtask.entity.PendingTask;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class PendingTaskMapper {

    public PendingTaskResponse toResponse(PendingTask entity) {
        if (entity == null) {
            return null;
        }

        PendingTaskResponse response = new PendingTaskResponse();
        response.setPendingTaskId(entity.getPendingTaskId());
        response.setPendingTaskCode(entity.getPendingTaskCode());
        response.setProjectId(entity.getProjectId());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setPriority(entity.getPriority());
        response.setStatus(entity.getStatus());
        response.setDueDate(entity.getDueDate());
        response.setCompletedAt(entity.getCompletedAt());
        response.setRemarks(entity.getRemarks());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getProject() != null) {
            response.setProjectCode(entity.getProject().getProjectCode());
            response.setProjectName(entity.getProject().getProjectName());
        }

        // Dynamic Overdue Calculation:
        // A task is overdue when due_date is before today, and status is neither COMPLETED nor CANCELLED.
        // Due today is not overdue. No due date is not overdue.
        boolean isOverdue = entity.getDueDate() != null
                && entity.getDueDate().isBefore(LocalDate.now())
                && !"COMPLETED".equalsIgnoreCase(entity.getStatus())
                && !"CANCELLED".equalsIgnoreCase(entity.getStatus());
        response.setOverdue(isOverdue);

        return response;
    }
}

