package com.devworktracker.taskitem.entity;

import com.devworktracker.project.entity.Project;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "task_item")
public class TaskItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_item_id", nullable = false, updatable = false)
    private Long taskItemId;

    @Column(name = "task_item_code", nullable = false, unique = true, length = 30, updatable = false)
    private String taskItemCode;

    @Column(name = "project_id", nullable = false, updatable = false)
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    private Project project;

    @Column(name = "task_type", nullable = false, length = 40)
    private String taskType;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM";

    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "is_active", nullable = false)
    private Short isActive = 1;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public TaskItem() {
    }

    public TaskItem(String taskItemCode, Long projectId, String taskType, String title,
                    String description, String priority, String status, Short isActive,
                    Instant completedAt, String remarks) {
        this.taskItemCode = taskItemCode;
        this.projectId = projectId;
        this.taskType = taskType;
        this.title = title;
        this.description = description;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "OPEN";
        this.isActive = isActive != null ? isActive : 1;
        this.completedAt = completedAt;
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
        if (this.priority == null) {
            this.priority = "MEDIUM";
        }
        if (this.status == null) {
            this.status = "OPEN";
        }
        if (this.isActive == null) {
            this.isActive = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Short getIsActive() {
        return isActive;
    }

    public void setIsActive(Short isActive) {
        this.isActive = isActive;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

