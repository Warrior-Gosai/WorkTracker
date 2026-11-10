package com.devworktracker.export.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.dbchange.repository.DbChangeRepository;
import com.devworktracker.export.dto.DbChangeExportFilter;
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
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DbChangeExportServiceTest {

    @Mock
    private DbChangeRepository dbChangeRepository;

    private ExcelTemplateService excelTemplateService;
    private DbChangeExportService exportService;

    @BeforeEach
    void setUp() {
        excelTemplateService = new ExcelTemplateService();
        exportService = new DbChangeExportService(dbChangeRepository, excelTemplateService);
    }

    private DbChange createMockDbChange(Long id, String code) {
        DbChange dbc = new DbChange(code, 100L, "DEV", "PostgreSQL", "Table", "APP_USER", "Added column", "User auth", "LOGIN_PROC", "Schema update");

        Project project = new Project("PRJ-000001", "Core App", "Core project", (short) 1, "remarks");
        TaskItem taskItem = new TaskItem("TASK-000001", 1L, "TASK", "Auth feature", "description", "HIGH", "OPEN", (short) 1, null, "remarks");
        taskItem.setProject(project);

        WorkLog workLog = new WorkLog(
                "WL-000001", 10L, LocalDate.of(2026, 11, 10), "DEV", "Development", "Task",
                "desc", "reason", "tech", null, null, "IN_PROGRESS", null, null, null, null, null, null
        );
        workLog.setTaskItem(taskItem);
        dbc.setWorkLog(workLog);

        return dbc;
    }

    @Test
    @DisplayName("Export DB Change Log with records preserves 12 columns and sheet structure")
    void testExportWithRecords() throws Exception {
        DbChange dbc1 = createMockDbChange(1L, "DB-000001");
        DbChange dbc2 = createMockDbChange(2L, "DB-000002");

        when(dbChangeRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(dbc1, dbc2));

        DbChangeExportFilter filter = new DbChangeExportFilter();
        filter.setScope("all");

        byte[] bytes = exportService.exportToExcel(filter);
        assertNotNull(bytes);
        assertTrue(bytes.length > 0);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, wb.getNumberOfSheets());
            assertEquals("Database Change Log", wb.getSheetAt(0).getSheetName());
            assertEquals("Instructions", wb.getSheetAt(1).getSheetName());

            XSSFSheet sheet = wb.getSheetAt(0);
            assertEquals(2, sheet.getLastRowNum());

            Row row1 = sheet.getRow(1);
            assertEquals("DB-000001", row1.getCell(0).getStringCellValue());
            assertEquals("WL-000001", row1.getCell(1).getStringCellValue());
            assertEquals("Core App", row1.getCell(3).getStringCellValue());
            assertEquals("DEV", row1.getCell(4).getStringCellValue());
            assertEquals("PostgreSQL", row1.getCell(5).getStringCellValue());
            assertEquals("Table", row1.getCell(6).getStringCellValue());
            assertEquals("APP_USER", row1.getCell(7).getStringCellValue());
            assertEquals("Added column", row1.getCell(8).getStringCellValue());
            assertEquals("User auth", row1.getCell(9).getStringCellValue());
            assertEquals("LOGIN_PROC", row1.getCell(10).getStringCellValue());
            assertEquals("Schema update", row1.getCell(11).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Export DB Change Log with empty dataset produces valid workbook with headers only")
    void testExportEmptyDataset() throws Exception {
        when(dbChangeRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        DbChangeExportFilter filter = new DbChangeExportFilter();
        filter.setScope("filtered");

        byte[] bytes = exportService.exportToExcel(filter);
        assertNotNull(bytes);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            XSSFSheet sheet = wb.getSheetAt(0);
            assertEquals(0, sheet.getLastRowNum());
            assertEquals("DB Change ID", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Remarks", sheet.getRow(0).getCell(11).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Invalid scope throws BadRequestException")
    void testInvalidScope() {
        DbChangeExportFilter filter = new DbChangeExportFilter();
        filter.setScope("unknown");

        assertThrows(BadRequestException.class, () -> exportService.exportToExcel(filter));
    }
}
