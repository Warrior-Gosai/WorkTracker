package com.devworktracker.export.controller;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.export.dto.AllExportFilter;
import com.devworktracker.export.dto.CodeChangeExportFilter;
import com.devworktracker.export.dto.DbChangeExportFilter;
import com.devworktracker.export.dto.WorkLogExportFilter;
import com.devworktracker.export.service.ExportService;
import com.devworktracker.export.service.ExportServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExportController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExportService exportService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    private CustomUserPrincipal mockPrincipal() {
        return new CustomUserPrincipal(1L, "admin", "admin@devworktracker.com", "hash", true);
    }

    @Test
    @DisplayName("GET /api/v1/exports/work-logs: Returns 200 with Daily Work Log Excel attachment")
    void exportDailyWorkLog_Success() throws Exception {
        byte[] dummyBytes = "DummyExcelContent".getBytes();
        when(exportService.exportDailyWorkLog(any(WorkLogExportFilter.class))).thenReturn(dummyBytes);

        mockMvc.perform(get("/api/v1/exports/work-logs?scope=all")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.DAILY_WORK_LOG_FILENAME + "\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, ExportController.EXCEL_CONTENT_TYPE))
                .andExpect(content().bytes(dummyBytes));
    }

    @Test
    @DisplayName("GET /api/v1/exports/db-changes: Returns 200 with DB Change Log Excel attachment")
    void exportDbChangeLog_Success() throws Exception {
        byte[] dummyBytes = "DummyDbExcelContent".getBytes();
        when(exportService.exportDbChangeLog(any(DbChangeExportFilter.class))).thenReturn(dummyBytes);

        mockMvc.perform(get("/api/v1/exports/db-changes?scope=all")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.DB_CHANGE_LOG_FILENAME + "\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, ExportController.EXCEL_CONTENT_TYPE))
                .andExpect(content().bytes(dummyBytes));
    }

    @Test
    @DisplayName("GET /api/v1/exports/code-changes: Returns 200 with Code File Change Log Excel attachment")
    void exportCodeChangeLog_Success() throws Exception {
        byte[] dummyBytes = "DummyCodeExcelContent".getBytes();
        when(exportService.exportCodeChangeLog(any(CodeChangeExportFilter.class))).thenReturn(dummyBytes);

        mockMvc.perform(get("/api/v1/exports/code-changes?scope=all")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.CODE_FILE_CHANGE_LOG_FILENAME + "\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, ExportController.EXCEL_CONTENT_TYPE))
                .andExpect(content().bytes(dummyBytes));
    }

    @Test
    @DisplayName("GET /api/v1/exports/all: Returns 200 with ZIP attachment")
    void exportAllReportsZip_Success() throws Exception {
        byte[] dummyZip = "DummyZipContent".getBytes();
        when(exportService.exportAllReportsZip(any(AllExportFilter.class))).thenReturn(dummyZip);

        mockMvc.perform(get("/api/v1/exports/all?scope=all")
                        .with(user(mockPrincipal())))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.ALL_REPORTS_ZIP_FILENAME + "\""))
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, ExportController.ZIP_CONTENT_TYPE))
                .andExpect(content().bytes(dummyZip));
    }

    @Test
    @DisplayName("GET /api/v1/exports/work-logs: Returns 400 Bad Request on invalid scope")
    void exportDailyWorkLog_InvalidScope() throws Exception {
        when(exportService.exportDailyWorkLog(any(WorkLogExportFilter.class)))
                .thenThrow(new BadRequestException("Invalid scope: 'unknown'. Allowed values: all, filtered"));

        mockMvc.perform(get("/api/v1/exports/work-logs?scope=unknown")
                        .with(user(mockPrincipal())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid scope: 'unknown'. Allowed values: all, filtered"));
    }

    @Test
    @DisplayName("GET /api/v1/exports/all without authentication returns 401 Unauthorized")
    void exportAllReportsZip_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/exports/all"))
                .andExpect(status().isUnauthorized());
    }
}
