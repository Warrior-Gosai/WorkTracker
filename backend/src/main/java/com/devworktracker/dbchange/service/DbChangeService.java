package com.devworktracker.dbchange.service;

import com.devworktracker.common.response.PageResponse;
import com.devworktracker.dbchange.dto.CreateDbChangeRequest;
import com.devworktracker.dbchange.dto.DbChangeResponse;
import com.devworktracker.dbchange.dto.UpdateDbChangeRequest;

import java.time.LocalDate;

public interface DbChangeService {

    DbChangeResponse createDbChange(CreateDbChangeRequest request);

    PageResponse<DbChangeResponse> getDbChanges(
            String search,
            Long workLogId,
            Long taskItemId,
            Long projectId,
            LocalDate dateFrom,
            LocalDate dateTo,
            String environment,
            String databaseName,
            String objectType,
            int page,
            int size,
            String sortBy,
            String direction
    );

    DbChangeResponse getDbChangeById(Long dbChangeId);

    DbChangeResponse updateDbChange(Long dbChangeId, UpdateDbChangeRequest request);
}
