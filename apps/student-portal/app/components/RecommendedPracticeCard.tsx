'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';
import { useRouter } from 'next/navigation';
import type { RecommendedPractice } from '@nclex/shared-api-types';

export function RecommendedPracticeCard() {
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<RecommendedPractice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await fetch('/api/practice/recommended?count=20');
            if (response.ok) {
                const data = await response.json();
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartPractice = async () => {
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
            console.error('Error starting practice:', error);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 mb-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
        );
    }

    if (!recommendations || recommendations.questions.length === 0) {
        return null;
    }

    // Group questions by reason
    const weakAreaQuestions = recommendations.questions.filter(q => q.reason === 'weak_area');
    const blueprintQuestions = recommendations.questions.filter(q => q.reason === 'blueprint_gap');
    const reviewQuestions = recommendations.questions.filter(q => q.reason === 'spaced_repetition');
    const newQuestions = recommendations.questions.filter(q => q.reason === 'new');

    return (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h2 className="text-2xl font-bold text-gray-900">Your Recommended Practice</h2>
            </div>

            <p className="text-gray-700 mb-4">
                Based on your progress, we've selected the most impactful questions for you to practice next.
            </p>

            <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-semibold text-gray-900">
                        {recommendations.questions.length} Questions
                    </div>
                    <div className="text-sm text-gray-600">
                        ~{recommendations.estimatedTime} minutes
                    </div>
                </div>

                <div className="space-y-2">
                    {weakAreaQuestions.length > 0 && (
                        <div className="flex items-start gap-2">
                            <span className="text-red-500 font-medium">•</span>
                            <span className="text-sm text-gray-700">
                                {weakAreaQuestions.length} {weakAreaQuestions.length > 1 ? 'questions' : 'question'} from weak areas
                                {recommendations.reasoning.weakAreas.length > 0 &&
                                    ` (${recommendations.reasoning.weakAreas.slice(0, 2).join(', ')})`
                                }
                            </span>
                        </div>
                    )}

                    {blueprintQuestions.length > 0 && (
                        <div className="flex items-start gap-2">
                            <span className="text-orange-500 font-medium">•</span>
                            <span className="text-sm text-gray-700">
                                {blueprintQuestions.length} {blueprintQuestions.length > 1 ? 'questions' : 'question'} to improve blueprint alignment
                                {recommendations.reasoning.blueprintGaps.length > 0 &&
                                    ` (${recommendations.reasoning.blueprintGaps.slice(0, 2).join(', ')})`
                                }
                            </span>
                        </div>
                    )}

                    {reviewQuestions.length > 0 && (
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-medium">•</span>
                            <span className="text-sm text-gray-700">
                                {reviewQuestions.length} {reviewQuestions.length > 1 ? 'questions' : 'question'} due for review (spaced repetition)
                            </span>
                        </div>
                    )}

                    {newQuestions.length > 0 && (
                        <div className="flex items-start gap-2">
                            <span className="text-green-500 font-medium">•</span>
                            <span className="text-sm text-gray-700">
                                {newQuestions.length} new {newQuestions.length > 1 ? 'questions' : 'question'} to expand your knowledge
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={handleStartPractice}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Practice →
                    </button>
                    <button
                        onClick={() => router.push('/questions')}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Browse All
                    </button>
                </div>
            </div>

            <div className="text-xs text-gray-500">
                Recommendations update after each practice session •
                Last updated: {new Date(recommendations.generatedAt).toLocaleTimeString()}
            </div>
        </Card>
    );
}
