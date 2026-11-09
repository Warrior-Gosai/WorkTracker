package com.devworktracker.codechange.service;

import com.devworktracker.codechange.dto.CodeChangeFileDto;
import com.devworktracker.codechange.dto.CodeChangeResponse;
import com.devworktracker.codechange.dto.CommitSearchResponse;
import com.devworktracker.codechange.dto.CreateCodeChangeRequest;
import com.devworktracker.codechange.dto.UpdateCodeChangeRequest;
import com.devworktracker.common.response.PageResponse;

import java.time.LocalDate;

public interface CodeChangeService {

    CodeChangeResponse createCodeChange(CreateCodeChangeRequest request);

    PageResponse<CodeChangeResponse> getCodeChanges(
            String search,
            Long workLogId,
            Long taskItemId,
            Long projectId,
            String changeStatus,
            String environment,
            LocalDate dateFrom,
            LocalDate dateTo,
            int page,
            int size,
            String sortBy,
            String direction
    );

    CodeChangeResponse getCodeChangeById(Long codeChangeId);

    CodeChangeResponse updateCodeChange(Long codeChangeId, UpdateCodeChangeRequest request);

    CommitSearchResponse searchBySvnCommitId(String svnCommitId);

    CodeChangeFileDto addFile(Long codeChangeId, CodeChangeFileDto fileDto);

    CodeChangeFileDto updateFile(Long codeChangeId, Long fileId, CodeChangeFileDto fileDto);

    void deleteFile(Long codeChangeId, Long fileId);
}
