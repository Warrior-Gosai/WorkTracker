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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DbChangeServiceImpl implements DbChangeService {

    private static final Logger log = LoggerFactory.getLogger(DbChangeServiceImpl.class);
    private static final int MAX_PAGE_SIZE = 100;

    public static final Set<String> VALID_ENVIRONMENTS = Set.of(
            "LOCAL",
            "UAT",
            "LIVE"
    );

    public static final Set<String> VALID_DATABASES = Set.of(
            "Oracle",
            "PostgreSQL",
            "MySQL",
            "SQL Server",
            "MongoDB",
            "Other"
    );

    public static final Set<String> VALID_OBJECT_TYPES = Set.of(
            "Table",
            "Procedure",
            "Function",
            "Trigger",
            "View",
            "Package",
            "Cursor",
            "Sequence",
            "Index",
            "Constraint",
            "Other"
    );

    private static final Map<String, String> SORT_ALLOWLIST = Map.of(
            "createdAt", "createdAt",
            "updatedAt", "updatedAt",
            "dbChangeId", "dbChangeId",
            "dbChangeCode", "dbChangeCode",
            "environment", "environment",
            "databaseName", "databaseName",
            "objectType", "objectType",
            "objectName", "objectName"
    );

    private final DbChangeRepository dbChangeRepository;
    private final WorkLogRepository workLogRepository;
    private final DbChangeMapper dbChangeMapper;

    public DbChangeServiceImpl(
            DbChangeRepository dbChangeRepository,
            WorkLogRepository workLogRepository,
            DbChangeMapper dbChangeMapper) {
        this.dbChangeRepository = dbChangeRepository;
        this.workLogRepository = workLogRepository;
        this.dbChangeMapper = dbChangeMapper;
    }

    @Override
    @Transactional
    public DbChangeResponse createDbChange(CreateDbChangeRequest request) {
        log.info("Creating DB change for work log ID: {}", request.getWorkLogId());

        // 1. Validate work log exists
        WorkLog workLog = workLogRepository.findById(request.getWorkLogId())
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found with id: " + request.getWorkLogId()));

        // 2. Validate environment
        String environment = normalizeEnvironment(request.getEnvironment());
        if (environment == null) {
            throw new BadRequestException("Invalid environment: '" + request.getEnvironment()
                    + "'. Allowed values: " + VALID_ENVIRONMENTS);
        }

        // 3. Validate database name
        String databaseName = normalizeDatabaseName(request.getDatabaseName());
        if (databaseName == null) {
            throw new BadRequestException("Invalid database name: '" + request.getDatabaseName()
                    + "'. Allowed values: " + VALID_DATABASES);
        }

        // 4. Validate object type
        String objectType = normalizeObjectType(request.getObjectType());
        if (objectType == null) {
            throw new BadRequestException("Invalid object type: '" + request.getObjectType()
                    + "'. Allowed values: " + VALID_OBJECT_TYPES);
        }

        // 5. Validate object name
        if (request.getObjectName() == null || request.getObjectName().trim().isEmpty()) {
            throw new BadRequestException("Object name is required and cannot be empty");
        }
        String objectName = request.getObjectName().trim();
        if (objectName.length() > 200) {
            throw new BadRequestException("Object name cannot exceed 200 characters");
        }

        // 6. Validate why changed
        if (request.getWhyChanged() == null || request.getWhyChanged().trim().isEmpty()) {
            throw new BadRequestException("Why changed is required");
        }
        String whyChanged = request.getWhyChanged().trim();

        // 7. Optional fields
        String whatChanged = request.getWhatChanged() != null && !request.getWhatChanged().trim().isEmpty()
                ? request.getWhatChanged().trim()
                : null;
        String affectedObject = request.getAffectedObject() != null && !request.getAffectedObject().trim().isEmpty()
                ? request.getAffectedObject().trim()
                : null;
        String remarks = request.getRemarks() != null && !request.getRemarks().trim().isEmpty()
                ? request.getRemarks().trim()
                : null;

        // 8. Generate sequence-based db change code: DB-%06d
        Long seqVal = dbChangeRepository.getNextDbChangeCodeSequence();
        String dbChangeCode = String.format("DB-%06d", seqVal);

        DbChange dbChange = new DbChange(
                dbChangeCode,
                workLog.getWorkLogId(),
                environment,
                databaseName,
                objectType,
                objectName,
                whatChanged,
                whyChanged,
                affectedObject,
                remarks
        );
        dbChange.setWorkLog(workLog);

        DbChange saved = dbChangeRepository.save(dbChange);
        log.info("DB change created successfully with code: {} and ID: {}", dbChangeCode, saved.getDbChangeId());

        return dbChangeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DbChangeResponse> getDbChanges(
            String search,
            Long workLogId,
            Long taskItemId,
            Long projectId,
            LocalDate dateFrom,
            LocalDate dateTo,
            String environment,
            String databaseName,
            String objectType,
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

        String sortField = sortBy != null && !sortBy.trim().isEmpty() ? sortBy.trim() : "createdAt";
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

        Specification<DbChange> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<Object, Object> workLogJoin = null;

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeLike = cb.like(cb.lower(root.get("dbChangeCode")), pattern);
                Predicate objNameLike = cb.like(cb.lower(root.get("objectName")), pattern);
                Predicate dbNameLike = cb.like(cb.lower(root.get("databaseName")), pattern);
                Predicate whyLike = cb.like(cb.lower(cb.coalesce(root.get("whyChanged"), "")), pattern);
                Predicate whatLike = cb.like(cb.lower(cb.coalesce(root.get("whatChanged"), "")), pattern);
                Predicate affectedLike = cb.like(cb.lower(cb.coalesce(root.get("affectedObject"), "")), pattern);
                Predicate remarksLike = cb.like(cb.lower(cb.coalesce(root.get("remarks"), "")), pattern);

                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                Predicate wlCodeLike = cb.like(cb.lower(workLogJoin.get("workLogCode")), pattern);

                Join<Object, Object> taskItemJoin = workLogJoin.join("taskItem", JoinType.LEFT);
                Predicate taskCodeLike = cb.like(cb.lower(taskItemJoin.get("taskItemCode")), pattern);

                Join<Object, Object> projectJoin = taskItemJoin.join("project", JoinType.LEFT);
                Predicate prjCodeLike = cb.like(cb.lower(projectJoin.get("projectCode")), pattern);
                Predicate prjNameLike = cb.like(cb.lower(projectJoin.get("projectName")), pattern);

                predicates.add(cb.or(
                        codeLike, objNameLike, dbNameLike, whyLike, whatLike,
                        affectedLike, remarksLike, wlCodeLike, taskCodeLike, prjCodeLike, prjNameLike
                ));
            }

            if (workLogId != null) {
                predicates.add(cb.equal(root.get("workLogId"), workLogId));
            }

            if (taskItemId != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                predicates.add(cb.equal(workLogJoin.get("taskItemId"), taskItemId));
            }

            if (projectId != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                Join<Object, Object> taskItemJoin = workLogJoin.join("taskItem", JoinType.LEFT);
                predicates.add(cb.equal(taskItemJoin.get("projectId"), projectId));
            }

            if (dateFrom != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                predicates.add(cb.greaterThanOrEqualTo(workLogJoin.get("workDate"), dateFrom));
            }

            if (dateTo != null) {
                if (workLogJoin == null) {
                    workLogJoin = root.join("workLog", JoinType.LEFT);
                }
                predicates.add(cb.lessThanOrEqualTo(workLogJoin.get("workDate"), dateTo));
            }

            if (environment != null && !environment.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("environment"), environment.trim().toUpperCase()));
            }

            if (databaseName != null && !databaseName.trim().isEmpty()) {
                String normDb = normalizeDatabaseName(databaseName);
                predicates.add(cb.equal(root.get("databaseName"), normDb != null ? normDb : databaseName.trim()));
            }

            if (objectType != null && !objectType.trim().isEmpty()) {
                String normObj = normalizeObjectType(objectType);
                predicates.add(cb.equal(root.get("objectType"), normObj != null ? normObj : objectType.trim()));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(dir, SORT_ALLOWLIST.get(sortField)).and(Sort.by(Sort.Direction.DESC, "dbChangeId"));
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DbChange> pageResult = dbChangeRepository.findAll(spec, pageable);

        return PageResponse.from(pageResult.map(dbChangeMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public DbChangeResponse getDbChangeById(Long dbChangeId) {
        DbChange dbChange = dbChangeRepository.findById(dbChangeId)
                .orElseThrow(() -> new ResourceNotFoundException("DB change not found with id: " + dbChangeId));
        return dbChangeMapper.toResponse(dbChange);
    }

    @Override
    @Transactional
    public DbChangeResponse updateDbChange(Long dbChangeId, UpdateDbChangeRequest request) {
        log.info("Updating DB change ID: {}", dbChangeId);

        DbChange dbChange = dbChangeRepository.findById(dbChangeId)
                .orElseThrow(() -> new ResourceNotFoundException("DB change not found with id: " + dbChangeId));

        // 1. Validate environment
        String environment = normalizeEnvironment(request.getEnvironment());
        if (environment == null) {
            throw new BadRequestException("Invalid environment: '" + request.getEnvironment()
                    + "'. Allowed values: " + VALID_ENVIRONMENTS);
        }

        // 2. Validate database name
        String databaseName = normalizeDatabaseName(request.getDatabaseName());
        if (databaseName == null) {
            throw new BadRequestException("Invalid database name: '" + request.getDatabaseName()
                    + "'. Allowed values: " + VALID_DATABASES);
        }

        // 3. Validate object type
        String objectType = normalizeObjectType(request.getObjectType());
        if (objectType == null) {
            throw new BadRequestException("Invalid object type: '" + request.getObjectType()
                    + "'. Allowed values: " + VALID_OBJECT_TYPES);
        }

        // 4. Validate object name
        if (request.getObjectName() == null || request.getObjectName().trim().isEmpty()) {
            throw new BadRequestException("Object name is required and cannot be empty");
        }
        String objectName = request.getObjectName().trim();
        if (objectName.length() > 200) {
            throw new BadRequestException("Object name cannot exceed 200 characters");
        }

        // 5. Validate why changed
        if (request.getWhyChanged() == null || request.getWhyChanged().trim().isEmpty()) {
            throw new BadRequestException("Why changed is required");
        }
        String whyChanged = request.getWhyChanged().trim();

        // 6. Optional fields
        String whatChanged = request.getWhatChanged() != null && !request.getWhatChanged().trim().isEmpty()
                ? request.getWhatChanged().trim()
                : null;
        String affectedObject = request.getAffectedObject() != null && !request.getAffectedObject().trim().isEmpty()
                ? request.getAffectedObject().trim()
                : null;
        String remarks = request.getRemarks() != null && !request.getRemarks().trim().isEmpty()
                ? request.getRemarks().trim()
                : null;

        // Note: dbChangeId, dbChangeCode, workLogId remain immutable
        dbChange.setEnvironment(environment);
        dbChange.setDatabaseName(databaseName);
        dbChange.setObjectType(objectType);
        dbChange.setObjectName(objectName);
        dbChange.setWhatChanged(whatChanged);
        dbChange.setWhyChanged(whyChanged);
        dbChange.setAffectedObject(affectedObject);
        dbChange.setRemarks(remarks);

        DbChange updated = dbChangeRepository.save(dbChange);
        log.info("DB change ID: {} updated successfully", dbChangeId);

        return dbChangeMapper.toResponse(updated);
    }

    private String normalizeEnvironment(String env) {
        if (env == null) return null;
        for (String valid : VALID_ENVIRONMENTS) {
            if (valid.equalsIgnoreCase(env.trim())) {
                return valid;
            }
        }
        return null;
    }

    private String normalizeDatabaseName(String dbName) {
        if (dbName == null) return null;
        for (String valid : VALID_DATABASES) {
            if (valid.equalsIgnoreCase(dbName.trim())) {
                return valid;
            }
        }
        return null;
    }

    private String normalizeObjectType(String objType) {
        if (objType == null) return null;
        for (String valid : VALID_OBJECT_TYPES) {
            if (valid.equalsIgnoreCase(objType.trim())) {
                return valid;
            }
        }
        return null;
    }
}
