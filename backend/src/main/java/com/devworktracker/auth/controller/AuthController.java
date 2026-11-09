package com.devworktracker.auth.controller;

import com.devworktracker.auth.dto.*;
import com.devworktracker.auth.service.AuthService;
import com.devworktracker.common.response.ApiResponse;
import com.devworktracker.common.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for setup, authentication, token rotation, and current user")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/setup-status")
    @Operation(summary = "Check initial setup status", description = "Returns whether initial account creation is required")
    public ResponseEntity<ApiResponse<SetupStatusResponse>> getSetupStatus() {
        SetupStatusResponse response = authService.getSetupStatus();
        return ResponseEntity.ok(ApiResponse.success("Setup status retrieved", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Register the single application account", description = "Initial registration, allowed only when no account exists")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account registered successfully", user));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Authenticate using username or email and receive access token + refresh cookie")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token", description = "Reads refresh token from HttpOnly cookie and returns a new access JWT and rotated cookie")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.refreshToken(request, response);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out user", description = "Revokes current refresh token and clears the authentication cookie")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current account", description = "Returns authenticated account details using access JWT")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        Long userId = principal != null ? principal.getUserId() : null;
        UserResponse user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Account profile retrieved", user));
    }

    @GetMapping("/csrf-token")
    @Operation(summary = "Get CSRF token", description = "Retrieves CSRF token for React frontend integration")
    public ResponseEntity<ApiResponse<CsrfResponse>> getCsrfToken(HttpServletRequest request) {
        CsrfResponse csrfResponse = authService.getCsrfToken(request);
        return ResponseEntity.ok(ApiResponse.success("CSRF token retrieved", csrfResponse));
    }
}

