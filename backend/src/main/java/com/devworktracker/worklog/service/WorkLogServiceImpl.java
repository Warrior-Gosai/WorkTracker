package com.devworktracker.worklog.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.taskitem.repository.TaskItemRepository;
import com.devworktracker.worklog.dto.CreateWorkLogRequest;
import com.devworktracker.worklog.dto.UpdateWorkLogRequest;
import com.devworktracker.worklog.dto.WorkLogResponse;
import com.devworktracker.worklog.entity.WorkLog;
import com.devworktracker.worklog.mapper.WorkLogMapper;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class WorkLogServiceImpl implements WorkLogService {

    private static final Logger log = LoggerFactory.getLogger(WorkLogServiceImpl.class);
    private static final int MAX_PAGE_SIZE = 100;

    public static final Set<String> VALID_WORK_TYPES = Set.of(
            "DEVELOPMENT",
            "BUG_FIXING",
            "TESTING",
            "DEBUGGING",
            "INVESTIGATION",
            "ENHANCEMENT",
            "DOCUMENTATION",
            "DEPLOYMENT",
            "MAINTENANCE",
            "OTHER"
    );

    public static final Set<String> VALID_ENVIRONMENTS = Set.of(
            "LOCAL",
            "UAT",
            "LIVE"
    );

    public static final Set<String> VALID_STATUSES = Set.of(
            "COMPLETED",
            "IN_PROGRESS",
            "BLOCKED",
            "ON_HOLD"
    );

    private static final Map<String, String> SORT_ALLOWLIST = Map.of(
            "workDate", "workDate",
            "workLogId", "workLogId",
            "workLogCode", "workLogCode",
            "environment", "environment",
            "workType", "workType",
            "status", "status",
            "createdAt", "createdAt",
            "updatedAt", "updatedAt",
            "startTime", "startTime",
            "endTime", "endTime"
    );

    private final WorkLogRepository workLogRepository;
    private final TaskItemRepository taskItemRepository;
    private final WorkLogMapper workLogMapper;

    public WorkLogServiceImpl(
            WorkLogRepository workLogRepository,
            TaskItemRepository taskItemRepository,
            WorkLogMapper workLogMapper) {
        this.workLogRepository = workLogRepository;
        this.taskItemRepository = taskItemRepository;
        this.workLogMapper = workLogMapper;
    }

    @Override
    @Transactional
    public WorkLogResponse createWorkLog(CreateWorkLogRequest request) {
        log.info("Creating work log for task item ID: {}", request.getTaskItemId());

        // 1. Validate task item exists and is active
        TaskItem taskItem = taskItemRepository.findById(request.getTaskItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Task item not found with id: " + request.getTaskItemId()));

        if (taskItem.getIsActive() != 1) {
            throw new BadRequestException("Cannot create a work log for an inactive task item (Task "
                    + taskItem.getTaskItemCode() + " is inactive)");
        }

        // 2. Validate workType
        String workType = request.getWorkType() != null ? request.getWorkType().trim() : "";
        if (!VALID_WORK_TYPES.contains(workType)) {
            throw new BadRequestException("Invalid work type: '" + workType + "'. Allowed values: " + VALID_WORK_TYPES);
        }

        // 3. Validate environment (default: LOCAL)
        String environment = request.getEnvironment() != null && !request.getEnvironment().trim().isEmpty()
                ? request.getEnvironment().trim()
                : "LOCAL";
        if (!VALID_ENVIRONMENTS.contains(environment)) {
            throw new BadRequestException("Invalid environment: '" + environment + "'. Allowed values: " + VALID_ENVIRONMENTS);
        }

        // 4. Validate status (default: IN_PROGRESS)
        String status = request.getStatus() != null && !request.getStatus().trim().isEmpty()
                ? request.getStatus().trim()
                : "IN_PROGRESS";
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid status: '" + status + "'. Allowed values: " + VALID_STATUSES);
        }

        // 5. Validate taskRequirement
        String taskRequirement = request.getTaskRequirement() != null ? request.getTaskRequirement().trim() : "";
        if (taskRequirement.isEmpty()) {
            throw new BadRequestException("Task requirement is required");
        }

        // 6. Validate start/end time pairing
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();
        validateTimePair(startTime, endTime);

        // 7. Work date default
        LocalDate workDate = request.getWorkDate() != null ? request.getWorkDate() : LocalDate.now();

        // 8. Generate sequence-based work log code: WL-%06d
        Long seqVal = workLogRepository.getNextWorkLogCodeSequence();
        String workLogCode = String.format("WL-%06d", seqVal);

        WorkLog workLog = new WorkLog(
                workLogCode,
                taskItem.getTaskItemId(),
                workDate,
                environment,
                workType,
                taskRequirement,
                request.getWorkDescription(),
                request.getPurposeReason(),
                request.getTechnologyArea(),
                startTime,
                endTime,
                status,
                request.getProblemBlocker(),
                request.getSolutionResolution(),
                request.getTestingVerification(),
                request.getResultOutcome(),
                request.getPendingNextAction(),
                request.getNotesRemarks()
        );

        // Associate taskItem to workLog instance for immediate mapping without re-querying
        workLog.setTaskItem(taskItem);

        WorkLog savedWorkLog = workLogRepository.save(workLog);
        log.info("Work log created successfully with code: {} and ID: {}", workLogCode, savedWorkLog.getWorkLogId());

        return workLogMapper.toResponse(savedWorkLog);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkLogResponse> getWorkLogs(
            String search,
            Long taskItemId,
            Long projectId,
            LocalDate workDateFrom,
            LocalDate workDateTo,
            String environment,
            String workType,
            String status,
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

        String sortField = sortBy != null && !sortBy.trim().isEmpty() ? sortBy.trim() : "workDate";
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

        Specification<WorkLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeLike = cb.like(cb.lower(root.get("workLogCode")), pattern);
                Predicate reqLike = cb.like(cb.lower(root.get("taskRequirement")), pattern);
                predicates.add(cb.or(codeLike, reqLike));
            }

            if (taskItemId != null) {
                predicates.add(cb.equal(root.get("taskItemId"), taskItemId));
            }

            if (projectId != null) {
                Join<WorkLog, TaskItem> taskItemJoin = root.join("taskItem", JoinType.LEFT);
                predicates.add(cb.equal(taskItemJoin.get("projectId"), projectId));
            }

            if (workDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("workDate"), workDateFrom));
            }

            if (workDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("workDate"), workDateTo));
            }

            if (environment != null && !environment.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("environment"), environment.trim()));
            }

            if (workType != null && !workType.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("workType"), workType.trim()));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort;
        if ("workDate".equals(sortField)) {
            sort = Sort.by(dir, "workDate").and(Sort.by(dir, "workLogId"));
        } else {
            sort = Sort.by(dir, SORT_ALLOWLIST.get(sortField)).and(Sort.by(Sort.Direction.DESC, "workLogId"));
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<WorkLog> pageResult = workLogRepository.findAll(spec, pageable);

        return PageResponse.from(pageResult.map(workLogMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public WorkLogResponse getWorkLogById(Long workLogId) {
        WorkLog workLog = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found with id: " + workLogId));
        return workLogMapper.toResponse(workLog);
    }

    @Override
    @Transactional
    public WorkLogResponse updateWorkLog(Long workLogId, UpdateWorkLogRequest request) {
        log.info("Updating work log id: {}", workLogId);

        WorkLog workLog = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found with id: " + workLogId));

        // Note: Task item association remains immutable and is not updated.
        // Editing remains allowed even if the associated task item has become inactive.

        // 1. Validate workType
        String workType = request.getWorkType() != null ? request.getWorkType().trim() : "";
        if (!VALID_WORK_TYPES.contains(workType)) {
            throw new BadRequestException("Invalid work type: '" + workType + "'. Allowed values: " + VALID_WORK_TYPES);
        }

        // 2. Validate environment
        String environment = request.getEnvironment() != null && !request.getEnvironment().trim().isEmpty()
                ? request.getEnvironment().trim()
                : "LOCAL";
        if (!VALID_ENVIRONMENTS.contains(environment)) {
            throw new BadRequestException("Invalid environment: '" + environment + "'. Allowed values: " + VALID_ENVIRONMENTS);
        }

        // 3. Validate status
        String status = request.getStatus() != null && !request.getStatus().trim().isEmpty()
                ? request.getStatus().trim()
                : "IN_PROGRESS";
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid status: '" + status + "'. Allowed values: " + VALID_STATUSES);
        }

        // 4. Validate taskRequirement
        String taskRequirement = request.getTaskRequirement() != null ? request.getTaskRequirement().trim() : "";
        if (taskRequirement.isEmpty()) {
            throw new BadRequestException("Task requirement is required");
        }

        // 5. Validate start/end time pairing
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();
        validateTimePair(startTime, endTime);

        // 6. Update mutable fields
        if (request.getWorkDate() != null) {
            workLog.setWorkDate(request.getWorkDate());
        }
        workLog.setEnvironment(environment);
        workLog.setWorkType(workType);
        workLog.setTaskRequirement(taskRequirement);
        workLog.setWorkDescription(request.getWorkDescription());
        workLog.setPurposeReason(request.getPurposeReason());
        workLog.setTechnologyArea(request.getTechnologyArea());
        workLog.setStartTime(startTime);
        workLog.setEndTime(endTime);
        workLog.setStatus(status);
        workLog.setProblemBlocker(request.getProblemBlocker());
        workLog.setSolutionResolution(request.getSolutionResolution());
        workLog.setTestingVerification(request.getTestingVerification());
        workLog.setResultOutcome(request.getResultOutcome());
        workLog.setPendingNextAction(request.getPendingNextAction());
        workLog.setNotesRemarks(request.getNotesRemarks());

        WorkLog updatedWorkLog = workLogRepository.save(workLog);
        log.info("Work log id: {} updated successfully", workLogId);

        return workLogMapper.toResponse(updatedWorkLog);
    }

    private void validateTimePair(LocalTime startTime, LocalTime endTime) {
        if ((startTime == null && endTime != null) || (startTime != null && endTime == null)) {
            throw new BadRequestException("Start time and end time must either both be provided or both be empty");
        }
    }
}
