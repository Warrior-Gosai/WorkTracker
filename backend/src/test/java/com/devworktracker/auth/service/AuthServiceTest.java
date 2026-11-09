package com.devworktracker.auth.service;

import com.devworktracker.auth.dto.*;
import com.devworktracker.auth.entity.AppUser;
import com.devworktracker.auth.entity.RefreshToken;
import com.devworktracker.auth.mapper.UserMapper;
import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.auth.repository.RefreshTokenRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ConflictException;
import com.devworktracker.common.exception.UnauthorizedException;
import com.devworktracker.common.security.CookieService;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.common.util.HashUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private CookieService cookieService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private AuthServiceImpl authService;

    private AppUser sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new AppUser("testuser", "test@example.com", "hashed_password");
        sampleUser.setUserId(1L);
        sampleUser.setStatus((short) 1);
    }

    @Test
    @DisplayName("Setup status returns true when count is 0")
    void testSetupStatusRequired() {
        when(appUserRepository.count()).thenReturn(0L);

        SetupStatusResponse res = authService.getSetupStatus();

        assertTrue(res.isSetupRequired());
        verify(appUserRepository).count();
    }

    @Test
    @DisplayName("Setup status returns false when an account exists")
    void testSetupStatusNotRequired() {
        when(appUserRepository.count()).thenReturn(1L);

        SetupStatusResponse res = authService.getSetupStatus();

        assertFalse(res.isSetupRequired());
    }

    @Test
    @DisplayName("Register first account succeeds")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest("admin", "admin@example.com", "Password123", "Password123");

        when(appUserRepository.count()).thenReturn(0L);
        when(appUserRepository.existsByUsernameIgnoreCase("admin")).thenReturn(false);
        when(appUserRepository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encodedPassword");
        when(appUserRepository.save(any(AppUser.class))).thenReturn(sampleUser);
        when(userMapper.toUserResponse(sampleUser)).thenReturn(new UserResponse(1L, "admin", "admin@example.com", (short) 1));

        UserResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals(1L, res.getUserId());
        verify(appUserRepository).save(any(AppUser.class));
    }

    @Test
    @DisplayName("Register second account throws ConflictException")
    void testRegisterSecondAccountRejected() {
        RegisterRequest req = new RegisterRequest("admin2", "admin2@example.com", "Password123", "Password123");

        when(appUserRepository.count()).thenReturn(1L);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("Registration is disabled"));
        verify(appUserRepository, never()).save(any(AppUser.class));
    }

    @Test
    @DisplayName("Register with mismatched passwords throws BadRequestException")
    void testRegisterMismatchedPasswords() {
        RegisterRequest req = new RegisterRequest("admin", "admin@example.com", "Password123", "PasswordMismatch");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("do not match"));
    }

    @Test
    @DisplayName("Register with duplicate username throws ConflictException")
    void testRegisterDuplicateUsername() {
        RegisterRequest req = new RegisterRequest("admin", "admin@example.com", "Password123", "Password123");

        when(appUserRepository.count()).thenReturn(0L);
        when(appUserRepository.existsByUsernameIgnoreCase("admin")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("Username is already taken"));
    }

    @Test
    @DisplayName("Login with valid username succeeds")
    void testLoginWithUsernameSuccess() {
        LoginRequest req = new LoginRequest("testuser", "Password123");

        when(appUserRepository.findByUsernameOrEmailIgnoreCase("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", "hashed_password")).thenReturn(true);
        when(jwtService.generateAccessToken(1L, "testuser", "test@example.com")).thenReturn("access_jwt_token");
        when(jwtService.getAccessExpirationSeconds()).thenReturn(900L);
        when(jwtService.getRefreshExpirationMs()).thenReturn(604800000L);

        AuthResponse res = authService.login(req, response);

        assertNotNull(res);
        assertEquals("access_jwt_token", res.getAccessToken());
        assertEquals(900L, res.getExpiresIn());
        verify(cookieService).addRefreshTokenCookie(eq(response), anyString());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Login with invalid password throws BadCredentialsException")
    void testLoginInvalidPassword() {
        LoginRequest req = new LoginRequest("testuser", "WrongPassword");

        when(appUserRepository.findByUsernameOrEmailIgnoreCase("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req, response));
        verify(cookieService, never()).addRefreshTokenCookie(any(), any());
    }

    @Test
    @DisplayName("Login with inactive account throws UnauthorizedException")
    void testLoginInactiveAccount() {
        sampleUser.setStatus((short) 0);
        LoginRequest req = new LoginRequest("testuser", "Password123");

        when(appUserRepository.findByUsernameOrEmailIgnoreCase("testuser")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", "hashed_password")).thenReturn(true);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.login(req, response));
        assertTrue(ex.getMessage().contains("inactive"));
    }

    @Test
    @DisplayName("Refresh token rotation succeeds with valid token")
    void testRefreshTokenRotationSuccess() {
        String rawToken = "valid_refresh_token_string";
        String tokenHash = HashUtils.sha256Hex(rawToken);
        UUID familyId = UUID.randomUUID();

        RefreshToken existingToken = new RefreshToken(1L, tokenHash, familyId, Instant.now().plusSeconds(3600));
        existingToken.setTokenId(10L);

        when(cookieService.extractRefreshToken(request)).thenReturn(rawToken);
        when(refreshTokenRepository.findWithLockByTokenHash(tokenHash)).thenReturn(Optional.of(existingToken));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(jwtService.getRefreshExpirationMs()).thenReturn(604800000L);
        when(jwtService.generateAccessToken(1L, "testuser", "test@example.com")).thenReturn("new_access_token");
        when(jwtService.getAccessExpirationSeconds()).thenReturn(900L);

        RefreshToken savedReplacement = new RefreshToken(1L, "new_hash", familyId, Instant.now().plusSeconds(3600));
        savedReplacement.setTokenId(20L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(savedReplacement);

        AuthResponse res = authService.refreshToken(request, response);

        assertNotNull(res);
        assertEquals("new_access_token", res.getAccessToken());
        assertNotNull(existingToken.getRevokedAt());
        assertEquals(20L, existingToken.getReplacedByTokenId());
        verify(cookieService).addRefreshTokenCookie(eq(response), anyString());
    }

    @Test
    @DisplayName("Refresh token reuse detection revokes token family and throws UnauthorizedException")
    void testRefreshTokenReuseDetection() {
        String rawToken = "already_used_refresh_token";
        String tokenHash = HashUtils.sha256Hex(rawToken);
        UUID familyId = UUID.randomUUID();

        RefreshToken revokedToken = new RefreshToken(1L, tokenHash, familyId, Instant.now().plusSeconds(3600));
        revokedToken.setRevokedAt(Instant.now().minusSeconds(10)); // Already revoked!

        when(cookieService.extractRefreshToken(request)).thenReturn(rawToken);
        when(refreshTokenRepository.findWithLockByTokenHash(tokenHash)).thenReturn(Optional.of(revokedToken));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.refreshToken(request, response));
        assertTrue(ex.getMessage().contains("reuse detected"));
        verify(refreshTokenRepository).revokeTokenFamily(eq(familyId), any(Instant.class));
        verify(cookieService).deleteRefreshTokenCookie(response);
    }

    @Test
    @DisplayName("Expired refresh token is rejected")
    void testExpiredRefreshTokenRejected() {
        String rawToken = "expired_token";
        String tokenHash = HashUtils.sha256Hex(rawToken);
        UUID familyId = UUID.randomUUID();

        RefreshToken expiredToken = new RefreshToken(1L, tokenHash, familyId, Instant.now().minusSeconds(100));

        when(cookieService.extractRefreshToken(request)).thenReturn(rawToken);
        when(refreshTokenRepository.findWithLockByTokenHash(tokenHash)).thenReturn(Optional.of(expiredToken));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.refreshToken(request, response));
        assertTrue(ex.getMessage().contains("expired"));
        verify(cookieService).deleteRefreshTokenCookie(response);
    }

    @Test
    @DisplayName("Logout revokes token and clears cookie")
    void testLogoutSuccess() {
        String rawToken = "active_refresh_token";
        String tokenHash = HashUtils.sha256Hex(rawToken);
        RefreshToken activeToken = new RefreshToken(1L, tokenHash, UUID.randomUUID(), Instant.now().plusSeconds(3600));

        when(cookieService.extractRefreshToken(request)).thenReturn(rawToken);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(activeToken));

        authService.logout(request, response);

        assertNotNull(activeToken.getRevokedAt());
        verify(refreshTokenRepository).save(activeToken);
        verify(cookieService).deleteRefreshTokenCookie(response);
    }
}

