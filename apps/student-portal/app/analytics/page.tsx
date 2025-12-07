'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import type { StudyRecommendation, ItemTypePerformance, BlueprintCategory, TimeEfficiencyPoint } from '@nclex/shared-api-types';

interface AdvancedAnalyticsData {
    itemTypePerformance: ItemTypePerformance[];
    strongestItemType: string;
    weakestItemType: string;
    blueprintAlignment: BlueprintCategory[];
    overallAlignmentScore: number;
    underPracticedCategories: string[];
    timeEfficiency: TimeEfficiencyPoint[];
    timeEfficiencyIndex: number;
    speedIssue: 'too_fast' | 'too_slow' | 'optimal' | null;
    studyDaysCount: number;
    averageQuestionsPerDay: number;
    recommendations: StudyRecommendation[];
}

export default function AdvancedAnalyticsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch('/api/progress/advanced-analytics');
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching advanced analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, router]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aligned': return 'text-green-600';
            case 'over_practiced': return 'text-blue-600';
            case 'under_practiced': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const getQuadrantColor = (quadrant: string) => {
        switch (quadrant) {
            case 'fast_accurate': return 'bg-green-500';
            case 'slow_accurate': return 'bg-yellow-500';
            case 'fast_inaccurate': return 'bg-red-500';
            case 'slow_inaccurate': return 'bg-red-700';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <Card className="text-center py-12">
                    <p className="text-gray-600">No analytics data available yet.</p>
                    <Link href="/questions" className="text-blue-600 hover:underline mt-2 inline-block">
                        Start practicing to see advanced analytics!
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0 max-w-7xl mx-auto">
            <div className="mb-6">
                <Link href="/progress" className="text-blue-600 hover:underline flex items-center gap-2 mb-4">
                    ← Back to Progress Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600 mt-2">Deep insights into your NCLEX preparation</p>
            </div>

            {/* Personalized Recommendations */}
            {data.recommendations.length > 0 && (
                <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Personalized Recommendations</h2>
                    <div className="space-y-4">
                        {data.recommendations.map((rec, index) => (
                            <div key={index} className={`border-2 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                                        <p className="text-sm mt-1">{rec.message}</p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded uppercase">
                                        {rec.priority} priority
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <p className="text-sm font-medium mb-2">Action Items:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {rec.actionItems.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                    <p className="text-xs mt-2 font-medium">Estimated Time: {rec.estimatedTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* NGN Item Type Performance */}
            <Card className="p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">NGN Item Type Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.itemTypePerformance.map((item) => (
                        <div key={item.itemType} className="border rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">{item.itemType}</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Accuracy:</span>
                                    <span className={`font-semibold ${item.accuracy >= 75 ? 'text-green-600' :
                                            item.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>{item.accuracy}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Attempted:</span>
                                    <span className="font-semibold">{item.attempted}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Avg Time:</span>
                                    <span className="font-semibold">{item.averageTime}s</span>
                                </div>
                                <div className="text-xs text-gray-500 capitalize mt-2">
                                    Level: {item.masteryLevel.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Strongest:</span>
                        <span className="text-sm font-semibold text-green-600">{data.strongestItemType}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600">Needs Work:</span>
                        <span className="text-sm font-semibold text-orange-600">{data.weakestItemType}</span>
                    </div>
                </div>
            </Card>

            {/* NCLEX Blueprint Alignment */}
            <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900">NCLEX Blueprint Alignment</h2>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Overall Alignment</div>
                        <div className={`text-2xl font-bold ${data.overallAlignmentScore >= 80 ? 'text-green-600' :
                                data.overallAlignmentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{data.overallAlignmentScore}%</div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Category</th>
                                <th className="text-center py-2">NCLEX %</th>
                                <th className="text-center py-2">Your Practice %</th>
                                <th className="text-center py-2">Gap</th>
                                <th className="text-center py-2">Accuracy</th>
                                <th className="text-center py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.blueprintAlignment.map((cat) => (
                                <tr key={cat.category} className="border-b">
                                    <td className="py-2 font-medium">{cat.category}</td>
                                    <td className="text-center">{cat.nclexWeight}%</td>
                                    <td className="text-center">{cat.yourPractice}%</td>
                                    <td className={`text-center font-semibold ${Math.abs(cat.gap) <= 3 ? 'text-green-600' : 'text-orange-600'
                                        }`}>{cat.gap > 0 ? '+' : ''}{cat.gap}%</td>
                                    <td className="text-center">{cat.accuracy}%</td>
                                    <td className={`text-center capitalize font-medium ${getStatusColor(cat.status)}`}>
                                        {cat.status.replace('_', ' ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.underPracticedCategories.length > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-medium text-orange-900">
                            ⚠️ Under-practiced categories: {data.underPracticedCategories.join(', ')}
                        </p>
                    </div>
                )}
            </Card>

            {/* Time Efficiency Analysis */}
            <Card className="p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Time Efficiency Analysis</h2>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm text-gray-600">Time Efficiency Index</div>
                            <div className="text-2xl font-bold text-gray-900">{data.timeEfficiencyIndex}</div>
                        </div>
                        {data.speedIssue && (
                            <div className={`px-4 py-2 rounded-lg font-medium ${data.speedIssue === 'optimal' ? 'bg-green-100 text-green-800' :
                                    data.speedIssue === 'too_fast' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {data.speedIssue === 'optimal' ? '✓ Optimal Pace' :
                                    data.speedIssue === 'too_fast' ? '⚠️ Too Fast' : '🐌 Too Slow'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Time Efficiency Scatter (Simplified) */}
                <div className="grid grid-cols-2 gap-4">
                    {data.timeEfficiency.map((point) => (
                        <div key={point.domain} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{point.domain}</span>
                                <div className={`w-3 h-3 rounded-full ${getQuadrantColor(point.quadrant)}`}></div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>Time: {point.averageTime}s</div>
                                <div>Accuracy: {point.accuracy}%</div>
                                <div className="capitalize">{point.quadrant.replace(/_/g, ' ')}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Fast & Accurate (Ideal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Slow & Accurate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Fast & Inaccurate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-700 rounded-full"></div>
                        <span>Slow & Inaccurate</span>
                    </div>
                </div>
            </Card>

            {/* Study Patterns */}
            <Card className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Study Patterns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Study Days</div>
                        <div className="text-3xl font-bold text-gray-900">{data.studyDaysCount}</div>
                        <div className="text-sm text-gray-500 mt-1">Days with practice</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Avg Questions/Day</div>
                        <div className="text-3xl font-bold text-gray-900">{data.averageQuestionsPerDay}</div>
                        <div className="text-sm text-gray-500 mt-1">When you practice</div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
