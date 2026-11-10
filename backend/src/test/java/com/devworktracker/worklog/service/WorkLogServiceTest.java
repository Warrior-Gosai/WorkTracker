package com.devworktracker.worklog.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.taskitem.repository.TaskItemRepository;
import com.devworktracker.worklog.dto.CreateWorkLogRequest;
import com.devworktracker.worklog.dto.UpdateWorkLogRequest;
import com.devworktracker.worklog.dto.WorkLogResponse;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.mapper.WorkLogMapper;
import com.devworktracker.worklog.repository.WorkLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkLogServiceTest {

    @Mock
    private WorkLogRepository workLogRepository;

    @Mock
    private TaskItemRepository taskItemRepository;

    @Mock
    private com.devworktracker.codechange.repository.CodeChangeRepository codeChangeRepository;

    @Mock
    private com.devworktracker.dbchange.repository.DbChangeRepository dbChangeRepository;

    @Spy
    private WorkLogMapper workLogMapper = new WorkLogMapper();

    @InjectMocks
    private WorkLogServiceImpl workLogService;

    private Project sampleProject;
    private TaskItem sampleActiveTask;
    private TaskItem sampleInactiveTask;
    private WorkLog sampleWorkLog;

    @BeforeEach
    void setUp() {
        sampleProject = new Project("PRJ-000001", "FlowTrack", "Workflow Management", (short) 1, null);
        sampleProject.setProjectId(1L);

        sampleActiveTask = new TaskItem("TASK-000001", 1L, "FEATURE", "Auth Module", "Desc", "HIGH", "OPEN", (short) 1, null, null);
        sampleActiveTask.setTaskItemId(10L);
        sampleActiveTask.setProject(sampleProject);

        sampleInactiveTask = new TaskItem("TASK-000002", 1L, "BUG", "Old Bug", "Desc", "LOW", "COMPLETED", (short) 0, null, null);
        sampleInactiveTask.setTaskItemId(20L);
        sampleInactiveTask.setProject(sampleProject);

        sampleWorkLog = new WorkLog(
                "WL-000001",
                10L,
                LocalDate.of(2026, 11, 9),
                "LOCAL",
                "DEVELOPMENT",
                "Implement JWT Auth",
                "Detailed description",
                "Purpose",
                "Spring Security",
                LocalTime.of(9, 0),
                LocalTime.of(18, 0),
                "COMPLETED",
                null,
                "Configured filter chain",
                "Unit tests passed",
                "JWT working",
                "Next: Refresh tokens",
                "Remarks"
        );
        sampleWorkLog.setWorkLogId(100L);
        sampleWorkLog.setTaskItem(sampleActiveTask);
    }

    @Test
    @DisplayName("Create work log: Success with sequence code WL-%06d, defaults, and total hours")
    void createWorkLog_Success() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkDate(LocalDate.of(2026, 11, 9));
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Implement JWT Auth");
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(18, 0));

        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleActiveTask));
        when(workLogRepository.getNextWorkLogCodeSequence()).thenReturn(1L);
        when(workLogRepository.save(any(WorkLog.class))).thenAnswer(invocation -> {
            WorkLog log = invocation.getArgument(0);
            log.setWorkLogId(100L);
            return log;
        });

        WorkLogResponse response = workLogService.createWorkLog(request);

        assertThat(response).isNotNull();
        assertThat(response.getWorkLogId()).isEqualTo(100L);
        assertThat(response.getWorkLogCode()).isEqualTo("WL-000001");
        assertThat(response.getTaskItemId()).isEqualTo(10L);
        assertThat(response.getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(response.getProjectId()).isEqualTo(1L);
        assertThat(response.getProjectCode()).isEqualTo("PRJ-000001");
        assertThat(response.getEnvironment()).isEqualTo("LOCAL");
        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(response.getTotalHours()).isEqualByComparingTo("9.00");
        assertThat(response.getDay()).isEqualTo("Monday");

        ArgumentCaptor<WorkLog> captor = ArgumentCaptor.forClass(WorkLog.class);
        verify(workLogRepository).save(captor.capture());
        WorkLog saved = captor.getValue();
        assertThat(saved.getWorkLogCode()).isEqualTo("WL-000001");
        assertThat(saved.getTaskRequirement()).isEqualTo("Implement JWT Auth");
    }

    @Test
    @DisplayName("Create work log: Rejects when task item does not exist")
    void createWorkLog_TaskNotFound_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(999L);
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Requirement");

        when(taskItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task item not found with id: 999");
    }

    @Test
    @DisplayName("Create work log: Rejects when task item is inactive")
    void createWorkLog_InactiveTask_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(20L);
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Requirement");

        when(taskItemRepository.findById(20L)).thenReturn(Optional.of(sampleInactiveTask));

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot create a work log for an inactive task item");
    }

    @Test
    @DisplayName("Create work log: Rejects invalid work type")
    void createWorkLog_InvalidWorkType_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkType("INVALID_TYPE");
        request.setTaskRequirement("Requirement");

        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleActiveTask));

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid work type: 'INVALID_TYPE'");
    }

    @Test
    @DisplayName("Create work log: Rejects invalid environment")
    void createWorkLog_InvalidEnvironment_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkType("DEVELOPMENT");
        request.setEnvironment("STAGING");
        request.setTaskRequirement("Requirement");

        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleActiveTask));

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid environment: 'STAGING'");
    }

    @Test
    @DisplayName("Create work log: Rejects invalid status")
    void createWorkLog_InvalidStatus_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkType("DEVELOPMENT");
        request.setStatus("DONE");
        request.setTaskRequirement("Requirement");

        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleActiveTask));

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status: 'DONE'");
    }

    @Test
    @DisplayName("Time pair validation: Rejects only start time populated")
    void createWorkLog_OnlyStartTime_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Requirement");
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(null);

        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleActiveTask));

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Start time and end time must either both be provided or both be empty");
    }

    @Test
    @DisplayName("Time pair validation: Rejects only end time populated")
    void createWorkLog_OnlyEndTime_ThrowsException() {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Requirement");
        request.setStartTime(null);
        request.setEndTime(LocalTime.of(17, 0));

        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleActiveTask));

        assertThatThrownBy(() -> workLogService.createWorkLog(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Start time and end time must either both be provided or both be empty");
    }

    @Test
    @DisplayName("Duration calculations: Overnight, identical, and null times")
    void durationCalculations_AllScenarios() {
        // 1. Overnight: 22:00 to 02:00 -> 4.00 hours
        BigDecimal overnight = WorkLogMapper.calculateTotalHours(LocalTime.of(22, 0), LocalTime.of(2, 0));
        assertThat(overnight).isEqualByComparingTo("4.00");

        // 2. Identical: 10:00 to 10:00 -> 0.00 hours
        BigDecimal identical = WorkLogMapper.calculateTotalHours(LocalTime.of(10, 0), LocalTime.of(10, 0));
        assertThat(identical).isEqualByComparingTo("0.00");

        // 3. Normal: 09:30 to 11:15 -> 1.75 hours
        BigDecimal normal = WorkLogMapper.calculateTotalHours(LocalTime.of(9, 30), LocalTime.of(11, 15));
        assertThat(normal).isEqualByComparingTo("1.75");

        // 4. Null times -> null
        BigDecimal bothNull = WorkLogMapper.calculateTotalHours(null, null);
        assertThat(bothNull).isNull();
    }

    @Test
    @DisplayName("Get work logs: Paginated and filtered results returned successfully")
    void getWorkLogs_Success() {
        Page<WorkLog> paged = new PageImpl<>(List.of(sampleWorkLog), PageRequest.of(0, 10), 1);
        when(workLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(paged);

        PageResponse<WorkLogResponse> response = workLogService.getWorkLogs(
                "JWT", 10L, 1L, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 30),
                "LOCAL", "DEVELOPMENT", "COMPLETED", 0, 10, "workDate", "desc"
        );

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().get(0).getWorkLogCode()).isEqualTo("WL-000001");
    }

    @Test
    @DisplayName("Get work log by ID: Success and Not Found")
    void getWorkLogById_Scenarios() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(workLogRepository.findById(999L)).thenReturn(Optional.empty());

        WorkLogResponse found = workLogService.getWorkLogById(100L);
        assertThat(found).isNotNull();
        assertThat(found.getWorkLogCode()).isEqualTo("WL-000001");

        assertThatThrownBy(() -> workLogService.getWorkLogById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Work log not found with id: 999");
    }

    @Test
    @DisplayName("Update work log: Success and allows editing even if associated task item is inactive")
    void updateWorkLog_Success_EvenIfTaskInactive() {
        // Work log associated with an inactive task
        sampleWorkLog.setTaskItem(sampleInactiveTask);
        sampleWorkLog.setTaskItemId(sampleInactiveTask.getTaskItemId());

        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(workLogRepository.save(any(WorkLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateWorkLogRequest updateRequest = new UpdateWorkLogRequest();
        updateRequest.setWorkDate(LocalDate.of(2026, 11, 10));
        updateRequest.setEnvironment("UAT");
        updateRequest.setWorkType("BUG_FIXING");
        updateRequest.setTaskRequirement("Updated Requirement");
        updateRequest.setWorkDescription("Updated Desc");
        updateRequest.setStatus("ON_HOLD");
        updateRequest.setStartTime(LocalTime.of(10, 0));
        updateRequest.setEndTime(LocalTime.of(12, 0));

        WorkLogResponse updated = workLogService.updateWorkLog(100L, updateRequest);

        assertThat(updated).isNotNull();
        assertThat(updated.getWorkDate()).isEqualTo(LocalDate.of(2026, 11, 10));
        assertThat(updated.getEnvironment()).isEqualTo("UAT");
        assertThat(updated.getWorkType()).isEqualTo("BUG_FIXING");
        assertThat(updated.getStatus()).isEqualTo("ON_HOLD");
        assertThat(updated.getTaskRequirement()).isEqualTo("Updated Requirement");
        assertThat(updated.getTotalHours()).isEqualByComparingTo("2.00");
        assertThat(updated.getDay()).isEqualTo("Tuesday");
        // Task Item association preserved
        assertThat(updated.getTaskItemId()).isEqualTo(20L);
    }
}

