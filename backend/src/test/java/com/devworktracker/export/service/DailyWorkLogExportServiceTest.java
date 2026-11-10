package com.devworktracker.export.service;

import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.repository.CodeChangeRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.dbchange.repository.DbChangeRepository;
import com.devworktracker.export.dto.WorkLogExportFilter;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.repository.WorkLogRepository;
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
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DailyWorkLogExportServiceTest {

    @Mock
    private WorkLogRepository workLogRepository;

    @Mock
    private CodeChangeRepository codeChangeRepository;

    @Mock
    private DbChangeRepository dbChangeRepository;

    private ExcelTemplateService excelTemplateService;
    private DailyWorkLogExportService exportService;

    @BeforeEach
    void setUp() {
        excelTemplateService = new ExcelTemplateService();
        exportService = new DailyWorkLogExportService(
                workLogRepository, codeChangeRepository, dbChangeRepository, excelTemplateService
        );
    }

    private WorkLog createMockWorkLog(Long id, String code, LocalDate date, LocalTime start, LocalTime end) {
        WorkLog wl = new WorkLog(
                code, 10L, date, "DEV", "Development", "Task Req " + id,
                "Desc " + id, "Reason " + id, "Java, Spring", start, end,
                "COMPLETED", "None", "Done", "Verified", "Success", "None", "Notes " + id
        );
        try {
            var idField = WorkLog.class.getDeclaredField("workLogId");
            idField.setAccessible(true);
            idField.set(wl, id);
        } catch (Exception ignored) {}

        Project project = new Project("PRJ-000001", "DevWork Tracker", "Project Description", (short) 1, "remarks");
        TaskItem taskItem = new TaskItem("TASK-000001", 1L, "TASK", "Export Module", "description", "HIGH", "OPEN", (short) 1, null, "remarks");
        taskItem.setProject(project);
        wl.setTaskItem(taskItem);

        return wl;
    }

    @Test
    @DisplayName("Export Daily Work Log with records preserves 22 columns and sheet structure")
    void testExportWithRecords() throws Exception {
        WorkLog wl1 = createMockWorkLog(1L, "WL-000001", LocalDate.of(2026, 11, 10), LocalTime.of(9, 0), LocalTime.of(17, 30));
        WorkLog wl2 = createMockWorkLog(2L, "WL-000002", LocalDate.of(2026, 11, 11), LocalTime.of(10, 0), LocalTime.of(18, 0));

        when(workLogRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(wl1, wl2));

        CodeChange cc1 = new CodeChange("CC-000001", 1L, "COMMITTED", "r123", java.time.Instant.now(), "DEV", "remarks");
        when(codeChangeRepository.findByWorkLogIdIn(List.of(1L, 2L))).thenReturn(List.of(cc1));

        DbChange dbc1 = new DbChange("DB-000001", 1L, "DEV", "PostgreSQL", "Table", "USERS", "created", "auth", "obj", "remarks");
        when(dbChangeRepository.findByWorkLogIdIn(List.of(1L, 2L))).thenReturn(List.of(dbc1));

        WorkLogExportFilter filter = new WorkLogExportFilter();
        filter.setScope("all");

        byte[] bytes = exportService.exportToExcel(filter);
        assertNotNull(bytes);
        assertTrue(bytes.length > 0);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, wb.getNumberOfSheets());
            assertEquals("Daily Work Log", wb.getSheetAt(0).getSheetName());
            assertEquals("Instructions", wb.getSheetAt(1).getSheetName());

            XSSFSheet sheet = wb.getSheetAt(0);
            assertEquals(2, sheet.getLastRowNum()); // row 0 = header, row 1 = wl1, row 2 = wl2

            Row row1 = sheet.getRow(1);
            assertEquals("WL-000001", row1.getCell(0).getStringCellValue());
            assertEquals("DevWork Tracker", row1.getCell(3).getStringCellValue());
            assertEquals("Export Module", row1.getCell(4).getStringCellValue());
            assertEquals("Task Req 1", row1.getCell(5).getStringCellValue());
            assertEquals("Development", row1.getCell(6).getStringCellValue());
            assertEquals("CC-000001", row1.getCell(19).getStringCellValue());
            assertEquals("DB-000001", row1.getCell(20).getStringCellValue());
            assertEquals("Notes 1", row1.getCell(21).getStringCellValue());

            // Day formula
            assertEquals("IF(B2=\"\",\"\",TEXT(B2,\"dddd\"))", row1.getCell(2).getCellFormula());
            // Duration formula
            assertEquals("IF(OR(K2=\"\",L2=\"\"),\"\",MOD(L2-K2,1)*24)", row1.getCell(12).getCellFormula());
        }
    }

    @Test
    @DisplayName("Export Daily Work Log with empty dataset produces valid workbook with headers only")
    void testExportEmptyDataset() throws Exception {
        when(workLogRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        WorkLogExportFilter filter = new WorkLogExportFilter();
        filter.setScope("filtered");
        filter.setSearch("nonexistent");

        byte[] bytes = exportService.exportToExcel(filter);
        assertNotNull(bytes);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertEquals(2, wb.getNumberOfSheets());
            XSSFSheet sheet = wb.getSheetAt(0);
            assertEquals(0, sheet.getLastRowNum()); // Only header row 0 remains
            assertEquals("Work ID", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("Notes / Remarks", sheet.getRow(0).getCell(21).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Invalid scope throws BadRequestException")
    void testInvalidScope() {
        WorkLogExportFilter filter = new WorkLogExportFilter();
        filter.setScope("invalid_scope");

        assertThrows(BadRequestException.class, () -> exportService.exportToExcel(filter));
    }

    @Test
    @DisplayName("Invalid date range (fromDate > toDate) throws BadRequestException")
    void testInvalidDateRange() {
        WorkLogExportFilter filter = new WorkLogExportFilter();
        filter.setScope("filtered");
        filter.setWorkDateFrom(LocalDate.of(2026, 11, 20));
        filter.setWorkDateTo(LocalDate.of(2026, 11, 10));

        assertThrows(BadRequestException.class, () -> exportService.exportToExcel(filter));
    }
}
