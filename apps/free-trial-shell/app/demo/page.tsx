'use client';

import { Card } from '@nclex/shared-ui';
import type { NclexItemDraft } from '@nclex/shared-api-types';

// Dummy data - simulating questions from the Generator Engine
// In production, this would come from API/database
const DUMMY_QUESTIONS: NclexItemDraft[] = [
    {
        id: 'item-2001',
        entryMode: 'ai_generated',
        status: 'published_trial',
        questionType: 'Multiple Choice',
        stem: 'A nurse is assessing a client with suspected dehydration. Which finding would support this diagnosis?',
        options: [
            { id: '1', text: 'Decreased skin turgor', isTrap: false },
            { id: '2', text: 'Bradycardia', isTrap: true },
            { id: '3', text: 'Increased urinary output', isTrap: true },
            { id: '4', text: 'Moist mucous membranes', isTrap: true },
        ],
        rationale: 'Decreased skin turgor is a classic sign of dehydration. The other options are inconsistent with dehydration.',
        createdBy: 'Admin User',
        createdAt: '2025-12-01T10:00:00Z',
        lastUpdatedAt: '2025-12-01T14:00:00Z',
    },
    {
        id: 'item-2002',
        entryMode: 'ai_generated',
        status: 'published_trial',
        questionType: 'Multiple Choice',
        stem: 'Which action should the nurse take first when a client experiences a seizure?',
        options: [
            { id: '1', text: 'Restrain the client to prevent injury', isTrap: true },
            { id: '2', text: 'Turn the client to the side', isTrap: false },
            { id: '3', text: 'Insert a padded tongue blade', isTrap: true },
            { id: '4', text: 'Administer oxygen immediately', isTrap: true },
        ],
        rationale: 'Turning the client to the side helps maintain airway patency and prevents aspiration.',
        createdBy: 'Admin User',
        createdAt: '2025-12-01T11:00:00Z',
        lastUpdatedAt: '2025-12-01T15:00:00Z',
    },
    {
        id: 'item-2003',
        entryMode: 'manual_entered',
        status: 'published_trial',
        questionType: 'Select All That Apply',
        stem: 'A nurse is caring for a client with pneumonia. Which interventions are appropriate? Select all that apply.',
        options: [
            { id: '1', text: 'Encourage fluid intake', isTrap: false },
            { id: '2', text: 'Administer antibiotics as prescribed', isTrap: false },
            { id: '3', text: 'Maintain bed rest at all times', isTrap: true },
            { id: '4', text: 'Monitor oxygen saturation', isTrap: false },
        ],
        rationale: 'Fluids, antibiotics, and oxygen monitoring are appropriate. Complete bed rest is not necessary.',
        createdBy: 'Admin User',
        createdAt: '2025-12-01T12:00:00Z',
        lastUpdatedAt: '2025-12-01T16:00:00Z',
    },
    {
        id: 'item-2004',
        entryMode: 'ai_generated',
        status: 'published_student',
        questionType: 'Multiple Choice',
        stem: 'This question is published only to students, not free trial.',
        options: [
            { id: '1', text: 'Option A', isTrap: false },
            { id: '2', text: 'Option B', isTrap: false },
        ],
        rationale: 'This should not appear in the free trial list.',
        createdBy: 'Admin User',
        createdAt: '2025-12-02T09:00:00Z',
        lastUpdatedAt: '2025-12-02T09:00:00Z',
    },
    {
        id: 'item-2005',
        entryMode: 'ai_generated',
        status: 'approved',
        questionType: 'Multiple Choice',
        stem: 'This question is approved but not published anywhere yet.',
        options: [
            { id: '1', text: 'Option A', isTrap: false },
            { id: '2', text: 'Option B', isTrap: false },
        ],
        rationale: 'This should not appear in any public list.',
        createdBy: 'Admin User',
        createdAt: '2025-12-02T10:00:00Z',
        lastUpdatedAt: '2025-12-02T10:00:00Z',
    },
];

export default function DemoPage() {
    // Filter only questions published to free trial (limited subset)
    const trialQuestions = DUMMY_QUESTIONS.filter(q => q.status === 'published_trial').slice(0, 3);

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Questions</h1>
                <p className="text-gray-600">Try sample NCLEX NGN questions to experience our platform</p>
            </div>

            {/* Trial Limitation Banner */}
            <div className="mb-6 bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                        <p className="text-sm font-semibold text-purple-900 mb-1">Free Trial Limitations</p>
                        <p className="text-sm text-purple-800">
                            Free trial shows a limited subset of published questions. Upgrade to access the full question bank with 1000+ NCLEX NGN questions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>NOTE:</strong> This list will later come from the real database/API. Currently showing {trialQuestions.length} trial questions.
                </p>
            </div>

            {/* Question List */}
            <div className="space-y-4 mb-6">
                {trialQuestions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Demo Question {index + 1} of {trialQuestions.length}</span>
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                                        {question.questionType}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                                        From Generator Engine
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full font-medium">
                                        Free Trial
                                    </span>
                                </div>
                                <p className="text-gray-800 mb-3">{question.stem}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{question.options.length} options</span>
                                    <span>•</span>
                                    <span>ID: {question.id}</span>
                                </div>
                            </div>
                            <button className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                                Try Question
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {trialQuestions.length === 0 && (
                <Card>
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trial Questions Available</h3>
                        <p className="text-gray-600 mb-6">
                            No questions have been published to the free trial yet.
                        </p>
                    </div>
                </Card>
            )}

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Want Access to All Questions?</h3>
                    <p className="mb-4 opacity-90 text-lg">
                        Upgrade to unlock 1000+ NCLEX NGN questions, detailed explanations, and progress tracking
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="#"
                            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium text-lg"
                        >
                            View Pricing Plans
                        </a>
                        <a
                            href="http://localhost:3001"
                            className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 font-medium text-lg transition-colors"
                        >
                            Student Login
                        </a>
                    </div>
                    <p className="text-sm mt-4 opacity-75">
                        Join thousands of nursing students preparing for NCLEX success
                    </p>
                </div>
            </Card>

            {/* Feature Comparison */}
            {trialQuestions.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Free Trial vs Full Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Free Trial (Current)">
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600">✓</span>
                                    <span>{trialQuestions.length} sample questions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600">✓</span>
                                    <span>Basic explanations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600">✗</span>
                                    <span className="text-gray-500">Progress tracking</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600">✗</span>
                                    <span className="text-gray-500">Performance analytics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600">✗</span>
                                    <span className="text-gray-500">Full question bank</span>
                                </li>
                            </ul>
                        </Card>

                        <Card title="Full Student Access" className="border-2 border-purple-600">
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="font-medium">1000+ NCLEX NGN questions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="font-medium">Detailed explanations & rationales</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="font-medium">Full progress tracking</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="font-medium">Performance analytics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span className="font-medium">Unlimited practice sessions</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
