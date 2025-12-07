'use client';

import { useExamProfile } from '../context/ExamProfileContext';
import { EXAM_PROFILES } from '@nclex/shared-api-types';

export default function ProfileBanner() {
    const { currentProfile } = useExamProfile();
    const config = EXAM_PROFILES.find(p => p.id === currentProfile);

    if (!config) return null;

    const profileText = currentProfile === 'nclex_2025'
        ? 'Item type mix and difficulty tuned for current NGN blueprint (through March 31, 2026).'
        : 'Item type mix and difficulty will follow the 2026+ NCLEX test plan.';

    return (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                        Profile: {config.label}
                    </p>
                    <p className="text-sm text-blue-800 mb-2">
                        {config.description}
                    </p>
                    <p className="text-xs text-blue-700">
                        {profileText}
                    </p>
                </div>
            </div>
        </div>
    );
}
