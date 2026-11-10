package com.devworktracker.dbchange.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.dbchange.dto.CreateDbChangeRequest;
import com.devworktracker.dbchange.dto.DbChangeResponse;
import com.devworktracker.dbchange.dto.UpdateDbChangeRequest;
import com.devworktracker.dbchange.entity.DbChange;
import com.devworktracker.dbchange.mapper.DbChangeMapper;
import com.devworktracker.dbchange.repository.DbChangeRepository;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.repository.WorkLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DbChangeServiceTest {

    @Mock
    private DbChangeRepository dbChangeRepository;

    @Mock
    private WorkLogRepository workLogRepository;

    @Spy
    private DbChangeMapper dbChangeMapper = new DbChangeMapper();

    @InjectMocks
    private DbChangeServiceImpl dbChangeService;

    private Project sampleProject;
    private TaskItem sampleTaskItem;
    private WorkLog sampleWorkLog;
    private DbChange sampleDbChange;

    @BeforeEach
    void setUp() {
        sampleProject = new Project("PRJ-000001", "Core Portal", "Portal project", (short) 1, null);
        sampleProject.setProjectId(10L);

        sampleTaskItem = new TaskItem("TASK-000001", 10L, "FEATURE", "Implement User Authentication",
                "Auth description", "HIGH", "IN_PROGRESS", (short) 1, null, null);
        sampleTaskItem.setTaskItemId(20L);
        sampleTaskItem.setProject(sampleProject);

        sampleWorkLog = new WorkLog("WL-000001", 20L, LocalDate.of(2026, 11, 10),
                "LOCAL", "DEVELOPMENT", "Add auth tables",
                "Created migrations", "Security", "Spring Security, SQL",
                null, null, "IN_PROGRESS", null, null, null, null, null, null);
        sampleWorkLog.setWorkLogId(100L);
        sampleWorkLog.setTaskItem(sampleTaskItem);

        sampleDbChange = new DbChange(
                "DB-000001",
                100L,
                "LOCAL",
                "PostgreSQL",
                "Table",
                "app_user",
                "Added unique constraint on username",
                "Security compliance",
                "auth_token",
                "Initial version"
        );
        sampleDbChange.setDbChangeId(50L);
        sampleDbChange.setWorkLog(sampleWorkLog);
    }

    @Test
    @DisplayName("Create DB change: Success with sequence code generation and optional fields")
    void createDbChange_Success() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(dbChangeRepository.getNextDbChangeCodeSequence()).thenReturn(1L);
        when(dbChangeRepository.save(any(DbChange.class))).thenAnswer(invocation -> {
            DbChange saved = invocation.getArgument(0);
            saved.setDbChangeId(50L);
            return saved;
        });

        CreateDbChangeRequest request = new CreateDbChangeRequest(
                100L,
                "LOCAL",
                "PostgreSQL",
                "Table",
                "app_user",
                "Added unique constraint",
                "Security compliance",
                "auth_token",
                "Initial version"
        );

        DbChangeResponse response = dbChangeService.createDbChange(request);

        assertThat(response).isNotNull();
        assertThat(response.getDbChangeCode()).isEqualTo("DB-000001");
        assertThat(response.getWorkLogId()).isEqualTo(100L);
        assertThat(response.getWorkLogCode()).isEqualTo("WL-000001");
        assertThat(response.getTaskItemId()).isEqualTo(20L);
        assertThat(response.getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(response.getProjectId()).isEqualTo(10L);
        assertThat(response.getProjectCode()).isEqualTo("PRJ-000001");
        assertThat(response.getEnvironment()).isEqualTo("LOCAL");
        assertThat(response.getDatabaseName()).isEqualTo("PostgreSQL");
        assertThat(response.getObjectType()).isEqualTo("Table");
        assertThat(response.getObjectName()).isEqualTo("app_user");
        assertThat(response.getWhyChanged()).isEqualTo("Security compliance");
        assertThat(response.getWhatChanged()).isEqualTo("Added unique constraint");

        ArgumentCaptor<DbChange> captor = ArgumentCaptor.forClass(DbChange.class);
        verify(dbChangeRepository).save(captor.capture());
        DbChange captured = captor.getValue();
        assertThat(captured.getDbChangeCode()).isEqualTo("DB-000001");
        assertThat(captured.getWorkLogId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("Create DB change: Success with null optional fields")
    void createDbChange_Success_OptionalFieldsNull() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(dbChangeRepository.getNextDbChangeCodeSequence()).thenReturn(2L);
        when(dbChangeRepository.save(any(DbChange.class))).thenAnswer(invocation -> {
            DbChange saved = invocation.getArgument(0);
            saved.setDbChangeId(51L);
            return saved;
        });

        CreateDbChangeRequest request = new CreateDbChangeRequest(
                100L,
                "UAT",
                "Oracle",
                "Procedure",
                "sp_recalculate_hours",
                null, // whatChanged is optional
                "Performance optimization",
                null, // affectedObject is optional
                null  // remarks is optional
        );

        DbChangeResponse response = dbChangeService.createDbChange(request);

        assertThat(response).isNotNull();
        assertThat(response.getDbChangeCode()).isEqualTo("DB-000002");
        assertThat(response.getDatabaseName()).isEqualTo("Oracle");
        assertThat(response.getObjectType()).isEqualTo("Procedure");
        assertThat(response.getWhatChanged()).isNull();
        assertThat(response.getAffectedObject()).isNull();
        assertThat(response.getRemarks()).isNull();
    }

    @Test
    @DisplayName("Create DB change: Fails when work log does not exist")
    void createDbChange_WorkLogNotFound() {
        when(workLogRepository.findById(999L)).thenReturn(Optional.empty());

        CreateDbChangeRequest request = new CreateDbChangeRequest(
                999L, "LOCAL", "PostgreSQL", "Table", "audit_log", "desc", "reason", null, null
        );

        assertThatThrownBy(() -> dbChangeService.createDbChange(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Work log not found with id: 999");

        verify(dbChangeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create DB change: Fails on invalid environment")
    void createDbChange_InvalidEnvironment() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));

        CreateDbChangeRequest request = new CreateDbChangeRequest(
                100L, "STAGING", "PostgreSQL", "Table", "audit_log", "desc", "reason", null, null
        );

        assertThatThrownBy(() -> dbChangeService.createDbChange(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid environment: 'STAGING'");
    }

    @Test
    @DisplayName("Create DB change: Fails on invalid database name")
    void createDbChange_InvalidDatabaseName() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));

        CreateDbChangeRequest request = new CreateDbChangeRequest(
                100L, "LOCAL", "Cassandra", "Table", "audit_log", "desc", "reason", null, null
        );

        assertThatThrownBy(() -> dbChangeService.createDbChange(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid database name: 'Cassandra'");
    }

    @Test
    @DisplayName("Create DB change: Fails on invalid object type")
    void createDbChange_InvalidObjectType() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));

        CreateDbChangeRequest request = new CreateDbChangeRequest(
                100L, "LOCAL", "PostgreSQL", "InvalidType", "audit_log", "desc", "reason", null, null
        );

        assertThatThrownBy(() -> dbChangeService.createDbChange(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid object type: 'InvalidType'");
    }

    @Test
    @DisplayName("Create DB change: Fails on blank object name or blank why changed")
    void createDbChange_BlankRequiredFields() {
        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));

        CreateDbChangeRequest reqBlankObj = new CreateDbChangeRequest(
                100L, "LOCAL", "PostgreSQL", "Table", "   ", "desc", "reason", null, null
        );
        assertThatThrownBy(() -> dbChangeService.createDbChange(reqBlankObj))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Object name is required");

        CreateDbChangeRequest reqBlankWhy = new CreateDbChangeRequest(
                100L, "LOCAL", "PostgreSQL", "Table", "valid_table", "desc", "   ", null, null
        );
        assertThatThrownBy(() -> dbChangeService.createDbChange(reqBlankWhy))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Why changed is required");
    }

    @Test
    @DisplayName("Get DB change by ID: Success and Not Found")
    void getDbChangeById_Scenarios() {
        when(dbChangeRepository.findById(50L)).thenReturn(Optional.of(sampleDbChange));
        when(dbChangeRepository.findById(999L)).thenReturn(Optional.empty());

        DbChangeResponse found = dbChangeService.getDbChangeById(50L);
        assertThat(found).isNotNull();
        assertThat(found.getDbChangeCode()).isEqualTo("DB-000001");
        assertThat(found.getObjectName()).isEqualTo("app_user");

        assertThatThrownBy(() -> dbChangeService.getDbChangeById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DB change not found with id: 999");
    }

    @Test
    @DisplayName("Update DB change: Success and preserves ID, code, and workLogId")
    void updateDbChange_Success_PreservesImmutableFields() {
        when(dbChangeRepository.findById(50L)).thenReturn(Optional.of(sampleDbChange));
        when(dbChangeRepository.save(any(DbChange.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateDbChangeRequest updateRequest = new UpdateDbChangeRequest(
                "LIVE",
                "MySQL",
                "Trigger",
                "trg_audit_user",
                "Updated trigger body",
                "Business audit requirement",
                "audit_table",
                "Updated remarks"
        );

        DbChangeResponse updated = dbChangeService.updateDbChange(50L, updateRequest);

        assertThat(updated).isNotNull();
        assertThat(updated.getDbChangeId()).isEqualTo(50L);
        assertThat(updated.getDbChangeCode()).isEqualTo("DB-000001"); // Preserved
        assertThat(updated.getWorkLogId()).isEqualTo(100L); // Preserved
        assertThat(updated.getEnvironment()).isEqualTo("LIVE");
        assertThat(updated.getDatabaseName()).isEqualTo("MySQL");
        assertThat(updated.getObjectType()).isEqualTo("Trigger");
        assertThat(updated.getObjectName()).isEqualTo("trg_audit_user");
        assertThat(updated.getWhyChanged()).isEqualTo("Business audit requirement");
    }

    @Test
    @DisplayName("Update DB change: Allows editing historical records under inactive task item")
    void updateDbChange_Success_EvenIfTaskInactive() {
        // Inactive task
        TaskItem inactiveTask = new TaskItem("TASK-000099", 10L, "FEATURE", "Old Task", "Old desc", "LOW", "CANCELLED", (short) 0, null, null);
        sampleWorkLog.setTaskItem(inactiveTask);

        when(dbChangeRepository.findById(50L)).thenReturn(Optional.of(sampleDbChange));
        when(dbChangeRepository.save(any(DbChange.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateDbChangeRequest updateRequest = new UpdateDbChangeRequest(
                "UAT", "SQL Server", "View", "vw_historical_report", null, "Clarified definition", null, null
        );

        DbChangeResponse updated = dbChangeService.updateDbChange(50L, updateRequest);

        assertThat(updated).isNotNull();
        assertThat(updated.getEnvironment()).isEqualTo("UAT");
        assertThat(updated.getDatabaseName()).isEqualTo("SQL Server");
        assertThat(updated.getObjectType()).isEqualTo("View");
    }

    @Test
    @DisplayName("Update DB change: Fails on non-existent ID")
    void updateDbChange_NotFound() {
        when(dbChangeRepository.findById(999L)).thenReturn(Optional.empty());

        UpdateDbChangeRequest updateRequest = new UpdateDbChangeRequest(
                "UAT", "SQL Server", "View", "vw_rep", null, "Clarified definition", null, null
        );

        assertThatThrownBy(() -> dbChangeService.updateDbChange(999L, updateRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DB change not found with id: 999");
    }

    @Test
    @DisplayName("List DB changes: Success with pagination and sorting")
    void getDbChanges_Success() {
        Page<DbChange> pageResult = new PageImpl<>(List.of(sampleDbChange), PageRequest.of(0, 10), 1);
        when(dbChangeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(pageResult);

        PageResponse<DbChangeResponse> result = dbChangeService.getDbChanges(
                "app_user",
                100L,
                20L,
                10L,
                LocalDate.of(2026, 11, 1),
                LocalDate.of(2026, 11, 30),
                "LOCAL",
                "PostgreSQL",
                "Table",
                0,
                10,
                "createdAt",
                "desc"
        );

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getDbChangeCode()).isEqualTo("DB-000001");
    }

    @Test
    @DisplayName("List DB changes: Validation for invalid page, size, and sort allowlist")
    void getDbChanges_ValidationFailures() {
        // Page < 0
        assertThatThrownBy(() -> dbChangeService.getDbChanges(
                null, null, null, null, null, null, null, null, null, -1, 10, "createdAt", "desc"
        )).isInstanceOf(BadRequestException.class).hasMessageContaining("Page index must not be less than zero");

        // Size > 100
        assertThatThrownBy(() -> dbChangeService.getDbChanges(
                null, null, null, null, null, null, null, null, null, 0, 101, "createdAt", "desc"
        )).isInstanceOf(BadRequestException.class).hasMessageContaining("Page size must be between 1 and 100");

        // Invalid sort field
        assertThatThrownBy(() -> dbChangeService.getDbChanges(
                null, null, null, null, null, null, null, null, null, 0, 10, "injected_field", "desc"
        )).isInstanceOf(BadRequestException.class).hasMessageContaining("Invalid sort field: 'injected_field'");

        // Invalid sort direction
        assertThatThrownBy(() -> dbChangeService.getDbChanges(
                null, null, null, null, null, null, null, null, null, 0, 10, "createdAt", "sideways"
        )).isInstanceOf(BadRequestException.class).hasMessageContaining("Invalid sort direction: 'sideways'");
    }
}
