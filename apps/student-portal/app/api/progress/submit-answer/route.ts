import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { UserProgress, NclexItemDraft } from '@nclex/shared-api-types';

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');
const ITEMS_FILE = path.join(process.cwd(), '../admin-dashboard/data', 'items.json');

function getProgress(): UserProgress[] {
    try {
        if (!fs.existsSync(PROGRESS_FILE)) {
            fs.writeFileSync(PROGRESS_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading progress:', error);
        return [];
    }
}

function saveProgress(progress: UserProgress[]) {
    try {
        const dir = path.dirname(PROGRESS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

function getQuestion(questionId: string): NclexItemDraft | null {
    try {
        if (!fs.existsSync(ITEMS_FILE)) return null;
        const data = fs.readFileSync(ITEMS_FILE, 'utf-8');
        const items: NclexItemDraft[] = JSON.parse(data);
        return items.find(item => item.id === questionId) || null;
    } catch (error) {
        console.error('Error reading question:', error);
        return null;
    }
}

function checkAnswer(question: NclexItemDraft, selectedAnswer: string | string[]): boolean {
    const correctAnswers = question.correctAnswer;

    // Handle multiple answers
    if (Array.isArray(selectedAnswer) && Array.isArray(correctAnswers)) {
        if (selectedAnswer.length !== correctAnswers.length) return false;
        return selectedAnswer.every(ans => correctAnswers.includes(ans));
    }

    // Handle single answer
    if (typeof selectedAnswer === 'string' && typeof correctAnswers === 'string') {
        return selectedAnswer === correctAnswers;
    }

    return false;
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

        // Get the question
        const question = getQuestion(questionId);
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Check if answer is correct
        const isCorrect = checkAnswer(question, selectedAnswer);

        // Get existing progress
        const allProgress = getProgress();

        // Count previous attempts for this question by this user
        const previousAttempts = allProgress.filter(
            p => p.userId === userId && p.questionId === questionId
        );
        const attemptNumber = previousAttempts.length + 1;

        // Create new progress entry
        const newProgress: UserProgress = {
            id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            questionId,
            attemptedAt: new Date().toISOString(),
            selectedAnswer,
            isCorrect,
            timeSpent: timeSpent || 0,
            attemptNumber,
        };

        // Save progress
        allProgress.push(newProgress);
        saveProgress(allProgress);

        return NextResponse.json({
            success: true,
            isCorrect,
            attemptNumber,
            correctAnswer: question.correctAnswer,
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        return NextResponse.json(
            { error: 'Failed to submit answer' },
            { status: 500 }
        );
    }
}
