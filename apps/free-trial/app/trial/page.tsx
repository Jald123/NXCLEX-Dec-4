'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import type { NclexItemDraft } from '@nclex/shared-api-types';

export default function TrialQuestionsPage() {
    const [questions, setQuestions] = useState<NclexItemDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/trial-questions');
                if (!response.ok) throw new Error('Failed to fetch questions');
                const data = await response.json();
                setQuestions(data);
            } catch (err) {
                setError('Failed to load trial questions. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading trial content...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
            <div className="bg-blue-600 text-white p-4 rounded-lg mb-8 flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="font-bold text-lg">Free Trial Mode</h2>
                    <p className="text-blue-100 text-sm">You are viewing a limited selection of questions.</p>
                </div>
                <button className="px-4 py-2 bg-white text-blue-600 rounded font-bold hover:bg-blue-50 transition-colors">
                    Unlock Full Access
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trial Questions</h1>
            <p className="text-gray-600 mb-6">Sample our premium NGN content.</p>

            <div className="space-y-4 mb-6">
                {questions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                        <Link href={`/trial/${question.id}`} className="block">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Question {index + 1}</span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                            {question.questionType}
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
                                    Start
                                </button>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>

            {questions.length === 0 && (
                <Card>
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trial Content Available</h3>
                        <p className="text-gray-600">
                            Check back soon or upgrade to access the full library.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
