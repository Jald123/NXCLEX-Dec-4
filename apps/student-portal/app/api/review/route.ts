import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type { ReviewSchedule } from '@nclex/shared-api-types';

const SCHEDULES_FILE = path.join(process.cwd(), 'data', 'review-schedules.json');

function getSchedules(): ReviewSchedule[] {
    try {
        if (!fs.existsSync(SCHEDULES_FILE)) {
            const dir = path.dirname(SCHEDULES_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(SCHEDULES_FILE, '[]', 'utf-8');
            return [];
        }
        const data = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading schedules:', error);
        return [];
    }
}

function saveSchedules(schedules: ReviewSchedule[]) {
    try {
        const dir = path.dirname(SCHEDULES_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving schedules:', error);
    }
}

// SM-2 Algorithm
function calculateNextReview(quality: number, schedule?: ReviewSchedule): ReviewSchedule {
    const now = new Date().toISOString();

    if (!schedule) {
        // First review
        return {
            userId: '',
            questionId: '',
            easinessFactor: 2.5,
            interval: 1,
            repetitions: 1,
            nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            lastReviewDate: now,
            lastQuality: quality
        };
    }

    let { easinessFactor, interval, repetitions } = schedule;

    // Update easiness factor
    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easinessFactor = Math.max(1.3, easinessFactor);

    // Update interval and repetitions
    if (quality < 3) {
        // Incorrect - reset
        repetitions = 0;
        interval = 1;
    } else {
        repetitions++;
        if (repetitions === 1) {
            interval = 1;
        } else if (repetitions === 2) {
            interval = 6;
        } else {
            interval = Math.round(interval * easinessFactor);
        }
    }

    const nextReviewDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();

    return {
        ...schedule,
        easinessFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewDate: now,
        lastQuality: quality
    };
}

// GET: Get questions due for review
export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const schedules = getSchedules();
        const userSchedules = schedules.filter(s => s.userId === userId);

        const now = new Date();
        const dueForReview = userSchedules.filter(s => new Date(s.nextReviewDate) <= now);

        return NextResponse.json({
            dueCount: dueForReview.length,
            questions: dueForReview.map(s => s.questionId)
        });
    } catch (error) {
        console.error('Error fetching due reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch due reviews' },
            { status: 500 }
        );
    }
}

// POST: Submit review and update schedule
export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { questionId, quality } = body; // quality: 0-5

        if (quality < 0 || quality > 5) {
            return NextResponse.json({ error: 'Quality must be 0-5' }, { status: 400 });
        }

        const schedules = getSchedules();
        const existingIndex = schedules.findIndex(
            s => s.userId === userId && s.questionId === questionId
        );

        let newSchedule: ReviewSchedule;

        if (existingIndex >= 0) {
            newSchedule = calculateNextReview(quality, schedules[existingIndex]);
            newSchedule.userId = userId;
            newSchedule.questionId = questionId;
            schedules[existingIndex] = newSchedule;
        } else {
            newSchedule = calculateNextReview(quality);
            newSchedule.userId = userId;
            newSchedule.questionId = questionId;
            schedules.push(newSchedule);
        }

        saveSchedules(schedules);

        return NextResponse.json({
            schedule: newSchedule,
            nextReviewIn: `${newSchedule.interval} day${newSchedule.interval > 1 ? 's' : ''}`
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
        );
    }
}
