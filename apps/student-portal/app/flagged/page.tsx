'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import type { QuestionFlag } from '@nclex/shared-api-types';

export default function FlaggedQuestionsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [flags, setFlags] = useState<QuestionFlag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        fetchFlags();
    }, [session, router]);

    const fetchFlags = async () => {
        try {
            const response = await fetch('/api/questions/flagged');
            if (response.ok) {
                const data = await response.json();
                setFlags(data.flags || []);
            }
        } catch (error) {
            console.error('Failed to fetch flags:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFlag = async (questionId: string) => {
        try {
            await fetch(`/api/questions/${questionId}/flag`, {
                method: 'DELETE'
            });
            setFlags(flags.filter(f => f.questionId !== questionId));
        } catch (error) {
            console.error('Failed to remove flag:', error);
        }
    };

    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading flagged questions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">🚩 Flagged Questions</h1>
                <p className="text-gray-600">
                    Questions you've marked for review
                </p>
            </div>

            {/* Stats */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
                <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Flagged</div>
                    <div className="text-5xl font-bold text-orange-600">{flags.length}</div>
                    <div className="text-xs text-gray-500 mt-1">questions</div>
                </div>
            </Card>

            {/* Content */}
            {flags.length > 0 ? (
                <>
                    {/* Flagged Questions List */}
                    <div className="space-y-4 mb-8">
                        {flags.map((flag, index) => (
                            <Card key={flag.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">🚩</span>
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    Question #{index + 1}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Flagged {new Date(flag.flaggedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {flag.reason && (
                                            <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Reason:</strong> {flag.reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Link href={`/questions/${flag.questionId}`}>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
                                                Review Question
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => removeFlag(flag.questionId)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap"
                                        >
                                            Remove Flag
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Tips */}
                    <Card className="p-6 bg-blue-50 border-2 border-blue-200">
                        <h3 className="text-lg font-bold text-blue-900 mb-3">
                            💡 Tips for Flagged Questions
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Review Regularly:</strong> Set aside time each week to review flagged questions
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Understand Why:</strong> Don't just memorize - understand the underlying concept
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Remove When Ready:</strong> Once you're confident, remove the flag to track progress
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>
                                    <strong>Add Notes:</strong> Use the notes feature to record memory tricks or key points
                                </span>
                            </li>
                        </ul>
                    </Card>
                </>
            ) : (
                <>
                    {/* No Flagged Questions */}
                    <Card className="p-12 text-center">
                        <div className="text-6xl mb-4">✨</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            No Flagged Questions
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You haven't flagged any questions yet. Flag questions you want to review later!
                        </p>
                        <Link href="/questions">
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                Start Practicing
                            </button>
                        </Link>
                    </Card>

                    {/* How to Flag */}
                    <Card className="p-6 mt-8 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                            How to Flag Questions
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p>
                                <strong>1. While Practicing:</strong> Look for the flag button (🚩) on any question page.
                            </p>
                            <p>
                                <strong>2. Click to Flag:</strong> Click the flag button and optionally add a reason (e.g., "Need to review drug interactions").
                            </p>
                            <p>
                                <strong>3. Return Here:</strong> All your flagged questions will appear on this page for easy review.
                            </p>
                            <p>
                                <strong>4. Remove When Done:</strong> Once you've mastered the concept, remove the flag to track your progress.
                            </p>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
