'use client';

import { useExamProfile } from '../context/ExamProfileContext';
import { EXAM_PROFILES } from '@nclex/shared-api-types';

export default function ExamProfileSelector() {
    const { currentProfile, setCurrentProfile } = useExamProfile();

    const currentConfig = EXAM_PROFILES.find(p => p.id === currentProfile);

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="exam-profile" className="text-sm font-medium text-gray-700">
                Exam Profile:
            </label>
            <select
                id="exam-profile"
                value={currentProfile}
                onChange={(e) => setCurrentProfile(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {EXAM_PROFILES.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                        {profile.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
