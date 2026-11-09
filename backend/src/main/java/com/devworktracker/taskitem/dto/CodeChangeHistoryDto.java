package com.devworktracker.taskitem.dto;

import java.time.Instant;

public class CodeChangeHistoryDto {

    private Long codeChangeId;
    private String codeChangeCode;
    private String changeStatus;
    private String svnCommitId;
    private Instant changeDatetime;
    private String environment;
    private String remarks;

    public CodeChangeHistoryDto() {
    }

    public CodeChangeHistoryDto(Long codeChangeId, String codeChangeCode, String changeStatus, String svnCommitId, Instant changeDatetime, String environment, String remarks) {
        this.codeChangeId = codeChangeId;
        this.codeChangeCode = codeChangeCode;
        this.changeStatus = changeStatus;
        this.svnCommitId = svnCommitId;
        this.changeDatetime = changeDatetime;
        this.environment = environment;
        this.remarks = remarks;
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

