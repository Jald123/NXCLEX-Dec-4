import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { getPublishedItem } from '@/lib/storage';
import type { NclexItemDraft } from '@nclex/shared-api-types';

function checkAnswer(question: NclexItemDraft, selectedAnswer: string | string[]): boolean {
    // Get correct answer IDs from options
    const correctAnswerIds = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);

    // Handle multiple answers (select-all questions)
    if (Array.isArray(selectedAnswer)) {
        if (selectedAnswer.length !== correctAnswerIds.length) return false;
        return selectedAnswer.every(ans => correctAnswerIds.includes(ans));
    }

    // Handle single answer
    return correctAnswerIds.includes(selectedAnswer);
}

function getCorrectAnswers(question: NclexItemDraft): string[] {
    return question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { questionId, selectedAnswer, timeSpent } = await req.json();

        if (!questionId || !selectedAnswer) {
            return NextResponse.json(
                { error: 'Question ID and answer required' },
                { status: 400 }
            );
        }

        const userId = (session.user as any).id;

        // Get the question (still uses storage.ts which reads from admin-dashboard)
        const question = await getPublishedItem(questionId);
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Check if answer is correct
        const isCorrect = checkAnswer(question, selectedAnswer);

        // Count previous attempts for this question by this user
        const { count } = await supabaseAdmin
            .from(TABLES.PROGRESS)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('question_id', questionId);

        const attemptNumber = (count || 0) + 1;

        // Insert progress into Supabase
        const { error } = await supabaseAdmin
            .from(TABLES.PROGRESS)
            .insert({
                user_id: userId,
                question_id: questionId,
                selected_answer: selectedAnswer, // JSONB handles array/string natively
                is_correct: isCorrect,
                time_spent: timeSpent || 0,
                attempt_number: attemptNumber,
            });

        if (error) {
            console.error('Error saving progress to Supabase:', error);
            return NextResponse.json(
                { error: 'Failed to save progress' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            isCorrect,
            attemptNumber,
            correctAnswer: getCorrectAnswers(question),
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        return NextResponse.json(
            { error: 'Failed to submit answer' },
            { status: 500 }
        );
    }
}
