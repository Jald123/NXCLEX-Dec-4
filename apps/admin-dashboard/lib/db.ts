import { prisma } from './prisma';
import type { NclexItemDraft, TrapSetDraft, MnemonicDraft } from '@nclex/shared-api-types';

// Helper to safely parse JSON fields from database records
function safeJsonParse(value: string | null | undefined): unknown {
    if (!value) return undefined;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

// Helper to stringify values for database storage
function toJsonString(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
}

// NCLEX Items
export async function getAllItems(): Promise<NclexItemDraft[]> {
    const items = await prisma.nclexItem.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return items.map(item => ({
        id: item.id,
        entryMode: item.entryMode as NclexItemDraft['entryMode'],
        status: item.status as NclexItemDraft['status'],
        questionType: item.questionType,
        stem: item.stem,
        options: safeJsonParse(item.options) as NclexItemDraft['options'],
        rationale: item.rationale,
        createdBy: item.createdBy,
        createdAt: item.createdAt.toISOString(),
        lastUpdatedAt: item.lastUpdatedAt.toISOString(),
        presentationStyle: item.presentationStyle as NclexItemDraft['presentationStyle'],
        caseId: item.caseId ?? undefined,
        auditReport: safeJsonParse(item.auditReport) as NclexItemDraft['auditReport'],
    }));
}

export async function getItemById(id: string): Promise<NclexItemDraft | null> {
    const item = await prisma.nclexItem.findUnique({ where: { id } });
    if (!item) return null;
    return {
        id: item.id,
        entryMode: item.entryMode as NclexItemDraft['entryMode'],
        status: item.status as NclexItemDraft['status'],
        questionType: item.questionType,
        stem: item.stem,
        options: safeJsonParse(item.options) as NclexItemDraft['options'],
        rationale: item.rationale,
        createdBy: item.createdBy,
        createdAt: item.createdAt.toISOString(),
        lastUpdatedAt: item.lastUpdatedAt.toISOString(),
        presentationStyle: item.presentationStyle as NclexItemDraft['presentationStyle'],
        caseId: item.caseId ?? undefined,
        auditReport: safeJsonParse(item.auditReport) as NclexItemDraft['auditReport'],
    };
}

export async function createItem(item: NclexItemDraft): Promise<NclexItemDraft> {
    const created = await prisma.nclexItem.create({
        data: {
            id: item.id,
            entryMode: item.entryMode,
            status: item.status,
            questionType: item.questionType,
            stem: item.stem,
            options: toJsonString(item.options) ?? '[]',
            rationale: item.rationale,
            createdBy: item.createdBy,
            presentationStyle: item.presentationStyle,
            caseId: item.caseId,
            auditReport: toJsonString(item.auditReport),
        }
    });
    return {
        id: created.id,
        entryMode: created.entryMode as NclexItemDraft['entryMode'],
        status: created.status as NclexItemDraft['status'],
        questionType: created.questionType,
        stem: created.stem,
        options: safeJsonParse(created.options) as NclexItemDraft['options'],
        rationale: created.rationale,
        createdBy: created.createdBy,
        createdAt: created.createdAt.toISOString(),
        lastUpdatedAt: created.lastUpdatedAt.toISOString(),
        presentationStyle: created.presentationStyle as NclexItemDraft['presentationStyle'],
        caseId: created.caseId ?? undefined,
        auditReport: safeJsonParse(created.auditReport) as NclexItemDraft['auditReport'],
    };
}

export async function updateItem(id: string, updates: Partial<NclexItemDraft>): Promise<NclexItemDraft | null> {
    try {
        const updated = await prisma.nclexItem.update({
            where: { id },
            data: {
                ...(updates.entryMode !== undefined && { entryMode: updates.entryMode }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.questionType !== undefined && { questionType: updates.questionType }),
                ...(updates.stem !== undefined && { stem: updates.stem }),
                ...(updates.options !== undefined && { options: toJsonString(updates.options) }),
                ...(updates.rationale !== undefined && { rationale: updates.rationale }),
                ...(updates.presentationStyle !== undefined && { presentationStyle: updates.presentationStyle }),
                ...(updates.caseId !== undefined && { caseId: updates.caseId }),
                ...(updates.auditReport !== undefined && { auditReport: toJsonString(updates.auditReport) }),
            }
        });
        return {
            id: updated.id,
            entryMode: updated.entryMode as NclexItemDraft['entryMode'],
            status: updated.status as NclexItemDraft['status'],
            questionType: updated.questionType,
            stem: updated.stem,
            options: safeJsonParse(updated.options) as NclexItemDraft['options'],
            rationale: updated.rationale,
            createdBy: updated.createdBy,
            createdAt: updated.createdAt.toISOString(),
            lastUpdatedAt: updated.lastUpdatedAt.toISOString(),
            presentationStyle: updated.presentationStyle as NclexItemDraft['presentationStyle'],
            caseId: updated.caseId ?? undefined,
            auditReport: safeJsonParse(updated.auditReport) as NclexItemDraft['auditReport'],
        };
    } catch {
        return null;
    }
}

export async function deleteItem(id: string): Promise<boolean> {
    try {
        await prisma.nclexItem.delete({ where: { id } });
        return true;
    } catch {
        return false;
    }
}

// Trap Sets
export async function getAllTrapSets(): Promise<TrapSetDraft[]> {
    const trapSets = await prisma.trapSet.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return trapSets.map(set => ({
        id: set.id,
        itemId: set.itemId,
        entryMode: set.entryMode as TrapSetDraft['entryMode'],
        status: set.status as TrapSetDraft['status'],
        stemSnippet: set.stemSnippet,
        options: safeJsonParse(set.options) as TrapSetDraft['options'],
        trapOptionsIds: safeJsonParse(set.trapOptionsIds) as TrapSetDraft['trapOptionsIds'],
        createdBy: set.createdBy,
        createdAt: set.createdAt.toISOString(),
        lastUpdatedAt: set.lastUpdatedAt.toISOString(),
        auditReport: safeJsonParse(set.auditReport) as TrapSetDraft['auditReport'],
    }));
}

export async function getTrapSetById(id: string): Promise<TrapSetDraft | null> {
    const set = await prisma.trapSet.findUnique({ where: { id } });
    if (!set) return null;
    return {
        id: set.id,
        itemId: set.itemId,
        entryMode: set.entryMode as TrapSetDraft['entryMode'],
        status: set.status as TrapSetDraft['status'],
        stemSnippet: set.stemSnippet,
        options: safeJsonParse(set.options) as TrapSetDraft['options'],
        trapOptionsIds: safeJsonParse(set.trapOptionsIds) as TrapSetDraft['trapOptionsIds'],
        createdBy: set.createdBy,
        createdAt: set.createdAt.toISOString(),
        lastUpdatedAt: set.lastUpdatedAt.toISOString(),
        auditReport: safeJsonParse(set.auditReport) as TrapSetDraft['auditReport'],
    };
}

export async function createTrapSet(trapSet: TrapSetDraft): Promise<TrapSetDraft> {
    const created = await prisma.trapSet.create({
        data: {
            id: trapSet.id,
            itemId: trapSet.itemId,
            entryMode: trapSet.entryMode,
            status: trapSet.status,
            stemSnippet: trapSet.stemSnippet,
            options: toJsonString(trapSet.options) ?? '[]',
            trapOptionsIds: toJsonString(trapSet.trapOptionsIds) ?? '[]',
            createdBy: trapSet.createdBy,
            auditReport: toJsonString(trapSet.auditReport),
        }
    });
    return {
        id: created.id,
        itemId: created.itemId,
        entryMode: created.entryMode as TrapSetDraft['entryMode'],
        status: created.status as TrapSetDraft['status'],
        stemSnippet: created.stemSnippet,
        options: safeJsonParse(created.options) as TrapSetDraft['options'],
        trapOptionsIds: safeJsonParse(created.trapOptionsIds) as TrapSetDraft['trapOptionsIds'],
        createdBy: created.createdBy,
        createdAt: created.createdAt.toISOString(),
        lastUpdatedAt: created.lastUpdatedAt.toISOString(),
        auditReport: safeJsonParse(created.auditReport) as TrapSetDraft['auditReport'],
    };
}

export async function updateTrapSet(id: string, updates: Partial<TrapSetDraft>): Promise<TrapSetDraft | null> {
    try {
        const updated = await prisma.trapSet.update({
            where: { id },
            data: {
                ...(updates.itemId !== undefined && { itemId: updates.itemId }),
                ...(updates.entryMode !== undefined && { entryMode: updates.entryMode }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.stemSnippet !== undefined && { stemSnippet: updates.stemSnippet }),
                ...(updates.options !== undefined && { options: toJsonString(updates.options) }),
                ...(updates.trapOptionsIds !== undefined && { trapOptionsIds: toJsonString(updates.trapOptionsIds) }),
                ...(updates.auditReport !== undefined && { auditReport: toJsonString(updates.auditReport) }),
            }
        });
        return {
            id: updated.id,
            itemId: updated.itemId,
            entryMode: updated.entryMode as TrapSetDraft['entryMode'],
            status: updated.status as TrapSetDraft['status'],
            stemSnippet: updated.stemSnippet,
            options: safeJsonParse(updated.options) as TrapSetDraft['options'],
            trapOptionsIds: safeJsonParse(updated.trapOptionsIds) as TrapSetDraft['trapOptionsIds'],
            createdBy: updated.createdBy,
            createdAt: updated.createdAt.toISOString(),
            lastUpdatedAt: updated.lastUpdatedAt.toISOString(),
            auditReport: safeJsonParse(updated.auditReport) as TrapSetDraft['auditReport'],
        };
    } catch {
        return null;
    }
}

export async function deleteTrapSet(id: string): Promise<boolean> {
    try {
        await prisma.trapSet.delete({ where: { id } });
        return true;
    } catch {
        return false;
    }
}

// Mnemonics
export async function getAllMnemonics(): Promise<MnemonicDraft[]> {
    const mnemonics = await prisma.mnemonic.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return mnemonics.map(m => ({
        id: m.id,
        concept: m.concept,
        entryMode: m.entryMode as MnemonicDraft['entryMode'],
        status: m.status as MnemonicDraft['status'],
        mnemonicText: m.mnemonicText,
        explanation: m.explanation,
        createdBy: m.createdBy,
        createdAt: m.createdAt.toISOString(),
        lastUpdatedAt: m.lastUpdatedAt.toISOString(),
        auditReport: safeJsonParse(m.auditReport) as MnemonicDraft['auditReport'],
    }));
}

export async function getMnemonicById(id: string): Promise<MnemonicDraft | null> {
    const mnemonic = await prisma.mnemonic.findUnique({ where: { id } });
    if (!mnemonic) return null;
    return {
        id: mnemonic.id,
        concept: mnemonic.concept,
        entryMode: mnemonic.entryMode as MnemonicDraft['entryMode'],
        status: mnemonic.status as MnemonicDraft['status'],
        mnemonicText: mnemonic.mnemonicText,
        explanation: mnemonic.explanation,
        createdBy: mnemonic.createdBy,
        createdAt: mnemonic.createdAt.toISOString(),
        lastUpdatedAt: mnemonic.lastUpdatedAt.toISOString(),
        auditReport: safeJsonParse(mnemonic.auditReport) as MnemonicDraft['auditReport'],
    };
}

export async function createMnemonic(mnemonic: MnemonicDraft): Promise<MnemonicDraft> {
    const created = await prisma.mnemonic.create({
        data: {
            id: mnemonic.id,
            concept: mnemonic.concept,
            entryMode: mnemonic.entryMode,
            status: mnemonic.status,
            mnemonicText: mnemonic.mnemonicText,
            explanation: mnemonic.explanation,
            createdBy: mnemonic.createdBy,
            auditReport: toJsonString(mnemonic.auditReport),
        }
    });
    return {
        id: created.id,
        concept: created.concept,
        entryMode: created.entryMode as MnemonicDraft['entryMode'],
        status: created.status as MnemonicDraft['status'],
        mnemonicText: created.mnemonicText,
        explanation: created.explanation,
        createdBy: created.createdBy,
        createdAt: created.createdAt.toISOString(),
        lastUpdatedAt: created.lastUpdatedAt.toISOString(),
        auditReport: safeJsonParse(created.auditReport) as MnemonicDraft['auditReport'],
    };
}

export async function updateMnemonic(id: string, updates: Partial<MnemonicDraft>): Promise<MnemonicDraft | null> {
    try {
        const updated = await prisma.mnemonic.update({
            where: { id },
            data: {
                ...(updates.concept !== undefined && { concept: updates.concept }),
                ...(updates.entryMode !== undefined && { entryMode: updates.entryMode }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.mnemonicText !== undefined && { mnemonicText: updates.mnemonicText }),
                ...(updates.explanation !== undefined && { explanation: updates.explanation }),
                ...(updates.auditReport !== undefined && { auditReport: toJsonString(updates.auditReport) }),
            }
        });
        return {
            id: updated.id,
            concept: updated.concept,
            entryMode: updated.entryMode as MnemonicDraft['entryMode'],
            status: updated.status as MnemonicDraft['status'],
            mnemonicText: updated.mnemonicText,
            explanation: updated.explanation,
            createdBy: updated.createdBy,
            createdAt: updated.createdAt.toISOString(),
            lastUpdatedAt: updated.lastUpdatedAt.toISOString(),
            auditReport: safeJsonParse(updated.auditReport) as MnemonicDraft['auditReport'],
        };
    } catch {
        return null;
    }
}

export async function deleteMnemonic(id: string): Promise<boolean> {
    try {
        await prisma.mnemonic.delete({ where: { id } });
        return true;
    } catch {
        return false;
    }
}
