package com.devworktracker.taskitem.service;

import com.devworktracker.common.exception.BadRequestException;
import com.devworktracker.common.exception.ResourceNotFoundException;
import com.devworktracker.common.response.PageResponse;
import com.devworktracker.project.entity.Project;
import com.devworktracker.project.repository.ProjectRepository;
import com.devworktracker.taskitem.dao.TaskItemHistoryDao;
import com.devworktracker.taskitem.dto.*;
import com.devworktracker.taskitem.entity.TaskItem;
import com.devworktracker.taskitem.mapper.TaskItemMapper;
import com.devworktracker.taskitem.repository.TaskItemRepository;
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
import java.util.*;

@Service
public class TaskItemServiceImpl implements TaskItemService {

    private static final Logger log = LoggerFactory.getLogger(TaskItemServiceImpl.class);

    private static final int MAX_PAGE_SIZE = 100;

    public static final Set<String> VALID_TASK_TYPES = Set.of(
            "FEATURE_DEVELOPMENT",
            "NEW_DEVELOPMENT",
            "BUG_FIX",
            "ISSUE_DEFECT",
            "ENHANCEMENT",
            "TECHNICAL_IMPROVEMENT",
            "MAINTENANCE",
            "RESEARCH_INVESTIGATION",
            "OTHER"
    );

    public static final Set<String> VALID_PRIORITIES = Set.of(
            "LOW", "MEDIUM", "HIGH", "CRITICAL"
    );

    public static final Set<String> VALID_STATUSES = Set.of(
            "OPEN", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"
    );

    private static final Map<String, String> SORT_ALLOWLIST = Map.of(
            "createdAt", "createdAt",
            "updatedAt", "updatedAt",
            "title", "title",
            "taskItemCode", "taskItemCode",
            "priority", "priority",
            "status", "status",
            "taskType", "taskType",
            "taskItemId", "taskItemId"
    );

    private final TaskItemRepository taskItemRepository;
    private final ProjectRepository projectRepository;
    private final TaskItemMapper taskItemMapper;
    private final TaskItemHistoryDao taskItemHistoryDao;

    public TaskItemServiceImpl(
            TaskItemRepository taskItemRepository,
            ProjectRepository projectRepository,
            TaskItemMapper taskItemMapper,
            TaskItemHistoryDao taskItemHistoryDao) {
        this.taskItemRepository = taskItemRepository;
        this.projectRepository = projectRepository;
        this.taskItemMapper = taskItemMapper;
        this.taskItemHistoryDao = taskItemHistoryDao;
    }

    @Override
    @Transactional
    public TaskItemResponse createTaskItem(CreateTaskItemRequest request) {
        log.info("Creating task item with title: '{}' for project ID: {}", request.getTitle(), request.getProjectId());

        // 1. Validate project exists and is active
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        if (project.getStatus() != 1) {
            throw new BadRequestException("Cannot create a task item for an inactive project (Project " + project.getProjectCode() + " is inactive)");
        }

        // 2. Validate taskType
        String taskType = request.getTaskType().trim();
        if (!VALID_TASK_TYPES.contains(taskType)) {
            throw new BadRequestException("Invalid task type: '" + taskType + "'. Allowed values: " + VALID_TASK_TYPES);
        }

        // 3. Validate priority (default: MEDIUM)
        String priority = request.getPriority() != null && !request.getPriority().trim().isEmpty()
                ? request.getPriority().trim()
                : "MEDIUM";
        if (!VALID_PRIORITIES.contains(priority)) {
            throw new BadRequestException("Invalid priority: '" + priority + "'. Allowed values: " + VALID_PRIORITIES);
        }

        // 4. Validate status (default: OPEN)
        String status = request.getStatus() != null && !request.getStatus().trim().isEmpty()
                ? request.getStatus().trim()
                : "OPEN";
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid status: '" + status + "'. Allowed values: " + VALID_STATUSES);
        }

        // 5. Completion timestamp rule on creation
        Instant completedAt = "COMPLETED".equals(status) ? Instant.now() : null;

        // 6. Generate sequence-based task item code: TASK-%06d
        Long seqVal = taskItemRepository.getNextTaskItemCodeSequence();
        if (seqVal == null) {
            throw new IllegalStateException("Failed to obtain nextval from sequence seq_task_item_code");
        }
        String taskItemCode = String.format("TASK-%06d", seqVal);

        // 7. Persist TaskItem
        TaskItem taskItem = new TaskItem(
                taskItemCode,
                project.getProjectId(),
                taskType,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                priority,
                status,
                (short) 1,
                completedAt,
                request.getRemarks() != null ? request.getRemarks().trim() : null
        );
        taskItem.setProject(project);

