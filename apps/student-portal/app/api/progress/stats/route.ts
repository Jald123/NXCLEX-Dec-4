import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { UserProgress, UserStats, CategoryStat, NclexItemDraft } from '@nclex/shared-api-types';

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');
const ITEMS_FILE = path.join(process.cwd(), '../admin-dashboard/data', 'items.json');

function getProgress(): UserProgress[] {
    try {
        if (!fs.existsSync(PROGRESS_FILE)) return [];
        const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading progress:', error);
        return [];
    }
}

function getQuestions(): NclexItemDraft[] {
    try {
        if (!fs.existsSync(ITEMS_FILE)) return [];
        const data = fs.readFileSync(ITEMS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions:', error);
        return [];
    }
}

function calculateStats(userId: string): UserStats {
    const allProgress = getProgress();
    const userProgress = allProgress.filter(p => p.userId === userId);
    const questions = getQuestions();

    // Get unique questions (only count latest attempt)
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    const latestAttempts = Array.from(uniqueQuestions.values());
    const totalAttempted = latestAttempts.length;
    const totalCorrect = latestAttempts.filter(p => p.isCorrect).length;
    const totalIncorrect = totalAttempted - totalCorrect;
    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    const totalTime = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageTimePerQuestion = userProgress.length > 0 ? totalTime / userProgress.length : 0;

    // Calculate category stats
    const categoryMap = new Map<string, { attempted: number; correct: number }>();

    latestAttempts.forEach(progress => {
        const question = questions.find(q => q.id === progress.questionId);
        if (question) {
            const category = question.category || 'Uncategorized';
            const existing = categoryMap.get(category) || { attempted: 0, correct: 0 };
            existing.attempted++;
            if (progress.isCorrect) existing.correct++;
            categoryMap.set(category, existing);
        }
    });

    const categoryStats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        attempted: stats.attempted,
        correct: stats.correct,
        accuracy: (stats.correct / stats.attempted) * 100,
    }));

    return {
        userId,
        totalAttempted,
        totalCorrect,
        totalIncorrect,
        accuracy: Math.round(accuracy * 10) / 10,
        averageTimePerQuestion: Math.round(averageTimePerQuestion),
        categoryStats,
        lastUpdated: new Date().toISOString(),
    };
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const stats = calculateStats(userId);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        return NextResponse.json(
            { error: 'Failed to calculate stats' },
            { status: 500 }
        );
    }
}
