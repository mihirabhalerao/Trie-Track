package com.example.trietrack.repository;

import com.example.trietrack.model.SheetProblem;
import com.example.trietrack.model.enums.SheetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SheetProblemRepository extends JpaRepository<SheetProblem, SheetProblem.SheetProblemId> {
    // Custom JPQL Query joining SheetProblem with the Sheet table to filter and sort sequentially
    @Query("SELECT sp FROM SheetProblem sp JOIN FETCH sp.problem WHERE sp.sheet.name = :sheetName ORDER BY sp.displayOrder ASC")
    List<SheetProblem> findBySheetNameOrderByDisplayOrder(@Param("sheetName") SheetType sheetName);
}