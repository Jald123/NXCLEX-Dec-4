'use client';

import { Card } from '@nclex/shared-ui';
import type { QuestionExplanation } from '@nclex/shared-api-types';

interface ExplanationPanelProps {
    explanation: QuestionExplanation;
    selectedAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
}

export function ExplanationPanel({ explanation, selectedAnswer, correctAnswer, isCorrect }: ExplanationPanelProps) {
    const selectedIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
    const correctIds = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    return (
        <div className="space-y-6 mt-6">
            {/* Result Banner */}
            <Card className={`p-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="text-4xl">
                        {isCorrect ? '✅' : '❌'}
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                        </div>
                        <div className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect
                                ? 'Great job! Review the explanation to reinforce your understanding.'
                                : 'Don\'t worry - learning from mistakes is how we improve!'}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Correct Answer Rationale */}
            <Card className="p-6 bg-green-50 border-2 border-green-200">
                <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">💡</div>
                    <div>
                        <h3 className="text-lg font-bold text-green-900 mb-2">Why This Answer is Correct</h3>
                        <p className="text-gray-800 leading-relaxed">{explanation.correctAnswerRationale}</p>
                    </div>
                </div>

                {explanation.clinicalPearl && (
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-600 font-semibold">💎 Clinical Pearl:</span>
                            <span className="text-gray-700 italic">{explanation.clinicalPearl}</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Distractor Rationales */}
            {explanation.distractorRationales.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 Why Other Options are Incorrect</h3>
                    <div className="space-y-3">
                        {explanation.distractorRationales.map((distractor, index) => (
                            <div
                                key={distractor.optionId}
                                className={`p-4 rounded-lg border-2 ${selectedIds.includes(distractor.optionId)
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="font-semibold text-gray-700">
                                        Option {String.fromCharCode(65 + index)}:
                                    </span>
                                    <span className="text-gray-800">{distractor.rationale}</span>
                                </div>
                                {selectedIds.includes(distractor.optionId) && (
                                    <div className="mt-2 text-sm text-red-700 font-medium">
                                        ← You selected this option
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Key Concepts */}
            {explanation.keyConcepts.length > 0 && (
                <Card className="p-6 bg-blue-50 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">📚 Key Nursing Concepts</h3>
                    <ul className="space-y-2">
                        {explanation.keyConcepts.map((concept, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-800">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{concept}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* NCLEX Context */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 NCLEX Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {explanation.nursingProcess && (
                        <div>
                            <div className="font-semibold text-gray-700 mb-1">Nursing Process:</div>
                            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full inline-block capitalize">
                                {explanation.nursingProcess}
                            </div>
                        </div>
                    )}
                    {explanation.clientNeed && (
                        <div>
                            <div className="font-semibold text-gray-700 mb-1">Client Need:</div>
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full inline-block">
                                {explanation.clientNeed}
                            </div>
                        </div>
                    )}
                    {explanation.difficulty && (
                        <div>
                            <div className="font-semibold text-gray-700 mb-1">Difficulty:</div>
                            <div className={`px-3 py-1 rounded-full inline-block ${explanation.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    explanation.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {explanation.difficulty.charAt(0).toUpperCase() + explanation.difficulty.slice(1)}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* References */}
            {explanation.references.length > 0 && (
                <Card className="p-6 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">📖 References</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                        {explanation.references.map((ref, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-500">{index + 1}.</span>
                                <span>{ref}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
}
