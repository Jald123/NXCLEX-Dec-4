import { NextRequest, NextResponse } from 'next/server';
import { updateItem, updateTrapSet, updateMnemonic } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { id, type, status } = await request.json();

        if (!id || !type || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: id, type, status' },
                { status: 400 }
            );
        }

        let updatedContent;

        switch (type) {
            case 'item':
                updatedContent = await updateItem(id, { status });
                break;
            case 'trap-set':
                updatedContent = await updateTrapSet(id, { status });
                break;
            case 'mnemonic':
                updatedContent = await updateMnemonic(id, { status });
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid content type' },
                    { status: 400 }
                );
        }

        if (!updatedContent) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedContent);
    } catch (error) {
        console.error('Publishing error:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}
