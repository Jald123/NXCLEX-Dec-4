import { NextRequest, NextResponse } from 'next/server';
import { getTrialItem } from '@/lib/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const item = await getTrialItem(params.id);

        if (!item) {
            return NextResponse.json({ error: 'Question not found or not available in trial' }, { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Failed to fetch trial question:', error);
        return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
    }
}
