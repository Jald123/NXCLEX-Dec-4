import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { ReviewSchedule } from '@nclex/shared-api-types';
import { supabaseAdmin, DbReview, TABLES } from '@/lib/supabase';

// Helper to map DB review to API type
function mapDbReview(db: DbReview): ReviewSchedule {
    return {
        userId: db.user_id,
        questionId: db.question_id,
        easinessFactor: db.easiness_factor,
        interval: db.interval,
        repetitions: db.repetitions,
        nextReviewDate: db.next_review_date,
        lastReviewDate: db.last_review_date,
        lastQuality: db.last_quality
    };
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
        const now = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from(TABLES.REVIEWS)
            .select('*')
            .eq('user_id', userId)
            .lte('next_review_date', now);

        if (error) {
            console.error('Error fetching due reviews:', error);
            return NextResponse.json({ dueCount: 0, questions: [] });
        }

        const dueForReview = (data as DbReview[]).map(r => r.question_id); // Only return IDs

        return NextResponse.json({
            dueCount: dueForReview.length,
            questions: dueForReview
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

        // Fetch existing schedule
        const { data: existingData } = await supabaseAdmin
            .from(TABLES.REVIEWS)
            .select('*')
            .eq('user_id', userId)
            .eq('question_id', questionId)
            .single();

        const existingSchedule = existingData ? mapDbReview(existingData) : undefined;

        let newSchedule: ReviewSchedule;

        if (existingSchedule) {
            newSchedule = calculateNextReview(quality, existingSchedule);
            newSchedule.userId = userId;
            newSchedule.questionId = questionId;
        } else {
            newSchedule = calculateNextReview(quality);
            newSchedule.userId = userId;
            newSchedule.questionId = questionId;
        }

        // Save to DB
        const dbPayload = {
            user_id: userId,
            question_id: questionId,
            easiness_factor: newSchedule.easinessFactor,
            interval: newSchedule.interval,
            repetitions: newSchedule.repetitions,
            next_review_date: newSchedule.nextReviewDate,
            last_review_date: newSchedule.lastReviewDate,
            last_quality: newSchedule.lastQuality
        };

        const { error: saveError } = await supabaseAdmin
            .from(TABLES.REVIEWS)
            .upsert(dbPayload, { onConflict: 'user_id, question_id' });

        if (saveError) {
            throw saveError;
        }

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
