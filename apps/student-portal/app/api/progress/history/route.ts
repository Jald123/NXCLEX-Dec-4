import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { UserProgress } from '@nclex/shared-api-types';
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

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter'); // 'correct' | 'incorrect' | 'all'
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabaseAdmin
            .from(TABLES.PROGRESS)
            .select('*')
            .eq('user_id', userId)
            .order('attempted_at', { ascending: false })
            .limit(limit);

        if (filter === 'correct') {
            query = query.eq('is_correct', true);
        } else if (filter === 'incorrect') {
            query = query.eq('is_correct', false);
        }

        const { data, error, count } = await query; // count not automatically included with select(*) unless requested

        if (error) {
            console.error('Supabase error fetching history:', error);
            return NextResponse.json({ history: [], total: 0 });
        }

        const history = (data as DbProgress[]).map(mapDbProgress);

        return NextResponse.json({
            history,
            total: history.length, // approximate if limited, ideally query count separately if needed but basic stats ok
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
