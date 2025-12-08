import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { PracticeSession, UserProgress, NclexItemDraft } from '@nclex/shared-api-types';
import { supabaseAdmin, DbSession, DbProgress, TABLES } from '@/lib/supabase';
import { getPublishedItems } from '@/lib/storage';

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

// GET: Get specific session
export async function GET(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { data, error } = await supabaseAdmin
            .from('practice_sessions')
            .select('*')
            .eq('id', params.sessionId)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const practiceSession = mapDbSession(data as DbSession);

        const progress = {
            current: practiceSession.currentQuestionIndex + 1,
            total: practiceSession.questions.length,
            answered: practiceSession.currentQuestionIndex,
            remaining: practiceSession.questions.length - practiceSession.currentQuestionIndex
        };

        return NextResponse.json({
            session: practiceSession,
            progress
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { error: 'Failed to fetch session' },
            { status: 500 }
        );
    }
}

// POST: Complete session
export async function POST(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // 1. Fetch Session
        const { data: sessionData, error: sessionError } = await supabaseAdmin
            .from('practice_sessions')
            .select('*')
            .eq('id', params.sessionId)
            .eq('user_id', userId)
            .single();

        if (sessionError || !sessionData) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const practiceSession = mapDbSession(sessionData as DbSession);

        // 2. Fetch User Progress for relevant questions
        // We only care about progress for questions IN this session
        // AND attempts that happened AFTER the session started
        const { data: progressData } = await supabaseAdmin
            .from(TABLES.PROGRESS)
            .select('*')
            .eq('user_id', userId)
            .in('question_id', practiceSession.questions);
        // .gte('attempted_at', practiceSession.startedAt); // Optional: if we want stricly session attempts
        // The logic in original file was: attemptedAt >= session.startedAt

        const sessionProgressDb = (progressData || []) as DbProgress[];

        // Filter by time locally or assume DB query is better (locally is safer for timezone issues if any)
        const validProgress = sessionProgressDb.filter(p =>
            new Date(p.attempted_at) >= new Date(practiceSession.startedAt)
        );

        // 3. Fetch Questions to get domains/categories
        // We can optimize this by fetching only IDs in session, but getPublishedItems gets all.
        // Assuming cache or reasonable size. 
        // Or we use supabaseAdmin directly to fetch specific IDs.
        const { data: questionsData } = await supabaseAdmin
            .from('NclexItem')
            .select('*')
            .in('id', practiceSession.questions);

        const relevantQuestions = (questionsData || []) as NclexItemDraft[];

        // 4. Calculate Stats
        // Logic copied from original: Get latest attempt per question
        const latestAttempts = new Map<string, DbProgress>();
        validProgress.forEach(p => {
            const existing = latestAttempts.get(p.question_id);
            if (!existing || new Date(p.attempted_at) > new Date(existing.attempted_at)) {
                latestAttempts.set(p.question_id, p);
            }
        });

        const attempted = latestAttempts.size;
        const correct = Array.from(latestAttempts.values()).filter(p => p.is_correct).length;
        const incorrect = attempted - correct;
        const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
        const totalTime = Array.from(latestAttempts.values()).reduce((sum, p) => sum + (p.time_spent || 0), 0);
        const averageTime = attempted > 0 ? totalTime / attempted : 0;

        // Calculate by domain
        const domainMap = new Map<string, { attempted: number; correct: number }>();
        Array.from(latestAttempts.values()).forEach(progress => {
            const question = relevantQuestions.find(q => q.id === progress.question_id);
            if (question) {
                const domain = question.category || 'Other';
                const existing = domainMap.get(domain) || { attempted: 0, correct: 0 };
                existing.attempted++;
                if (progress.is_correct) existing.correct++;
                domainMap.set(domain, existing);
            }
        });

        const byDomain = Array.from(domainMap.entries()).map(([domain, stats]) => ({
            domain,
            attempted: stats.attempted,
            correct: stats.correct,
            accuracy: (stats.correct / stats.attempted) * 100
        }));

        const results = {
            attempted,
            correct,
            incorrect,
            accuracy: Math.round(accuracy * 10) / 10,
            totalTime: Math.round(totalTime),
            averageTime: Math.round(averageTime),
            byDomain
        };

        // 5. Update Session
        const { data: updatedSessionData, error: updateError } = await supabaseAdmin
            .from('practice_sessions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                results: results
            })
            .eq('id', params.sessionId)
            .select()
            .single();

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            session: mapDbSession(updatedSessionData as DbSession),
            results
        });
    } catch (error) {
        console.error('Error completing session:', error);
        return NextResponse.json(
            { error: 'Failed to complete session' },
            { status: 500 }
        );
    }
}
