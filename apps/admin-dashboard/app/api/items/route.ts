import { NextRequest, NextResponse } from 'next/server';
import { getAllItems, createItem } from '@/lib/storage';
import type { NclexItemDraft } from '@nclex/shared-api-types';

export async function GET() {
    try {
        const items = await getAllItems();
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch items' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const item = await createItem(body as NclexItemDraft);
        return NextResponse.json(item);
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json(
            { error: 'Failed to create item' },
            { status: 500 }
        );
    }
}
