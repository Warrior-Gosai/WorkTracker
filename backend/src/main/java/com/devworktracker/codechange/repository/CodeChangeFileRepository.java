package com.devworktracker.codechange.repository;

import com.devworktracker.codechange.entity.CodeChangeFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeChangeFileRepository extends JpaRepository<CodeChangeFile, Long> {

    List<CodeChangeFile> findByCodeChangeId(Long codeChangeId);

    Optional<CodeChangeFile> findByCodeChangeFileIdAndCodeChangeId(Long fileId, Long codeChangeId);
}
