package com.devworktracker.auth.service;

import com.devworktracker.auth.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    SetupStatusResponse getSetupStatus();

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request, HttpServletResponse response);

    AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);

    UserResponse getCurrentUser(Long userId);

    CsrfResponse getCsrfToken(HttpServletRequest request);
}

