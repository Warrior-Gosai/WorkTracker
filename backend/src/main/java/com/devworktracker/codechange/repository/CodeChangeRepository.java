package com.devworktracker.codechange.repository;

import com.devworktracker.codechange.entity.CodeChange;
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
public interface CodeChangeRepository extends JpaRepository<CodeChange, Long>, JpaSpecificationExecutor<CodeChange> {

    @Query(value = "SELECT nextval('seq_code_change_code')", nativeQuery = true)
    Long getNextCodeChangeCodeSequence();

    Optional<CodeChange> findByCodeChangeCode(String codeChangeCode);

    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project", "files"})
    Optional<CodeChange> findBySvnCommitId(String svnCommitId);

    boolean existsBySvnCommitId(String svnCommitId);

    boolean existsBySvnCommitIdAndCodeChangeIdNot(String svnCommitId, Long codeChangeId);

    List<CodeChange> findByWorkLogId(Long workLogId);

    long countByChangeStatus(String changeStatus);

    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project", "files"})
    List<CodeChange> findAllBy(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project", "files"})
    Page<CodeChange> findAll(Specification<CodeChange> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"workLog", "workLog.taskItem", "workLog.taskItem.project", "files"})
    Optional<CodeChange> findById(Long id);
}
