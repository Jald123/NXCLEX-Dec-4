'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@nclex/shared-ui';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';
type BreathingTechnique = '4-7-8' | 'box' | 'deep_belly';

interface BreathingPattern {
    name: string;
    description: string;
    phases: {
        inhale: number;
        hold: number;
        exhale: number;
        hold2?: number;
    };
    cycles: number;
    benefits: string[];
}

const BREATHING_PATTERNS: Record<BreathingTechnique, BreathingPattern> = {
    '4-7-8': {
        name: '4-7-8 Breathing',
        description: 'Inhale for 4, hold for 7, exhale for 8',
        phases: { inhale: 4, hold: 7, exhale: 8 },
        cycles: 8,
        benefits: ['Reduces anxiety', 'Improves sleep', 'Calms nervous system']
    },
    'box': {
        name: 'Box Breathing',
        description: 'Equal counts for all phases',
        phases: { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
        cycles: 10,
        benefits: ['Increases focus', 'Reduces stress', 'Improves performance']
    },
    'deep_belly': {
        name: 'Deep Belly Breathing',
        description: 'Slow, deep breaths from diaphragm',
        phases: { inhale: 5, hold: 2, exhale: 6 },
        cycles: 6,
        benefits: ['Lowers blood pressure', 'Reduces tension', 'Increases oxygen']
    }
};

export function BreathingExercise() {
    const [technique, setTechnique] = useState<BreathingTechnique>('4-7-8');
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
    const [currentCycle, setCurrentCycle] = useState(1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(false);

    const pattern = BREATHING_PATTERNS[technique];
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    advancePhase();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, currentPhase]);

    const advancePhase = () => {
        const phases: BreathingPhase[] = pattern.phases.hold2
            ? ['inhale', 'hold', 'exhale', 'hold2']
            : ['inhale', 'hold', 'exhale'];

        const currentIndex = phases.indexOf(currentPhase);
        const nextIndex = (currentIndex + 1) % phases.length;

        if (nextIndex === 0) {
            // Completed a cycle
            if (currentCycle >= pattern.cycles) {
                // Completed all cycles
                setIsActive(false);
                setCurrentCycle(1);
                setCurrentPhase('inhale');
                playSound('complete');
                return;
            }
            setCurrentCycle(prev => prev + 1);
        }

        const nextPhase = phases[nextIndex];
        setCurrentPhase(nextPhase);
        setTimeLeft(pattern.phases[nextPhase] || 0);
        playSound(nextPhase);
    };

    const playSound = (phase: string) => {
        if (!soundEnabled) return;
        // Simple beep using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = phase === 'complete' ? 880 : 440;
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    const startExercise = () => {
        setIsActive(true);
        setCurrentCycle(1);
        setCurrentPhase('inhale');
        setTimeLeft(pattern.phases.inhale);
        playSound('start');
    };

    const stopExercise = () => {
        setIsActive(false);
        setCurrentCycle(1);
        setCurrentPhase('inhale');
        setTimeLeft(0);
    };

    const getPhaseColor = () => {
        switch (currentPhase) {
            case 'inhale': return 'from-blue-400 to-blue-600';
            case 'hold': return 'from-purple-400 to-purple-600';
            case 'exhale': return 'from-green-400 to-green-600';
            case 'hold2': return 'from-yellow-400 to-yellow-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const getPhaseText = () => {
        switch (currentPhase) {
            case 'inhale': return 'Breathe In';
            case 'hold': return 'Hold';
            case 'exhale': return 'Breathe Out';
            case 'hold2': return 'Hold';
            default: return 'Ready';
        }
    };

    const circleSize = isActive ? (currentPhase === 'inhale' ? 200 : currentPhase === 'exhale' ? 100 : 150) : 150;

    return (
        <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🌬️ Breathing Exercise</h2>
                <p className="text-gray-600">Reduce stress and improve focus with guided breathing</p>
            </div>

            {/* Technique Selector */}
            {!isActive && (
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose a technique:</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(Object.keys(BREATHING_PATTERNS) as BreathingTechnique[]).map((tech) => (
                            <button
                                key={tech}
                                onClick={() => setTechnique(tech)}
                                className={`p-4 rounded-lg border-2 transition-all ${technique === tech
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-semibold text-gray-900 mb-1">
                                    {BREATHING_PATTERNS[tech].name}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {BREATHING_PATTERNS[tech].description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Animated Circle */}
            <div className="flex flex-col items-center justify-center mb-8 py-12">
                <div
                    className={`rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center transition-all duration-1000 ease-in-out shadow-2xl`}
                    style={{
                        width: `${circleSize}px`,
                        height: `${circleSize}px`,
                    }}
                >
                    <div className="text-center text-white">
                        <div className="text-2xl font-bold mb-2">{getPhaseText()}</div>
                        {isActive && <div className="text-5xl font-bold">{timeLeft}</div>}
                    </div>
                </div>
            </div>

            {/* Progress */}
            {isActive && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Cycle {currentCycle} of {pattern.cycles}</span>
                        <span>{Math.round((currentCycle / pattern.cycles) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentCycle / pattern.cycles) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Benefits */}
            {!isActive && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2">Benefits:</div>
                    <ul className="space-y-1">
                        {pattern.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                                <span className="text-blue-600">✓</span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 justify-center">
                {!isActive ? (
                    <button
                        onClick={startExercise}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Start Exercise
                    </button>
                ) : (
                    <>
                        <button
                            onClick={stopExercise}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Stop
                        </button>
                    </>
                )}

                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${soundEnabled
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
                </button>
            </div>

            {/* Instructions */}
            {!isActive && (
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Find a comfortable position, relax your shoulders, and follow the breathing guide.</p>
                    <p className="mt-1">The circle will expand and contract to guide your breath.</p>
                </div>
            )}
        </Card>
    );
}
