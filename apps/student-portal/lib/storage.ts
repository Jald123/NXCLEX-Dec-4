import { supabaseAdmin } from './supabase';
import type { NclexItemDraft, TrapSetDraft, MnemonicDraft, UserRole } from '@nclex/shared-api-types';

export const getPublishedItems = async (userRole?: UserRole): Promise<NclexItemDraft[]> => {
    try {
        let query = supabaseAdmin.from('NclexItem').select('*');

        // Filter based on user role
        if (userRole === 'student_trial') {
            // Free trial users only see trial content
            query = query.eq('status', 'published_trial');
        } else {
            // Paid students and guests see both student and trial content
            // Using 'in' filter for multiple values
            query = query.in('status', ['published_student', 'published_trial']);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching items from Supabase:', error);
            return [];
        }

        return data as NclexItemDraft[];
    } catch (error) {
        console.error('Failed to items:', error);
        return [];
    }
};

export const getPublishedTrapSets = async (userRole?: UserRole): Promise<TrapSetDraft[]> => {
    try {
        let query = supabaseAdmin.from('TrapSet').select('*');

        if (userRole === 'student_trial') {
            query = query.eq('status', 'published_trial');
        } else {
            query = query.in('status', ['published_student', 'published_trial']);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching trap sets from Supabase:', error);
            return [];
        }

        return data as TrapSetDraft[];
    } catch (error) {
        console.error('Failed to read trap sets:', error);
        return [];
    }
};

export const getPublishedMnemonics = async (userRole?: UserRole): Promise<MnemonicDraft[]> => {
    try {
        let query = supabaseAdmin.from('Mnemonic').select('*');

        if (userRole === 'student_trial') {
            query = query.eq('status', 'published_trial');
        } else {
            query = query.in('status', ['published_student', 'published_trial']);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching mnemonics from Supabase:', error);
            return [];
        }

        return data as MnemonicDraft[];
    } catch (error) {
        console.error('Failed to read mnemonics:', error);
        return [];
    }
};

export const getPublishedItem = async (id: string, userRole?: UserRole): Promise<NclexItemDraft | undefined> => {
    try {
        // Direct fetch by ID is more efficient than getPublishedItems().find()
        let query = supabaseAdmin.from('NclexItem').select('*').eq('id', id).single();

        const { data, error } = await query;

        if (error || !data) {
            return undefined;
        }

        const item = data as NclexItemDraft;

        // Check permission
        if (userRole === 'student_trial' && item.status !== 'published_trial') {
            return undefined;
        }

        // Paid/Guest can access student or trial
        if (item.status !== 'published_student' && item.status !== 'published_trial') {
            return undefined;
        }

        return item;
    } catch (error) {
        console.error('Error fetching item:', error);
        return undefined;
    }
};
