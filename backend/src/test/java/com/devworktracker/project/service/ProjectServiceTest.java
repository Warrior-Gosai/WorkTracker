package com.devworktracker.project.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.dto.CreateProjectRequest;
import com.devworktracker.project.dto.ProjectResponse;
import com.devworktracker.project.dto.UpdateProjectRequest;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.mapper.ProjectMapper;
import com.devworktracker.project.repository.ProjectRepository;
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

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Spy
    private ProjectMapper projectMapper = new ProjectMapper();

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project sampleProject;

    @BeforeEach
    void setUp() {
        sampleProject = new Project(
                "PRJ-000001",
                "Internal Portal",
                "Core employee portal",
                (short) 1,
                "Internal remarks"
        );
        sampleProject.setProjectId(1L);
        sampleProject.setCreatedAt(Instant.now());
        sampleProject.setUpdatedAt(Instant.now());
    }

    @Test
    @DisplayName("Should create project with sequence-generated code PRJ-000001 and status 1")
    void createProject_success() {
        when(projectRepository.getNextProjectCodeSequence()).thenReturn(1L);
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setProjectId(1L);
            return p;
        });

        CreateProjectRequest request = new CreateProjectRequest("Internal Portal", "Description", "Remarks");
        ProjectResponse response = projectService.createProject(request);

        assertThat(response).isNotNull();
        assertThat(response.getProjectCode()).isEqualTo("PRJ-000001");
        assertThat(response.getProjectName()).isEqualTo("Internal Portal");
        assertThat(response.getStatus()).isEqualTo((short) 1);

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(captor.capture());
        Project saved = captor.getValue();
        assertThat(saved.getProjectCode()).isEqualTo("PRJ-000001");
        assertThat(saved.getStatus()).isEqualTo((short) 1);
    }

    @Test
    @DisplayName("Should format high sequence numbers correctly like PRJ-000123")
    void createProject_highSequenceNumber() {
        when(projectRepository.getNextProjectCodeSequence()).thenReturn(123L);
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateProjectRequest request = new CreateProjectRequest("High Seq", null, null);
        ProjectResponse response = projectService.createProject(request);

        assertThat(response.getProjectCode()).isEqualTo("PRJ-000123");
    }

    @Test
    @DisplayName("Should throw IllegalStateException if sequence returns null")
    void createProject_nullSequenceThrows() {
        when(projectRepository.getNextProjectCodeSequence()).thenReturn(null);

        CreateProjectRequest request = new CreateProjectRequest("Portal", null, null);
        assertThatThrownBy(() -> projectService.createProject(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to obtain nextval");
    }

    @Test
    @DisplayName("Should list projects with default pagination and sorting")
    void getProjects_defaultPagination() {
        Page<Project> page = new PageImpl<>(List.of(sampleProject), PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")), 1);
        when(projectRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<ProjectResponse> result = projectService.getProjects(null, null, 0, 10, "createdAt", "desc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getPage()).isEqualTo(0);
        assertThat(result.getContent().get(0).getProjectCode()).isEqualTo("PRJ-000001");
    }

    @Test
    @DisplayName("Should reject invalid page number less than 0")
    void getProjects_invalidPage() {
        assertThatThrownBy(() -> projectService.getProjects(null, null, -1, 10, "createdAt", "desc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page index must not be less than zero");
    }

    @Test
    @DisplayName("Should reject page size greater than maximum 100")
    void getProjects_sizeTooLarge() {
        assertThatThrownBy(() -> projectService.getProjects(null, null, 0, 101, "createdAt", "desc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page size must be between 1 and 100");
    }

    @Test
    @DisplayName("Should reject invalid sort field not in allowlist")
    void getProjects_invalidSortField() {
        assertThatThrownBy(() -> projectService.getProjects(null, null, 0, 10, "unallowedColumn", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sort field");
    }

    @Test
    @DisplayName("Should reject invalid sort direction")
    void getProjects_invalidSortDirection() {
        assertThatThrownBy(() -> projectService.getProjects(null, null, 0, 10, "projectName", "sideways"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid sort direction");
    }

    @Test
    @DisplayName("Should reject invalid status value other than 0 or 1")
    void getProjects_invalidStatus() {
        assertThatThrownBy(() -> projectService.getProjects(null, (short) 5, 0, 10, "projectName", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Status must be 0 (Inactive) or 1 (Active)");
    }

    @Test
    @DisplayName("Should get project details by id")
    void getProjectById_success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleProject));

        ProjectResponse response = projectService.getProjectById(1L);
        assertThat(response).isNotNull();
        assertThat(response.getProjectId()).isEqualTo(1L);
        assertThat(response.getProjectCode()).isEqualTo("PRJ-000001");
    }

    @Test
    @DisplayName("Should throw 404 ResourceNotFoundException when project not found")
    void getProjectById_notFound() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found with id: 999");
    }

    @Test
    @DisplayName("Should update project name, description, and remarks without altering code or status")
    void updateProject_success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleProject));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProjectRequest request = new UpdateProjectRequest("Updated Portal", "New Description", "New Remarks");
        ProjectResponse response = projectService.updateProject(1L, request);

        assertThat(response.getProjectName()).isEqualTo("Updated Portal");
        assertThat(response.getDescription()).isEqualTo("New Description");
        assertThat(response.getRemarks()).isEqualTo("New Remarks");
        assertThat(response.getProjectCode()).isEqualTo("PRJ-000001");
        assertThat(response.getStatus()).isEqualTo((short) 1);
    }

    @Test
    @DisplayName("Should allow editing an inactive project (status = 0) without changing status")
    void updateProject_inactiveProjectAllowed() {
        sampleProject.setStatus((short) 0);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(sampleProject));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProjectRequest request = new UpdateProjectRequest("Updated Inactive Name", "Desc", "Remarks");
        ProjectResponse response = projectService.updateProject(1L, request);

        assertThat(response.getProjectName()).isEqualTo("Updated Inactive Name");
        assertThat(response.getStatus()).isEqualTo((short) 0);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent project")
    void updateProject_notFound() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        UpdateProjectRequest request = new UpdateProjectRequest("Name", null, null);
        assertThatThrownBy(() -> projectService.updateProject(999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project not found with id: 999");
    }
}

