import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';

const REVIEW_SCHEDULES_FILE = path.join(process.cwd(), 'data', 'review-schedules.json');
const ITEMS_FILE = path.join(process.cwd(), '..', 'admin-dashboard', 'data', 'items.json');

// Ensure review schedules file exists
if (!fs.existsSync(REVIEW_SCHEDULES_FILE)) {
    fs.writeFileSync(REVIEW_SCHEDULES_FILE, JSON.stringify([], null, 2));
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.email;
        const now = new Date();

        // Load review schedules
        const schedules = JSON.parse(fs.readFileSync(REVIEW_SCHEDULES_FILE, 'utf-8'));
        const userSchedules = schedules.filter((s: any) =>
            s.userId === userId &&
            new Date(s.nextReviewDate) <= now
        );

        // Load questions
        const allItems = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf-8'));
        const reviewItemIds = userSchedules.map((s: any) => s.itemId);
        const reviewQuestions = allItems.filter((item: any) =>
            reviewItemIds.includes(item.id) &&
            (item.status === 'published_student' || item.status === 'published_trial')
        );

        // Add review metadata
        const questionsWithReviewData = reviewQuestions.map((q: any) => {
            const schedule = userSchedules.find((s: any) => s.itemId === q.id);
            return {
                ...q,
                reviewData: {
                    repetitions: schedule?.repetitions || 0,
                    easeFactor: schedule?.easeFactor || 2.5,
                    interval: schedule?.interval || 0,
                    nextReviewDate: schedule?.nextReviewDate,
                    lastReviewedAt: schedule?.lastReviewedAt
                }
            };
        });

        // Sort by priority (earlier review dates first)
        questionsWithReviewData.sort((a: any, b: any) =>
            new Date(a.reviewData.nextReviewDate).getTime() -
            new Date(b.reviewData.nextReviewDate).getTime()
        );

        return NextResponse.json({
            questions: questionsWithReviewData,
            total: questionsWithReviewData.length,
            dueToday: questionsWithReviewData.filter((q: any) => {
                const reviewDate = new Date(q.reviewData.nextReviewDate);
                const today = new Date();
                return reviewDate.toDateString() === today.toDateString();
            }).length
        });
    } catch (error) {
        console.error('Error fetching review queue:', error);
        return NextResponse.json(
            { error: 'Failed to fetch review queue' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.email;
        const { itemId, quality } = await req.json();

        if (!itemId || quality === undefined) {
            return NextResponse.json(
                { error: 'Item ID and quality required' },
                { status: 400 }
            );
        }

        // Load schedules
        const schedules = JSON.parse(fs.readFileSync(REVIEW_SCHEDULES_FILE, 'utf-8'));
        const scheduleIndex = schedules.findIndex((s: any) =>
            s.userId === userId && s.itemId === itemId
        );

        let schedule;
        if (scheduleIndex >= 0) {
            schedule = schedules[scheduleIndex];
        } else {
            schedule = {
                userId,
                itemId,
                repetitions: 0,
                easeFactor: 2.5,
                interval: 0
            };
        }

        // SM-2 algorithm
        const { repetitions, easeFactor, interval } = calculateNextReview(
            schedule.repetitions,
            schedule.easeFactor,
            schedule.interval,
            quality
        );

        const now = new Date();
        const nextReviewDate = new Date(now);
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);

        const updatedSchedule = {
            ...schedule,
            repetitions,
            easeFactor,
            interval,
            lastReviewedAt: now.toISOString(),
            nextReviewDate: nextReviewDate.toISOString()
        };

        if (scheduleIndex >= 0) {
            schedules[scheduleIndex] = updatedSchedule;
        } else {
            schedules.push(updatedSchedule);
        }

        fs.writeFileSync(REVIEW_SCHEDULES_FILE, JSON.stringify(schedules, null, 2));

        return NextResponse.json({
            success: true,
            nextReviewDate: nextReviewDate.toISOString(),
            interval
        });
    } catch (error) {
        console.error('Error updating review schedule:', error);
        return NextResponse.json(
            { error: 'Failed to update review schedule' },
            { status: 500 }
        );
    }
}

function calculateNextReview(
    repetitions: number,
    easeFactor: number,
    interval: number,
    quality: number
): { repetitions: number; easeFactor: number; interval: number } {
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (newEaseFactor < 1.3) {
        newEaseFactor = 1.3;
    }

    let newRepetitions = repetitions;
    let newInterval = interval;

    if (quality < 3) {
        newRepetitions = 0;
        newInterval = 1;
    } else {
        newRepetitions = repetitions + 1;

        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEaseFactor);
        }
    }

    return {
        repetitions: newRepetitions,
        easeFactor: newEaseFactor,
        interval: newInterval
    };
}
