// Question Explanations Types

export interface QuestionExplanation {
    questionId: string;
    correctAnswerRationale: string;
    distractorRationales: {
        optionId: string;
        rationale: string;
    }[];
    keyConcepts: string[];
    references: string[];
    nursingProcess?: 'assessment' | 'diagnosis' | 'planning' | 'implementation' | 'evaluation';
    clientNeed?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    clinicalPearl?: string; // Expert tip
}

// Spaced Repetition Types

export interface ReviewSchedule {
    userId: string;
    questionId: string;
    easinessFactor: number; // 1.3 - 2.5
    interval: number; // days
    repetitions: number;
    nextReviewDate: string;
    lastReviewDate: string;
    lastQuality: number; // 0-5 (0=complete blackout, 5=perfect recall)
}

// Explain-Your-Thinking Types

export type ReasoningType = 'free_text' | 'structured';

export interface StudentReasoning {
    id: string;
    userId: string;
    questionId: string;
    selectedAnswer: string;
    reasoning: string;
    reasoningType: ReasoningType;
    submittedAt: string;
}

export interface ExpertReasoning {
    questionId: string;
    optionId: string;
    clinicalJudgment: string;
    nursingProcess: string;
    criticalThinking: string[];
    commonMisconceptions: string[];
}

// Question Management Types

export interface QuestionFlag {
    id: string;
    userId: string;
    questionId: string;
    flaggedAt: string;
    reason?: string;
}

export interface QuestionNote {
    id: string;
    userId: string;
    questionId: string;
    note: string;
    createdAt: string;
    updatedAt: string;
}
