import fs from 'fs';
import path from 'path';
import type { NclexItemDraft, TrapSetDraft, MnemonicDraft } from '@nclex/shared-api-types';

// Path to Admin Dashboard data directory
// Relative to apps/free-trial/lib/storage.ts -> ../../admin-dashboard/data
const DATA_DIR = path.join(process.cwd(), '../admin-dashboard/data');

export const getTrialItems = async (): Promise<NclexItemDraft[]> => {
    try {
        const filePath = path.join(DATA_DIR, 'items.json');
        if (!fs.existsSync(filePath)) return [];

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const items = JSON.parse(fileContent) as NclexItemDraft[];

        // STRICT FILTER: Only items published for trial
        return items.filter(item => item.status === 'published_trial');
    } catch (error) {
        console.error('Failed to read items:', error);
        return [];
    }
};

export const getTrialItem = async (id: string): Promise<NclexItemDraft | undefined> => {
    const items = await getTrialItems();
    return items.find(item => item.id === id);
};
