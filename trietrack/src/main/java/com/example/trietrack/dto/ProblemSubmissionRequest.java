package com.example.trietrack.dto;

import com.example.trietrack.model.enums.BottleneckType;
import com.example.trietrack.model.enums.HelpLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProblemSubmissionRequest {
    @NotNull(message = "Problem reference pointer is mandatory!")
    private Long problemId;

    @NotNull(message = "Help level assessment selection is mandatory!")
    private HelpLevel helpLevel;

    @NotNull(message = "Bottleneck classification evaluation is mandatory!")
    private BottleneckType bottleneck;

    private String notes; // Optional notes text payload field
}