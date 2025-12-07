'use client';

import { useState, useEffect } from 'react';
import { Card, Button, EHRHeader } from '@nclex/shared-ui';
import Link from 'next/link';
import type { NclexItemDraft } from '@nclex/shared-api-types';

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
    const [question, setQuestion] = useState<NclexItemDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [startTime] = useState(Date.now());

    const [nextQuestionId, setNextQuestionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current question
                const qResponse = await fetch(`/api/questions/${params.id}`);
                if (!qResponse.ok) throw new Error('Failed to fetch question');
                const qData = await qResponse.json();
                setQuestion(qData);

                // Fetch all questions to find next ID
                const allResponse = await fetch('/api/questions');
                if (allResponse.ok) {
                    const allData: NclexItemDraft[] = await allResponse.json();
                    const currentIndex = allData.findIndex(q => q.id === params.id);
                    if (currentIndex !== -1 && currentIndex < allData.length - 1) {
                        setNextQuestionId(allData[currentIndex + 1].id);
                    }
                }
            } catch (err) {
                setError('Failed to load question.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    const handleSubmit = async () => {
        if (selectedOptions.length === 0 || submitting) return;

        setSubmitting(true);
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        try {
            const response = await fetch('/api/progress/submit-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: question!.id,
                    selectedAnswer: question?.questionType === 'Select All That Apply'
                        ? selectedOptions
                        : selectedOptions[0],
                    timeSpent
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const isCorrect = (optionId: string) => {
        const option = question?.options.find(o => o.id === optionId);
        return option && !option.isTrap;
    };

    const getOptionStyle = (optionId: string) => {
        const isSelected = selectedOptions.includes(optionId);
        const option = question?.options.find(o => o.id === optionId);
        const isTrap = option?.isTrap;

        if (submitted) {
            if (isSelected && isTrap) return 'bg-red-100 border-red-500 text-red-900';
            if (isSelected && !isTrap) return 'bg-green-100 border-green-500 text-green-900';
            if (!isSelected && !isTrap) return 'bg-green-50 border-green-200 text-green-800';
            return 'bg-gray-50 border-gray-200 text-gray-500 opacity-50';
        }

        return isSelected
            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700';
    };

    if (loading) return <div className="p-8 text-center">Loading question...</div>;
    if (error || !question) return <div className="p-8 text-center text-red-600">{error || 'Question not found'}</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {question.ehrDetails && (
                <EHRHeader details={question.ehrDetails} />
            )}

            <div className="mb-6">
                <a href="/questions" className="text-blue-600 hover:underline flex items-center gap-2 mb-4">
                    ← Back to Questions
                </a>
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {question.questionType}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {question.category}
                    </span>
                    {question.examProfile && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {question.examProfile === 'nclex_2026' ? 'NCLEX 2026+' : 'NCLEX 2025'}
                        </span>
                    )}
                </div>
            </div>

            <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {question.stem}
                </h2>

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

                {/* Result Display */}
                {submitted && result && (
                    <div className={`mb-6 p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {result.isCorrect ? (
                                <>
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-semibold text-green-900">Correct!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="font-semibold text-red-900">Incorrect</span>
                                </>
                            )}
                            <span className="text-sm text-gray-600 ml-auto">Attempt #{result.attemptNumber}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                            {result.isCorrect
                                ? 'Great job! Your answer has been recorded.'
                                : `The correct answer is: ${Array.isArray(result.correctAnswer) ? result.correctAnswer.join(', ') : result.correctAnswer}`}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOptions.length === 0 || submitting}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                    ) : (
                        <>
                            <Link
                                href="/progress"
                                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                            >
                                View Progress
                            </Link>
                            {nextQuestionId && (
                                <Link
                                    href={`/questions/${nextQuestionId}`}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                                >
                                    Next Question →
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
