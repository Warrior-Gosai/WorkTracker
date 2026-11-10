package com.devworktracker.pendingtask.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.pendingtask.dto.CreatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.PendingTaskResponse;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskStatusRequest;
import com.devworktracker.pendingtask.entity.PendingTask;
import com.devworktracker.pendingtask.mapper.PendingTaskMapper;
import com.devworktracker.pendingtask.repository.PendingTaskRepository;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PendingTaskServiceTest {

    @Mock
    private PendingTaskRepository pendingTaskRepository;

    @Mock
    private ProjectRepository projectRepository;

    private PendingTaskMapper pendingTaskMapper;
    private PendingTaskServiceImpl pendingTaskService;

    private Project activeProject;
    private Project inactiveProject;

    @BeforeEach
    void setUp() {
        pendingTaskMapper = new PendingTaskMapper();
        pendingTaskService = new PendingTaskServiceImpl(pendingTaskRepository, projectRepository, pendingTaskMapper);

        activeProject = new Project("PRJ-000001", "Active FlowTrack", "Active desc", (short) 1, null);
        activeProject.setProjectId(10L);

        inactiveProject = new Project("PRJ-000002", "Legacy System", "Legacy desc", (short) 0, null);
        inactiveProject.setProjectId(20L);
    }

    @Test
    @DisplayName("Should successfully create pending task with sequence PT-000001 and default status/priority")
    void createPendingTask_Success_WithDefaults() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(activeProject));
        when(pendingTaskRepository.getNextPendingTaskCodeSequence()).thenReturn(1L);

        CreatePendingTaskRequest request = new CreatePendingTaskRequest();
        request.setProjectId(10L);
        request.setTitle("Review security scan alerts");
        request.setDescription("Verify false positives in SonarQube");
        request.setDueDate(LocalDate.now().plusDays(3));

        when(pendingTaskRepository.save(any(PendingTask.class))).thenAnswer(invocation -> {
            PendingTask pt = invocation.getArgument(0);
            pt.setPendingTaskId(100L);
            return pt;
        });

        PendingTaskResponse response = pendingTaskService.createPendingTask(request);

        assertNotNull(response);
        assertEquals("PT-000001", response.getPendingTaskCode());
        assertEquals("Review security scan alerts", response.getTitle());
        assertEquals("MEDIUM", response.getPriority());
        assertEquals("PENDING", response.getStatus());
        assertEquals(10L, response.getProjectId());
        assertEquals("PRJ-000001", response.getProjectCode());
        assertEquals("Active FlowTrack", response.getProjectName());
        assertNull(response.getCompletedAt());
        assertFalse(response.getOverdue());

        ArgumentCaptor<PendingTask> captor = ArgumentCaptor.forClass(PendingTask.class);
        verify(pendingTaskRepository).save(captor.capture());
        assertEquals("PT-000001", captor.getValue().getPendingTaskCode());
        assertEquals("MEDIUM", captor.getValue().getPriority());
        assertEquals("PENDING", captor.getValue().getStatus());
    }

    @Test
    @DisplayName("Should reject pending task creation when project is inactive")
    void createPendingTask_InactiveProject_ThrowsBadRequest() {
        when(projectRepository.findById(20L)).thenReturn(Optional.of(inactiveProject));

        CreatePendingTaskRequest request = new CreatePendingTaskRequest();
        request.setProjectId(20L);
        request.setTitle("Follow-up on legacy bug");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                pendingTaskService.createPendingTask(request));
        assertTrue(ex.getMessage().contains("Cannot create a pending task for an inactive project"));
        verify(pendingTaskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject pending task creation when project does not exist")
    void createPendingTask_ProjectNotFound_ThrowsResourceNotFound() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        CreatePendingTaskRequest request = new CreatePendingTaskRequest();
        request.setProjectId(999L);
        request.setTitle("Task for non-existent project");

        assertThrows(ResourceNotFoundException.class, () ->
                pendingTaskService.createPendingTask(request));
        verify(pendingTaskRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should set completedAt when creating a task with COMPLETED status")
    void createPendingTask_WithCompletedStatus_SetsCompletedAt() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(activeProject));
        when(pendingTaskRepository.getNextPendingTaskCodeSequence()).thenReturn(5L);

        CreatePendingTaskRequest request = new CreatePendingTaskRequest();
        request.setProjectId(10L);
        request.setTitle("Already finished checklist item");
        request.setStatus("COMPLETED");

        when(pendingTaskRepository.save(any(PendingTask.class))).thenAnswer(invocation -> {
            PendingTask pt = invocation.getArgument(0);
            pt.setPendingTaskId(105L);
            return pt;
        });

        PendingTaskResponse response = pendingTaskService.createPendingTask(request);

        assertNotNull(response.getCompletedAt());
        assertEquals("COMPLETED", response.getStatus());
        assertFalse(response.getOverdue());
    }

    @Test
    @DisplayName("Should allow retrieving and editing existing pending task even if project has become inactive")
    void existingTask_InactiveProject_RemainsAccessibleAndEditable() {
        PendingTask existingTask = new PendingTask(
                "PT-000010", 20L, "Historical legacy reminder", "Description",
                "HIGH", "IN_PROGRESS", LocalDate.now().plusDays(5), null, "Old notes"
        );
        existingTask.setPendingTaskId(50L);
        existingTask.setProject(inactiveProject);

        when(pendingTaskRepository.findByPendingTaskId(50L)).thenReturn(Optional.of(existingTask));

        // 1. Verify accessible
        PendingTaskResponse detail = pendingTaskService.getPendingTaskById(50L);
        assertNotNull(detail);
        assertEquals("PT-000010", detail.getPendingTaskCode());
        assertEquals(20L, detail.getProjectId());
        assertEquals("PRJ-000002", detail.getProjectCode());

        // 2. Verify editable
        UpdatePendingTaskRequest updateRequest = new UpdatePendingTaskRequest(
                "Updated title for inactive project task",
                "New description",
                "CRITICAL",
                "IN_PROGRESS",
                LocalDate.now().plusDays(10),
                "Updated notes"
        );

        when(pendingTaskRepository.save(any(PendingTask.class))).thenAnswer(inv -> inv.getArgument(0));

        PendingTaskResponse updated = pendingTaskService.updatePendingTask(50L, updateRequest);
        assertEquals("Updated title for inactive project task", updated.getTitle());
        assertEquals("CRITICAL", updated.getPriority());
        assertEquals(20L, updated.getProjectId(), "Project ID must be preserved");
    }

    @Test
    @DisplayName("Completion timestamp rules: set on transition to COMPLETED, preserve if already COMPLETED, clear when leaving COMPLETED")
    void completionTimestampRules_Verified() {
        PendingTask task = new PendingTask(
                "PT-000002", 10L, "Deploy schema update", "Desc",
                "HIGH", "PENDING", LocalDate.now().minusDays(1), null, null
        );
        task.setPendingTaskId(2L);
        task.setProject(activeProject);

        when(pendingTaskRepository.findByPendingTaskId(2L)).thenReturn(Optional.of(task));
        when(pendingTaskRepository.save(any(PendingTask.class))).thenAnswer(inv -> inv.getArgument(0));

        // Step 1: Transition to COMPLETED -> completedAt is set
        UpdatePendingTaskStatusRequest completeReq = new UpdatePendingTaskStatusRequest("COMPLETED");
        PendingTaskResponse res1 = pendingTaskService.updatePendingTaskStatus(2L, completeReq);
        assertNotNull(res1.getCompletedAt());
        Instant firstCompletedAt = res1.getCompletedAt();

        // Step 2: Keep status COMPLETED -> existing completedAt is preserved
        UpdatePendingTaskStatusRequest keepReq = new UpdatePendingTaskStatusRequest("COMPLETED");
        PendingTaskResponse res2 = pendingTaskService.updatePendingTaskStatus(2L, keepReq);
        assertEquals(firstCompletedAt, res2.getCompletedAt());

        // Step 3: Transition away to IN_PROGRESS -> completedAt is cleared
        UpdatePendingTaskStatusRequest inProgReq = new UpdatePendingTaskStatusRequest("IN_PROGRESS");
        PendingTaskResponse res3 = pendingTaskService.updatePendingTaskStatus(2L, inProgReq);
        assertNull(res3.getCompletedAt());
        assertEquals("IN_PROGRESS", res3.getStatus());
    }

    @Test
    @DisplayName("Overdue calculation: yesterday is overdue, today is not, future is not, null date is not, completed/cancelled is not")
    void overdueCalculation_RulesVerified() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Case 1: Yesterday + PENDING -> overdue true
        PendingTask t1 = new PendingTask("PT-000001", 10L, "T1", null, "MEDIUM", "PENDING", yesterday, null, null);
        t1.setProject(activeProject);
        assertTrue(pendingTaskMapper.toResponse(t1).getOverdue());

        // Case 2: Today + PENDING -> overdue false (due today is NOT overdue)
        PendingTask t2 = new PendingTask("PT-000002", 10L, "T2", null, "MEDIUM", "PENDING", today, null, null);
        t2.setProject(activeProject);
        assertFalse(pendingTaskMapper.toResponse(t2).getOverdue());

        // Case 3: Tomorrow + PENDING -> overdue false
        PendingTask t3 = new PendingTask("PT-000003", 10L, "T3", null, "MEDIUM", "PENDING", tomorrow, null, null);
        t3.setProject(activeProject);
        assertFalse(pendingTaskMapper.toResponse(t3).getOverdue());

        // Case 4: No due date + PENDING -> overdue false
        PendingTask t4 = new PendingTask("PT-000004", 10L, "T4", null, "MEDIUM", "PENDING", null, null, null);
        t4.setProject(activeProject);
        assertFalse(pendingTaskMapper.toResponse(t4).getOverdue());

        // Case 5: Yesterday + COMPLETED -> overdue false
        PendingTask t5 = new PendingTask("PT-000005", 10L, "T5", null, "MEDIUM", "COMPLETED", yesterday, Instant.now(), null);
        t5.setProject(activeProject);
        assertFalse(pendingTaskMapper.toResponse(t5).getOverdue());

        // Case 6: Yesterday + CANCELLED -> overdue false
        PendingTask t6 = new PendingTask("PT-000006", 10L, "T6", null, "MEDIUM", "CANCELLED", yesterday, null, null);
        t6.setProject(activeProject);
        assertFalse(pendingTaskMapper.toResponse(t6).getOverdue());
    }

    @Test
    @DisplayName("Pagination & list: returns PageResponse with mapped overdue and project info")
    @SuppressWarnings("unchecked")
    void getPendingTasks_PaginatedList_Success() {
        PendingTask t1 = new PendingTask("PT-000001", 10L, "T1", null, "HIGH", "PENDING", LocalDate.now().minusDays(2), null, null);
        t1.setPendingTaskId(1L);
        t1.setProject(activeProject);

        Page<PendingTask> page = new PageImpl<>(List.of(t1));
        when(pendingTaskRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<PendingTaskResponse> result = pendingTaskService.getPendingTasks(
                "T1", 10L, "HIGH", null, null, null, true, 0, 10, "dueDate", "asc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        PendingTaskResponse first = result.getContent().get(0);
        assertEquals("PT-000001", first.getPendingTaskCode());
        assertTrue(first.getOverdue());
        assertEquals("PRJ-000001", first.getProjectCode());
    }

    @Test
    @DisplayName("Invalid priority or status throws BadRequestException")
    void validationErrors_ThrowsBadRequestException() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(activeProject));

        CreatePendingTaskRequest badPriority = new CreatePendingTaskRequest(
                10L, "Valid Title", null, "SUPER_URGENT", "PENDING", null, null
        );
        assertThrows(BadRequestException.class, () -> pendingTaskService.createPendingTask(badPriority));

        CreatePendingTaskRequest badStatus = new CreatePendingTaskRequest(
                10L, "Valid Title", null, "HIGH", "WAITING", null, null
        );
        assertThrows(BadRequestException.class, () -> pendingTaskService.createPendingTask(badStatus));
    }
}

