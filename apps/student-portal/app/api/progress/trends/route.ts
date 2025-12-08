import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { UserProgress, TrendPoint } from '@nclex/shared-api-types';
import { supabaseAdmin, DbProgress, TABLES } from '@/lib/supabase';

function mapDbProgress(db: DbProgress): UserProgress {
    return {
        id: db.id,
        userId: db.user_id,
        questionId: db.question_id,
        attemptedAt: db.attempted_at,
        selectedAnswer: db.selected_answer,
        isCorrect: db.is_correct,
        timeSpent: db.time_spent,
        attemptNumber: db.attempt_number
    };
}

async function calculateTrendData(userId: string, days: number = 30): Promise<TrendPoint[]> {
    // 1. Fetch all progress for user
    const { data: progressData, error } = await supabaseAdmin
        .from(TABLES.PROGRESS)
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching progress for trends:', error);
        return [];
    }

    const userProgress = (progressData as DbProgress[]).map(mapDbProgress);

    // Get unique questions (latest attempt only)
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    const latestAttempts = Array.from(uniqueQuestions.values());

    // Group by date
    const dateMap = new Map<string, { correct: number; total: number }>();

    latestAttempts.forEach(progress => {
        const date = new Date(progress.attemptedAt).toISOString().split('T')[0];
        const existing = dateMap.get(date) || { correct: 0, total: 0 };
        existing.total++;
        if (progress.isCorrect) existing.correct++;
        dateMap.set(date, existing);
    });

    // Convert to array and calculate rolling average
    const trendPoints: TrendPoint[] = [];
    const sortedDates = Array.from(dateMap.keys()).sort();

    sortedDates.forEach((date, index) => {
        const stats = dateMap.get(date)!;

        // Calculate 7-day rolling average
        const startIndex = Math.max(0, index - 6);
        const window = sortedDates.slice(startIndex, index + 1);

        let windowCorrect = 0;
        let windowTotal = 0;
        window.forEach(d => {
            const s = dateMap.get(d)!;
            windowCorrect += s.correct;
            windowTotal += s.total;
        });

        const accuracy = windowTotal > 0 ? (windowCorrect / windowTotal) * 100 : 0;

        trendPoints.push({
            date,
            accuracy: Math.round(accuracy * 10) / 10,
            attempted: stats.total,
        });
    });

    // Return last N days
    return trendPoints.slice(-days);
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const trendData = await calculateTrendData(userId, 30);

        return NextResponse.json({ trends: trendData });
    } catch (error) {
        console.error('Error calculating trend data:', error);
        return NextResponse.json(
            { error: 'Failed to calculate trends' },
            { status: 500 }
        );
    }
}
