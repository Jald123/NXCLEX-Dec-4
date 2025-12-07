'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@nclex/shared-ui';
import Link from 'next/link';
import { BreathingExercise } from '../components/BreathingExercise';
import { MeditationTimer } from '../components/MeditationTimer';
import { MuscleRelaxation } from '../components/MuscleRelaxation';
import { StudyBreakTimer } from '../components/StudyBreakTimer';

type ExerciseView = 'overview' | 'breathing' | 'meditation' | 'muscle' | 'breaks';

export default function WellnessPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [view, setView] = useState<ExerciseView>('overview');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        // Fetch wellness stats
        fetch('/api/wellness/stats')
            .then(res => res.ok ? res.json() : null)
            .then(data => setStats(data))
            .catch(console.error);
    }, [session, router]);

    if (view === 'breathing') {
        return (
            <div className="px-4 py-6 sm:px-0">
                <button
                    onClick={() => setView('overview')}
                    className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
                >
                    ← Back to Wellness Center
                </button>
                <BreathingExercise />
            </div>
        );
    }

    if (view === 'meditation') {
        return (
            <div className="px-4 py-6 sm:px-0">
                <button
                    onClick={() => setView('overview')}
                    className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
                >
                    ← Back to Wellness Center
                </button>
                <MeditationTimer />
            </div>
        );
    }

    if (view === 'muscle') {
        return (
            <div className="px-4 py-6 sm:px-0">
                <button
                    onClick={() => setView('overview')}
                    className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
                >
                    ← Back to Wellness Center
                </button>
                <MuscleRelaxation />
            </div>
        );
    }

    if (view === 'breaks') {
        return (
            <div className="px-4 py-6 sm:px-0">
                <button
                    onClick={() => setView('overview')}
                    className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
                >
                    ← Back to Wellness Center
                </button>
                <StudyBreakTimer />
            </div>
        );
    }

    return (
        <div className="px-4 py-6 sm:px-0 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">🧘 Wellness Center</h1>
                <p className="text-gray-600">Take care of your mental health while preparing for NCLEX</p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
                            <div className="text-4xl font-bold text-purple-600 flex items-center justify-center gap-2">
                                {stats.currentStreak > 0 && '🔥'} {stats.currentStreak}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">days</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
                            <div className="text-4xl font-bold text-gray-900">{stats.totalSessions}</div>
                            <div className="text-xs text-gray-500 mt-1">completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Total Time</div>
                            <div className="text-4xl font-bold text-gray-900">{stats.totalMinutes}</div>
                            <div className="text-xs text-gray-500 mt-1">minutes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Favorite</div>
                            <div className="text-2xl font-bold text-gray-900 capitalize">
                                {stats.favoriteExercise?.replace('_', ' ') || 'None yet'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">exercise</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Exercise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Breathing Exercise */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setView('breathing')}>
                    <div className="text-center">
                        <div className="text-6xl mb-4">🌬️</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Breathing Exercises</h3>
                        <p className="text-gray-600 mb-4">
                            Guided breathing techniques to reduce anxiety and improve focus
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                            3-5 minutes • 3 techniques available
                        </div>
                        <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Start Breathing →
                        </button>
                    </div>
                </Card>

                {/* Meditation */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setView('meditation')}>
                    <div className="text-center">
                        <div className="text-6xl mb-4">🧘</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Meditation</h3>
                        <p className="text-gray-600 mb-4">
                            Quick meditation sessions for mental clarity and stress relief
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                            1-5 minutes • Guided sessions
                        </div>
                        <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                            Begin Meditation →
                        </button>
                    </div>
                </Card>

                {/* Study Breaks */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setView('breaks')}>
                    <div className="text-center">
                        <div className="text-6xl mb-4">⏰</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Study Break Timer</h3>
                        <p className="text-gray-600 mb-4">
                            Pomodoro-style timer to maintain healthy study habits
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                            25 min study • 5 min break
                        </div>
                        <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                            Start Timer →
                        </button>
                    </div>
                </Card>

                {/* Progressive Muscle Relaxation */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setView('muscle')}>
                    <div className="text-center">
                        <div className="text-6xl mb-4">💪</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Muscle Relaxation</h3>
                        <p className="text-gray-600 mb-4">
                            Progressive muscle relaxation to release physical tension
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                            10-15 minutes • Full body
                        </div>
                        <button className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                            Start Relaxation →
                        </button>
                    </div>
                </Card>
            </div>

            {/* Why Wellness Matters */}
            <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💙 Why Wellness Matters for NCLEX Success</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                        <div className="font-semibold mb-2">Reduces Test Anxiety</div>
                        <p>Regular stress relief exercises help manage exam-related anxiety and improve performance under pressure.</p>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Improves Focus</div>
                        <p>Meditation and breathing exercises enhance concentration, helping you study more effectively.</p>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Prevents Burnout</div>
                        <p>Regular breaks and relaxation prevent study burnout, keeping you motivated throughout your prep.</p>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Better Retention</div>
                        <p>A calm, focused mind retains information better. Wellness practices support long-term learning.</p>
                    </div>
                </div>
            </Card>

            {/* Quick Tips */}
            <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Quick Wellness Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Take breaks every hour:</strong> Use the Pomodoro technique (25 min study, 5 min break)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Practice daily:</strong> Even 3 minutes of breathing or meditation makes a difference</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Listen to your body:</strong> If you're feeling overwhelmed, take a wellness break</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Build a routine:</strong> Consistent wellness practices are more effective than sporadic ones</span>
                    </li>
                </ul>
            </Card>
        </div>
    );
}
