package com.devworktracker.worklog.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;

public class UpdateWorkLogRequest {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate workDate;

    private String environment;

    @NotBlank(message = "Work type is required")
    private String workType;

    @NotBlank(message = "Task requirement is required")
    private String taskRequirement;

    private String workDescription;

    private String purposeReason;

    private String technologyArea;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime endTime;

    private String status;

    private String problemBlocker;

    private String solutionResolution;

    private String testingVerification;

    private String resultOutcome;

    private String pendingNextAction;

    private String notesRemarks;

    public UpdateWorkLogRequest() {
    }

    public UpdateWorkLogRequest(LocalDate workDate, String environment, String workType,
                                String taskRequirement, String workDescription,
                                String purposeReason, String technologyArea, LocalTime startTime,
                                LocalTime endTime, String status, String problemBlocker,
                                String solutionResolution, String testingVerification,
                                String resultOutcome, String pendingNextAction, String notesRemarks) {
        this.workDate = workDate;
        this.environment = environment;
        this.workType = workType;
        this.taskRequirement = taskRequirement;
        this.workDescription = workDescription;
        this.purposeReason = purposeReason;
        this.technologyArea = technologyArea;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.problemBlocker = problemBlocker;
        this.solutionResolution = solutionResolution;
        this.testingVerification = testingVerification;
        this.resultOutcome = resultOutcome;
        this.pendingNextAction = pendingNextAction;
        this.notesRemarks = notesRemarks;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
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
}

