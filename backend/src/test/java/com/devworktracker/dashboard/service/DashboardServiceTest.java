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
import com.devworktracker.worklog.repository.WorkLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskItemRepository taskItemRepository;

    @Mock
    private WorkLogRepository workLogRepository;

    @Mock
    private CodeChangeRepository codeChangeRepository;

    @Mock
    private DbChangeRepository dbChangeRepository;

    @Mock
    private PendingTaskRepository pendingTaskRepository;

    private DashboardServiceImpl dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardServiceImpl(
                projectRepository,
                taskItemRepository,
                workLogRepository,
                codeChangeRepository,
                dbChangeRepository,
                pendingTaskRepository
        );
    }

    @Test
    @DisplayName("getSummary: Aggregates high-level metrics accurately from all repositories")
    void getSummary_Success() {
        when(projectRepository.count()).thenReturn(10L);
        when(projectRepository.countByStatus((short) 1)).thenReturn(8L);
        when(taskItemRepository.countByIsActive((short) 1)).thenReturn(45L);
        when(taskItemRepository.countByIsActiveAndStatusIn(eq((short) 1), anyCollection())).thenReturn(20L);
        when(workLogRepository.count()).thenReturn(150L);
        when(pendingTaskRepository.count()).thenReturn(12L);
        when(pendingTaskRepository.countByDueDateBeforeAndStatusNotIn(any(LocalDate.class), anyCollection())).thenReturn(3L);
        when(codeChangeRepository.countByChangeStatus("UNCOMMITTED")).thenReturn(5L);

        DashboardSummaryResponse response = dashboardService.getSummary();

        assertNotNull(response);
        assertEquals(10L, response.getTotalProjects());
        assertEquals(8L, response.getActiveProjects());
        assertEquals(45L, response.getTotalTaskItems());
        assertEquals(20L, response.getOpenTaskItems());
        assertEquals(150L, response.getTotalWorkLogs());
        assertEquals(12L, response.getTotalPendingTasks());
        assertEquals(3L, response.getOverduePendingTasks());
        assertEquals(5L, response.getUncommittedCodeChanges());
    }

    @Test
    @DisplayName("getWorkSummary: Correctly calculates total hours including overnight and null duration handling")
    @SuppressWarnings("unchecked")
    void getWorkSummary_HoursAndStatusAggregation() {
        Project project = new Project("PRJ-000001", "Core Portal", null, (short) 1, null);
        project.setProjectId(1L);

        TaskItem task = new TaskItem("TASK-000001", 1L, "FEATURE", "Feature", null, "HIGH", "IN_PROGRESS", (short) 1, null, null);
        task.setProject(project);

        // Work Log 1: 09:00 to 17:00 (8.00 hours), COMPLETED
        WorkLog w1 = new WorkLog("WL-000001", task.getTaskItemId(), LocalDate.of(2026, 11, 1), "LOCAL", "DEVELOPMENT", "Req 1",
                null, null, null, LocalTime.of(9, 0), LocalTime.of(17, 0), "COMPLETED",
                null, null, null, null, null, null);
        w1.setTaskItem(task);

        // Work Log 2: 22:00 to 02:00 overnight (4.00 hours), IN_PROGRESS
        WorkLog w2 = new WorkLog("WL-000002", task.getTaskItemId(), LocalDate.of(2026, 11, 1), "LOCAL", "BUG_FIXING", "Req 2",
                null, null, null, LocalTime.of(22, 0), LocalTime.of(2, 0), "IN_PROGRESS",
                null, null, null, null, null, null);
        w2.setTaskItem(task);

        // Work Log 3: No time recorded, BLOCKED
        WorkLog w3 = new WorkLog("WL-000003", task.getTaskItemId(), LocalDate.of(2026, 11, 2), "LOCAL", "TESTING", "Req 3",
                null, null, null, null, null, "BLOCKED",
                null, null, null, null, null, null);
        w3.setTaskItem(task);

        when(workLogRepository.findAll(any(Specification.class))).thenReturn(List.of(w1, w2, w3));

        WorkSummaryResponse response = dashboardService.getWorkSummary(
                LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 2), 1L
        );

        assertNotNull(response);
        assertEquals(3L, response.getTotalWorkLogs());
        assertEquals(new BigDecimal("12.00"), response.getTotalHours());
        assertEquals(1L, response.getCompletedWorkLogs());
        assertEquals(1L, response.getInProgressWorkLogs());
        assertEquals(1L, response.getBlockedWorkLogs());
        assertEquals(0L, response.getOnHoldWorkLogs());

        // Daily summaries should have entries for Nov 1 and Nov 2
        assertEquals(2, response.getDailySummaries().size());
        DailyWorkSummary day1 = response.getDailySummaries().get(0);
        assertEquals(LocalDate.of(2026, 11, 1), day1.getDate());
        assertEquals(new BigDecimal("12.00"), day1.getHours());
        assertEquals(2L, day1.getWorkLogsCount());

        DailyWorkSummary day2 = response.getDailySummaries().get(1);
        assertEquals(LocalDate.of(2026, 11, 2), day2.getDate());
        assertEquals(new BigDecimal("0.00"), day2.getHours());
        assertEquals(1L, day2.getWorkLogsCount());
    }

    @Test
    @DisplayName("getProjectSummary: Aggregates project-level task counts and work logs without join duplication")
    void getProjectSummary_Success() {
        Project p1 = new Project("PRJ-000001", "FlowTrack", null, (short) 1, null);
        p1.setProjectId(10L);
        Project p2 = new Project("PRJ-000002", "Legacy System", null, (short) 0, null);
        p2.setProjectId(20L);

        when(projectRepository.findAll(any(Sort.class))).thenReturn(List.of(p1, p2));

        when(taskItemRepository.countByProjectIdAndIsActive(10L, (short) 1)).thenReturn(15L);
        when(taskItemRepository.countByProjectIdAndIsActiveAndStatusIn(eq(10L), eq((short) 1), anyCollection())).thenReturn(5L);
        when(taskItemRepository.countByProjectIdAndIsActiveAndStatus(10L, (short) 1, "COMPLETED")).thenReturn(8L);
        when(workLogRepository.countByTaskItemProjectId(10L)).thenReturn(40L);

        when(taskItemRepository.countByProjectIdAndIsActive(20L, (short) 1)).thenReturn(4L);
        when(taskItemRepository.countByProjectIdAndIsActiveAndStatusIn(eq(20L), eq((short) 1), anyCollection())).thenReturn(1L);
        when(taskItemRepository.countByProjectIdAndIsActiveAndStatus(20L, (short) 1, "COMPLETED")).thenReturn(3L);
        when(workLogRepository.countByTaskItemProjectId(20L)).thenReturn(10L);

        List<ProjectSummaryResponse> list = dashboardService.getProjectSummary();

        assertEquals(2, list.size());
        ProjectSummaryResponse first = list.get(0);
        assertEquals("PRJ-000001", first.getProjectCode());
        assertEquals((short) 1, first.getProjectStatus());
        assertEquals(15L, first.getTotalTaskItems());
        assertEquals(5L, first.getOpenTaskItems());
        assertEquals(8L, first.getCompletedTaskItems());
        assertEquals(40L, first.getTotalWorkLogs());
    }

    @Test
    @DisplayName("getPendingSummary: Aggregates counts across statuses and overdue calculation")
    void getPendingSummary_Success() {
        when(pendingTaskRepository.countByStatus("PENDING")).thenReturn(5L);
        when(pendingTaskRepository.countByStatus("IN_PROGRESS")).thenReturn(3L);
        when(pendingTaskRepository.countByStatus("ON_HOLD")).thenReturn(2L);
        when(pendingTaskRepository.countByStatus("COMPLETED")).thenReturn(7L);
        when(pendingTaskRepository.countByStatus("CANCELLED")).thenReturn(1L);
        when(pendingTaskRepository.countByDueDateBeforeAndStatusNotIn(any(LocalDate.class), anyCollection())).thenReturn(2L);
        when(pendingTaskRepository.count()).thenReturn(18L);

        PendingTaskSummaryResponse summary = dashboardService.getPendingSummary();

        assertNotNull(summary);
        assertEquals(5L, summary.getPending());
        assertEquals(3L, summary.getInProgress());
        assertEquals(2L, summary.getOnHold());
        assertEquals(7L, summary.getCompleted());
        assertEquals(1L, summary.getCancelled());
        assertEquals(2L, summary.getOverdue());
        assertEquals(18L, summary.getTotal());
    }

    @Test
    @DisplayName("getRecentActivities: Aggregates across all 6 modules sorted newest first and bounded")
    void getRecentActivities_AllModulesAggregatedAndSorted() {
        Instant now = Instant.now();

        Project p = new Project("PRJ-000001", "Core Portal", null, (short) 1, null);
        p.setProjectId(1L);
        p.setUpdatedAt(now.minusSeconds(600));

        TaskItem t = new TaskItem("TASK-000001", 1L, "FEATURE", "Task Title", null, "HIGH", "IN_PROGRESS", (short) 1, null, null);
        t.setTaskItemId(2L);
        t.setProject(p);
        t.setUpdatedAt(now.minusSeconds(500));

        WorkLog w = new WorkLog("WL-000001", t.getTaskItemId(), LocalDate.now(), "LOCAL", "DEVELOPMENT", "Work log requirement",
                null, null, null, null, null, "IN_PROGRESS", null, null, null, null, null, null);
        w.setTaskItem(t);
        w.setWorkLogId(3L);
        w.setUpdatedAt(now.minusSeconds(400));

        CodeChange c = new CodeChange("CC-000001", 3L, "COMMITTED", "r100", now.minusSeconds(300), "LOCAL", null);
        c.setCodeChangeId(4L);
        c.setWorkLog(w);

        DbChange d = new DbChange("DB-000001", 3L, "LOCAL", "PostgreSQL", "Table", "app_user", "What", "Why", null, null);
        d.setDbChangeId(5L);
        d.setWorkLog(w);
        d.setUpdatedAt(now.minusSeconds(200));

        PendingTask pt = new PendingTask("PT-000001", 1L, "Pending task title", null, "HIGH", "PENDING", null, null, null);
        pt.setPendingTaskId(6L);
        pt.setProject(p);
        pt.setUpdatedAt(now.minusSeconds(100)); // Newest

        when(projectRepository.findAllBy(any(Pageable.class))).thenReturn(List.of(p));
        when(taskItemRepository.findByIsActive(eq((short) 1), any(Pageable.class))).thenReturn(List.of(t));
        when(workLogRepository.findAllBy(any(Pageable.class))).thenReturn(List.of(w));
        when(codeChangeRepository.findAllBy(any(Pageable.class))).thenReturn(List.of(c));
        when(dbChangeRepository.findAllBy(any(Pageable.class))).thenReturn(List.of(d));
        when(pendingTaskRepository.findAllBy(any(Pageable.class))).thenReturn(List.of(pt));

        List<RecentActivityResponse> activities = dashboardService.getRecentActivities(10);

        assertEquals(6, activities.size());
        // First must be PT-000001 (minus 100 seconds)
        assertEquals("PENDING_TASK", activities.get(0).getActivityType());
        assertEquals("PT-000001", activities.get(0).getRecordCode());
        assertEquals("/pending-tasks/6", activities.get(0).getNavigationTarget());

        // Last must be PRJ-000001 (minus 600 seconds)
        assertEquals("PROJECT", activities.get(5).getActivityType());
        assertEquals("PRJ-000001", activities.get(5).getRecordCode());
        assertEquals("/projects/1", activities.get(5).getNavigationTarget());
    }

    @Test
    @DisplayName("Empty database behavior: Returns clean zeros and empty collections without exceptions")
    @SuppressWarnings("unchecked")
    void emptyDatabase_ReturnsCleanDefaults() {
        when(projectRepository.count()).thenReturn(0L);
        when(projectRepository.countByStatus(anyShort())).thenReturn(0L);
        when(taskItemRepository.countByIsActive(anyShort())).thenReturn(0L);
        when(taskItemRepository.countByIsActiveAndStatusIn(anyShort(), anyCollection())).thenReturn(0L);
        when(workLogRepository.count()).thenReturn(0L);
        when(pendingTaskRepository.count()).thenReturn(0L);
        when(pendingTaskRepository.countByDueDateBeforeAndStatusNotIn(any(), anyCollection())).thenReturn(0L);
        when(codeChangeRepository.countByChangeStatus(anyString())).thenReturn(0L);

        DashboardSummaryResponse summary = dashboardService.getSummary();
        assertNotNull(summary);
        assertEquals(0L, summary.getTotalProjects());

        when(workLogRepository.findAll(any(Specification.class))).thenReturn(List.of());
        WorkSummaryResponse workSummary = dashboardService.getWorkSummary(null, null, null);
        assertNotNull(workSummary);
        assertEquals(0L, workSummary.getTotalWorkLogs());
        assertEquals(new BigDecimal("0.00"), workSummary.getTotalHours());
        assertTrue(workSummary.getDailySummaries().isEmpty());
    }
}
