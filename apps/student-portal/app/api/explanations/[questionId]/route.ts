import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { QuestionExplanation } from '@nclex/shared-api-types';

export async function GET(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const { data, error } = await supabaseAdmin
            .from('NclexItem')
            .select('id, rationale, explanation') // Select all potential explanation fields
            .eq('id', params.questionId)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Explanation not found' },
                { status: 404 }
            );
        }

        // Map to QuestionExplanation type
        // content/rationale might vary based on DB schema. Assuming 'rationale' or 'explanation' column.
        // If DB has JSONB for explanation details, we could use that.
        // For now, mapping simple string to correctAnswerRationale.

        const explanation: QuestionExplanation = {
            questionId: data.id,
            correctAnswerRationale: data.rationale || data.explanation || "Explanation not available.",
            distractorRationales: [],
            keyConcepts: [],
            references: []
        };

        return NextResponse.json(explanation);
    } catch (error) {
        console.error('Error fetching explanation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch explanation' },
            { status: 500 }
        );
    }
}
