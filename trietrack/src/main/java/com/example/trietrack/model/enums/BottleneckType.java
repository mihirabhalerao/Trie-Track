package com.example.trietrack.model.enums;

public enum BottleneckType {
    NONE,           // Everything clicked smoothly
    CONCEPT,        // Didn't understand the underlying logic, math, or pattern
    TRANSLATION,    // Knew the idea, but struggled to translate it into clean syntax
    OPTIMIZATION,   // Wrote a slow solution ($O(n^2)$) but couldn't optimize it ($O(n)$)
    EDGE_CASES      // Code worked mostly, but failed on tricky boundary or overflow values
}