import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase credentials not configured. Some features may not work.');
}

// Server-side client with service role key (has full access)
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Types for our database tables
export interface DbUser {
    id: string;
    email: string;
    password_hash: string;
    name: string | null;
    subscription_status: 'free_trial' | 'paid' | 'expired';
    subscription_plan: 'monthly' | 'annual' | null;
    subscription_end_date: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbProgress {
    id: string;
    user_id: string;
    question_id: string;
    attempted_at: string;
    selected_answer: string; // JSON stringified
    is_correct: boolean;
    time_spent: number;
    attempt_number: number;
}

export interface DbSession {
    id: string;
    user_id: string;
    mode: string;
    questions: string; // JSON stringified
    started_at: string;
    completed_at: string | null;
    status: 'in_progress' | 'completed' | 'abandoned';
    current_question_index: number;
    results: string | null; // JSON stringified
}

export interface DbFlag {
    id: string;
    user_id: string;
    question_id: string;
    created_at: string;
}

export interface DbNote {
    id: string;
    user_id: string;
    question_id: string;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface DbWellness {
    id: string;
    user_id: string;
    date: string;
    mood: number;
    energy: number;
    study_minutes: number;
    breaks_taken: number;
    notes: string | null;
}

// Database table names
export const TABLES = {
    USERS: 'users',
    PROGRESS: 'user_progress',
    SESSIONS: 'practice_sessions',
    FLAGS: 'question_flags',
    NOTES: 'question_notes',
    WELLNESS: 'wellness_logs',
} as const;
