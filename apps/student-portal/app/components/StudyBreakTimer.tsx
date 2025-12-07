'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';

type TimerMode = 'work' | 'break' | 'long_break';

export function StudyBreakTimer() {
    const [mode, setMode] = useState<TimerMode>('work');
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    const DURATIONS = {
        work: 25 * 60,
        break: 5 * 60,
        long_break: 15 * 60
    };

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimerComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive]);

    const handleTimerComplete = () => {
        setIsActive(false);

        if (mode === 'work') {
            const newSessionsCompleted = sessionsCompleted + 1;
            setSessionsCompleted(newSessionsCompleted);

            // Every 4 work sessions, take a long break
            if (newSessionsCompleted % 4 === 0) {
                setMode('long_break');
                setTimeLeft(DURATIONS.long_break);
            } else {
                setMode('break');
                setTimeLeft(DURATIONS.break);
            }

            // Play notification sound
            playNotification();
            alert('Great work! Time for a break! 🎉');
        } else {
            setMode('work');
            setTimeLeft(DURATIONS.work);
            playNotification();
            alert('Break over! Ready to study? 📚');
        }
    };

    const playNotification = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    };

    const startTimer = () => {
        setIsActive(true);
    };

    const pauseTimer = () => {
        setIsActive(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(DURATIONS[mode]);
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(DURATIONS[newMode]);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

    const getModeColor = () => {
        switch (mode) {
            case 'work': return 'from-red-400 to-red-600';
            case 'break': return 'from-green-400 to-green-600';
            case 'long_break': return 'from-blue-400 to-blue-600';
        }
    };

    const getModeIcon = () => {
        switch (mode) {
            case 'work': return '📚';
            case 'break': return '☕';
            case 'long_break': return '🌟';
        }
    };

    return (
        <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">⏰ Study Break Timer</h2>
                <p className="text-gray-600">Pomodoro technique for productive study sessions</p>
            </div>

            {/* Mode Selector */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => switchMode('work')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${mode === 'work'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    📚 Study (25 min)
                </button>
                <button
                    onClick={() => switchMode('break')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${mode === 'break'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    ☕ Break (5 min)
                </button>
                <button
                    onClick={() => switchMode('long_break')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${mode === 'long_break'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    🌟 Long Break (15 min)
                </button>
            </div>

            {/* Timer Display */}
            <div className="mb-6">
                <div
                    className={`rounded-lg p-12 bg-gradient-to-br ${getModeColor()} flex flex-col items-center justify-center`}
                >
                    <div className="text-white text-center">
                        <div className="text-6xl mb-4">{getModeIcon()}</div>
                        <div className="text-8xl font-bold mb-4">{formatTime(timeLeft)}</div>
                        <div className="text-xl font-semibold uppercase">
                            {mode === 'work' ? 'Study Time' : mode === 'break' ? 'Short Break' : 'Long Break'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-1000 ${mode === 'work' ? 'bg-red-600' : mode === 'break' ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Sessions Completed */}
            <div className="mb-6 text-center">
                <div className="text-sm text-gray-600 mb-2">Sessions Completed Today</div>
                <div className="flex justify-center gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${i < sessionsCompleted % 4
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    Total: {sessionsCompleted} sessions
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center mb-6">
                {!isActive ? (
                    <button
                        onClick={startTimer}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Start
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                    >
                        Pause
                    </button>
                )}
                <button
                    onClick={resetTimer}
                    className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Pomodoro Info */}
            <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🍅 Pomodoro Technique:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">1.</span>
                        <span>Study for 25 minutes (one "Pomodoro")</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">2.</span>
                        <span>Take a 5-minute break</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">3.</span>
                        <span>After 4 Pomodoros, take a longer 15-minute break</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">4.</span>
                        <span>Repeat! This prevents burnout and maintains focus</span>
                    </li>
                </ul>
            </div>

            {/* Break Suggestions */}
            {mode !== 'work' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Break Ideas:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>• Stretch your body</div>
                        <div>• Get water/snack</div>
                        <div>• Walk around</div>
                        <div>• Do breathing exercise</div>
                        <div>• Look away from screen</div>
                        <div>• Quick meditation</div>
                    </div>
                </div>
            )}
        </Card>
    );
}
