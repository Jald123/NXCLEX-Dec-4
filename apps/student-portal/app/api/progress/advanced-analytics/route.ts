import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type {
    UserProgress,
    NclexItemDraft,
    AdvancedMetrics,
    ItemTypePerformance,
    BlueprintCategory,
    TimeEfficiencyPoint,
    StudyRecommendation,
    MasteryLevel
} from '@nclex/shared-api-types';
import { supabaseAdmin, DbProgress, TABLES } from '@/lib/supabase';
import { getPublishedItems } from '@/lib/storage';

const NCLEX_BLUEPRINT: Record<string, number> = {
    'Management of Care': 17,
    'Safety and Infection Control': 9,
    'Health Promotion and Maintenance': 6,
    'Psychosocial Integrity': 6,
    'Basic Care and Comfort': 6,
    'Pharmacological Therapies': 12,
    'Reduction of Risk Potential': 9,
    'Physiological Adaptation': 11,
    'Other': 24
};

function mapDbProgress(db: DbProgress): UserProgress {
    return {
        id: db.id,
        userId: db.user_id,
        questionId: db.question_id,
        attemptedAt: db.attempted_at,
        selectedAnswer: db.selected_answer,
        isCorrect: db.is_correct,
        timeSpent: db.time_spent,
        attemptNumber: db.attempt_number
    };
}

async function getProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabaseAdmin
        .from(TABLES.PROGRESS)
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching progress:', error);
        return [];
    }
    return (data as DbProgress[]).map(mapDbProgress);
}

function getMasteryLevel(accuracy: number, attempted: number): MasteryLevel {
    if (attempted < 10) return 'insufficient_data';
    if (accuracy >= 90) return 'mastery';
    if (accuracy >= 75) return 'proficient';
    if (accuracy >= 60) return 'developing';
    return 'novice';
}

function calculateItemTypePerformance(userProgress: UserProgress[], questions: NclexItemDraft[]): ItemTypePerformance[] {
    const typeMap = new Map<string, { attempted: number; correct: number; totalTime: number }>();

    // Get latest attempts only
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    Array.from(uniqueQuestions.values()).forEach(progress => {
        const question = questions.find(q => q.id === progress.questionId);
        if (question) {
            const type = question.questionType || 'Unknown';
            const existing = typeMap.get(type) || { attempted: 0, correct: 0, totalTime: 0 };
            existing.attempted++;
            if (progress.isCorrect) existing.correct++;
            existing.totalTime += progress.timeSpent;
            typeMap.set(type, existing);
        }
    });

    return Array.from(typeMap.entries()).map(([itemType, stats]) => {
        const accuracy = (stats.correct / stats.attempted) * 100;
        const averageTime = stats.totalTime / stats.attempted;
        return {
            itemType,
            attempted: stats.attempted,
            correct: stats.correct,
            accuracy: Math.round(accuracy * 10) / 10,
            averageTime: Math.round(averageTime),
            masteryLevel: getMasteryLevel(accuracy, stats.attempted),
        };
    });
}

function calculateBlueprintAlignment(userProgress: UserProgress[], questions: NclexItemDraft[]): {
    categories: BlueprintCategory[];
    alignmentScore: number;
} {
    const categoryMap = new Map<string, { attempted: number; correct: number }>();

    // Get latest attempts
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    const totalAttempted = uniqueQuestions.size;

    Array.from(uniqueQuestions.values()).forEach(progress => {
        const question = questions.find(q => q.id === progress.questionId);
        if (question) {
            const category = question.category || 'Other';
            const existing = categoryMap.get(category) || { attempted: 0, correct: 0 };
            existing.attempted++;
            if (progress.isCorrect) existing.correct++;
            categoryMap.set(category, existing);
        }
    });

    const categories: BlueprintCategory[] = Object.entries(NCLEX_BLUEPRINT).map(([category, nclexWeight]) => {
        const stats = categoryMap.get(category) || { attempted: 0, correct: 0 };
        const yourPractice = totalAttempted > 0 ? (stats.attempted / totalAttempted) * 100 : 0;
        const gap = yourPractice - nclexWeight;
        const accuracy = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;

        let status: 'aligned' | 'over_practiced' | 'under_practiced';
        if (Math.abs(gap) <= 3) status = 'aligned';
        else if (gap > 0) status = 'over_practiced';
        else status = 'under_practiced';

        return {
            category,
            nclexWeight,
            yourPractice: Math.round(yourPractice * 10) / 10,
            gap: Math.round(gap * 10) / 10,
            attempted: stats.attempted,
            accuracy: Math.round(accuracy * 10) / 10,
            status,
        };
    });

    // Calculate alignment score
    const alignmentScore = categories.reduce((sum, cat) => {
        const alignment = 100 - Math.abs(cat.gap);
        return sum + alignment;
    }, 0) / categories.length;

    return {
        categories,
        alignmentScore: Math.round(alignmentScore),
    };
}

