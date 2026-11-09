package com.devworktracker.codechange.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "code_change_file")
public class CodeChangeFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_change_file_id", nullable = false, updatable = false)
    private Long codeChangeFileId;

    @Column(name = "code_change_id", nullable = false)
    private Long codeChangeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code_change_id", insertable = false, updatable = false)
    private CodeChange codeChange;

    @Column(name = "layer", length = 50)
    private String layer;

    @Column(name = "technology", length = 100)
    private String technology;

    @Column(name = "file_path", nullable = false, columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "what_changed", columnDefinition = "TEXT")
    private String whatChanged;

    @Column(name = "why_changed", columnDefinition = "TEXT")
    private String whyChanged;

    @Column(name = "affected_files", columnDefinition = "TEXT")
    private String affectedFiles;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public CodeChangeFile() {
    }

    public CodeChangeFile(Long codeChangeId, String layer, String technology,
                          String filePath, String whatChanged, String whyChanged,
                          String affectedFiles, String remarks) {
        this.codeChangeId = codeChangeId;
        this.layer = layer;
        this.technology = technology;
        this.filePath = filePath;
        this.whatChanged = whatChanged;
        this.whyChanged = whyChanged;
        this.affectedFiles = affectedFiles;
        this.remarks = remarks;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public Long getCodeChangeFileId() {
        return codeChangeFileId;
    }

    public void setCodeChangeFileId(Long codeChangeFileId) {
        this.codeChangeFileId = codeChangeFileId;
    }

    public Long getCodeChangeId() {
        return codeChangeId;
    }

    public void setCodeChangeId(Long codeChangeId) {
        this.codeChangeId = codeChangeId;
    }

    public CodeChange getCodeChange() {
        return codeChange;
    }

    public void setCodeChange(CodeChange codeChange) {
        this.codeChange = codeChange;
        if (codeChange != null) {
            this.codeChangeId = codeChange.getCodeChangeId();
        }
    }

    public String getLayer() {
        return layer;
    }

    public void setLayer(String layer) {
        this.layer = layer;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getWhatChanged() {
        return whatChanged;
    }

    public void setWhatChanged(String whatChanged) {
        this.whatChanged = whatChanged;
    }

    public String getWhyChanged() {
        return whyChanged;
    }

    public void setWhyChanged(String whyChanged) {
        this.whyChanged = whyChanged;
    }

    public String getAffectedFiles() {
        return affectedFiles;
    }

    public void setAffectedFiles(String affectedFiles) {
        this.affectedFiles = affectedFiles;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
