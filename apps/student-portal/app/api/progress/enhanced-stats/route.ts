import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';
import type {
    UserProgress,
    NclexItemDraft,
    PerformanceMetrics,
    DomainMastery,
    MasteryLevel,
    WeakArea,
    TrendPoint
} from '@nclex/shared-api-types';

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');
const ITEMS_FILE = path.join(process.cwd(), '../admin-dashboard/data', 'items.json');

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
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions:', error);
        return [];
    }
}

function getMasteryLevel(accuracy: number, attempted: number): MasteryLevel {
    if (attempted < 10) return 'insufficient_data';
    if (accuracy >= 90) return 'mastery';
    if (accuracy >= 75) return 'proficient';
    if (accuracy >= 60) return 'developing';
    return 'novice';
}

function calculateQuestionsToNextLevel(accuracy: number, attempted: number, correct: number): number {
    if (attempted < 10) return 10 - attempted;

    let targetAccuracy: number;
    if (accuracy >= 90) return 0; // Already at mastery
    if (accuracy >= 75) targetAccuracy = 90;
    else if (accuracy >= 60) targetAccuracy = 75;
    else targetAccuracy = 60;

    // Calculate questions needed to reach target
    // Formula: (correct + x) / (attempted + x) = targetAccuracy/100
    // Solving for x: x = (targetAccuracy * attempted - 100 * correct) / (100 - targetAccuracy)
    const questionsNeeded = Math.ceil(
        (targetAccuracy * attempted - 100 * correct) / (100 - targetAccuracy)
    );

    return Math.max(0, questionsNeeded);
}

function calculatePassProbability(metrics: {
    overallAccuracy: number;
    domainMastery: DomainMastery[];
    totalAttempted: number;
    weakAreaCount: number;
}): number {
    // Weighted scoring system
    let score = 0;

    // Overall accuracy (40 points)
    if (metrics.overallAccuracy >= 75) score += 40;
    else if (metrics.overallAccuracy >= 70) score += 30;
    else if (metrics.overallAccuracy >= 65) score += 20;
    else if (metrics.overallAccuracy >= 60) score += 10;

    // Domain coverage (30 points)
    const proficientDomains = metrics.domainMastery.filter(d =>
        d.masteryLevel === 'proficient' || d.masteryLevel === 'mastery'
    ).length;
    const totalDomains = metrics.domainMastery.filter(d =>
        d.masteryLevel !== 'insufficient_data'
    ).length;

    if (totalDomains > 0) {
        const domainScore = (proficientDomains / totalDomains) * 30;
        score += domainScore;
    }

    // Volume (20 points)
    if (metrics.totalAttempted >= 1000) score += 20;
    else if (metrics.totalAttempted >= 500) score += 15;
    else if (metrics.totalAttempted >= 250) score += 10;
    else if (metrics.totalAttempted >= 100) score += 5;

    // Weak areas penalty (10 points)
    if (metrics.weakAreaCount === 0) score += 10;
    else if (metrics.weakAreaCount <= 2) score += 5;

    return Math.round(score);
}

