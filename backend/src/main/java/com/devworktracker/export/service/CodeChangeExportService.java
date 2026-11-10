package com.devworktracker.export.service;

import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.entity.CodeChangeFile;
import com.devworktracker.codechange.repository.CodeChangeRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ApiException;
import com.devworktracker.common.util.DateTimeUtils;
import com.devworktracker.export.dto.CodeChangeExportFilter;
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
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodeChangeExportService {

    private static final Logger log = LoggerFactory.getLogger(CodeChangeExportService.class);
    private static final int NUM_COLUMNS = 13;

    private final CodeChangeRepository codeChangeRepository;
    private final ExcelTemplateService excelTemplateService;

    public CodeChangeExportService(
            CodeChangeRepository codeChangeRepository,
            ExcelTemplateService excelTemplateService) {
        this.codeChangeRepository = codeChangeRepository;
        this.excelTemplateService = excelTemplateService;
    }

    @Transactional(readOnly = true)
    public byte[] exportToExcel(CodeChangeExportFilter filter) {
        validateFilter(filter);

        Specification<CodeChange> spec = buildSpecification(filter);
        Sort sort = Sort.by(Sort.Direction.DESC, "changeDatetime").and(Sort.by(Sort.Direction.DESC, "codeChangeId"));
        List<CodeChange> codeChanges = codeChangeRepository.findAll(spec, sort);
        log.info("Exporting {} code changes to Excel (scope: {})", codeChanges.size(), filter.getScope());

        try (XSSFWorkbook workbook = excelTemplateService.loadCodeFileChangeLogTemplate();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.getSheetAt(0);

            // Enhance Header row with Column 11: SVN Commit ID and Column 12: Change Status
            Row headerRow = sheet.getRow(0);
            if (headerRow != null) {
                CellStyle headerStyle = (headerRow.getCell(10) != null)
                        ? headerRow.getCell(10).getCellStyle()
                        : workbook.createCellStyle();

                Cell col11Header = headerRow.createCell(11);
                col11Header.setCellValue("SVN Commit ID");
                col11Header.setCellStyle(headerStyle);

                Cell col12Header = headerRow.createCell(12);
                col12Header.setCellValue("Change Status");
                col12Header.setCellStyle(headerStyle);

                sheet.setColumnWidth(11, 20 * 256);
                sheet.setColumnWidth(12, 18 * 256);
            }

            // Capture data styles from row 1
            Row sampleRow = sheet.getRow(1);
            CellStyle[] dataStyles = new CellStyle[NUM_COLUMNS];
            for (int c = 0; c < 11; c++) {
                if (sampleRow != null && sampleRow.getCell(c) != null) {
                    dataStyles[c] = sampleRow.getCell(c).getCellStyle();
                } else {
                    dataStyles[c] = workbook.createCellStyle();
                }
            }
            // Use col 10 style for cols 11 and 12
            dataStyles[11] = dataStyles[10];
            dataStyles[12] = dataStyles[10];

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
            for (CodeChange cc : codeChanges) {
                Row row = sheet.createRow(rowIdx);
                List<CodeChangeFile> files = cc.getFiles() != null ? cc.getFiles() : List.of();
                float rowHeight = Math.max(24.0f, Math.max(1, files.size()) * 18.0f);
                row.setHeightInPoints(rowHeight);

                for (int c = 0; c < NUM_COLUMNS; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellStyle(dataStyles[c]);
                }

                // Col 0: Code Change ID
                row.getCell(0).setCellValue(cc.getCodeChangeCode());

                // Col 1: Work ID
                String workLogCode = (cc.getWorkLog() != null) ? cc.getWorkLog().getWorkLogCode() : "";
                row.getCell(1).setCellValue(workLogCode);

                // Col 2: Date
                if (cc.getChangeDatetime() != null) {
                    LocalDate date = cc.getChangeDatetime().atZone(DateTimeUtils.APP_ZONE).toLocalDate();
                    row.getCell(2).setCellValue(date);
                }

                // Col 3: Project / Application
                String projectName = "";
                if (cc.getWorkLog() != null
                        && cc.getWorkLog().getTaskItem() != null
                        && cc.getWorkLog().getTaskItem().getProject() != null) {
                    projectName = cc.getWorkLog().getTaskItem().getProject().getProjectName();
                }
                row.getCell(3).setCellValue(projectName);

                // Multi-file aggregation for cols 4..9
                if (!files.isEmpty()) {
                    row.getCell(4).setCellValue(files.stream()
                            .map(f -> f.getLayer() != null ? f.getLayer() : "")
                            .collect(Collectors.joining("\n")));

                    row.getCell(5).setCellValue(files.stream()
                            .map(f -> f.getTechnology() != null ? f.getTechnology() : "")
                            .collect(Collectors.joining("\n")));

                    row.getCell(6).setCellValue(files.stream()
                            .map(f -> f.getFilePath() != null ? f.getFilePath() : "")
                            .collect(Collectors.joining("\n")));

                    row.getCell(7).setCellValue(files.stream()
                            .map(f -> f.getWhatChanged() != null ? f.getWhatChanged() : "")
                            .collect(Collectors.joining("\n")));

                    row.getCell(8).setCellValue(files.stream()
                            .map(f -> f.getWhyChanged() != null ? f.getWhyChanged() : "")
                            .collect(Collectors.joining("\n")));

                    row.getCell(9).setCellValue(files.stream()
                            .map(f -> f.getAffectedFiles() != null ? f.getAffectedFiles() : "")
                            .collect(Collectors.joining("\n")));
                } else {
                    row.getCell(4).setCellValue("");
                    row.getCell(5).setCellValue("");
                    row.getCell(6).setCellValue("");
                    row.getCell(7).setCellValue("");
                    row.getCell(8).setCellValue("");
                    row.getCell(9).setCellValue("");
                }

                // Col 10: Remarks (parent remarks + file remarks)
                String parentRemarks = cc.getRemarks() != null ? cc.getRemarks().trim() : "";
                List<String> fileRemarks = files.stream()
                        .map(f -> f.getRemarks() != null ? f.getRemarks().trim() : "")
                        .filter(s -> !s.isEmpty())
                        .toList();
                String combinedRemarks;
                if (!parentRemarks.isEmpty() && !fileRemarks.isEmpty()) {
                    combinedRemarks = parentRemarks + "\n" + String.join("\n", fileRemarks);
                } else if (!fileRemarks.isEmpty()) {
                    combinedRemarks = String.join("\n", fileRemarks);
                } else {
                    combinedRemarks = parentRemarks;
                }
                row.getCell(10).setCellValue(combinedRemarks);

                // Col 11: SVN Commit ID
                row.getCell(11).setCellValue(cc.getSvnCommitId() != null ? cc.getSvnCommitId() : "");

                // Col 12: Change Status
                row.getCell(12).setCellValue(cc.getChangeStatus() != null ? cc.getChangeStatus() : "");

                rowIdx++;
            }

            // Adjust AutoFilter range across all 13 columns
            int lastDataRow = Math.max(0, rowIdx - 1);
            sheet.setAutoFilter(new CellRangeAddress(0, Math.max(1, lastDataRow), 0, NUM_COLUMNS - 1));

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Code File Change Log Excel workbook", e);
            throw new ApiException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }

    private void validateFilter(CodeChangeExportFilter filter) {
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

    private Specification<CodeChange> buildSpecification(CodeChangeExportFilter filter) {
        if (!"filtered".equalsIgnoreCase(filter.getScope())) {
            return Specification.where(null);
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate codeLike = cb.like(cb.lower(root.get("codeChangeCode")), pattern);
                Predicate commitLike = cb.like(cb.lower(cb.coalesce(root.get("svnCommitId"), "")), pattern);
                predicates.add(cb.or(codeLike, commitLike));
            }

            if (filter.getWorkLogId() != null) {
                predicates.add(cb.equal(root.get("workLogId"), filter.getWorkLogId()));
            }

            if (filter.getTaskItemId() != null) {
                Join<Object, Object> workLogJoin = root.join("workLog", JoinType.LEFT);
                predicates.add(cb.equal(workLogJoin.get("taskItemId"), filter.getTaskItemId()));
            }

            if (filter.getProjectId() != null) {
                Join<Object, Object> workLogJoin = root.join("workLog", JoinType.LEFT);
                Join<Object, Object> taskItemJoin = workLogJoin.join("taskItem", JoinType.LEFT);
                predicates.add(cb.equal(taskItemJoin.get("projectId"), filter.getProjectId()));
            }

            if (filter.getChangeStatus() != null && !filter.getChangeStatus().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("changeStatus"), filter.getChangeStatus().trim().toUpperCase()));
            }

            if (filter.getEnvironment() != null && !filter.getEnvironment().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("environment"), filter.getEnvironment().trim().toUpperCase()));
            }

            if (filter.getDateFrom() != null) {
                Instant fromInstant = filter.getDateFrom().atStartOfDay(DateTimeUtils.APP_ZONE).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("changeDatetime"), fromInstant));
            }

            if (filter.getDateTo() != null) {
                Instant toInstant = filter.getDateTo().plusDays(1).atStartOfDay(DateTimeUtils.APP_ZONE).toInstant();
                predicates.add(cb.lessThan(root.get("changeDatetime"), toInstant));
            }

            if (filter.getSvnCommitId() != null && !filter.getSvnCommitId().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("svnCommitId"), filter.getSvnCommitId().trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
