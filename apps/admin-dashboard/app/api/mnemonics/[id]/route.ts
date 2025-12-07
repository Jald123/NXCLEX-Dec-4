import { NextRequest, NextResponse } from 'next/server';
import { getMnemonicById, updateMnemonic, deleteMnemonic } from '@/lib/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const mnemonic = await getMnemonicById(params.id);

        if (!mnemonic) {
            return NextResponse.json(
                { error: 'Mnemonic not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(mnemonic);
    } catch (error) {
        console.error('Error fetching mnemonic:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mnemonic' },
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
        const mnemonic = await updateMnemonic(params.id, body);

        if (!mnemonic) {
            return NextResponse.json(
                { error: 'Mnemonic not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(mnemonic);
    } catch (error) {
        console.error('Error updating mnemonic:', error);
        return NextResponse.json(
            { error: 'Failed to update mnemonic' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = await deleteMnemonic(params.id);

        if (!success) {
            return NextResponse.json(
                { error: 'Mnemonic not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting mnemonic:', error);
        return NextResponse.json(
            { error: 'Failed to delete mnemonic' },
            { status: 500 }
        );
    }
}
