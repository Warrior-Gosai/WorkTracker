package com.devworktracker.auth.service;

import com.devworktracker.auth.dto.*;
import com.devworktracker.auth.entity.AppUser;
import com.devworktracker.auth.entity.RefreshToken;
import com.devworktracker.auth.mapper.UserMapper;
import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.auth.repository.RefreshTokenRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ConflictException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.exception.UnauthorizedException;
import com.devworktracker.common.security.CookieService;
import com.devworktracker.common.security.JwtService;
import com.devworktracker.common.util.HashUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AppUserRepository appUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CookieService cookieService;
    private final UserMapper userMapper;

    public AuthServiceImpl(
            AppUserRepository appUserRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CookieService cookieService,
            UserMapper userMapper) {
        this.appUserRepository = appUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.cookieService = cookieService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public SetupStatusResponse getSetupStatus() {
        boolean setupRequired = appUserRepository.count() == 0;
        return new SetupStatusResponse(setupRequired);
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirmation password do not match");
        }

        // Enforce single-account restriction
        if (appUserRepository.count() > 0) {
            throw new ConflictException("Registration is disabled. An account already exists.");
        }

        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Username is already taken");
        }

        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        AppUser user = new AppUser(
                username,
                email,
                passwordEncoder.encode(request.getPassword())
        );

        try {
            AppUser savedUser = appUserRepository.save(user);
            log.info("Initial account registered successfully: {}", savedUser.getUsername());
            return userMapper.toUserResponse(savedUser);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Concurrent registration conflict prevented multiple accounts");
            throw new ConflictException("Registration failed: an account already exists or constraint was violated");
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String identifier = request.getUsernameOrEmail().trim();

        AppUser user = appUserRepository.findByUsernameOrEmailIgnoreCase(identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is inactive");
        }

        user.setLastLoginAt(Instant.now());
        appUserRepository.save(user);

        // Generate Access JWT
        String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getUsername(), user.getEmail());

        // Generate Opaque Refresh Token
        String rawRefreshToken = HashUtils.generateSecureRandomToken();
        String tokenHash = HashUtils.sha256Hex(rawRefreshToken);
        UUID familyId = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusMillis(jwtService.getRefreshExpirationMs());

        RefreshToken refreshToken = new RefreshToken(user.getUserId(), tokenHash, familyId, expiresAt);
        refreshTokenRepository.save(refreshToken);

        // Set HttpOnly cookie
        cookieService.addRefreshTokenCookie(response, rawRefreshToken);

        log.info("User logged in successfully: {}", user.getUsername());
        return new AuthResponse(accessToken, jwtService.getAccessExpirationSeconds());
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = cookieService.extractRefreshToken(request);
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is missing");
        }

        String tokenHash = HashUtils.sha256Hex(rawToken);
        RefreshToken token = refreshTokenRepository.findWithLockByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // Reuse Detection: If already revoked or replaced, revoke entire token family
        if (token.isRevoked() || token.isReplaced()) {
            log.warn("Refresh token reuse detected for family {}. Revoking family.", token.getTokenFamilyId());
            refreshTokenRepository.revokeTokenFamily(token.getTokenFamilyId(), Instant.now());
            cookieService.deleteRefreshTokenCookie(response);
            throw new UnauthorizedException("Refresh token reuse detected. Please log in again.");
        }

        // Check token expiration
        if (token.isExpired()) {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            cookieService.deleteRefreshTokenCookie(response);
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        // Validate account status
        AppUser user = appUserRepository.findById(token.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!user.isActive()) {
            refreshTokenRepository.revokeTokenFamily(token.getTokenFamilyId(), Instant.now());
            cookieService.deleteRefreshTokenCookie(response);
            throw new UnauthorizedException("Account is inactive");
        }

        // Rotate token: create replacement within the same family
        String newRawToken = HashUtils.generateSecureRandomToken();
        String newTokenHash = HashUtils.sha256Hex(newRawToken);
        Instant newExpiresAt = Instant.now().plusMillis(jwtService.getRefreshExpirationMs());

        RefreshToken replacement = new RefreshToken(user.getUserId(), newTokenHash, token.getTokenFamilyId(), newExpiresAt);
        replacement = refreshTokenRepository.save(replacement);

        // Mark old token as revoked and linked to replacement
        token.setRevokedAt(Instant.now());
        token.setReplacedByTokenId(replacement.getTokenId());
        refreshTokenRepository.save(token);

        // Set replacement cookie
        cookieService.addRefreshTokenCookie(response, newRawToken);

        // Generate new Access JWT
        String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getUsername(), user.getEmail());

        log.debug("Rotated refresh token for user id: {}", user.getUserId());
        return new AuthResponse(accessToken, jwtService.getAccessExpirationSeconds());
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = cookieService.extractRefreshToken(request);
        if (rawToken != null && !rawToken.isBlank()) {
            String tokenHash = HashUtils.sha256Hex(rawToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(t -> {
                t.setRevokedAt(Instant.now());
                refreshTokenRepository.save(t);
                log.info("Revoked refresh token on logout for user id: {}", t.getUserId());
            });
        }
        cookieService.deleteRefreshTokenCookie(response);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is inactive");
        }

        return userMapper.toUserResponse(user);
    }

    @Override
    public CsrfResponse getCsrfToken(HttpServletRequest request) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            return new CsrfResponse(csrfToken.getToken(), csrfToken.getHeaderName(), csrfToken.getParameterName());
        }
        return new CsrfResponse("", "X-XSRF-TOKEN", "_csrf");
    }
}

