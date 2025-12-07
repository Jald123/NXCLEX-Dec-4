'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ExamProfile } from '@nclex/shared-api-types';

interface ExamProfileContextType {
    currentProfile: ExamProfile;
    setCurrentProfile: (profile: ExamProfile) => void;
}

const ExamProfileContext = createContext<ExamProfileContextType | undefined>(undefined);

export function ExamProfileProvider({ children }: { children: ReactNode }) {
    const [currentProfile, setCurrentProfile] = useState<ExamProfile>('nclex_2025');

    return (
        <ExamProfileContext.Provider value={{ currentProfile, setCurrentProfile }}>
            {children}
        </ExamProfileContext.Provider>
    );
}

export function useExamProfile() {
    const context = useContext(ExamProfileContext);
    if (context === undefined) {
        throw new Error('useExamProfile must be used within ExamProfileProvider');
    }
    return context;
}
