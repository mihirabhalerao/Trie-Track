package com.example.trietrack.controller;

import com.example.trietrack.dto.ProblemResponse;
import com.example.trietrack.model.Problem;
import com.example.trietrack.model.User;
import com.example.trietrack.model.UserProblemState;
import com.example.trietrack.model.enums.SheetType;
import com.example.trietrack.repository.ProblemRepository;
import com.example.trietrack.repository.UserProblemStateRepository;
import com.example.trietrack.repository.UserRepository;
import com.example.trietrack.service.ProblemService;
import com.example.trietrack.service.ProblemSubmissionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;
    private final ProblemSubmissionService problemSubmissionService;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final UserProblemStateRepository userProblemStateRepository;

    @GetMapping("/sheet/{sheetType}")
    public ResponseEntity<List<ProblemResponse>> getSheetProblems(
        @PathVariable SheetType sheetType,
        org.springframework.security.core.Authentication authentication
    ) {
        String email = authentication.getName(); // Extract user identity via secure token
        List<ProblemResponse> problems = problemService.getProblemsBySheetForUser(sheetType, email);
        return ResponseEntity.ok(problems);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitProblemProgress(
        @jakarta.validation.Valid @RequestBody com.example.trietrack.dto.ProblemSubmissionRequest request,
        org.springframework.security.core.Authentication authentication
    ) {
        String email = authentication.getName(); // Extracts verified identity string out of secure JWT token wrapper
        
        // Wire up dependency field invocation or declare constructor injection handling
        problemSubmissionService.executeSubmission(request, email);
        
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Algorithmic submission processed successfully! Space Repetition queue recalibrated."
        ));
    }

    @PutMapping("/{problemId}/star")
    public ResponseEntity<?> toggleProblemStar(
        @PathVariable Long problemId,
        org.springframework.security.core.Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserProblemState state = userProblemStateRepository.findByUserAndProblem(user, problem)
                .orElseGet(() -> {
                    UserProblemState newState = new UserProblemState();
                    newState.setUser(user);
                    newState.setProblem(problem);
                    newState.setEaseFactor(2.5);
                    newState.setIntervalDays(0);
                    newState.setSolved(false);
                    newState.setStarred(false);
                    newState.setNotes("");
                    // Fix: Provide a non-null default date value to satisfy database constraints
                    newState.setNextReviewDate(java.time.LocalDateTime.now()); 
                    return newState;
                });

        state.setStarred(!state.isStarred());
        userProblemStateRepository.save(state);

        return ResponseEntity.ok(java.util.Map.of("isStarred", state.isStarred()));
    }

    @PutMapping("/{problemId}/notes")
    public ResponseEntity<?> updateProblemNotes(
        @PathVariable Long problemId,
        @RequestBody java.util.Map<String, String> body,
        org.springframework.security.core.Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        UserProblemState state = userProblemStateRepository.findByUserAndProblem(user, problem)
                .orElseGet(() -> {
                    UserProblemState newState = new UserProblemState();
                    newState.setUser(user);
                    newState.setProblem(problem);
                    newState.setEaseFactor(2.5);
                    newState.setIntervalDays(0);
                    newState.setSolved(false);
                    newState.setStarred(false);
                    newState.setNotes("");
                    // Fix: Provide a non-null default date value here as well
                    newState.setNextReviewDate(java.time.LocalDateTime.now()); 
                    return newState;
                });
        
        state.setNotes(body.get("notes"));
        userProblemStateRepository.save(state);

        return ResponseEntity.ok(java.util.Map.of("message", "Notes synced successfully"));
    }  
}