        TaskItem saved = taskItemRepository.save(taskItem);
        log.info("Task item created successfully with code: {} and ID: {}", saved.getTaskItemCode(), saved.getTaskItemId());
        return taskItemMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskItemResponse> getTaskItems(
            String search,
            Long projectId,
            String taskType,
            String priority,
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

        String sortField = sortBy != null ? sortBy.trim() : "createdAt";
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

        Specification<TaskItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Strictly filter active task items only
            predicates.add(cb.equal(root.get("isActive"), (short) 1));

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate codeLike = cb.like(cb.lower(root.get("taskItemCode")), pattern);
                predicates.add(cb.or(titleLike, codeLike));
            }

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }

            if (taskType != null && !taskType.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("taskType"), taskType.trim()));
            }

            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), priority.trim()));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, SORT_ALLOWLIST.get(sortField)));
        Page<TaskItem> pageResult = taskItemRepository.findAll(spec, pageable);

        return PageResponse.from(pageResult.map(taskItemMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public TaskItemResponse getTaskItemById(Long taskItemId) {
        TaskItem taskItem = taskItemRepository.findByTaskItemIdAndIsActive(taskItemId, (short) 1)
                .orElseThrow(() -> new ResourceNotFoundException("Task item not found with id: " + taskItemId));
        return taskItemMapper.toResponse(taskItem);
    }

    @Override
    @Transactional
    public TaskItemResponse updateTaskItem(Long taskItemId, UpdateTaskItemRequest request) {
        log.info("Updating task item id: {}", taskItemId);

        TaskItem taskItem = taskItemRepository.findByTaskItemIdAndIsActive(taskItemId, (short) 1)
                .orElseThrow(() -> new ResourceNotFoundException("Task item not found or is inactive with id: " + taskItemId));

        String taskType = request.getTaskType().trim();
        if (!VALID_TASK_TYPES.contains(taskType)) {
            throw new BadRequestException("Invalid task type: '" + taskType + "'. Allowed values: " + VALID_TASK_TYPES);
        }

        String priority = request.getPriority().trim();
        if (!VALID_PRIORITIES.contains(priority)) {
            throw new BadRequestException("Invalid priority: '" + priority + "'. Allowed values: " + VALID_PRIORITIES);
        }

        taskItem.setTaskType(taskType);
        taskItem.setTitle(request.getTitle().trim());
        taskItem.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        taskItem.setPriority(priority);
        taskItem.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        TaskItem saved = taskItemRepository.save(taskItem);
        log.info("Task item id: {} updated successfully", taskItemId);
        return taskItemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TaskItemResponse updateTaskStatus(Long taskItemId, UpdateTaskStatusRequest request) {
        log.info("Updating workflow status for task item id: {} to '{}'", taskItemId, request.getStatus());

        TaskItem taskItem = taskItemRepository.findByTaskItemIdAndIsActive(taskItemId, (short) 1)
                .orElseThrow(() -> new ResourceNotFoundException("Task item not found or is inactive with id: " + taskItemId));

        String newStatus = request.getStatus().trim();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Invalid status: '" + newStatus + "'. Allowed values: " + VALID_STATUSES);
        }

        String oldStatus = taskItem.getStatus();

        // Apply completion timestamp rules:
        // 1. When status changes to COMPLETED, set completed_at to the current timestamp.
        // 2. When status changes from COMPLETED to another status, clear completed_at.
        // 3. When status remains COMPLETED, preserve its existing completed_at.
        if ("COMPLETED".equals(newStatus)) {
            if (!"COMPLETED".equals(oldStatus) || taskItem.getCompletedAt() == null) {
                taskItem.setCompletedAt(Instant.now());
            }
        } else {
            taskItem.setCompletedAt(null);
        }

        taskItem.setStatus(newStatus);
        TaskItem saved = taskItemRepository.save(taskItem);
        log.info("Task item id: {} status updated from '{}' to '{}'", taskItemId, oldStatus, newStatus);
        return taskItemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TaskItemResponse deactivateTaskItem(Long taskItemId) {
        log.info("Deactivating task item id: {}", taskItemId);

        TaskItem taskItem = taskItemRepository.findById(taskItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Task item not found with id: " + taskItemId));

        if (taskItem.getIsActive() == 0) {
            log.info("Task item id: {} is already inactive", taskItemId);
            return taskItemMapper.toResponse(taskItem);
        }

        taskItem.setIsActive((short) 0);
        TaskItem saved = taskItemRepository.save(taskItem);
        log.info("Task item id: {} deactivated successfully. Historical work logs, code changes and db changes preserved.", taskItemId);
        return taskItemMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskItemHistoryResponse getTaskItemHistory(Long taskItemId) {
        log.info("Retrieving history for task item id: {}", taskItemId);

        TaskItem taskItem = taskItemRepository.findById(taskItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Task item not found with id: " + taskItemId));

        String projectCode = taskItem.getProject() != null ? taskItem.getProject().getProjectCode() : null;
        String projectName = taskItem.getProject() != null ? taskItem.getProject().getProjectName() : null;

        List<WorkLogHistoryDto> workLogs = taskItemHistoryDao.getHistoryForTaskItem(taskItemId);

        return new TaskItemHistoryResponse(
                taskItem.getTaskItemId(),
                taskItem.getTaskItemCode(),
                taskItem.getTitle(),
                taskItem.getProjectId(),
                projectCode,
                projectName,
                workLogs
        );
    }
}

