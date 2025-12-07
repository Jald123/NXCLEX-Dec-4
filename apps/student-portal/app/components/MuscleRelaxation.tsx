'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';

type MuscleGroup = 'hands' | 'arms' | 'shoulders' | 'neck' | 'face' | 'chest' | 'stomach' | 'legs' | 'feet';

const MUSCLE_GROUPS: { id: MuscleGroup; name: string; instruction: string }[] = [
    { id: 'hands', name: 'Hands & Forearms', instruction: 'Make tight fists. Hold for 5 seconds, then release and feel the tension melt away.' },
    { id: 'arms', name: 'Upper Arms', instruction: 'Bend your arms and tense your biceps. Hold for 5 seconds, then let your arms drop and relax.' },
    { id: 'shoulders', name: 'Shoulders', instruction: 'Raise your shoulders up to your ears. Hold for 5 seconds, then let them drop completely.' },
    { id: 'neck', name: 'Neck', instruction: 'Gently tilt your head back and hold for 5 seconds. Then bring it forward and relax.' },
    { id: 'face', name: 'Face', instruction: 'Scrunch up your face, squeezing eyes and mouth tight. Hold for 5 seconds, then release.' },
    { id: 'chest', name: 'Chest', instruction: 'Take a deep breath and hold it while tensing your chest. Hold for 5 seconds, then exhale slowly.' },
    { id: 'stomach', name: 'Stomach', instruction: 'Tighten your stomach muscles as if bracing for a punch. Hold for 5 seconds, then release.' },
    { id: 'legs', name: 'Legs & Thighs', instruction: 'Straighten your legs and point your toes. Hold for 5 seconds, then relax completely.' },
    { id: 'feet', name: 'Feet', instruction: 'Curl your toes downward. Hold for 5 seconds, then release and wiggle your toes.' }
];

export function MuscleRelaxation() {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [phase, setPhase] = useState<'tense' | 'hold' | 'release' | 'rest'>('tense');
    const [timeLeft, setTimeLeft] = useState(0);

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
    }, [isActive, phase]);

    const advancePhase = () => {
        if (phase === 'tense') {
            setPhase('hold');
            setTimeLeft(5);
        } else if (phase === 'hold') {
            setPhase('release');
            setTimeLeft(3);
        } else if (phase === 'release') {
            setPhase('rest');
            setTimeLeft(5);
        } else if (phase === 'rest') {
            if (currentStep < MUSCLE_GROUPS.length - 1) {
                setCurrentStep(prev => prev + 1);
                setPhase('tense');
                setTimeLeft(3);
            } else {
                // Completed all muscle groups
                setIsActive(false);
                setCurrentStep(0);
                setPhase('tense');
            }
        }
    };

    const startRelaxation = () => {
        setIsActive(true);
        setCurrentStep(0);
        setPhase('tense');
        setTimeLeft(3);
    };

    const stopRelaxation = () => {
        setIsActive(false);
        setCurrentStep(0);
        setPhase('tense');
        setTimeLeft(0);
    };

    const getPhaseInstruction = () => {
        const group = MUSCLE_GROUPS[currentStep];
        switch (phase) {
            case 'tense':
                return `Get ready to tense your ${group.name.toLowerCase()}...`;
            case 'hold':
                return `Hold the tension! Keep it tight...`;
            case 'release':
                return `Release! Let all the tension go...`;
            case 'rest':
                return `Rest and notice the difference between tension and relaxation...`;
            default:
                return '';
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'tense': return 'from-orange-400 to-orange-600';
            case 'hold': return 'from-red-400 to-red-600';
            case 'release': return 'from-green-400 to-green-600';
            case 'rest': return 'from-blue-400 to-blue-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const progress = ((currentStep + 1) / MUSCLE_GROUPS.length) * 100;

    return (
        <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">💪 Progressive Muscle Relaxation</h2>
                <p className="text-gray-600">Release physical tension through systematic muscle relaxation</p>
            </div>

            {!isActive ? (
                <>
                    {/* Instructions */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">How It Works:</h3>
                        <ol className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">1.</span>
                                <span>We'll guide you through 9 muscle groups, from hands to feet</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">2.</span>
                                <span>For each group: tense (5s) → hold (5s) → release (3s) → rest (5s)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">3.</span>
                                <span>Notice the difference between tension and relaxation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">4.</span>
                                <span>Total time: approximately 10-12 minutes</span>
                            </li>
                        </ol>
                    </div>

                    {/* Muscle Groups Preview */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Muscle Groups We'll Cover:</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {MUSCLE_GROUPS.map((group, index) => (
                                <div key={group.id} className="text-center p-2 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-600">{index + 1}</div>
                                    <div className="text-sm font-medium text-gray-900">{group.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Benefits:</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                Reduces physical tension and stress
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                Improves body awareness
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                Promotes better sleep
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                Lowers blood pressure
                            </li>
                        </ul>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={startRelaxation}
                        className="w-full px-8 py-4 bg-orange-600 text-white rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors"
                    >
                        Begin Relaxation (10-12 min)
                    </button>
                </>
            ) : (
                <>
                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Muscle Group {currentStep + 1} of {MUSCLE_GROUPS.length}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Current Muscle Group */}
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {MUSCLE_GROUPS[currentStep].name}
                        </h3>
                        <p className="text-gray-700">
                            {MUSCLE_GROUPS[currentStep].instruction}
                        </p>
                    </div>

                    {/* Phase Indicator */}
                    <div className="mb-6">
                        <div
                            className={`rounded-lg p-8 bg-gradient-to-br ${getPhaseColor()} flex flex-col items-center justify-center transition-all duration-500`}
                        >
                            <div className="text-white text-center">
                                <div className="text-xl font-semibold mb-2 uppercase">{phase}</div>
                                <div className="text-6xl font-bold">{timeLeft}</div>
                                <div className="text-sm mt-2 opacity-90">{getPhaseInstruction()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <button
                        onClick={stopRelaxation}
                        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Stop Session
                    </button>
                </>
            )}

            {/* Tips */}
            {!isActive && (
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>💡 <strong>Tip:</strong> Find a quiet, comfortable place where you won't be disturbed.</p>
                    <p className="mt-1">Sit or lie down in a comfortable position.</p>
                </div>
            )}
        </Card>
    );
}
