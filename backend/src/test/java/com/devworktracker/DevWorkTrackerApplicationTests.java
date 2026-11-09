package com.devworktracker;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class DevWorkTrackerApplicationTests {

    @MockitoBean
    private AppUserRepository appUserRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    void contextLoads() {
    }

}