function calculateTimeEfficiency(userProgress: UserProgress[], questions: NclexItemDraft[]): {
    points: TimeEfficiencyPoint[];
    index: number;
    speedIssue: 'too_fast' | 'too_slow' | 'optimal' | null;
} {
    const domainMap = new Map<string, { totalTime: number; correct: number; total: number }>();

    // Get latest attempts
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    Array.from(uniqueQuestions.values()).forEach(progress => {
        const question = questions.find(q => q.id === progress.questionId);
        if (question) {
            const domain = question.category || 'Other';
            const existing = domainMap.get(domain) || { totalTime: 0, correct: 0, total: 0 };
            existing.totalTime += progress.timeSpent;
            existing.total++;
            if (progress.isCorrect) existing.correct++;
            domainMap.set(domain, existing);
        }
    });

    const points: TimeEfficiencyPoint[] = Array.from(domainMap.entries())
        .filter(([_, stats]) => stats.total >= 5) // Minimum 5 questions
        .map(([domain, stats]) => {
            const averageTime = stats.totalTime / stats.total;
            const accuracy = (stats.correct / stats.total) * 100;

            let quadrant: TimeEfficiencyPoint['quadrant'];
            if (averageTime < 60 && accuracy >= 70) quadrant = 'fast_accurate';
            else if (averageTime >= 60 && accuracy >= 70) quadrant = 'slow_accurate';
            else if (averageTime < 60 && accuracy < 70) quadrant = 'fast_inaccurate';
            else quadrant = 'slow_inaccurate';

            return {
                domain,
                averageTime: Math.round(averageTime),
                accuracy: Math.round(accuracy * 10) / 10,
                quadrant,
            };
        });

    // Calculate overall time efficiency index
    const overallTime = userProgress.reduce((sum, p) => sum + p.timeSpent, 0) / userProgress.length;
    const overallAccuracy = (Array.from(uniqueQuestions.values()).filter(p => p.isCorrect).length / uniqueQuestions.size) * 100;
    const index = (overallAccuracy / (overallTime / 60)) * 10;

    // Determine speed issue
    let speedIssue: 'too_fast' | 'too_slow' | 'optimal' | null = null;
    if (overallTime < 30 && overallAccuracy < 70) speedIssue = 'too_fast';
    else if (overallTime > 120) speedIssue = 'too_slow';
    else if (overallTime >= 60 && overallTime <= 90 && overallAccuracy >= 70) speedIssue = 'optimal';

    return {
        points,
        index: Math.round(index * 10) / 10,
        speedIssue,
    };
}

