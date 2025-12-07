'use client';

import { useState } from 'react';
import { useExamProfile } from '../context/ExamProfileContext';
import { Card } from '@nclex/shared-ui';
import type {
    CaseStudyGenerationParams,
    AgeGroup,
    ClinicalDomain,
    ClinicalComplexity,
    NclexItemDraft,
    EXAM_PROFILES
} from '@nclex/shared-api-types';

interface CaseStudyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: NclexItemDraft[]) => void;
}

const AGE_GROUPS: AgeGroup[] = ['Adult', 'Pediatric', 'Maternal', 'Geriatric'];

const CLINICAL_DOMAINS: ClinicalDomain[] = [
    'Cardiac',
    'Respiratory',
    'Infection Control',
    'Pharmacology',
    'Mental Health',
    'Maternal-Newborn',
    'Pediatrics',
    'Critical Care'
];

const COMPLEXITY_LEVELS: ClinicalComplexity[] = ['Easy', 'Moderate', 'Complex'];

export default function CaseStudyModal({ isOpen, onClose, onImport }: CaseStudyModalProps) {
    const { currentProfile } = useExamProfile();
    const [ageGroup, setAgeGroup] = useState<AgeGroup>('Adult');
    const [clinicalDomain, setClinicalDomain] = useState<ClinicalDomain>('Cardiac');
    const [complexity, setComplexity] = useState<ClinicalComplexity>('Moderate');
    const [quantity, setQuantity] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedItems, setGeneratedItems] = useState<NclexItemDraft[] | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    if (!isOpen) return null;

    const params: CaseStudyGenerationParams = {
        examProfile: currentProfile,
        ageGroup,
        clinicalDomain,
        complexity
    };

    const getLLMPrompt = () => {
        return `Generate a full NCLEX Next Generation (NGN) clinical judgment case study set for the ${currentProfile === 'nclex_2025' ? 'NCLEX NGN 2025' : 'NCLEX 2026+'} exam profile.

The set must contain 6 linked items covering:
1. Initial Assessment
2. Focused Assessment
3. Analysis
4. Planning
5. Intervention
6. Evaluation

Parameters:
- Age Group: ${ageGroup}
- Primary Topic/Domain: ${clinicalDomain}
- Clinical Complexity: ${complexity}
- Exam Profile: ${currentProfile} (${currentProfile === 'nclex_2025' ? '2023-2026' : '2026+'} blueprint)

Requirements:
- Each item should use a different official NGN item type as of the active profile
- Include for each item:
  * Complete stem with clinical scenario
  * All answer options
  * Identification of correct answers
  * Identification of trap/distractor options with reasoning
  * Complete rationales for correct answers
  * Rationale for trap/distractor logic
- Return all 6 items in a single JSON array matching NclexItemDraft[] structure
- Content must be original and align with the selected profile blueprint
- Reference modern US clinical practice standards
- Embed auditReport fields as null (will be populated later)`;
    };

    const generateCaseStudy = async () => {
        setIsGenerating(true);

        try {
            const allItems: NclexItemDraft[] = [];

            // Generate N case studies
            for (let i = 0; i < quantity; i++) {
                const caseId = `case-${Date.now()}-${i}`;

                const response = await fetch('/api/generate-case-study', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        params,
                        examProfile: currentProfile
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to generate case study');
                }

                const data = await response.json();

                // Assign caseId to all 6 items in this set
                const itemsWithCaseId = data.items.map((item: NclexItemDraft) => ({
                    ...item,
                    caseId
                }));

                allItems.push(...itemsWithCaseId);
            }

            setGeneratedItems(allItems);
        } catch (error) {
            console.error('Error generating case studies:', error);
            alert('Failed to generate case studies. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImport = () => {
        if (generatedItems) {
            onImport(generatedItems);
            setGeneratedItems(null);
            onClose();
        }
    };

    const handleReset = () => {
        setGeneratedItems(null);
        setShowPrompt(false);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate NGN Case Study</h2>
                            <p className="text-sm text-gray-600">Create a 6-item clinical judgment case study</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {!generatedItems ? (
                        <>
                            {/* Parameter Selection Form */}
                            <Card title="Case Study Parameters" className="mb-6">
                                <div className="space-y-4">
                                    {/* Exam Profile (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Exam Profile
                                        </label>
                                        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                            <span className="text-sm font-semibold text-blue-900">
                                                {currentProfile === 'nclex_2025' ? 'NCLEX NGN 2025 Blueprint' : 'NCLEX 2026+ Blueprint'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Age Group */}
                                    <div>
                                        <label htmlFor="age-group" className="block text-sm font-medium text-gray-700 mb-2">
                                            Age Group
                                        </label>
                                        <select
                                            id="age-group"
                                            value={ageGroup}
                                            onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {AGE_GROUPS.map(group => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Clinical Domain */}
                                    <div>
                                        <label htmlFor="clinical-domain" className="block text-sm font-medium text-gray-700 mb-2">
                                            Primary Topic/Domain
                                        </label>
                                        <select
                                            id="clinical-domain"
                                            value={clinicalDomain}
                                            onChange={(e) => setClinicalDomain(e.target.value as ClinicalDomain)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {CLINICAL_DOMAINS.map(domain => (
                                                <option key={domain} value={domain}>{domain}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Complexity */}
                                    <div>
                                        <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-2">
                                            Clinical Complexity
                                        </label>
                                        <select
                                            id="complexity"
                                            value={complexity}
                                            onChange={(e) => setComplexity(e.target.value as ClinicalComplexity)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {COMPLEXITY_LEVELS.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity (1-50 case studies)
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
                                        <p className="mt-1 text-xs text-gray-500">
                                            Each case study contains 6 linked items. Total: {quantity * 6} items
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* LLM Prompt Preview */}
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowPrompt(!showPrompt)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                                >
                                    {showPrompt ? '▼' : '▶'} {showPrompt ? 'Hide' : 'Show'} LLM Prompt
                                </button>
                                {showPrompt && (
                                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                            {getLLMPrompt()}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Generate Button */}
                            <div className="flex gap-3">
                                <button
                                    onClick={generateCaseStudy}
                                    disabled={isGenerating}
                                    className={`flex-1 px-6 py-3 rounded-lg font-medium text-white ${isGenerating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin">⏳</span>
                                            Generating Case Study...
                                        </span>
                                    ) : (
                                        '✨ Generate Case Study'
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Generated Items Preview */}
                            <Card title="Generated Case Study (6 Items)" className="mb-6">
                                <div className="space-y-3">
                                    {generatedItems.map((item, idx) => (
                                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-700">#{idx + 1}</span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                                                        {item.questionType}
                                                    </span>
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 line-clamp-2">
                                                {item.stem}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {item.options.length} options • {item.options.filter(o => o.isTrap).length} traps
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Import Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleImport}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                >
                                    ✓ Add All 6 Items to Draft
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                                >
                                    Generate New
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
