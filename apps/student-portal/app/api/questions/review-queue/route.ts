import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin, DbReview, TABLES } from '@/lib/supabase';
import { getPublishedItems } from '@/lib/storage'; // Reusing this for item fetching

// Helper to map DB review to API format expected by frontend
function mapReviewData(db: DbReview) {
    return {
        repetitions: db.repetitions,
        easeFactor: db.easiness_factor,
        interval: db.interval,
        nextReviewDate: db.next_review_date,
        lastReviewedAt: db.last_review_date
    };
}

// SM-2 Algorithm (Duplicated from api/review/route.ts for independence)
function calculateNextReview(
    repetitions: number,
    easeFactor: number,
    interval: number,
    quality: number
): { repetitions: number; easeFactor: number; interval: number } {
    let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor);

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

export async function GET(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const now = new Date().toISOString();

        // 1. Fetch due reviews
        const { data: dueReviews, error } = await supabaseAdmin
            .from(TABLES.REVIEWS)
            .select('*')
            .eq('user_id', userId)
            .lte('next_review_date', now);

        if (error) {
            console.error('Error fetching reviews:', error);
            return NextResponse.json({ questions: [], total: 0, dueToday: 0 });
        }

        if (!dueReviews || dueReviews.length === 0) {
            return NextResponse.json({ questions: [], total: 0, dueToday: 0 });
        }

        const questionIds = dueReviews.map(r => r.question_id);

        // 2. Fetch questions
        // Optimisation: Fetch all published items and filter in memory if list is small, 
        // OR fetch specific IDs if getPublishedItems supported it. 
        // getPublishedItems fetches ALL. Assuming reasonable size for now.
        const allItems = await getPublishedItems('student_paid');

        const reviewQuestions = allItems.filter(item =>
            questionIds.includes(item.id) &&
            (item.status === 'published_student' || item.status === 'published_trial')
        );

        // 3. Combine
        const questionsWithReviewData = reviewQuestions.map(q => {
            const schedule = dueReviews.find(s => s.question_id === q.id);
            return {
                ...q,
                reviewData: schedule ? mapReviewData(schedule) : null
            };
        }).filter(q => q.reviewData); // Ensure schedule consistency

        // Sort by priority (earlier review dates first)
        questionsWithReviewData.sort((a, b) =>
            new Date(a.reviewData!.nextReviewDate).getTime() -
            new Date(b.reviewData!.nextReviewDate).getTime()
        );

        // Calculate dueToday count
        const todayStr = new Date().toDateString();
        const dueToday = questionsWithReviewData.filter(q => {
            const reviewDate = new Date(q.reviewData!.nextReviewDate);
            return reviewDate.toDateString() === todayStr;
        }).length;

        return NextResponse.json({
            questions: questionsWithReviewData,
            total: questionsWithReviewData.length,
            dueToday
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

        const userId = (session.user as any).id;
        const { itemId, quality } = await req.json();

        if (!itemId || quality === undefined) {
            return NextResponse.json(
                { error: 'Item ID and quality required' },
                { status: 400 }
            );
        }

        // Fetch existing schedule
        const { data: existingData } = await supabaseAdmin
            .from(TABLES.REVIEWS)
            .select('*')
            .eq('user_id', userId)
            .eq('question_id', itemId)
            .single();

        // Default initial values
        let repetitions = 0;
        let easeFactor = 2.5;
        let interval = 0;

        if (existingData) {
            repetitions = existingData.repetitions;
            easeFactor = existingData.easiness_factor;
            interval = existingData.interval;
        }

        // SM-2 algorithm
        const result = calculateNextReview(
            repetitions,
            easeFactor,
            interval,
            quality
        );

        const now = new Date();
        const nextReviewDate = new Date(now);
        nextReviewDate.setDate(nextReviewDate.getDate() + result.interval);

        // Upsert to DB
        const dbPayload = {
            user_id: userId,
            question_id: itemId,
            easiness_factor: result.easeFactor,
            interval: result.interval,
            repetitions: result.repetitions,
            next_review_date: nextReviewDate.toISOString(),
            last_review_date: now.toISOString(),
            last_quality: quality
        };

        const { error: saveError } = await supabaseAdmin
            .from(TABLES.REVIEWS)
            .upsert(dbPayload, { onConflict: 'user_id, question_id' });

        if (saveError) {
            throw saveError;
        }

        return NextResponse.json({
            success: true,
            nextReviewDate: nextReviewDate.toISOString(),
            interval: result.interval
        });
    } catch (error) {
        console.error('Error updating review schedule:', error);
        return NextResponse.json(
            { error: 'Failed to update review schedule' },
            { status: 500 }
        );
    }
}
