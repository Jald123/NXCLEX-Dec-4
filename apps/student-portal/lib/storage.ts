import fs from 'fs';
import path from 'path';
import type { NclexItemDraft, TrapSetDraft, MnemonicDraft, UserRole } from '@nclex/shared-api-types';

// Path to Admin Dashboard data directory
// Relative to apps/student-portal/lib/storage.ts -> ../../admin-dashboard/data
const DATA_DIR = path.join(process.cwd(), '../admin-dashboard/data');

export const getPublishedItems = async (userRole?: UserRole): Promise<NclexItemDraft[]> => {
    try {
        const filePath = path.join(DATA_DIR, 'items.json');
        if (!fs.existsSync(filePath)) return [];

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const items = JSON.parse(fileContent) as NclexItemDraft[];

        // Filter based on user role
        if (userRole === 'student_trial') {
            // Free trial users only see trial content
            return items.filter(item => item.status === 'published_trial');
        }

        // Paid students and guests see both student and trial content
        return items.filter(item => item.status === 'published_student' || item.status === 'published_trial');
    } catch (error) {
        console.error('Failed to read items:', error);
        return [];
    }
};

export const getPublishedTrapSets = async (userRole?: UserRole): Promise<TrapSetDraft[]> => {
    try {
        const filePath = path.join(DATA_DIR, 'trap-sets.json');
        if (!fs.existsSync(filePath)) return [];

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const trapSets = JSON.parse(fileContent) as TrapSetDraft[];

        // Filter based on user role
        if (userRole === 'student_trial') {
            return trapSets.filter(ts => ts.status === 'published_trial');
        }

        return trapSets.filter(ts => ts.status === 'published_student' || ts.status === 'published_trial');
    } catch (error) {
        console.error('Failed to read trap sets:', error);
        return [];
    }
};

export const getPublishedMnemonics = async (userRole?: UserRole): Promise<MnemonicDraft[]> => {
    try {
        const filePath = path.join(DATA_DIR, 'mnemonics.json');
        if (!fs.existsSync(filePath)) return [];

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const mnemonics = JSON.parse(fileContent) as MnemonicDraft[];

        // Filter based on user role
        if (userRole === 'student_trial') {
            return mnemonics.filter(m => m.status === 'published_trial');
        }

        return mnemonics.filter(m => m.status === 'published_student' || m.status === 'published_trial');
    } catch (error) {
        console.error('Failed to read mnemonics:', error);
        return [];
    }
};

export const getPublishedItem = async (id: string, userRole?: UserRole): Promise<NclexItemDraft | undefined> => {
    const items = await getPublishedItems(userRole);
    return items.find(item => item.id === id);
};
