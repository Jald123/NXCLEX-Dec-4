import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { WellnessSession } from '@nclex/shared-api-types';

const SESSIONS_FILE = path.join(process.cwd(), 'data', 'wellness-sessions.json');

function getSessions(): WellnessSession[] {
    try {
        if (!fs.existsSync(SESSIONS_FILE)) {
            const dir = path.dirname(SESSIONS_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(SESSIONS_FILE, '[]', 'utf-8');
            return [];
        }
        const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading wellness sessions:', error);
        return [];
    }
}

function saveSessions(sessions: WellnessSession[]) {
    try {
        const dir = path.dirname(SESSIONS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving wellness sessions:', error);
    }
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

        const newSession: WellnessSession = {
            id: uuidv4(),
            userId,
            type,
            exerciseName,
            technique,
            duration,
            completed: false,
            startedAt: new Date().toISOString()
        };

        const sessions = getSessions();
        sessions.push(newSession);
        saveSessions(sessions);

        return NextResponse.json({ session: newSession });
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

        const sessions = getSessions();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId && s.userId === userId);

        if (sessionIndex === -1) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        sessions[sessionIndex].completed = true;
        sessions[sessionIndex].completedAt = new Date().toISOString();
        saveSessions(sessions);

        return NextResponse.json({ session: sessions[sessionIndex] });
    } catch (error) {
        console.error('Error completing wellness session:', error);
        return NextResponse.json(
            { error: 'Failed to complete session' },
            { status: 500 }
        );
    }
}
