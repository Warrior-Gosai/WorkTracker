package com.devworktracker.pendingtask.service;

import com.devworktracker.common.response.PageResponse;
import com.devworktracker.pendingtask.dto.CreatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.PendingTaskResponse;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskStatusRequest;

import java.time.LocalDate;

public interface PendingTaskService {

    PendingTaskResponse createPendingTask(CreatePendingTaskRequest request);

    PageResponse<PendingTaskResponse> getPendingTasks(
            String search,
            Long projectId,
            String priority,
            String status,
            LocalDate dueDateFrom,
            LocalDate dueDateTo,
            Boolean overdue,
            int page,
            int size,
            String sortBy,
            String direction
    );

    PendingTaskResponse getPendingTaskById(Long pendingTaskId);

    PendingTaskResponse updatePendingTask(Long pendingTaskId, UpdatePendingTaskRequest request);

    PendingTaskResponse updatePendingTaskStatus(Long pendingTaskId, UpdatePendingTaskStatusRequest request);
}

