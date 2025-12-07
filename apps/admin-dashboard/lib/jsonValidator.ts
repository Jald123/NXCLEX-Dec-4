import type { NclexItemDraft } from '@nclex/shared-api-types';

export interface ValidationError {
    index: number;
    field: string;
    message: string;
}

export interface ValidationResult {
    success: boolean;
    questions: NclexItemDraft[];
    errors: ValidationError[];
}

const VALID_QUESTION_TYPES = [
    'Multiple Choice',
    'Multiple Response',
    'Drop-Down',
    'Matrix/Grid',
    'Drag and Drop',
    'Highlight',
    'Bow-Tie'
];

const VALID_NCLEX_CATEGORIES = [
    'Management of Care',
    'Safety and Infection Control',
    'Health Promotion and Maintenance',
    'Psychosocial Integrity',
    'Basic Care and Comfort',
    'Pharmacological Therapies',
    'Reduction of Risk Potential',
    'Physiological Adaptation',
    'Other'
];

const VALID_COGNITIVE_LEVELS = ['Knowledge', 'Comprehension', 'Application', 'Analysis'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

export function validateJSON(jsonText: string): ValidationResult {
    const errors: ValidationError[] = [];

    try {
        const parsed = JSON.parse(jsonText);
        const questions = Array.isArray(parsed) ? parsed : [parsed];

        const validatedQuestions: NclexItemDraft[] = [];

        questions.forEach((q, index) => {
            const questionErrors = validateQuestion(q, index);

            if (questionErrors.length > 0) {
                errors.push(...questionErrors);
            } else {
                // Add metadata
                validatedQuestions.push({
                    ...q,
                    id: q.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    entryMode: q.entryMode || 'manual_entered',
                    status: q.status || 'draft',
                    createdBy: q.createdBy || 'JSON Import',
                    createdAt: q.createdAt || new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    presentationStyle: q.presentationStyle || 'standard'
                });
            }
        });

        return {
            success: errors.length === 0,
            questions: validatedQuestions,
            errors
        };
    } catch (error) {
        return {
            success: false,
            questions: [],
            errors: [{
                index: 0,
                field: 'json',
                message: error instanceof Error ? error.message : 'Invalid JSON format'
            }]
        };
    }
}

function validateQuestion(question: any, index: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!question.questionType) {
        errors.push({ index, field: 'questionType', message: 'Question type is required' });
    } else if (!VALID_QUESTION_TYPES.includes(question.questionType)) {
        errors.push({
            index,
            field: 'questionType',
            message: `Invalid question type. Must be one of: ${VALID_QUESTION_TYPES.join(', ')}`
        });
    }

    if (!question.stem) {
        errors.push({ index, field: 'stem', message: 'Stem is required' });
    } else if (question.stem.length < 10) {
        errors.push({ index, field: 'stem', message: 'Stem must be at least 10 characters' });
    }

    if (!question.options || !Array.isArray(question.options)) {
        errors.push({ index, field: 'options', message: 'Options array is required' });
    } else {
        // Validate options structure
        if (question.options.length < 2) {
            errors.push({ index, field: 'options', message: 'At least 2 options are required' });
        }

        question.options.forEach((option: any, optIndex: number) => {
            if (!option.id) {
                errors.push({ index, field: `options[${optIndex}].id`, message: 'Option ID is required' });
            }
            if (!option.text) {
                errors.push({ index, field: `options[${optIndex}].text`, message: 'Option text is required' });
            }
            if (typeof option.isCorrect !== 'boolean') {
                errors.push({ index, field: `options[${optIndex}].isCorrect`, message: 'Option isCorrect must be a boolean' });
            }
        });

        // Validate correct answers
        const correctCount = question.options.filter((o: any) => o.isCorrect).length;

        if (correctCount === 0) {
            errors.push({ index, field: 'options', message: 'At least one correct answer is required' });
        }

        // Type-specific validation
        if (question.questionType === 'Multiple Choice') {
            if (question.options.length !== 4) {
                errors.push({ index, field: 'options', message: 'Multiple Choice requires exactly 4 options' });
            }
            if (correctCount !== 1) {
                errors.push({ index, field: 'options', message: 'Multiple Choice requires exactly 1 correct answer' });
            }
        }

        if (question.questionType === 'Multiple Response') {
            if (question.options.length < 4 || question.options.length > 6) {
                errors.push({ index, field: 'options', message: 'Multiple Response requires 4-6 options' });
            }
            if (correctCount < 2) {
                errors.push({ index, field: 'options', message: 'Multiple Response requires at least 2 correct answers' });
            }
        }
    }

    if (!question.rationale) {
        errors.push({ index, field: 'rationale', message: 'Rationale is required' });
    } else if (question.rationale.length < 50) {
        errors.push({ index, field: 'rationale', message: 'Rationale must be at least 50 characters' });
    }

    // Optional but validated if present
    if (question.category && !VALID_NCLEX_CATEGORIES.includes(question.category)) {
        errors.push({
            index,
            field: 'category',
            message: `Invalid category. Must be one of: ${VALID_NCLEX_CATEGORIES.join(', ')}`
        });
    }

    if (question.cognitiveLevel && !VALID_COGNITIVE_LEVELS.includes(question.cognitiveLevel)) {
        errors.push({
            index,
            field: 'cognitiveLevel',
            message: `Invalid cognitive level. Must be one of: ${VALID_COGNITIVE_LEVELS.join(', ')}`
        });
    }

    if (question.difficulty && !VALID_DIFFICULTIES.includes(question.difficulty)) {
        errors.push({
            index,
            field: 'difficulty',
            message: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`
        });
    }

    return errors;
}

export function generateSampleJSON(): string {
    const sample = [
        {
            questionType: "Multiple Choice",
            stem: "A nurse is caring for a client with heart failure who is receiving furosemide. Which assessment finding requires immediate intervention?",
            options: [
                { id: "1", text: "Blood pressure 128/82 mmHg", isCorrect: false },
                { id: "2", text: "Serum potassium 2.8 mEq/L", isCorrect: true },
                { id: "3", text: "Heart rate 88 beats/min", isCorrect: false },
                { id: "4", text: "Urine output 50 mL/hour", isCorrect: false }
            ],
            rationale: "A serum potassium level of 2.8 mEq/L is critically low (normal: 3.5-5.0 mEq/L). Furosemide is a loop diuretic that causes potassium loss. Hypokalemia can lead to life-threatening cardiac arrhythmias and must be addressed immediately.",
            category: "Pharmacological Therapies",
            cognitiveLevel: "Analysis",
            difficulty: "medium"
        }
    ];

    return JSON.stringify(sample, null, 2);
}
