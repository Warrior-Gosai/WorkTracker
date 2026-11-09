package com.devworktracker.worklog.mapper;

import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.dto.WorkLogResponse;
import com.devworktracker.worklog.entity.WorkLog;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Component
public class WorkLogMapper {

    public WorkLogResponse toResponse(WorkLog workLog) {
        if (workLog == null) {
            return null;
        }

        Long taskItemId = workLog.getTaskItemId();
        String taskItemCode = null;
        String taskItemTitle = null;
        Long projectId = null;
        String projectCode = null;
        String projectName = null;

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
        }

        String day = deriveDayOfWeek(workLog.getWorkDate());
        BigDecimal totalHours = calculateTotalHours(workLog.getStartTime(), workLog.getEndTime());

        return new WorkLogResponse(
                workLog.getWorkLogId(),
                workLog.getWorkLogCode(),
                taskItemId,
                taskItemCode,
                taskItemTitle,
                projectId,
                projectCode,
                projectName,
                workLog.getWorkDate(),
                day,
                workLog.getEnvironment(),
                workLog.getWorkType(),
                workLog.getTaskRequirement(),
                workLog.getWorkDescription(),
                workLog.getPurposeReason(),
                workLog.getTechnologyArea(),
                workLog.getStartTime(),
                workLog.getEndTime(),
                totalHours,
                workLog.getStatus(),
                workLog.getProblemBlocker(),
                workLog.getSolutionResolution(),
                workLog.getTestingVerification(),
                workLog.getResultOutcome(),
                workLog.getPendingNextAction(),
                workLog.getNotesRemarks(),
                Collections.emptyList(),
                Collections.emptyList(),
                workLog.getCreatedAt(),
                workLog.getUpdatedAt()
        );
    }

    public static String deriveDayOfWeek(LocalDate workDate) {
        if (workDate == null) {
            return null;
        }
        return workDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    public static BigDecimal calculateTotalHours(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            return null;
        }
        long startSeconds = startTime.toSecondOfDay();
        long endSeconds = endTime.toSecondOfDay();
        long diffSeconds;
        if (endSeconds > startSeconds) {
            diffSeconds = endSeconds - startSeconds;
        } else if (endSeconds < startSeconds) {
            // Overnight work period, e.g., 22:00 to 02:00 -> 4.00 hours
            diffSeconds = (86400L - startSeconds) + endSeconds;
        } else {
            // Identical start and end times represent zero duration
            diffSeconds = 0L;
        }

        return BigDecimal.valueOf(diffSeconds)
                .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
    }
}
