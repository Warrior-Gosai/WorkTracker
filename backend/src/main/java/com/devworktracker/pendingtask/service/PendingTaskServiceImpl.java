package com.devworktracker.pendingtask.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.pendingtask.dto.CreatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.PendingTaskResponse;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskRequest;
import com.devworktracker.pendingtask.dto.UpdatePendingTaskStatusRequest;
import com.devworktracker.pendingtask.entity.PendingTask;
import com.devworktracker.pendingtask.mapper.PendingTaskMapper;
import com.devworktracker.pendingtask.repository.PendingTaskRepository;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.repository.ProjectRepository;
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
import java.util.*;

@Service
public class PendingTaskServiceImpl implements PendingTaskService {

    private static final Logger log = LoggerFactory.getLogger(PendingTaskServiceImpl.class);

    private static final Set<String> VALID_PRIORITIES = Set.of(
            "LOW", "MEDIUM", "HIGH", "CRITICAL"
    );

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"
    );

    private static final List<String> DEFAULT_STATUS_LIST = List.of(
            "PENDING", "IN_PROGRESS", "ON_HOLD"
    );

    private static final Map<String, String> SORT_ALLOWLIST = Map.of(
            "dueDate", "dueDate",
            "pendingTaskId", "pendingTaskId",
            "pendingTaskCode", "pendingTaskCode",
            "title", "title",
            "priority", "priority",
            "status", "status",
            "completedAt", "completedAt",
            "createdAt", "createdAt",
            "updatedAt", "updatedAt"
    );

    private final PendingTaskRepository pendingTaskRepository;
    private final ProjectRepository projectRepository;
    private final PendingTaskMapper pendingTaskMapper;

    public PendingTaskServiceImpl(
            PendingTaskRepository pendingTaskRepository,
            ProjectRepository projectRepository,
            PendingTaskMapper pendingTaskMapper) {
        this.pendingTaskRepository = pendingTaskRepository;
        this.projectRepository = projectRepository;
        this.pendingTaskMapper = pendingTaskMapper;
    }

    @Override
    @Transactional
    public PendingTaskResponse createPendingTask(CreatePendingTaskRequest request) {
        log.info("Creating pending task with title: '{}' for project ID: {}", request.getTitle(), request.getProjectId());

        // 1. Validate project exists and is active
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        if (project.getStatus() != 1) {
            throw new BadRequestException("Cannot create a pending task for an inactive project (Project "
                    + project.getProjectCode() + " is inactive)");
        }

        // 2. Validate priority (default: MEDIUM)
        String priority = normalizePriority(request.getPriority());

        // 3. Validate status (default: PENDING)
        String status = normalizeStatus(request.getStatus());

        // 4. Completion timestamp rule on creation
        Instant completedAt = "COMPLETED".equals(status) ? Instant.now() : null;

        // 5. Generate sequence-based pending task code: PT-%06d
        Long seqVal = pendingTaskRepository.getNextPendingTaskCodeSequence();
        if (seqVal == null) {
            throw new IllegalStateException("Failed to obtain nextval from sequence seq_pending_task_code");
        }
        String pendingTaskCode = String.format("PT-%06d", seqVal);

        // 6. Persist PendingTask
        PendingTask pendingTask = new PendingTask(
                pendingTaskCode,
                project.getProjectId(),
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                priority,
                status,
                request.getDueDate(),
                completedAt,
                request.getRemarks() != null ? request.getRemarks().trim() : null
        );
        pendingTask.setProject(project);

        PendingTask saved = pendingTaskRepository.save(pendingTask);
        log.info("Pending task created successfully with code: {} and ID: {}", pendingTaskCode, saved.getPendingTaskId());
        return pendingTaskMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PendingTaskResponse> getPendingTasks(
            String search,
            Long projectId,
            String priority,
            String status,
            LocalDate dueDateFrom,
            LocalDate dueDateTo,
            Boolean overdue,
            int page,
            int size,
            String sortBy,
            String direction) {

        // Validate and clamp pagination
        if (page < 0) page = 0;
        if (size < 1) size = 10;
        if (size > 100) size = 100;

        // Determine sort
        String sortField = SORT_ALLOWLIST.getOrDefault(sortBy, "dueDate");
        boolean isAsc = "asc".equalsIgnoreCase(direction);

        Sort sort;
        if ("dueDate".equals(sortField)) {
            // Default sort: dueDate ASC with nulls last, pendingTaskId DESC secondary
            Sort.Order primary = isAsc
                    ? Sort.Order.asc("dueDate").nullsLast()
                    : Sort.Order.desc("dueDate").nullsLast();
            Sort.Order secondary = Sort.Order.desc("pendingTaskId");
            sort = Sort.by(primary, secondary);
        } else {
            Sort.Order primary = isAsc
                    ? Sort.Order.asc(sortField)
                    : Sort.Order.desc(sortField);
            Sort.Order secondary = Sort.Order.desc("pendingTaskId");
            sort = Sort.by(primary, secondary);
        }

        Specification<PendingTask> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search filter across code, title, description, remarks, and project code/name
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<PendingTask, Project> projectJoin = root.join("project", JoinType.LEFT);

                Predicate codeLike = cb.like(cb.lower(root.get("pendingTaskCode")), pattern);
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(cb.coalesce(root.get("description"), "")), pattern);
                Predicate remarksLike = cb.like(cb.lower(cb.coalesce(root.get("remarks"), "")), pattern);
                Predicate prjCodeLike = cb.like(cb.lower(cb.coalesce(projectJoin.get("projectCode"), "")), pattern);
                Predicate prjNameLike = cb.like(cb.lower(cb.coalesce(projectJoin.get("projectName"), "")), pattern);

                predicates.add(cb.or(codeLike, titleLike, descLike, remarksLike, prjCodeLike, prjNameLike));
            }

            // Project ID filter
            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }

            // Priority filter
            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("priority")), priority.trim().toUpperCase()));
            }

            // Status filter:
            // Default list behavior: PENDING, IN_PROGRESS, ON_HOLD when status is null, blank or empty
            // Explicit "ALL" removes the status filter
            // Specific status filters by that status
            if (status == null || status.trim().isEmpty()) {
                predicates.add(root.get("status").in(DEFAULT_STATUS_LIST));
            } else if (!"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            // Due Date Range filters
            if (dueDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateFrom));
            }
            if (dueDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateTo));
            }

            // Overdue filter:
            // A pending task is overdue when due_date < CURRENT_DATE and status NOT IN ('COMPLETED', 'CANCELLED')
            if (overdue != null) {
                LocalDate today = LocalDate.now();
                Predicate isBeforeToday = cb.lessThan(root.get("dueDate"), today);
                Predicate hasDueDate = cb.isNotNull(root.get("dueDate"));
                Predicate notCompletedOrCancelled = root.get("status").in("COMPLETED", "CANCELLED").not();

                if (Boolean.TRUE.equals(overdue)) {
                    predicates.add(cb.and(hasDueDate, isBeforeToday, notCompletedOrCancelled));
                } else {
                    // Not overdue: dueDate is null OR dueDate >= today OR status is COMPLETED/CANCELLED
                    Predicate nullDueDate = cb.isNull(root.get("dueDate"));
                    Predicate todayOrLater = cb.greaterThanOrEqualTo(root.get("dueDate"), today);
                    Predicate isCompletedOrCancelled = root.get("status").in("COMPLETED", "CANCELLED");
                    predicates.add(cb.or(nullDueDate, todayOrLater, isCompletedOrCancelled));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PendingTask> pageResult = pendingTaskRepository.findAll(spec, pageable);

        return PageResponse.from(pageResult.map(pendingTaskMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PendingTaskResponse getPendingTaskById(Long pendingTaskId) {
        PendingTask pendingTask = pendingTaskRepository.findByPendingTaskId(pendingTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Pending task not found with id: " + pendingTaskId));
        return pendingTaskMapper.toResponse(pendingTask);
    }

    @Override
    @Transactional
    public PendingTaskResponse updatePendingTask(Long pendingTaskId, UpdatePendingTaskRequest request) {
        log.info("Updating pending task id: {}", pendingTaskId);

        // Historical pending tasks belonging to inactive projects remain editable
        PendingTask pendingTask = pendingTaskRepository.findByPendingTaskId(pendingTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Pending task not found with id: " + pendingTaskId));

        String priority = normalizePriority(request.getPriority());
        String newStatus = normalizeStatus(request.getStatus());
        String oldStatus = pendingTask.getStatus();

        // Apply completion timestamp rules:
        // 1. When status changes to COMPLETED, set completed_at to current timestamp.
        // 2. When status remains COMPLETED, preserve existing completed_at.
        // 3. When status changes from COMPLETED to another status, clear completed_at.
        if ("COMPLETED".equals(newStatus)) {
            if (!"COMPLETED".equals(oldStatus) || pendingTask.getCompletedAt() == null) {
                pendingTask.setCompletedAt(Instant.now());
            }
        } else {
            pendingTask.setCompletedAt(null);
        }

        pendingTask.setTitle(request.getTitle().trim());
        pendingTask.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        pendingTask.setPriority(priority);
        pendingTask.setStatus(newStatus);
        pendingTask.setDueDate(request.getDueDate());
        pendingTask.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        PendingTask saved = pendingTaskRepository.save(pendingTask);
        log.info("Pending task id: {} updated successfully", pendingTaskId);
        return pendingTaskMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PendingTaskResponse updatePendingTaskStatus(Long pendingTaskId, UpdatePendingTaskStatusRequest request) {
        log.info("Updating status for pending task id: {} to '{}'", pendingTaskId, request.getStatus());

        PendingTask pendingTask = pendingTaskRepository.findByPendingTaskId(pendingTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Pending task not found with id: " + pendingTaskId));

        String newStatus = normalizeStatus(request.getStatus());
        String oldStatus = pendingTask.getStatus();

        if ("COMPLETED".equals(newStatus)) {
            if (!"COMPLETED".equals(oldStatus) || pendingTask.getCompletedAt() == null) {
                pendingTask.setCompletedAt(Instant.now());
            }
        } else {
            pendingTask.setCompletedAt(null);
        }

        pendingTask.setStatus(newStatus);
        PendingTask saved = pendingTaskRepository.save(pendingTask);
        log.info("Pending task id: {} status updated from '{}' to '{}'", pendingTaskId, oldStatus, newStatus);
        return pendingTaskMapper.toResponse(saved);
    }

    private String normalizePriority(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "MEDIUM";
        }
        String normalized = input.trim().toUpperCase();
        if (!VALID_PRIORITIES.contains(normalized)) {
            throw new BadRequestException("Invalid priority: '" + input + "'. Allowed values: " + VALID_PRIORITIES);
        }
        return normalized;
    }

    private String normalizeStatus(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "PENDING";
        }
        String normalized = input.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalized)) {
            throw new BadRequestException("Invalid status: '" + input + "'. Allowed values: " + VALID_STATUSES);
        }
        return normalized;
    }
}

