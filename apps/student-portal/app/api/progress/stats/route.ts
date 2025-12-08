import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { UserProgress, UserStats, CategoryStat, NclexItemDraft } from '@nclex/shared-api-types';
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

// Optimized stats calculation
async function calculateStats(userId: string): Promise<UserStats> {
    // 1. Fetch all progress for user
    const { data: progressData, error } = await supabaseAdmin
        .from(TABLES.PROGRESS)
        .select('*')
        .eq('user_id', userId);

    if (error) throw new Error(error.message);

    const userProgress = (progressData as DbProgress[]).map(mapDbProgress);

    // 2. Get unique questions (latest attempt)
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    const latestAttempts = Array.from(uniqueQuestions.values());
    const attemptedQuestionIds = Array.from(uniqueQuestions.keys());

    // 3. Fetch ONLY attempted questions to get categories
    let questions: NclexItemDraft[] = [];
    if (attemptedQuestionIds.length > 0) {
        // Supabase `in` filter works for array of values
        const { data: qData } = await supabaseAdmin
            .from('NclexItem')
            .select('id, category') // Select only needed fields
            .in('id', attemptedQuestionIds);

        questions = (qData || []) as Partial<NclexItemDraft>[] as NclexItemDraft[];
    }

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
        const stats = await calculateStats(userId);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        return NextResponse.json(
            { error: 'Failed to calculate stats' },
            { status: 500 }
        );
    }
}
