package com.devworktracker.export.service;

import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.entity.CodeChangeFile;
import com.devworktracker.codechange.repository.CodeChangeRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.export.dto.CodeChangeExportFilter;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CodeChangeExportServiceTest {

    @Mock
    private CodeChangeRepository codeChangeRepository;

    private ExcelTemplateService excelTemplateService;
    private CodeChangeExportService exportService;

    @BeforeEach
    void setUp() {
        excelTemplateService = new ExcelTemplateService();
        exportService = new CodeChangeExportService(codeChangeRepository, excelTemplateService);
    }

    private CodeChange createMockCodeChange(Long id, String code, int fileCount) {
        CodeChange cc = new CodeChange(code, 100L, "COMMITTED", "r12345", Instant.now(), "DEV", "General code remarks");

        Project project = new Project("PRJ-000001", "Core App", "Description", (short) 1, "remarks");
        TaskItem taskItem = new TaskItem("TASK-000001", 1L, "TASK", "Export Task", "description", "HIGH", "OPEN", (short) 1, null, "remarks");
        taskItem.setProject(project);

        WorkLog workLog = new WorkLog(
                "WL-000001", 10L, LocalDate.of(2026, 11, 10), "DEV", "Development", "Task",
                "desc", "reason", "tech", null, null, "IN_PROGRESS", null, null, null, null, null, null
        );
        workLog.setTaskItem(taskItem);
        cc.setWorkLog(workLog);

        List<CodeChangeFile> files = new ArrayList<>();
        for (int i = 1; i <= fileCount; i++) {
            CodeChangeFile file = new CodeChangeFile(
                    id, "Backend", "Java", "src/file" + i + ".java",
                    "Change " + i, "Why " + i, "aff" + i + ".java", "file remark " + i
            );
            files.add(file);
        }
        cc.setFiles(files);

        return cc;
    }

    @Test
    @DisplayName("Export Code/File Change Log aggregates multiple files with newline separation across 13 columns")
    void testExportWithMultipleFiles() throws Exception {
        CodeChange cc1 = createMockCodeChange(1L, "CC-000001", 2);
        CodeChange cc2 = createMockCodeChange(2L, "CC-000002", 0);

        when(codeChangeRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(cc1, cc2));

        CodeChangeExportFilter filter = new CodeChangeExportFilter();
        filter.setScope("all");

        byte[] bytes = exportService.exportToExcel(filter);
        assertNotNull(bytes);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, wb.getNumberOfSheets());
            XSSFSheet sheet = wb.getSheetAt(0);
            assertEquals("Code File Change Log", sheet.getSheetName());
            assertEquals(2, sheet.getLastRowNum());

            // Header row has 13 columns
            Row headerRow = sheet.getRow(0);
            assertEquals("Code Change ID", headerRow.getCell(0).getStringCellValue());
            assertEquals("SVN Commit ID", headerRow.getCell(11).getStringCellValue());
            assertEquals("Change Status", headerRow.getCell(12).getStringCellValue());

            // Row 1: with 2 files aggregated
            Row row1 = sheet.getRow(1);
            assertEquals("CC-000001", row1.getCell(0).getStringCellValue());
            assertEquals("WL-000001", row1.getCell(1).getStringCellValue());
            assertEquals("Core App", row1.getCell(3).getStringCellValue());
            assertEquals("Backend\nBackend", row1.getCell(4).getStringCellValue());
            assertEquals("Java\nJava", row1.getCell(5).getStringCellValue());
            assertEquals("src/file1.java\nsrc/file2.java", row1.getCell(6).getStringCellValue());
            assertEquals("Change 1\nChange 2", row1.getCell(7).getStringCellValue());
            assertEquals("Why 1\nWhy 2", row1.getCell(8).getStringCellValue());
            assertEquals("aff1.java\naff2.java", row1.getCell(9).getStringCellValue());
            assertTrue(row1.getCell(10).getStringCellValue().contains("General code remarks"));
            assertEquals("r12345", row1.getCell(11).getStringCellValue());
            assertEquals("COMMITTED", row1.getCell(12).getStringCellValue());

            // Row 2: with 0 files
            Row row2 = sheet.getRow(2);
            assertEquals("CC-000002", row2.getCell(0).getStringCellValue());
            assertEquals("", row2.getCell(4).getStringCellValue());
            assertEquals("", row2.getCell(5).getStringCellValue());
            assertEquals("", row2.getCell(6).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Export Code/File Change Log with empty dataset produces valid workbook with headers only")
    void testExportEmptyDataset() throws Exception {
        when(codeChangeRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        CodeChangeExportFilter filter = new CodeChangeExportFilter();
        filter.setScope("filtered");

        byte[] bytes = exportService.exportToExcel(filter);
        assertNotNull(bytes);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            XSSFSheet sheet = wb.getSheetAt(0);
            assertEquals(0, sheet.getLastRowNum());
            assertEquals("Code Change ID", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Change Status", sheet.getRow(0).getCell(12).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Invalid scope throws BadRequestException")
    void testInvalidScope() {
        CodeChangeExportFilter filter = new CodeChangeExportFilter();
        filter.setScope("bad");

        assertThrows(BadRequestException.class, () -> exportService.exportToExcel(filter));
    }
}
