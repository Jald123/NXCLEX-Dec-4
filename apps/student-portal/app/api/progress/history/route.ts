import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { UserProgress } from '@nclex/shared-api-types';

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');

function getProgress(): UserProgress[] {
    try {
        if (!fs.existsSync(PROGRESS_FILE)) return [];
        const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading progress:', error);
        return [];
    }
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

        const allProgress = getProgress();
        let userProgress = allProgress.filter(p => p.userId === userId);

        // Apply filter
        if (filter === 'correct') {
            userProgress = userProgress.filter(p => p.isCorrect);
        } else if (filter === 'incorrect') {
            userProgress = userProgress.filter(p => !p.isCorrect);
        }

        // Sort by most recent first
        userProgress.sort((a, b) =>
            new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
        );

        // Apply limit
        const limitedProgress = userProgress.slice(0, limit);

        return NextResponse.json({
            history: limitedProgress,
            total: userProgress.length,
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
