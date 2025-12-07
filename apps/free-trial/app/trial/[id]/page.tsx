'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@nclex/shared-ui';
import Link from 'next/link';
import type { NclexItemDraft } from '@nclex/shared-api-types';

export default function TrialQuestionDetailPage({ params }: { params: { id: string } }) {
    const [question, setQuestion] = useState<NclexItemDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await fetch(`/api/trial-questions/${params.id}`);
                if (!response.ok) throw new Error('Failed to fetch question');
                const data = await response.json();
                setQuestion(data);
            } catch (err) {
                setError('Failed to load question.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [params.id]);

    const handleOptionClick = (optionId: string) => {
        if (submitted) return;

        if (question?.questionType === 'Select All That Apply') {
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            setSelectedOptions([optionId]);
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    const getOptionStyle = (optionId: string) => {
        const isSelected = selectedOptions.includes(optionId);

        if (submitted) {
            // In trial mode, we might not show full correctness feedback on options immediately
            // to encourage unlocking, OR we show it but blur the rationale.
            // Let's show correctness but blur rationale.
            const option = question?.options.find(o => o.id === optionId);
            const isTrap = option?.isTrap;

            if (isSelected && isTrap) return 'bg-red-100 border-red-500 text-red-900';
            if (isSelected && !isTrap) return 'bg-green-100 border-green-500 text-green-900';
            if (!isSelected && !isTrap) return 'bg-green-50 border-green-200 text-green-800';
            return 'bg-gray-50 border-gray-200 text-gray-500 opacity-50';
        }

        return isSelected
            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error || !question) return <div className="p-8 text-center text-red-600">{error || 'Question not found'}</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/trial" className="text-blue-600 hover:underline flex items-center gap-2 mb-4">
                    ← Back to Trial List
                </Link>
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {question.questionType}
                    </span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                        Free Trial
                    </span>
                </div>
                <h1 className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
                    {question.stem}
                </h1>
            </div>

            <div className="space-y-3 mb-8">
                {question.options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${getOptionStyle(option.id)}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedOptions.includes(option.id) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-400'
                                }`}>
                                {selectedOptions.includes(option.id) && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span>{option.text}</span>
                        </div>
                    </div>
                ))}
            </div>

            {!submitted ? (
                <Button
                    onClick={handleSubmit}
                    disabled={selectedOptions.length === 0}
                    className="w-full md:w-auto"
                >
                    Submit Answer
                </Button>
            ) : (
                <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <h3 className="font-bold text-blue-900 mb-2">Rationale</h3>
                    <div className="filter blur-sm select-none">
                        <p className="text-blue-800 leading-relaxed">
                            {question.rationale.substring(0, 50)}...
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                        <p className="text-gray-900 font-bold mb-3">Unlock Detailed Rationale</p>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg">
                            Upgrade to Premium
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
