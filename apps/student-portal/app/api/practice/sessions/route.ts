import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PracticeSession } from '@nclex/shared-api-types';

const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');

function getSessions(): PracticeSession[] {
    try {
        if (!fs.existsSync(SESSIONS_FILE)) {
            fs.writeFileSync(SESSIONS_FILE, '[]', 'utf-8');
            return [];
        }
        const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading sessions:', error);
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
            const recResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/practice/recommended?count=20`);
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

        const newSession: PracticeSession = {
            id: uuidv4(),
            userId,
            mode: mode || 'recommended',
            questions,
            startedAt: new Date().toISOString(),
            status: 'in_progress',
            currentQuestionIndex: 0
        };

        const sessions = getSessions();
        sessions.push(newSession);
        saveSessions(sessions);

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
        const sessions = getSessions();
        const userSessions = sessions.filter(s => s.userId === userId);

        return NextResponse.json({ sessions: userSessions });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}
