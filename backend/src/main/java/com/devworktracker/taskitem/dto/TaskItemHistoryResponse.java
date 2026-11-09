package com.devworktracker.taskitem.dto;

import java.util.ArrayList;
import java.util.List;

public class TaskItemHistoryResponse {

    private Long taskItemId;
    private String taskItemCode;
    private String title;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private List<WorkLogHistoryDto> workLogs = new ArrayList<>();

    public TaskItemHistoryResponse() {
    }

    public TaskItemHistoryResponse(Long taskItemId, String taskItemCode, String title, Long projectId, String projectCode, String projectName, List<WorkLogHistoryDto> workLogs) {
        this.taskItemId = taskItemId;
        this.taskItemCode = taskItemCode;
        this.title = title;
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.workLogs = workLogs != null ? workLogs : new ArrayList<>();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public List<WorkLogHistoryDto> getWorkLogs() {
        return workLogs;
    }

    public void setWorkLogs(List<WorkLogHistoryDto> workLogs) {
        this.workLogs = workLogs;
    }
}

