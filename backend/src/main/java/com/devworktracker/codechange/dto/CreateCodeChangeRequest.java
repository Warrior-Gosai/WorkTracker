package com.devworktracker.codechange.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CreateCodeChangeRequest {

    @NotNull(message = "Work log ID is required")
    private Long workLogId;

    @NotBlank(message = "Change status is required")
    private String changeStatus = "UNCOMMITTED";

    private String svnCommitId;
    private Instant changeDatetime;
    private String environment = "LOCAL";
    private String remarks;

    private List<CodeChangeFileDto> files = new ArrayList<>();

    public CreateCodeChangeRequest() {
    }

    public CreateCodeChangeRequest(Long workLogId, String changeStatus, String svnCommitId,
                                   Instant changeDatetime, String environment, String remarks,
                                   List<CodeChangeFileDto> files) {
        this.workLogId = workLogId;
        this.changeStatus = changeStatus;
        this.svnCommitId = svnCommitId;
        this.changeDatetime = changeDatetime;
        this.environment = environment;
        this.remarks = remarks;
        this.files = files != null ? files : new ArrayList<>();
    }

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
    }

    public String getChangeStatus() {
        return changeStatus;
    }

    public void setChangeStatus(String changeStatus) {
        this.changeStatus = changeStatus;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<CodeChangeFileDto> getFiles() {
        return files;
    }

    public void setFiles(List<CodeChangeFileDto> files) {
        this.files = files != null ? files : new ArrayList<>();
    }
}
