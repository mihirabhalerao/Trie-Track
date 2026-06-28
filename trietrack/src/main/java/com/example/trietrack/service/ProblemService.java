package com.example.trietrack.service;

import com.example.trietrack.dto.ProblemResponse;
import com.example.trietrack.model.*;
import com.example.trietrack.model.enums.SheetType;
import com.example.trietrack.repository.SheetProblemRepository;
import com.example.trietrack.repository.UserProblemStateRepository;
import com.example.trietrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final SheetProblemRepository sheetProblemRepository;
    private final UserProblemStateRepository userProblemStateRepository;
    private final UserRepository userRepository;

    public List<ProblemResponse> getProblemsBySheetForUser(SheetType sheetType, String email) {
        // 1. Identify active user session context
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User session authentication profile missing."));

        // 2. Extract curated rows from structural sheet junction definitions
        List<SheetProblem> sheetProblems = sheetProblemRepository.findBySheetNameOrderByDisplayOrder(sheetType);

        // 3. Isolate active problem primary keys
        List<Long> problemIds = sheetProblems.stream()
                .map(sp -> sp.getProblem().getId())
                .collect(Collectors.toList());
                
        // 4. Batch query account mapping states and handle duplicate rows safely via merge strategy
        Map<Long, UserProblemState> userStatesMap = userProblemStateRepository.findByUserAndProblemIdIn(user, problemIds)
                .stream()
                .collect(Collectors.toMap(
                        state -> state.getProblem().getId(), 
                        state -> state,
                        (existing, replacement) -> existing
                ));

        // 5. Explicitly typed transformation map to completely clear type inference errors
        return sheetProblems.stream().map((SheetProblem sp) -> {
            Problem p = sp.getProblem();
            UserProblemState userState = userStatesMap.get(p.getId());

            return ProblemResponse.builder()
                    .id(p.getId())
                    .title(p.getTitle())
                    .leetcodeUrl(p.getLeetcodeUrl())
                    .difficulty(p.getDifficulty())
                    .topic(sp.getTopic())
                    .displayOrder(sp.getDisplayOrder())
                    .isSolved(userState != null && userState.isSolved())
                    .isStarred(userState != null && userState.isStarred())
                    .notes(userState != null ? userState.getNotes() : "")
                    .build();
        }).collect(Collectors.toList());
    }
}