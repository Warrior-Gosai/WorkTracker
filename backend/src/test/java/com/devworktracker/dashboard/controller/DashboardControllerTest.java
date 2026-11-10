package com.devworktracker.dashboard.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.dashboard.dto.*;
import com.devworktracker.dashboard.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/summary: Returns 200 OK with summary metrics")
    void getSummary_Success() throws Exception {
        DashboardSummaryResponse response = new DashboardSummaryResponse(
                5L, 4L, 80L, 20L, 150L, 12L, 3L, 4L
        );
        when(dashboardService.getSummary()).thenReturn(response);

        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalProjects").value(5))
                .andExpect(jsonPath("$.data.activeProjects").value(4))
                .andExpect(jsonPath("$.data.totalTaskItems").value(80))
                .andExpect(jsonPath("$.data.openTaskItems").value(20))
                .andExpect(jsonPath("$.data.totalWorkLogs").value(150))
                .andExpect(jsonPath("$.data.totalPendingTasks").value(12))
                .andExpect(jsonPath("$.data.overduePendingTasks").value(3))
                .andExpect(jsonPath("$.data.uncommittedCodeChanges").value(4));
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/work-summary: Returns 200 OK with duration and counts")
    void getWorkSummary_Success() throws Exception {
        WorkSummaryResponse response = new WorkSummaryResponse(
                10L, new BigDecimal("45.50"), 6L, 3L, 1L, 0L,
                List.of(new DailyWorkSummary(LocalDate.of(2026, 11, 10), new BigDecimal("8.00"), 2L))
        );
        when(dashboardService.getWorkSummary(any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/dashboard/work-summary")
                        .param("dateFrom", "2026-11-01")
                        .param("dateTo", "2026-11-10")
                        .param("projectId", "1")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalWorkLogs").value(10))
                .andExpect(jsonPath("$.data.totalHours").value(45.50))
                .andExpect(jsonPath("$.data.completedWorkLogs").value(6))
                .andExpect(jsonPath("$.data.dailySummaries[0].hours").value(8.00));
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/project-summary: Returns 200 OK with list of project summaries")
    void getProjectSummary_Success() throws Exception {
        ProjectSummaryResponse p1 = new ProjectSummaryResponse(
                1L, "PRJ-000001", "Core Portal", (short) 1, 20L, 5L, 12L, 45L
        );
        when(dashboardService.getProjectSummary()).thenReturn(List.of(p1));

        mockMvc.perform(get("/api/v1/dashboard/project-summary")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].projectCode").value("PRJ-000001"))
                .andExpect(jsonPath("$.data[0].totalTaskItems").value(20));
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/pending-summary: Returns 200 OK with status counts")
    void getPendingSummary_Success() throws Exception {
        PendingTaskSummaryResponse response = new PendingTaskSummaryResponse(
                5L, 3L, 2L, 7L, 1L, 2L, 18L
        );
        when(dashboardService.getPendingSummary()).thenReturn(response);

        mockMvc.perform(get("/api/v1/dashboard/pending-summary")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pending").value(5))
                .andExpect(jsonPath("$.data.overdue").value(2))
                .andExpect(jsonPath("$.data.total").value(18));
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/recent-activities: Returns 200 OK with activities")
    void getRecentActivities_Success() throws Exception {
        RecentActivityResponse item = new RecentActivityResponse(
                "TASK_ITEM", 10L, "TASK-000001", "Task Title", "Core Portal",
                Instant.now(), "/task-items/10"
        );
        when(dashboardService.getRecentActivities(anyInt())).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/dashboard/recent-activities")
                        .param("limit", "15")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].activityType").value("TASK_ITEM"))
                .andExpect(jsonPath("$.data[0].navigationTarget").value("/task-items/10"));
    }

    @Test
    @DisplayName("Unauthenticated request returns 401 Unauthorized")
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isUnauthorized());
    }
}
