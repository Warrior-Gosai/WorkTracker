package com.devworktracker.export.service;

import com.devworktracker.export.dto.AllExportFilter;
import com.devworktracker.export.dto.CodeChangeExportFilter;
import com.devworktracker.export.dto.DbChangeExportFilter;
import com.devworktracker.export.dto.WorkLogExportFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock
    private DailyWorkLogExportService dailyWorkLogExportService;

    @Mock
    private DbChangeExportService dbChangeExportService;

    @Mock
    private CodeChangeExportService codeChangeExportService;

    private ExportService exportService;

    @BeforeEach
    void setUp() {
        exportService = new ExportServiceImpl(
                dailyWorkLogExportService, dbChangeExportService, codeChangeExportService
        );
    }

    @Test
    @DisplayName("Export All Reports ZIP contains exactly 3 expected Excel workbooks with correct filenames")
    void testExportAllReportsZip() throws Exception {
        byte[] dummyWl = "DailyWorkLogContent".getBytes();
        byte[] dummyDbc = "DbChangeLogContent".getBytes();
        byte[] dummyCc = "CodeChangeLogContent".getBytes();

        when(dailyWorkLogExportService.exportToExcel(any(WorkLogExportFilter.class))).thenReturn(dummyWl);
        when(dbChangeExportService.exportToExcel(any(DbChangeExportFilter.class))).thenReturn(dummyDbc);
        when(codeChangeExportService.exportToExcel(any(CodeChangeExportFilter.class))).thenReturn(dummyCc);

        AllExportFilter filter = new AllExportFilter();
        filter.setScope("all");

        byte[] zipBytes = exportService.exportAllReportsZip(filter);
        assertNotNull(zipBytes);
        assertTrue(zipBytes.length > 0);

        Set<String> entryNames = new HashSet<>();
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                entryNames.add(entry.getName());
                zis.closeEntry();
            }
        }

        assertEquals(3, entryNames.size());
        assertTrue(entryNames.contains(ExportServiceImpl.DAILY_WORK_LOG_FILENAME));
        assertTrue(entryNames.contains(ExportServiceImpl.DB_CHANGE_LOG_FILENAME));
        assertTrue(entryNames.contains(ExportServiceImpl.CODE_FILE_CHANGE_LOG_FILENAME));
    }

    @Test
    @DisplayName("Individual export methods delegate to corresponding services")
    void testDelegation() {
        WorkLogExportFilter wlFilter = new WorkLogExportFilter();
        exportService.exportDailyWorkLog(wlFilter);
        verify(dailyWorkLogExportService).exportToExcel(wlFilter);

        DbChangeExportFilter dbcFilter = new DbChangeExportFilter();
        exportService.exportDbChangeLog(dbcFilter);
        verify(dbChangeExportService).exportToExcel(dbcFilter);

        CodeChangeExportFilter ccFilter = new CodeChangeExportFilter();
        exportService.exportCodeChangeLog(ccFilter);
        verify(codeChangeExportService).exportToExcel(ccFilter);
    }
}
