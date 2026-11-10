package com.devworktracker.export.service;

import com.devworktracker.common.exception.ApiException;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class ExcelTemplateService {

    private static final Logger log = LoggerFactory.getLogger(ExcelTemplateService.class);

    public static final String DAILY_WORK_LOG_TEMPLATE = "/excel-templates/Daily_Work_Log.xlsx";
    public static final String DB_CHANGE_LOG_TEMPLATE = "/excel-templates/Database_Change_Log.xlsx";
    public static final String CODE_FILE_CHANGE_LOG_TEMPLATE = "/excel-templates/Code_File_Change_Log.xlsx";

    public XSSFWorkbook loadDailyWorkLogTemplate() {
        return loadTemplate(DAILY_WORK_LOG_TEMPLATE);
    }

    public XSSFWorkbook loadDbChangeLogTemplate() {
        return loadTemplate(DB_CHANGE_LOG_TEMPLATE);
    }

    public XSSFWorkbook loadCodeFileChangeLogTemplate() {
        return loadTemplate(CODE_FILE_CHANGE_LOG_TEMPLATE);
    }

    private XSSFWorkbook loadTemplate(String resourcePath) {
        log.debug("Loading Excel template from classpath: {}", resourcePath);
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) {
            log.error("Excel template not found at: {}", resourcePath);
            throw new ApiException("Excel template resource not found: " + resourcePath);
        }
        try {
            return new XSSFWorkbook(is);
        } catch (Exception e) {
            log.error("Failed to parse Excel template: {}", resourcePath, e);
            throw new ApiException("Failed to read Excel template: " + e.getMessage(), e);
        }
    }
}
