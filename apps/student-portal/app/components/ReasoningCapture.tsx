'use client';

import { useState } from 'react';
import { Card } from '@nclex/shared-ui';

interface ReasoningCaptureProps {
    questionId: string;
    selectedAnswer: string | string[];
    onSubmit: (reasoning: string) => void;
}

const COMMON_REASONS = [
    'Based on ABC priority (Airway, Breathing, Circulation)',
    'Maslow\'s hierarchy - physiological needs first',
    'Nursing process - assessment before intervention',
    'Safety is the priority',
    'This is the most life-threatening option',
    'Therapeutic communication technique',
    'Medication knowledge',
    'Lab values interpretation',
    'Disease process understanding',
    'Patient teaching priority'
];

export function ReasoningCapture({ questionId, selectedAnswer, onSubmit }: ReasoningCaptureProps) {
    const [reasoningType, setReasoningType] = useState<'structured' | 'free_text'>('structured');
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [freeText, setFreeText] = useState('');

    const handleSubmit = () => {
        if (reasoningType === 'structured') {
            if (selectedReasons.length === 0) {
                alert('Please select at least one reason');
                return;
            }
            onSubmit(selectedReasons.join('; '));
        } else {
            if (freeText.trim().length < 10) {
                alert('Please explain your reasoning (at least 10 characters)');
                return;
            }
            onSubmit(freeText);
        }
    };

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter(r => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    return (
        <Card className="p-6 bg-blue-50 border-2 border-blue-300">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🤔 Before we reveal the answer...
                </h3>
                <p className="text-gray-700">
                    Explain your clinical reasoning. This helps you develop critical thinking skills!
                </p>
            </div>

            {/* Reasoning Type Toggle */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setReasoningType('structured')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${reasoningType === 'structured'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                >
                    Quick Select
                </button>
                <button
                    onClick={() => setReasoningType('free_text')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${reasoningType === 'free_text'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                >
                    Write My Own
                </button>
            </div>

            {/* Structured Reasoning */}
            {reasoningType === 'structured' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select the reasoning that applies (choose all that apply):
                    </label>
                    <div className="space-y-2">
                        {COMMON_REASONS.map((reason, index) => (
                            <label
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedReasons.includes(reason)
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedReasons.includes(reason)}
                                    onChange={() => toggleReason(reason)}
                                    className="mt-1"
                                />
                                <span className="text-sm text-gray-800">{reason}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Free Text Reasoning */}
            {reasoningType === 'free_text' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explain your reasoning:
                    </label>
                    <textarea
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        placeholder="I chose this answer because..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Minimum 10 characters. Be specific about your clinical reasoning.
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Submit & See Answer
            </button>

            {/* Why This Matters */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                    <strong>💡 Why this matters:</strong> NCLEX tests clinical judgment, not just knowledge.
                    Articulating your reasoning helps you think like a nurse and identify gaps in your thinking.
                </p>
            </div>
        </Card>
    );
}
