package com.devworktracker.taskitem.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.taskitem.dto.*;
import com.devworktracker.taskitem.service.TaskItemService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskItemController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class TaskItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskItemService taskItemService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    private TaskItemResponse sampleTaskItemResponse() {
        return new TaskItemResponse(
                10L,
                "TASK-000001",
                1L,
                "PRJ-000001",
                "Internal Portal",
                "FEATURE_DEVELOPMENT",
                "Implement Task Module",
                "Description",
                "MEDIUM",
                "OPEN",
                (short) 1,
                null,
                "Remarks",
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/task-items creates task item and returns 201")
    void testCreateTaskItem_success() throws Exception {
        CreateTaskItemRequest request = new CreateTaskItemRequest(
                1L, "FEATURE_DEVELOPMENT", "Implement Task Module", "Desc", "MEDIUM", "OPEN", null
        );
        when(taskItemService.createTaskItem(any(CreateTaskItemRequest.class))).thenReturn(sampleTaskItemResponse());

        mockMvc.perform(post("/api/v1/task-items")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskItemCode").value("TASK-000001"))
                .andExpect(jsonPath("$.data.title").value("Implement Task Module"));
    }

    @Test
    @DisplayName("POST /api/v1/task-items returns 400 when title is blank")
    void testCreateTaskItem_blankTitleReturns400() throws Exception {
        CreateTaskItemRequest request = new CreateTaskItemRequest(
                1L, "FEATURE_DEVELOPMENT", "   ", "Desc", "MEDIUM", "OPEN", null
        );

        mockMvc.perform(post("/api/v1/task-items")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].field").value("title"));
    }

    @Test
    @DisplayName("GET /api/v1/task-items returns paginated active task items")
    void testGetTaskItems_success() throws Exception {
        PageResponse<TaskItemResponse> pageResponse = new PageResponse<>(
                List.of(sampleTaskItemResponse()), 0, 10, 1L, 1, true, true
        );
        when(taskItemService.getTaskItems(any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/task-items")
                        .with(user(mockPrincipal()))
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].taskItemCode").value("TASK-000001"));
    }

    @Test
    @DisplayName("GET /api/v1/task-items/{id} returns details for active task item")
    void testGetTaskItemById_success() throws Exception {
        when(taskItemService.getTaskItemById(10L)).thenReturn(sampleTaskItemResponse());

        mockMvc.perform(get("/api/v1/task-items/10")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskItemId").value(10));
    }

    @Test
    @DisplayName("GET /api/v1/task-items/{id} returns 404 when item is missing or inactive")
    void testGetTaskItemById_notFound() throws Exception {
        when(taskItemService.getTaskItemById(999L))
                .thenThrow(new ResourceNotFoundException("Task item not found with id: 999"));

        mockMvc.perform(get("/api/v1/task-items/999")
                        .with(user(mockPrincipal())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/v1/task-items/{id} updates task item and returns 200")
    void testUpdateTaskItem_success() throws Exception {
        UpdateTaskItemRequest request = new UpdateTaskItemRequest(
                "BUG_FIX", "Updated Title", "Updated Desc", "HIGH", "Remarks"
        );
        TaskItemResponse updated = sampleTaskItemResponse();
        updated.setTitle("Updated Title");
        when(taskItemService.updateTaskItem(eq(10L), any(UpdateTaskItemRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/task-items/10")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Updated Title"));
    }

    @Test
    @DisplayName("PATCH /api/v1/task-items/{id}/status updates workflow status")
    void testUpdateTaskStatus_success() throws Exception {
        UpdateTaskStatusRequest request = new UpdateTaskStatusRequest("COMPLETED");
        TaskItemResponse updated = sampleTaskItemResponse();
        updated.setStatus("COMPLETED");
        when(taskItemService.updateTaskStatus(eq(10L), any(UpdateTaskStatusRequest.class))).thenReturn(updated);

        mockMvc.perform(patch("/api/v1/task-items/10/status")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("PATCH /api/v1/task-items/{id}/deactivate deactivates task item")
    void testDeactivateTaskItem_success() throws Exception {
        TaskItemResponse deactivated = sampleTaskItemResponse();
        deactivated.setIsActive((short) 0);
        when(taskItemService.deactivateTaskItem(10L)).thenReturn(deactivated);

        mockMvc.perform(patch("/api/v1/task-items/10/deactivate")
                        .with(user(mockPrincipal()))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isActive").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/task-items/{id}/history returns associated work logs, code and DB changes")
    void testGetTaskItemHistory_success() throws Exception {
        TaskItemHistoryResponse history = new TaskItemHistoryResponse(
                10L, "TASK-000001", "Title", 1L, "PRJ-000001", "Project", List.of()
        );
        when(taskItemService.getTaskItemHistory(10L)).thenReturn(history);

        mockMvc.perform(get("/api/v1/task-items/10/history")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskItemCode").value("TASK-000001"));
    }
}

