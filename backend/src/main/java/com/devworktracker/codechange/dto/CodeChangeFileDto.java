package com.devworktracker.codechange.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class CodeChangeFileDto {

    private Long codeChangeFileId;
    private Long codeChangeId;
    private String layer;
    private String technology;

    @NotBlank(message = "File path is required")
    private String filePath;

    private String whatChanged;
    private String whyChanged;
    private String affectedFiles;
    private String remarks;
    private Instant createdAt;

    public CodeChangeFileDto() {
    }

    public CodeChangeFileDto(Long codeChangeFileId, Long codeChangeId, String layer,
                             String technology, String filePath, String whatChanged,
                             String whyChanged, String affectedFiles, String remarks,
                             Instant createdAt) {
        this.codeChangeFileId = codeChangeFileId;
        this.codeChangeId = codeChangeId;
        this.layer = layer;
        this.technology = technology;
        this.filePath = filePath;
        this.whatChanged = whatChanged;
        this.whyChanged = whyChanged;
        this.affectedFiles = affectedFiles;
        this.remarks = remarks;
        this.createdAt = createdAt;
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
