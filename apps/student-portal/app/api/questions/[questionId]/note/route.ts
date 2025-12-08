import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin, DbNote } from '@/lib/supabase';
import type { QuestionNote } from '@nclex/shared-api-types';

function mapDbNote(db: DbNote): QuestionNote {
    return {
        id: db.id,
        userId: db.user_id,
        questionId: db.question_id,
        note: db.note,
        createdAt: db.created_at,
        updatedAt: db.updated_at
    };
}

// GET: Get note for a question
export async function GET(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { data, error } = await supabaseAdmin
            .from('question_notes')
            .select('*')
            .eq('user_id', userId)
            .eq('question_id', params.questionId)
            .single();

        if (error || !data) {
            return NextResponse.json({ note: null });
        }

        return NextResponse.json({ note: mapDbNote(data as DbNote) });
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { error: 'Failed to fetch note' },
            { status: 500 }
        );
    }
}

// POST: Create or update note
export async function POST(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { note: noteText } = body;

        // Uses UPSERT logic based on UNIQUE(user_id, question_id) constraint
        const { data, error } = await supabaseAdmin
            .from('question_notes')
            .upsert({
                user_id: userId,
                question_id: params.questionId,
                note: noteText,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,question_id' })
            .select()
            .single();

        if (error) {
            console.error('Supabase error saving note:', error);
            throw new Error(error.message);
        }

        return NextResponse.json({ note: mapDbNote(data as DbNote) });
    } catch (error) {
        console.error('Error saving note:', error);
        return NextResponse.json(
            { error: 'Failed to save note' },
            { status: 500 }
        );
    }
}
