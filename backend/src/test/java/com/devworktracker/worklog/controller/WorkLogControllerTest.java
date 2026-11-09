package com.devworktracker.worklog.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.worklog.dto.CreateWorkLogRequest;
import com.devworktracker.worklog.dto.UpdateWorkLogRequest;
import com.devworktracker.worklog.dto.WorkLogResponse;
import com.devworktracker.worklog.service.WorkLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WorkLogController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class WorkLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WorkLogService workLogService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    private WorkLogResponse sampleWorkLogResponse() {
        return new WorkLogResponse(
                100L,
                "WL-000001",
                10L,
                "TASK-000001",
                "Auth Feature",
                1L,
                "PRJ-000001",
                "FlowTrack",
                LocalDate.of(2026, 11, 9),
                "Monday",
                "LOCAL",
                "DEVELOPMENT",
                "Implement JWT Authentication",
                "Configured filters and tokens",
                "Security compliance",
                "Spring Boot 3",
                LocalTime.of(9, 0),
                LocalTime.of(18, 0),
                BigDecimal.valueOf(9.00),
                "COMPLETED",
                null,
                "Configured successfully",
                "100% tests passing",
                "Auth module operational",
                "Next: Work logs",
                "Remarks",
                Collections.emptyList(),
                Collections.emptyList(),
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/work-logs: 201 Created on valid request")
    void createWorkLog_Success() throws Exception {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkDate(LocalDate.of(2026, 11, 9));
        request.setEnvironment("LOCAL");
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Implement JWT Authentication");
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(18, 0));
        request.setStatus("COMPLETED");

        when(workLogService.createWorkLog(any(CreateWorkLogRequest.class))).thenReturn(sampleWorkLogResponse());

        mockMvc.perform(post("/api/v1/work-logs")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Work log created successfully"))
                .andExpect(jsonPath("$.data.workLogCode").value("WL-000001"))
                .andExpect(jsonPath("$.data.totalHours").value(9.0));
    }

    @Test
    @DisplayName("POST /api/v1/work-logs: 400 Bad Request on missing task requirement")
    void createWorkLog_ValidationError_MissingRequirement() throws Exception {
        CreateWorkLogRequest request = new CreateWorkLogRequest();
        request.setTaskItemId(10L);
        request.setWorkType("DEVELOPMENT");
        // taskRequirement left blank

        mockMvc.perform(post("/api/v1/work-logs")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/work-logs: 200 OK with paginated content")
    void getWorkLogs_Success() throws Exception {
        PageResponse<WorkLogResponse> pagedResponse = new PageResponse<>(
                List.of(sampleWorkLogResponse()), 0, 10, 1, 1, true, true
        );
        when(workLogService.getWorkLogs(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/work-logs")
                        .with(user(mockPrincipal()))
                        .param("search", "JWT")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].workLogCode").value("WL-000001"));
    }

    @Test
    @DisplayName("GET /api/v1/work-logs/{id}: 200 OK when found")
    void getWorkLogById_Success() throws Exception {
        when(workLogService.getWorkLogById(100L)).thenReturn(sampleWorkLogResponse());

        mockMvc.perform(get("/api/v1/work-logs/100")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.workLogCode").value("WL-000001"));
    }

    @Test
    @DisplayName("GET /api/v1/work-logs/{id}: 404 Not Found when absent")
    void getWorkLogById_NotFound() throws Exception {
        when(workLogService.getWorkLogById(999L)).thenThrow(new ResourceNotFoundException("Work log not found with id: 999"));

        mockMvc.perform(get("/api/v1/work-logs/999")
                        .with(user(mockPrincipal())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/v1/work-logs/{id}: 200 OK on successful update")
    void updateWorkLog_Success() throws Exception {
        UpdateWorkLogRequest request = new UpdateWorkLogRequest();
        request.setWorkDate(LocalDate.of(2026, 11, 9));
        request.setWorkType("DEVELOPMENT");
        request.setTaskRequirement("Updated Requirement");

        when(workLogService.updateWorkLog(eq(100L), any(UpdateWorkLogRequest.class)))
                .thenReturn(sampleWorkLogResponse());

        mockMvc.perform(put("/api/v1/work-logs/100")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Work log updated successfully"));
    }

    @Test
    @DisplayName("GET /api/v1/work-logs: 401 Unauthorized without auth")
    void unauthenticatedRequest_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/work-logs"))
                .andExpect(status().isUnauthorized());
    }
}
