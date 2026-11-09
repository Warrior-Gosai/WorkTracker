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
import com.devworktracker.common.util.DateTimeUtils;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.repository.WorkLogRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CodeChangeServiceImpl implements CodeChangeService {

    private static final Logger log = LoggerFactory.getLogger(CodeChangeServiceImpl.class);
    private static final int MAX_PAGE_SIZE = 100;

    public static final Set<String> VALID_CHANGE_STATUSES = Set.of(
            "COMMITTED",
            "UNCOMMITTED"
    );

    public static final Set<String> VALID_ENVIRONMENTS = Set.of(
            "LOCAL",
            "UAT",
            "LIVE"
    );

    private static final Map<String, String> SORT_ALLOWLIST = Map.of(
            "changeDatetime", "changeDatetime",
            "codeChangeId", "codeChangeId",
            "codeChangeCode", "codeChangeCode",
            "changeStatus", "changeStatus",
            "environment", "environment",
            "svnCommitId", "svnCommitId",
            "createdAt", "createdAt",
            "updatedAt", "updatedAt"
    );

    private final CodeChangeRepository codeChangeRepository;
    private final CodeChangeFileRepository codeChangeFileRepository;
    private final WorkLogRepository workLogRepository;
    private final CodeChangeMapper codeChangeMapper;

    public CodeChangeServiceImpl(
            CodeChangeRepository codeChangeRepository,
            CodeChangeFileRepository codeChangeFileRepository,
            WorkLogRepository workLogRepository,
            CodeChangeMapper codeChangeMapper) {
        this.codeChangeRepository = codeChangeRepository;
        this.codeChangeFileRepository = codeChangeFileRepository;
        this.workLogRepository = workLogRepository;
        this.codeChangeMapper = codeChangeMapper;
    }

    @Override
    @Transactional
    public CodeChangeResponse createCodeChange(CreateCodeChangeRequest request) {
        log.info("Creating code change for work log ID: {}", request.getWorkLogId());

        // 1. Validate work log exists
        WorkLog workLog = workLogRepository.findById(request.getWorkLogId())
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found with id: " + request.getWorkLogId()));

        // 2. Validate changeStatus
        String status = request.getChangeStatus() != null ? request.getChangeStatus().trim().toUpperCase() : "UNCOMMITTED";
        if (!VALID_CHANGE_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid change status: '" + status + "'. Allowed values: " + VALID_CHANGE_STATUSES);
        }

        // 3. Validate environment
        String environment = request.getEnvironment() != null && !request.getEnvironment().trim().isEmpty()
                ? request.getEnvironment().trim().toUpperCase()
                : "LOCAL";
        if (!VALID_ENVIRONMENTS.contains(environment)) {
            throw new BadRequestException("Invalid environment: '" + environment + "'. Allowed values: " + VALID_ENVIRONMENTS);
        }

        // 4. Validate status and SVN commit ID consistency
        String svnCommitId = null;
        if ("COMMITTED".equals(status)) {
            if (request.getSvnCommitId() == null || request.getSvnCommitId().trim().isEmpty()) {
                throw new BadRequestException("SVN Commit ID is required when status is COMMITTED");
            }
            svnCommitId = request.getSvnCommitId().trim();
            if (codeChangeRepository.existsBySvnCommitId(svnCommitId)) {
                throw new ConflictException("SVN Commit ID '" + svnCommitId + "' is already in use by another code change");
            }
        } else {
            if (request.getSvnCommitId() != null && !request.getSvnCommitId().trim().isEmpty()) {
                throw new BadRequestException("SVN Commit ID must be empty/null when status is UNCOMMITTED");
            }
        }

        // 5. Change datetime
        Instant changeDatetime = request.getChangeDatetime() != null ? request.getChangeDatetime() : Instant.now();

        // 6. Generate code: CC-%06d
        Long seqVal = codeChangeRepository.getNextCodeChangeCodeSequence();
        String codeChangeCode = String.format("CC-%06d", seqVal);

        CodeChange codeChange = new CodeChange(
                codeChangeCode,
                workLog.getWorkLogId(),
                status,
                svnCommitId,
                changeDatetime,
                environment,
                request.getRemarks()
        );
        codeChange.setWorkLog(workLog);

        // 7. Handle optional child files
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            for (CodeChangeFileDto fileDto : request.getFiles()) {
                if (fileDto.getFilePath() == null || fileDto.getFilePath().trim().isEmpty()) {
                    throw new BadRequestException("File path is required for all file entries");
                }
                CodeChangeFile file = new CodeChangeFile(
                        null,
                        fileDto.getLayer(),
                        fileDto.getTechnology(),
                        fileDto.getFilePath().trim(),
                        fileDto.getWhatChanged(),
                        fileDto.getWhyChanged(),
                        fileDto.getAffectedFiles(),
                        fileDto.getRemarks()
                );
                codeChange.addFile(file);
            }
        }

        CodeChange saved = codeChangeRepository.save(codeChange);
        log.info("Code change created successfully with code: {} and ID: {}", codeChangeCode, saved.getCodeChangeId());

        return codeChangeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CodeChangeResponse> getCodeChanges(
            String search,
            Long workLogId,
            Long taskItemId,
            Long projectId,
            String changeStatus,
            String environment,
            LocalDate dateFrom,
            LocalDate dateTo,
            int page,
            int size,
            String sortBy,
            String direction) {

        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and " + MAX_PAGE_SIZE);
        }

        String sortField = sortBy != null && !sortBy.trim().isEmpty() ? sortBy.trim() : "changeDatetime";
        if (!SORT_ALLOWLIST.containsKey(sortField)) {
            throw new BadRequestException("Invalid sort field: '" + sortBy + "'. Allowed fields: " + SORT_ALLOWLIST.keySet());
        }

        String sortDir = direction != null ? direction.trim().toLowerCase() : "desc";
        Sort.Direction dir;
        if ("asc".equalsIgnoreCase(sortDir)) {
            dir = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(sortDir)) {
            dir = Sort.Direction.DESC;
        } else {
            throw new BadRequestException("Invalid sort direction: '" + direction + "'. Must be 'asc' or 'desc'");
        }

        Specification<CodeChange> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeLike = cb.like(cb.lower(root.get("codeChangeCode")), pattern);
                Predicate commitLike = cb.like(cb.lower(cb.coalesce(root.get("svnCommitId"), "")), pattern);
                predicates.add(cb.or(codeLike, commitLike));
            }

            if (workLogId != null) {
                predicates.add(cb.equal(root.get("workLogId"), workLogId));
            }

            if (taskItemId != null) {
                Join<Object, Object> workLogJoin = root.join("workLog", JoinType.LEFT);
                predicates.add(cb.equal(workLogJoin.get("taskItemId"), taskItemId));
            }

            if (projectId != null) {
                Join<Object, Object> workLogJoin = root.join("workLog", JoinType.LEFT);
                Join<Object, Object> taskItemJoin = workLogJoin.join("taskItem", JoinType.LEFT);
                predicates.add(cb.equal(taskItemJoin.get("projectId"), projectId));
            }

            if (changeStatus != null && !changeStatus.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("changeStatus"), changeStatus.trim().toUpperCase()));
            }

            if (environment != null && !environment.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("environment"), environment.trim().toUpperCase()));
            }

            if (dateFrom != null) {
                Instant fromInstant = dateFrom.atStartOfDay(DateTimeUtils.APP_ZONE).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("changeDatetime"), fromInstant));
            }

            if (dateTo != null) {
                Instant toInstant = dateTo.plusDays(1).atStartOfDay(DateTimeUtils.APP_ZONE).toInstant();
                predicates.add(cb.lessThan(root.get("changeDatetime"), toInstant));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(dir, SORT_ALLOWLIST.get(sortField))
                .and(Sort.by(Sort.Direction.DESC, "codeChangeId"));

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CodeChange> pageResult = codeChangeRepository.findAll(spec, pageable);

        return PageResponse.from(pageResult.map(codeChangeMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public CodeChangeResponse getCodeChangeById(Long codeChangeId) {
        CodeChange codeChange = codeChangeRepository.findById(codeChangeId)
                .orElseThrow(() -> new ResourceNotFoundException("Code change not found with id: " + codeChangeId));
        return codeChangeMapper.toResponse(codeChange);
    }

    @Override
    @Transactional
    public CodeChangeResponse updateCodeChange(Long codeChangeId, UpdateCodeChangeRequest request) {
        log.info("Updating code change id: {}", codeChangeId);

        CodeChange codeChange = codeChangeRepository.findById(codeChangeId)
                .orElseThrow(() -> new ResourceNotFoundException("Code change not found with id: " + codeChangeId));

        // 1. Validate status
        String requestStatus = request.getChangeStatus() != null
                ? request.getChangeStatus().trim().toUpperCase()
                : codeChange.getChangeStatus();
        if (!VALID_CHANGE_STATUSES.contains(requestStatus)) {
            throw new BadRequestException("Invalid change status: '" + requestStatus + "'. Allowed values: " + VALID_CHANGE_STATUSES);
        }

        // 2. Validate environment
        String environment = request.getEnvironment() != null && !request.getEnvironment().trim().isEmpty()
                ? request.getEnvironment().trim().toUpperCase()
                : codeChange.getEnvironment();
        if (!VALID_ENVIRONMENTS.contains(environment)) {
            throw new BadRequestException("Invalid environment: '" + environment + "'. Allowed values: " + VALID_ENVIRONMENTS);
        }

        // 3. Status Transition Rules
        if ("COMMITTED".equals(codeChange.getChangeStatus())) {
            // Cannot revert from COMMITTED to UNCOMMITTED
            if ("UNCOMMITTED".equals(requestStatus)) {
                throw new BadRequestException("Cannot revert a COMMITTED code change to UNCOMMITTED");
            }
            // Must have non-blank SVN commit ID
            if (request.getSvnCommitId() == null || request.getSvnCommitId().trim().isEmpty()) {
                throw new BadRequestException("SVN Commit ID cannot be removed for a COMMITTED code change");
            }
            String trimmedCommitId = request.getSvnCommitId().trim();
            if (codeChangeRepository.existsBySvnCommitIdAndCodeChangeIdNot(trimmedCommitId, codeChangeId)) {
                throw new ConflictException("SVN Commit ID '" + trimmedCommitId + "' is already in use by another code change");
            }
            codeChange.setSvnCommitId(trimmedCommitId);
        } else {
            // Existing is UNCOMMITTED
            if ("COMMITTED".equals(requestStatus)) {
                // Transition: UNCOMMITTED -> COMMITTED
                if (request.getSvnCommitId() == null || request.getSvnCommitId().trim().isEmpty()) {
                    throw new BadRequestException("SVN Commit ID is required when transitioning to COMMITTED");
                }
                String trimmedCommitId = request.getSvnCommitId().trim();
                if (codeChangeRepository.existsBySvnCommitIdAndCodeChangeIdNot(trimmedCommitId, codeChangeId)) {
                    throw new ConflictException("SVN Commit ID '" + trimmedCommitId + "' is already in use by another code change");
                }
                codeChange.setChangeStatus("COMMITTED");
                codeChange.setSvnCommitId(trimmedCommitId);
                // Update commit datetime to commit time (request value or now)
                codeChange.setChangeDatetime(request.getChangeDatetime() != null ? request.getChangeDatetime() : Instant.now());
            } else {
                // Remains UNCOMMITTED
                if (request.getSvnCommitId() != null && !request.getSvnCommitId().trim().isEmpty()) {
                    throw new BadRequestException("SVN Commit ID must be empty/null when status is UNCOMMITTED");
                }
                codeChange.setSvnCommitId(null);
            }
        }

        if (request.getChangeDatetime() != null) {
            codeChange.setChangeDatetime(request.getChangeDatetime());
        }
        codeChange.setEnvironment(environment);
        codeChange.setRemarks(request.getRemarks());

        CodeChange saved = codeChangeRepository.save(codeChange);
        log.info("Code change id: {} updated successfully", codeChangeId);

        return codeChangeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CommitSearchResponse searchBySvnCommitId(String svnCommitId) {
        if (svnCommitId == null || svnCommitId.trim().isEmpty()) {
            throw new BadRequestException("SVN Commit ID must not be blank");
        }
        String trimmed = svnCommitId.trim();
        CodeChange codeChange = codeChangeRepository.findBySvnCommitId(trimmed)
                .orElseThrow(() -> new ResourceNotFoundException("No code change found for SVN Commit ID: " + trimmed));
        return codeChangeMapper.toCommitSearchResponse(codeChange);
    }

    @Override
    @Transactional
    public CodeChangeFileDto addFile(Long codeChangeId, CodeChangeFileDto fileDto) {
        log.info("Adding file entry to code change id: {}", codeChangeId);
        CodeChange codeChange = codeChangeRepository.findById(codeChangeId)
                .orElseThrow(() -> new ResourceNotFoundException("Code change not found with id: " + codeChangeId));

        if (fileDto.getFilePath() == null || fileDto.getFilePath().trim().isEmpty()) {
            throw new BadRequestException("File path is required");
        }

        CodeChangeFile file = new CodeChangeFile(
                codeChangeId,
                fileDto.getLayer(),
                fileDto.getTechnology(),
                fileDto.getFilePath().trim(),
                fileDto.getWhatChanged(),
                fileDto.getWhyChanged(),
                fileDto.getAffectedFiles(),
                fileDto.getRemarks()
        );

        CodeChangeFile saved = codeChangeFileRepository.save(file);
        log.info("File entry id: {} added to code change id: {}", saved.getCodeChangeFileId(), codeChangeId);
        return codeChangeMapper.toFileDto(saved);
    }

    @Override
    @Transactional
    public CodeChangeFileDto updateFile(Long codeChangeId, Long fileId, CodeChangeFileDto fileDto) {
        log.info("Updating file id: {} for code change id: {}", fileId, codeChangeId);
        if (!codeChangeRepository.existsById(codeChangeId)) {
            throw new ResourceNotFoundException("Code change not found with id: " + codeChangeId);
        }

        CodeChangeFile file = codeChangeFileRepository.findByCodeChangeFileIdAndCodeChangeId(fileId, codeChangeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "File entry not found with id: " + fileId + " for code change id: " + codeChangeId));

        if (fileDto.getFilePath() == null || fileDto.getFilePath().trim().isEmpty()) {
            throw new BadRequestException("File path is required");
        }

        file.setLayer(fileDto.getLayer());
        file.setTechnology(fileDto.getTechnology());
        file.setFilePath(fileDto.getFilePath().trim());
        file.setWhatChanged(fileDto.getWhatChanged());
        file.setWhyChanged(fileDto.getWhyChanged());
        file.setAffectedFiles(fileDto.getAffectedFiles());
        file.setRemarks(fileDto.getRemarks());

        CodeChangeFile saved = codeChangeFileRepository.save(file);
        return codeChangeMapper.toFileDto(saved);
    }

    @Override
    @Transactional
    public void deleteFile(Long codeChangeId, Long fileId) {
        log.info("Deleting file id: {} from code change id: {}", fileId, codeChangeId);
        if (!codeChangeRepository.existsById(codeChangeId)) {
            throw new ResourceNotFoundException("Code change not found with id: " + codeChangeId);
        }

        CodeChangeFile file = codeChangeFileRepository.findByCodeChangeFileIdAndCodeChangeId(fileId, codeChangeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "File entry not found with id: " + fileId + " for code change id: " + codeChangeId));

        codeChangeFileRepository.delete(file);
        log.info("File id: {} deleted successfully without affecting parent code change id: {}", fileId, codeChangeId);
    }
}
