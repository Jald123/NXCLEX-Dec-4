import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin, DbFlag } from '@/lib/supabase';
import type { QuestionFlag } from '@nclex/shared-api-types';

function mapDbFlag(db: DbFlag): QuestionFlag {
    return {
        id: db.id,
        userId: db.user_id,
        questionId: db.question_id,
        flaggedAt: db.created_at,
        // reason: db.reason // Missing in schema, omitting for now
    };
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { data, error } = await supabaseAdmin
            .from('question_flags')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching flags:', error);
            return NextResponse.json({ flags: [] });
        }

        const userFlags = (data as DbFlag[]).map(mapDbFlag);

        return NextResponse.json({ flags: userFlags });
    } catch (error) {
        console.error('Error fetching flagged questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch flagged questions' },
            { status: 500 }
        );
    }
}
