package com.example.trietrack.repository;

import com.example.trietrack.model.User;
import com.example.trietrack.model.UserProblemState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProblemStateRepository extends JpaRepository<UserProblemState, Long> {
    Optional<UserProblemState> findByUserAndProblem(User user, com.example.trietrack.model.Problem problem);

    // --- Add this batch collector method ---
    List<UserProblemState> findByUserAndProblemIdIn(User user, List<Long> problemIds);
}