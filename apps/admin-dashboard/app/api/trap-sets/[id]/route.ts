import { NextRequest, NextResponse } from 'next/server';
import { getTrapSetById, updateTrapSet, deleteTrapSet } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const trapSet = await getTrapSetById(params.id);

        if (!trapSet) {
            return NextResponse.json(
                { error: 'Trap set not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(trapSet);
    } catch (error) {
        console.error('Error fetching trap set:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trap set' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const trapSet = await updateTrapSet(params.id, body);

        if (!trapSet) {
            return NextResponse.json(
                { error: 'Trap set not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(trapSet);
    } catch (error) {
        console.error('Error updating trap set:', error);
        return NextResponse.json(
            { error: 'Failed to update trap set' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = await deleteTrapSet(params.id);

        if (!success) {
            return NextResponse.json(
                { error: 'Trap set not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting trap set:', error);
        return NextResponse.json(
            { error: 'Failed to delete trap set' },
            { status: 500 }
        );
    }
}
