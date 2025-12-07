import { NextResponse } from 'next/server';
import { getPublishedItems } from '@/lib/storage';

export async function GET() {
    try {
        const items = await getPublishedItems();
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
