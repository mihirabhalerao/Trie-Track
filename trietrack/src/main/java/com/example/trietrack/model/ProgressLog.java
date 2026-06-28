package com.example.trietrack.model;

import com.example.trietrack.model.enums.BottleneckType;
import com.example.trietrack.model.enums.HelpLevel;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "solved_at", nullable = false)
    private LocalDateTime solvedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "help_level", nullable = false, length = 50)
    private HelpLevel helpLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "bottleneck", nullable = false, length = 100)
    private BottleneckType bottleneck;

    @PrePersist
    protected void onCreate() {
        this.solvedAt = LocalDateTime.now();
    }
}