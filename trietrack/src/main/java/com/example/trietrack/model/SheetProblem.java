package com.example.trietrack.model;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

import com.example.trietrack.model.enums.Topic;

@Entity
@Table(name = "sheet_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SheetProblem {
    @EmbeddedId
    private SheetProblemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("sheetId")
    @JoinColumn(name = "sheet_id")
    private Sheet sheet;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("problemId")
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @Enumerated(EnumType.STRING)
    @Column(name = "topic", nullable = false, length = 150)
    private Topic topic;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    // Composite primary key class definition structure
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SheetProblemId implements Serializable {
        private Long sheetId;
        private Long problemId;
    }
}