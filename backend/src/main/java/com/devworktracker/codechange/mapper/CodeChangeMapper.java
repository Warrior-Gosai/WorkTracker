package com.devworktracker.codechange.mapper;

import com.devworktracker.codechange.dto.CodeChangeFileDto;
import com.devworktracker.codechange.dto.CodeChangeResponse;
import com.devworktracker.codechange.dto.CommitSearchResponse;
import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.entity.CodeChangeFile;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Component
public class CodeChangeMapper {

    public CodeChangeFileDto toFileDto(CodeChangeFile file) {
        if (file == null) {
            return null;
        }
        return new CodeChangeFileDto(
                file.getCodeChangeFileId(),
                file.getCodeChangeId(),
                file.getLayer(),
                file.getTechnology(),
                file.getFilePath(),
                file.getWhatChanged(),
                file.getWhyChanged(),
                file.getAffectedFiles(),
                file.getRemarks(),
                file.getCreatedAt()
        );
    }

    public CodeChangeFile toFileEntity(CodeChangeFileDto dto, Long codeChangeId) {
        if (dto == null) {
            return null;
        }
        return new CodeChangeFile(
                codeChangeId,
                dto.getLayer(),
                dto.getTechnology(),
                dto.getFilePath(),
                dto.getWhatChanged(),
                dto.getWhyChanged(),
                dto.getAffectedFiles(),
                dto.getRemarks()
        );
    }

    public CodeChangeResponse toResponse(CodeChange codeChange) {
        if (codeChange == null) {
            return null;
        }

        Long workLogId = codeChange.getWorkLogId();
        String workLogCode = null;
        LocalDate workDate = null;
        String taskRequirement = null;

        Long taskItemId = null;
        String taskItemCode = null;
        String taskItemTitle = null;

        Long projectId = null;
        String projectCode = null;
        String projectName = null;

        WorkLog workLog = codeChange.getWorkLog();
        if (workLog != null) {
            workLogId = workLog.getWorkLogId();
            workLogCode = workLog.getWorkLogCode();
            workDate = workLog.getWorkDate();
            taskRequirement = workLog.getTaskRequirement();

            TaskItem taskItem = workLog.getTaskItem();
            if (taskItem != null) {
                taskItemId = taskItem.getTaskItemId();
                taskItemCode = taskItem.getTaskItemCode();
                taskItemTitle = taskItem.getTitle();

                Project project = taskItem.getProject();
                if (project != null) {
                    projectId = project.getProjectId();
                    projectCode = project.getProjectCode();
                    projectName = project.getProjectName();
                } else if (taskItem.getProjectId() != null) {
                    projectId = taskItem.getProjectId();
                }
            } else if (workLog.getTaskItemId() != null) {
                taskItemId = workLog.getTaskItemId();
            }
        }

        List<CodeChangeFileDto> files = codeChange.getFiles() != null
                ? codeChange.getFiles().stream().map(this::toFileDto).toList()
                : Collections.emptyList();

        return new CodeChangeResponse(
                codeChange.getCodeChangeId(),
                codeChange.getCodeChangeCode(),
                workLogId,
                workLogCode,
                workDate,
                taskRequirement,
                taskItemId,
                taskItemCode,
                taskItemTitle,
                projectId,
                projectCode,
                projectName,
                codeChange.getChangeStatus(),
                codeChange.getSvnCommitId(),
                codeChange.getChangeDatetime(),
                codeChange.getEnvironment(),
                codeChange.getRemarks(),
                files.size(),
                files,
                codeChange.getCreatedAt(),
                codeChange.getUpdatedAt()
        );
    }

    public CommitSearchResponse toCommitSearchResponse(CodeChange codeChange) {
        if (codeChange == null) {
            return null;
        }

        Long workLogId = codeChange.getWorkLogId();
        String workLogCode = null;
        LocalDate workDate = null;
        String taskRequirement = null;

        Long taskItemId = null;
        String taskItemCode = null;
        String taskItemTitle = null;

        Long projectId = null;
        String projectCode = null;
        String projectName = null;

        WorkLog workLog = codeChange.getWorkLog();
        if (workLog != null) {
            workLogId = workLog.getWorkLogId();
            workLogCode = workLog.getWorkLogCode();
            workDate = workLog.getWorkDate();
            taskRequirement = workLog.getTaskRequirement();

            TaskItem taskItem = workLog.getTaskItem();
            if (taskItem != null) {
                taskItemId = taskItem.getTaskItemId();
                taskItemCode = taskItem.getTaskItemCode();
                taskItemTitle = taskItem.getTitle();

                Project project = taskItem.getProject();
                if (project != null) {
                    projectId = project.getProjectId();
                    projectCode = project.getProjectCode();
                    projectName = project.getProjectName();
                } else if (taskItem.getProjectId() != null) {
                    projectId = taskItem.getProjectId();
                }
            } else if (workLog.getTaskItemId() != null) {
                taskItemId = workLog.getTaskItemId();
            }
        }

        List<CodeChangeFileDto> files = codeChange.getFiles() != null
                ? codeChange.getFiles().stream().map(this::toFileDto).toList()
                : Collections.emptyList();

        return new CommitSearchResponse(
                codeChange.getCodeChangeId(),
                codeChange.getCodeChangeCode(),
                codeChange.getSvnCommitId(),
                codeChange.getChangeDatetime(),
                codeChange.getEnvironment(),
                codeChange.getChangeStatus(),
                codeChange.getRemarks(),
                workLogId,
                workLogCode,
                workDate,
                taskRequirement,
                taskItemId,
                taskItemCode,
                taskItemTitle,
                projectId,
                projectCode,
                projectName,
                files,
                Collections.emptyList()
        );
    }
}
