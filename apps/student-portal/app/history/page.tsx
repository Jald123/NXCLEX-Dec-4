'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import type { UserProgress } from '@nclex/shared-api-types';

export default function HistoryPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [history, setHistory] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/progress/history?filter=${filter}&limit=50`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data.history);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [session, router, filter]);

    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Answer History</h1>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="all">All Attempts</option>
                    <option value="correct">Correct Only</option>
                    <option value="incorrect">Incorrect Only</option>
                </select>
            </div>

            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map((item) => (
                        <Card key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-block w-3 h-3 rounded-full ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}></span>
                                        <span className="font-medium text-gray-900">
                                            {item.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Attempt #{item.attemptNumber}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span>Question ID: {item.questionId}</span>
                                        <span className="mx-2">•</span>
                                        <span>{new Date(item.attemptedAt).toLocaleString()}</span>
                                        <span className="mx-2">•</span>
                                        <span>Time: {item.timeSpent}s</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/questions/${item.questionId}`}
                                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                    Review
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <p className="text-gray-600">No history found.</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {filter !== 'all' ? 'Try changing the filter.' : 'Start practicing to build your history!'}
                    </p>
                </Card>
            )}
        </div>
    );
}
