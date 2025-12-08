import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { QuestionFlag } from '@nclex/shared-api-types';

// POST: Flag a question
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
        const { reason } = body; // Reason not currently supported by DB schema

        // Attempt insert. Unique constraint (user_id, question_id) will prevent duplicates.
        // We can ignore duplicates or return existing.

        // First check if exists to return nice message
        const { data: existing } = await supabaseAdmin
            .from('question_flags')
            .select('*')
            .eq('user_id', userId)
            .eq('question_id', params.questionId)
            .single();

        if (existing) {
            return NextResponse.json({
                message: 'Already flagged', flag: {
                    id: existing.id,
                    userId: existing.user_id,
                    questionId: existing.question_id,
                    flaggedAt: existing.created_at
                }
            });
        }

        const { data, error } = await supabaseAdmin
            .from('question_flags')
            .insert({
                user_id: userId,
                question_id: params.questionId,
                // created_at defaults to NOW()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error flagging question:', error);
            throw new Error(error.message);
        }

        const newFlag: QuestionFlag = {
            id: data.id,
            userId: data.user_id,
            questionId: data.question_id,
            flaggedAt: data.created_at,
            reason // Returning reason back to client even if not stored
        };

        return NextResponse.json({ flag: newFlag });
    } catch (error) {
        console.error('Error flagging question:', error);
        return NextResponse.json(
            { error: 'Failed to flag question' },
            { status: 500 }
        );
    }
}

// DELETE: Unflag a question
export async function DELETE(
    req: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const { error } = await supabaseAdmin
            .from('question_flags')
            .delete()
            .eq('user_id', userId)
            .eq('question_id', params.questionId);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ message: 'Flag removed' });
    } catch (error) {
        console.error('Error removing flag:', error);
        return NextResponse.json(
            { error: 'Failed to remove flag' },
            { status: 500 }
        );
    }
}
