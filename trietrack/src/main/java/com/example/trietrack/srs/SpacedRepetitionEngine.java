package com.example.trietrack.srs;

import com.example.trietrack.model.enums.BottleneckType;
import com.example.trietrack.model.enums.HelpLevel;
import org.springframework.stereotype.Component;

@Component
public class SpacedRepetitionEngine {

    /**
     * A simple immutable container to pass back calculated values.
     */
    public static class SrsResult {
        public final double newEaseFactor;
        public final int newIntervalDays;
        
        public SrsResult(double newEaseFactor, int newIntervalDays) {
            this.newEaseFactor = newEaseFactor;
            this.newIntervalDays = newIntervalDays;
        }
    }

    public SrsResult calculateNextReview(double currentEF, int currentInterval, HelpLevel help, BottleneckType bottleneck) {
        // 1. Map qualitative metrics to a quantitative Quality Score (q) from 1 to 5
        int q = 3; // Baseline default
        
        if (help == HelpLevel.SOLO) {
            if (bottleneck == BottleneckType.NONE) q = 5; // Perfect understanding
            else if (bottleneck == BottleneckType.OPTIMIZATION || bottleneck == BottleneckType.EDGE_CASES) q = 4; // Solid but hit slight blockages
            else q = 3;
        } else if (help == HelpLevel.HINT) {
            if (bottleneck == BottleneckType.NONE || bottleneck == BottleneckType.OPTIMIZATION) q = 3;
            else q = 2; // Struggled with core syntax/logic despite hint
        } else if (help == HelpLevel.SOLUTION) {
            q = 1; // Complete copy/read bypass
        }

        // 2. Adjust and calculate the updated Ease Factor (EF)
        double newEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (newEF < 1.3) {
            newEF = 1.3; // Lock absolute safe minimum boundary threshold
        }

        // 3. Compute the calendar review interval window (in Days)
        int newInterval;
        if (q < 3) {
            newInterval = 1; // Force immediate daily review if they failed or heavily struggled
        } else {
            if (currentInterval == 0) {
                newInterval = 2;  // First clean execution pass fallback
            } else if (currentInterval == 1) {
                newInterval = 6;  // Standard secondary expansion step gap
            } else {
                newInterval = (int) Math.round(currentInterval * currentEF); // Scale out review cycle length dynamically
            }
        }

        return new SrsResult(newEF, newInterval);
    }
}