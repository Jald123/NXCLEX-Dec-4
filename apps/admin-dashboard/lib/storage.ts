import fs from 'fs/promises';
import path from 'path';
import type { NclexItemDraft, TrapSetDraft, MnemonicDraft } from '@nclex/shared-api-types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const TRAP_SETS_FILE = path.join(DATA_DIR, 'trap-sets.json');
const MNEMONICS_FILE = path.join(DATA_DIR, 'mnemonics.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Generic file operations
async function readFile<T>(filePath: string): Promise<T[]> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeFile<T>(filePath: string, data: T[]): Promise<void> {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// NCLEX Items
export async function getAllItems(): Promise<NclexItemDraft[]> {
    return readFile<NclexItemDraft>(ITEMS_FILE);
}

export async function getItemById(id: string): Promise<NclexItemDraft | null> {
    const items = await getAllItems();
    return items.find(item => item.id === id) || null;
}

export async function createItem(item: NclexItemDraft): Promise<NclexItemDraft> {
    const items = await getAllItems();
    items.push(item);
    await writeFile(ITEMS_FILE, items);
    return item;
}

export async function updateItem(id: string, updates: Partial<NclexItemDraft>): Promise<NclexItemDraft | null> {
    const items = await getAllItems();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return null;

    items[index] = { ...items[index], ...updates, lastUpdatedAt: new Date().toISOString() };
    await writeFile(ITEMS_FILE, items);
    return items[index];
}

export async function deleteItem(id: string): Promise<boolean> {
    const items = await getAllItems();
    const filtered = items.filter(item => item.id !== id);

    if (filtered.length === items.length) return false;

    await writeFile(ITEMS_FILE, filtered);
    return true;
}

// Trap Sets
export async function getAllTrapSets(): Promise<TrapSetDraft[]> {
    return readFile<TrapSetDraft>(TRAP_SETS_FILE);
}

export async function getTrapSetById(id: string): Promise<TrapSetDraft | null> {
    const trapSets = await getAllTrapSets();
    return trapSets.find(set => set.id === id) || null;
}

export async function createTrapSet(trapSet: TrapSetDraft): Promise<TrapSetDraft> {
    const trapSets = await getAllTrapSets();
    trapSets.push(trapSet);
    await writeFile(TRAP_SETS_FILE, trapSets);
    return trapSet;
}

export async function updateTrapSet(id: string, updates: Partial<TrapSetDraft>): Promise<TrapSetDraft | null> {
    const trapSets = await getAllTrapSets();
    const index = trapSets.findIndex(set => set.id === id);

    if (index === -1) return null;

    trapSets[index] = { ...trapSets[index], ...updates, lastUpdatedAt: new Date().toISOString() };
    await writeFile(TRAP_SETS_FILE, trapSets);
    return trapSets[index];
}

export async function deleteTrapSet(id: string): Promise<boolean> {
    const trapSets = await getAllTrapSets();
    const filtered = trapSets.filter(set => set.id !== id);

    if (filtered.length === trapSets.length) return false;

    await writeFile(TRAP_SETS_FILE, filtered);
    return true;
}

// Mnemonics
export async function getAllMnemonics(): Promise<MnemonicDraft[]> {
    return readFile<MnemonicDraft>(MNEMONICS_FILE);
}

export async function getMnemonicById(id: string): Promise<MnemonicDraft | null> {
    const mnemonics = await getAllMnemonics();
    return mnemonics.find(m => m.id === id) || null;
}

export async function createMnemonic(mnemonic: MnemonicDraft): Promise<MnemonicDraft> {
    const mnemonics = await getAllMnemonics();
    mnemonics.push(mnemonic);
    await writeFile(MNEMONICS_FILE, mnemonics);
    return mnemonic;
}

export async function updateMnemonic(id: string, updates: Partial<MnemonicDraft>): Promise<MnemonicDraft | null> {
    const mnemonics = await getAllMnemonics();
    const index = mnemonics.findIndex(m => m.id === id);

    if (index === -1) return null;

    mnemonics[index] = { ...mnemonics[index], ...updates, lastUpdatedAt: new Date().toISOString() };
    await writeFile(MNEMONICS_FILE, mnemonics);
    return mnemonics[index];
}

export async function deleteMnemonic(id: string): Promise<boolean> {
    const mnemonics = await getAllMnemonics();
    const filtered = mnemonics.filter(m => m.id !== id);

    if (filtered.length === mnemonics.length) return false;

    await writeFile(MNEMONICS_FILE, filtered);
    return true;
}
