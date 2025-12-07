'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';

export default function ReviewQueuePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [dueQuestions, setDueQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        fetchDueReviews();
    }, [session, router]);

    const fetchDueReviews = async () => {
        try {
            const response = await fetch('/api/review');
            const data = await response.json();
            setDueQuestions(data.questions || []);
        } catch (error) {
            console.error('Failed to fetch due reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const startReview = () => {
        if (dueQuestions.length > 0) {
            // Navigate to first question
            router.push(`/questions/${dueQuestions[0]}`);
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading review queue...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Review Queue</h1>
                <p className="text-gray-600">
                    Questions scheduled for review based on spaced repetition
                </p>
            </div>

            {/* Stats Card */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Due Today</div>
                        <div className="text-4xl font-bold text-purple-600">{dueQuestions.length}</div>
                        <div className="text-xs text-gray-500 mt-1">questions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
                        <div className="text-4xl font-bold text-gray-900">
                            {Math.ceil(dueQuestions.length * 1.5)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">minutes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Review Type</div>
                        <div className="text-2xl font-bold text-gray-900">Spaced</div>
                        <div className="text-xs text-gray-500 mt-1">repetition</div>
                    </div>
                </div>
            </Card>

            {/* Content */}
            {dueQuestions.length > 0 ? (
                <>
                    {/* Why Review Matters */}
                    <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-200">
                        <h3 className="text-lg font-bold text-blue-900 mb-3">
                            🧠 Why Spaced Repetition Works
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Proven Science:</strong> Reviewing at optimal intervals increases retention by 200-300%
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Long-Term Memory:</strong> Moves knowledge from short-term to long-term memory
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Efficient Learning:</strong> Focus on what you're about to forget, not what you know well
                                </span>
                            </li>
                        </ul>
                    </Card>

                    {/* Start Review Button */}
                    <div className="text-center">
                        <button
                            onClick={startReview}
                            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg"
                        >
                            Start Review Session ({dueQuestions.length} questions)
                        </button>
                        <p className="text-sm text-gray-600 mt-3">
                            Estimated time: {Math.ceil(dueQuestions.length * 1.5)} minutes
                        </p>
                    </div>

                    {/* Tips */}
                    <Card className="p-6 mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Review Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <div className="font-semibold mb-1">Rate Your Recall</div>
                                <p>After each question, you'll rate how well you remembered it. Be honest!</p>
                            </div>
                            <div>
                                <div className="font-semibold mb-1">Don't Rush</div>
                                <p>Take time to understand WHY you got it right or wrong.</p>
                            </div>
                            <div>
                                <div className="font-semibold mb-1">Review Explanations</div>
                                <p>Always read the full explanation, even if you got it correct.</p>
                            </div>
                            <div>
                                <div className="font-semibold mb-1">Consistent Practice</div>
                                <p>Review daily for best results. Even 10-15 minutes helps!</p>
                            </div>
                        </div>
                    </Card>
                </>
            ) : (
                <>
                    {/* No Reviews Due */}
                    <Card className="p-12 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            All Caught Up!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You don't have any questions due for review right now.
                        </p>
                        <div className="space-y-3">
                            <Link href="/questions">
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                    Practice New Questions
                                </button>
                            </Link>
                            <div>
                                <Link href="/progress" className="text-blue-600 hover:underline text-sm">
                                    View Your Progress →
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Info Card */}
                    <Card className="p-6 mt-8 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                            How Review Queue Works
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <strong>1. Answer Questions:</strong> As you practice, questions are automatically added to your review schedule.
                            </p>
                            <p>
                                <strong>2. Smart Scheduling:</strong> Our algorithm calculates the optimal time to review each question.
                            </p>
                            <p>
                                <strong>3. Return Here:</strong> When questions are due, they'll appear in this queue.
                            </p>
                            <p>
                                <strong>4. Rate Your Recall:</strong> After reviewing, rate how well you remembered it to adjust future intervals.
                            </p>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
