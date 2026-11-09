package com.devworktracker.taskitem.service;

import com.devworktracker.common.response.PageResponse;
import com.devworktracker.taskitem.dto.*;

public interface TaskItemService {

    TaskItemResponse createTaskItem(CreateTaskItemRequest request);

    PageResponse<TaskItemResponse> getTaskItems(
            String search,
            Long projectId,
            String taskType,
            String priority,
            String status,
            int page,
            int size,
            String sortBy,
            String direction
    );

    TaskItemResponse getTaskItemById(Long taskItemId);

    TaskItemResponse updateTaskItem(Long taskItemId, UpdateTaskItemRequest request);

    TaskItemResponse updateTaskStatus(Long taskItemId, UpdateTaskStatusRequest request);

    TaskItemResponse deactivateTaskItem(Long taskItemId);

    TaskItemHistoryResponse getTaskItemHistory(Long taskItemId);
}

