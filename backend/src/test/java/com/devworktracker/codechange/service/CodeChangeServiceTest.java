package com.devworktracker.codechange.service;

import com.devworktracker.codechange.dto.CodeChangeFileDto;
import com.devworktracker.codechange.dto.CodeChangeResponse;
import com.devworktracker.codechange.dto.CommitSearchResponse;
import com.devworktracker.codechange.dto.CreateCodeChangeRequest;
import com.devworktracker.codechange.dto.UpdateCodeChangeRequest;
import com.devworktracker.codechange.entity.CodeChange;
import com.devworktracker.codechange.entity.CodeChangeFile;
import com.devworktracker.codechange.mapper.CodeChangeMapper;
import com.devworktracker.codechange.repository.CodeChangeFileRepository;
import com.devworktracker.codechange.repository.CodeChangeRepository;
import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ConflictException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.entity.Project;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.repository.WorkLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodeChangeServiceTest {

    @Mock
    private CodeChangeRepository codeChangeRepository;

    @Mock
    private CodeChangeFileRepository codeChangeFileRepository;

    @Mock
    private WorkLogRepository workLogRepository;

    @Spy
    private CodeChangeMapper codeChangeMapper = new CodeChangeMapper();

    @InjectMocks
    private CodeChangeServiceImpl codeChangeService;

    private Project sampleProject;
    private TaskItem sampleTaskItem;
    private WorkLog sampleWorkLog;
    private CodeChange sampleCommittedCodeChange;
    private CodeChange sampleUncommittedCodeChange;

    @BeforeEach
    void setUp() {
        sampleProject = new Project("PRJ-000001", "FlowTrack", "Workflow Management", (short) 1, null);
        sampleProject.setProjectId(1L);

        sampleTaskItem = new TaskItem("TASK-000001", 1L, "FEATURE", "Auth Module", "Desc", "HIGH", "OPEN", (short) 1, null, null);
        sampleTaskItem.setTaskItemId(10L);
        sampleTaskItem.setProject(sampleProject);

        sampleWorkLog = new WorkLog(
                "WL-000001",
                10L,
                LocalDate.of(2026, 11, 9),
                "LOCAL",
                "DEVELOPMENT",
                "Implement JWT Auth",
                "Desc",
                "Purpose",
                "Security",
                LocalTime.of(9, 0),
                LocalTime.of(18, 0),
                "COMPLETED",
                null,
                null,
                null,
                null,
                null,
                null
        );
        sampleWorkLog.setWorkLogId(100L);
        sampleWorkLog.setTaskItem(sampleTaskItem);

        sampleCommittedCodeChange = new CodeChange(
                "CC-000001",
                100L,
                "COMMITTED",
                "r1042",
                Instant.now(),
                "LOCAL",
                "Initial commit"
        );
        sampleCommittedCodeChange.setCodeChangeId(1000L);
        sampleCommittedCodeChange.setWorkLog(sampleWorkLog);

        sampleUncommittedCodeChange = new CodeChange(
                "CC-000002",
                100L,
                "UNCOMMITTED",
                null,
                Instant.now(),
                "LOCAL",
                "Work in progress"
        );
        sampleUncommittedCodeChange.setCodeChangeId(1001L);
        sampleUncommittedCodeChange.setWorkLog(sampleWorkLog);
    }

    @Test
    @DisplayName("Create code change: Success with COMMITTED status, valid commit ID and files")
    void createCodeChange_Committed_Success() {
        CreateCodeChangeRequest request = new CreateCodeChangeRequest();
        request.setWorkLogId(100L);
        request.setChangeStatus("COMMITTED");
        request.setSvnCommitId("r1042");
        request.setEnvironment("LOCAL");
        request.setChangeDatetime(Instant.now());
        request.setRemarks("Commit remarks");

        CodeChangeFileDto fileDto = new CodeChangeFileDto();
        fileDto.setLayer("BACKEND");
        fileDto.setTechnology("Java");
        fileDto.setFilePath("backend/src/main/java/SecurityConfig.java");
        fileDto.setWhatChanged("Added JWT filter");
        request.setFiles(List.of(fileDto));

        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(codeChangeRepository.getNextCodeChangeCodeSequence()).thenReturn(1L);
        when(codeChangeRepository.existsBySvnCommitId("r1042")).thenReturn(false);
        when(codeChangeRepository.save(any(CodeChange.class))).thenAnswer(inv -> {
            CodeChange cc = inv.getArgument(0);
            cc.setCodeChangeId(1000L);
            return cc;
        });

        CodeChangeResponse response = codeChangeService.createCodeChange(request);

        assertThat(response).isNotNull();
        assertThat(response.getCodeChangeCode()).isEqualTo("CC-000001");
        assertThat(response.getChangeStatus()).isEqualTo("COMMITTED");
        assertThat(response.getSvnCommitId()).isEqualTo("r1042");
        assertThat(response.getWorkLogCode()).isEqualTo("WL-000001");
        assertThat(response.getTaskItemCode()).isEqualTo("TASK-000001");
        assertThat(response.getProjectCode()).isEqualTo("PRJ-000001");
        assertThat(response.getFileCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("Create code change: Success with UNCOMMITTED status and null commit ID")
    void createCodeChange_Uncommitted_Success() {
        CreateCodeChangeRequest request = new CreateCodeChangeRequest();
        request.setWorkLogId(100L);
        request.setChangeStatus("UNCOMMITTED");
        request.setSvnCommitId(null);
        request.setEnvironment("LOCAL");

        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(codeChangeRepository.getNextCodeChangeCodeSequence()).thenReturn(2L);
        when(codeChangeRepository.save(any(CodeChange.class))).thenAnswer(inv -> {
            CodeChange cc = inv.getArgument(0);
            cc.setCodeChangeId(1001L);
            return cc;
        });

        CodeChangeResponse response = codeChangeService.createCodeChange(request);

        assertThat(response).isNotNull();
        assertThat(response.getCodeChangeCode()).isEqualTo("CC-000002");
        assertThat(response.getChangeStatus()).isEqualTo("UNCOMMITTED");
        assertThat(response.getSvnCommitId()).isNull();
    }

    @Test
    @DisplayName("Create code change: Rejects COMMITTED with missing SVN commit ID")
    void createCodeChange_Committed_MissingCommitId_ThrowsException() {
        CreateCodeChangeRequest request = new CreateCodeChangeRequest();
        request.setWorkLogId(100L);
        request.setChangeStatus("COMMITTED");
        request.setSvnCommitId("   ");

        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));

        assertThatThrownBy(() -> codeChangeService.createCodeChange(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("SVN Commit ID is required when status is COMMITTED");
    }

    @Test
    @DisplayName("Create code change: Rejects UNCOMMITTED with non-empty SVN commit ID")
    void createCodeChange_Uncommitted_WithCommitId_ThrowsException() {
        CreateCodeChangeRequest request = new CreateCodeChangeRequest();
        request.setWorkLogId(100L);
        request.setChangeStatus("UNCOMMITTED");
        request.setSvnCommitId("r1042");

        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));

        assertThatThrownBy(() -> codeChangeService.createCodeChange(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("SVN Commit ID must be empty/null when status is UNCOMMITTED");
    }

    @Test
    @DisplayName("Create code change: Rejects duplicate SVN commit ID")
    void createCodeChange_DuplicateCommitId_ThrowsException() {
        CreateCodeChangeRequest request = new CreateCodeChangeRequest();
        request.setWorkLogId(100L);
        request.setChangeStatus("COMMITTED");
        request.setSvnCommitId("r1042");

        when(workLogRepository.findById(100L)).thenReturn(Optional.of(sampleWorkLog));
        when(codeChangeRepository.existsBySvnCommitId("r1042")).thenReturn(true);

        assertThatThrownBy(() -> codeChangeService.createCodeChange(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already in use by another code change");
    }

    @Test
    @DisplayName("Update code change: UNCOMMITTED -> COMMITTED transition updates same record and preserves files")
    void updateCodeChange_UncommittedToCommitted_Success() {
        CodeChangeFile file = new CodeChangeFile(1001L, "BACKEND", "Java", "src/App.java", "Fixed bug", null, null, null);
        sampleUncommittedCodeChange.setFiles(new ArrayList<>(List.of(file)));

        when(codeChangeRepository.findById(1001L)).thenReturn(Optional.of(sampleUncommittedCodeChange));
        when(codeChangeRepository.existsBySvnCommitIdAndCodeChangeIdNot("r1045", 1001L)).thenReturn(false);
        when(codeChangeRepository.save(any(CodeChange.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateCodeChangeRequest updateRequest = new UpdateCodeChangeRequest();
        updateRequest.setChangeStatus("COMMITTED");
        updateRequest.setSvnCommitId("r1045");
        updateRequest.setEnvironment("UAT");
        updateRequest.setRemarks("Promoted to committed");

        CodeChangeResponse updated = codeChangeService.updateCodeChange(1001L, updateRequest);

        assertThat(updated).isNotNull();
        assertThat(updated.getCodeChangeId()).isEqualTo(1001L);
        assertThat(updated.getCodeChangeCode()).isEqualTo("CC-000002");
        assertThat(updated.getChangeStatus()).isEqualTo("COMMITTED");
        assertThat(updated.getSvnCommitId()).isEqualTo("r1045");
        assertThat(updated.getEnvironment()).isEqualTo("UAT");
        assertThat(updated.getFileCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("Update code change: Rejects COMMITTED -> UNCOMMITTED transition")
    void updateCodeChange_CommittedToUncommitted_ThrowsException() {
        when(codeChangeRepository.findById(1000L)).thenReturn(Optional.of(sampleCommittedCodeChange));

        UpdateCodeChangeRequest updateRequest = new UpdateCodeChangeRequest();
        updateRequest.setChangeStatus("UNCOMMITTED");

        assertThatThrownBy(() -> codeChangeService.updateCodeChange(1000L, updateRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot revert a COMMITTED code change to UNCOMMITTED");
    }

    @Test
    @DisplayName("Update code change: Rejects removing commit ID on COMMITTED record")
    void updateCodeChange_Committed_RemoveCommitId_ThrowsException() {
        when(codeChangeRepository.findById(1000L)).thenReturn(Optional.of(sampleCommittedCodeChange));

        UpdateCodeChangeRequest updateRequest = new UpdateCodeChangeRequest();
        updateRequest.setChangeStatus("COMMITTED");
        updateRequest.setSvnCommitId("   ");

        assertThatThrownBy(() -> codeChangeService.updateCodeChange(1000L, updateRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("SVN Commit ID cannot be removed for a COMMITTED code change");
    }

    @Test
    @DisplayName("Search by SVN commit ID: Success and Not Found scenarios")
    void searchBySvnCommitId_Scenarios() {
        when(codeChangeRepository.findBySvnCommitId("r1042")).thenReturn(Optional.of(sampleCommittedCodeChange));
        when(codeChangeRepository.findBySvnCommitId("r9999")).thenReturn(Optional.empty());

        CommitSearchResponse found = codeChangeService.searchBySvnCommitId("r1042");
        assertThat(found).isNotNull();
        assertThat(found.getSvnCommitId()).isEqualTo("r1042");
        assertThat(found.getCodeChangeCode()).isEqualTo("CC-000001");
        assertThat(found.getWorkLogCode()).isEqualTo("WL-000001");

        assertThatThrownBy(() -> codeChangeService.searchBySvnCommitId("r9999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No code change found for SVN Commit ID: r9999");
    }

    @Test
    @DisplayName("File management: Add, Update, and Delete child file entries")
    void fileManagement_Operations() {
        when(codeChangeRepository.findById(1000L)).thenReturn(Optional.of(sampleCommittedCodeChange));
        when(codeChangeRepository.existsById(1000L)).thenReturn(true);

        // 1. Add file
        CodeChangeFileDto addDto = new CodeChangeFileDto();
        addDto.setFilePath("src/Test.java");
        when(codeChangeFileRepository.save(any(CodeChangeFile.class))).thenAnswer(inv -> {
            CodeChangeFile f = inv.getArgument(0);
            f.setCodeChangeFileId(500L);
            return f;
        });

        CodeChangeFileDto added = codeChangeService.addFile(1000L, addDto);
        assertThat(added).isNotNull();
        assertThat(added.getCodeChangeFileId()).isEqualTo(500L);

        // 2. Update file
        CodeChangeFile existingFile = new CodeChangeFile(1000L, "FRONTEND", "JS", "src/Test.java", null, null, null, null);
        existingFile.setCodeChangeFileId(500L);
        when(codeChangeFileRepository.findByCodeChangeFileIdAndCodeChangeId(500L, 1000L))
                .thenReturn(Optional.of(existingFile));

        CodeChangeFileDto updateDto = new CodeChangeFileDto();
        updateDto.setFilePath("src/UpdatedTest.java");
        updateDto.setLayer("UI");

        CodeChangeFileDto updatedFile = codeChangeService.updateFile(1000L, 500L, updateDto);
        assertThat(updatedFile.getFilePath()).isEqualTo("src/UpdatedTest.java");
        assertThat(updatedFile.getLayer()).isEqualTo("UI");

        // 3. Delete file
        codeChangeService.deleteFile(1000L, 500L);
        verify(codeChangeFileRepository).delete(existingFile);
        // Verify parent was NOT deleted
        verify(codeChangeRepository, never()).delete(any(CodeChange.class));
    }

    @Test
    @DisplayName("List code changes: Paginated and filtered results returned")
    void getCodeChanges_Success() {
        Page<CodeChange> paged = new PageImpl<>(List.of(sampleCommittedCodeChange), PageRequest.of(0, 10), 1);
        when(codeChangeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(paged);

        PageResponse<CodeChangeResponse> response = codeChangeService.getCodeChanges(
                "CC-000001", 100L, 10L, 1L, "COMMITTED", "LOCAL",
                LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 30), 0, 10, "changeDatetime", "desc"
        );

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getCodeChangeCode()).isEqualTo("CC-000001");
    }
}
