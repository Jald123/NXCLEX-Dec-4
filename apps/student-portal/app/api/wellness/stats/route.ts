import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { WellnessSession, WellnessStats } from '@nclex/shared-api-types';

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

function calculateStreak(sessions: WellnessSession[]): { current: number; longest: number } {
    if (sessions.length === 0) return { current: 0, longest: 0 };

    // Get unique dates with completed sessions
    const dates = [...new Set(
        sessions
            .filter(s => s.completed)
            .map(s => new Date(s.completedAt!).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (dates.length === 0) return { current: 0, longest: 0 };

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (dates[0] === today || dates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    return { current: currentStreak, longest: longestStreak };
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const allSessions = getSessions();
        const userSessions = allSessions.filter(s => s.userId === userId && s.completed);

        if (userSessions.length === 0) {
            const emptyStats: WellnessStats = {
                userId,
                totalSessions: 0,
                currentStreak: 0,
                longestStreak: 0,
                favoriteExercise: '',
                totalMinutes: 0,
                lastSessionAt: '',
                sessionsByType: {
                    breathing: 0,
                    muscle_relaxation: 0,
                    meditation: 0,
                    study_break: 0
                }
            };
            return NextResponse.json(emptyStats);
        }

        // Calculate stats
        const streaks = calculateStreak(userSessions);
        const totalMinutes = Math.round(userSessions.reduce((sum, s) => sum + s.duration, 0) / 60);

        // Count by type
        const sessionsByType = {
            breathing: userSessions.filter(s => s.type === 'breathing').length,
            muscle_relaxation: userSessions.filter(s => s.type === 'muscle_relaxation').length,
            meditation: userSessions.filter(s => s.type === 'meditation').length,
            study_break: userSessions.filter(s => s.type === 'study_break').length
        };

        // Find favorite
        const favorite = Object.entries(sessionsByType)
            .sort(([, a], [, b]) => b - a)[0][0];

        const stats: WellnessStats = {
            userId,
            totalSessions: userSessions.length,
            currentStreak: streaks.current,
            longestStreak: streaks.longest,
            favoriteExercise: favorite,
            totalMinutes,
            lastSessionAt: userSessions[userSessions.length - 1].completedAt!,
            sessionsByType
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching wellness stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wellness stats' },
            { status: 500 }
        );
    }
}
