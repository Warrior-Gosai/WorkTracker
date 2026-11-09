package com.devworktracker;

import com.devworktracker.auth.repository.AppUserRepository;
import com.devworktracker.auth.repository.RefreshTokenRepository;
import com.devworktracker.project.repository.ProjectRepository;
import com.devworktracker.taskitem.dao.TaskItemHistoryDao;
import com.devworktracker.taskitem.repository.TaskItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class DevWorkTrackerApplicationTests {

    @MockitoBean
    private AppUserRepository appUserRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private ProjectRepository projectRepository;

    @MockitoBean
    private TaskItemRepository taskItemRepository;

    @MockitoBean
    private TaskItemHistoryDao taskItemHistoryDao;

    @Test
    void contextLoads() {
    }

}
