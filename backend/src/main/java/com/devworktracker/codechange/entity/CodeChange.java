package com.devworktracker.codechange.entity;

import com.devworktracker.worklog.entity.WorkLog;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "code_change")
public class CodeChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_change_id", nullable = false, updatable = false)
    private Long codeChangeId;

    @Column(name = "code_change_code", nullable = false, unique = true, length = 30, updatable = false)
    private String codeChangeCode;

    @Column(name = "work_log_id", nullable = false, updatable = false)
    private Long workLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_log_id", insertable = false, updatable = false)
    private WorkLog workLog;

    @Column(name = "change_status", nullable = false, length = 20)
    private String changeStatus = "UNCOMMITTED";

    @Column(name = "svn_commit_id", length = 150)
    private String svnCommitId;

    @Column(name = "change_datetime", nullable = false)
    private Instant changeDatetime;

    @Column(name = "environment", nullable = false, length = 20)
    private String environment = "LOCAL";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @OneToMany(mappedBy = "codeChange", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CodeChangeFile> files = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CodeChange() {
    }

    public CodeChange(String codeChangeCode, Long workLogId, String changeStatus,
                      String svnCommitId, Instant changeDatetime, String environment,
                      String remarks) {
        this.codeChangeCode = codeChangeCode;
        this.workLogId = workLogId;
        this.changeStatus = changeStatus != null ? changeStatus : "UNCOMMITTED";
        this.svnCommitId = svnCommitId;
        this.changeDatetime = changeDatetime != null ? changeDatetime : Instant.now();
        this.environment = environment != null ? environment : "LOCAL";
        this.remarks = remarks;
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
        if (this.changeDatetime == null) {
            this.changeDatetime = Instant.now();
        }
        if (this.environment == null) {
            this.environment = "LOCAL";
        }
        if (this.changeStatus == null) {
            this.changeStatus = "UNCOMMITTED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addFile(CodeChangeFile file) {
        files.add(file);
        file.setCodeChange(this);
    }

    public void removeFile(CodeChangeFile file) {
        files.remove(file);
        file.setCodeChange(null);
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

    public Long getWorkLogId() {
        return workLogId;
    }

    public void setWorkLogId(Long workLogId) {
        this.workLogId = workLogId;
    }

    public WorkLog getWorkLog() {
        return workLog;
    }

    public void setWorkLog(WorkLog workLog) {
        this.workLog = workLog;
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

    public List<CodeChangeFile> getFiles() {
        return files;
    }

    public void setFiles(List<CodeChangeFile> files) {
        this.files = files;
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
