'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import { AccuracyTrendChart, SimpleRadarChart, StudyCalendar } from '../components/AnalyticsCharts';
import { RecommendedPracticeCard } from '../components/RecommendedPracticeCard';
import type { PerformanceMetrics, DomainMastery, MasteryLevel, TrendPoint } from '@nclex/shared-api-types';

export default function EnhancedProgressPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [trends, setTrends] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'detailed'>('overview');

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [metricsRes, trendsRes] = await Promise.all([
                    fetch('/api/progress/enhanced-stats'),
                    fetch('/api/progress/trends')
                ]);

                if (metricsRes.ok) {
                    const data = await metricsRes.json();
                    setMetrics(data);
                }

                if (trendsRes.ok) {
                    const data = await trendsRes.json();
                    setTrends(data.trends || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, router]);

    const getMasteryColor = (level: MasteryLevel): string => {
        switch (level) {
            case 'mastery': return 'bg-green-600';
            case 'proficient': return 'bg-green-400';
            case 'developing': return 'bg-yellow-400';
            case 'novice': return 'bg-orange-500';
            case 'insufficient_data': return 'bg-gray-300';
            default: return 'bg-gray-300';
        }
    };

    const getReadinessColor = (level: string): string => {
        switch (level) {
            case 'ready': return 'text-green-600';
            case 'on_track': return 'text-blue-600';
            case 'developing': return 'text-yellow-600';
            case 'not_ready': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getReadinessLabel = (level: string): string => {
        switch (level) {
            case 'ready': return 'Ready to Test';
            case 'on_track': return 'On Track';
            case 'developing': return 'Developing';
            case 'not_ready': return 'Needs Improvement';
            default: return 'Unknown';
        }
    };

    const getPerformanceMessage = (): { title: string; message: string; emoji: string } => {
        if (!metrics) return { title: '', message: '', emoji: '' };

        if (metrics.overallAccuracy >= 80) {
            return {
                emoji: '🎉',
                title: 'Excellent Work!',
                message: `You're performing above the NCLEX passing standard with ${metrics.overallAccuracy}% accuracy.`
            };
        } else if (metrics.overallAccuracy >= 70) {
            return {
                emoji: '📈',
                title: 'You are On Track!',
                message: `Keep up the steady progress. Current accuracy: ${metrics.overallAccuracy}%`
            };
        } else if (metrics.overallAccuracy >= 60) {
            return {
                emoji: '⚠️',
                title: 'Keep Pushing!',
                message: `You are developing but need focused improvement. Current: ${metrics.overallAccuracy}%`
            };
        } else {
            return {
                emoji: '🚨',
                title: 'Action Needed',
                message: `Let us build a focused study plan. Current: ${metrics.overallAccuracy}%`
            };
        }
    };



    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <Card className="text-center py-12">
                    <p className="text-gray-600">No progress data available yet.</p>
                    <Link href="/questions" className="text-blue-600 hover:underline mt-2 inline-block">
                        Start practicing to see your stats!
                    </Link>
                </Card>
            </div>
        );
    }

    const performanceMsg = getPerformanceMessage();
    const weakDomains = metrics.domainMastery
        .filter(d => d.accuracy < 70 && d.attempted >= 10)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);

    const radarData = metrics.domainMastery
        .filter(d => d.masteryLevel !== 'insufficient_data')
        .slice(0, 6)
        .map(d => ({
            domain: d.domain.substring(0, 10),
            accuracy: d.accuracy,
            fullMark: 100
        }));

    return (
        <div className="px-4 py-6 sm:px-0 max-w-7xl mx-auto">
            {/* Recommended Practice Card */}
            <RecommendedPracticeCard />

            {/* Hero Section - NCLEX Readiness */}
            <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            NCLEX Readiness: {metrics.passProbability}%
                        </h1>
                        <p className={`text-xl font-semibold ${getReadinessColor(metrics.readinessLevel)}`}>
                            {getReadinessLabel(metrics.readinessLevel)}
                        </p>
                    </div>
                    <div className="text-6xl">{performanceMsg.emoji}</div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div
                        className={`h-4 rounded-full transition-all ${metrics.passProbability >= 85 ? 'bg-green-500' :
                            metrics.passProbability >= 70 ? 'bg-blue-500' :
                                metrics.passProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${metrics.passProbability}%` }}
                    ></div>
                </div>

                <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{performanceMsg.title}</h3>
                    <p className="text-gray-700">{performanceMsg.message}</p>
                </div>
            </Card>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Overall Accuracy</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{metrics.overallAccuracy}%</div>
                    {metrics.improvementRate !== 0 && (
                        <div className={`text-sm flex items-center ${metrics.improvementRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metrics.improvementRate > 0 ? '↑' : '↓'} {Math.abs(metrics.improvementRate)}% trend
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Questions Attempted</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{metrics.totalAttempted}</div>
                    <div className="text-sm text-gray-600">
                        {metrics.sevenDayAttempted} in last 7 days
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Current Streak</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {metrics.currentStreak > 5 && '🔥'} {metrics.currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">
                        Best: {metrics.longestStreak}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">First-Try Accuracy</div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{metrics.firstAttemptAccuracy}%</div>
                    <div className="text-sm text-gray-600">
                        {metrics.firstAttemptAccuracy >= metrics.overallAccuracy ? '✓ Strong' : '⚠️ Review needed'}
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'trends', 'detailed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Domain Mastery Heatmap */}
                    <Card className="p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Domain Mastery</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {metrics.domainMastery.map((domain) => (
                                <div key={domain.domain} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{domain.domain}</span>
                                        <div className={`w-3 h-3 rounded-full ${getMasteryColor(domain.masteryLevel)}`}></div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{domain.accuracy}%</div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        {domain.correct}/{domain.attempted} correct
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {domain.masteryLevel === 'insufficient_data'
                                            ? `Need ${10 - domain.attempted} more questions`
                                            : domain.masteryLevel}
                                    </div>
                                    {domain.questionsToNextLevel > 0 && domain.masteryLevel !== 'mastery' && (
                                        <div className="text-xs text-blue-600 mt-1">
                                            {domain.questionsToNextLevel} questions to next level
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Weak Areas */}
                    {weakDomains.length > 0 && (
                        <Card className="p-6 mb-8 border-2 border-orange-200 bg-orange-50">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Your Priority Focus Areas</h2>
                            <div className="space-y-4">
                                {weakDomains.map((domain, index) => (
                                    <div key={domain.domain} className="bg-white rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {index + 1}. {domain.domain}
                                                    </span>
                                                    <span className="text-red-600 font-medium">
                                                        {domain.accuracy}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {domain.attempted} questions attempted • Gap to 75%: {(75 - domain.accuracy).toFixed(1)} points
                                                </p>
                                                <p className="text-sm text-blue-700 font-medium">
                                                    → Practice {domain.questionsToNextLevel} more questions to improve
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/questions"
                                className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Start Practicing →
                            </Link>
                        </Card>
                    )}
                </>
            )}

            {activeTab === 'trends' && (
                <>
                    {/* Accuracy Trend Chart */}
                    <Card className="p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy Trend (Last 30 Days)</h2>
                        <AccuracyTrendChart data={trends} />
                    </Card>

                    {/* Domain Radar Chart */}
                    <Card className="p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Domain Performance Radar</h2>
                        <SimpleRadarChart data={radarData} />
                    </Card>

                    {/* Study Calendar */}
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Study Activity (Last 12 Weeks)</h2>
                        <StudyCalendar data={trends} />
                    </Card>
                </>
            )}

            {activeTab === 'detailed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Highlights</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Strongest Domain:</span>
                                <span className="font-semibold text-green-600">{metrics.strongestDomain}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Needs Focus:</span>
                                <span className="font-semibold text-orange-600">{metrics.weakestDomain}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Weak Areas:</span>
                                <span className="font-semibold text-gray-900">{metrics.weakAreaCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg Time/Question:</span>
                                <span className="font-semibold text-gray-900">{metrics.averageTimePerQuestion}s</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href="/questions"
                                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                            >
                                Practice Questions
                            </Link>
                            <Link
                                href="/history"
                                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
                            >
                                Review History
                            </Link>
                            <Link
                                href="/analytics"
                                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-purple-700 transition-colors"
                            >
                                Advanced Analytics →
                            </Link>
                            <Link
                                href="/account"
                                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
                            >
                                Account Settings
                            </Link>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
