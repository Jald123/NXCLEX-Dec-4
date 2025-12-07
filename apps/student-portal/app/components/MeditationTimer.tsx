'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';

type MeditationDuration = 1 | 3 | 5;

export function MeditationTimer() {
    const [duration, setDuration] = useState<MeditationDuration>(3);
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [soundEnabled, setSoundEnabled] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setTimeLeft(duration * 60);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsActive(false);
                    playCompletionSound();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, duration]);

    const playCompletionSound = () => {
        if (!soundEnabled) return;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 528; // Healing frequency
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const startMeditation = () => {
        setIsActive(true);
        setTimeLeft(duration * 60);
    };

    const stopMeditation = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

    return (
        <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🧘 Meditation</h2>
                <p className="text-gray-600">Find calm and clarity with guided meditation</p>
            </div>

            {/* Duration Selector */}
            {!isActive && (
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose duration:</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 3, 5].map((dur) => (
                            <button
                                key={dur}
                                onClick={() => setDuration(dur as MeditationDuration)}
                                className={`p-4 rounded-lg border-2 transition-all ${duration === dur
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <div className="text-3xl font-bold text-gray-900">{dur}</div>
                                <div className="text-sm text-gray-600">minute{dur > 1 ? 's' : ''}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center mb-8 py-12">
                <div className="relative">
                    {/* Circular Progress */}
                    <svg className="transform -rotate-90" width="250" height="250">
                        <circle
                            cx="125"
                            cy="125"
                            r="110"
                            stroke="#E5E7EB"
                            strokeWidth="12"
                            fill="none"
                        />
                        <circle
                            cx="125"
                            cy="125"
                            r="110"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 110}`}
                            strokeDashoffset={`${2 * Math.PI * 110 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#9333EA" />
                                <stop offset="100%" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Time Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
                            {isActive && (
                                <div className="text-sm text-gray-600 mt-2">
                                    {Math.round(progress)}% complete
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Meditation Prompts */}
            {isActive && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-gray-700 italic">
                        {timeLeft > duration * 60 * 0.8 && "Focus on your breath. Let thoughts pass like clouds."}
                        {timeLeft <= duration * 60 * 0.8 && timeLeft > duration * 60 * 0.5 && "Notice the sensations in your body. Stay present."}
                        {timeLeft <= duration * 60 * 0.5 && timeLeft > duration * 60 * 0.2 && "If your mind wanders, gently return to your breath."}
                        {timeLeft <= duration * 60 * 0.2 && "You're doing great. Stay with the practice."}
                    </p>
                </div>
            )}

            {/* Benefits */}
            {!isActive && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2">Benefits of Meditation:</div>
                    <ul className="space-y-1">
                        <li className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-purple-600">✓</span>
                            Reduces stress and anxiety
                        </li>
                        <li className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-purple-600">✓</span>
                            Improves focus and concentration
                        </li>
                        <li className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-purple-600">✓</span>
                            Enhances emotional well-being
                        </li>
                        <li className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-purple-600">✓</span>
                            Promotes better sleep
                        </li>
                    </ul>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 justify-center">
                {!isActive ? (
                    <button
                        onClick={startMeditation}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Begin Meditation
                    </button>
                ) : (
                    <button
                        onClick={stopMeditation}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        End Session
                    </button>
                )}

                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${soundEnabled
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {soundEnabled ? '🔊 Bell On' : '🔇 Bell Off'}
                </button>
            </div>

            {/* Instructions */}
            {!isActive && (
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Find a quiet space, sit comfortably, and close your eyes.</p>
                    <p className="mt-1">Focus on your breath and let go of distracting thoughts.</p>
                </div>
            )}
        </Card>
    );
}
