package com.devworktracker.taskitem.repository;

import com.devworktracker.taskitem.entity.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskItemRepository extends JpaRepository<TaskItem, Long>, JpaSpecificationExecutor<TaskItem> {

    @Query(value = "SELECT nextval('seq_task_item_code')", nativeQuery = true)
    Long getNextTaskItemCodeSequence();

    Optional<TaskItem> findByTaskItemCode(String taskItemCode);

    Optional<TaskItem> findByTaskItemIdAndIsActive(Long taskItemId, Short isActive);

    long countByIsActive(Short isActive);

    long countByIsActiveAndStatusIn(Short isActive, java.util.Collection<String> statuses);

    long countByProjectIdAndIsActive(Long projectId, Short isActive);

    long countByProjectIdAndIsActiveAndStatusIn(Long projectId, Short isActive, java.util.Collection<String> statuses);

    long countByProjectIdAndIsActiveAndStatus(Long projectId, Short isActive, String status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"project"})
    java.util.List<TaskItem> findByIsActive(Short isActive, org.springframework.data.domain.Pageable pageable);
}

