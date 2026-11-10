package com.devworktracker.project.repository;

import com.devworktracker.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    @Query(value = "SELECT nextval('seq_project_code')", nativeQuery = true)
    Long getNextProjectCodeSequence();

    Optional<Project> findByProjectCode(String projectCode);

    long countByStatus(Short status);

    java.util.List<Project> findAllBy(org.springframework.data.domain.Pageable pageable);
}

