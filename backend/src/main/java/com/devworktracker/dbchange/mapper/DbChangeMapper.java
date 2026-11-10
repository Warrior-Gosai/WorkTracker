package com.devworktracker.dbchange.mapper;

import com.devworktracker.dbchange.dto.DbChangeResponse;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DbChangeMapper {

    public DbChangeResponse toResponse(DbChange dbChange) {
        if (dbChange == null) {
            return null;
        }

        Long workLogId = dbChange.getWorkLogId();
        String workLogCode = null;
        LocalDate workDate = null;

        Long taskItemId = null;
        String taskItemCode = null;
        String taskItemTitle = null;

        Long projectId = null;
        String projectCode = null;
        String projectName = null;

        WorkLog workLog = dbChange.getWorkLog();
        if (workLog != null) {
            workLogId = workLog.getWorkLogId();
            workLogCode = workLog.getWorkLogCode();
            workDate = workLog.getWorkDate();

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

        return new DbChangeResponse(
                dbChange.getDbChangeId(),
                dbChange.getDbChangeCode(),
                workLogId,
                workLogCode,
                workDate,
                taskItemId,
                taskItemCode,
                taskItemTitle,
                projectId,
                projectCode,
                projectName,
                dbChange.getEnvironment(),
                dbChange.getDatabaseName(),
                dbChange.getObjectType(),
                dbChange.getObjectName(),
                dbChange.getWhatChanged(),
                dbChange.getWhyChanged(),
                dbChange.getAffectedObject(),
                dbChange.getRemarks(),
                dbChange.getCreatedAt(),
                dbChange.getUpdatedAt()
        );
    }
}