function generateRecommendations(metrics: any): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];

    // Domain recommendations
    const weakDomains = metrics.domainMastery?.filter((d: any) => d.accuracy < 70 && d.attempted >= 10) || [];
    if (weakDomains.length > 0) {
        recommendations.push({
            type: 'domain',
            priority: 'high',
            title: `Strengthen ${weakDomains[0].domain}`,
            message: `Your ${weakDomains[0].domain} accuracy is ${weakDomains[0].accuracy}%, below the 75% target.`,
            actionItems: [
                `Review ${weakDomains[0].domain} study materials`,
                `Practice ${weakDomains[0].questionsToNextLevel} more questions`,
                `Focus on understanding rationales`,
            ],
            estimatedTime: '2-3 hours',
        });
    }

    // Item type recommendations
    const weakItemTypes = metrics.itemTypePerformance.filter((t: any) => t.accuracy < 70 && t.attempted >= 10);
    if (weakItemTypes.length > 0) {
        recommendations.push({
            type: 'item_type',
            priority: 'high',
            title: `Improve ${weakItemTypes[0].itemType} Performance`,
            message: `${weakItemTypes[0].itemType} accuracy is ${weakItemTypes[0].accuracy}%.`,
            actionItems: [
                `Review ${weakItemTypes[0].itemType} strategy guide`,
                `Practice 20 more ${weakItemTypes[0].itemType} questions`,
                `Watch tutorial videos`,
            ],
            estimatedTime: '1-2 hours',
        });
    }

    // Blueprint recommendations
    const underPracticed = metrics.blueprintAlignment.filter((c: any) => c.status === 'under_practiced' && c.gap < -5);
    if (underPracticed.length > 0) {
        recommendations.push({
            type: 'blueprint',
            priority: 'medium',
            title: `Increase ${underPracticed[0].category} Practice`,
            message: `You're under-practicing this category by ${Math.abs(underPracticed[0].gap)}%.`,
            actionItems: [
                `Practice ${Math.ceil(Math.abs(underPracticed[0].gap) * 10)} more questions in this category`,
                `Review NCLEX blueprint requirements`,
            ],
            estimatedTime: '1 hour',
        });
    }

    // Speed recommendations
    if (metrics.speedIssue === 'too_fast') {
        recommendations.push({
            type: 'speed',
            priority: 'high',
            title: 'Slow Down and Read Carefully',
            message: 'You\'re answering too quickly and making careless errors.',
            actionItems: [
                'Set a minimum 45-second timer per question',
                'Read each question twice before answering',
                'Identify key words in the question stem',
            ],
            estimatedTime: 'Ongoing',
        });
    } else if (metrics.speedIssue === 'too_slow') {
        recommendations.push({
            type: 'speed',
            priority: 'medium',
            title: 'Increase Your Pace',
            message: 'You\'re taking too long per question. Practice faster decision-making.',
            actionItems: [
                'Practice timed mode (90 seconds per question)',
                'Trust your first instinct more',
                'Don\'t overthink simple questions',
            ],
            estimatedTime: 'Ongoing',
        });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const [userProgress, questions] = await Promise.all([
            getProgress(userId),
            getPublishedItems('student_paid') // Or similar role check
        ]);

        // Calculate Phase 3 metrics
        const itemTypePerformance = calculateItemTypePerformance(userProgress, questions);
        const { categories: blueprintAlignment, alignmentScore } = calculateBlueprintAlignment(userProgress, questions);
        const { points: timeEfficiency, index: timeEfficiencyIndex, speedIssue } = calculateTimeEfficiency(userProgress, questions);

        // Calculate study patterns
        const dates = new Set(userProgress.map(p => p.attemptedAt.split('T')[0]));
        const studyDaysCount = dates.size;
        const averageQuestionsPerDay = userProgress.length / Math.max(studyDaysCount, 1);

        // Build advanced metrics object (simplified for Phase 3)
        const advancedMetrics = {
            itemTypePerformance,
            strongestItemType: itemTypePerformance.sort((a, b) => b.accuracy - a.accuracy)[0]?.itemType || 'N/A',
            weakestItemType: itemTypePerformance.sort((a, b) => a.accuracy - b.accuracy)[0]?.itemType || 'N/A',
            blueprintAlignment,
            overallAlignmentScore: alignmentScore,
            underPracticedCategories: blueprintAlignment.filter(c => c.status === 'under_practiced').map(c => c.category),
            timeEfficiency,
            timeEfficiencyIndex,
            speedIssue,
            studyDaysCount,
            averageQuestionsPerDay: Math.round(averageQuestionsPerDay * 10) / 10,
        };

        // Generate recommendations
        const recommendations = generateRecommendations({
            ...advancedMetrics,
            // domainMastery not calculated here but needed?
            domainMastery: blueprintAlignment.map(b => ({
                domain: b.category,
                accuracy: b.accuracy,
                attempted: b.attempted,
                questionsToNextLevel: 10 // Mock or calculate
            }))
        });

        return NextResponse.json({
            ...advancedMetrics,
            recommendations,
        });
    } catch (error) {
        console.error('Error calculating advanced metrics:', error);
        return NextResponse.json(
            { error: 'Failed to calculate advanced metrics' },
            { status: 500 }
        );
    }
}
