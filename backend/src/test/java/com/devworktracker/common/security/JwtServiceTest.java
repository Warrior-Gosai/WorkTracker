package com.devworktracker.common.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        String testSecret = "myVeryLongAndSecureSecretKeyForTestingHMACSHA256TokensOnly1234567890";
        jwtService = new JwtService(testSecret, 900000, 604800000, "devwork-tracker");
    }

    @Test
    @DisplayName("Generate access token and validate claims")
    void testGenerateAndValidateToken() {
        String token = jwtService.generateAccessToken(1L, "admin", "admin@example.com");

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals(1L, jwtService.getUserIdFromToken(token));

        Claims claims = jwtService.parseAndValidateToken(token);
        assertEquals("admin", claims.get("username"));
        assertEquals("admin@example.com", claims.get("email"));
        assertEquals("devwork-tracker", claims.getIssuer());
    }

    @Test
    @DisplayName("Expired token is rejected")
    void testExpiredToken() {
        JwtService shortLivedJwtService = new JwtService(
                "myVeryLongAndSecureSecretKeyForTestingHMACSHA256TokensOnly1234567890",
                -1000, // expired 1s ago
                604800000,
                "devwork-tracker"
        );

        String expiredToken = shortLivedJwtService.generateAccessToken(1L, "admin", "admin@example.com");

        assertFalse(jwtService.isTokenValid(expiredToken));
        assertNull(jwtService.getUserIdFromToken(expiredToken));
    }

    @Test
    @DisplayName("Tampered token signature fails validation")
    void testTamperedTokenFails() {
        String token = jwtService.generateAccessToken(1L, "admin", "admin@example.com");
        String tamperedToken = token + "xyz";

        assertFalse(jwtService.isTokenValid(tamperedToken));
    }
}

