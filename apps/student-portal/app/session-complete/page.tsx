'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import type { PracticeSession, RecommendedPractice } from '@nclex/shared-api-types';

export default function SessionCompletePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('id');

    const [session, setSession] = useState<PracticeSession | null>(null);
    const [nextRecommendations, setNextRecommendations] = useState<RecommendedPractice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            router.push('/progress');
            return;
        }

        const fetchSessionAndRecommendations = async () => {
            try {
                // Complete the session if not already completed
                const completeResponse = await fetch(`/api/practice/sessions/${sessionId}`, {
                    method: 'POST'
                });

                if (completeResponse.ok) {
                    const completeData = await completeResponse.json();
                    setSession(completeData.session);
                }

                // Fetch next recommendations
                const recResponse = await fetch('/api/practice/recommended?count=20');
                if (recResponse.ok) {
                    const recData = await recResponse.json();
                    setNextRecommendations(recData.recommendations);
                }
            } catch (error) {
                console.error('Error fetching session data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionAndRecommendations();
    }, [sessionId, router]);

    const handleStartNextPractice = async () => {
        try {
            const response = await fetch('/api/practice/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'recommended',
                    useRecommended: true
                })
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/questions/${data.firstQuestionId}?session=${data.session.id}`);
            }
        } catch (error) {
            console.error('Error starting next practice:', error);
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!session || !session.results) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <Card className="text-center py-12">
                    <p className="text-gray-600">Session not found</p>
                    <Link href="/progress" className="text-blue-600 hover:underline mt-2 inline-block">
                        Return to Progress Dashboard
                    </Link>
                </Card>
            </div>
        );
    }

    const { results } = session;
    const accuracyColor = results.accuracy >= 80 ? 'text-green-600' :
        results.accuracy >= 70 ? 'text-blue-600' :
            results.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
            {/* Success Header */}
            <Card className="p-8 mb-8 text-center bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h1>
                <p className="text-gray-600">Great work! Here's how you did.</p>
            </Card>

            {/* Results Summary */}
            <Card className="p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Results</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Score</div>
                        <div className={`text-5xl font-bold ${accuracyColor}`}>
                            {results.accuracy}%
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {results.correct}/{results.attempted} correct
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Time Spent</div>
                        <div className="text-5xl font-bold text-gray-900">
                            {Math.floor(results.totalTime / 60)}m
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {results.averageTime}s per question
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Questions</div>
                        <div className="text-5xl font-bold text-gray-900">
                            {results.attempted}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {session.mode} mode
                        </div>
                    </div>
                </div>

                {/* Performance by Domain */}
                {results.byDomain && results.byDomain.length > 0 && (
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Domain</h3>
                        <div className="space-y-3">
                            {results.byDomain.map((domain) => (
                                <div key={domain.domain} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-900">{domain.domain}</span>
                                            <span className={`font-semibold ${domain.accuracy >= 80 ? 'text-green-600' :
                                                    domain.accuracy >= 70 ? 'text-blue-600' :
                                                        domain.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {domain.accuracy.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${domain.accuracy >= 80 ? 'bg-green-500' :
                                                        domain.accuracy >= 70 ? 'bg-blue-500' :
                                                            domain.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${domain.accuracy}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {domain.correct}/{domain.attempted} correct
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Next Steps */}
            {nextRecommendations && (
                <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Your Next Practice</h2>
                    <p className="text-gray-700 mb-4">
                        Based on your performance, here's what we recommend practicing next:
                    </p>

                    <div className="bg-white rounded-lg p-4 mb-4">
                        <div className="space-y-2">
                            {nextRecommendations.reasoning.weakAreas.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <span className="text-red-500 font-medium">•</span>
                                    <span className="text-sm text-gray-700">
                                        Focus on {nextRecommendations.reasoning.weakAreas.slice(0, 2).join(', ')}
                                    </span>
                                </div>
                            )}
                            {nextRecommendations.reasoning.blueprintGaps.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-500 font-medium">•</span>
                                    <span className="text-sm text-gray-700">
                                        Practice {nextRecommendations.reasoning.blueprintGaps.slice(0, 2).join(', ')} for better blueprint alignment
                                    </span>
                                </div>
                            )}
                            {nextRecommendations.reasoning.reviewCount > 0 && (
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-medium">•</span>
                                    <span className="text-sm text-gray-700">
                                        Review {nextRecommendations.reasoning.reviewCount} questions you've seen before
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleStartNextPractice}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Next Practice ({nextRecommendations.questions.length} questions) →
                    </button>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/history"
                    className="block bg-white border-2 border-gray-300 py-3 px-6 rounded-lg text-center font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Review Missed Questions
                </Link>
                <Link
                    href="/progress"
                    className="block bg-white border-2 border-gray-300 py-3 px-6 rounded-lg text-center font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    View Detailed Analytics
                </Link>
            </div>
        </div>
    );
}
