package com.devworktracker.taskitem.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.repository.ProjectRepository;
import com.devworktracker.taskitem.dao.TaskItemHistoryDao;
import com.devworktracker.taskitem.dto.*;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.taskitem.mapper.TaskItemMapper;
import com.devworktracker.taskitem.repository.TaskItemRepository;
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

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskItemServiceTest {

    @Mock
    private TaskItemRepository taskItemRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskItemHistoryDao taskItemHistoryDao;

    @Spy
    private TaskItemMapper taskItemMapper = new TaskItemMapper();

    @InjectMocks
    private TaskItemServiceImpl taskItemService;

    private Project sampleActiveProject;
    private Project sampleInactiveProject;
    private TaskItem sampleTaskItem;

    @BeforeEach
    void setUp() {
        sampleActiveProject = new Project("PRJ-000001", "Active Project", "Desc", (short) 1, null);
        sampleActiveProject.setProjectId(1L);

        sampleInactiveProject = new Project("PRJ-000002", "Inactive Project", "Desc", (short) 0, null);
        sampleInactiveProject.setProjectId(2L);

        sampleTaskItem = new TaskItem(
                "TASK-000001",
                1L,
                "FEATURE_DEVELOPMENT",
                "Implement Task Module",
                "Description",
                "MEDIUM",
                "OPEN",
                (short) 1,
                null,
                "Remarks"
        );
        sampleTaskItem.setTaskItemId(10L);
        sampleTaskItem.setProject(sampleActiveProject);
        sampleTaskItem.setCreatedAt(Instant.now());
        sampleTaskItem.setUpdatedAt(Instant.now());
    }

    @Test
    @DisplayName("Should create task item with sequence-generated code TASK-000001, default priority/status and active state")
    void createTaskItem_success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleActiveProject));
        when(taskItemRepository.getNextTaskItemCodeSequence()).thenReturn(1L);
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> {
            TaskItem t = inv.getArgument(0);
            t.setTaskItemId(10L);
            return t;
        });

        CreateTaskItemRequest request = new CreateTaskItemRequest(
                1L, "FEATURE_DEVELOPMENT", "Implement Task Module", "Description", null, null, "Remarks"
        );
        TaskItemResponse response = taskItemService.createTaskItem(request);

        assertThat(response).isNotNull();
        assertThat(response.getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(response.getPriority()).isEqualTo("MEDIUM");
        assertThat(response.getStatus()).isEqualTo("OPEN");
        assertThat(response.getIsActive()).isEqualTo((short) 1);
        assertThat(response.getCompletedAt()).isNull();

        ArgumentCaptor<TaskItem> captor = ArgumentCaptor.forClass(TaskItem.class);
        verify(taskItemRepository).save(captor.capture());
        TaskItem saved = captor.getValue();
        assertThat(saved.getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(saved.getIsActive()).isEqualTo((short) 1);
    }

    @Test
    @DisplayName("Should set completed_at when task item is initially created with COMPLETED status")
    void createTaskItem_initiallyCompletedSetsCompletedAt() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleActiveProject));
        when(taskItemRepository.getNextTaskItemCodeSequence()).thenReturn(5L);
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateTaskItemRequest request = new CreateTaskItemRequest(
                1L, "BUG_FIX", "Quick Fix", "Desc", "HIGH", "COMPLETED", null
        );
        TaskItemResponse response = taskItemService.createTaskItem(request);

        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should reject task item creation when Project is inactive")
    void createTaskItem_inactiveProjectThrows() {
        when(projectRepository.findById(2L)).thenReturn(Optional.of(sampleInactiveProject));

        CreateTaskItemRequest request = new CreateTaskItemRequest(
                2L, "BUG_FIX", "Fix Issue", "Desc", "MEDIUM", "OPEN", null
        );

        assertThatThrownBy(() -> taskItemService.createTaskItem(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot create a task item for an inactive project");

        verify(taskItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject task item creation when Project does not exist")
    void createTaskItem_projectNotFoundThrows() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        CreateTaskItemRequest request = new CreateTaskItemRequest(
                999L, "BUG_FIX", "Title", null, null, null, null
        );

        assertThatThrownBy(() -> taskItemService.createTaskItem(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found with id: 999");
    }

    @Test
    @DisplayName("Should reject invalid task type")
    void createTaskItem_invalidTaskType() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleActiveProject));

        CreateTaskItemRequest request = new CreateTaskItemRequest(
                1L, "NON_EXISTENT_TYPE", "Title", null, null, null, null
        );

        assertThatThrownBy(() -> taskItemService.createTaskItem(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid task type");
    }

    @Test
    @DisplayName("Should list active task items only and exclude inactive items")
    void getTaskItems_activeOnly() {
        Page<TaskItem> page = new PageImpl<>(List.of(sampleTaskItem));
        when(taskItemRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<TaskItemResponse> result = taskItemService.getTaskItems(
                null, null, null, null, null, 0, 10, "createdAt", "desc"
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(result.getContent().get(0).getIsActive()).isEqualTo((short) 1);
    }

    @Test
    @DisplayName("Should return 404 when getting task item that does not exist or is inactive")
    void getTaskItemById_notFoundOrInactive() {
        when(taskItemRepository.findByTaskItemIdAndIsActive(999L, (short) 1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskItemService.getTaskItemById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task item not found with id: 999");
    }

    @Test
    @DisplayName("Should update task item details without modifying projectId or taskItemCode")
    void updateTaskItem_success() {
        when(taskItemRepository.findByTaskItemIdAndIsActive(10L, (short) 1)).thenReturn(Optional.of(sampleTaskItem));
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskItemRequest updateReq = new UpdateTaskItemRequest(
                "ENHANCEMENT", "Updated Title", "Updated Description", "CRITICAL", "New remarks"
        );
        TaskItemResponse response = taskItemService.updateTaskItem(10L, updateReq);

        assertThat(response.getTitle()).isEqualTo("Updated Title");
        assertThat(response.getTaskType()).isEqualTo("ENHANCEMENT");
        assertThat(response.getPriority()).isEqualTo("CRITICAL");
        assertThat(response.getProjectId()).isEqualTo(1L);
        assertThat(response.getTaskItemCode()).isEqualTo("TASK-000001");
    }

    @Test
    @DisplayName("Should update status to COMPLETED and set completed_at timestamp")
    void updateTaskStatus_toCompletedSetsTimestamp() {
        when(taskItemRepository.findByTaskItemIdAndIsActive(10L, (short) 1)).thenReturn(Optional.of(sampleTaskItem));
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskStatusRequest statusReq = new UpdateTaskStatusRequest("COMPLETED");
        TaskItemResponse response = taskItemService.updateTaskStatus(10L, statusReq);

        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should clear completed_at when status transitions away from COMPLETED")
    void updateTaskStatus_awayFromCompletedClearsTimestamp() {
        sampleTaskItem.setStatus("COMPLETED");
        sampleTaskItem.setCompletedAt(Instant.now());

        when(taskItemRepository.findByTaskItemIdAndIsActive(10L, (short) 1)).thenReturn(Optional.of(sampleTaskItem));
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskStatusRequest statusReq = new UpdateTaskStatusRequest("IN_PROGRESS");
        TaskItemResponse response = taskItemService.updateTaskStatus(10L, statusReq);

        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(response.getCompletedAt()).isNull();
    }

    @Test
    @DisplayName("Should preserve existing completed_at when status remains COMPLETED")
    void updateTaskStatus_alreadyCompletedPreservesTimestamp() {
        Instant originalCompletedAt = Instant.now().minusSeconds(3600);
        sampleTaskItem.setStatus("COMPLETED");
        sampleTaskItem.setCompletedAt(originalCompletedAt);

        when(taskItemRepository.findByTaskItemIdAndIsActive(10L, (short) 1)).thenReturn(Optional.of(sampleTaskItem));
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateTaskStatusRequest statusReq = new UpdateTaskStatusRequest("COMPLETED");
        TaskItemResponse response = taskItemService.updateTaskStatus(10L, statusReq);

        assertThat(response.getCompletedAt()).isEqualTo(originalCompletedAt);
    }

    @Test
    @DisplayName("Should deactivate task item setting is_active = 0 while preserving historical records")
    void deactivateTaskItem_success() {
        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleTaskItem));
        when(taskItemRepository.save(any(TaskItem.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskItemResponse response = taskItemService.deactivateTaskItem(10L);

        assertThat(response.getIsActive()).isEqualTo((short) 0);
        verify(taskItemRepository).save(sampleTaskItem);
    }

    @Test
    @DisplayName("Should retrieve task item history including associated work logs, code changes and db changes")
    void getTaskItemHistory_success() {
        when(taskItemRepository.findById(10L)).thenReturn(Optional.of(sampleTaskItem));

        WorkLogHistoryDto workLog = new WorkLogHistoryDto(
                100L, "WL-000001", null, "LOCAL", "DEVELOPMENT", "COMPLETED", "Requirement", "Desc", null, null, Instant.now()
        );
        CodeChangeHistoryDto codeChange = new CodeChangeHistoryDto(
                200L, "CC-000001", "COMMITTED", "r123", Instant.now(), "LOCAL", null
        );
        DbChangeHistoryDto dbChange = new DbChangeHistoryDto(
                300L, "DC-000001", "LOCAL", "PostgreSQL", "Table", "task_item", null, Instant.now()
        );
        workLog.setCodeChanges(List.of(codeChange));
        workLog.setDbChanges(List.of(dbChange));

        when(taskItemHistoryDao.getHistoryForTaskItem(10L)).thenReturn(List.of(workLog));

        TaskItemHistoryResponse history = taskItemService.getTaskItemHistory(10L);

        assertThat(history.getTaskItemId()).isEqualTo(10L);
        assertThat(history.getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(history.getWorkLogs()).hasSize(1);
        assertThat(history.getWorkLogs().get(0).getCodeChanges()).hasSize(1);
        assertThat(history.getWorkLogs().get(0).getDbChanges()).hasSize(1);
    }
}

