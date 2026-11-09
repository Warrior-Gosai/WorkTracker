package com.devworktracker.worklog.entity;

import com.devworktracker.taskitem.entity.TaskItem;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "work_log")
public class WorkLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "work_log_id", nullable = false, updatable = false)
    private Long workLogId;

    @Column(name = "work_log_code", nullable = false, unique = true, length = 30, updatable = false)
    private String workLogCode;

    @Column(name = "task_item_id", nullable = false, updatable = false)
    private Long taskItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_item_id", insertable = false, updatable = false)
    private TaskItem taskItem;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "environment", nullable = false, length = 20)
    private String environment = "LOCAL";

    @Column(name = "work_type", nullable = false, length = 40)
    private String workType;

    @Column(name = "task_requirement", nullable = false, columnDefinition = "TEXT")
    private String taskRequirement;

    @Column(name = "work_description", columnDefinition = "TEXT")
    private String workDescription;

    @Column(name = "purpose_reason", columnDefinition = "TEXT")
    private String purposeReason;

    @Column(name = "technology_area", length = 200)
    private String technologyArea;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "IN_PROGRESS";

    @Column(name = "problem_blocker", columnDefinition = "TEXT")
    private String problemBlocker;

    @Column(name = "solution_resolution", columnDefinition = "TEXT")
    private String solutionResolution;

    @Column(name = "testing_verification", columnDefinition = "TEXT")
    private String testingVerification;

    @Column(name = "result_outcome", columnDefinition = "TEXT")
    private String resultOutcome;

    @Column(name = "pending_next_action", columnDefinition = "TEXT")
    private String pendingNextAction;

    @Column(name = "notes_remarks", columnDefinition = "TEXT")
    private String notesRemarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public WorkLog() {
    }

    public WorkLog(String workLogCode, Long taskItemId, LocalDate workDate, String environment,
                   String workType, String taskRequirement, String workDescription,
                   String purposeReason, String technologyArea, LocalTime startTime,
                   LocalTime endTime, String status, String problemBlocker,
                   String solutionResolution, String testingVerification,
                   String resultOutcome, String pendingNextAction, String notesRemarks) {
        this.workLogCode = workLogCode;
        this.taskItemId = taskItemId;
        this.workDate = workDate != null ? workDate : LocalDate.now();
        this.environment = environment != null ? environment : "LOCAL";
        this.workType = workType;
        this.taskRequirement = taskRequirement;
        this.workDescription = workDescription;
        this.purposeReason = purposeReason;
        this.technologyArea = technologyArea;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status != null ? status : "IN_PROGRESS";
        this.problemBlocker = problemBlocker;
        this.solutionResolution = solutionResolution;
        this.testingVerification = testingVerification;
        this.resultOutcome = resultOutcome;
        this.pendingNextAction = pendingNextAction;
        this.notesRemarks = notesRemarks;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
        if (this.workDate == null) {
            this.workDate = LocalDate.now();
        }
        if (this.environment == null) {
            this.environment = "LOCAL";
        }
        if (this.status == null) {
            this.status = "IN_PROGRESS";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
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

    public TaskItem getTaskItem() {
        return taskItem;
    }

    public void setTaskItem(TaskItem taskItem) {
        this.taskItem = taskItem;
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
