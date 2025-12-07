// Export analytics types
export * from './analytics';
export * from './wellness';
export * from './learning';

// Entry Mode and Item Lifecycle Types
export type EntryMode = 'ai_generated' | 'manual_entered';

export type ItemStatus =
    | 'draft'
    | 'ai_audit'
    | 'ai_fix'
    | 'human_signoff'
    | 'approved'
    | 'published_student'
    | 'published_trial';

// Student Authentication Types
export type UserRole = 'admin' | 'student_paid' | 'student_trial';

export interface StudentUser {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    subscriptionStatus: 'free_trial' | 'paid';
    createdAt: string;
    lastLoginAt: string;

    // Stripe fields
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionPlan?: 'monthly' | 'annual';
    subscriptionEndDate?: string;
}

// Helper function to derive role from subscription status
export function getUserRole(subscriptionStatus: 'free_trial' | 'paid'): UserRole {
    return subscriptionStatus === 'paid' ? 'student_paid' : 'student_trial';
}

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

export interface AuditIssue {
    id: string;
    category:
    | 'clinical_safety'
    | 'ngn_format'
    | 'clarity'
    | 'bias_fairness'
    | 'trap_quality'
    | 'copyright_originality';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggested_fix?: string;
}

export interface AuditReport {
    overallRisk: 'low' | 'medium' | 'high';
    issues: AuditIssue[];
}

export interface EHRDetails {
    patientName: string;
    dob: string;
    mrn: string;
    gender: string;
    age: string;
    admissionDate: string;
    allergies: string;
    codeStatus: string;
    diagnosis: string;
}

export interface NclexItemDraft {
    id: string;
    entryMode: EntryMode;
    status: ItemStatus;
    questionType: string;
    stem: string;
    options: QuestionOption[];
    rationale: string;
    createdBy: string;
    createdAt: string;
    lastUpdatedAt: string;
    presentationStyle?: 'standard' | 'ehr_case';
    examProfile?: 'nclex_2025' | 'nclex_2026';
    caseId?: string;
    ehrDetails?: EHRDetails;
    category?: string; // Content domain (e.g., Cardiac, Respiratory, Pharmacology)
    auditReport?: {
        overallRisk: 'low' | 'medium' | 'high';
        issues: AuditIssue[];
    };
}

// Trap Hunter Types
export type TrapStatus = ItemStatus;

export interface TrapSetDraft {
    id: string;
    itemId: string; // FK to NclexItemDraft.id
    entryMode: EntryMode;
    status: TrapStatus;
    stemSnippet: string;
    options: QuestionOption[];
    trapOptionsIds: string[]; // which options are traps
    createdBy: string;
    createdAt: string;
    lastUpdatedAt: string;
    auditReport?: {
        overallRisk: 'low' | 'medium' | 'high';
        issues: AuditIssue[];
    };
}

// Mnemonic Creator Types
export type MnemonicStatus = ItemStatus;

export interface MnemonicDraft {
    id: string;
    concept: string;
    entryMode: EntryMode;
    status: MnemonicStatus;
    mnemonicText: string;
    explanation: string;
    createdBy: string;
    createdAt: string;
    lastUpdatedAt: string;
    auditReport?: {
        overallRisk: 'low' | 'medium' | 'high';
        issues: AuditIssue[];
    };
}

// Public View Types (for Student/Trial consumption)
export type PublicQuestionView = Pick<NclexItemDraft, 'id' | 'questionType' | 'stem' | 'status'>;

// Exam Profile Types
export type ExamProfile = 'nclex_2025' | 'nclex_2026';

export interface ExamProfileConfig {
    id: ExamProfile;
    label: string;
    description: string;
}

export const EXAM_PROFILES: ExamProfileConfig[] = [
    {
        id: 'nclex_2025',
        label: 'NCLEX NGN 2025 Blueprint',
        description: 'Current NGN exam format and 2023–2026 blueprint weighting.',
    },
    {
        id: 'nclex_2026',
        label: 'NCLEX 2026+ Blueprint',
        description: 'New test plan effective April 1, 2026, with updated category weights.',
    },
];

// Case Study Generation Types
export type AgeGroup = 'Adult' | 'Pediatric' | 'Maternal' | 'Geriatric';

export type ClinicalDomain =
    | 'Cardiac'
    | 'Respiratory'
    | 'Infection Control'
    | 'Pharmacology'
    | 'Mental Health'
    | 'Maternal-Newborn'
    | 'Pediatrics'
    | 'Critical Care';

export type ClinicalComplexity = 'Easy' | 'Moderate' | 'Complex';

export interface CaseStudyGenerationParams {
    examProfile: ExamProfile;
    ageGroup: AgeGroup;
    clinicalDomain: ClinicalDomain;
    complexity: ClinicalComplexity;
}

// Question Types
export type QuestionType = 'multiple-choice' | 'select-all' | 'drag-drop' | 'hotspot' | 'matrix';

export type QuestionStatus = 'draft' | 'in-qa' | 'approved' | 'published' | 'archived';

export interface Question {
    id: string;
    type: QuestionType;
    status: QuestionStatus;
    content: string;
    options: QuestionOption[];
    correctAnswers: string[];
    explanation: string;
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    approvedBy?: string;
}

export interface QuestionOption {
    id: string;
    text: string;
    isTrap?: boolean; // For Trap Hunter analysis
    trapReason?: string;
}

// User Types (Generic - for workflow/admin purposes)
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'student' | 'free-trial';
    createdAt: Date;
    lastLoginAt?: Date;
}

// Workflow Types
export interface WorkflowStep {
    id: string;
    name: string;
    status: 'pending' | 'in-progress' | 'completed' | 'rejected';
    assignedTo?: string;
    completedAt?: Date;
    notes?: string;
}

export interface QuestionWorkflow {
    questionId: string;
    steps: WorkflowStep[];
    currentStep: number;
}

// Response Types
export interface StudentResponse {
    id: string;
    studentId: string;
    questionId: string;
    selectedAnswers: string[];
    isCorrect: boolean;
    timeSpent: number; // in seconds
    submittedAt: Date;
}

// Mnemonic Types
export interface Mnemonic {
    id: string;
    topic: string;
    mnemonic: string;
    explanation: string;
    relatedQuestions: string[];
    evidenceSource?: string;
    createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
