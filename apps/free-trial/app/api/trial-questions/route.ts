import { NextResponse } from 'next/server';
import { getTrialItems } from '@/lib/storage';

export async function GET() {
    try {
        const items = await getTrialItems();
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch trial questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
