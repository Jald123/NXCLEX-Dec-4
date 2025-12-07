import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type {
    UserProgress,
    NclexItemDraft,
    RecommendedPractice,
    RecommendedQuestion,
    DomainMastery,
    BlueprintCategory
} from '@nclex/shared-api-types';

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');
const ITEMS_FILE = path.join(process.cwd(), '../admin-dashboard/data', 'items.json');

// NCLEX 2026+ Blueprint Weights
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

function getQuestions(): NclexItemDraft[] {
    try {
        if (!fs.existsSync(ITEMS_FILE)) return [];
        const data = fs.readFileSync(ITEMS_FILE, 'utf-8');
        const items = JSON.parse(data);
        // Filter to published_student only
        return items.filter((item: NclexItemDraft) => item.status === 'published_student');
    } catch (error) {
        console.error('Error reading questions:', error);
        return [];
    }
}

interface QuestionScore {
    question: NclexItemDraft;
    score: number;
    reason: RecommendedQuestion['reason'];
}

function calculatePriorityScore(
    question: NclexItemDraft,
    userProgress: UserProgress[],
    domainMastery: DomainMastery[],
    blueprintAlignment: BlueprintCategory[],
    itemTypeStats: Map<string, { attempted: number; total: number }>
): QuestionScore {
    let score = 0;
    let primaryReason: RecommendedQuestion['reason'] = 'new';

    const domain = question.category || 'Other';
    const itemType = question.questionType || 'Unknown';

    // Check if question was attempted
    const attempts = userProgress.filter(p => p.questionId === question.id);
    const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

    // 1. Weak Area Boost (0-40 points)
    const domainPerf = domainMastery.find(d => d.domain === domain);
    if (domainPerf) {
        if (domainPerf.accuracy < 70) {
            score += 40;
            primaryReason = 'weak_area';
        } else if (domainPerf.accuracy < 75) {
            score += 20;
        } else if (domainPerf.accuracy < 80) {
            score += 10;
        }
    } else {
        // New domain
        score += 5;
    }

    // 2. Blueprint Alignment (0-30 points)
    const blueprintCat = blueprintAlignment.find(c => c.category === domain);
    if (blueprintCat) {
        if (blueprintCat.status === 'under_practiced' && blueprintCat.gap < -5) {
            score += 30;
            if (score < 40) primaryReason = 'blueprint_gap';
        } else if (blueprintCat.status === 'under_practiced') {
            score += 15;
        } else if (blueprintCat.status === 'over_practiced') {
            score -= 10;
        }
    }

    // 3. Spaced Repetition (0-20 points)
    if (!lastAttempt) {
        score += 5;
        if (score < 30 && primaryReason === 'new') primaryReason = 'new';
    } else {
        const daysSinceAttempt = (Date.now() - new Date(lastAttempt.attemptedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceAttempt > 14) {
            score += 20;
            if (score < 40) primaryReason = 'spaced_repetition';
        } else if (daysSinceAttempt > 7) {
            score += 15;
        } else if (daysSinceAttempt > 3) {
            score += 10;
        } else if (daysSinceAttempt > 1) {
            score += 5;
        } else {
            score -= 5;
        }
    }

    // 4. Item Type Diversity (0-10 points)
    const typeStats = itemTypeStats.get(itemType);
    const totalAttempted = Array.from(itemTypeStats.values()).reduce((sum, s) => sum + s.attempted, 0);
    if (typeStats && totalAttempted > 0) {
        const typePercentage = (typeStats.attempted / totalAttempted) * 100;
        const expectedPercentage = 100 / itemTypeStats.size;
        if (typePercentage < expectedPercentage - 5) {
            score += 10;
            if (score < 40 && primaryReason === 'new') primaryReason = 'item_type';
        } else if (typePercentage > expectedPercentage + 5) {
            score -= 5;
        }
    }

    // 5. Previous Performance (0-10 points)
    if (lastAttempt) {
        if (!lastAttempt.isCorrect) {
            score += 10;
        } else if (lastAttempt.attemptNumber === 1) {
            score -= 5;
        }
    }

    return {
        question,
        score,
        reason: primaryReason
    };
}

function selectQuestions(
    scoredQuestions: QuestionScore[],
    count: number
): RecommendedQuestion[] {
    // Sort by score (highest first)
    const sorted = [...scoredQuestions].sort((a, b) => b.score - a.score);

    // Apply diversity constraints
    const selected: QuestionScore[] = [];
    const domainCounts = new Map<string, number>();
    const typeCounts = new Map<string, number>();
    const domains = new Set<string>();

    for (const sq of sorted) {
        if (selected.length >= count) break;

        const domain = sq.question.category || 'Other';
        const itemType = sq.question.questionType || 'Unknown';

        // Check constraints
        const domainCount = domainCounts.get(domain) || 0;
        const typeCount = typeCounts.get(itemType) || 0;

        // Max 40% from single domain
        if (domainCount >= count * 0.4) continue;

        // Max 30% of single item type
        if (typeCount >= count * 0.3) continue;

        // Add to selection
        selected.push(sq);
        domainCounts.set(domain, domainCount + 1);
        typeCounts.set(itemType, typeCount + 1);
        domains.add(domain);
    }

    // Ensure at least 3 different domains if possible
    if (domains.size < 3 && sorted.length >= count) {
        // Try to add more diversity
        for (const sq of sorted) {
            if (selected.length >= count) break;
            const domain = sq.question.category || 'Other';
            if (!domains.has(domain)) {
                selected.push(sq);
                domains.add(domain);
            }
        }
    }

    // Shuffle to avoid predictable order
    const shuffled = selected.sort(() => Math.random() - 0.5);

    return shuffled.map(sq => ({
        questionId: sq.question.id,
        priorityScore: Math.round(sq.score),
        reason: sq.reason,
        domain: sq.question.category || 'Other',
        itemType: sq.question.questionType || 'Unknown'
    }));
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const url = new URL(req.url);
        const count = parseInt(url.searchParams.get('count') || '20');
        const difficulty = url.searchParams.get('difficulty') || 'mixed';

        // Get user data
        const allProgress = getProgress();
        const userProgress = allProgress.filter(p => p.userId === userId);
        const allQuestions = getQuestions();

        // Get analytics data (simplified - in production, call analytics APIs)
        const domainMap = new Map<string, { attempted: number; correct: number }>();
        const itemTypeMap = new Map<string, { attempted: number; total: number }>();

        // Get unique questions (latest attempt only)
        const uniqueQuestions = new Map<string, UserProgress>();
        userProgress.forEach(p => {
            const existing = uniqueQuestions.get(p.questionId);
            if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
                uniqueQuestions.set(p.questionId, p);
            }
        });

        // Calculate domain mastery
        Array.from(uniqueQuestions.values()).forEach(progress => {
            const question = allQuestions.find(q => q.id === progress.questionId);
            if (question) {
                const domain = question.category || 'Other';
                const existing = domainMap.get(domain) || { attempted: 0, correct: 0 };
                existing.attempted++;
                if (progress.isCorrect) existing.correct++;
                domainMap.set(domain, existing);

                const itemType = question.questionType || 'Unknown';
                const typeStats = itemTypeMap.get(itemType) || { attempted: 0, total: 0 };
                typeStats.attempted++;
                typeStats.total++;
                itemTypeMap.set(itemType, typeStats);
            }
        });

        const domainMastery: DomainMastery[] = Array.from(domainMap.entries()).map(([domain, stats]) => ({
            domain,
            accuracy: (stats.correct / stats.attempted) * 100,
            attempted: stats.attempted,
            correct: stats.correct,
            masteryLevel: 'developing' as const,
            questionsToNextLevel: 0
        }));

        // Calculate blueprint alignment
        const totalAttempted = uniqueQuestions.size;
        const blueprintAlignment: BlueprintCategory[] = Object.entries(NCLEX_BLUEPRINT).map(([category, nclexWeight]) => {
            const stats = domainMap.get(category) || { attempted: 0, correct: 0 };
            const yourPractice = totalAttempted > 0 ? (stats.attempted / totalAttempted) * 100 : 0;
            const gap = yourPractice - nclexWeight;

            let status: BlueprintCategory['status'];
            if (Math.abs(gap) <= 3) status = 'aligned';
            else if (gap > 0) status = 'over_practiced';
            else status = 'under_practiced';

            return {
                category,
                nclexWeight,
                yourPractice,
                gap,
                attempted: stats.attempted,
                accuracy: stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0,
                status
            };
        });

        // Score all questions
        const scoredQuestions = allQuestions.map(q =>
            calculatePriorityScore(q, userProgress, domainMastery, blueprintAlignment, itemTypeMap)
        );

        // Select questions
        const selectedQuestions = selectQuestions(scoredQuestions, count);

        // Generate reasoning
        const weakAreas = domainMastery
            .filter(d => d.accuracy < 70 && d.attempted >= 10)
            .map(d => d.domain);

        const blueprintGaps = blueprintAlignment
            .filter(c => c.status === 'under_practiced' && c.gap < -5)
            .map(c => c.category);

        const reviewCount = selectedQuestions.filter(q => q.reason === 'spaced_repetition').length;
        const newCount = selectedQuestions.filter(q => q.reason === 'new').length;

        const recommendations: RecommendedPractice = {
            userId,
            generatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            questions: selectedQuestions,
            reasoning: {
                weakAreas,
                blueprintGaps,
                reviewCount,
                newCount
            },
            estimatedTime: Math.round(count * 1.5), // 1.5 min per question
            difficulty: difficulty as any
        };

        return NextResponse.json({
            recommendations,
            nextUpdate: recommendations.expiresAt
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
