package com.devworktracker.export.service;

import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.repository.CodeChangeRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ApiException;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.dbchange.repository.DbChangeRepository;
import com.devworktracker.export.dto.WorkLogExportFilter;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.repository.WorkLogRepository;
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
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DailyWorkLogExportService {

    private static final Logger log = LoggerFactory.getLogger(DailyWorkLogExportService.class);
    private static final int NUM_COLUMNS = 22;

    private final WorkLogRepository workLogRepository;
    private final CodeChangeRepository codeChangeRepository;
    private final DbChangeRepository dbChangeRepository;
    private final ExcelTemplateService excelTemplateService;

    public DailyWorkLogExportService(
            WorkLogRepository workLogRepository,
            CodeChangeRepository codeChangeRepository,
            DbChangeRepository dbChangeRepository,
            ExcelTemplateService excelTemplateService) {
        this.workLogRepository = workLogRepository;
        this.codeChangeRepository = codeChangeRepository;
        this.dbChangeRepository = dbChangeRepository;
        this.excelTemplateService = excelTemplateService;
    }

    @Transactional(readOnly = true)
    public byte[] exportToExcel(WorkLogExportFilter filter) {
        validateFilter(filter);

        Specification<WorkLog> spec = buildSpecification(filter);
        Sort sort = Sort.by(Sort.Direction.DESC, "workDate").and(Sort.by(Sort.Direction.DESC, "workLogId"));
        List<WorkLog> workLogs = workLogRepository.findAll(spec, sort);
        log.info("Exporting {} work logs to Excel (scope: {})", workLogs.size(), filter.getScope());

        // Batch fetch related code changes and db changes to avoid N+1 queries
        List<Long> workLogIds = workLogs.stream().map(WorkLog::getWorkLogId).toList();
        Map<Long, String> codeChangeMap = new HashMap<>();
        Map<Long, String> dbChangeMap = new HashMap<>();

        if (!workLogIds.isEmpty()) {
            List<CodeChange> codeChanges = codeChangeRepository.findByWorkLogIdIn(workLogIds);
            codeChangeMap = codeChanges.stream()
                    .collect(Collectors.groupingBy(
                            CodeChange::getWorkLogId,
                            Collectors.mapping(CodeChange::getCodeChangeCode, Collectors.joining(", "))
                    ));

            List<DbChange> dbChanges = dbChangeRepository.findByWorkLogIdIn(workLogIds);
            dbChangeMap = dbChanges.stream()
                    .collect(Collectors.groupingBy(
                            DbChange::getWorkLogId,
                            Collectors.mapping(DbChange::getDbChangeCode, Collectors.joining(", "))
                    ));
        }

        try (XSSFWorkbook workbook = excelTemplateService.loadDailyWorkLogTemplate();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.getSheetAt(0);

            // Capture data cell styles from row 1
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
            for (WorkLog wl : workLogs) {
                Row row = sheet.createRow(rowIdx);
                row.setHeightInPoints(24.0f);

                for (int c = 0; c < NUM_COLUMNS; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellStyle(dataStyles[c]);
                }

                // Col 0: Work ID
                row.getCell(0).setCellValue(wl.getWorkLogCode());

                // Col 1: Date
                if (wl.getWorkDate() != null) {
                    row.getCell(1).setCellValue(wl.getWorkDate());
                }

                // Col 2: Day formula
                row.getCell(2).setCellFormula(String.format("IF(B%d=\"\",\"\",TEXT(B%d,\"dddd\"))", rowIdx + 1, rowIdx + 1));

                // Col 3: Project / Application
                String projectName = "";
                if (wl.getTaskItem() != null && wl.getTaskItem().getProject() != null) {
                    projectName = wl.getTaskItem().getProject().getProjectName();
                }
                row.getCell(3).setCellValue(projectName);

                // Col 4: Module / Feature
                String moduleTitle = (wl.getTaskItem() != null) ? wl.getTaskItem().getTitle() : "";
                row.getCell(4).setCellValue(moduleTitle);

                // Col 5: Task / Requirement
                row.getCell(5).setCellValue(wl.getTaskRequirement() != null ? wl.getTaskRequirement() : "");

                // Col 6: Work Type
                row.getCell(6).setCellValue(wl.getWorkType() != null ? wl.getWorkType() : "");

                // Col 7: Work Description
                row.getCell(7).setCellValue(wl.getWorkDescription() != null ? wl.getWorkDescription() : "");

                // Col 8: Purpose / Reason
                row.getCell(8).setCellValue(wl.getPurposeReason() != null ? wl.getPurposeReason() : "");

                // Col 9: Technology / Area
                row.getCell(9).setCellValue(wl.getTechnologyArea() != null ? wl.getTechnologyArea() : "");

                // Col 10: Start Time
                LocalTime startTime = wl.getStartTime();
                if (startTime != null) {
                    row.getCell(10).setCellValue(startTime.toSecondOfDay() / 86400.0);
                }

                // Col 11: End Time
                LocalTime endTime = wl.getEndTime();
                if (endTime != null) {
                    row.getCell(11).setCellValue(endTime.toSecondOfDay() / 86400.0);
                }

                // Col 12: Total Hours (formula preserved)
                row.getCell(12).setCellFormula(String.format("IF(OR(K%d=\"\",L%d=\"\"),\"\",MOD(L%d-K%d,1)*24)",
                        rowIdx + 1, rowIdx + 1, rowIdx + 1, rowIdx + 1));

                // Col 13: Status
                row.getCell(13).setCellValue(wl.getStatus() != null ? wl.getStatus() : "");

                // Col 14: Problem / Blocker
                row.getCell(14).setCellValue(wl.getProblemBlocker() != null ? wl.getProblemBlocker() : "");

                // Col 15: Solution / Resolution
                row.getCell(15).setCellValue(wl.getSolutionResolution() != null ? wl.getSolutionResolution() : "");

                // Col 16: Testing / Verification
                row.getCell(16).setCellValue(wl.getTestingVerification() != null ? wl.getTestingVerification() : "");

                // Col 17: Result / Outcome
                row.getCell(17).setCellValue(wl.getResultOutcome() != null ? wl.getResultOutcome() : "");

                // Col 18: Pending / Next Action
                row.getCell(18).setCellValue(wl.getPendingNextAction() != null ? wl.getPendingNextAction() : "");

                // Col 19: Code Change ID(s)
                String ccCodes = codeChangeMap.getOrDefault(wl.getWorkLogId(), "");
                row.getCell(19).setCellValue(ccCodes);

                // Col 20: DB Change ID(s)
                String dbcCodes = dbChangeMap.getOrDefault(wl.getWorkLogId(), "");
                row.getCell(20).setCellValue(dbcCodes);

                // Col 21: Notes / Remarks
                row.getCell(21).setCellValue(wl.getNotesRemarks() != null ? wl.getNotesRemarks() : "");

                rowIdx++;
            }

            // Adjust AutoFilter range
            int lastDataRow = Math.max(0, rowIdx - 1);
            sheet.setAutoFilter(new CellRangeAddress(0, Math.max(1, lastDataRow), 0, NUM_COLUMNS - 1));

            // Tell Excel to recalculate formulas upon opening
            workbook.setForceFormulaRecalculation(true);

            workbook.write(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate Daily Work Log Excel workbook", e);
            throw new ApiException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }

    private void validateFilter(WorkLogExportFilter filter) {
        String scope = filter.getScope();
        if (scope == null || (!scope.equalsIgnoreCase("all") && !scope.equalsIgnoreCase("filtered"))) {
            throw new BadRequestException("Invalid scope: '" + scope + "'. Allowed values: all, filtered");
        }

        LocalDate from = filter.getWorkDateFrom();
        LocalDate to = filter.getWorkDateTo();
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("From date cannot be after to date");
        }
    }

    private Specification<WorkLog> buildSpecification(WorkLogExportFilter filter) {
        if (!"filtered".equalsIgnoreCase(filter.getScope())) {
            return Specification.where(null);
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate codeLike = cb.like(cb.lower(root.get("workLogCode")), pattern);
                Predicate reqLike = cb.like(cb.lower(root.get("taskRequirement")), pattern);
                predicates.add(cb.or(codeLike, reqLike));
            }

            if (filter.getTaskItemId() != null) {
                predicates.add(cb.equal(root.get("taskItemId"), filter.getTaskItemId()));
            }

            if (filter.getProjectId() != null) {
                Join<WorkLog, TaskItem> taskItemJoin = root.join("taskItem", JoinType.LEFT);
                predicates.add(cb.equal(taskItemJoin.get("projectId"), filter.getProjectId()));
            }

            if (filter.getWorkDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("workDate"), filter.getWorkDateFrom()));
            }

            if (filter.getWorkDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("workDate"), filter.getWorkDateTo()));
            }

            if (filter.getEnvironment() != null && !filter.getEnvironment().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("environment"), filter.getEnvironment().trim()));
            }

            if (filter.getWorkType() != null && !filter.getWorkType().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("workType"), filter.getWorkType().trim()));
            }

            if (filter.getStatus() != null && !filter.getStatus().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus().trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
