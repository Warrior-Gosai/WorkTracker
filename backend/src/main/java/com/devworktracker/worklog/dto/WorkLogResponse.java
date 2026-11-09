package com.devworktracker.worklog.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

public class WorkLogResponse {

    private Long workLogId;
    private String workLogCode;

    private Long taskItemId;
    private String taskItemCode;
    private String taskItemTitle;

    private Long projectId;
    private String projectCode;
    private String projectName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate workDate;

    private String day;
    private String environment;
    private String workType;
    private String taskRequirement;
    private String workDescription;
    private String purposeReason;
    private String technologyArea;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private BigDecimal totalHours;
    private String status;

    private String problemBlocker;
    private String solutionResolution;
    private String testingVerification;
    private String resultOutcome;
    private String pendingNextAction;
    private String notesRemarks;

    private List<Long> codeChangeIds = Collections.emptyList();
    private List<Long> dbChangeIds = Collections.emptyList();

    private Instant createdAt;
    private Instant updatedAt;

    public WorkLogResponse() {
    }

    public WorkLogResponse(Long workLogId, String workLogCode, Long taskItemId,
                           String taskItemCode, String taskItemTitle, Long projectId,
                           String projectCode, String projectName, LocalDate workDate,
                           String day, String environment, String workType,
                           String taskRequirement, String workDescription, String purposeReason,
                           String technologyArea, LocalTime startTime, LocalTime endTime,
                           BigDecimal totalHours, String status, String problemBlocker,
                           String solutionResolution, String testingVerification,
                           String resultOutcome, String pendingNextAction, String notesRemarks,
                           List<Long> codeChangeIds, List<Long> dbChangeIds,
                           Instant createdAt, Instant updatedAt) {
        this.workLogId = workLogId;
        this.workLogCode = workLogCode;
        this.taskItemId = taskItemId;
        this.taskItemCode = taskItemCode;
        this.taskItemTitle = taskItemTitle;
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.workDate = workDate;
        this.day = day;
        this.environment = environment;
        this.workType = workType;
        this.taskRequirement = taskRequirement;
        this.workDescription = workDescription;
        this.purposeReason = purposeReason;
        this.technologyArea = technologyArea;
        this.startTime = startTime;
        this.endTime = endTime;
        this.totalHours = totalHours;
        this.status = status;
        this.problemBlocker = problemBlocker;
        this.solutionResolution = solutionResolution;
        this.testingVerification = testingVerification;
        this.resultOutcome = resultOutcome;
        this.pendingNextAction = pendingNextAction;
        this.notesRemarks = notesRemarks;
        this.codeChangeIds = codeChangeIds != null ? codeChangeIds : Collections.emptyList();
        this.dbChangeIds = dbChangeIds != null ? dbChangeIds : Collections.emptyList();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
    }

    public String getWorkLogCode() {
        return workLogCode;
    }

    public void setWorkLogCode(String workLogCode) {
        this.workLogCode = workLogCode;
    }

    public Long getTaskItemId() {
        return taskItemId;
    }

    public void setTaskItemId(Long taskItemId) {
        this.taskItemId = taskItemId;
    }

    public String getTaskItemCode() {
        return taskItemCode;
    }

    public void setTaskItemCode(String taskItemCode) {
        this.taskItemCode = taskItemCode;
    }

    public String getTaskItemTitle() {
        return taskItemTitle;
    }

    public void setTaskItemTitle(String taskItemTitle) {
        this.taskItemTitle = taskItemTitle;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getWorkType() {
        return workType;
    }

    public void setWorkType(String workType) {
        this.workType = workType;
    }

    public String getTaskRequirement() {
        return taskRequirement;
    }

    public void setTaskRequirement(String taskRequirement) {
        this.taskRequirement = taskRequirement;
    }

    public String getWorkDescription() {
        return workDescription;
    }

    public void setWorkDescription(String workDescription) {
        this.workDescription = workDescription;
    }

    public String getPurposeReason() {
        return purposeReason;
    }

    public void setPurposeReason(String purposeReason) {
        this.purposeReason = purposeReason;
    }

    public String getTechnologyArea() {
        return technologyArea;
    }

    public void setTechnologyArea(String technologyArea) {
        this.technologyArea = technologyArea;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(BigDecimal totalHours) {
        this.totalHours = totalHours;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProblemBlocker() {
        return problemBlocker;
    }

    public void setProblemBlocker(String problemBlocker) {
        this.problemBlocker = problemBlocker;
    }

    public String getSolutionResolution() {
        return solutionResolution;
    }

    public void setSolutionResolution(String solutionResolution) {
        this.solutionResolution = solutionResolution;
    }

    public String getTestingVerification() {
        return testingVerification;
    }

    public void setTestingVerification(String testingVerification) {
        this.testingVerification = testingVerification;
    }

    public String getResultOutcome() {
        return resultOutcome;
    }

    public void setResultOutcome(String resultOutcome) {
        this.resultOutcome = resultOutcome;
    }

    public String getPendingNextAction() {
        return pendingNextAction;
    }

    public void setPendingNextAction(String pendingNextAction) {
        this.pendingNextAction = pendingNextAction;
    }

    public String getNotesRemarks() {
        return notesRemarks;
    }

    public void setNotesRemarks(String notesRemarks) {
        this.notesRemarks = notesRemarks;
    }

    public List<Long> getCodeChangeIds() {
        return codeChangeIds;
    }

    public void setCodeChangeIds(List<Long> codeChangeIds) {
        this.codeChangeIds = codeChangeIds != null ? codeChangeIds : Collections.emptyList();
    }

    public List<Long> getDbChangeIds() {
        return dbChangeIds;
    }

    public void setDbChangeIds(List<Long> dbChangeIds) {
        this.dbChangeIds = dbChangeIds != null ? dbChangeIds : Collections.emptyList();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
