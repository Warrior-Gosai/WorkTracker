package com.devworktracker.export.service;

import com.devworktracker.export.dto.AllExportFilter;
import com.devworktracker.export.dto.CodeChangeExportFilter;
import com.devworktracker.export.dto.DbChangeExportFilter;
import com.devworktracker.export.dto.WorkLogExportFilter;

public interface ExportService {

    byte[] exportDailyWorkLog(WorkLogExportFilter filter);

    byte[] exportDbChangeLog(DbChangeExportFilter filter);

    byte[] exportCodeChangeLog(CodeChangeExportFilter filter);

    byte[] exportAllReportsZip(AllExportFilter filter);
}

