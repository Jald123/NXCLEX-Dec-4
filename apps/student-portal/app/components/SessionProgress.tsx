'use client';

import { useEffect, useState } from 'react';
import type { PracticeSession } from '@nclex/shared-api-types';

interface SessionProgressProps {
    sessionId: string;
}

export function SessionProgress({ sessionId }: SessionProgressProps) {
    const [session, setSession] = useState<PracticeSession | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0, answered: 0, remaining: 0 });

    useEffect(() => {
        if (!sessionId) return;

        const fetchProgress = async () => {
            try {
                const response = await fetch(`/api/practice/sessions/${sessionId}`);
                if (response.ok) {
                    const data = await response.json();
                    setSession(data.session);
                    setProgress(data.progress);
                }
            } catch (error) {
                console.error('Error fetching session progress:', error);
            }
        };

        fetchProgress();
    }, [sessionId]);

    if (!session) return null;

    const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                        Practice Session: Question {progress.current} of {progress.total}
                    </div>
                    <div className="text-sm text-gray-600">
                        {session.mode === 'recommended' && '🎯 Recommended Practice'}
                        {session.mode === 'timed' && '⏱️ Timed Mode'}
                        {session.mode === 'custom' && '📝 Custom Practice'}
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {session.results && (
                    <div className="flex gap-4 text-xs text-gray-600">
                        <span>Correct: <span className="font-semibold text-green-600">{session.results.correct}</span></span>
                        <span>Incorrect: <span className="font-semibold text-red-600">{session.results.incorrect}</span></span>
                        <span>Accuracy: <span className="font-semibold">{session.results.accuracy}%</span></span>
                    </div>
                )}
            </div>
        </div>
    );
}
