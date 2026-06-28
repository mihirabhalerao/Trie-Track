package com.example.trietrack.repository;

import com.example.trietrack.model.ProgressLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long> {
}