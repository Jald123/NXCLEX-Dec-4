'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@nclex/shared-ui';
import Link from 'next/link';
import type { NclexItemDraft } from '@nclex/shared-api-types';

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
    const [question, setQuestion] = useState<NclexItemDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);

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

    const handleSubmit = () => {
        setSubmitted(true);
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
            if (!isSelected && !isTrap) return 'bg-green-50 border-green-200 text-green-800'; // Show missed correct answer
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
            <div className="mb-6">
                <a href="/questions" className="text-blue-600 hover:underline flex items-center gap-2 mb-4">
                    ← Back to Questions
                </a>
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {question.questionType}
                    </span>
                    <span className="text-gray-500 text-sm">ID: {question.id}</span>
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
                <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-2">Rationale</h3>
                        <p className="text-blue-800 leading-relaxed">{question.rationale}</p>
                    </Card>

                    <div className="flex justify-end">
                        {nextQuestionId ? (
                            <Link href={`/questions/${nextQuestionId}`}>
                                <Button className="w-full md:w-auto">Next Question →</Button>
                            </Link>
                        ) : (
                            <Link href={`/results?score=${isCorrect(selectedOptions[0]) ? 1 : 0}&total=1`}>
                                <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                                    Finish Exam 🎉
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