function calculateEnhancedMetrics(userId: string): PerformanceMetrics {
    const allProgress = getProgress();
    const userProgress = allProgress.filter(p => p.userId === userId);
    const questions = getQuestions();

    // Get unique questions (only count latest attempt)
    const uniqueQuestions = new Map<string, UserProgress>();
    userProgress.forEach(p => {
        const existing = uniqueQuestions.get(p.questionId);
        if (!existing || new Date(p.attemptedAt) > new Date(existing.attemptedAt)) {
            uniqueQuestions.set(p.questionId, p);
        }
    });

    const latestAttempts = Array.from(uniqueQuestions.values());
    const totalAttempted = latestAttempts.length;
    const totalCorrect = latestAttempts.filter(p => p.isCorrect).length;
    const totalIncorrect = totalAttempted - totalCorrect;
    const overallAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    // First attempt accuracy
    const firstAttempts = userProgress.filter(p => p.attemptNumber === 1);
    const firstAttemptCorrect = firstAttempts.filter(p => p.isCorrect).length;
    const firstAttemptAccuracy = firstAttempts.length > 0
        ? (firstAttemptCorrect / firstAttempts.length) * 100
        : 0;

    // 7-day metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProgress = latestAttempts.filter(p =>
        new Date(p.attemptedAt) >= sevenDaysAgo
    );
    const sevenDayAttempted = recentProgress.length;
    const sevenDayCorrect = recentProgress.filter(p => p.isCorrect).length;
    const sevenDayAccuracy = sevenDayAttempted > 0
        ? (sevenDayCorrect / sevenDayAttempted) * 100
        : 0;

    // Improvement rate (compare first 50 vs last 50)
    const sortedByDate = [...latestAttempts].sort((a, b) =>
        new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime()
    );
    let improvementRate = 0;
    if (sortedByDate.length >= 100) {
        const first50 = sortedByDate.slice(0, 50);
        const last50 = sortedByDate.slice(-50);
        const first50Accuracy = (first50.filter(p => p.isCorrect).length / 50) * 100;
        const last50Accuracy = (last50.filter(p => p.isCorrect).length / 50) * 100;
        improvementRate = last50Accuracy - first50Accuracy;
    }

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedRecent = [...userProgress].sort((a, b) =>
        new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
    );

    for (const progress of sortedRecent) {
        if (progress.isCorrect) {
            tempStreak++;
            if (tempStreak === 1) currentStreak = tempStreak;
        } else {
            if (currentStreak === 0) currentStreak = 0;
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Domain mastery calculation
    const domainMap = new Map<string, { attempted: number; correct: number }>();

    latestAttempts.forEach(progress => {
        const question = questions.find(q => q.id === progress.questionId);
        if (question) {
            const domain = question.category || 'Uncategorized';
            const existing = domainMap.get(domain) || { attempted: 0, correct: 0 };
            existing.attempted++;
            if (progress.isCorrect) existing.correct++;
            domainMap.set(domain, existing);
        }
    });

    const domainMastery: DomainMastery[] = Array.from(domainMap.entries()).map(([domain, stats]) => {
        const accuracy = (stats.correct / stats.attempted) * 100;
        const masteryLevel = getMasteryLevel(accuracy, stats.attempted);
        const questionsToNextLevel = calculateQuestionsToNextLevel(accuracy, stats.attempted, stats.correct);

        return {
            domain,
            accuracy: Math.round(accuracy * 10) / 10,
            attempted: stats.attempted,
            correct: stats.correct,
            masteryLevel,
            questionsToNextLevel,
        };
    });

    // Sort by accuracy to find strongest/weakest
    const sortedDomains = [...domainMastery]
        .filter(d => d.masteryLevel !== 'insufficient_data')
        .sort((a, b) => b.accuracy - a.accuracy);

    const strongestDomain = sortedDomains[0]?.domain || 'N/A';
    const weakestDomain = sortedDomains[sortedDomains.length - 1]?.domain || 'N/A';

    // Weak area count
    const weakAreaCount = domainMastery.filter(d =>
        d.accuracy < 70 && d.attempted >= 10
    ).length;

    // Calculate pass probability
    const passProbability = calculatePassProbability({
        overallAccuracy,
        domainMastery,
        totalAttempted,
        weakAreaCount,
    });

    // Determine readiness level
    let readinessLevel: 'not_ready' | 'developing' | 'on_track' | 'ready';
    if (passProbability >= 85) readinessLevel = 'ready';
    else if (passProbability >= 70) readinessLevel = 'on_track';
    else if (passProbability >= 50) readinessLevel = 'developing';
    else readinessLevel = 'not_ready';

    // Average time
    const totalTime = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageTimePerQuestion = userProgress.length > 0 ? totalTime / userProgress.length : 0;

    return {
        overallAccuracy: Math.round(overallAccuracy * 10) / 10,
        firstAttemptAccuracy: Math.round(firstAttemptAccuracy * 10) / 10,
        totalAttempted,
        totalCorrect,
        totalIncorrect,
        sevenDayAccuracy: Math.round(sevenDayAccuracy * 10) / 10,
        sevenDayAttempted,
        improvementRate: Math.round(improvementRate * 10) / 10,
        currentStreak,
        longestStreak,
        domainMastery,
        strongestDomain,
        weakestDomain,
        passProbability,
        readinessLevel,
        weakAreaCount,
        averageTimePerQuestion: Math.round(averageTimePerQuestion),
        lastUpdated: new Date().toISOString(),
    };
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const metrics = calculateEnhancedMetrics(userId);

        return NextResponse.json(metrics);
    } catch (error) {
        console.error('Error calculating enhanced metrics:', error);
        return NextResponse.json(
            { error: 'Failed to calculate metrics' },
            { status: 500 }
        );
    }
}
