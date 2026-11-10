package com.devworktracker.dashboard.service;

import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.repository.CodeChangeRepository;
import com.devworktracker.dashboard.dto.*;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.dbchange.repository.DbChangeRepository;
import com.devworktracker.pendingtask.entity.PendingTask;
import com.devworktracker.pendingtask.repository.PendingTaskRepository;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.repository.ProjectRepository;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.taskitem.repository.TaskItemRepository;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.mapper.WorkLogMapper;
import com.devworktracker.worklog.repository.WorkLogRepository;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private static final List<String> OPEN_TASK_STATUSES = List.of("OPEN", "IN_PROGRESS", "ON_HOLD");
    private static final List<String> TERMINAL_PENDING_STATUSES = List.of("COMPLETED", "CANCELLED");

    private final ProjectRepository projectRepository;
    private final TaskItemRepository taskItemRepository;
    private final WorkLogRepository workLogRepository;
    private final CodeChangeRepository codeChangeRepository;
    private final DbChangeRepository dbChangeRepository;
    private final PendingTaskRepository pendingTaskRepository;

    public DashboardServiceImpl(
            ProjectRepository projectRepository,
            TaskItemRepository taskItemRepository,
            WorkLogRepository workLogRepository,
            CodeChangeRepository codeChangeRepository,
            DbChangeRepository dbChangeRepository,
            PendingTaskRepository pendingTaskRepository) {
        this.projectRepository = projectRepository;
        this.taskItemRepository = taskItemRepository;
        this.workLogRepository = workLogRepository;
        this.codeChangeRepository = codeChangeRepository;
        this.dbChangeRepository = dbChangeRepository;
        this.pendingTaskRepository = pendingTaskRepository;
    }

    @Override
    public DashboardSummaryResponse getSummary() {
        log.info("Calculating dashboard overall summary metrics");

        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus((short) 1);
        long totalTaskItems = taskItemRepository.countByIsActive((short) 1);
        long openTaskItems = taskItemRepository.countByIsActiveAndStatusIn((short) 1, OPEN_TASK_STATUSES);
        long totalWorkLogs = workLogRepository.count();
        long totalPendingTasks = pendingTaskRepository.count();
        long overduePendingTasks = pendingTaskRepository.countByDueDateBeforeAndStatusNotIn(
                LocalDate.now(), TERMINAL_PENDING_STATUSES
        );
        long uncommittedCodeChanges = codeChangeRepository.countByChangeStatus("UNCOMMITTED");

        return new DashboardSummaryResponse(
                totalProjects,
                activeProjects,
                totalTaskItems,
                openTaskItems,
                totalWorkLogs,
                totalPendingTasks,
                overduePendingTasks,
                uncommittedCodeChanges
        );
    }

    @Override
    public WorkSummaryResponse getWorkSummary(LocalDate dateFrom, LocalDate dateTo, Long projectId) {
        log.info("Calculating work summary with filters dateFrom={}, dateTo={}, projectId={}", dateFrom, dateTo, projectId);

        Specification<WorkLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("workDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("workDate"), dateTo));
            }
            if (projectId != null) {
                predicates.add(cb.equal(root.join("taskItem").get("projectId"), projectId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<WorkLog> workLogs = workLogRepository.findAll(spec);

        long completed = 0;
        long inProgress = 0;
        long blocked = 0;
        long onHold = 0;
        BigDecimal totalHours = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        Map<LocalDate, BigDecimal> dailyHours = new TreeMap<>();
        Map<LocalDate, Long> dailyCounts = new HashMap<>();

        for (WorkLog wl : workLogs) {
            String status = wl.getStatus();
            if ("COMPLETED".equalsIgnoreCase(status)) {
                completed++;
            } else if ("IN_PROGRESS".equalsIgnoreCase(status)) {
                inProgress++;
            } else if ("BLOCKED".equalsIgnoreCase(status)) {
                blocked++;
            } else if ("ON_HOLD".equalsIgnoreCase(status)) {
                onHold++;
            }

            // Duration calculation
            if (wl.getStartTime() != null && wl.getEndTime() != null) {
                BigDecimal hours = WorkLogMapper.calculateTotalHours(wl.getStartTime(), wl.getEndTime());
                if (hours != null) {
                    totalHours = totalHours.add(hours);
                    dailyHours.merge(wl.getWorkDate(), hours, BigDecimal::add);
                }
            }
            dailyCounts.merge(wl.getWorkDate(), 1L, Long::sum);
        }

        List<DailyWorkSummary> dailySummaries = new ArrayList<>();
        for (Map.Entry<LocalDate, Long> entry : dailyCounts.entrySet()) {
            LocalDate date = entry.getKey();
            BigDecimal dayHours = dailyHours.getOrDefault(date, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            dailySummaries.add(new DailyWorkSummary(date, dayHours, entry.getValue()));
        }
        dailySummaries.sort(Comparator.comparing(DailyWorkSummary::getDate));

        return new WorkSummaryResponse(
                (long) workLogs.size(),
                totalHours,
                completed,
                inProgress,
                blocked,
                onHold,
                dailySummaries
        );
    }

    @Override
    public List<ProjectSummaryResponse> getProjectSummary() {
        log.info("Calculating project summaries");

        List<Project> projects = projectRepository.findAll(
                Sort.by(Sort.Direction.DESC, "status").and(Sort.by(Sort.Direction.ASC, "projectCode"))
        );

        List<ProjectSummaryResponse> result = new ArrayList<>(projects.size());
        for (Project project : projects) {
            Long pId = project.getProjectId();
            long totalTasks = taskItemRepository.countByProjectIdAndIsActive(pId, (short) 1);
            long openTasks = taskItemRepository.countByProjectIdAndIsActiveAndStatusIn(pId, (short) 1, OPEN_TASK_STATUSES);
            long completedTasks = taskItemRepository.countByProjectIdAndIsActiveAndStatus(pId, (short) 1, "COMPLETED");
            long workLogsCount = workLogRepository.countByTaskItemProjectId(pId);

            result.add(new ProjectSummaryResponse(
                    pId,
                    project.getProjectCode(),
                    project.getProjectName(),
                    project.getStatus(),
                    totalTasks,
                    openTasks,
                    completedTasks,
                    workLogsCount
            ));
        }

        return result;
    }

    @Override
    public PendingTaskSummaryResponse getPendingSummary() {
        log.info("Calculating pending task status summary");

        long pending = pendingTaskRepository.countByStatus("PENDING");
        long inProgress = pendingTaskRepository.countByStatus("IN_PROGRESS");
        long onHold = pendingTaskRepository.countByStatus("ON_HOLD");
        long completed = pendingTaskRepository.countByStatus("COMPLETED");
        long cancelled = pendingTaskRepository.countByStatus("CANCELLED");
        long overdue = pendingTaskRepository.countByDueDateBeforeAndStatusNotIn(
                LocalDate.now(), TERMINAL_PENDING_STATUSES
        );
        long total = pendingTaskRepository.count();

        return new PendingTaskSummaryResponse(
                pending, inProgress, onHold, completed, cancelled, overdue, total
        );
    }

    @Override
    public List<RecentActivityResponse> getRecentActivities(int limit) {
        if (limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "updatedAt"));
        List<RecentActivityResponse> combined = new ArrayList<>();

        // 1. Projects
        List<Project> projects = projectRepository.findAllBy(pageRequest);
        for (Project p : projects) {
            Instant date = p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt();
            combined.add(new RecentActivityResponse(
                    "PROJECT",
                    p.getProjectId(),
                    p.getProjectCode(),
                    p.getProjectName(),
                    p.getProjectName(),
                    date,
                    "/projects/" + p.getProjectId()
            ));
        }

        // 2. Task Items
        List<TaskItem> tasks = taskItemRepository.findByIsActive((short) 1, pageRequest);
        for (TaskItem t : tasks) {
            Instant date = t.getUpdatedAt() != null ? t.getUpdatedAt() : t.getCreatedAt();
            String prjName = t.getProject() != null ? t.getProject().getProjectName() : null;
            combined.add(new RecentActivityResponse(
                    "TASK_ITEM",
                    t.getTaskItemId(),
                    t.getTaskItemCode(),
                    t.getTitle(),
                    prjName,
                    date,
                    "/task-items/" + t.getTaskItemId()
            ));
        }

        // 3. Work Logs
        List<WorkLog> workLogs = workLogRepository.findAllBy(pageRequest);
        for (WorkLog w : workLogs) {
            Instant date = w.getUpdatedAt() != null ? w.getUpdatedAt() : w.getCreatedAt();
            String prjName = (w.getTaskItem() != null && w.getTaskItem().getProject() != null)
                    ? w.getTaskItem().getProject().getProjectName() : null;
            combined.add(new RecentActivityResponse(
                    "WORK_LOG",
                    w.getWorkLogId(),
                    w.getWorkLogCode(),
                    w.getTaskRequirement(),
                    prjName,
                    date,
                    "/work-logs/" + w.getWorkLogId()
            ));
        }

        // 4. Code Changes
        List<CodeChange> codeChanges = codeChangeRepository.findAllBy(pageRequest);
        for (CodeChange c : codeChanges) {
            Instant date = c.getChangeDatetime() != null ? c.getChangeDatetime() :
                    (c.getUpdatedAt() != null ? c.getUpdatedAt() : c.getCreatedAt());
            String prjName = (c.getWorkLog() != null && c.getWorkLog().getTaskItem() != null
                    && c.getWorkLog().getTaskItem().getProject() != null)
                    ? c.getWorkLog().getTaskItem().getProject().getProjectName() : null;
            String title = c.getChangeStatus() + (c.getSvnCommitId() != null ? " (" + c.getSvnCommitId() + ")" : "");
            combined.add(new RecentActivityResponse(
                    "CODE_CHANGE",
                    c.getCodeChangeId(),
                    c.getCodeChangeCode(),
                    title,
                    prjName,
                    date,
                    "/code-changes/" + c.getCodeChangeId()
            ));
        }

        // 5. DB Changes
        List<DbChange> dbChanges = dbChangeRepository.findAllBy(pageRequest);
        for (DbChange d : dbChanges) {
            Instant date = d.getUpdatedAt() != null ? d.getUpdatedAt() : d.getCreatedAt();
            String prjName = (d.getWorkLog() != null && d.getWorkLog().getTaskItem() != null
                    && d.getWorkLog().getTaskItem().getProject() != null)
                    ? d.getWorkLog().getTaskItem().getProject().getProjectName() : null;
            String title = d.getDatabaseName() + " " + d.getObjectType() + ": " + d.getObjectName();
            combined.add(new RecentActivityResponse(
                    "DB_CHANGE",
                    d.getDbChangeId(),
                    d.getDbChangeCode(),
                    title,
                    prjName,
                    date,
                    "/db-changes/" + d.getDbChangeId()
            ));
        }

        // 6. Pending Tasks
        List<PendingTask> pendingTasks = pendingTaskRepository.findAllBy(pageRequest);
        for (PendingTask pt : pendingTasks) {
            Instant date = pt.getUpdatedAt() != null ? pt.getUpdatedAt() : pt.getCreatedAt();
            String prjName = pt.getProject() != null ? pt.getProject().getProjectName() : null;
            combined.add(new RecentActivityResponse(
                    "PENDING_TASK",
                    pt.getPendingTaskId(),
                    pt.getPendingTaskCode(),
                    pt.getTitle(),
                    prjName,
                    date,
                    "/pending-tasks/" + pt.getPendingTaskId()
            ));
        }

        // Sort newest first
        combined.sort((a, b) -> {
            if (a.getActivityDate() == null && b.getActivityDate() == null) return 0;
            if (a.getActivityDate() == null) return 1;
            if (b.getActivityDate() == null) return -1;
            return b.getActivityDate().compareTo(a.getActivityDate());
        });

        // Bounded result
        return combined.subList(0, Math.min(limit, combined.size()));
    }
}
