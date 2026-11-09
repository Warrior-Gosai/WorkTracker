package com.devworktracker.common.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    public static final String COOKIE_PATH = "/api/v1/auth";

    private final boolean secureCookie;
    private final String sameSite;
    private final long refreshExpirationSeconds;

    public CookieService(
            @Value("${cookie.secure:false}") boolean secureCookie,
            @Value("${cookie.same-site:Lax}") String sameSite,
            JwtService jwtService) {
        this.secureCookie = secureCookie;
        this.sameSite = sameSite;
        this.refreshExpirationSeconds = jwtService.getRefreshExpirationSeconds();
    }

    public void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .path(COOKIE_PATH)
                .maxAge(refreshExpirationSeconds)
                .sameSite(sameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void deleteRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .path(COOKIE_PATH)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}

