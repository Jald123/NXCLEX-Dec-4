import { NextRequest, NextResponse } from 'next/server';
import { getAllTrapSets, createTrapSet } from '@/lib/db';
import type { TrapSetDraft } from '@nclex/shared-api-types';

export async function GET() {
    try {
        const trapSets = await getAllTrapSets();
        return NextResponse.json({ trapSets });
    } catch (error) {
        console.error('Error fetching trap sets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trap sets' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const trapSet = await createTrapSet(body as TrapSetDraft);
        return NextResponse.json(trapSet);
    } catch (error) {
        console.error('Error creating trap set:', error);
        return NextResponse.json(
            { error: 'Failed to create trap set' },
            { status: 500 }
        );
    }
}
