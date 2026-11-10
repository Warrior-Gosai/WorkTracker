package com.devworktracker.pendingtask.entity;

import com.devworktracker.project.entity.Project;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "pending_task")
public class PendingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pending_task_id", nullable = false, updatable = false)
    private Long pendingTaskId;

    @Column(name = "pending_task_code", nullable = false, unique = true, length = 30, updatable = false)
    private String pendingTaskCode;

    @Column(name = "project_id", nullable = false, updatable = false)
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    private Project project;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM";

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public PendingTask() {
    }

    public PendingTask(String pendingTaskCode, Long projectId, String title, String description,
                       String priority, String status, LocalDate dueDate, Instant completedAt, String remarks) {
        this.pendingTaskCode = pendingTaskCode;
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "PENDING";
        this.dueDate = dueDate;
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
            this.status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getPendingTaskId() {
        return pendingTaskId;
    }

    public void setPendingTaskId(Long pendingTaskId) {
        this.pendingTaskId = pendingTaskId;
    }

    public String getPendingTaskCode() {
        return pendingTaskCode;
    }

    public void setPendingTaskCode(String pendingTaskCode) {
        this.pendingTaskCode = pendingTaskCode;
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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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

