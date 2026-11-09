package com.devworktracker.auth.controller;

import com.devworktracker.auth.dto.*;
import com.devworktracker.auth.service.AuthService;
import com.devworktracker.common.config.SecurityConfig;
import com.devworktracker.common.security.CustomUserPrincipal;
import com.devworktracker.common.security.JwtAuthenticationFilter;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.auth.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AppUserRepository appUserRepository;

    @Test
    @DisplayName("GET /api/v1/auth/setup-status returns setup status")
    void testGetSetupStatus() throws Exception {
        when(authService.getSetupStatus()).thenReturn(new SetupStatusResponse(true));

        mockMvc.perform(get("/api/v1/auth/setup-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.setupRequired").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register with valid body returns 201 Created")
    void testRegisterSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest("admin", "admin@example.com", "Password123", "Password123");
        UserResponse user = new UserResponse(1L, "admin", "admin@example.com", (short) 1);

        when(authService.register(any(RegisterRequest.class))).thenReturn(user);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("admin"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register with invalid body returns 400 Bad Request")
    void testRegisterValidationError() throws Exception {
        RegisterRequest req = new RegisterRequest("", "invalid-email", "short", "mismatch");

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login returns 200 with access token")
    void testLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("admin", "Password123");
        AuthResponse authRes = new AuthResponse("access_jwt_value", 900L);

        when(authService.login(any(LoginRequest.class), any())).thenReturn(authRes);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access_jwt_value"))
                .andExpect(jsonPath("$.data.expiresIn").value(900));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout with CSRF returns 204 No Content")
    void testLogoutSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/auth/csrf-token returns 200 with token metadata")
    void testGetCsrfToken() throws Exception {
        when(authService.getCsrfToken(any())).thenReturn(new CsrfResponse("test-token", "X-XSRF-TOKEN", "_csrf"));

        mockMvc.perform(get("/api/v1/auth/csrf-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("test-token"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me returns 401 when unauthenticated")
    void testGetMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/auth/me returns 200 with user profile when authenticated")
    void testGetMeAuthenticated() throws Exception {
        CustomUserPrincipal principal = new CustomUserPrincipal(1L, "admin", "admin@example.com", "pass", true);
        UserResponse user = new UserResponse(1L, "admin", "admin@example.com", (short) 1);

        when(authService.getCurrentUser(1L)).thenReturn(user);

        mockMvc.perform(get("/api/v1/auth/me")
                        .with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("admin"));
    }
}
