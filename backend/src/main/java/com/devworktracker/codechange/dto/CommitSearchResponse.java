package com.devworktracker.codechange.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CommitSearchResponse {

    private Long codeChangeId;
    private String codeChangeCode;
    private String svnCommitId;
    private Instant changeDatetime;
    private String environment;
    private String changeStatus;
    private String remarks;

    private Long workLogId;
    private String workLogCode;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate workDate;

    private String taskRequirement;

    private Long taskItemId;
    private String taskItemCode;
    private String taskItemTitle;

    private Long projectId;
    private String projectCode;
    private String projectName;

    private List<CodeChangeFileDto> files = new ArrayList<>();
    private List<Object> dbChanges = Collections.emptyList();

    public CommitSearchResponse() {
    }

    public CommitSearchResponse(Long codeChangeId, String codeChangeCode, String svnCommitId,
                                Instant changeDatetime, String environment, String changeStatus,
                                String remarks, Long workLogId, String workLogCode,
                                LocalDate workDate, String taskRequirement, Long taskItemId,
                                String taskItemCode, String taskItemTitle, Long projectId,
                                String projectCode, String projectName,
                                List<CodeChangeFileDto> files, List<Object> dbChanges) {
        this.codeChangeId = codeChangeId;
        this.codeChangeCode = codeChangeCode;
        this.svnCommitId = svnCommitId;
        this.changeDatetime = changeDatetime;
        this.environment = environment;
        this.changeStatus = changeStatus;
        this.remarks = remarks;
        this.workLogId = workLogId;
        this.workLogCode = workLogCode;
        this.workDate = workDate;
        this.taskRequirement = taskRequirement;
        this.taskItemId = taskItemId;
        this.taskItemCode = taskItemCode;
        this.taskItemTitle = taskItemTitle;
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.files = files != null ? files : new ArrayList<>();
        this.dbChanges = dbChanges != null ? dbChanges : Collections.emptyList();
    }

    public Long getCodeChangeId() {
        return codeChangeId;
    }

    public void setCodeChangeId(Long codeChangeId) {
        this.codeChangeId = codeChangeId;
    }

    public String getCodeChangeCode() {
        return codeChangeCode;
    }

    public void setCodeChangeCode(String codeChangeCode) {
        this.codeChangeCode = codeChangeCode;
    }

    public String getSvnCommitId() {
        return svnCommitId;
    }

    public void setSvnCommitId(String svnCommitId) {
        this.svnCommitId = svnCommitId;
    }

    public Instant getChangeDatetime() {
        return changeDatetime;
    }

    public void setChangeDatetime(Instant changeDatetime) {
        this.changeDatetime = changeDatetime;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getChangeStatus() {
        return changeStatus;
    }

    public void setChangeStatus(String changeStatus) {
        this.changeStatus = changeStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
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

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public String getTaskRequirement() {
        return taskRequirement;
    }

    public void setTaskRequirement(String taskRequirement) {
        this.taskRequirement = taskRequirement;
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

    public List<CodeChangeFileDto> getFiles() {
        return files;
    }

    public void setFiles(List<CodeChangeFileDto> files) {
        this.files = files;
    }

    public List<Object> getDbChanges() {
        return dbChanges;
    }

    public void setDbChanges(List<Object> dbChanges) {
        this.dbChanges = dbChanges;
    }
}
