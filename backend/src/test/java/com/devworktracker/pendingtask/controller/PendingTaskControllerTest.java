package com.devworktracker.pendingtask.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.pendingtask.dto.CreatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.PendingTaskResponse;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskStatusRequest;
import com.devworktracker.pendingtask.service.PendingTaskService;
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
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PendingTaskController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class PendingTaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PendingTaskService pendingTaskService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    private PendingTaskResponse sampleResponse() {
        PendingTaskResponse res = new PendingTaskResponse();
        res.setPendingTaskId(1L);
        res.setPendingTaskCode("PT-000001");
        res.setProjectId(10L);
        res.setProjectCode("PRJ-000001");
        res.setProjectName("Core Platform");
        res.setTitle("Database index tuning");
        res.setDescription("Check query execution plan for work_log");
        res.setPriority("HIGH");
        res.setStatus("PENDING");
        res.setDueDate(LocalDate.now().plusDays(2));
        res.setCompletedAt(null);
        res.setRemarks("Check pg_stat_statements");
        res.setOverdue(false);
        res.setCreatedAt(Instant.now());
        res.setUpdatedAt(Instant.now());
        return res;
    }

    @Test
    @DisplayName("POST /api/v1/pending-tasks: Success returns 201 Created")
    void createPendingTask_Success() throws Exception {
        CreatePendingTaskRequest request = new CreatePendingTaskRequest(
                10L, "Database index tuning", "Check query execution plan",
                "HIGH", "PENDING", LocalDate.now().plusDays(2), "Remarks"
        );

        when(pendingTaskService.createPendingTask(any(CreatePendingTaskRequest.class)))
                .thenReturn(sampleResponse());

        mockMvc.perform(post("/api/v1/pending-tasks")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Pending task created successfully"))
                .andExpect(jsonPath("$.data.pendingTaskCode").value("PT-000001"))
                .andExpect(jsonPath("$.data.projectCode").value("PRJ-000001"));
    }

    @Test
    @DisplayName("POST /api/v1/pending-tasks: Validation failure returns 400 Bad Request")
    void createPendingTask_ValidationFailure() throws Exception {
        CreatePendingTaskRequest invalidRequest = new CreatePendingTaskRequest(
                null, "", null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/pending-tasks")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/pending-tasks: Returns 200 OK with paginated list")
    void getPendingTasks_Success() throws Exception {
        PageResponse<PendingTaskResponse> pageResponse = new PageResponse<>(
                List.of(sampleResponse()), 0, 10, 1L, 1, true, true
        );

        when(pendingTaskService.getPendingTasks(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/pending-tasks")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].pendingTaskCode").value("PT-000001"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/pending-tasks/{id}: Returns 200 OK")
    void getPendingTaskById_Success() throws Exception {
        when(pendingTaskService.getPendingTaskById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/v1/pending-tasks/1")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pendingTaskId").value(1))
                .andExpect(jsonPath("$.data.pendingTaskCode").value("PT-000001"));
    }

    @Test
    @DisplayName("GET /api/v1/pending-tasks/{id}: Not found returns 404")
    void getPendingTaskById_NotFound() throws Exception {
        when(pendingTaskService.getPendingTaskById(999L))
                .thenThrow(new ResourceNotFoundException("Pending task not found with id: 999"));

        mockMvc.perform(get("/api/v1/pending-tasks/999")
                        .with(user(mockPrincipal())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/v1/pending-tasks/{id}: Returns 200 OK")
    void updatePendingTask_Success() throws Exception {
        UpdatePendingTaskRequest updateRequest = new UpdatePendingTaskRequest(
                "Updated title", "Updated desc", "CRITICAL", "IN_PROGRESS", LocalDate.now().plusDays(5), "Updated remarks"
        );

        PendingTaskResponse updatedResponse = sampleResponse();
        updatedResponse.setTitle("Updated title");
        updatedResponse.setPriority("CRITICAL");
        updatedResponse.setStatus("IN_PROGRESS");

        when(pendingTaskService.updatePendingTask(eq(1L), any(UpdatePendingTaskRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v1/pending-tasks/1")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Updated title"))
                .andExpect(jsonPath("$.data.priority").value("CRITICAL"));
    }

    @Test
    @DisplayName("PATCH /api/v1/pending-tasks/{id}/status: Returns 200 OK")
    void updatePendingTaskStatus_Success() throws Exception {
        UpdatePendingTaskStatusRequest statusRequest = new UpdatePendingTaskStatusRequest("COMPLETED");

        PendingTaskResponse completedResponse = sampleResponse();
        completedResponse.setStatus("COMPLETED");
        completedResponse.setCompletedAt(Instant.now());

        when(pendingTaskService.updatePendingTaskStatus(eq(1L), any(UpdatePendingTaskStatusRequest.class)))
                .thenReturn(completedResponse);

        mockMvc.perform(patch("/api/v1/pending-tasks/1/status")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("DELETE /api/v1/pending-tasks/{id}: Hard deletion prohibited returns 405 Method Not Allowed")
    void deletePendingTask_Prohibited_Returns405() throws Exception {
        mockMvc.perform(delete("/api/v1/pending-tasks/1")
                        .with(user(mockPrincipal()))
                        .with(csrf()))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("Unauthenticated request returns 401 Unauthorized")
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/pending-tasks"))
                .andExpect(status().isUnauthorized());
    }
}
