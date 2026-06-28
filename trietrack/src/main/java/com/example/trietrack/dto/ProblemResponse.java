package com.example.trietrack.dto;

import com.example.trietrack.model.enums.Topic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemResponse {
    private Long id;
    private String title;
    private String leetcodeUrl;
    private String difficulty;
    private Topic topic;
    private Integer displayOrder;

    private boolean isSolved;
    private boolean isStarred;
    private String notes;
}
