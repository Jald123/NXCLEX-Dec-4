import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { QuestionExplanation } from '@nclex/shared-api-types';

const EXPLANATIONS_FILE = path.join(process.cwd(), 'data', 'explanations.json');

function getExplanations(): QuestionExplanation[] {
    try {
        if (!fs.existsSync(EXPLANATIONS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(EXPLANATIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading explanations:', error);
        return [];
    }
}

export async function GET(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const explanations = getExplanations();
        const explanation = explanations.find(e => e.questionId === params.questionId);

        if (!explanation) {
            return NextResponse.json(
                { error: 'Explanation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(explanation);
    } catch (error) {
        console.error('Error fetching explanation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch explanation' },
            { status: 500 }
        );
    }
}
