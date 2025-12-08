import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import type { PracticeSession } from '@nclex/shared-api-types';
import { supabaseAdmin, DbSession } from '@/lib/supabase';

// Helper to map DB result to API type
function mapDbSession(db: DbSession): PracticeSession {
    return {
        id: db.id,
        userId: db.user_id,
        mode: db.mode as PracticeSession['mode'], // Cast if needed
        questions: db.questions,
        startedAt: db.started_at,
        completedAt: db.completed_at || undefined,
        status: db.status as PracticeSession['status'],
        currentQuestionIndex: db.current_question_index,
        results: db.results
    };
}

// POST: Create new session
export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { mode, questionIds, useRecommended } = body;

        let questions: string[] = [];

        if (useRecommended) {
            // Fetch recommended questions
            // Ensure NEXTAUTH_URL is defined, fallback to localhost if missing (dev safety)
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
            const recResponse = await fetch(`${baseUrl}/api/practice/recommended?count=20`);
            if (recResponse.ok) {
                const recData = await recResponse.json();
                questions = recData.recommendations.questions.map((q: any) => q.questionId);
            }
        } else if (questionIds && Array.isArray(questionIds)) {
            questions = questionIds;
        }

        if (questions.length === 0) {
            return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
        }

        // Create in Supabase
        const { data, error } = await supabaseAdmin
            .from('practice_sessions')
            .insert({
                user_id: userId,
                mode: mode || 'recommended',
                questions: questions, // Supabase handles JSONB array
                status: 'in_progress',
                current_question_index: 0,
                started_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating session:', error);
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error('No data returned from creation');
        }

        const newSession = mapDbSession(data as DbSession);

        return NextResponse.json({
            session: newSession,
            firstQuestionId: questions[0]
        });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        );
    }
}

// GET: Get all sessions for user
export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { data, error } = await supabaseAdmin
            .from('practice_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('started_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching sessions:', error);
            throw new Error(error.message);
        }

        const userSessions = (data as DbSession[]).map(mapDbSession);

        return NextResponse.json({ sessions: userSessions });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}
