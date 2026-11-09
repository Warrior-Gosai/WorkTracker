package com.devworktracker.auth.dto;

public class SetupStatusResponse {

    private boolean setupRequired;

    public SetupStatusResponse() {
    }

    public SetupStatusResponse(boolean setupRequired) {
        this.setupRequired = setupRequired;
    }

    public boolean isSetupRequired() {
        return setupRequired;
    }

    public void setSetupRequired(boolean setupRequired) {
        this.setupRequired = setupRequired;
    }
}

