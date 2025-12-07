import { NextRequest, NextResponse } from 'next/server';
import { getItemById, updateItem, deleteItem } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const item = await getItemById(params.id);

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json(
            { error: 'Failed to fetch item' },
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
        const item = await updateItem(params.id, body);

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = await deleteItem(params.id);

        if (!success) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
