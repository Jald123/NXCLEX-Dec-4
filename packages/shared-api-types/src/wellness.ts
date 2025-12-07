// Wellness & Stress Relief Types

export type WellnessExerciseType = 'breathing' | 'muscle_relaxation' | 'meditation' | 'study_break';
export type BreathingTechnique = '4-7-8' | 'box' | 'deep_belly';

export interface WellnessSession {
    id: string;
    userId: string;
    type: WellnessExerciseType;
    exerciseName: string;
    technique?: BreathingTechnique;
    duration: number; // seconds
    completed: boolean;
    startedAt: string;
    completedAt?: string;
}

export interface WellnessStats {
    userId: string;
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    favoriteExercise: string;
    totalMinutes: number;
    lastSessionAt: string;
    sessionsByType: {
        breathing: number;
        muscle_relaxation: number;
        meditation: number;
        study_break: number;
    };
}

export interface StudyBreakReminder {
    userId: string;
    enabled: boolean;
    interval: number; // minutes
    lastBreakAt?: string;
    nextBreakAt?: string;
}
