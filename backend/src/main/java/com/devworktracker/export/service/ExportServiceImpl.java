package com.devworktracker.export.service;

import com.devworktracker.common.exception.ApiException;
import com.devworktracker.export.dto.AllExportFilter;
import com.devworktracker.export.dto.CodeChangeExportFilter;
import com.devworktracker.export.dto.DbChangeExportFilter;
import com.devworktracker.export.dto.WorkLogExportFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ExportServiceImpl implements ExportService {

    private static final Logger log = LoggerFactory.getLogger(ExportServiceImpl.class);

    public static final String DAILY_WORK_LOG_FILENAME = "01_Daily_Work_Log.xlsx";
    public static final String DB_CHANGE_LOG_FILENAME = "02_DB_Change_Log.xlsx";
    public static final String CODE_FILE_CHANGE_LOG_FILENAME = "03_Code_File_Change_Log.xlsx";
    public static final String ALL_REPORTS_ZIP_FILENAME = "DevWork_Tracker_Reports.zip";

    private final DailyWorkLogExportService dailyWorkLogExportService;
    private final DbChangeExportService dbChangeExportService;
    private final CodeChangeExportService codeChangeExportService;

    public ExportServiceImpl(
            DailyWorkLogExportService dailyWorkLogExportService,
            DbChangeExportService dbChangeExportService,
            CodeChangeExportService codeChangeExportService) {
        this.dailyWorkLogExportService = dailyWorkLogExportService;
        this.dbChangeExportService = dbChangeExportService;
        this.codeChangeExportService = codeChangeExportService;
    }

    @Override
    public byte[] exportDailyWorkLog(WorkLogExportFilter filter) {
        return dailyWorkLogExportService.exportToExcel(filter);
    }

    @Override
    public byte[] exportDbChangeLog(DbChangeExportFilter filter) {
        return dbChangeExportService.exportToExcel(filter);
    }

    @Override
    public byte[] exportCodeChangeLog(CodeChangeExportFilter filter) {
        return codeChangeExportService.exportToExcel(filter);
    }

    @Override
    public byte[] exportAllReportsZip(AllExportFilter filter) {
        log.info("Generating All Reports ZIP archive (scope: {})", filter.getScope());
        byte[] workLogsXlsx = dailyWorkLogExportService.exportToExcel(filter.toWorkLogFilter());
        byte[] dbChangesXlsx = dbChangeExportService.exportToExcel(filter.toDbChangeFilter());
        byte[] codeChangesXlsx = codeChangeExportService.exportToExcel(filter.toCodeChangeFilter());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            // 1. Daily Work Log
            ZipEntry entry1 = new ZipEntry(DAILY_WORK_LOG_FILENAME);
            zos.putNextEntry(entry1);
            zos.write(workLogsXlsx);
            zos.closeEntry();

            // 2. DB Change Log
            ZipEntry entry2 = new ZipEntry(DB_CHANGE_LOG_FILENAME);
            zos.putNextEntry(entry2);
            zos.write(dbChangesXlsx);
            zos.closeEntry();

            // 3. Code/File Change Log
            ZipEntry entry3 = new ZipEntry(CODE_FILE_CHANGE_LOG_FILENAME);
            zos.putNextEntry(entry3);
            zos.write(codeChangesXlsx);
            zos.closeEntry();

            zos.finish();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate All Reports ZIP archive", e);
            throw new ApiException("Failed to generate ZIP archive: " + e.getMessage(), e);
        }
    }
}
