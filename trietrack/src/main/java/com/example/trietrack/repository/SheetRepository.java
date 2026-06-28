package com.example.trietrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.trietrack.model.Sheet;
import com.example.trietrack.model.enums.SheetType;

@Repository
public interface SheetRepository extends JpaRepository<Sheet, Long> {
    Optional<Sheet> findByName(SheetType name);
}
