// Progress Tracking Types
export interface UserProgress {
    id: string;
    userId: string;
    questionId: string;
    attemptedAt: string;
    selectedAnswer: string | string[]; // Single or multiple answers
    isCorrect: boolean;
    timeSpent: number; // seconds
    attemptNumber: number; // 1st, 2nd, 3rd attempt
}

export interface CategoryStat {
    category: string;
    attempted: number;
    correct: number;
    accuracy: number;
}

export interface UserStats {
    userId: string;
    totalAttempted: number;
    totalCorrect: number;
    totalIncorrect: number;
    accuracy: number; // percentage
    averageTimePerQuestion: number;
    categoryStats: CategoryStat[];
    lastUpdated: string;
}

// Enhanced Analytics Types (Phase 1)
export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastery' | 'insufficient_data';

export interface DomainMastery {
    domain: string;
    accuracy: number;
    attempted: number;
    correct: number;
    masteryLevel: MasteryLevel;
    questionsToNextLevel: number;
}

export interface PerformanceMetrics {
    // Core metrics
    overallAccuracy: number;
    firstAttemptAccuracy: number;
    totalAttempted: number;
    totalCorrect: number;
    totalIncorrect: number;

    // Trend metrics
    sevenDayAccuracy: number;
    sevenDayAttempted: number;
    improvementRate: number; // percentage change

    // Streak metrics
    currentStreak: number;
    longestStreak: number;

    // Domain performance
    domainMastery: DomainMastery[];
    strongestDomain: string;
    weakestDomain: string;

    // Readiness
    passProbability: number; // 0-100
    readinessLevel: 'not_ready' | 'developing' | 'on_track' | 'ready';
    weakAreaCount: number;

    // Time
    averageTimePerQuestion: number;

    lastUpdated: string;
}

export interface WeakArea {
    domain: string;
    accuracy: number;
    attempted: number;
    gapToTarget: number; // percentage points to 75%
    questionsNeeded: number;
    priority: number; // 1-5, 1 being highest
}

export interface TrendPoint {
    date: string;
    accuracy: number;
    attempted: number;
}

// Phase 3: Advanced Analytics Types
export interface ItemTypePerformance {
    itemType: string;
    attempted: number;
    correct: number;
    accuracy: number;
    averageTime: number;
    masteryLevel: MasteryLevel;
}

export interface BlueprintCategory {
    category: string;
    nclexWeight: number; // percentage of exam
    yourPractice: number; // percentage of your questions
    gap: number; // difference
    attempted: number;
    accuracy: number;
    status: 'aligned' | 'over_practiced' | 'under_practiced';
}

export interface TimeEfficiencyPoint {
    domain: string;
    averageTime: number;
    accuracy: number;
    quadrant: 'fast_accurate' | 'slow_accurate' | 'fast_inaccurate' | 'slow_inaccurate';
}

export interface AdvancedMetrics extends PerformanceMetrics {
    // Item type analysis
    itemTypePerformance: ItemTypePerformance[];
    strongestItemType: string;
    weakestItemType: string;

    // Blueprint alignment
    blueprintAlignment: BlueprintCategory[];
    overallAlignmentScore: number; // 0-100
    underPracticedCategories: string[];

    // Time efficiency
    timeEfficiency: TimeEfficiencyPoint[];
    timeEfficiencyIndex: number; // composite score
    speedIssue: 'too_fast' | 'too_slow' | 'optimal' | null;

    // Study patterns
    studyDaysCount: number;
    averageQuestionsPerDay: number;
    consistencyScore: number; // 0-100
}

export interface StudyRecommendation {
    type: 'domain' | 'item_type' | 'blueprint' | 'speed' | 'consistency';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    actionItems: string[];
    estimatedTime: string;
}

// Adaptive Learning Types
export type RecommendationReason = 'weak_area' | 'blueprint_gap' | 'spaced_repetition' | 'item_type' | 'new';

export interface RecommendedQuestion {
    questionId: string;
    priorityScore: number;
    reason: RecommendationReason;
    domain: string;
    itemType: string;
}

export interface RecommendedPractice {
    userId: string;
    generatedAt: string;
    expiresAt: string; // Recommendations valid for 24 hours
    questions: RecommendedQuestion[];
    reasoning: {
        weakAreas: string[]; // Domains being targeted
        blueprintGaps: string[]; // Under-practiced categories
        reviewCount: number; // Questions due for review
        newCount: number; // Never-attempted questions
    };
    estimatedTime: number; // Minutes
    difficulty: 'mixed' | 'easier' | 'harder';
}

export type SessionMode = 'recommended' | 'custom' | 'timed' | 'exam_simulation';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface PracticeSession {
    id: string;
    userId: string;
    mode: SessionMode;
    questions: string[]; // Question IDs
    startedAt: string;
    completedAt?: string;
    status: SessionStatus;
    currentQuestionIndex: number;
    results?: {
        attempted: number;
        correct: number;
        incorrect: number;
        accuracy: number;
        totalTime: number;
        averageTime: number;
        byDomain: {
            domain: string;
            attempted: number;
            correct: number;
            accuracy: number;
        }[];
    };
}
