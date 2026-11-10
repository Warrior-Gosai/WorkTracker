package com.devworktracker.dbchange.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.dbchange.dto.CreateDbChangeRequest;
import com.devworktracker.dbchange.dto.DbChangeResponse;
import com.devworktracker.dbchange.dto.UpdateDbChangeRequest;
import com.devworktracker.dbchange.service.DbChangeService;
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

@WebMvcTest(DbChangeController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class DbChangeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DbChangeService dbChangeService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    private DbChangeResponse sampleResponse() {
        return new DbChangeResponse(
                1L,
                "DB-000001",
                100L,
                "WL-000001",
                LocalDate.of(2026, 11, 10),
                20L,
                "TASK-000001",
                "Auth Task",
                10L,
                "PRJ-000001",
                "Core Portal",
                "LOCAL",
                "PostgreSQL",
                "Table",
                "app_user",
                "Added unique username constraint",
                "Security compliance",
                "auth_session",
                "No migration issues",
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/db-changes: Success returns 201")
    void createDbChange_Success() throws Exception {
        CreateDbChangeRequest request = new CreateDbChangeRequest(
                100L, "LOCAL", "PostgreSQL", "Table", "app_user",
                "Added unique constraint", "Security compliance", null, null
        );

        when(dbChangeService.createDbChange(any(CreateDbChangeRequest.class))).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/v1/db-changes")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Database change created successfully"))
                .andExpect(jsonPath("$.data.dbChangeCode").value("DB-000001"))
                .andExpect(jsonPath("$.data.databaseName").value("PostgreSQL"))
                .andExpect(jsonPath("$.data.objectType").value("Table"));
    }

    @Test
    @DisplayName("POST /api/v1/db-changes: Fails with 400 when required fields missing")
    void createDbChange_ValidationFailure() throws Exception {
        CreateDbChangeRequest invalidRequest = new CreateDbChangeRequest(); // Missing required fields

        mockMvc.perform(post("/api/v1/db-changes")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/db-changes: Success returns 200 with paginated list")
    void getDbChanges_Success() throws Exception {
        PageResponse<DbChangeResponse> pageResponse = new PageResponse<>(
                List.of(sampleResponse()), 0, 10, 1L, 1, true, true
        );

        when(dbChangeService.getDbChanges(
                any(), any(), any(), any(), any(), any(), any(), any(), any(),
                anyInt(), anyInt(), anyString(), anyString()
        )).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/db-changes")
                        .with(user(mockPrincipal()))
                        .param("search", "app_user")
                        .param("databaseName", "PostgreSQL")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].dbChangeCode").value("DB-000001"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/db-changes/{id}: Success returns 200")
    void getDbChangeById_Success() throws Exception {
        when(dbChangeService.getDbChangeById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/v1/db-changes/1")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dbChangeId").value(1))
                .andExpect(jsonPath("$.data.dbChangeCode").value("DB-000001"));
    }

    @Test
    @DisplayName("PUT /api/v1/db-changes/{id}: Success returns 200")
    void updateDbChange_Success() throws Exception {
        UpdateDbChangeRequest updateRequest = new UpdateDbChangeRequest(
                "UAT", "Oracle", "View", "vw_user_summary",
                "Modified view definition", "Reporting requirements", null, null
        );

        DbChangeResponse updatedResponse = sampleResponse();
        updatedResponse.setEnvironment("UAT");
        updatedResponse.setDatabaseName("Oracle");
        updatedResponse.setObjectType("View");
        updatedResponse.setObjectName("vw_user_summary");

        when(dbChangeService.updateDbChange(eq(1L), any(UpdateDbChangeRequest.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v1/db-changes/1")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.databaseName").value("Oracle"))
                .andExpect(jsonPath("$.data.objectType").value("View"));
    }

    @Test
    @DisplayName("DELETE /api/v1/db-changes/{id}: Returns 405 Method Not Allowed (Delete is prohibited)")
    void deleteDbChange_Prohibited() throws Exception {
        mockMvc.perform(delete("/api/v1/db-changes/1")
                        .with(user(mockPrincipal()))
                        .with(csrf()))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("Unauthenticated request: Returns 401 or 403")
    void unauthenticatedRequest_Fails() throws Exception {
        mockMvc.perform(get("/api/v1/db-changes"))
                .andExpect(status().isUnauthorized());
    }
}
