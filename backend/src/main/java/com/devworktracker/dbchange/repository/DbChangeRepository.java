package com.devworktracker.dbchange.repository;

import com.devworktracker.dbchange.entity.DbChange;
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
public interface DbChangeRepository extends JpaRepository<DbChange, Long>, JpaSpecificationExecutor<DbChange> {

    @Query(value = "SELECT nextval('seq_db_change_code')", nativeQuery = true)
    Long getNextDbChangeCodeSequence();

    Optional<DbChange> findByDbChangeCode(String dbChangeCode);

    List<DbChange> findByWorkLogId(Long workLogId);

    List<DbChange> findByWorkLogIdIn(List<Long> workLogIds);

    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project"})
    List<DbChange> findAllBy(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project"})
    Page<DbChange> findAll(Specification<DbChange> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project"})
    List<DbChange> findAll(Specification<DbChange> spec, org.springframework.data.domain.Sort sort);

    @Override
    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project"})
    Optional<DbChange> findById(Long id);
}
