package com.devworktracker.export.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ApiException;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.dbchange.repository.DbChangeRepository;
import com.devworktracker.export.dto.DbChangeExportFilter;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DbChangeExportService {

    private static final Logger log = LoggerFactory.getLogger(DbChangeExportService.class);
    private static final int NUM_COLUMNS = 12;

    private final DbChangeRepository dbChangeRepository;
    private final ExcelTemplateService excelTemplateService;

    public DbChangeExportService(
            DbChangeRepository dbChangeRepository,
            ExcelTemplateService excelTemplateService) {
        this.dbChangeRepository = dbChangeRepository;
        this.excelTemplateService = excelTemplateService;
    }

    @Transactional(readOnly = true)
    public byte[] exportToExcel(DbChangeExportFilter filter) {
        validateFilter(filter);

        Specification<DbChange> spec = buildSpecification(filter);
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "dbChangeId"));
        List<DbChange> dbChanges = dbChangeRepository.findAll(spec, sort);
        log.info("Exporting {} DB changes to Excel (scope: {})", dbChanges.size(), filter.getScope());

        try (XSSFWorkbook workbook = excelTemplateService.loadDbChangeLogTemplate();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.getSheetAt(0);

            // Capture data styles from row 1
            Row sampleRow = sheet.getRow(1);
            CellStyle[] dataStyles = new CellStyle[NUM_COLUMNS];
            for (int c = 0; c < NUM_COLUMNS; c++) {
                if (sampleRow != null && sampleRow.getCell(c) != null) {
                    dataStyles[c] = sampleRow.getCell(c).getCellStyle();
                } else {
                    dataStyles[c] = workbook.createCellStyle();
                }
            }

            // Remove existing template rows starting from row 1
            int lastRowNum = sheet.getLastRowNum();
            for (int r = lastRowNum; r >= 1; r--) {
                Row row = sheet.getRow(r);
                if (row != null) {
                    sheet.removeRow(row);
                }
            }

            // Populate data rows
            int rowIdx = 1;
            for (DbChange dbc : dbChanges) {
                Row row = sheet.createRow(rowIdx);
                row.setHeightInPoints(24.0f);

                for (int c = 0; c < NUM_COLUMNS; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellStyle(dataStyles[c]);
                }

                // Col 0: DB Change ID
                row.getCell(0).setCellValue(dbc.getDbChangeCode());

                // Col 1: Work ID
                String workLogCode = (dbc.getWorkLog() != null) ? dbc.getWorkLog().getWorkLogCode() : "";
                row.getCell(1).setCellValue(workLogCode);

                // Col 2: Date
                if (dbc.getWorkLog() != null && dbc.getWorkLog().getWorkDate() != null) {
                    row.getCell(2).setCellValue(dbc.getWorkLog().getWorkDate());
                }

                // Col 3: Project
                String projectName = "";
                if (dbc.getWorkLog() != null
                        && dbc.getWorkLog().getTaskItem() != null
                        && dbc.getWorkLog().getTaskItem().getProject() != null) {
                    projectName = dbc.getWorkLog().getTaskItem().getProject().getProjectName();
                }
                row.getCell(3).setCellValue(projectName);

                // Col 4: Environment
                row.getCell(4).setCellValue(dbc.getEnvironment() != null ? dbc.getEnvironment() : "");

                // Col 5: Database
                row.getCell(5).setCellValue(dbc.getDatabaseName() != null ? dbc.getDatabaseName() : "");

                // Col 6: Object Type
                row.getCell(6).setCellValue(dbc.getObjectType() != null ? dbc.getObjectType() : "");

                // Col 7: Object Name
                row.getCell(7).setCellValue(dbc.getObjectName() != null ? dbc.getObjectName() : "");

                // Col 8: What Changed
                row.getCell(8).setCellValue(dbc.getWhatChanged() != null ? dbc.getWhatChanged() : "");

                // Col 9: Why Changed
                row.getCell(9).setCellValue(dbc.getWhyChanged() != null ? dbc.getWhyChanged() : "");

                // Col 10: Affected Object
                row.getCell(10).setCellValue(dbc.getAffectedObject() != null ? dbc.getAffectedObject() : "");

                // Col 11: Remarks
                row.getCell(11).setCellValue(dbc.getRemarks() != null ? dbc.getRemarks() : "");

                rowIdx++;
            }

            // Adjust AutoFilter range
            int lastDataRow = Math.max(0, rowIdx - 1);
            sheet.setAutoFilter(new CellRangeAddress(0, Math.max(1, lastDataRow), 0, NUM_COLUMNS - 1));

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate DB Change Log Excel workbook", e);
            throw new ApiException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }

    private void validateFilter(DbChangeExportFilter filter) {
        String scope = filter.getScope();
        if (scope == null || (!scope.equalsIgnoreCase("all") && !scope.equalsIgnoreCase("filtered"))) {
            throw new BadRequestException("Invalid scope: '" + scope + "'. Allowed values: all, filtered");
        }

        LocalDate from = filter.getDateFrom();
        LocalDate to = filter.getDateTo();
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("From date cannot be after to date");
        }
    }

    private Specification<DbChange> buildSpecification(DbChangeExportFilter filter) {
        if (!"filtered".equalsIgnoreCase(filter.getScope())) {
            return Specification.where(null);
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Object, Object> workLogJoin = null;

            if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate codeLike = cb.like(cb.lower(root.get("dbChangeCode")), pattern);
                Predicate objNameLike = cb.like(cb.lower(root.get("objectName")), pattern);
                Predicate dbNameLike = cb.like(cb.lower(root.get("databaseName")), pattern);
                Predicate whyLike = cb.like(cb.lower(cb.coalesce(root.get("whyChanged"), "")), pattern);
                Predicate whatLike = cb.like(cb.lower(cb.coalesce(root.get("whatChanged"), "")), pattern);
                Predicate affectedLike = cb.like(cb.lower(cb.coalesce(root.get("affectedObject"), "")), pattern);
                Predicate remarksLike = cb.like(cb.lower(cb.coalesce(root.get("remarks"), "")), pattern);

                workLogJoin = root.join("workLog", JoinType.LEFT);
                Predicate wlCodeLike = cb.like(cb.lower(workLogJoin.get("workLogCode")), pattern);

                Join<Object, Object> taskItemJoin = workLogJoin.join("taskItem", JoinType.LEFT);
                Predicate taskCodeLike = cb.like(cb.lower(taskItemJoin.get("taskItemCode")), pattern);

                Join<Object, Object> projectJoin = taskItemJoin.join("project", JoinType.LEFT);
                Predicate prjCodeLike = cb.like(cb.lower(projectJoin.get("projectCode")), pattern);
                Predicate prjNameLike = cb.like(cb.lower(projectJoin.get("projectName")), pattern);

                predicates.add(cb.or(
                        codeLike, objNameLike, dbNameLike, whyLike, whatLike,
                        affectedLike, remarksLike, wlCodeLike, taskCodeLike, prjCodeLike, prjNameLike
                ));
            }

            if (filter.getWorkLogId() != null) {
                predicates.add(cb.equal(root.get("workLogId"), filter.getWorkLogId()));
            }

            if (filter.getTaskItemId() != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                predicates.add(cb.equal(workLogJoin.get("taskItemId"), filter.getTaskItemId()));
            }

            if (filter.getProjectId() != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                Join<Object, Object> taskItemJoin = workLogJoin.join("taskItem", JoinType.LEFT);
                predicates.add(cb.equal(taskItemJoin.get("projectId"), filter.getProjectId()));
            }

            if (filter.getDateFrom() != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                predicates.add(cb.greaterThanOrEqualTo(workLogJoin.get("workDate"), filter.getDateFrom()));
            }

            if (filter.getDateTo() != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                predicates.add(cb.lessThanOrEqualTo(workLogJoin.get("workDate"), filter.getDateTo()));
            }

            if (filter.getEnvironment() != null && !filter.getEnvironment().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("environment"), filter.getEnvironment().trim().toUpperCase()));
            }

            if (filter.getDatabaseName() != null && !filter.getDatabaseName().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("databaseName"), filter.getDatabaseName().trim()));
            }

            if (filter.getObjectType() != null && !filter.getObjectType().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("objectType"), filter.getObjectType().trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
