'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import type { NclexItemDraft } from '@nclex/shared-api-types';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<NclexItemDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/questions');
                if (!response.ok) throw new Error('Failed to fetch questions');
                const data = await response.json();
                setQuestions(data);
            } catch (err) {
                setError('Failed to load questions. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 py-6 sm:px-0">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Questions</h1>
            <p className="text-gray-600 mb-6">Test your knowledge with NCLEX NGN style questions</p>

            {/* Question List */}
            <div className="space-y-4 mb-6">
                {questions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={`/questions/${question.id}`} className="block">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Question {index + 1}</span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                            {question.questionType}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                            {question.entryMode === 'ai_generated' ? '✨ AI' : '✍️ Manual'}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 mb-3">{question.stem}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{question.options.length} options</span>
                                        <span>•</span>
                                        <span>ID: {question.id}</span>
                                    </div>
                                </div>
                                <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                    Start Question
                                </button>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>

            {questions.length === 0 && (
                <Card>
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h3>
                        <p className="text-gray-600 mb-6">
                            No questions have been published to the student portal yet.
                        </p>
                        <p className="text-sm text-gray-500">
                            Questions must be approved and published by admins in the Generator Engine.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
