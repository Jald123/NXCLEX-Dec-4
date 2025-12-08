import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { WellnessSession } from '@nclex/shared-api-types';
import { supabaseAdmin, DbSession } from '@/lib/supabase';

// Helper to map DB result to plain WellnessSession
function mapDbToWellness(db: DbSession): WellnessSession {
    // We stored metadata in 'results' JSON column
    const meta = db.results || {};
    return {
        id: db.id,
        userId: db.user_id,
        type: db.mode.replace('wellness_', '') as WellnessSession['type'],
        exerciseName: meta.exerciseName,
        technique: meta.technique,
        duration: meta.duration,
        completed: db.status === 'completed',
        startedAt: db.started_at,
        completedAt: db.completed_at || undefined
    };
}

// POST: Start a new wellness session
export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { type, exerciseName, technique, duration } = body;

        // Store as a practice_session with special mode and metadata in results
        const { data, error } = await supabaseAdmin
            .from('practice_sessions')
            .insert({
                user_id: userId,
                mode: `wellness_${type}`,
                questions: [], // No questions
                status: 'in_progress',
                started_at: new Date().toISOString(),
                // Store wellness metadata in results field
                results: {
                    exerciseName,
                    technique,
                    duration // minutes
                }
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ session: mapDbToWellness(data as DbSession) });
    } catch (error) {
        console.error('Error starting wellness session:', error);
        return NextResponse.json(
            { error: 'Failed to start session' },
            { status: 500 }
        );
    }
}

// PATCH: Complete a wellness session
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { sessionId } = body;

        const { data, error } = await supabaseAdmin
            .from('practice_sessions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ session: mapDbToWellness(data as DbSession) });
    } catch (error) {
        console.error('Error completing wellness session:', error);
        return NextResponse.json(
            { error: 'Failed to complete session' },
            { status: 500 }
        );
    }
}
