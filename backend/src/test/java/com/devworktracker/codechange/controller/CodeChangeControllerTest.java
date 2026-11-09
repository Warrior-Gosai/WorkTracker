package com.devworktracker.codechange.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.codechange.dto.CodeChangeFileDto;
import com.devworktracker.codechange.dto.CodeChangeResponse;
import com.devworktracker.codechange.dto.CommitSearchResponse;
import com.devworktracker.codechange.dto.CreateCodeChangeRequest;
import com.devworktracker.codechange.dto.UpdateCodeChangeRequest;
import com.devworktracker.codechange.service.CodeChangeService;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
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
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CodeChangeController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class CodeChangeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CodeChangeService codeChangeService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    private CodeChangeResponse sampleResponse() {
        return new CodeChangeResponse(
                1000L,
                "CC-000001",
                100L,
                "WL-000001",
                LocalDate.of(2026, 11, 9),
                "Implement auth",
                10L,
                "TASK-000001",
                "Auth Module",
                1L,
                "PRJ-000001",
                "FlowTrack",
                "COMMITTED",
                "r1042",
                Instant.now(),
                "LOCAL",
                "Commit remarks",
                0,
                Collections.emptyList(),
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("POST /api/v1/code-changes: 201 Created on valid request")
    void createCodeChange_Success() throws Exception {
        CreateCodeChangeRequest request = new CreateCodeChangeRequest();
        request.setWorkLogId(100L);
        request.setChangeStatus("COMMITTED");
        request.setSvnCommitId("r1042");
        request.setEnvironment("LOCAL");

        when(codeChangeService.createCodeChange(any(CreateCodeChangeRequest.class)))
                .thenReturn(sampleResponse());

        mockMvc.perform(post("/api/v1/code-changes")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codeChangeCode").value("CC-000001"))
                .andExpect(jsonPath("$.data.svnCommitId").value("r1042"));
    }

    @Test
    @DisplayName("GET /api/v1/code-changes: 200 OK with paginated content")
    void getCodeChanges_Success() throws Exception {
        PageResponse<CodeChangeResponse> pagedResponse = new PageResponse<>(
                List.of(sampleResponse()), 0, 10, 1, 1, true, true
        );
        when(codeChangeService.getCodeChanges(any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/code-changes")
                        .with(user(mockPrincipal()))
                        .param("search", "r1042")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].codeChangeCode").value("CC-000001"));
    }

    @Test
    @DisplayName("GET /api/v1/code-changes/{id}: 200 OK when found")
    void getCodeChangeById_Success() throws Exception {
        when(codeChangeService.getCodeChangeById(1000L)).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/v1/code-changes/1000")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codeChangeCode").value("CC-000001"));
    }

    @Test
    @DisplayName("PUT /api/v1/code-changes/{id}: 200 OK on successful update")
    void updateCodeChange_Success() throws Exception {
        UpdateCodeChangeRequest request = new UpdateCodeChangeRequest();
        request.setChangeStatus("COMMITTED");
        request.setSvnCommitId("r1045");
        request.setEnvironment("UAT");

        when(codeChangeService.updateCodeChange(eq(1000L), any(UpdateCodeChangeRequest.class)))
                .thenReturn(sampleResponse());

        mockMvc.perform(put("/api/v1/code-changes/1000")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Code change updated successfully"));
    }

    @Test
    @DisplayName("GET /api/v1/code-changes/commit/{commitId}: 200 OK on exact commit match")
    void searchBySvnCommitId_Success() throws Exception {
        CommitSearchResponse searchResponse = new CommitSearchResponse(
                1000L, "CC-000001", "r1042", Instant.now(), "LOCAL", "COMMITTED",
                "Remarks", 100L, "WL-000001", LocalDate.of(2026, 11, 9), "Requirement",
                10L, "TASK-000001", "Task Title", 1L, "PRJ-000001", "FlowTrack",
                Collections.emptyList(), Collections.emptyList()
        );

        when(codeChangeService.searchBySvnCommitId("r1042")).thenReturn(searchResponse);

        mockMvc.perform(get("/api/v1/code-changes/commit/r1042")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.svnCommitId").value("r1042"))
                .andExpect(jsonPath("$.data.workLogCode").value("WL-000001"));
    }

    @Test
    @DisplayName("POST /api/v1/code-changes/{id}/files: 201 Created on valid file entry")
    void addFile_Success() throws Exception {
        CodeChangeFileDto fileDto = new CodeChangeFileDto();
        fileDto.setFilePath("src/main/App.java");
        fileDto.setLayer("BACKEND");

        CodeChangeFileDto created = new CodeChangeFileDto(
                500L, 1000L, "BACKEND", null, "src/main/App.java", null, null, null, null, Instant.now()
        );

        when(codeChangeService.addFile(eq(1000L), any(CodeChangeFileDto.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/code-changes/1000/files")
                        .with(user(mockPrincipal()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fileDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codeChangeFileId").value(500L));
    }

    @Test
    @DisplayName("DELETE /api/v1/code-changes/{id}/files/{fileId}: 204 No Content")
    void deleteFile_Success() throws Exception {
        doNothing().when(codeChangeService).deleteFile(1000L, 500L);

        mockMvc.perform(delete("/api/v1/code-changes/1000/files/500")
                        .with(user(mockPrincipal()))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/code-changes: 401 Unauthorized without auth")
    void unauthenticatedRequest_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/code-changes"))
                .andExpect(status().isUnauthorized());
    }
}
