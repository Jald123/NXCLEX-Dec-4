import type { NclexItemDraft } from '@nclex/shared-api-types';

export interface ParsedCSVRow {
    questionType: string;
    stem: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5?: string;
    option6?: string;
    correctAnswers: string;
    rationale: string;
    category: string;
    cognitiveLevel?: string;
    difficulty?: string;
    tags?: string;
    clientNeed?: string;
    presentationStyle?: string;
}

export interface ValidationError {
    line: number;
    field: string;
    message: string;
}

export interface ParseResult {
    success: boolean;
    questions: NclexItemDraft[];
    errors: ValidationError[];
}

export function parseCSV(csvText: string): ParseResult {
    const errors: ValidationError[] = [];
    const questions: NclexItemDraft[] = [];

    try {
        const lines = csvText.trim().split('\n');

        if (lines.length < 2) {
            return {
                success: false,
                questions: [],
                errors: [{ line: 0, field: 'file', message: 'CSV file is empty or has no data rows' }]
            };
        }

        const headers = parseCSVLine(lines[0]);

        // Validate headers
        const requiredHeaders = ['questionType', 'stem', 'option1', 'option2', 'option3', 'option4', 'correctAnswers', 'rationale', 'category'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return {
                success: false,
                questions: [],
                errors: [{ line: 1, field: 'headers', message: `Missing required headers: ${missingHeaders.join(', ')}` }]
            };
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines

            try {
                const values = parseCSVLine(line);
                const row: any = {};

                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });

                const question = convertCSVRowToQuestion(row, i + 1);

                if (question.errors.length > 0) {
                    errors.push(...question.errors);
                } else if (question.item) {
                    questions.push(question.item);
                }
            } catch (error) {
                errors.push({
                    line: i + 1,
                    field: 'row',
                    message: error instanceof Error ? error.message : 'Failed to parse row'
                });
            }
        }

        return {
            success: errors.length === 0,
            questions,
            errors
        };
    } catch (error) {
        return {
            success: false,
            questions: [],
            errors: [{ line: 0, field: 'file', message: error instanceof Error ? error.message : 'Failed to parse CSV' }]
        };
    }
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function convertCSVRowToQuestion(row: ParsedCSVRow, lineNumber: number): { item: NclexItemDraft | null; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!row.questionType) {
        errors.push({ line: lineNumber, field: 'questionType', message: 'Question type is required' });
    }
    if (!row.stem || row.stem.length < 10) {
        errors.push({ line: lineNumber, field: 'stem', message: 'Stem must be at least 10 characters' });
    }
    if (!row.rationale || row.rationale.length < 50) {
        errors.push({ line: lineNumber, field: 'rationale', message: 'Rationale must be at least 50 characters' });
    }
    if (!row.category) {
        errors.push({ line: lineNumber, field: 'category', message: 'Category is required' });
    }

    // Build options array
    const options: any[] = [];
    const correctAnswerIds = row.correctAnswers.split(',').map(a => a.trim());

    [row.option1, row.option2, row.option3, row.option4, row.option5, row.option6]
        .forEach((optionText, index) => {
            if (optionText) {
                const optionId = (index + 1).toString();
                options.push({
                    id: optionId,
                    text: optionText,
                    isCorrect: correctAnswerIds.includes(optionId)
                });
            }
        });

    // Validate options
    if (options.length < 2) {
        errors.push({ line: lineNumber, field: 'options', message: 'At least 2 options are required' });
    }

    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount === 0) {
        errors.push({ line: lineNumber, field: 'correctAnswers', message: 'At least one correct answer is required' });
    }

    // Validate based on question type
    if (row.questionType === 'Multiple Choice') {
        if (options.length !== 4) {
            errors.push({ line: lineNumber, field: 'options', message: 'Multiple Choice requires exactly 4 options' });
        }
        if (correctCount !== 1) {
            errors.push({ line: lineNumber, field: 'correctAnswers', message: 'Multiple Choice requires exactly 1 correct answer' });
        }
    }

    if (errors.length > 0) {
        return { item: null, errors };
    }

    // Create the question item
    const item: NclexItemDraft = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entryMode: 'manual_entered',
        status: 'draft',
        questionType: row.questionType,
        stem: row.stem,
        options,
        rationale: row.rationale,
        category: row.category,
        createdBy: 'CSV Import',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        presentationStyle: (row.presentationStyle as any) || 'standard'
    };

    return { item, errors: [] };
}

export function generateSampleCSV(): string {
    return `questionType,stem,option1,option2,option3,option4,option5,option6,correctAnswers,rationale,category,cognitiveLevel,difficulty,tags,clientNeed,presentationStyle
"Multiple Choice","A nurse is caring for a client with heart failure who is receiving furosemide. Which assessment finding requires immediate intervention?","Blood pressure 128/82 mmHg","Serum potassium 2.8 mEq/L","Heart rate 88 beats/min","Urine output 50 mL/hour","","","2","A serum potassium level of 2.8 mEq/L is critically low (normal: 3.5-5.0 mEq/L). Furosemide is a loop diuretic that causes potassium loss. Hypokalemia can lead to life-threatening cardiac arrhythmias and must be addressed immediately. The other vital signs are within acceptable ranges.","Pharmacological Therapies","Analysis","medium","furosemide,potassium,heart failure,electrolytes,diuretics","Physiological Integrity","standard"
"Multiple Response","Which interventions should the nurse implement for a client with pneumonia? Select all that apply.","Encourage fluid intake","Administer oxygen as prescribed","Restrict all physical activity","Monitor vital signs every 4 hours","Limit protein intake","Encourage deep breathing exercises","1,2,4,6","Correct interventions include encouraging fluids (helps thin secretions), administering oxygen (improves oxygenation), monitoring vital signs (detects changes), and deep breathing exercises (prevents atelectasis). Restricting all activity and limiting protein are not appropriate interventions for pneumonia.","Physiological Adaptation","Application","medium","pneumonia,respiratory,oxygen,interventions","Physiological Integrity","standard"`;
}
