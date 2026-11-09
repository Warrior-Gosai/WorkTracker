package com.devworktracker.worklog.service;

import com.devworktracker.common.response.PageResponse;
import com.devworktracker.worklog.dto.CreateWorkLogRequest;
import com.devworktracker.worklog.dto.UpdateWorkLogRequest;
import com.devworktracker.worklog.dto.WorkLogResponse;

import java.time.LocalDate;

public interface WorkLogService {

    WorkLogResponse createWorkLog(CreateWorkLogRequest request);

    PageResponse<WorkLogResponse> getWorkLogs(
            String search,
            Long taskItemId,
            Long projectId,
            LocalDate workDateFrom,
            LocalDate workDateTo,
            String environment,
            String workType,
            String status,
            int page,
            int size,
            String sortBy,
            String direction
    );

    WorkLogResponse getWorkLogById(Long workLogId);

    WorkLogResponse updateWorkLog(Long workLogId, UpdateWorkLogRequest request);
}
