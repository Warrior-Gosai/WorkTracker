package com.devworktracker.worklog.repository;

import com.devworktracker.worklog.entity.WorkLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long>, JpaSpecificationExecutor<WorkLog> {

    @Query(value = "SELECT nextval('seq_work_log_code')", nativeQuery = true)
    Long getNextWorkLogCodeSequence();

    Optional<WorkLog> findByWorkLogCode(String workLogCode);

    @Override
    @EntityGraph(attributePaths = {"taskItem", "taskItem.project"})
    Page<WorkLog> findAll(Specification<WorkLog> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"taskItem", "taskItem.project"})
    Optional<WorkLog> findById(Long id);
}

