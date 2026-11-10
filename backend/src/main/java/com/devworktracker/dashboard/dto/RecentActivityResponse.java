package com.devworktracker.dashboard.dto;

import java.time.Instant;

public class RecentActivityResponse {

    private String activityType;
    private Long recordId;
    private String recordCode;
    private String title;
    private String projectName;
    private Instant activityDate;
    private String navigationTarget;

    public RecentActivityResponse() {
    }

    public RecentActivityResponse(String activityType, Long recordId, String recordCode,
                                  String title, String projectName, Instant activityDate,
                                  String navigationTarget) {
        this.activityType = activityType;
        this.recordId = recordId;
        this.recordCode = recordCode;
        this.title = title;
        this.projectName = projectName;
        this.activityDate = activityDate;
        this.navigationTarget = navigationTarget;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getRecordCode() {
        return recordCode;
    }

    public void setRecordCode(String recordCode) {
        this.recordCode = recordCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Instant getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(Instant activityDate) {
        this.activityDate = activityDate;
    }

    public String getNavigationTarget() {
        return navigationTarget;
    }

    public void setNavigationTarget(String navigationTarget) {
        this.navigationTarget = navigationTarget;
    }
}
