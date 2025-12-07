'use client';

import { useState } from 'react';
import { useExamProfile } from '../context/ExamProfileContext';
import { Card, Button } from '@nclex/shared-ui';
import type { NclexItemDraft } from '@nclex/shared-api-types';

interface AIGeneratedItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (items: NclexItemDraft[]) => void;
}

export default function AIGeneratedItemModal({ isOpen, onClose, onGenerate }: AIGeneratedItemModalProps) {
    // Try to get profile context, fallback to default if not available
    let currentProfile = 'nclex_2025';
    try {
        const profileContext = useExamProfile();
        currentProfile = profileContext.currentProfile;
    } catch (error) {
        console.warn('ExamProfileContext not available, using default profile');
    }

    const [generationMode, setGenerationMode] = useState<'single' | 'ehr'>('single');
    const [quantity, setQuantity] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Call real AI generation API
            const response = await fetch('/api/generate-single-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: `${currentProfile} NCLEX question`,
                    questionType: 'Multiple Choice',
                    count: quantity,
                    type: 'item'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || error.error || 'Generation failed');
            }

            const data = await response.json();
            const items = data.items || [];

            if (items.length === 0) {
                throw new Error('No items were generated');
            }

            // Update presentation style based on mode
            const updatedItems = items.map((item: NclexItemDraft) => ({
                ...item,
                presentationStyle: generationMode === 'ehr' ? 'ehr_case' : 'standard'
            }));

            onGenerate(updatedItems);
            onClose();

            // Reset form
            setGenerationMode('single');
            setQuantity(1);
            setError(null);
        } catch (error) {
            console.error('Failed to generate items:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            alert(`Generation failed: ${errorMessage}\n\nPlease check:\n1. Server is running\n2. Gemini API key is configured\n3. Check browser console for details`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate AI Items</h2>
                            <p className="text-sm text-gray-600">Create AI-generated NCLEX NGN items</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Exam Profile Display */}
                    <Card title="Exam Profile" className="mb-6">
                        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="text-sm font-semibold text-blue-900">
                                {currentProfile === 'nclex_2025' ? 'NCLEX NGN 2025 Blueprint' : 'NCLEX 2026+ Blueprint'}
                            </span>
                        </div>
                    </Card>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                <strong>Error:</strong> {error}
                            </p>
                        </div>
                    )}

                    {/* Generation Mode */}
                    <Card title="Generation Mode" className="mb-6">
                        <div className="space-y-3">
                            <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="generationMode"
                                    value="single"
                                    checked={generationMode === 'single'}
                                    onChange={() => setGenerationMode('single')}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Single Item</div>
                                    <div className="text-sm text-gray-600">Generate standard NCLEX NGN items</div>
                                </div>
                            </label>

                            <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="generationMode"
                                    value="ehr"
                                    checked={generationMode === 'ehr'}
                                    onChange={() => setGenerationMode('ehr')}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">EHR Case Mix</div>
                                    <div className="text-sm text-gray-600">
                                        Generate items in an EHR-style patient chart format (e.g., demographics, allergies, diagnoses, orders)
                                    </div>
                                </div>
                            </label>
                        </div>
                    </Card>

                    {/* Quantity Selector */}
                    <Card title="Quantity" className="mb-6">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Number of items to generate (1-50)
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max="50"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`flex-1 px-6 py-3 rounded-lg font-medium text-white ${isGenerating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Generating...
                                </span>
                            ) : (
                                `✨ Generate ${quantity} Item${quantity > 1 ? 's' : ''}`
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
