package com.devworktracker.pendingtask.repository;

import com.devworktracker.pendingtask.entity.PendingTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PendingTaskRepository extends JpaRepository<PendingTask, Long>, JpaSpecificationExecutor<PendingTask> {

    @Query(value = "SELECT nextval('seq_pending_task_code')", nativeQuery = true)
    Long getNextPendingTaskCodeSequence();

    @EntityGraph(attributePaths = {"project"})
    Optional<PendingTask> findByPendingTaskId(Long pendingTaskId);

    @EntityGraph(attributePaths = {"project"})
    Optional<PendingTask> findByPendingTaskCode(String pendingTaskCode);

    @EntityGraph(attributePaths = {"project"})
    List<PendingTask> findByProjectId(Long projectId);

    @Override
    @EntityGraph(attributePaths = {"project"})
    Page<PendingTask> findAll(Specification<PendingTask> spec, Pageable pageable);
}

