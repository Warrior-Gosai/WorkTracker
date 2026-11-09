package com.devworktracker.project.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.project.dto.CreateProjectRequest;
import com.devworktracker.project.dto.ProjectResponse;
import com.devworktracker.project.dto.UpdateProjectRequest;
import com.devworktracker.project.service.ProjectService;
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

@WebMvcTest(ProjectController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    private ProjectResponse sampleResponse() {
        return new ProjectResponse(
                1L,
                "PRJ-000001",
                "Internal Portal",
                "Core portal description",
                (short) 1,
                "Remarks",
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/projects creates project and returns 201")
    void testCreateProject_success() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest("Internal Portal", "Description", "Remarks");
        when(projectService.createProject(any(CreateProjectRequest.class))).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/v1/projects")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.projectCode").value("PRJ-000001"))
                .andExpect(jsonPath("$.data.projectName").value("Internal Portal"))
                .andExpect(jsonPath("$.data.status").value(1));
    }

    @Test
    @DisplayName("POST /api/v1/projects returns 400 when project name is blank")
    void testCreateProject_blankNameReturns400() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest("   ", "Description", "Remarks");

        mockMvc.perform(post("/api/v1/projects")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].field").value("projectName"));
    }

    @Test
    @DisplayName("POST /api/v1/projects returns 401 when unauthenticated")
    void testCreateProject_unauthenticatedReturns401() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest("Portal", "Desc", "Remarks");

        mockMvc.perform(post("/api/v1/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/projects returns paginated projects list")
    void testGetProjects_success() throws Exception {
        PageResponse<ProjectResponse> pageResponse = new PageResponse<>(
                List.of(sampleResponse()), 0, 10, 1L, 1, true, true
        );
        when(projectService.getProjects(any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/projects")
                        .with(user(mockPrincipal()))
                        .param("search", "Portal")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].projectCode").value("PRJ-000001"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/projects/{projectId} returns project details")
    void testGetProjectById_success() throws Exception {
        when(projectService.getProjectById(1L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/v1/projects/1")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.projectId").value(1))
                .andExpect(jsonPath("$.data.projectCode").value("PRJ-000001"));
    }

    @Test
    @DisplayName("GET /api/v1/projects/{projectId} returns 404 when not found")
    void testGetProjectById_notFound() throws Exception {
        when(projectService.getProjectById(999L)).thenThrow(new ResourceNotFoundException("Project not found with id: 999"));

        mockMvc.perform(get("/api/v1/projects/999")
                        .with(user(mockPrincipal())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Project not found with id: 999"));
    }

    @Test
    @DisplayName("PUT /api/v1/projects/{projectId} updates project and returns 200")
    void testUpdateProject_success() throws Exception {
        UpdateProjectRequest request = new UpdateProjectRequest("Updated Portal", "New Desc", "New Remarks");
        ProjectResponse updated = sampleResponse();
        updated.setProjectName("Updated Portal");
        when(projectService.updateProject(eq(1L), any(UpdateProjectRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/projects/1")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.projectName").value("Updated Portal"));
    }

    @Test
    @DisplayName("PUT /api/v1/projects/{projectId} returns 400 when project name is blank")
    void testUpdateProject_blankNameReturns400() throws Exception {
        UpdateProjectRequest request = new UpdateProjectRequest("", "Desc", "Remarks");

        mockMvc.perform(put("/api/v1/projects/1")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].field").value("projectName"));
    }
}
