package com.devworktracker.codechange.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class UpdateCodeChangeRequest {

    @NotBlank(message = "Change status is required")
    private String changeStatus;

    private String svnCommitId;
    private Instant changeDatetime;
    private String environment = "LOCAL";
    private String remarks;

    public UpdateCodeChangeRequest() {
    }

    public UpdateCodeChangeRequest(String changeStatus, String svnCommitId,
                                   Instant changeDatetime, String environment, String remarks) {
        this.changeStatus = changeStatus;
        this.svnCommitId = svnCommitId;
        this.changeDatetime = changeDatetime;
        this.environment = environment;
        this.remarks = remarks;
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
}
