import { NextRequest, NextResponse } from 'next/server';
import { getPublishedItem } from '@/lib/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: { questionId: string } }
) {
    try {
        const item = await getPublishedItem(params.questionId);

        if (!item) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Failed to fetch question:', error);
        return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
    }
}
