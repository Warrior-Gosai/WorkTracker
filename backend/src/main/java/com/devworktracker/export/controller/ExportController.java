package com.devworktracker.export.controller;

import com.devworktracker.export.dto.AllExportFilter;
import com.devworktracker.export.dto.CodeChangeExportFilter;
import com.devworktracker.export.dto.DbChangeExportFilter;
import com.devworktracker.export.dto.WorkLogExportFilter;
import com.devworktracker.export.service.ExportService;
import com.devworktracker.export.service.ExportServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exports")
@Tag(name = "Reports & Excel Exports", description = "Endpoints for downloading Excel workbooks and report ZIP archives")
public class ExportController {

    public static final String EXCEL_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public static final String ZIP_CONTENT_TYPE = "application/zip";

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/work-logs")
    @Operation(summary = "Export Daily Work Log", description = "Generates and downloads the 01_Daily_Work_Log.xlsx report for all or filtered records")
    public ResponseEntity<byte[]> exportDailyWorkLog(@ModelAttribute WorkLogExportFilter filter) {
        byte[] content = exportService.exportDailyWorkLog(filter);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.DAILY_WORK_LOG_FILENAME + "\"")
                .header(HttpHeaders.CONTENT_TYPE, EXCEL_CONTENT_TYPE)
                .contentType(MediaType.parseMediaType(EXCEL_CONTENT_TYPE))
                .body(content);
    }

    @GetMapping("/db-changes")
    @Operation(summary = "Export DB Change Log", description = "Generates and downloads the 02_DB_Change_Log.xlsx report for all or filtered records")
    public ResponseEntity<byte[]> exportDbChangeLog(@ModelAttribute DbChangeExportFilter filter) {
        byte[] content = exportService.exportDbChangeLog(filter);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.DB_CHANGE_LOG_FILENAME + "\"")
                .header(HttpHeaders.CONTENT_TYPE, EXCEL_CONTENT_TYPE)
                .contentType(MediaType.parseMediaType(EXCEL_CONTENT_TYPE))
                .body(content);
    }

    @GetMapping("/code-changes")
    @Operation(summary = "Export Code/File Change Log", description = "Generates and downloads the 03_Code_File_Change_Log.xlsx report for all or filtered records")
    public ResponseEntity<byte[]> exportCodeChangeLog(@ModelAttribute CodeChangeExportFilter filter) {
        byte[] content = exportService.exportCodeChangeLog(filter);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.CODE_FILE_CHANGE_LOG_FILENAME + "\"")
                .header(HttpHeaders.CONTENT_TYPE, EXCEL_CONTENT_TYPE)
                .contentType(MediaType.parseMediaType(EXCEL_CONTENT_TYPE))
                .body(content);
    }

    @GetMapping("/all")
    @Operation(summary = "Export All Reports (ZIP)", description = "Generates and downloads DevWork_Tracker_Reports.zip containing all three Excel workbooks")
    public ResponseEntity<byte[]> exportAllReportsZip(@ModelAttribute AllExportFilter filter) {
        byte[] content = exportService.exportAllReportsZip(filter);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ExportServiceImpl.ALL_REPORTS_ZIP_FILENAME + "\"")
                .header(HttpHeaders.CONTENT_TYPE, ZIP_CONTENT_TYPE)
                .contentType(MediaType.parseMediaType(ZIP_CONTENT_TYPE))
                .body(content);
    }
}
