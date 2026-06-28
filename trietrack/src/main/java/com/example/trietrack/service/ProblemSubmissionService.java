package com.example.trietrack.service;

import com.example.trietrack.dto.ProblemSubmissionRequest;
import com.example.trietrack.model.*;
import com.example.trietrack.repository.*;
import com.example.trietrack.srs.SpacedRepetitionEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProblemSubmissionService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final UserProblemStateRepository userProblemStateRepository;
    private final ProgressLogRepository progressLogRepository;
    private final SpacedRepetitionEngine srsEngine;

    @Transactional
    public void executeSubmission(ProblemSubmissionRequest request, String userEmail) {
        // 1. Fetch related domain entity profiles securely
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user session context invalid."));
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Target problem entry catalog reference not found."));

        // 2. Append immutable record ledger entry straight into history audit trail log
        ProgressLog historyEntry = ProgressLog.builder()
                .user(user)
                .problem(problem)
                .helpLevel(request.getHelpLevel())
                .solvedAt(LocalDateTime.now())
                .bottleneck(request.getBottleneck())
                .build();
        progressLogRepository.save(historyEntry);

        // 3. Retrieve or lazily initialize the user's permanent State tracking card 
        UserProblemState stateCard = userProblemStateRepository.findByUserAndProblem(user, problem)
                .orElse(UserProblemState.builder()
                        .user(user)
                        .problem(problem)
                        .easeFactor(2.5)   // Standard initial anchor parameters
                        .intervalDays(0)
                        .build());

        // 4. Run the algorithmic math calculation routines
        SpacedRepetitionEngine.SrsResult calculatedValues = srsEngine.calculateNextReview(
                stateCard.getEaseFactor(),
                stateCard.getIntervalDays(),
                request.getHelpLevel(),
                request.getBottleneck()
        );

        // 5. Commit updated metrics down to live database tracking table fields
        stateCard.setSolved(true);
        stateCard.setEaseFactor(calculatedValues.newEaseFactor);
        stateCard.setIntervalDays(calculatedValues.newIntervalDays);
        stateCard.setNextReviewDate(LocalDateTime.now().plusDays(calculatedValues.newIntervalDays));
        
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            stateCard.setNotes(request.getNotes());
        }

        userProblemStateRepository.save(stateCard);
    }
}