import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { PracticeSession, UserProgress, NclexItemDraft } from '@nclex/shared-api-types';

const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');
const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');
const ITEMS_FILE = path.join(process.cwd(), '../admin-dashboard/data', 'items.json');

function getSessions(): PracticeSession[] {
    try {
        if (!fs.existsSync(SESSIONS_FILE)) return [];
        const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveSessions(sessions: PracticeSession[]) {
    try {
        const dir = path.dirname(SESSIONS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving sessions:', error);
    }
}

function getProgress(): UserProgress[] {
    try {
        if (!fs.existsSync(PROGRESS_FILE)) return [];
        const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function getQuestions(): NclexItemDraft[] {
    try {
        if (!fs.existsSync(ITEMS_FILE)) return [];
        const data = fs.readFileSync(ITEMS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
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
        const sessions = getSessions();
        const practiceSession = sessions.find(s => s.id === params.sessionId && s.userId === userId);

        if (!practiceSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

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
        const sessions = getSessions();
        const sessionIndex = sessions.findIndex(s => s.id === params.sessionId && s.userId === userId);

        if (sessionIndex === -1) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const practiceSession = sessions[sessionIndex];

        // Calculate results from progress data
        const allProgress = getProgress();
        const allQuestions = getQuestions();

        // Get progress for questions in this session
        const sessionProgress = allProgress.filter(p =>
            p.userId === userId &&
            practiceSession.questions.includes(p.questionId) &&
            new Date(p.attemptedAt) >= new Date(practiceSession.startedAt)
        );

        // Get latest attempt per question
        const latestAttempts = new Map<string, UserProgress>();
        sessionProgress.forEach(p => {
            const existing = latestAttempts.get(p.questionId);
            if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
                latestAttempts.set(p.questionId, p);
            }
        });

        const attempted = latestAttempts.size;
        const correct = Array.from(latestAttempts.values()).filter(p => p.isCorrect).length;
        const incorrect = attempted - correct;
        const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
        const totalTime = Array.from(latestAttempts.values()).reduce((sum, p) => sum + p.timeSpent, 0);
        const averageTime = attempted > 0 ? totalTime / attempted : 0;

        // Calculate by domain
        const domainMap = new Map<string, { attempted: number; correct: number }>();
        Array.from(latestAttempts.values()).forEach(progress => {
            const question = allQuestions.find(q => q.id === progress.questionId);
            if (question) {
                const domain = question.category || 'Other';
                const existing = domainMap.get(domain) || { attempted: 0, correct: 0 };
                existing.attempted++;
                if (progress.isCorrect) existing.correct++;
                domainMap.set(domain, existing);
            }
        });

        const byDomain = Array.from(domainMap.entries()).map(([domain, stats]) => ({
            domain,
            attempted: stats.attempted,
            correct: stats.correct,
            accuracy: (stats.correct / stats.attempted) * 100
        }));

        // Update session
        practiceSession.status = 'completed';
        practiceSession.completedAt = new Date().toISOString();
        practiceSession.results = {
            attempted,
            correct,
            incorrect,
            accuracy: Math.round(accuracy * 10) / 10,
            totalTime: Math.round(totalTime),
            averageTime: Math.round(averageTime),
            byDomain
        };

        sessions[sessionIndex] = practiceSession;
        saveSessions(sessions);

        return NextResponse.json({
            session: practiceSession,
            results: practiceSession.results
        });
    } catch (error) {
        console.error('Error completing session:', error);
        return NextResponse.json(
            { error: 'Failed to complete session' },
            { status: 500 }
        );
    }
}
